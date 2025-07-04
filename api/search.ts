import { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { withAuth } from './shared/middleware.js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

interface SearchRequest {
  query: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return withAuth(req, res, async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const body: SearchRequest = req.body

    if (!body.query || !body.query.trim()) {
      return res.status(400).json({ error: 'Missing or empty query' })
    }

    // Additional input validation
    const query = body.query.trim()
    if (query.length > 1000) {
      return res.status(400).json({ error: 'Search query too long' })
    }

    // Sanitize query to prevent injection attacks
    const sanitizedQuery = query.replace(/[%_\\]/g, '\\$&')

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Search notes using Supabase's text search functionality
    // Using ilike for case-insensitive partial matching with escaped query
    const { data: results, error } = await supabase
      .from('notes')
      .select('id, content, category, created_at')
      .ilike('content', `%${sanitizedQuery}%`)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(50) // Limit results to prevent overwhelming UI

    if (error) {
      console.error('Search error:', error)
      throw new Error('Database search error')
    }

    return res.status(200).json({
      results: results || [],
    })
  })
}
