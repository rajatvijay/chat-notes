import { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateRequest } from './firebase-auth.js'

// Rate limiting store (in production, use Redis or external service)
const rateLimitStore = new Map<string, { requests: number; resetTime: number }>()

// Request size limits (in bytes)
const MAX_REQUEST_SIZE = 1024 * 1024 // 1MB
const MAX_CONTENT_LENGTH = 50000 // 50KB for content fields

// Rate limits per endpoint (requests per minute)
const RATE_LIMITS = {
  '/api/classify': 30,
  '/api/search': 60,
  '/api/metadata': 120,
  '/api/llm-costs': 10,
  default: 100
}

export interface AuthenticatedUser {
  uid: string
  email: string
}

export interface SecurityContext {
  user: AuthenticatedUser
  clientIP: string
  userAgent: string
  timestamp: number
}

/**
 * Centralized authentication middleware
 */
export async function withAuth(
  req: VercelRequest,
  res: VercelResponse,
  handler: (req: VercelRequest, res: VercelResponse, context: SecurityContext) => Promise<void | VercelResponse>
) {
  try {
    // 0. Validate environment (only runs once per deployment)
    validateEnvironment()

    // 1. Rate limiting
    await applyRateLimit(req, res)

    // 2. Input validation
    await validateRequest(req)

    // 3. Authentication
    const user = await authenticateRequest(req)

    // 4. Create security context
    const context: SecurityContext = {
      user,
      clientIP: getClientIP(req),
      userAgent: req.headers['user-agent'] || 'unknown',
      timestamp: Date.now()
    }

    // 5. Audit logging
    await auditLog(context, req.url || 'unknown', 'auth_success')

    // 6. Execute handler
    await handler(req, res, context)

  } catch (error) {
    // Sanitized error handling
    await handleSecurityError(error, req, res)
  }
}

/**
 * Apply rate limiting based on endpoint and client IP
 */
async function applyRateLimit(req: VercelRequest, res: VercelResponse): Promise<void> {
  const clientIP = getClientIP(req)
  const endpoint = req.url || 'unknown'
  const key = `${clientIP}:${endpoint}`
  
  const limit = RATE_LIMITS[endpoint as keyof typeof RATE_LIMITS] || RATE_LIMITS.default
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute window

  const current = rateLimitStore.get(key)
  
  if (!current || now > current.resetTime) {
    // Reset or initialize
    rateLimitStore.set(key, { requests: 1, resetTime: now + windowMs })
    return
  }

  if (current.requests >= limit) {
    // Rate limit exceeded
    res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: Math.ceil((current.resetTime - now) / 1000)
    })
    throw new Error('Rate limit exceeded')
  }

  // Increment counter
  current.requests++
  rateLimitStore.set(key, current)

  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', limit.toString())
  res.setHeader('X-RateLimit-Remaining', (limit - current.requests).toString())
  res.setHeader('X-RateLimit-Reset', Math.ceil(current.resetTime / 1000).toString())
}

/**
 * Validate request size and content
 */
async function validateRequest(req: VercelRequest): Promise<void> {
  // Check request size
  const contentLength = parseInt(req.headers['content-length'] || '0', 10)
  if (contentLength > MAX_REQUEST_SIZE) {
    throw new SecurityError('Request too large', 413)
  }

  // Validate HTTP method
  if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method || '')) {
    throw new SecurityError('Method not allowed', 405)
  }

  // Content-specific validation for POST requests
  if (req.method === 'POST' && req.body) {
    await validatePostContent(req.body)
  }
}

/**
 * Validate POST request content
 */
async function validatePostContent(body: unknown): Promise<void> {
  if (typeof body !== 'object' || body === null) {
    throw new SecurityError('Invalid request body', 400)
  }

  // Check for excessively long content fields
  const bodyObj = body as Record<string, unknown>
  if (bodyObj.content && typeof bodyObj.content === 'string' && bodyObj.content.length > MAX_CONTENT_LENGTH) {
    throw new SecurityError('Content too long', 400)
  }

  // Sanitize common injection patterns
  const dangerousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:text\/html/gi
  ]

  const checkValue = (value: unknown): boolean => {
    if (typeof value === 'string') {
      return dangerousPatterns.some(pattern => pattern.test(value))
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue)
    }
    return false
  }

  if (checkValue(bodyObj)) {
    throw new SecurityError('Invalid content detected', 400)
  }
}

