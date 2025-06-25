import { classificationSchema } from './shared/schemas'
import { callOpenAI, enhanceReadingContent } from './shared/openai-utils'
import { updateNoteMetadata, validCategories } from './shared/supabase-utils'

interface ClassifyRequest {
  note_id: string
  content: string
}

export const config = {
  runtime: 'edge',
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
    const openaiData = await callOpenAI([
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

Only include cleaned_content for tasks when due dates are removed.`
      },
      {
        role: 'user',
        content: body.content
      }
    ], classificationSchema, 200, 'classify')
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
      const enhancedResult = await enhanceReadingContent(body.content, metadata.link)
      if (enhancedResult) {
        metadata.title = enhancedResult.title
        metadata.summary = enhancedResult.summary
      }
    }

    console.log('Classification result:', {
      originalContent: body.content,
      finalCategory,
      cleanedContent,
      metadata,
    })

    // Update note in Supabase
    await updateNoteMetadata(body.note_id, {
      category: finalCategory,
      metadata: metadata,
    })

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
