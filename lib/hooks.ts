import { useState, useEffect, useCallback, useRef } from 'react'
import { SynchroData } from './supabase'

/**
 * Hook for managing local storage with SSR safety
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  return [storedValue, setValue]
}

/**
 * Hook for debouncing values
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook for managing async operations
 */
export function useAsync<T, E = Error>() {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<E | null>(null)
  const [loading, setLoading] = useState(false)

  const execute = useCallback(async (asyncFunction: () => Promise<T>) => {
    try {
      setLoading(true)
      setError(null)
      const result = await asyncFunction()
      setData(result)
      return result
    } catch (error) {
      setError(error as E)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return { data, error, loading, execute, reset }
}

/**
 * Hook for managing form state with validation
 */
export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validationRules?: Partial<Record<keyof T, (value: any) => string | null>>
) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})

  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }))
    
    // Clear error when field is modified
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }, [errors])

  const setFieldTouched = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }, [])

  const validateField = useCallback((field: keyof T, value: any): string | null => {
    if (validationRules?.[field]) {
      return validationRules[field]!(value)
    }
    return null
  }, [validationRules])

  const validateForm = useCallback((): boolean => {
    if (!validationRules) return true

    const newErrors: Partial<Record<keyof T, string>> = {}
    let isValid = true

    Object.keys(values).forEach(key => {
      const field = key as keyof T
      const error = validateField(field, values[field])
      if (error) {
        newErrors[field] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }, [values, validateField, validationRules])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateForm,
    reset,
    isValid: Object.keys(errors).length === 0
  }
}

/**
 * Hook for managing pagination
 */
export function usePagination(totalItems: number, itemsPerPage: number = 20) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const nextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
  }, [totalPages])

  const prevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }, [])

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }, [totalPages])

  const getPageNumbers = useCallback((maxVisible: number = 5) => {
    const delta = Math.floor(maxVisible / 2)
    const start = Math.max(1, currentPage - delta)
    const end = Math.min(totalPages, start + maxVisible - 1)
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }, [currentPage, totalPages])

  return {
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
    getPageNumbers,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
    startIndex: (currentPage - 1) * itemsPerPage,
    endIndex: Math.min(currentPage * itemsPerPage, totalItems)
  }
}

/**
 * Hook for managing data filtering and sorting
 */
export function useDataFilter<T>(
  data: T[],
  initialFilters: Record<string, any> = {}
) {
  const [filters, setFilters] = useState(initialFilters)
  const [sortField, setSortField] = useState<keyof T | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const filteredData = useCallback(() => {
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value || value === '') return true
        
        const itemValue = item[key as keyof T]
        
        if (typeof value === 'string') {
          return String(itemValue).toLowerCase().includes(value.toLowerCase())
        }
        
        if (typeof value === 'object' && value.min !== undefined && value.max !== undefined) {
          const numValue = Number(itemValue)
          return numValue >= value.min && numValue <= value.max
        }
        
        return itemValue === value
      })
    })
  }, [data, filters])

  const sortedData = useCallback(() => {
    const filtered = filteredData()
    
    if (!sortField) return filtered
    
    return [...filtered].sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1
      
      let comparison = 0
      if (aVal < bVal) comparison = -1
      if (aVal > bVal) comparison = 1
      
      return sortDirection === 'desc' ? -comparison : comparison
    })
  }, [filteredData, sortField, sortDirection])

  const updateFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(initialFilters)
  }, [initialFilters])

  const toggleSort = useCallback((field: keyof T) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }, [sortField])

  return {
    filteredData: sortedData(),
    filters,
    sortField,
    sortDirection,
    updateFilter,
    clearFilters,
    toggleSort,
    hasActiveFilters: Object.values(filters).some(value => value !== '' && value != null)
  }
}

/**
 * Hook for managing window size
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowSize
}

/**
 * Hook for detecting click outside element
 */
export function useClickOutside<T extends HTMLElement>(
  handler: () => void
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [handler])

  return ref
}

/**
 * Hook for managing toast notifications
 */
export function useToast() {
  const [toasts, setToasts] = useState<Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    duration?: number
  }>>([])

  const addToast = useCallback((
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
    duration: number = 5000
  ) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { id, type, message, duration }])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success: (message: string, duration?: number) => addToast('success', message, duration),
    error: (message: string, duration?: number) => addToast('error', message, duration),
    warning: (message: string, duration?: number) => addToast('warning', message, duration),
    info: (message: string, duration?: number) => addToast('info', message, duration)
  }
}

/**
 * Hook for environment validation
 */
export function useEnvironment() {
  const [isValid, setIsValid] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    try {
      // Simple validation - can't import validateEnvironment here due to circular dependency
      const requiredVars = [
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ]
      
      if (requiredVars.every(Boolean)) {
        setIsValid(true)
        setErrors([])
      } else {
        setIsValid(false)
        setErrors(['Missing required environment variables'])
      }
    } catch (error) {
      setIsValid(false)
      setErrors([error instanceof Error ? error.message : 'Unknown environment error'])
    }
  }, [])

  return { isValid, errors }
}

/**
 * Hook for keyboard shortcuts
 */
export function useKeyboardShortcut(
  keys: string[],
  callback: () => void,
  deps: any[] = []
) {
  useEffect(() => {
    function handleKeyPress(event: KeyboardEvent) {
      const pressedKeys: string[] = []
      
      if (event.ctrlKey || event.metaKey) pressedKeys.push('ctrl')
      if (event.shiftKey) pressedKeys.push('shift')
      if (event.altKey) pressedKeys.push('alt')
      pressedKeys.push(event.key.toLowerCase())

      const matchesShortcut = keys.every(key => pressedKeys.includes(key.toLowerCase()))
      
      if (matchesShortcut) {
        event.preventDefault()
        callback()
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [...deps, callback])
}

/**
 * Hook for managing synchronicity data with optimistic updates
 */
export function useSynchroData() {
  const [data, setData] = useState<SynchroData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const optimisticUpdate = useCallback((
    operation: 'add' | 'update' | 'delete',
    item: SynchroData,
    rollback?: () => void
  ) => {
    const previousData = [...data]

    try {
      switch (operation) {
        case 'add':
          setData(prev => [item, ...prev])
          break
        case 'update':
          setData(prev => prev.map(d => d.id === item.id ? item : d))
          break
        case 'delete':
          setData(prev => prev.filter(d => d.id !== item.id))
          break
      }
    } catch (error) {
      // Rollback on error
      setData(previousData)
      if (rollback) rollback()
      throw error
    }
  }, [data])

  return {
    data,
    setData,
    loading,
    setLoading,
    error,
    setError,
    optimisticUpdate
  }
}