import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const OPENAI_API_KEY = Deno.env.get('OPENAI_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

interface EnhanceMetadataRequest {
  note_id: string
  content: string
  category: string
}

export async function enhanceMetadata(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const body: EnhanceMetadataRequest = await request.json()
    
    if (!body.note_id || !body.content || !body.category) {
      return new Response('Missing required fields', { status: 400 })
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
    let enhancedMetadata = {}

    // Category-specific metadata enhancement
    switch (body.category) {
      case 'idea':
        enhancedMetadata = await enhanceIdeaMetadata(supabase, body.content)
        break
      case 'meeting':
        enhancedMetadata = await enhanceMeetingMetadata(supabase, body.content)
        break
      case 'reading':
        enhancedMetadata = await enhanceReadingMetadata(body.content)
        break
      default:
        // No enhancement needed for other categories
        break
    }

    // Update note with enhanced metadata
    const { error } = await supabase
      .from('notes')
      .update({ metadata: enhancedMetadata })
      .eq('id', body.note_id)

    if (error) {
      throw new Error('Database update error')
    }

    return new Response(JSON.stringify({ 
      metadata: enhancedMetadata
    }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Metadata enhancement error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}

async function enhanceIdeaMetadata(supabase: ReturnType<typeof createClient>, content: string) {
  // Get existing ideas to check for similarity
  const { data: existingIdeas } = await supabase
    .from('notes')
    .select('id, content, metadata')
    .eq('category', 'idea')

  if (existingIdeas && existingIdeas.length > 0) {
    // Use AI to find related ideas
    const ideaContents = existingIdeas.map((idea: { id: string; content: string }) => ({ id: idea.id, content: idea.content }))
    
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
            content: `Analyze if the new idea is related to any existing ideas. Return JSON:
{
  "related_idea_id": "id_if_related_or_null",
  "idea_title": "short_descriptive_title"
}

Look for conceptual similarity, not just keyword matching.`
          },
          {
            role: 'user',
            content: `New idea: ${content}

Existing ideas:
${ideaContents.map((idea: { id: string; content: string }) => `ID: ${idea.id}\nContent: ${idea.content}`).join('\n\n')}`
          }
        ],
        max_tokens: 150,
        temperature: 0
      })
    })

    if (openaiResponse.ok) {
      const aiData = await openaiResponse.json()
      try {
        return JSON.parse(aiData.choices[0].message.content.trim())
      } catch (e) {
        // Fallback
      }
    }
  }

  // Generate title for standalone idea
  const words = content.split(' ')
  return {
    idea_title: words.slice(0, 4).join(' ') + (words.length > 4 ? '...' : ''),
    related_idea_id: null
  }
}

async function enhanceMeetingMetadata(supabase: ReturnType<typeof createClient>, content: string) {
  // Get existing meetings to check for similarity
  const { data: existingMeetings } = await supabase
    .from('notes')
    .select('id, content, metadata')
    .eq('category', 'meeting')

  if (existingMeetings && existingMeetings.length > 0) {
    const meetingInfo = existingMeetings.map((meeting: { id: string; content: string; metadata?: { meeting_title?: string } }) => ({
      id: meeting.id,
      title: meeting.metadata?.meeting_title || meeting.content.split(' ').slice(0, 4).join(' ')
    }))

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
            content: `Determine if this note belongs to an existing meeting or is a new meeting. Return JSON:
{
  "related_meeting_id": "id_if_related_or_null",
  "meeting_title": "descriptive_title"
}`
          },
          {
            role: 'user',
            content: `New meeting note: ${content}

Existing meetings:
${meetingInfo.map((meeting: { id: string; title: string }) => `ID: ${meeting.id}\nTitle: ${meeting.title}`).join('\n\n')}`
          }
        ],
        max_tokens: 100,
        temperature: 0
      })
    })

    if (openaiResponse.ok) {
      const aiData = await openaiResponse.json()
      try {
        return JSON.parse(aiData.choices[0].message.content.trim())
      } catch (e) {
        // Fallback
      }
    }
  }

  // Generate title for new meeting
  const sentences = content.split(/[.!?]+/)
  const firstSentence = sentences[0]?.trim()
  
  return {
    meeting_title: firstSentence && firstSentence.length < 60 ? firstSentence : content.split(' ').slice(0, 5).join(' ') + '...',
    related_meeting_id: null
  }
}

async function enhanceReadingMetadata(content: string) {
  // Extract links and determine if it's an excerpt or link
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const links = content.match(urlRegex)
  
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
          content: `Extract reading metadata. Return JSON:
{
  "title": "title_if_found",
  "author": "author_if_found", 
  "link": "url_if_found",
  "excerpt": true_if_quote_or_excerpt
}`
        },
        {
          role: 'user',
          content: content
        }
      ],
      max_tokens: 100,
      temperature: 0
    })
  })

  if (openaiResponse.ok) {
    const aiData = await openaiResponse.json()
    try {
      const result = JSON.parse(aiData.choices[0].message.content.trim())
      return {
        ...result,
        link: links?.[0] || result.link
      }
    } catch (e) {
      // Fallback
    }
  }

  return {
    link: links?.[0] || null,
    excerpt: !links?.length,
    title: content.split(' ').slice(0, 5).join(' ') + '...'
  }
}