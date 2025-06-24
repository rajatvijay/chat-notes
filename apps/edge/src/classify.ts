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

    // Call OpenAI GPT-4o for classification
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
            content: 'Classify the note content into one of: task, idea, journal, meeting, reading, misc. Reply ONLY the label.'
          },
          {
            role: 'user',
            content: body.content
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
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
    
    const { error } = await supabase
      .from('notes')
      .update({ category: finalCategory })
      .eq('id', body.note_id)

    if (error) {
      throw new Error('Database update error')
    }

    return new Response(JSON.stringify({ category: finalCategory }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Classification error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}