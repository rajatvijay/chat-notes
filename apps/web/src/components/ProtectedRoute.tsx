import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AuthLoader from './AuthLoader'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  // Show loading screen while determining auth state
  if (loading) {
    return <AuthLoader message="Verifying authentication..." showLogo={true} />
  }

  // Redirect to sign in if not authenticated
  if (!user) {
    return <Navigate to="/signin" replace />
  }

  // User is authenticated, render protected content
  return <>{children}</>
}