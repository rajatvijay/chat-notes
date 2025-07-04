import { initializeApp, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import admin from 'firebase-admin'
const { credential } = admin

// Initialize Firebase Admin SDK
if (getApps().length === 0) {
  // Validate required environment variables
  const requiredEnvVars = {
    project_id: process.env.FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY,
  }

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([, value]) => !value)
    .map(([key]) => key)

  if (missingVars.length > 0) {
    throw new Error(`Missing required Firebase environment variables: ${missingVars.join(', ')}`)
  }

  try {
    initializeApp({
      credential: credential.cert({
        project_id: requiredEnvVars.project_id,
        client_email: requiredEnvVars.client_email,
        private_key: requiredEnvVars.private_key.replace(/\\n/g, '\n'),
      }),
    })
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error.message)
    throw new Error('Firebase initialization failed')
  }
}

const auth = getAuth()

export async function verifyFirebaseToken(idToken) {
  try {
    const decodedToken = await auth.verifyIdToken(idToken)
    
    // Additional check to ensure only allowed email
    const allowedEmail = process.env.ALLOWED_EMAIL || 'rajatvijay5@gmail.com'
    if (decodedToken.email !== allowedEmail) {
      throw new Error('Unauthorized email address')
    }
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    }
  } catch (error) {
    // Don't log the actual token for security
    console.error('Error verifying Firebase token:', error.message)
    throw new Error('Invalid authentication token')
  }
}

export function getAuthHeader(req) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header')
  }
  
  return authHeader.substring(7) // Remove 'Bearer ' prefix
}

export async function authenticateRequest(req) {
  const idToken = getAuthHeader(req)
  const decodedToken = await verifyFirebaseToken(idToken)
  return decodedToken
}