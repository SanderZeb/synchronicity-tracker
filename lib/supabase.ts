import { createClient } from '@supabase/supabase-js'
import { DatabaseError } from '../components/ErrorBoundary'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  global: {
    headers: {
      'X-Client-Info': 'synchronicity-tracker@2.0.0'
    }
  }
})

// Updated interface to match exact database schema - FIXED for exactOptionalPropertyTypes
export interface SynchroData {
  id?: number | undefined
  date?: string | undefined // timestamp with time zone
  
  // Time-based synchronicity columns (exact DB column names)
  '01:01'?: number | undefined
  '02:02'?: number | undefined
  '03:03'?: number | undefined
  '04:04'?: number | undefined
  '05:05'?: number | undefined
  '06:06'?: number | undefined
  '07:07'?: number | undefined
  '08:08'?: number | undefined
  '09:09'?: number | undefined
  '10:10'?: number | undefined
  '11:11'?: number | undefined
  '12:12'?: number | undefined
  '13:13'?: number | undefined
  '14:14'?: number | undefined
  '15:15'?: number | undefined
  '16:16'?: number | undefined
  '17:17'?: number | undefined
  '18:18'?: number | undefined
  '19:19'?: number | undefined
  '20:20'?: number | undefined
  '21:21'?: number | undefined
  '22:22'?: number | undefined
  '23:23'?: number | undefined
  '00:00'?: number | undefined
  
  // Main metrics (matching DB lowercase)
  synchrosum?: number | undefined
  subjectivesynchro?: number | undefined
  subjectivemood?: number | undefined
  productivity?: number | undefined
  unlocks?: number | undefined
  
  // Health metrics
  heartratedaily?: number | undefined
  heartrateresting?: number | undefined
  stepsphone?: number | undefined
  weight?: number | undefined
  skinproblems?: number | undefined
  
  // Sleep data
  sleepphone?: number | undefined
  sleepband?: number | undefined
  sleepavg?: number | undefined
  sleepdifference?: number | undefined
  sleep_fallasleep_time?: number | undefined
  sleepwakeupavg?: number | undefined
  sleepwakeupband?: number | undefined
  sleepwakeupphone?: number | undefined
  sleepwakeupquality?: number | undefined
  sleep_faalasleep_time?: number | undefined // Additional field from DB
  
  // Mental states
  statehealth?: number | undefined
  staterelationship?: number | undefined
  stateselfesteem?: number | undefined
  stateinteligence?: number | undefined
  statesocialskill?: number | undefined
  stateimmerse?: number | undefined
  stres?: number | undefined
  workload?: number | undefined
  
  // Substances
  stimmg?: number | undefined
  stimsum?: number | undefined
  methylphenidatetabs?: number | undefined
  methylphenidatemg?: number | undefined
  alcohol?: number | undefined
  
  // Diet
  dietkcal?: number | undefined
  dietcarbs?: number | undefined
  dietprotein?: number | undefined
  dietfats?: number | undefined
  
  // Cosmic data
  ageofmoon?: number | undefined
  earthsundistance?: number | undefined
  moonphase?: number | undefined // Changed to number to match DB (double precision)
  
  // Other metrics
  void?: number | undefined
  ocount?: number | undefined
  oquality?: number | undefined
  subjectivemisses?: number | undefined
  misssum?: number | undefined
  singletrialmean?: number | undefined
  singletrialsum?: number | undefined
  luck?: number | undefined
  weekcount?: number | undefined
  day_of_the_week?: string | undefined
}

// Helper interface for display purposes with camelCase - FIXED for exactOptionalPropertyTypes
export interface SynchroDataDisplay {
  id?: number | undefined
  date?: string | undefined
  dayOfWeek?: string | undefined
  
  // Time slots
  timeSlots?: Record<string, number> | undefined
  
  // Main metrics
  synchroSum?: number | undefined
  subjectiveSynchro?: number | undefined
  subjectiveMood?: number | undefined
  productivity?: number | undefined
  
  // Health
  heartRateDaily?: number | undefined
  heartRateResting?: number | undefined
  stepsPhone?: number | undefined
  weight?: number | undefined
  
  // Sleep
  sleepAvg?: number | undefined
  sleepQuality?: number | undefined
  
