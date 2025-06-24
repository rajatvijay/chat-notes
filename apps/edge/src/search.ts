import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

interface SearchRequest {
  query: string
}

export async function search(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const body: SearchRequest = await request.json()
    
    if (!body.query) {
      return new Response('Missing query', { status: 400 })
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
    
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .ilike('content', `%${body.query}%`)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      throw new Error('Database search error')
    }

    return new Response(JSON.stringify({ results: data }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Search error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}