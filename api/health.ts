import { getSupabaseClient } from './shared/supabase-utils'


interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  services: {
    database: 'healthy' | 'unhealthy'
    openai: 'healthy' | 'unhealthy'
  }
  uptime: number
}

export default async function handler(): Promise<Response> {
  const startTime = Date.now()
  
  try {
    // Check database connectivity
    let databaseStatus: 'healthy' | 'unhealthy' = 'unhealthy'
    try {
      if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const supabase = getSupabaseClient()
        const { error } = await supabase
          .from('notes')
          .select('count(*)', { count: 'exact' })
          .limit(1)
        
        databaseStatus = error ? 'unhealthy' : 'healthy'
      }
    } catch {
      databaseStatus = 'unhealthy'
    }

    // Check OpenAI connectivity
    let openaiStatus: 'healthy' | 'unhealthy' = 'unhealthy'
    try {
      if (process.env.OPENAI_KEY) {
        const response = await fetch('https://api.openai.com/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_KEY}`,
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(5000) // 5 second timeout
        })
        
        openaiStatus = response.ok ? 'healthy' : 'unhealthy'
      }
    } catch {
      openaiStatus = 'unhealthy'
    }

    // Determine overall status
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    if (databaseStatus === 'unhealthy' || openaiStatus === 'unhealthy') {
      overallStatus = databaseStatus === 'unhealthy' ? 'unhealthy' : 'degraded'
    }

    const healthCheck: HealthCheck = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
      services: {
        database: databaseStatus,
        openai: openaiStatus
      },
      uptime: Date.now() - startTime
    }

    const statusCode = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503

    return new Response(JSON.stringify(healthCheck, null, 2), {
      status: statusCode,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })

  } catch (error) {
    const errorHealth: HealthCheck = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
      services: {
        database: 'unhealthy',
        openai: 'unhealthy'
      },
      uptime: Date.now() - startTime
    }

    return new Response(JSON.stringify(errorHealth, null, 2), {
      status: 503,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  }
}