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
const { OPENAI_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env

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

    // Call OpenAI GPT-4o for classification and metadata extraction
    const openaiResponse = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENAI_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `Classify the note content and extract metadata. Return JSON only in this format:
{
  "category": "task|idea|journal|meeting|reading|misc",
  "metadata": {
    // For tasks: "due_date" (ISO date string if found, e.g., "2024-01-15")
    // For ideas: "idea_title" (short title), "related_idea_id" (if relates to existing idea)
    // For meetings: "meeting_title", "meeting_date", "meeting_time"
    // For reading: "link" (if URL found), "title", "author", "excerpt" (true/false)
  },
  "cleaned_content": "cleaned version of content with due dates removed for tasks"
}

For tasks specifically:
- Extract due date from phrases like: "due tomorrow", "due next week", "by Friday", "deadline Monday", "needs to be done by [date]", "complete by [date]", specific dates like "January 15", "15th", "next Tuesday"
- Convert relative dates to ISO format (YYYY-MM-DD). Today is ${new Date().toISOString().split('T')[0]}
- Remove all due date references from the content to create a clean task description
- Example: "Fix the login bug due tomorrow" → cleaned_content: "Fix the login bug", metadata: {"due_date": "2024-12-26"}

For other categories, do NOT include cleaned_content - only generate it for tasks.

Only include metadata fields that are clearly present in the content.`,
            },
            {
              role: 'user',
              content: content,
            },
          ],
          max_tokens: 200,
          temperature: 0,
        }),
      }
    )

    if (!openaiResponse.ok) {
      throw new Error('OpenAI API error')
    }

    const openaiData = await openaiResponse.json()
    let result
    
    try {
      result = JSON.parse(openaiData.choices[0].message.content.trim())
    } catch (e) {
      // Fallback to simple classification if JSON parsing fails
      const category = openaiData.choices[0].message.content.trim().toLowerCase()
      const validCategories = ['task', 'idea', 'journal', 'meeting', 'reading', 'misc']
      result = {
        category: validCategories.includes(category) ? category : 'misc',
        metadata: {},
        cleaned_content: content // Use original content as fallback
      }
    }

    // Validate category
    const validCategories = [
      'task',
      'idea',
      'journal',
      'meeting',
      'reading',
      'misc',
    ]
    const finalCategory = validCategories.includes(result.category) ? result.category : 'misc'
    const metadata = result.metadata || {}
    const cleanedContent = result.cleaned_content || content

    // For tasks, add cleaned content to metadata
    if (finalCategory === 'task' && cleanedContent !== content) {
      metadata.cleaned_content = cleanedContent
    }

    console.log('Classification result:', {
      originalContent: content,
      finalCategory,
      cleanedContent,
      metadata
    })

    // Update note in Supabase
    const { error } = await supabase
      .from('notes')
      .update({ 
        category: finalCategory,
        metadata: metadata
      })
      .eq('id', note_id)

    if (error) {
      console.error('Database update error:', error)
      throw new Error('Database update error: ' + error.message)
    }

    res.json({ 
      category: finalCategory,
      metadata: metadata
    })
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

// POST /api/task-completion
app.post('/api/task-completion', async (req, res) => {
  try {
    const { note_id, completed } = req.body

    if (!note_id) {
      return res.status(400).json({ error: 'Missing note_id' })
    }

    if (completed) {
      // Mark task as completed
      const { error } = await supabase
        .from('task_completions')
        .insert({ note_id })

      if (error && error.code !== '23505') { // Ignore unique constraint violations
        throw error
      }
    } else {
      // Mark task as incomplete
      const { error } = await supabase
        .from('task_completions')
        .delete()
        .eq('note_id', note_id)

      if (error) {
        throw error
      }
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Task completion error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/task-due-date
app.post('/api/task-due-date', async (req, res) => {
  try {
    const { note_id, due_date } = req.body

    if (!note_id || !due_date) {
      return res.status(400).json({ error: 'Missing note_id or due_date' })
    }

    // Update the note's metadata with due date
    const { data: currentNote, error: fetchError } = await supabase
      .from('notes')
      .select('metadata')
      .eq('id', note_id)
      .single()

    if (fetchError) {
      throw fetchError
    }

    const updatedMetadata = {
      ...currentNote.metadata,
      due_date: due_date
    }

    const { error } = await supabase
      .from('notes')
      .update({ metadata: updatedMetadata })
      .eq('id', note_id)

    if (error) {
      throw error
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Task due date error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend server is running' })
})

app.listen(port, () => {
  console.log(`🚀 Backend server running on http://localhost:${port}`)
  console.log('  - GET /health')
  console.log('  - POST /api/classify')
  console.log('  - POST /api/search')
  console.log('  - POST /api/task-completion')
  console.log('  - POST /api/task-due-date')
})
