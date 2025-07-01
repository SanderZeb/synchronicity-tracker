import { SynchroData } from './supabase'
import { format, parseISO, isValid, startOfWeek, startOfMonth, startOfYear } from 'date-fns'

/**
 * Convert sleep from minutes to hours for display
 */
export const convertSleepToHours = (minutes: number | undefined): number => {
  return minutes ? minutes / 60 : 0
}

/**
 * Convert sleep from hours to minutes for storage
 */
export const convertSleepToMinutes = (hours: number | undefined): number => {
  return hours ? hours * 60 : 0
}

/**
 * Format date string to readable format
 */
export const formatDate = (dateStr: string | undefined, formatString: string = 'MMM dd, yyyy'): string => {
  if (!dateStr) return 'N/A'
  try {
    const date = parseISO(dateStr)
    if (!isValid(date) || isNaN(date.getTime())) return dateStr
    return format(date, formatString)
  } catch {
    return dateStr
  }
}

/**
 * Calculate average for a numeric field across data entries (with sleep conversion)
 * Updated for integer 1-5 scale
 */
export const calculateAverage = (data: SynchroData[], field: keyof SynchroData): number => {
  const validEntries = data.filter(d => d[field] != null)
  if (validEntries.length === 0) return 0
  
  const sum = validEntries.reduce((acc, d) => {
    const value = d[field] as number || 0
    if (field === 'sleepavg') {
      return acc + convertSleepToHours(value)
    }
    return acc + value
  }, 0)
  return sum / validEntries.length
}

/**
 * Get color class based on intensity/value for integer 1-5 scale
 */
export const getIntensityColor = (value: number | undefined): string => {
  if (!value) return 'bg-gray-100 text-text-muted'
  
  if (value === 5) return 'bg-green-600 text-white'
  if (value === 4) return 'bg-green-500 text-white'
  if (value === 3) return 'bg-yellow-500 text-gray-800'
  if (value === 2) return 'bg-orange-500 text-white'
  if (value === 1) return 'bg-red-500 text-white'
  return 'bg-gray-100 text-text-muted'
}

/**
 * Get text color class based on value for integer 1-5 scale
 */
export const getValueTextColor = (value: number | undefined): string => {
  if (!value) return 'text-text-muted'
  
  if (value === 5) return 'text-green-600'
  if (value === 4) return 'text-green-500'
  if (value === 3) return 'text-yellow-600'
  if (value === 2) return 'text-orange-500'
  if (value === 1) return 'text-red-500'
  return 'text-text-muted'
}

/**
 * Calculate streak of consecutive days above threshold (updated for integer 1-5 scale)
 */
export const calculateStreak = (data: SynchroData[], field: keyof SynchroData, threshold: number = 3): number => {
  const sortedData = data
    .filter(d => d.date && d[field] != null)
    .sort((a, b) => {
      if (!a.date || !b.date) return 0
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      if (isNaN(dateA) || isNaN(dateB)) return 0
      return dateB - dateA
    })
  
  let streak = 0
  for (const entry of sortedData) {
    const value = field === 'sleepavg' ? convertSleepToHours(entry[field] as number) : entry[field] as number
    if ((value || 0) >= threshold) {
      streak++
    } else {
      break
    }
  }
  return streak
}

/**
 * Calculate trend between two periods (updated for integer 1-5 scale)
 */
