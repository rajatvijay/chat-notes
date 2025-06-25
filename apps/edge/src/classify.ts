import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const OPENAI_API_KEY = Deno.env.get('OPENAI_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

interface ClassifyRequest {
  note_id: string
  content: string
}

export async function classify(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const body: ClassifyRequest = await request.json()
    
    if (!body.note_id || !body.content) {
      return new Response('Missing note_id or content', { status: 400 })
    }

    // Call OpenAI GPT-4o for classification and metadata extraction
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
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

Only include metadata fields that are clearly present in the content.`
          },
          {
            role: 'user',
            content: body.content
          }
        ],
        max_tokens: 200,
        temperature: 0
      })
    })

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
        cleaned_content: body.content // Use original content as fallback
      }
    }

    // Validate category
    const validCategories = ['task', 'idea', 'journal', 'meeting', 'reading', 'misc']
    const finalCategory = validCategories.includes(result.category) ? result.category : 'misc'
    const metadata = result.metadata || {}
    const cleanedContent = result.cleaned_content || body.content

    // For tasks, add cleaned content to metadata
    if (finalCategory === 'task' && cleanedContent !== body.content) {
      metadata.cleaned_content = cleanedContent
    }

    // Update note in Supabase
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
    
    const { error } = await supabase
      .from('notes')
      .update({ 
        category: finalCategory,
        metadata: metadata
      })
      .eq('id', body.note_id)

    if (error) {
      throw new Error('Database update error')
    }

    return new Response(JSON.stringify({ 
      category: finalCategory,
      metadata: metadata
    }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Classification error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}