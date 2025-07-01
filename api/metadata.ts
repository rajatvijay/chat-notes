import { VercelRequest, VercelResponse } from '@vercel/node'
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

interface SoftDeleteRequest {
  action: 'soft_delete'
  note_id: string
}

type MetadataRequest = ExtractMetadataRequest | UpdateMetadataRequest | UpdateMeetingRequest | TaskCompletionRequest | TaskDueDateRequest | SoftDeleteRequest

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body: MetadataRequest = req.body
    
    if (!body.action) {
      return res.status(400).json({ error: 'Missing action' })
    }

    if (body.action === 'extract') {
      const extractBody = body as ExtractMetadataRequest
      
      if (!extractBody.note_id || !extractBody.content || !extractBody.category) {
        return res.status(400).json({ error: 'Missing note_id, content, or category' })
      }

      // Skip metadata extraction for journal and misc
      if (extractBody.category === 'journal' || extractBody.category === 'misc') {
        return res.status(200).json({ metadata: {} })
      }

      const schema = metadataSchemas[extractBody.category as keyof typeof metadataSchemas]
      if (!schema) {
        return res.status(400).json({ error: 'Invalid category' })
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

      return res.status(200).json({ metadata })

    } else if (body.action === 'update') {
      const updateBody = body as UpdateMetadataRequest
      
      if (!updateBody.note_id) {
        return res.status(400).json({ error: 'Missing note_id' })
      }

      if (!updateBody.metadata || typeof updateBody.metadata !== 'object') {
        return res.status(400).json({ error: 'Missing or invalid metadata' })
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

      return res.status(200).json({ 
        success: true
      })

    } else if (body.action === 'update_meeting') {
      const meetingBody = body as UpdateMeetingRequest
      
      if (!meetingBody.note_ids || !Array.isArray(meetingBody.note_ids) || meetingBody.note_ids.length === 0) {
        return res.status(400).json({ error: 'Missing or invalid note_ids array' })
      }

      if (!meetingBody.title || !meetingBody.date || !meetingBody.time) {
        return res.status(400).json({ error: 'Missing title, date, or time' })
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
          .is('deleted_at', null)
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

      return res.status(200).json({ 
        success: true,
        updated_count: updatedCount
      })

    } else if (body.action === 'task_completion') {
      const completionBody = body as TaskCompletionRequest
      
      if (!completionBody.note_id) {
        return res.status(400).json({ error: 'Missing note_id' })
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

      return res.status(200).json({ success: true })

    } else if (body.action === 'task_due_date') {
      const dueDateBody = body as TaskDueDateRequest
      
      if (!dueDateBody.note_id || !dueDateBody.due_date) {
        return res.status(400).json({ error: 'Missing note_id or due_date' })
      }

      const supabase = getSupabaseClient()

      // Update the note's metadata with due date
      const { data: currentNote, error: fetchError } = await supabase
        .from('notes')
        .select('metadata')
        .eq('id', dueDateBody.note_id)
        .is('deleted_at', null)
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

      return res.status(200).json({ success: true })

    } else if (body.action === 'soft_delete') {
      const deleteBody = body as SoftDeleteRequest
      
      if (!deleteBody.note_id) {
        return res.status(400).json({ error: 'Missing note_id' })
      }

      const supabase = getSupabaseClient()

      // Soft delete the note by setting deleted_at timestamp
      const { error } = await supabase
        .from('notes')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', deleteBody.note_id)
        .is('deleted_at', null) // Only delete if not already deleted

      if (error) {
        console.error('Soft delete error:', error)
        throw new Error('Soft delete error')
      }

      return res.status(200).json({ success: true })

    } else {
      return res.status(400).json({ error: 'Invalid action' })
    }

  } catch (error) {
    console.error('Metadata operation error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}