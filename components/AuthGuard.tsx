// components/AuthGuard.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { AuthModal, LoginPrompt } from './AuthComponents'
import LoadingSpinner from './LoadingSpinner'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner 
          size="xl" 
          message="Connecting to your synchronicity data..." 
          description="Verifying your cosmic credentials"
          variant="cosmic"
        />
      </div>
    )
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <>
        {fallback || <LoginPrompt onShowAuth={() => setShowAuthModal(true)} />}
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </>
    )
  }

  // User is authenticated, render the protected content
  return <>{children}</>
}

// Hook to check if user is authenticated (for conditional rendering)
export const useAuthGuard = () => {
  const { user, loading } = useAuth()
  
  return {
    isAuthenticated: !!user,
    isLoading: loading,
    user
  }
}