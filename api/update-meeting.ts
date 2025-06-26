import { getSupabaseClient } from './shared/supabase-utils'

interface UpdateMeetingRequest {
  note_ids: string[]
  title: string
  date: string
  time: string
}

// Schema removed as it's not used in this endpoint


export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const body: UpdateMeetingRequest = await request.json()
    
    if (!body.note_ids || !Array.isArray(body.note_ids) || body.note_ids.length === 0) {
      return new Response('Missing or invalid note_ids array', { status: 400 })
    }

    if (!body.title || !body.date || !body.time) {
      return new Response('Missing title, date, or time', { status: 400 })
    }

    const supabase = getSupabaseClient()

    let updatedCount = 0

    // Update each note's metadata
    for (const noteId of body.note_ids) {
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
        title: body.title,
        date: body.date,
        time: body.time
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

  } catch (error) {
    console.error('Update meeting error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}