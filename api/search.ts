import { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

interface SearchRequest {
  query: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body: SearchRequest = req.body
    
    if (!body.query || !body.query.trim()) {
      return res.status(400).json({ error: 'Missing or empty query' })
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

    return res.status(200).json({ 
      results: results || []
    })

  } catch (error) {
    console.error('Search error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}