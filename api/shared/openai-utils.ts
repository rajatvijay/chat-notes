import { enhanceSchema } from './schemas.js'
import { calculateAndLogCost } from './cost-tracking.js'

const OPENAI_API_KEY = process.env.OPENAI_KEY

export async function callOpenAI(messages: Array<{role: string, content: string}>, schema?: unknown, maxTokens = 200, endpoint = 'unknown') {
  const requestBody: Record<string, unknown> = {
    model: 'gpt-4o',
    messages,
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

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    throw new Error('OpenAI API error')
  }

  const result = await response.json()
  
  // Log cost for this API call
  const inputText = messages.map(m => m.content).join(' ')
  const outputText = result.choices?.[0]?.message?.content || ''
  calculateAndLogCost(endpoint, inputText, outputText)
  
  return result
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