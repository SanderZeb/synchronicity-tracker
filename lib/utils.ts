import { SynchroData } from './supabase'
import { format, parseISO, isValid } from 'date-fns'

/**
 * Format date string to readable format
 */
export const formatDate = (dateStr: string | undefined, formatString: string = 'MMM dd, yyyy'): string => {
  if (!dateStr) return 'N/A'
  try {
    const date = parseISO(dateStr)
    if (!isValid(date)) return dateStr
    return format(date, formatString)
  } catch {
    return dateStr
  }
}

/**
 * Calculate average for a numeric field across data entries
 */
export const calculateAverage = (data: SynchroData[], field: keyof SynchroData): number => {
  const validEntries = data.filter(d => d[field] != null)
  if (validEntries.length === 0) return 0
  
  const sum = validEntries.reduce((acc, d) => acc + (d[field] as number || 0), 0)
  return sum / validEntries.length
}

/**
 * Get color based on intensity/value
 */
export const getIntensityColor = (value: number | undefined, max: number = 10): string => {
  if (!value) return 'bg-gray-100 text-gray-400'
  const intensity = value / max
  
  if (intensity >= 0.8) return 'bg-green-500 text-white'
  if (intensity >= 0.6) return 'bg-green-400 text-white'
  if (intensity >= 0.4) return 'bg-yellow-400 text-gray-800'
  if (intensity >= 0.2) return 'bg-orange-400 text-white'
  return 'bg-red-400 text-white'
}

/**
 * Get text color class based on value
 */
export const getValueTextColor = (value: number | undefined, max: number = 10): string => {
  if (!value) return 'text-gray-400'
  const intensity = value / max
  
  if (intensity >= 0.8) return 'text-green-600'
  if (intensity >= 0.6) return 'text-green-500'
  if (intensity >= 0.4) return 'text-yellow-600'
  if (intensity >= 0.2) return 'text-orange-500'
  return 'text-red-500'
}

/**
 * Calculate streak of consecutive days above threshold
 */
export const calculateStreak = (data: SynchroData[], field: keyof SynchroData, threshold: number = 5): number => {
  const sortedData = data
    .filter(d => d.date && d[field] != null)
    .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())
  
  let streak = 0
  for (const entry of sortedData) {
    if ((entry[field] as number || 0) >= threshold) {
      streak++
    } else {
      break
    }
  }
  return streak
}

/**
 * Calculate trend between two periods
 */
export const calculateTrend = (data: SynchroData[], field: keyof SynchroData, daysRecent: number = 7): number => {
  const sortedData = data
    .filter(d => d.date && d[field] != null)
    .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())
  
  const recent = sortedData.slice(0, daysRecent)
  const previous = sortedData.slice(daysRecent, daysRecent * 2)
  
  const recentAvg = calculateAverage(recent, field)
  const previousAvg = calculateAverage(previous, field)
  
  return recentAvg - previousAvg
}

/**
 * Get most common synchronicity times
 */
export const getTopSynchroTimes = (data: SynchroData[], limit: number = 5) => {
  const timeColumns = [
    '00:00', '01:01', '02:02', '03:03', '04:04', '05:05', '06:06', 
    '07:07', '08:08', '09:09', '10:10', '11:11', '12:12',
    '13:13', '14:14', '15:15', '16:16', '17:17', '18:18',
    '19:19', '20:20', '21:21', '22:22', '23:23'
  ]

  const timeTotals = timeColumns.map(time => ({
    time,
    total: data.reduce((sum, d) => sum + (d[time as keyof SynchroData] as number || 0), 0)
  }))

  return timeTotals
    .sort((a, b) => b.total - a.total)
    .slice(0, limit)
}

/**
 * Generate weekly pattern data
 */
export const getWeeklyPattern = (data: SynchroData[], field: keyof SynchroData = 'subjectiveSynchro') => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  
  return days.map(day => {
    const dayData = data.filter(d => d.day_of_the_week === day)
    const average = calculateAverage(dayData, field)
    
    return {
      day: day.slice(0, 3),
      fullDay: day,
      value: average,
      count: dayData.length
    }
  })
}

/**
 * Export data to CSV format
 */
