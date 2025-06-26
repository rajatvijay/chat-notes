import { metadataSchemas } from './shared/schemas.js'
import { callOpenAI, enhanceReadingContent, buildCategoryPrompt } from './shared/openai-utils.js'
import { updateNoteMetadata, getSupabaseClient } from './shared/supabase-utils.js'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

interface ExtractMetadataRequest {
  action: 'extract'
  note_id: string
  content: string
  category: string
}

interface UpdateMetadataRequest {
  action: 'update'
  note_id: string
  metadata: Record<string, unknown>
}

interface UpdateMeetingRequest {
  action: 'update_meeting'
  note_ids: string[]
  title: string
  date: string
  time: string
}

interface TaskCompletionRequest {
  action: 'task_completion'
  note_id: string
  completed: boolean
}

interface TaskDueDateRequest {
  action: 'task_due_date'
  note_id: string
  due_date: string
}

type MetadataRequest = ExtractMetadataRequest | UpdateMetadataRequest | UpdateMeetingRequest | TaskCompletionRequest | TaskDueDateRequest

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const body: MetadataRequest = await request.json()
    
    if (!body.action) {
      return new Response('Missing action', { status: 400 })
    }

    if (body.action === 'extract') {
      const extractBody = body as ExtractMetadataRequest
      
      if (!extractBody.note_id || !extractBody.content || !extractBody.category) {
        return new Response('Missing note_id, content, or category', { status: 400 })
      }

      // Skip metadata extraction for journal and misc
      if (extractBody.category === 'journal' || extractBody.category === 'misc') {
        return new Response(JSON.stringify({ metadata: {} }), {
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const schema = metadataSchemas[extractBody.category as keyof typeof metadataSchemas]
      if (!schema) {
        return new Response('Invalid category', { status: 400 })
      }

      // Build category-specific prompt
      const systemPrompt = `Extract metadata for a ${extractBody.category} note. ${buildCategoryPrompt(extractBody.category)}`

      // Call OpenAI for metadata extraction
      const openaiData = await callOpenAI([
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: extractBody.content
        }
      ], schema, 200, 'extract-metadata')

      let metadata: Record<string, unknown> = {}
      
      try {
        metadata = JSON.parse(openaiData.choices[0].message.content) as Record<string, unknown>
      } catch (e) {
        console.warn('Failed to parse metadata:', e)
      }

      // For reading content with links, enhance with title and summary
      if (extractBody.category === 'reading' && typeof metadata.link === 'string') {
        console.log('Reading content with link:', metadata.link)
        const enhancedResult = await enhanceReadingContent(extractBody.content, metadata.link)
        if (enhancedResult) {
          metadata.title = enhancedResult.title
          metadata.summary = enhancedResult.summary
        }
      }

      // Update note in Supabase
      await updateNoteMetadata(extractBody.note_id, { metadata })

      return new Response(JSON.stringify({ metadata }), {
        headers: { 'Content-Type': 'application/json' }
      })

    } else if (body.action === 'update') {
      const updateBody = body as UpdateMetadataRequest
      
      if (!updateBody.note_id) {
        return new Response('Missing note_id', { status: 400 })
      }

      if (!updateBody.metadata || typeof updateBody.metadata !== 'object') {
        return new Response('Missing or invalid metadata', { status: 400 })
      }

      const supabase = getSupabaseClient()

      // Update the note's metadata
      const { error } = await supabase
        .from('notes')
        .update({ metadata: updateBody.metadata })
        .eq('id', updateBody.note_id)

      if (error) {
        console.error('Database update error:', error)
        throw new Error('Database update error')
      }

      return new Response(JSON.stringify({ 
        success: true
      }), {
        headers: { 'Content-Type': 'application/json' }
      })

    } else if (body.action === 'update_meeting') {
      const meetingBody = body as UpdateMeetingRequest
      
      if (!meetingBody.note_ids || !Array.isArray(meetingBody.note_ids) || meetingBody.note_ids.length === 0) {
        return new Response('Missing or invalid note_ids array', { status: 400 })
      }

      if (!meetingBody.title || !meetingBody.date || !meetingBody.time) {
        return new Response('Missing title, date, or time', { status: 400 })
      }

      const supabase = getSupabaseClient()
      let updatedCount = 0

      // Update each note's metadata
      for (const noteId of meetingBody.note_ids) {
        // Get current metadata
        const { data: currentNote, error: fetchError } = await supabase
          .from('notes')
          .select('metadata')
          .eq('id', noteId)
          .single()

        if (fetchError) {
          console.error('Error fetching note:', fetchError)
          continue
        }

        const updatedMetadata = {
          ...currentNote.metadata,
          title: meetingBody.title,
          date: meetingBody.date,
          time: meetingBody.time
        }

        const { error: updateError } = await supabase
          .from('notes')
          .update({ metadata: updatedMetadata })
          .eq('id', noteId)

        if (updateError) {
          console.error('Error updating note:', updateError)
          continue
        }

        updatedCount++
      }

      return new Response(JSON.stringify({ 
        success: true,
        updated_count: updatedCount
      }), {
        headers: { 'Content-Type': 'application/json' }
      })

    } else if (body.action === 'task_completion') {
      const completionBody = body as TaskCompletionRequest
      
      if (!completionBody.note_id) {
        return new Response('Missing note_id', { status: 400 })
      }

      const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
      
      if (completionBody.completed) {
        // Mark task as completed
        const { error } = await supabase
          .from('task_completions')
          .insert({ note_id: completionBody.note_id })

        if (error && error.code !== '23505') { // Ignore unique constraint violations
          throw error
        }
      } else {
        // Mark task as incomplete
        const { error } = await supabase
          .from('task_completions')
          .delete()
          .eq('note_id', completionBody.note_id)

        if (error) {
          throw error
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      })

    } else if (body.action === 'task_due_date') {
      const dueDateBody = body as TaskDueDateRequest
      
      if (!dueDateBody.note_id || !dueDateBody.due_date) {
        return new Response('Missing note_id or due_date', { status: 400 })
      }

      const supabase = getSupabaseClient()

      // Update the note's metadata with due date
      const { data: currentNote, error: fetchError } = await supabase
        .from('notes')
        .select('metadata')
        .eq('id', dueDateBody.note_id)
        .single()

      if (fetchError) {
        throw fetchError
      }

      const updatedMetadata = {
        ...currentNote.metadata,
        due_date: dueDateBody.due_date
      }

      const { error } = await supabase
        .from('notes')
        .update({ metadata: updatedMetadata })
        .eq('id', dueDateBody.note_id)

      if (error) {
        throw error
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      })

    } else {
      return new Response('Invalid action', { status: 400 })
    }

  } catch (error) {
    console.error('Metadata operation error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}