import { enhanceSchema } from './schemas.js'
import { calculateAndLogCost } from './cost-tracking.js'

const OPENAI_API_KEY = process.env.OPENAI_KEY

// Security limits
const MAX_INPUT_LENGTH = 50000 // 50KB
const MAX_TOKENS = 4000 // Reasonable limit to prevent abuse
const REQUEST_TIMEOUT = 30000 // 30 seconds

export async function callOpenAI(messages: Array<{role: string, content: string}>, schema?: unknown, maxTokens = 200, endpoint = 'unknown') {
  // Validate OpenAI API key
  if (!OPENAI_API_KEY || !OPENAI_API_KEY.startsWith('sk-')) {
    throw new Error('Invalid or missing OpenAI API key')
  }

  // Validate input parameters
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('Invalid messages array')
  }

  // Validate token limit
  if (maxTokens > MAX_TOKENS) {
    console.warn(`Requested token limit ${maxTokens} exceeds maximum ${MAX_TOKENS}, capping to maximum`)
    maxTokens = MAX_TOKENS
  }

  // Check total input length to prevent excessive costs
  const totalInputLength = messages.reduce((sum, msg) => sum + (msg.content?.length || 0), 0)
  if (totalInputLength > MAX_INPUT_LENGTH) {
    throw new Error(`Input too large: ${totalInputLength} characters (max: ${MAX_INPUT_LENGTH})`)
  }

  // Sanitize messages to prevent injection
  const sanitizedMessages = messages.map(msg => ({
    role: msg.role,
    content: sanitizeContent(msg.content)
  }))
  const requestBody: Record<string, unknown> = {
    model: 'gpt-4o',
    messages: sanitizedMessages,
    max_tokens: maxTokens,
    temperature: 0
  }

  if (schema) {
    requestBody.response_format = {
      type: "json_schema",
      json_schema: {
        name: "result",
        schema
      }
    }
  }

  // Create AbortController for request timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(`OpenAI API error: ${response.status} ${response.statusText}`)
      
      // Don't expose API error details to prevent information leakage
      if (response.status === 401) {
        throw new Error('OpenAI authentication failed')
      } else if (response.status === 429) {
        throw new Error('OpenAI rate limit exceeded')
      } else if (response.status >= 500) {
        throw new Error('OpenAI service unavailable')
      } else {
        throw new Error('OpenAI API request failed')
      }
    }

    const result = await response.json()
    
    // Log cost for this API call (with sanitized data)
    const inputText = sanitizedMessages.map(m => m.content).join(' ')
    const outputText = result.choices?.[0]?.message?.content || ''
    calculateAndLogCost(endpoint, inputText, outputText)
    
    return result
  } catch (error) {
    clearTimeout(timeoutId)
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('OpenAI request timeout')
    }
    
    throw error
  }
}

/**
 * Sanitize content to prevent injection attacks and excessive data
 */
function sanitizeContent(content: string): string {
  if (!content || typeof content !== 'string') {
    return ''
  }

  // Truncate excessively long content
  let sanitized = content.slice(0, MAX_INPUT_LENGTH)

  // Remove potentially dangerous content
  sanitized = sanitized
    .replace(/<script[^>]*>.*?<\/script>/gi, '[script removed]')
    .replace(/javascript:/gi, '[javascript removed]')
    .replace(/data:text\/html/gi, '[data url removed]')
    .replace(/on\w+\s*=/gi, '[event handler removed]')

  // Remove excessive whitespace and control characters
  sanitized = sanitized
    .replace(/\s+/g, ' ')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F]/g, '')
    .trim()

  return sanitized
}

export async function enhanceReadingContent(content: string, link: string) {
  try {
    const enhanceData = await callOpenAI([
      {
        role: 'system',
        content: `You are tasked with extracting title and summary for reading content. First, try to fetch information about the URL: ${link}. If you cannot access the URL, generate a reasonable title and summary based on the URL structure and any context provided by the user.`
      },
      {
        role: 'user',
        content: `Please extract title and summary for this reading content: "${content}"\n\nURL: ${link}`
      }
    ], enhanceSchema, 150, 'enhance-reading')

    try {
      return JSON.parse(enhanceData.choices[0].message.content)
    } catch (e) {
      console.warn('Failed to parse enhanced reading metadata:', e)
      return null
    }
  } catch (error) {
    console.warn('Failed to enhance reading metadata:', error)
    return null
  }
}

export function buildCategoryPrompt(category: string): string {
  const today = new Date().toISOString().split('T')[0]
  
  switch (category) {
    case 'task':
      return `Extract due date from phrases like: "due tomorrow", "due next week", "by Friday", "deadline Monday", "needs to be done by [date]", "complete by [date]", specific dates like "January 15", "15th", "next Tuesday". Convert relative dates to ISO format (YYYY-MM-DD). Today is ${today}. Remove all due date references from the content to create a clean task description.`
    case 'idea':
      return 'Extract a short descriptive title and brief 1-2 sentence summary.'
    case 'meeting':
      return `Extract meeting title, date (ISO format YYYY-MM-DD), and time (24-hour format HH:MM) if present. Convert relative dates to ISO format. Today is ${today}.`
    case 'reading':
      return 'Extract link if URL found. If no link found, extract title and summary.'
    default:
      return 'Extract any relevant metadata fields that are clearly present in the content.'
  }
}