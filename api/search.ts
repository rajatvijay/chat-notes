import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

interface SearchRequest {
  query: string
}

interface SearchResult {
  id: string
  content: string
  category: string | null
  created_at: string
}

export const config = {
  runtime: 'edge',
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const body: SearchRequest = await request.json()
    
    if (!body.query || !body.query.trim()) {
      return new Response('Missing or empty query', { status: 400 })
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
    
    // Search notes using Supabase's text search functionality
    // Using ilike for case-insensitive partial matching
    const { data: results, error } = await supabase
      .from('notes')
      .select('id, content, category, created_at')
      .ilike('content', `%${body.query.trim()}%`)
      .order('created_at', { ascending: false })
      .limit(50) // Limit results to prevent overwhelming UI

    if (error) {
      console.error('Search error:', error)
      throw new Error('Database search error')
    }

    return new Response(JSON.stringify({ 
      results: results || []
    }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Search error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}