  // Mental states
  stateHealth?: number | undefined
  stateRelationship?: number | undefined
  stateSelfEsteem?: number | undefined
  stateIntelligence?: number | undefined
  stateSocialSkill?: number | undefined
  stateImmerse?: number | undefined
  stress?: number | undefined
  
  // Substances
  stimulants?: number | undefined
  alcohol?: number | undefined
  
  // Diet
  calories?: number | undefined
  carbs?: number | undefined
  protein?: number | undefined
  fats?: number | undefined
  
  // Cosmic
  moonPhase?: string | undefined
}

// Database response types
export interface DatabaseResponse<T> {
  data: T | null
  error: Error | null
  count?: number
}

// Query options interface
export interface QueryOptions {
  orderBy?: keyof SynchroData
  ascending?: boolean
  limit?: number
  offset?: number
}

// Helper function to convert DB data to display format
export const convertToDisplay = (data: SynchroData): SynchroDataDisplay => {
  const timeSlots: Record<string, number> = {}
  const timeCols = [
    '00:00', '01:01', '02:02', '03:03', '04:04', '05:05', '06:06', 
    '07:07', '08:08', '09:09', '10:10', '11:11', '12:12',
    '13:13', '14:14', '15:15', '16:16', '17:17', '18:18',
    '19:19', '20:20', '21:21', '22:22', '23:23'
  ]
  
  timeCols.forEach(time => {
    const value = data[time as keyof SynchroData] as number
    if (value !== undefined) timeSlots[time] = value
  })

  // Convert moonphase number to string
  const getMoonPhaseString = (phase?: number): string | undefined => {
    if (!phase) return undefined
    const phases = [
      'New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
      'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'
    ]
    const index = Math.floor((phase / 360) * 8) % 8
    return phases[index] || undefined
  }

  return {
    id: data.id,
    date: data.date,
    dayOfWeek: data.day_of_the_week,
    timeSlots: Object.keys(timeSlots).length > 0 ? timeSlots : undefined,
    synchroSum: data.synchrosum,
    subjectiveSynchro: data.subjectivesynchro,
    subjectiveMood: data.subjectivemood,
    productivity: data.productivity,
    heartRateDaily: data.heartratedaily,
    heartRateResting: data.heartrateresting,
    stepsPhone: data.stepsphone,
    weight: data.weight,
    sleepAvg: data.sleepavg,
    sleepQuality: data.sleepwakeupquality,
    stateHealth: data.statehealth,
    stateRelationship: data.staterelationship,
    stateSelfEsteem: data.stateselfesteem,
    stateIntelligence: data.stateinteligence,
    stateSocialSkill: data.statesocialskill,
    stateImmerse: data.stateimmerse,
    stress: data.stres,
    stimulants: data.stimmg,
    alcohol: data.alcohol,
    calories: data.dietkcal,
    carbs: data.dietcarbs,
    protein: data.dietprotein,
    fats: data.dietfats,
    moonPhase: getMoonPhaseString(data.moonphase)
  }
}

// Helper function to convert display format back to DB format
export const convertFromDisplay = (data: SynchroDataDisplay): Partial<SynchroData> => {
  const dbData: Partial<SynchroData> = {
    id: data.id,
    date: data.date,
    day_of_the_week: data.dayOfWeek,
    synchrosum: data.synchroSum,
    subjectivesynchro: data.subjectiveSynchro,
    subjectivemood: data.subjectiveMood,
    productivity: data.productivity,
    heartratedaily: data.heartRateDaily,
    heartrateresting: data.heartRateResting,
    stepsphone: data.stepsPhone,
    weight: data.weight,
    sleepavg: data.sleepAvg,
    sleepwakeupquality: data.sleepQuality,
    statehealth: data.stateHealth,
    staterelationship: data.stateRelationship,
    stateselfesteem: data.stateSelfEsteem,
    stateinteligence: data.stateIntelligence,
    statesocialskill: data.stateSocialSkill,
    stateimmerse: data.stateImmerse,
    stres: data.stress,
    stimmg: data.stimulants,
    alcohol: data.alcohol,
    dietkcal: data.calories,
    dietcarbs: data.carbs,
    dietprotein: data.protein,
    dietfats: data.fats
  }

  // Add time slots
  if (data.timeSlots) {
    Object.entries(data.timeSlots).forEach(([time, value]) => {
      dbData[time as keyof SynchroData] = value
    })
  }

  return dbData
}