export const calculateTrend = (data: SynchroData[], field: keyof SynchroData, daysRecent: number = 7): number => {
  const sortedData = data
    .filter(d => d.date && d[field] != null)
    .sort((a, b) => {
      if (!a.date || !b.date) return 0
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      if (isNaN(dateA) || isNaN(dateB)) return 0
      return dateB - dateA
    })
  
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
    '01:01', '02:02', '03:03', '04:04', '05:05', '06:06', 
    '07:07', '08:08', '09:09', '10:10', '11:11', '12:12',
    '13:13', '14:14', '15:15', '16:16', '17:17', '18:18',
    '19:19', '20:20', '21:21', '22:22', '23:23', '00:00'
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
 * Generate weekly pattern data (updated for integer 1-5 scale)
 */
export const getWeeklyPattern = (data: SynchroData[], field: keyof SynchroData = 'subjectivesynchro') => {
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
 * Enhanced heatmap data aggregation functions
 */
export const aggregateDataByWeeks = (data: SynchroData[]) => {
  const weeklyData = new Map<string, { sum: number; count: number }>()
  
  data.filter(d => d.date && d.subjectivesynchro != null).forEach(d => {
    if (!d.date) return
    
    try {
      const date = new Date(d.date)
      if (isNaN(date.getTime())) return
      
      const weekStart = startOfWeek(date, { weekStartsOn: 1 })
      if (!weekStart || isNaN(weekStart.getTime())) return
      
      const weekKey = format(weekStart, 'yyyy-MM-dd')
      
      if (!weeklyData.has(weekKey)) {
        weeklyData.set(weekKey, { sum: 0, count: 0 })
      }
      
      const weekData = weeklyData.get(weekKey)
      if (weekData) {
        weekData.sum += d.subjectivesynchro || 0
        weekData.count++
      }
    } catch (error) {
      console.warn('Error processing date in aggregateDataByWeeks:', d.date, error)
    }
  })
  
  return Array.from(weeklyData.entries()).map(([week, data]) => ({
    period: week,
    average: data.count > 0 ? data.sum / data.count : 0,
    count: data.count
  }))
}

export const aggregateDataByMonths = (data: SynchroData[]) => {
  const monthlyData = new Map<string, { sum: number; count: number }>()
  
  data.filter(d => d.date && d.subjectivesynchro != null).forEach(d => {
    if (!d.date) return
    
    try {
      const date = new Date(d.date)
      if (isNaN(date.getTime())) return
      
      const monthStart = startOfMonth(date)
      if (!monthStart || isNaN(monthStart.getTime())) return
      
      const monthKey = format(monthStart, 'yyyy-MM')
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { sum: 0, count: 0 })
      }
      
      const monthData = monthlyData.get(monthKey)
      if (monthData) {
        monthData.sum += d.subjectivesynchro || 0
        monthData.count++
      }
    } catch (error) {
      console.warn('Error processing date in aggregateDataByMonths:', d.date, error)
    }
  })
  
  return Array.from(monthlyData.entries()).map(([month, data]) => ({
    period: month,
    average: data.count > 0 ? data.sum / data.count : 0,
    count: data.count
  }))
}

export const aggregateDataByYears = (data: SynchroData[]) => {
  const yearlyData = new Map<string, { sum: number; count: number }>()
  
  data.filter(d => d.date && d.subjectivesynchro != null).forEach(d => {
    if (!d.date) return
    
    try {
      const date = new Date(d.date)
      if (isNaN(date.getTime())) return
      
      const yearStart = startOfYear(date)
      if (!yearStart || isNaN(yearStart.getTime())) return
      
      const yearKey = format(yearStart, 'yyyy')
      
      if (!yearlyData.has(yearKey)) {
        yearlyData.set(yearKey, { sum: 0, count: 0 })
      }
      
      const yearData = yearlyData.get(yearKey)
      if (yearData) {
        yearData.sum += d.subjectivesynchro || 0
        yearData.count++
      }
    } catch (error) {
      console.warn('Error processing date in aggregateDataByYears:', d.date, error)
    }
  })
  
  return Array.from(yearlyData.entries()).map(([year, data]) => ({
    period: year,
    average: data.count > 0 ? data.sum / data.count : 0,
    count: data.count
  }))
}

export const aggregateDataByDayOfWeek = (data: SynchroData[]) => {
  const dayData = new Array(7).fill(null).map(() => ({ sum: 0, count: 0 }))
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  
  data.filter(d => d.day_of_the_week && d.subjectivesynchro != null).forEach(d => {
    const dayIndex = dayNames.indexOf(d.day_of_the_week!)
    if (dayIndex !== -1 && dayData[dayIndex]) {
      dayData[dayIndex].sum += d.subjectivesynchro || 0
      dayData[dayIndex].count++
    }
  })
  
  return dayData.map((data, index) => ({
    period: dayNames[index],
    average: data.count > 0 ? data.sum / data.count : 0,
    count: data.count
  }))
}

/**
 * Validate form data (updated for integer 1-5 scale)
 */
