'use client'

import React from 'react'
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

const DefaultErrorFallback = ({ 
  error, 
  resetError 
}: { 
  error?: Error
  resetError: () => void 
}) => (
  <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
    <div className="max-w-md w-full text-center space-y-6">
      {/* Error Icon */}
      <div className="relative">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <ExclamationTriangleIcon className="h-10 w-10 text-red-600" />
        </div>
        <div className="absolute inset-0 w-20 h-20 bg-red-200 rounded-full animate-ping opacity-20 mx-auto" />
      </div>

      {/* Error Content */}
      <div className="space-y-3">
        <h1 className="text-2xl font-bold text-gray-900">
          Oops! Something went wrong
        </h1>
        <p className="text-gray-600">
          The synchronicity tracker encountered an unexpected error. Don't worry, your cosmic data is safe.
        </p>
        
        {error && process.env.NODE_ENV === 'development' && (
          <details className="text-left bg-red-50 p-4 rounded-lg border border-red-200 text-sm">
            <summary className="cursor-pointer font-medium text-red-800 mb-2">
              Error Details (Development)
            </summary>
            <pre className="text-red-700 whitespace-pre-wrap break-words">
              {error.name}: {error.message}
              {error.stack}
            </pre>
          </details>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={resetError}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg font-medium hover:from-primary-700 hover:to-accent-700 transition-all duration-200 transform hover:scale-105"
        >
          <ArrowPathIcon className="h-5 w-5" />
          <span>Try Again</span>
        </button>
        
        <button
          onClick={() => window.location.reload()}
          className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors duration-200"
        >
          Refresh Page
        </button>
      </div>

      {/* Help Text */}
      <div className="text-sm text-gray-500">
        If this problem persists, try refreshing the page or clearing your browser cache.
      </div>
    </div>
  </div>
)

export default ErrorBoundary

// Hook for error handling in functional components
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: { componentStack?: string }) => {
    console.error('Application error:', error, errorInfo)
    // You could send this to an error reporting service here
  }
}

// Custom error classes
export class SynchronicityError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'SynchronicityError'
  }
}

export class DataValidationError extends SynchronicityError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR')
    this.name = 'DataValidationError'
  }
}

export class DatabaseError extends SynchronicityError {
  constructor(message: string) {
    super(message, 'DATABASE_ERROR')
    this.name = 'DatabaseError'
  }
}