// Helper function to handle database errors
const handleDatabaseError = (error: any, operation: string): never => {
  console.error(`Database error during ${operation}:`, error)
  
  if (error.code === 'PGRST301') {
    throw new DatabaseError('Database connection failed. Please check your internet connection.')
  }
  
  if (error.code === '23505') {
    throw new DatabaseError('A record with this date already exists.')
  }
  
  if (error.code === '23514') {
    throw new DatabaseError('Invalid data provided. Please check your input values.')
  }
  
  throw new DatabaseError(error.message || `Failed to ${operation}`)
}

/**
 * Fetch all synchronicity data with optional sorting and filtering
 * FIXED: Remove Supabase's default 1000 record limit by setting explicit high limit
 */
export const fetchAllData = async (options: QueryOptions = {}): Promise<SynchroData[]> => {
  try {
    const {
      orderBy = 'date',
      ascending = false,
      limit = 10000, // Set high limit to fetch all records (adjust if you have more than 10k records)
      offset
    } = options

    let query = supabase
      .from('synchrodata')
      .select('*')
      .order(orderBy, { ascending })
      .limit(limit) // Always set a limit to override Supabase's default 1000

    if (offset) {
      query = query.range(offset, offset + limit - 1)
    }

    const { data, error } = await query

    if (error) {
      handleDatabaseError(error, 'fetch all data')
    }

    return data || []
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error
    }
    handleDatabaseError(error, 'fetch all data')
  }
}

/**
 * Alternative: Fetch all data using pagination to handle very large datasets
 */
export const fetchAllDataPaginated = async (options: QueryOptions = {}): Promise<SynchroData[]> => {
  try {
    const {
      orderBy = 'date',
      ascending = false
    } = options

    const pageSize = 1000
    let allData: SynchroData[] = []
    let page = 0
    let hasMore = true

    while (hasMore) {
      const { data, error } = await supabase
        .from('synchrodata')
        .select('*')
        .order(orderBy, { ascending })
        .range(page * pageSize, (page + 1) * pageSize - 1)

      if (error) {
        handleDatabaseError(error, 'fetch all data paginated')
      }

      if (data && data.length > 0) {
        allData = [...allData, ...data]
        hasMore = data.length === pageSize // If we got a full page, there might be more
        page++
      } else {
        hasMore = false
      }
    }

    return allData
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error
    }
    handleDatabaseError(error, 'fetch all data paginated')
  }
}

/**
 * Fetch data by date range with optional filters
 */
export const fetchDataByDateRange = async (
  startDate: string, 
  endDate: string, 
  options: QueryOptions = {}
): Promise<SynchroData[]> => {
  try {
    const {
      orderBy = 'date',
      ascending = false,
      limit = 10000, // Set high limit
      offset
    } = options

    let query = supabase
      .from('synchrodata')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order(orderBy, { ascending })
      .limit(limit)

    if (offset) {
      query = query.range(offset, offset + limit - 1)
    }

    const { data, error } = await query

    if (error) {
      handleDatabaseError(error, 'fetch data by date range')
    }

    return data || []
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error
    }
    handleDatabaseError(error, 'fetch data by date range')
  }
}

/**
 * Fetch data for a specific date
 */
export const fetchDataByDate = async (date: string): Promise<SynchroData | null> => {
  try {
    const { data, error } = await supabase
      .from('synchrodata')
      .select('*')
      .eq('date', date)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      handleDatabaseError(error, 'fetch data by date')
    }

    return data
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error
    }
    handleDatabaseError(error, 'fetch data by date')
  }
}

/**
 * Insert new synchronicity data
 */
export const insertSynchroData = async (data: Partial<SynchroData>): Promise<SynchroData> => {
  try {
    // Validate required fields
    if (!data.date) {
      throw new DatabaseError('Date is required')
    }

    // Check if date already exists
    const existingData = await fetchDataByDate(data.date)
    if (existingData) {
      throw new DatabaseError('An entry for this date already exists')
    }

    // Calculate synchrosum if time slots are provided
    const timeSlots = [
      '00:00', '01:01', '02:02', '03:03', '04:04', '05:05', '06:06', 
      '07:07', '08:08', '09:09', '10:10', '11:11', '12:12',
      '13:13', '14:14', '15:15', '16:16', '17:17', '18:18',
      '19:19', '20:20', '21:21', '22:22', '23:23'
    ]
    
    const synchrosum = timeSlots.reduce((sum, time) => {
      return sum + (data[time as keyof SynchroData] as number || 0)
    }, 0)

    const dataToInsert = {
      ...data,
      synchrosum
    }

    const { data: result, error } = await supabase
      .from('synchrodata')
      .insert([dataToInsert])
      .select()
      .single()

    if (error) {
      handleDatabaseError(error, 'insert data')
    }

    return result
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error
    }
    handleDatabaseError(error, 'insert data')
  }
}

