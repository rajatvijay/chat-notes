import { getSupabaseClient } from './supabase-utils'

// GPT-4o pricing (as of 2024)
const GPT4O_PRICING = {
  input: 0.0025 / 1000,  // $0.0025 per 1K input tokens
  output: 0.01 / 1000    // $0.01 per 1K output tokens
}

export function calculateTokens(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters for GPT models
  // This is a simple approximation - in production you'd want more accurate counting
  return Math.ceil(text.length / 4)
}

export function calculateCost(inputTokens: number, outputTokens: number): number {
  const inputCost = inputTokens * GPT4O_PRICING.input
  const outputCost = outputTokens * GPT4O_PRICING.output
  return inputCost + outputCost
}

export async function logCost(
  endpoint: string,
  inputTokens: number,
  outputTokens: number,
  cost: number
): Promise<void> {
  try {
    // Check if environment variables are available
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('Supabase environment variables not available, skipping cost logging')
      return
    }

    const supabase = getSupabaseClient()
    
    const { error } = await supabase
      .from('llm_costs')
      .insert({
        endpoint,
        model: 'gpt-4o',
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        cost_usd: cost
      })

    if (error) {
      // If the table doesn't exist, just log a warning instead of failing
      if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
        console.warn('llm_costs table does not exist yet, skipping cost logging')
        return
      }
      console.error('Failed to log LLM cost:', error)
    }
  } catch (error) {
    console.warn('Error logging LLM cost (non-critical):', error)
  }
}

export function calculateAndLogCost(
  endpoint: string,
  inputText: string,
  outputText: string
): void {
  const inputTokens = calculateTokens(inputText)
  const outputTokens = calculateTokens(outputText)
  const cost = calculateCost(inputTokens, outputTokens)
  
  // Log cost asynchronously without blocking the response
  logCost(endpoint, inputTokens, outputTokens, cost).catch(console.error)
}