export const validateSynchroData = (data: Partial<SynchroData>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (!data.date) {
    errors.push('Date is required')
  }
  
  const scaleFields: (keyof SynchroData)[] = [
    'subjectivesynchro', 'subjectivemood', 'productivity', 'statehealth', 
    'staterelationship', 'stateselfesteem', 'stateinteligence', 
    'statesocialskill', 'stateimmerse', 'stres'
  ]
  
  scaleFields.forEach(field => {
    const value = data[field] as number
    if (value != null && (value < 1 || value > 5 || !Number.isInteger(value))) {
      errors.push(`${String(field)} must be an integer between 1 and 5`)
    }
  })

  const timeSlots = [
    '01:01', '02:02', '03:03', '04:04', '05:05', '06:06', 
    '07:07', '08:08', '09:09', '10:10', '11:11', '12:12',
    '13:13', '14:14', '15:15', '16:16', '17:17', '18:18',
    '19:19', '20:20', '21:21', '22:22', '23:23', '00:00'
  ]
  
  timeSlots.forEach(slot => {
    const value = data[slot as keyof SynchroData] as number
    if (value != null && (value < 1 || value > 5 || !Number.isInteger(value))) {
      errors.push(`${slot} must be an integer between 1 and 5`)
    }
  })
  
  if (data.sleepavg != null && (data.sleepavg < 0 || data.sleepavg > 16)) {
    errors.push('Sleep hours must be between 0 and 16')
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
    '01:01', '02:02', '03:03', '04:04', '05:05', '06:06', 
    '07:07', '08:08', '09:09', '10:10', '11:11', '12:12',
    '13:13', '14:14', '15:15', '16:16', '17:17', '18:18',
    '19:19', '20:20', '21:21', '22:22', '23:23', '00:00'
  ]
  
  return timeSlots.reduce((sum, time) => {
    return sum + (data[time as keyof SynchroData] as number || 0)
  }, 0)
}

/**
 * Get insight text based on integer value (updated for 1-5 scale)
 */
export const getInsightText = (value: number, type: 'synchronicity' | 'mood' | 'productivity'): string => {
  let level: 'excellent' | 'good' | 'moderate' | 'low' | 'very low'
  
  if (value === 5) level = 'excellent'
  else if (value === 4) level = 'good'
  else if (value === 3) level = 'moderate'
  else if (value === 2) level = 'low'
  else level = 'very low'
  
  const insights = {
    synchronicity: {
      'excellent': 'Highly attuned to cosmic patterns',
      'good': 'Strong synchronicity awareness',
      'moderate': 'Developing pattern recognition',
      'low': 'Limited pattern perception',
      'very low': 'Beginning awareness journey'
    },
    mood: {
      'excellent': 'Exceptional emotional state',
      'good': 'Positive well-being',
      'moderate': 'Balanced emotional state',
      'low': 'Some emotional challenges',
      'very low': 'Significant emotional concerns'
    },
    productivity: {
      'excellent': 'Peak performance achieved',
      'good': 'High productivity levels',
      'moderate': 'Steady productivity',
      'low': 'Productivity challenges',
      'very low': 'Significant focus issues'
    }
  }
  
  return insights[type][level]
}

/**
 * Get status color based on integer value (updated for 1-5 scale)
 */
export const getStatusColor = (value: number | undefined, type: 'dot' | 'text' | 'bg' = 'dot'): string => {
  if (value == null) return type === 'dot' ? 'bg-gray-300' : type === 'text' ? 'text-text-muted' : 'bg-gray-100'
  
  let level: 'excellent' | 'high' | 'medium' | 'low' | 'critical'
  if (value === 5) level = 'excellent'
  else if (value === 4) level = 'high'
  else if (value === 3) level = 'medium'
  else if (value === 2) level = 'low'
  else level = 'critical'
  
  const colors = {
    dot: {
      excellent: 'bg-green-600',
      high: 'bg-green-500',
      medium: 'bg-yellow-500',
      low: 'bg-orange-500',
      critical: 'bg-red-500'
    },
    text: {
      excellent: 'text-green-700',
      high: 'text-green-600',
      medium: 'text-yellow-600',
      low: 'text-orange-600',
      critical: 'text-red-600'
    },
    bg: {
      excellent: 'bg-green-50 text-green-800',
      high: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-50 text-yellow-800',
      low: 'bg-orange-50 text-orange-800',
      critical: 'bg-red-50 text-red-800'
    }
  }
  
  return colors[type][level]
}

/**
 * Get scale description for integer 1-5 scale
 */
export const getScaleDescription = (value: number): string => {
  if (value === 5) return 'Very High'
  if (value === 4) return 'High'
  if (value === 3) return 'Moderate'
  if (value === 2) return 'Low'
  if (value === 1) return 'Very Low'
  return 'Unknown'
}

/**
 * Format number with appropriate precision (updated for integers)
 */
