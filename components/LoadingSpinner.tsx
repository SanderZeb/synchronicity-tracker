'use client'

import { SparklesIcon } from '@heroicons/react/24/outline'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  message?: string
  description?: string
  variant?: 'cosmic' | 'synchro' | 'simple'
}

export default function LoadingSpinner({ 
  size = 'md', 
  message = 'Loading...', 
  description,
  variant = 'cosmic'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }

  if (variant === 'simple') {
    return (
      <div className="flex items-center justify-center space-x-2">
        <div className={`${sizeClasses[size]} border-2 border-cosmic-300 border-t-cosmic-600 rounded-full animate-spin`} />
        {message && <span className={`${textSizeClasses[size]} text-gray-600`}>{message}</span>}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {variant === 'cosmic' ? (
        <div className="relative">
          {/* Main spinner */}
          <SparklesIcon className={`${sizeClasses[size]} text-cosmic-500 animate-spin`} />
          
          {/* Pulsing background effect */}
          <div className={`absolute inset-0 ${sizeClasses[size]} text-synchro-400 animate-ping opacity-30`}>
            <SparklesIcon className={sizeClasses[size]} />
          </div>
          
          {/* Rotating rings */}
          <div className={`absolute inset-0 ${sizeClasses[size]} border-2 border-transparent border-t-cosmic-400 border-r-synchro-400 rounded-full animate-spin`} 
               style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
        </div>
      ) : (
        <div className="relative">
          {/* Synchro variant with gradient */}
          <div className={`${sizeClasses[size]} bg-gradient-to-r from-synchro-400 to-cosmic-400 rounded-full animate-pulse`} />
          <SparklesIcon className={`absolute inset-0 ${sizeClasses[size]} text-white animate-spin`} />
        </div>
      )}
      
      {/* Text content */}
      <div className="text-center space-y-2">
        <div className={`${textSizeClasses[size]} font-semibold text-gray-700`}>
          {message}
        </div>
        {description && (
          <div className="text-sm text-gray-500 max-w-xs">
            {description}
          </div>
        )}
      </div>
      
      {/* Animated dots */}
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-cosmic-400 rounded-full animate-pulse"
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
    </div>
  )
}

export const LoadingOverlay = ({ 
  isLoading, 
  children, 
  message = 'Loading...', 
  description 
}: {
  isLoading: boolean
  children: React.ReactNode
  message?: string
  description?: string
}) => {
  if (!isLoading) return <>{children}</>

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <LoadingSpinner 
          size="lg" 
          message={message} 
          description={description}
          variant="cosmic"
        />
      </div>
    </div>
  )
}

export const LoadingCard = ({ 
  className = '',
  animate = true 
}: { 
  className?: string
  animate?: boolean 
}) => (
  <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
    <div className="space-y-4">
      <div className={`h-4 bg-gray-200 rounded w-3/4 ${animate ? 'shimmer' : ''}`} />
      <div className={`h-8 bg-gray-200 rounded w-1/2 ${animate ? 'shimmer' : ''}`} />
      <div className="space-y-2">
        <div className={`h-3 bg-gray-200 rounded ${animate ? 'shimmer' : ''}`} />
        <div className={`h-3 bg-gray-200 rounded w-5/6 ${animate ? 'shimmer' : ''}`} />
      </div>
    </div>
  </div>
)