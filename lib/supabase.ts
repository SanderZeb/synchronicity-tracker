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

// Updated interface to match exact database schema
export interface SynchroData {
  id?: number
  date?: string // timestamp with time zone
  
  // Time-based synchronicity columns (exact DB column names)
  '01:01'?: number
  '02:02'?: number
  '03:03'?: number
  '04:04'?: number
  '05:05'?: number
  '06:06'?: number
  '07:07'?: number
  '08:08'?: number
  '09:09'?: number
  '10:10'?: number
  '11:11'?: number
  '12:12'?: number
  '13:13'?: number
  '14:14'?: number
  '15:15'?: number
  '16:16'?: number
  '17:17'?: number
  '18:18'?: number
  '19:19'?: number
  '20:20'?: number
  '21:21'?: number
  '22:22'?: number
  '23:23'?: number
  '00:00'?: number
  
  // Main metrics (matching DB lowercase)
  synchrosum?: number
  subjectivesynchro?: number
  subjectivemood?: number
  productivity?: number
  unlocks?: number
  
  // Health metrics
  heartratedaily?: number
  heartrateresting?: number
  stepsphone?: number
  weight?: number
  skinproblems?: number
  
  // Sleep data
  sleepphone?: number
  sleepband?: number
  sleepavg?: number
  sleepdifference?: number
  sleep_fallasleep_time?: number
  sleepwakeupavg?: number
  sleepwakeupband?: number
  sleepwakeupphone?: number
  sleepwakeupquality?: number
  sleep_faalasleep_time?: number // Additional field from DB
  
  // Mental states
  statehealth?: number
  staterelationship?: number
  stateselfesteem?: number
  stateinteligence?: number
  statesocialskill?: number
  stateimmerse?: number
  stres?: number
  workload?: number
  
  // Substances
  stimmg?: number
  stimsum?: number
  methylphenidatetabs?: number
  methylphenidatemg?: number
  alcohol?: number
  
  // Diet
  dietkcal?: number
  dietcarbs?: number
  dietprotein?: number
  dietfats?: number
  
  // Cosmic data
  ageofmoon?: number
  earthsundistance?: number
  moonphase?: number // Changed to number to match DB (double precision)
  
  // Other metrics
  void?: number
  ocount?: number
  oquality?: number
  subjectivemisses?: number
  misssum?: number
  singletrialmean?: number
  singletrialsum?: number
  luck?: number
  weekcount?: number
  day_of_the_week?: string
}

// Helper interface for display purposes with camelCase
export interface SynchroDataDisplay {
  id?: number
  date?: string
  dayOfWeek?: string
  
  // Time slots
  timeSlots?: Record<string, number>
  
  // Main metrics
  synchroSum?: number
  subjectiveSynchro?: number
  subjectiveMood?: number
  productivity?: number
  
  // Health
  heartRateDaily?: number
  heartRateResting?: number
  stepsPhone?: number
  weight?: number
  
  // Sleep
  sleepAvg?: number
  sleepQuality?: number
  
  // Mental states
  stateHealth?: number
  stateRelationship?: number
  stateSelfEsteem?: number
  stateIntelligence?: number
  stateSocialSkill?: number
  stateImmerse?: number
  stress?: number
  
  // Substances
  stimulants?: number
  alcohol?: number
  
  // Diet
  calories?: number
  carbs?: number
  protein?: number
  fats?: number
  
  // Cosmic
  moonPhase?: string
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
  const getMoonPhaseString = (phase?: number): string => {
    if (!phase) return ''
    const phases = [
      'New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
      'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'
    ]
    const index = Math.floor((phase / 360) * 8) % 8
    return phases[index] || ''
  }

  return {
    id: data.id,
    date: data.date,
    dayOfWeek: data.day_of_the_week,
    timeSlots,
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
 */
export const fetchAllData = async (options: QueryOptions = {}): Promise<SynchroData[]> => {
  try {
    const {
      orderBy = 'date',
      ascending = false,
      limit,
      offset
    } = options

    let query = supabase
      .from('synchrodata')
      .select('*')
      .order(orderBy, { ascending })

    if (limit) {
      query = query.limit(limit)
    }

    if (offset) {
      query = query.range(offset, offset + (limit || 50) - 1)
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
      limit,
      offset
    } = options

    let query = supabase
      .from('synchrodata')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order(orderBy, { ascending })

    if (limit) {
      query = query.limit(limit)
    }

    if (offset) {
      query = query.range(offset, offset + (limit || 50) - 1)
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