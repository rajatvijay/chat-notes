import { metadataSchemas } from './shared/schemas'
import { callOpenAI, enhanceReadingContent, buildCategoryPrompt } from './shared/openai-utils'
import { updateNoteMetadata } from './shared/supabase-utils'

interface ExtractMetadataRequest {
  note_id: string
  content: string
  category: string
}


export const config = {
  runtime: 'edge',
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const body: ExtractMetadataRequest = await request.json()
    
    if (!body.note_id || !body.content || !body.category) {
      return new Response('Missing note_id, content, or category', { status: 400 })
    }

    // Skip metadata extraction for journal and misc
    if (body.category === 'journal' || body.category === 'misc') {
      return new Response(JSON.stringify({ metadata: {} }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const schema = metadataSchemas[body.category as keyof typeof metadataSchemas]
    if (!schema) {
      return new Response('Invalid category', { status: 400 })
    }

    // Build category-specific prompt
    const systemPrompt = `Extract metadata for a ${body.category} note. ${buildCategoryPrompt(body.category)}`

    // Call OpenAI for metadata extraction
    const openaiData = await callOpenAI([
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: body.content
      }
    ], schema, 200, 'extract-metadata')

    let metadata = {}
    
    try {
      metadata = JSON.parse(openaiData.choices[0].message.content)
    } catch (e) {
      console.warn('Failed to parse metadata:', e)
    }

    // For reading content with links, enhance with title and summary
    if (body.category === 'reading' && metadata.link) {
      console.log('Reading content with link:', metadata.link)
      const enhancedResult = await enhanceReadingContent(body.content, metadata.link)
      if (enhancedResult) {
        metadata.title = enhancedResult.title
        metadata.summary = enhancedResult.summary
      }
    }

    // Update note in Supabase
    await updateNoteMetadata(body.note_id, { metadata })

    return new Response(JSON.stringify({ metadata }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Extract metadata error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}