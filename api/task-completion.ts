import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

interface TaskCompletionRequest {
  note_id: string
  completed: boolean
}

export const config = {
  runtime: 'edge',
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const body: TaskCompletionRequest = await request.json()
    
    if (!body.note_id) {
      return new Response('Missing note_id', { status: 400 })
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    if (body.completed) {
      // Mark task as completed
      const { error } = await supabase
        .from('task_completions')
        .insert({ note_id: body.note_id })

      if (error && error.code !== '23505') { // Ignore unique constraint violations
        throw error
      }
    } else {
      // Mark task as incomplete
      const { error } = await supabase
        .from('task_completions')
        .delete()
        .eq('note_id', body.note_id)

      if (error) {
        throw error
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Task completion error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}