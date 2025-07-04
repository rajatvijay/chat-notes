import { VercelRequest, VercelResponse } from '@vercel/node'
import { getSupabaseClient } from './shared/supabase-utils.js'
import { withAuth } from './shared/middleware.js'

interface CostSummary {
  totalCost: number
  totalRequests: number
  dailyBreakdown: Array<{
    date: string
    cost: number
    requests: number
  }>
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return withAuth(req, res, async (req, res) => {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const supabase = getSupabaseClient()

    // Check if environment variables are available
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase environment variables')
      return res.status(200).json({
        totalCost: 0,
        totalRequests: 0,
        dailyBreakdown: [],
      })
    }

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
      // If the table doesn't exist yet, return empty data instead of failing
      // PGRST116 is PostgREST error code for relation not found
      if (
        error.code === 'PGRST116' ||
        error.message?.includes('does not exist')
      ) {
        return res.status(200).json({
          totalCost: 0,
          totalRequests: 0,
          dailyBreakdown: [],
        })
      }
      throw new Error('Failed to fetch cost data')
    }

    // Handle null or empty data
    const costsData = costs || []

    // Calculate totals and daily breakdown
    const totalCost = costsData.reduce(
      (sum, entry) => sum + Number(entry.cost_usd || 0),
      0
    )
    const totalRequests = costsData.length

    // Group by date for daily breakdown
    const dailyMap = new Map<string, { cost: number; requests: number }>()

    costsData.forEach((entry) => {
      const date = entry.date
      const existing = dailyMap.get(date) || { cost: 0, requests: 0 }
      dailyMap.set(date, {
        cost: existing.cost + Number(entry.cost_usd || 0),
        requests: existing.requests + 1,
      })
    })

    // Convert to array and sort by date (most recent first)
    const dailyBreakdown = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        cost: data.cost,
        requests: data.requests,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 7) // Only show last 7 days

    const response: CostSummary = {
      totalCost,
      totalRequests,
      dailyBreakdown,
    }

    return res.status(200).json(response)
  })
}
