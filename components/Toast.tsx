'use client'

import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  XCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  success: (message: string, options?: Partial<Omit<Toast, 'id' | 'type'>>) => string
  error: (message: string, options?: Partial<Omit<Toast, 'id' | 'type'>>) => string
  warning: (message: string, options?: Partial<Omit<Toast, 'id' | 'type'>>) => string
  info: (message: string, options?: Partial<Omit<Toast, 'id' | 'type'>>) => string
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast
    }

    setToasts(prev => [...prev, newToast])

    // Auto remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const success = useCallback((message: string, options?: Partial<Omit<Toast, 'id' | 'type'>>) => {
    return addToast({ type: 'success', message, ...options })
  }, [addToast])

  const error = useCallback((message: string, options?: Partial<Omit<Toast, 'id' | 'type'>>) => {
    return addToast({ type: 'error', message, duration: 7000, ...options })
  }, [addToast])

  const warning = useCallback((message: string, options?: Partial<Omit<Toast, 'id' | 'type'>>) => {
    return addToast({ type: 'warning', message, ...options })
  }, [addToast])

  const info = useCallback((message: string, options?: Partial<Omit<Toast, 'id' | 'type'>>) => {
    return addToast({ type: 'info', message, ...options })
  }, [addToast])

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

const ToastContainer = ({ 
  toasts, 
  onRemove 
}: { 
  toasts: Toast[]
  onRemove: (id: string) => void 
}) => {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

const ToastItem = ({ 
  toast, 
  onRemove 
}: { 
  toast: Toast
  onRemove: (id: string) => void 
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const handleRemove = useCallback(() => {
    setIsLeaving(true)
    setTimeout(() => onRemove(toast.id), 300)
  }, [toast.id, onRemove])

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />
      case 'error':
        return <XCircleIcon className="h-6 w-6 text-red-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-orange-500" />
      case 'info':
        return <InformationCircleIcon className="h-6 w-6 text-blue-500" />
    }
  }

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-orange-50 border-orange-200'
      case 'info':
        return 'bg-blue-50 border-blue-200'
    }
  }

  const getTextColor = () => {
    switch (toast.type) {
      case 'success':
        return 'text-green-800'
      case 'error':
        return 'text-red-800'
      case 'warning':
        return 'text-orange-800'
      case 'info':
        return 'text-blue-800'
    }
  }

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        ${isVisible && !isLeaving 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
        }
        ${getBackgroundColor()}
        border rounded-lg shadow-lg backdrop-blur-sm p-4 pointer-events-auto
      `}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="flex-shrink-0 pt-0.5">
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${getTextColor()}`}>
            {toast.message}
          </p>
          {toast.description && (
            <p className={`text-sm mt-1 ${getTextColor()} opacity-75`}>
              {toast.description}
            </p>
          )}
          {toast.action && (
            <button
              onClick={() => {
                toast.action!.onClick()
                handleRemove()
              }}
              className={`text-sm font-medium mt-2 hover:underline ${getTextColor()}`}
            >
              {toast.action.label}
            </button>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={handleRemove}
          className={`
            flex-shrink-0 p-1 rounded-md transition-colors duration-200
            ${getTextColor()} hover:bg-black/10
          `}
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Progress bar for timed toasts */}
      {toast.duration && toast.duration > 0 && (
        <div className="mt-3 bg-black/20 rounded-full h-1 overflow-hidden">
          <div 
            className={`h-full transition-all ease-linear ${
              toast.type === 'success' ? 'bg-green-500' :
              toast.type === 'error' ? 'bg-red-500' :
              toast.type === 'warning' ? 'bg-orange-500' :
              'bg-blue-500'
            }`}
            style={{
              width: '100%',
              animation: `shrink ${toast.duration}ms linear forwards`
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}

// Hook for using toast in components without provider
export const useToastWithFallback = () => {
  try {
    return useToast()
  } catch {
    // Fallback implementation if no provider
    return {
      addToast: () => '',
      removeToast: () => {},
      success: (message: string) => console.log('Success:', message),
      error: (message: string) => console.error('Error:', message),
      warning: (message: string) => console.warn('Warning:', message),
      info: (message: string) => console.info('Info:', message)
    }
  }
}

// Pre-built toast messages for common scenarios
export const ToastMessages = {
  DATA_SAVED: 'Entry saved successfully!',
  DATA_UPDATED: 'Entry updated successfully!',
  DATA_DELETED: 'Entry deleted successfully!',
  DATA_EXPORTED: 'Data exported successfully!',
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  VALIDATION_ERROR: 'Please check your input values.',
  UNEXPECTED_ERROR: 'An unexpected error occurred. Please try again.',
  LOADING: 'Loading your synchronicity data...',
  SYNC_SUCCESS: 'Data synchronized successfully!',
  OFFLINE_MODE: 'You are currently offline. Changes will be synced when connection is restored.',
  UPDATE_AVAILABLE: 'A new version is available. Refresh to update.',
  SHORTCUT_HINT: 'Tip: Use Ctrl+N to quickly add a new entry!'
} as const

export default ToastProvider