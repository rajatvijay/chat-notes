// This is a placeholder for local development
// In production, the edge functions are deployed individually to Vercel

console.log('Edge functions ready for development')
console.log('Available endpoints:')
console.log('- POST /api/classify')
console.log('- POST /api/search')

// Simple HTTP server for local testing
const port = 8080
Deno.serve({ port }, (request) => {
  const url = new URL(request.url)
  
  if (url.pathname === '/health') {
    return new Response('OK', { status: 200 })
  }
  
  return new Response('Edge functions are running. Use Vercel for actual deployment.', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' }
  })
})

console.log(`Edge functions development server running on http://localhost:${port}`)