/**
 * Global type definitions for Synchronicity Tracker
 */

import { SynchroData } from '../lib/supabase'
import { ComponentType } from 'react'

// Re-export main data type
export type { SynchroData }

// Navigation and UI types
export interface Tab {
  id: string
  label: string
  icon: ComponentType<any>
  description?: string
}

export type TabType = 'summary' | 'analytics' | 'input' | 'view'

// Chart and visualization types
export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

export interface HeatmapCell {
  x: number
  y: number
  time?: string
  value: number
  intensity: number
}

export interface StatCard {
  title: string
  value: string | number
  subtitle?: string
  trend?: number
  color?: 'cosmic' | 'synchro' | 'green' | 'blue' | 'purple' | 'orange'
  icon?: ComponentType<any>
}

// Form and validation types
export interface FormField<T = any> {
  name: string
  label: string
  type: 'text' | 'number' | 'date' | 'select' | 'range' | 'textarea'
  value: T
  placeholder?: string
  required?: boolean
  min?: number
  max?: number
  step?: number
  options?: Array<{ value: T; label: string }>
  validation?: (value: T) => string | null
}

export interface ValidationError {
  field: string
  message: string
}

export interface FormState<T extends Record<string, any>> {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  isSubmitting: boolean
  isValid: boolean
}

// Filter and search types
export interface FilterOptions {
  dateRange?: { start: string; end: string }
  valueRanges?: Record<string, { min: number; max: number }>
  textSearch?: string
  categories?: string[]
}

export interface SortOptions<T> {
  field: keyof T
  direction: 'asc' | 'desc'
}

export interface PaginationOptions {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

// Analytics and insights types
export interface Insight {
  id: string
  type: 'trend' | 'pattern' | 'anomaly' | 'milestone'
  title: string
  description: string
  value?: number
  confidence: number
  dateRange: { start: string; end: string }
  metadata?: Record<string, any>
}

export interface TrendAnalysis {
  field: string
  direction: 'up' | 'down' | 'stable'
  magnitude: number
  confidence: number
  period: string
}

export interface PatternAnalysis {
  type: 'weekly' | 'monthly' | 'seasonal'
  pattern: Record<string, number>
  strength: number
  significance: number
}

// Database and API types
export interface DatabaseResponse<T> {
  data: T | null
  error: Error | null
  count?: number
}

export interface QueryOptions {
  select?: string
  orderBy?: string
  ascending?: boolean
  limit?: number
  offset?: number
  filters?: Record<string, any>
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
}

// Configuration types
export interface AppConfig {
  name: string
  version: string
  description: string
  features: Record<string, boolean>
  limits: Record<string, number>
  themes: Record<string, ThemeConfig>
}

export interface ThemeConfig {
  name: string
  colors: {
    primary: string
    secondary: string
    background: string
    foreground: string
    accent: string
  }
  fonts: {
    body: string
    heading: string
    mono: string
  }
}

// Export and import types
export interface ExportOptions {
  format: 'json' | 'csv' | 'xlsx'
  dateRange?: { start: string; end: string }
  fields?: string[]
  includeMetadata?: boolean
}

export interface ImportResult {
  success: boolean
  imported: number
  skipped: number
  errors: Array<{ row: number; message: string }>
}

// Notification and toast types
export interface Toast {
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

export interface NotificationPreferences {
  enabled: boolean
  types: Array<'success' | 'error' | 'warning' | 'info'>
  duration: number
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

// User preferences and settings types
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: string
  timezone: string
  dateFormat: string
  timeFormat: '12h' | '24h'
  defaultPageSize: number
  notifications: NotificationPreferences
  privacy: {
    analytics: boolean
    errorReporting: boolean
  }
}

// Performance and monitoring types
export interface PerformanceMetrics {
  pageLoadTime: number
  renderTime: number
  interactionDelay: number
  memoryUsage: number
  errorRate: number
}

export interface ErrorReport {
  id: string
  timestamp: string
  type: 'javascript' | 'network' | 'validation' | 'database'
  message: string
  stack?: string
  url: string
  userAgent: string
  userId?: string
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] }

export type NonNullable<T> = T extends null | undefined ? never : T

// Event types
export interface CustomEvent<T = any> {
  type: string
  payload: T
  timestamp: number
  source?: string
}

export interface DataChangeEvent extends CustomEvent<{
  operation: 'create' | 'update' | 'delete'
  data: SynchroData
  previousData?: SynchroData
}> {
  type: 'data:change'
}

export interface ViewChangeEvent extends CustomEvent<{
  from: TabType
  to: TabType
}> {
  type: 'view:change'
}

// Hook return types
export interface UseAsyncReturn<T, E = Error> {
  data: T | null
  error: E | null
  loading: boolean
  execute: (asyncFunction: () => Promise<T>) => Promise<T>
  reset: () => void
}

export interface UseFormReturn<T extends Record<string, any>> {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  setValue: (field: keyof T, value: any) => void
  setFieldTouched: (field: keyof T) => void
  validateForm: () => boolean
  reset: () => void
  isValid: boolean
}

export interface UsePaginationReturn {
  currentPage: number
  totalPages: number
  nextPage: () => void
  prevPage: () => void
  goToPage: (page: number) => void
  getPageNumbers: (maxVisible?: number) => number[]
  hasNext: boolean
  hasPrev: boolean
  startIndex: number
  endIndex: number
}

// Component prop types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
  'data-testid'?: string
}

export interface LoadingProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  message?: string
  description?: string
  variant?: 'cosmic' | 'synchro' | 'simple'
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnBackdropClick?: boolean
  closeOnEscape?: boolean
}

// Type guards
export const isValidSynchroData = (data: any): data is SynchroData => {
  return data && typeof data === 'object' && 'id' in data
}

export const isValidDate = (date: any): date is string => {
  return typeof date === 'string' && !isNaN(Date.parse(date))
}

export const isNumericValue = (value: any): value is number => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value)
}

// Constants as types
export const TIME_SLOTS = [
  '00:00', '01:01', '02:02', '03:03', '04:04', '05:05', '06:06', 
  '07:07', '08:08', '09:09', '10:10', '11:11', '12:12',
  '13:13', '14:14', '15:15', '16:16', '17:17', '18:18',
  '19:19', '20:20', '21:21', '22:22', '23:23'
] as const

export type TimeSlot = typeof TIME_SLOTS[number]

export const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
] as const

export type DayOfWeek = typeof DAYS_OF_WEEK[number]

// Branded types for better type safety
export type SynchroId = number & { readonly brand: unique symbol }
export type DateString = string & { readonly brand: unique symbol }
export type RatingValue = number & { readonly brand: unique symbol }

// Module augmentation for window object
declare global {
  interface Window {
    syncTracker?: {
      version: string
      debug: boolean
      analytics?: any
    }
  }
}

// Next.js specific types
export interface PageProps {
  params: { [key: string]: string | string[] }
  searchParams: { [key: string]: string | string[] | undefined }
}

export interface LayoutProps {
  children: React.ReactNode
  params: { [key: string]: string | string[] }
}

// Supabase specific types
export interface SupabaseError {
  message: string
  details: string
  hint: string
  code: string
}

export interface SupabaseResponse<T> {
  data: T | null
  error: SupabaseError | null
  count?: number | null
  status: number
  statusText: string
}

export default {}