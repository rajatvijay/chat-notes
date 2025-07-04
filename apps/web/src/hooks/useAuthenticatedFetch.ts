import { useAuth } from '../contexts/AuthContext'

export function useAuthenticatedFetch() {
  const { user } = useAuth()

  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Get the Firebase ID token
    const token = await user.getIdToken()

    // Add the Authorization header
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    }

    // Make the request with authentication
    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (response.status === 401) {
      throw new Error('Authentication failed. Please sign in again.')
    }

    return response
  }

  return { authenticatedFetch }
}