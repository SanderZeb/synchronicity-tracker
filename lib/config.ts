/**
 * Application configuration and constants
 */

// App metadata
export const APP_CONFIG = {
  name: 'Synchronicity Tracker',
  description: 'Track synchronicities, health metrics, and life patterns to discover cosmic connections',
  version: '2.0.0',
  author: 'Cosmic Developer',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://synchronicity-tracker.app',
  repository: 'https://github.com/your-username/synchronicity-tracker',
  support: 'https://github.com/your-username/synchronicity-tracker/issues'
} as const

// Time slots for synchronicity tracking
export const TIME_SLOTS = [
  '00:00', '01:01', '02:02', '03:03', '04:04', '05:05', '06:06', 
  '07:07', '08:08', '09:09', '10:10', '11:11', '12:12',
  '13:13', '14:14', '15:15', '16:16', '17:17', '18:18',
  '19:19', '20:20', '21:21', '22:22', '23:23'
] as const

export type TimeSlot = typeof TIME_SLOTS[number]

// Days of the week
export const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
] as const

export type DayOfWeek = typeof DAYS_OF_WEEK[number]

// Moon phases
export const MOON_PHASES = [
  'New Moon',
  'Waxing Crescent',
  'First Quarter',
  'Waxing Gibbous',
  'Full Moon',
  'Waning Gibbous',
  'Last Quarter',
  'Waning Crescent'
] as const

export type MoonPhase = typeof MOON_PHASES[number]

// Rating scales
export const RATING_SCALE = {
  min: 0,
  max: 10,
  step: 0.1,
  default: 5
} as const

// Chart colors
export const CHART_COLORS = {
  cosmic: '#0ea5e9',
  synchro: '#d946ef',
  green: '#22c55e',
  orange: '#f59e0b',
  purple: '#8b5cf6',
  red: '#ef4444',
  blue: '#3b82f6',
  yellow: '#eab308',
  gray: '#6b7280'
} as const

// Pagination settings
export const PAGINATION = {
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
  maxPageButtons: 5
} as const

// Animation durations (in milliseconds)
export const ANIMATIONS = {
  fast: 200,
  normal: 300,
  slow: 500,
  tooltip: 150
} as const

// Breakpoints for responsive design
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const

// Local storage keys
export const STORAGE_KEYS = {
  theme: 'synchronicity-theme',
  preferences: 'synchronicity-preferences',
  lastVisit: 'synchronicity-last-visit'
} as const

// Default form values
export const DEFAULT_FORM_VALUES = {
  subjectiveSynchro: RATING_SCALE.default,
  subjectiveMood: RATING_SCALE.default,
  productivity: RATING_SCALE.default,
  stateHealth: RATING_SCALE.default,
  stateRelationship: RATING_SCALE.default,
  stateSelfesteem: RATING_SCALE.default,
  stateInteligence: RATING_SCALE.default,
  stateSocialSkill: RATING_SCALE.default,
  stateImmerse: RATING_SCALE.default,
  stres: RATING_SCALE.default
} as const

// Validation rules
export const VALIDATION_RULES = {
  rating: {
    min: RATING_SCALE.min,
    max: RATING_SCALE.max
  },
  sleep: {
    min: 0,
    max: 24
  },
  weight: {
    min: 0,
    max: 1000
  },
  heartRate: {
    min: 30,
    max: 220
  },
  steps: {
    min: 0,
    max: 100000
  },
  calories: {
    min: 0,
    max: 10000
  }
} as const

// Feature flags
export const FEATURES = {
  exportData: true,
  darkMode: true,
  notifications: false,
  analytics: true,
  pwa: true,
  offlineMode: false
} as const

// Environment validation
export const ENV_VARS = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NODE_ENV: process.env.NODE_ENV
} as const

// Validate required environment variables
export const validateEnvironment = (): void => {
  const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'] as const
  
  for (const key of required) {
    if (!ENV_VARS[key]) {
      throw new Error(`Missing required environment variable: NEXT_PUBLIC_${key}`)
    }
  }
}

// App themes
export const THEMES = {
  light: {
    name: 'Light',
    background: 'from-cosmic-50 via-white to-synchro-50',
    text: 'text-gray-900',
    card: 'bg-white'
  },
  dark: {
    name: 'Dark',
    background: 'from-gray-900 via-gray-800 to-gray-900',
    text: 'text-white',
    card: 'bg-gray-800'
  }
} as const

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  DATABASE_ERROR: 'Database operation failed. Please try again.',
  VALIDATION_ERROR: 'Please check your input values.',
  NOT_FOUND: 'The requested data was not found.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  RATE_LIMIT: 'Too many requests. Please wait a moment and try again.'
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  DATA_SAVED: 'Entry saved successfully!',
  DATA_UPDATED: 'Entry updated successfully!',
  DATA_DELETED: 'Entry deleted successfully!',
  DATA_EXPORTED: 'Data exported successfully!'
} as const

// Insights thresholds
export const INSIGHTS = {
  synchronicity: {
    high: 8,
    good: 6,
    moderate: 4,
    low: 2
  },
  streak: {
    excellent: 14,
    good: 7,
    moderate: 3
  },
  trend: {
    significant: 1.5,
    moderate: 0.5
  }
} as const

// Chart configuration
export const CHART_CONFIG = {
  heatmap: {
    cellSize: 32,
    gap: 2,
    colors: {
      empty: '#f3f4f6',
      levels: ['#ddd6fe', '#c4b5fd', '#a78bfa', '#8b5cf6', '#7c3aed']
    }
  },
  timeline: {
    strokeWidth: 3,
    dotRadius: 4,
    gridColor: '#f0f0f0'
  },
  bar: {
    borderRadius: 4,
    opacity: 0.8
  }
} as const

// Export formats
export const EXPORT_FORMATS = {
  json: {
    name: 'JSON',
    extension: '.json',
    mimeType: 'application/json',
    description: 'Structured data format'
  },
  csv: {
    name: 'CSV',
    extension: '.csv',
    mimeType: 'text/csv',
    description: 'Spreadsheet compatible'
  }
} as const

// Application limits
export const LIMITS = {
  maxEntriesPerPage: 100,
  maxSearchResults: 500,
  maxExportEntries: 10000,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxImageSize: 2 * 1024 * 1024   // 2MB
} as const

// Performance monitoring
export const PERFORMANCE = {
  enableMetrics: process.env.NODE_ENV === 'production',
  slowQueryThreshold: 2000, // 2 seconds
  errorReportingEnabled: process.env.NODE_ENV === 'production'
} as const