/**
 * Update existing synchronicity data
 */
export const updateSynchroData = async (id: number, data: Partial<SynchroData>): Promise<SynchroData> => {
  try {
    // Calculate synchrosum if time slots are updated
    const timeSlots = [
      '00:00', '01:01', '02:02', '03:03', '04:04', '05:05', '06:06', 
      '07:07', '08:08', '09:09', '10:10', '11:11', '12:12',
      '13:13', '14:14', '15:15', '16:16', '17:17', '18:18',
      '19:19', '20:20', '21:21', '22:22', '23:23'
    ]
    
    const hasTimeSlotData = timeSlots.some(time => data[time as keyof SynchroData] !== undefined)
    
    let dataToUpdate = { ...data }
    
    if (hasTimeSlotData) {
      // Fetch current data to calculate new synchrosum
      const currentData = await fetchDataById(id)
      if (currentData) {
        const mergedData = { ...currentData, ...data }
        const synchrosum = timeSlots.reduce((sum, time) => {
          return sum + (mergedData[time as keyof SynchroData] as number || 0)
        }, 0)
        dataToUpdate.synchrosum = synchrosum
      }
    }

    const { data: result, error } = await supabase
      .from('synchrodata')
      .update(dataToUpdate)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      handleDatabaseError(error, 'update data')
    }

    return result
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error
    }
    handleDatabaseError(error, 'update data')
  }
}

/**
 * Delete synchronicity data by ID
 */
export const deleteSynchroData = async (id: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('synchrodata')
      .delete()
      .eq('id', id)

    if (error) {
      handleDatabaseError(error, 'delete data')
    }
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error
    }
    handleDatabaseError(error, 'delete data')
  }
}

/**
 * Fetch data by ID
 */
export const fetchDataById = async (id: number): Promise<SynchroData | null> => {
  try {
    const { data, error } = await supabase
      .from('synchrodata')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') {
      handleDatabaseError(error, 'fetch data by ID')
    }

    return data
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error
    }
    handleDatabaseError(error, 'fetch data by ID')
  }
}

/**
 * Get database statistics
 */
export const getDatabaseStats = async (): Promise<{
  totalEntries: number
  dateRange: { start: string | null; end: string | null }
  lastEntry: string | null
}> => {
  try {
    const { count, error: countError } = await supabase
      .from('synchrodata')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      handleDatabaseError(countError, 'get database stats')
    }

    const { data: dateData, error: dateError } = await supabase
      .from('synchrodata')
      .select('date')
      .order('date', { ascending: true })
      .limit(1)

    const { data: lastDateData, error: lastDateError } = await supabase
      .from('synchrodata')
      .select('date')
      .order('date', { ascending: false })
      .limit(1)

    if (dateError || lastDateError) {
      handleDatabaseError(dateError || lastDateError, 'get database stats')
    }

    return {
      totalEntries: count || 0,
      dateRange: {
        start: dateData?.[0]?.date || null,
        end: lastDateData?.[0]?.date || null
      },
      lastEntry: lastDateData?.[0]?.date || null
    }
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error
    }
    handleDatabaseError(error, 'get database stats')
  }
}

/**
 * Check database connection
 */
export const checkConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('synchrodata')
      .select('id')
      .limit(1)
      .single()

    // Even if no data exists, as long as there's no connection error, we're good
    return error?.code !== 'PGRST301'
  } catch (error) {
    console.error('Database connection check failed:', error)
    return false
  }
}

// Export the time slots array for use in components
export const TIME_SLOTS = [
  '00:00', '01:01', '02:02', '03:03', '04:04', '05:05', '06:06', 
  '07:07', '08:08', '09:09', '10:10', '11:11', '12:12',
  '13:13', '14:14', '15:15', '16:16', '17:17', '18:18',
  '19:19', '20:20', '21:21', '22:22', '23:23'
] as const

export type TimeSlot = typeof TIME_SLOTS[number]