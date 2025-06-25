import { createClient } from '@supabase/supabase-js'

const OPENAI_API_KEY = process.env.OPENAI_KEY
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

interface ClassifyRequest {
  note_id: string
  content: string
}

export const config = {
  runtime: 'edge',
}

// JSON schemas for structured output
const classificationSchema = {
  type: "object",
  properties: {
    category: {
      type: "string",
      enum: ["task", "idea", "journal", "meeting", "reading", "misc"]
    },
    metadata: {
      type: "object",
      properties: {
        due_date: { type: "string" },
        title: { type: "string" },
        summary: { type: "string" },
        date: { type: "string" },
        time: { type: "string" },
        link: { type: "string" },
        cleaned_content: { type: "string" }
      },
      additionalProperties: false
    },
    cleaned_content: { type: "string" }
  },
  required: ["category", "metadata"],
  additionalProperties: false
}

const enhanceSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    summary: { type: "string" }
  },
  required: ["title", "summary"],
  additionalProperties: false
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const body: ClassifyRequest = await request.json()

    if (!body.note_id || !body.content) {
      return new Response('Missing note_id or content', { status: 400 })
    }

    // Call OpenAI GPT-4o for classification and metadata extraction
    const openaiResponse = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `Classify the note content and extract metadata based on these rules:

For tasks:
- Extract due date from phrases like: "due tomorrow", "due next week", "by Friday", "deadline Monday", "needs to be done by [date]", "complete by [date]", specific dates like "January 15", "15th", "next Tuesday"
- Convert relative dates to ISO format (YYYY-MM-DD). Today is ${new Date().toISOString().split('T')[0]}
- Remove all due date references from the content to create a clean task description
- Example: "Fix the login bug due tomorrow" → cleaned_content: "Fix the login bug", metadata: {"due_date": "2024-12-26"}

For ideas:
- Extract "title" (short descriptive title) and "summary" (brief 1-2 sentence summary)

For meetings:
- Extract "title" (meeting title), "date" (ISO date string YYYY-MM-DD), "time" (HH:MM format) if present
- Convert relative dates to ISO format. Today is ${new Date().toISOString().split('T')[0]}
- Extract time in 24-hour format (e.g., "14:30" for 2:30 PM)

For reading:
- Extract "link" if URL found
- If no link found, extract "title" and "summary"

For other categories, include only clearly present metadata fields.

Only include cleaned_content for tasks when due dates are removed.`,
            },
            {
              role: 'user',
              content: body.content,
            },
          ],
          max_tokens: 200,
          temperature: 0,
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "classification_result",
              schema: classificationSchema
            }
          }
        }),
      }
    )

    if (!openaiResponse.ok) {
      throw new Error('OpenAI API error')
    }

    const openaiData = await openaiResponse.json()
    let result

    try {
      result = JSON.parse(openaiData.choices[0].message.content)
    } catch (e) {
      // Fallback to simple classification if JSON parsing fails
      const category = openaiData.choices[0].message.content
        .trim()
        .toLowerCase()
      const validCategories = [
        'task',
        'idea',
        'journal',
        'meeting',
        'reading',
        'misc',
      ]
      result = {
        category: validCategories.includes(category) ? category : 'misc',
        metadata: {},
        cleaned_content: body.content, // Use original content as fallback
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
    const finalCategory = validCategories.includes(result.category)
      ? result.category
      : 'misc'
    const metadata = result.metadata || {}
    const cleanedContent = result.cleaned_content || body.content

    // For tasks, add cleaned content to metadata
    if (finalCategory === 'task' && cleanedContent !== body.content) {
      metadata.cleaned_content = cleanedContent
    }

    // For reading content with links, fetch title and summary via LLM
    if (finalCategory === 'reading' && metadata.link) {
      console.log('Reading content with link:', metadata.link)
      try {
        const enhanceResponse = await fetch(
          'https://api.openai.com/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o',
              messages: [
                {
                  role: 'system',
                  content: `You are tasked with extracting title and summary for reading content. 
                
                First, try to fetch information about the URL: ${metadata.link}
                
                If you cannot access the URL, generate a reasonable title and summary based on the URL structure and any context provided by the user.`,
                },
                {
                  role: 'user',
                  content: `Please extract title and summary for this reading content: "${body.content}"\n\nURL: ${metadata.link}`,
                },
              ],
              max_tokens: 150,
              temperature: 0,
              response_format: {
                type: "json_schema",
                json_schema: {
                  name: "enhance_result",
                  schema: enhanceSchema
                }
              }
            }),
          }
        )

        if (enhanceResponse.ok) {
          const enhanceData = await enhanceResponse.json()
          console.log('Enhance data:', enhanceData)
          try {
            const enhancedResult = JSON.parse(enhanceData.choices[0].message.content)
            metadata.title = enhancedResult.title
            metadata.summary = enhancedResult.summary
          } catch (e) {
            console.warn('Failed to parse enhanced reading metadata:', e)
            console.warn('Raw content:', enhanceData.choices[0].message.content)
          }
        }
      } catch (error) {
        console.warn('Failed to enhance reading metadata:', error)
      }
    }

    console.log('Classification result:', {
      originalContent: body.content,
      finalCategory,
      cleanedContent,
      metadata,
    })

    // Update note in Supabase
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    const { error } = await supabase
      .from('notes')
      .update({
        category: finalCategory,
        metadata: metadata,
      })
      .eq('id', body.note_id)

    if (error) {
      console.error('Database update error:', error)
      throw new Error('Database update error')
    }

    return new Response(
      JSON.stringify({
        category: finalCategory,
        metadata: metadata,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Classification error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