export const formatNumber = (value: number | undefined, decimals: number = 0, field?: string): string => {
  if (value == null) return 'N/A'
  
  if (field === 'sleepavg') {
    const hours = convertSleepToHours(value)
    return `${hours.toFixed(1)}h`
  }
  
  const scaleFields = [
    'subjectivesynchro', 'subjectivemood', 'productivity', 'statehealth',
    'staterelationship', 'stateselfesteem', 'stateinteligence',
    'statesocialskill', 'stateimmerse', 'stres'
  ]
  
  if (field && scaleFields.includes(field)) {
    return Math.round(value).toString()
  }
  
  return value.toFixed(decimals)
}

/**
 * Export data to CSV format (updated for integer display)
 */
export const exportToCSV = (data: SynchroData[], filename?: string): void => {
  if (data.length === 0) return
  
  const allKeys = new Set<string>()
  data.forEach(row => {
    Object.keys(row).forEach(key => allKeys.add(key))
  })
  
  const headers = Array.from(allKeys).sort()
  const csvHeaders = headers.join(',')
  
  const rows = data.map(row => 
    headers.map(header => {
      let value = row[header as keyof SynchroData]
      
      if (header === 'sleepavg' && typeof value === 'number') {
        value = convertSleepToHours(value)
      }
      
      if (value === null || value === undefined) {
        return ''
      } else if (typeof value === 'string') {
        return `"${value.replace(/"/g, '""')}"`
      } else {
        return value.toString()
      }
    }).join(',')
  )
  
  const csvContent = [csvHeaders, ...rows].join('\n')
  downloadFile(csvContent, filename || `synchronicity-data-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv')
}

/**
 * Export data to JSON format (updated for proper formatting)
 */
export const exportToJSON = (data: SynchroData[], filename?: string): void => {
  const exportData = data.map(entry => ({
    ...entry,
    sleepavg: entry.sleepavg ? convertSleepToHours(entry.sleepavg) : entry.sleepavg
  }))
  
  const jsonContent = JSON.stringify(exportData, null, 2)
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
 * Generate color palette for charts
 */
export const getChartColors = () => ({
  primary: '#3399e6',
  accent: '#339999',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  muted: '#6b7280',
  purple: '#8b5cf6'
})

/**
 * Calculate correlation between two arrays
 */
export const calculateCorrelation = (x: number[], y: number[]): number => {
  if (x.length !== y.length || x.length === 0) return 0
  
  const n = x.length
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => {
    const yi = y[i]
    return yi !== undefined ? sum + xi * yi : sum
  }, 0)
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0)
  const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0)
  
  const numerator = n * sumXY - sumX * sumY
  const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY))
  
  return denominator === 0 ? 0 : numerator / denominator
}

/**
 * Debounce function for search inputs
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export const generateId = (): string => {
  return Math.random().toString(36).slice(2, 11)
}

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max)
}

export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max
}

export const getPercentage = (value: number, min: number, max: number): number => {
  return ((value - min) / (max - min)) * 100
}

export const getTimeCategory = (time: string): string => {
  if (!time || typeof time !== 'string') return 'Unknown'
  
  const timeParts = time.split(':')
  if (timeParts.length === 0 || !timeParts[0]) return 'Unknown'
  
  const hour = parseInt(timeParts[0], 10)
  if (isNaN(hour)) return 'Unknown'
  
  if (hour >= 6 && hour < 12) return 'Morning'
  if (hour >= 12 && hour < 17) return 'Afternoon'
  if (hour >= 17 && hour < 21) return 'Evening'
  return 'Night'
}

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

export const getDayOfWeek = (dateStr: string | undefined): string => {
  if (!dateStr) return 'Unknown'
  try {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return 'Unknown'
    return days[date.getDay()] || 'Unknown'
  } catch {
    return 'Unknown'
  }
}

export const isWeekend = (dateStr: string | undefined): boolean => {
  if (!dateStr) return false
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return false
    const day = date.getDay()
    return day === 0 || day === 6
  } catch {
    return false
  }
}

export const getRelativeTime = (dateStr: string | undefined): string => {
  if (!dateStr) return 'Unknown'
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return 'Invalid date'
    
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    return `${Math.floor(diffInDays / 30)} months ago`
  } catch {
    return 'Invalid date'
  }
}

export const safeJsonParse = <T>(str: string, fallback: T): T => {
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}

export const createArray = <T>(length: number, defaultValue: T): T[] => {
  return Array(length).fill(defaultValue)
}