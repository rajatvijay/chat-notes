import { getSupabaseClient } from './shared/supabase-utils'

interface CostSummary {
  totalCost: number
  totalRequests: number
  dailyBreakdown: Array<{
    date: string
    cost: number
    requests: number
  }>
}

export const config = {
  runtime: 'edge',
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const supabase = getSupabaseClient()

    // Get cost data from the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { data: costs, error } = await supabase
      .from('llm_costs')
      .select('date, cost_usd, endpoint')
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false })

    if (error) {
      console.error('Database query error:', error)
      throw new Error('Failed to fetch cost data')
    }

    // Calculate totals and daily breakdown
    const totalCost = costs.reduce((sum, entry) => sum + Number(entry.cost_usd), 0)
    const totalRequests = costs.length

    // Group by date for daily breakdown
    const dailyMap = new Map<string, { cost: number; requests: number }>()
    
    costs.forEach(entry => {
      const date = entry.date
      const existing = dailyMap.get(date) || { cost: 0, requests: 0 }
      dailyMap.set(date, {
        cost: existing.cost + Number(entry.cost_usd),
        requests: existing.requests + 1
      })
    })

    // Convert to array and sort by date (most recent first)
    const dailyBreakdown = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        cost: data.cost,
        requests: data.requests
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 7) // Only show last 7 days

    const response: CostSummary = {
      totalCost,
      totalRequests,
      dailyBreakdown
    }

    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('LLM costs fetch error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}