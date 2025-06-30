// components/AuthGuard.tsx
'use client'

import { useState, useEffect } from 'react'
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

  // Add this debug function
  const handleShowAuth = () => {
    console.log('🚀 onShowAuth called - should open modal')
    console.log('Current showAuthModal state:', showAuthModal)
    setShowAuthModal(true)
    console.log('setShowAuthModal(true) called')
  }

  // Add this useEffect to monitor state changes
  useEffect(() => {
    console.log('🔄 showAuthModal state changed to:', showAuthModal)
  }, [showAuthModal])

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
        {fallback || <LoginPrompt onShowAuth={handleShowAuth} />}
        {/* Add debug info */}
        <div style={{position: 'fixed', top: 0, right: 0, background: 'black', color: 'white', padding: '10px', zIndex: 9999}}>
          Modal State: {showAuthModal ? 'TRUE' : 'FALSE'}
        </div>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => {
            console.log('🔒 Closing modal')
            setShowAuthModal(false)
          }} 
        />
      </>
    )
  }

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