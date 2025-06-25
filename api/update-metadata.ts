import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

interface UpdateMetadataRequest {
  note_id: string
  metadata: Record<string, unknown>
}

export const config = {
  runtime: 'edge',
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const body: UpdateMetadataRequest = await request.json()
    
    if (!body.note_id) {
      return new Response('Missing note_id', { status: 400 })
    }

    if (!body.metadata || typeof body.metadata !== 'object') {
      return new Response('Missing or invalid metadata', { status: 400 })
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Update the note's metadata
    const { error } = await supabase
      .from('notes')
      .update({ metadata: body.metadata })
      .eq('id', body.note_id)

    if (error) {
      console.error('Database update error:', error)
      throw new Error('Database update error')
    }

    return new Response(JSON.stringify({ 
      success: true
    }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Update metadata error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}