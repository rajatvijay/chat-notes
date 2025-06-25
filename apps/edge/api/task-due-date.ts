import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

interface TaskDueDateRequest {
  note_id: string
  due_date: string
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const body: TaskDueDateRequest = await request.json()
    
    if (!body.note_id || !body.due_date) {
      return new Response('Missing note_id or due_date', { status: 400 })
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Update the note's metadata with due date
    const { data: currentNote, error: fetchError } = await supabase
      .from('notes')
      .select('metadata')
      .eq('id', body.note_id)
      .single()

    if (fetchError) {
      throw fetchError
    }

    const updatedMetadata = {
      ...currentNote.metadata,
      due_date: body.due_date
    }

    const { error } = await supabase
      .from('notes')
      .update({ metadata: updatedMetadata })
      .eq('id', body.note_id)

    if (error) {
      throw error
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Task due date error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}