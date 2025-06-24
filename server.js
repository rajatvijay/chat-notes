import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const app = express()
const port = 8080

// Middleware
app.use(cors())
app.use(express.json())

// Environment variables
const {
  OPENAI_KEY,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
} = process.env

if (!OPENAI_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// POST /api/classify
app.post('/api/classify', async (req, res) => {
  try {
    const { note_id, content } = req.body
    
    if (!note_id || !content) {
      return res.status(400).json({ error: 'Missing note_id or content' })
    }

    // Call OpenAI GPT-4o for classification
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Classify the note content into one of: task, idea, journal, meeting, reading, misc. Reply ONLY the label.'
          },
          {
            role: 'user',
            content: content
          }
        ],
        max_tokens: 10,
        temperature: 0
      })
    })

    if (!openaiResponse.ok) {
      throw new Error('OpenAI API error')
    }

    const openaiData = await openaiResponse.json()
    const category = openaiData.choices[0].message.content.trim().toLowerCase()

    // Validate category
    const validCategories = ['task', 'idea', 'journal', 'meeting', 'reading', 'misc']
    const finalCategory = validCategories.includes(category) ? category : 'misc'

    // Update note in Supabase
    const { error } = await supabase
      .from('notes')
      .update({ category: finalCategory })
      .eq('id', note_id)

    if (error) {
      throw new Error('Database update error: ' + error.message)
    }

    res.json({ category: finalCategory })

  } catch (error) {
    console.error('Classification error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/search
app.post('/api/search', async (req, res) => {
  try {
    const { query } = req.body
    
    if (!query) {
      return res.status(400).json({ error: 'Missing query' })
    }

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .ilike('content', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      throw new Error('Database search error: ' + error.message)
    }

    res.json({ results: data })

  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend server is running' })
})

app.listen(port, () => {
  console.log(`🚀 Backend server running on http://localhost:${port}`)
  console.log('📋 Available endpoints:')
  console.log('  - POST /api/classify')
  console.log('  - POST /api/search')
  console.log('  - GET /health')
})