// app/auth/callback/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import LoadingSpinner from '../../../components/LoadingSpinner'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

export default function AuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the auth code from the URL
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          setStatus('error')
          setMessage(error.message || 'Authentication failed')
          return
        }

        if (data.session) {
          setStatus('success')
          setMessage('Successfully authenticated! Redirecting to your dashboard...')
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push('/')
          }, 2000)
        } else {
          setStatus('error')
          setMessage('No active session found. Please try signing in again.')
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error)
        setStatus('error')
        setMessage('An unexpected error occurred. Please try again.')
      }
    }

    handleAuthCallback()
  }, [router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <LoadingSpinner 
            size="xl" 
            message="Completing authentication..." 
            description="Verifying your cosmic credentials"
            variant="cosmic"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Status Icon */}
        <div className="relative">
          <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mx-auto shadow-strong ${
            status === 'success' 
              ? 'bg-gradient-to-r from-green-500 to-green-600' 
              : 'bg-gradient-to-r from-red-500 to-red-600'
          }`}>
            {status === 'success' ? (
              <CheckCircleIcon className="h-12 w-12 text-white" />
            ) : (
              <XCircleIcon className="h-12 w-12 text-white" />
            )}
          </div>
          <div className={`absolute inset-0 w-24 h-24 rounded-2xl animate-ping opacity-20 mx-auto ${
            status === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`} />
        </div>

        {/* Content */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-text-primary">
            {status === 'success' ? 'Authentication Complete!' : 'Authentication Failed'}
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          {status === 'error' && (
            <button
              onClick={() => router.push('/')}
              className="w-full btn-primary text-lg py-4"
            >
              Return to Home
            </button>
          )}
          
          {status === 'success' && (
            <div className="text-sm text-text-muted">
              Redirecting automatically in 2 seconds...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}