/**
 * Get client IP address from request headers
 */
function getClientIP(req: VercelRequest): string {
  const xForwardedFor = req.headers['x-forwarded-for']
  const xRealIp = req.headers['x-real-ip']
  const remoteAddress = (req as { connection?: { remoteAddress?: string } }).connection?.remoteAddress

  const ipString = (
    (typeof xForwardedFor === 'string' ? xForwardedFor : '') ||
    (typeof xRealIp === 'string' ? xRealIp : '') ||
    remoteAddress ||
    'unknown'
  )

  return ipString.split(',')[0].trim()
}

/**
 * Audit logging for security events
 */
async function auditLog(
  context: SecurityContext,
  endpoint: string,
  event: string,
  details?: Record<string, unknown>
): Promise<void> {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    endpoint,
    user: context.user.email,
    clientIP: context.clientIP,
    userAgent: context.userAgent,
    details: details ? sanitizeLogData(details) : undefined
  }

  // In production, send to logging service (e.g., DataDog, LogDNA, etc.)
  console.log('[SECURITY_AUDIT]', JSON.stringify(logEntry))
}

/**
 * Sanitize data for logging (remove sensitive information)
 */
function sanitizeLogData(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...data }
  const sensitiveFields = ['password', 'token', 'key', 'secret', 'auth', 'credential']
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]'
    }
  }

  return sanitized
}

/**
 * Custom security error class
 */
class SecurityError extends Error {
  constructor(message: string, public statusCode: number = 400) {
    super(message)
    this.name = 'SecurityError'
  }
}

/**
 * Handle security-related errors with sanitized responses
 */
async function handleSecurityError(
  error: unknown,
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Ensure we have an Error object
  const err = error instanceof Error ? error : new Error('Unknown error occurred')
  const securityError = err as Error & { statusCode?: number; name?: string }
  const clientIP = getClientIP(req)
  const endpoint = req.url || 'unknown'

  // Log the actual error for debugging (with sensitive data removed)
  console.error('[SECURITY_ERROR]', {
    timestamp: new Date().toISOString(),
    endpoint,
    clientIP,
    error: securityError.message,
    stack: process.env.NODE_ENV === 'development' ? securityError.stack : undefined
  })

  // Determine response based on error type
  if (securityError.name === 'SecurityError') {
    res.status(securityError.statusCode || 400).json({
      error: securityError.message
    })
    return
  }

  // Authentication errors
  if (securityError.message?.includes('authentication') || securityError.message?.includes('Unauthorized')) {
    // Audit failed authentication attempt
    await auditLog(
      {
        user: { uid: 'unknown', email: 'unknown' },
        clientIP,
        userAgent: req.headers['user-agent'] || 'unknown',
        timestamp: Date.now()
      },
      endpoint,
      'auth_failure',
      { reason: securityError.message }
    )

    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  // Generic error response (don't leak internal details)
  res.status(500).json({
    error: 'Internal server error'
  })
}

/**
 * Environment variable validation - call this at app startup
 */
export function validateEnvironment(): void {
  const required = [
    'OPENAI_KEY',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY'
  ]

  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  // Validate format of critical variables
  if (process.env.OPENAI_KEY && !process.env.OPENAI_KEY.startsWith('sk-')) {
    console.warn('[SECURITY_WARNING] OpenAI API key format may be invalid')
  }

  if (process.env.SUPABASE_URL && !process.env.SUPABASE_URL.startsWith('https://')) {
    console.warn('[SECURITY_WARNING] Supabase URL should use HTTPS')
  }

  // Validate Firebase service account format
  if (process.env.FIREBASE_CLIENT_EMAIL && !process.env.FIREBASE_CLIENT_EMAIL.includes('@')) {
    console.warn('[SECURITY_WARNING] Firebase client email format may be invalid')
  }

  if (process.env.FIREBASE_PRIVATE_KEY && !process.env.FIREBASE_PRIVATE_KEY.includes('BEGIN PRIVATE KEY')) {
    console.warn('[SECURITY_WARNING] Firebase private key format may be invalid')
  }
}

/**
 * Cleanup rate limit store periodically
 */
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime + 60000) { // Clean up entries older than 1 minute
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000) // Run every 5 minutes