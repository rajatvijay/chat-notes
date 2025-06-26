import { classificationSchema } from './shared/schemas.js'
import { callOpenAI, enhanceReadingContent } from './shared/openai-utils.js'
import { updateNoteMetadata, validCategories } from './shared/supabase-utils.js'

interface ClassifyRequest {
  note_id: string
  content: string
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

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_KEY) {
      console.error('OpenAI API key not available')
      // Return a fallback classification
      const fallbackResult = {
        category: 'misc',
        metadata: {}
      }
      
      // Try to update note with fallback category
      try {
        await updateNoteMetadata(body.note_id, {
          category: 'misc',
          metadata: {}
        })
      } catch (dbError) {
        console.warn('Failed to update note with fallback category:', dbError)
      }
      
      return new Response(JSON.stringify(fallbackResult), {
        headers: { 'Content-Type': 'application/json' }
      })
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
    let result: {
      category: string
      metadata?: Record<string, unknown>
      cleaned_content?: string
    }

    try {
      result = JSON.parse(openaiData.choices[0].message.content) as {
        category: string
        metadata?: Record<string, unknown>
        cleaned_content?: string
      }
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
    if (finalCategory === 'reading' && typeof metadata.link === 'string') {
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
    try {
      await updateNoteMetadata(body.note_id, {
        category: finalCategory,
        metadata: metadata,
      })
    } catch (dbError) {
      console.warn('Failed to update note metadata, but continuing with response:', dbError)
      // Continue with the response even if database update fails
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
    
    // Return a fallback response instead of 500 error
    const fallbackResult = {
      category: 'misc' as const,
      metadata: {}
    }
    
    return new Response(JSON.stringify(fallbackResult), {
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