export const exportToCSV = (data: SynchroData[], filename?: string): void => {
  if (data.length === 0) return
  
  const headers = Object.keys(data[0]).join(',')
  const rows = data.map(row => 
    Object.values(row).map(value => 
      typeof value === 'string' ? `"${value}"` : value || ''
    ).join(',')
  )
  
  const csvContent = [headers, ...rows].join('\n')
  downloadFile(csvContent, filename || `synchronicity-data-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv')
}

/**
 * Export data to JSON format
 */
export const exportToJSON = (data: SynchroData[], filename?: string): void => {
  const jsonContent = JSON.stringify(data, null, 2)
  downloadFile(jsonContent, filename || `synchronicity-data-${new Date().toISOString().split('T')[0]}.json`, 'application/json')
}

/**
 * Download file helper
 */
const downloadFile = (content: string, filename: string, contentType: string): void => {
  const blob = new Blob([content], { type: contentType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Validate form data
 */
export const validateSynchroData = (data: Partial<SynchroData>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (!data.date) {
    errors.push('Date is required')
  }
  
  if (data.subjectiveSynchro != null && (data.subjectiveSynchro < 0 || data.subjectiveSynchro > 10)) {
    errors.push('Synchronicity level must be between 0 and 10')
  }
  
  if (data.subjectiveMood != null && (data.subjectiveMood < 0 || data.subjectiveMood > 10)) {
    errors.push('Mood must be between 0 and 10')
  }
  
  if (data.productivity != null && (data.productivity < 0 || data.productivity > 10)) {
    errors.push('Productivity must be between 0 and 10')
  }
  
  if (data.sleepAvg != null && (data.sleepAvg < 0 || data.sleepAvg > 24)) {
    errors.push('Sleep hours must be between 0 and 24')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Calculate synchronicity sum from time slots
 */
export const calculateSynchroSum = (data: Partial<SynchroData>): number => {
  const timeSlots = [
    '00:00', '01:01', '02:02', '03:03', '04:04', '05:05', '06:06', 
    '07:07', '08:08', '09:09', '10:10', '11:11', '12:12',
    '13:13', '14:14', '15:15', '16:16', '17:17', '18:18',
    '19:19', '20:20', '21:21', '22:22', '23:23'
  ]
  
  return timeSlots.reduce((sum, time) => {
    return sum + (data[time as keyof SynchroData] as number || 0)
  }, 0)
}

/**
 * Get insight text based on value
 */
export const getInsightText = (value: number, type: 'synchronicity' | 'mood' | 'productivity'): string => {
  const level = value >= 8 ? 'high' : value >= 6 ? 'good' : value >= 4 ? 'moderate' : value >= 2 ? 'low' : 'very low'
  
  const insights = {
    synchronicity: {
      'high': 'You\'re highly attuned to cosmic patterns',
      'good': 'Strong connection with synchronicity',
      'moderate': 'Developing synchronicity awareness',
      'low': 'Limited synchronicity perception',
      'very low': 'Beginning synchronicity journey'
    },
    mood: {
      'high': 'Excellent emotional state',
      'good': 'Positive emotional well-being',
      'moderate': 'Balanced emotional state',
      'low': 'Some emotional challenges',
      'very low': 'Significant emotional concerns'
    },
    productivity: {
      'high': 'Exceptionally productive period',
      'good': 'Strong productivity levels',
      'moderate': 'Steady productivity',
      'low': 'Productivity challenges',
      'very low': 'Significant productivity issues'
    }
  }
  
  return insights[type][level]
}

/**
 * Generate color palette for charts
 */
export const getChartColors = () => ({
  cosmic: '#0ea5e9',
  synchro: '#d946ef',
  green: '#22c55e',
  orange: '#f59e0b',
  purple: '#8b5cf6',
  red: '#ef4444',
  blue: '#3b82f6',
  yellow: '#eab308'
})

/**
 * Format number with appropriate precision
 */
export const formatNumber = (value: number | undefined, decimals: number = 1): string => {
  if (value == null) return 'N/A'
  return value.toFixed(decimals)
}

/**
 * Get moon phase emoji
 */
export const getMoonPhaseEmoji = (phase: string | undefined): string => {
  if (!phase) return '🌙'
  
  const phases: Record<string, string> = {
    'new': '🌑',
    'waxing crescent': '🌒',
    'first quarter': '🌓',
    'waxing gibbous': '🌔',
    'full': '🌕',
    'waning gibbous': '🌖',
    'last quarter': '🌗',
    'waning crescent': '🌘'
  }
  
  return phases[phase.toLowerCase()] || '🌙'
}