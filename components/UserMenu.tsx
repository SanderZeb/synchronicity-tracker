// components/UserMenu.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useClickOutside } from '../lib/hooks'
import {
  UserIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  ShieldCheckIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'

export default function UserMenu() {
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const menuRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false))

  const handleSignOut = async () => {
    try {
      setSigningOut(true)
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setSigningOut(false)
      setIsOpen(false)
    }
  }

  if (!user) return null

  // Get user initials for avatar
  const getInitials = (email: string) => {
    if (!email || email.length < 2) {
      return 'U'
    }
    
    const emailParts = email.split('@')
    if (emailParts.length === 0 || !emailParts[0]) {
      return email.slice(0, 2).toUpperCase()
    }
    
    const namePart = emailParts[0]
    const parts = namePart.split('.')
    
    if (parts.length >= 2) {
      const first = parts[0]?.charAt(0) || ''
      const second = parts[1]?.charAt(0) || ''
      if (first && second) {
        return (first + second).toUpperCase()
      }
    }
    
    return namePart.slice(0, 2).toUpperCase()
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-surface-secondary transition-colors duration-200 group"
      >
        {/* Avatar */}
        <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-soft group-hover:scale-105 transition-transform duration-200">
          {user.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt="Profile"
              className="w-full h-full rounded-xl object-cover"
            />
          ) : (
            getInitials(user.email || 'U')
          )}
        </div>

        {/* User Info */}
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-text-primary">
            {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
          </div>
          <div className="text-xs text-text-secondary">
            {user.email}
          </div>
        </div>

        {/* Chevron */}
        <ChevronDownIcon 
          className={`h-4 w-4 text-text-muted transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-strong border border-gray-200 overflow-hidden z-50 slide-up">
          {/* User Info Header */}
          <div className="p-4 bg-gradient-to-r from-primary-50 to-accent-50 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center text-white font-bold">
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                    className="w-full h-full rounded-xl object-cover"
                  />
                ) : (
                  getInitials(user.email || 'U')
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-text-primary truncate">
                  {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                </div>
                <div className="text-sm text-text-secondary truncate">
                  {user.email}
                </div>
                <div className="flex items-center space-x-1 mt-1">
                  <ShieldCheckIcon className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-surface-secondary transition-colors duration-200 text-left group">
              <UserIcon className="h-5 w-5 text-text-muted group-hover:text-primary-600" />
              <div>
                <div className="text-sm font-medium text-text-primary">Profile Settings</div>
                <div className="text-xs text-text-muted">Manage your account</div>
              </div>
            </button>

            <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-surface-secondary transition-colors duration-200 text-left group">
              <Cog6ToothIcon className="h-5 w-5 text-text-muted group-hover:text-primary-600" />
              <div>
                <div className="text-sm font-medium text-text-primary">Preferences</div>
                <div className="text-xs text-text-muted">Customize your experience</div>
              </div>
            </button>

            <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-surface-secondary transition-colors duration-200 text-left group">
              <EnvelopeIcon className="h-5 w-5 text-text-muted group-hover:text-primary-600" />
              <div>
                <div className="text-sm font-medium text-text-primary">Support</div>
                <div className="text-xs text-text-muted">Get help and feedback</div>
              </div>
            </button>
          </div>

          {/* Sign Out */}
          <div className="border-t border-gray-200 p-2">
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-50 transition-colors duration-200 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {signingOut ? (
                <div className="w-5 h-5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
              ) : (
                <ArrowRightOnRectangleIcon className="h-5 w-5 text-red-600" />
              )}
              <div>
                <div className="text-sm font-medium text-red-600">
                  {signingOut ? 'Signing out...' : 'Sign Out'}
                </div>
                <div className="text-xs text-red-400">End your cosmic session</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}