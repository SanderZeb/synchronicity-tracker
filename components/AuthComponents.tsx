// components/AuthComponents.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  EyeIcon, 
  EyeSlashIcon, 
  EnvelopeIcon, 
  LockClosedIcon,
  UserIcon,
  SparklesIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface AuthFormData {
  email: string
  password: string
  confirmPassword?: string
}

interface AuthFormErrors {
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

export const AuthModal = ({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean
  onClose: () => void 
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login')
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<AuthFormErrors>({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const { signIn, signUp, resetPassword } = useAuth()

  const validateForm = (): boolean => {
    const newErrors: AuthFormErrors = {}

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Password validation (not for reset)
    if (mode !== 'reset') {
      if (!formData.password) {
        newErrors.password = 'Password is required'
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters'
      }

      // Confirm password validation (only for signup)
      if (mode === 'signup') {
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = 'Please confirm your password'
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match'
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setMessage(null)
    setErrors({})

    try {
      if (mode === 'login') {
        const { error } = await signIn(formData.email, formData.password)
        if (error) {
          setErrors({ general: error.message })
        } else {
          onClose()
        }
      } else if (mode === 'signup') {
        const { error } = await signUp(formData.email, formData.password)
        if (error) {
          setErrors({ general: error.message })
        } else {
          setMessage({ 
            type: 'success', 
            text: 'Account created! Please check your email to verify your account.' 
          })
        }
      } else if (mode === 'reset') {
        const { error } = await resetPassword(formData.email)
        if (error) {
          setErrors({ general: error.message })
        } else {
          setMessage({ 
            type: 'success', 
            text: 'Password reset instructions sent to your email.' 
          })
        }
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleFieldChange = (field: keyof AuthFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear specific field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
    // Clear general error
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }))
    }
  }

  const resetForm = () => {
    setFormData({ email: '', password: '', confirmPassword: '' })
    setErrors({})
    setMessage(null)
  }

  const switchMode = (newMode: 'login' | 'signup' | 'reset') => {
    setMode(newMode)
    resetForm()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-strong max-w-md w-full overflow-hidden scale-in">
        {/* Header */}
        <div className="bg-gradient-primary p-8 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full transform translate-x-16 -translate-y-16" />
          <div className="relative">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <SparklesIcon className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {mode === 'login' && 'Welcome Back'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'reset' && 'Reset Password'}
            </h2>
            <p className="text-white/80 text-sm">
              {mode === 'login' && 'Sign in to access your synchronicity journey'}
              {mode === 'signup' && 'Join the cosmic consciousness tracking community'}
              {mode === 'reset' && 'Enter your email to reset your password'}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="p-8">
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.type === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              ) : (
                <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
              )}
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary">
                Email Address
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-muted" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  className={`pl-10 input-field ${errors.email ? 'input-error' : ''}`}
                  placeholder="your.email@example.com"
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs flex items-center space-x-1">
                  <ExclamationCircleIcon className="h-3 w-3" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Password Field (not for reset) */}
            {mode !== 'reset' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">
                  Password
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleFieldChange('password', e.target.value)}
                    className={`pl-10 pr-10 input-field ${errors.password ? 'input-error' : ''}`}
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs flex items-center space-x-1">
                    <ExclamationCircleIcon className="h-3 w-3" />
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>
            )}

            {/* Confirm Password Field (only for signup) */}
            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">
                  Confirm Password
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword || ''}
                    onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                    className={`pl-10 input-field ${errors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="Confirm your password"
                    disabled={loading}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs flex items-center space-x-1">
                    <ExclamationCircleIcon className="h-3 w-3" />
                    <span>{errors.confirmPassword}</span>
                  </p>
                )}
              </div>
            )}

            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
                  <p className="text-sm">{errors.general}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center space-x-3 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                loading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-primary text-white hover:shadow-medium transform hover:scale-105'
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'login' && 'Sign In'}
                    {mode === 'signup' && 'Create Account'}
                    {mode === 'reset' && 'Send Reset Link'}
                  </span>
                  <ArrowRightIcon className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Mode Switching */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center space-y-3">
            {mode === 'login' && (
              <>
                <p className="text-sm text-text-secondary">
                  Don't have an account?{' '}
                  <button
                    onClick={() => switchMode('signup')}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Sign up
                  </button>
                </p>
                <p className="text-sm text-text-secondary">
                  Forgot your password?{' '}
                  <button
                    onClick={() => switchMode('reset')}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Reset it
                  </button>
                </p>
              </>
            )}
            {mode === 'signup' && (
              <p className="text-sm text-text-secondary">
                Already have an account?{' '}
                <button
                  onClick={() => switchMode('login')}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Sign in
                </button>
              </p>
            )}
            {mode === 'reset' && (
              <p className="text-sm text-text-secondary">
                Remember your password?{' '}
                <button
                  onClick={() => switchMode('login')}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>

          {/* Close Button */}
          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-primary text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const LoginPrompt = ({ onShowAuth }: { onShowAuth: () => void }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo/Icon */}
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto shadow-strong">
            <SparklesIcon className="h-12 w-12 text-white" />
          </div>
          <div className="absolute inset-0 w-24 h-24 bg-primary-200 rounded-2xl animate-ping opacity-20 mx-auto" />
        </div>

        {/* Content */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-text-primary">
            Welcome to Synchronicity Tracker
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed">
            Discover patterns and insights in your cosmic journey. Track synchronicities, 
            health metrics, and life patterns to unlock the hidden connections in your daily experience.
          </p>
          
          <div className="grid grid-cols-3 gap-4 py-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <UserIcon className="h-6 w-6 text-primary-600" />
              </div>
              <p className="text-sm text-text-secondary">Personal Journey</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <SparklesIcon className="h-6 w-6 text-accent-600" />
              </div>
              <p className="text-sm text-text-secondary">Pattern Recognition</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-sm text-text-secondary">Data Security</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-4">
          <button
            onClick={onShowAuth}
            className="w-full btn-primary text-lg py-4 hover:scale-105 transform transition-all duration-200"
          >
            <span>Start Your Journey</span>
            <ArrowRightIcon className="h-5 w-5 ml-2" />
          </button>
          
          <p className="text-xs text-text-muted">
            Your data is securely stored and only accessible by you
          </p>
        </div>
      </div>
    </div>
  )
}