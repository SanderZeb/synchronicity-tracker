import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our synchronicity data
export interface SynchroData {
  id: number
  weekCount: number
  unlocks?: number
  date?: string
  day_of_the_week?: string
  year?: number
  month?: number
  day?: number
  
  // Time-based synchronicity columns
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
  
  // Subjective measures
  synchroSum?: number
  subjectiveSynchro?: number
  subjectiveMood?: number
  productivity?: number
  subjectiveMisses?: number
  
  // Health metrics
  heartrateDaily?: number
  heartrateResting?: number
  stepsPhone?: number
  weight?: number
  skinProblems?: number
  
  // Sleep data
  sleepPhone?: number
  sleepBand?: number
  sleepAvg?: number
  sleepDifference?: number
  sleep_fallasleep_time?: number
  sleepWakeupAvg?: number
  sleepWakeupBand?: number
  sleepWakeupPhone?: number
  sleepWakeupQuality?: number
  
  // Mental states
  stateHealth?: number
  stateRelationship?: number
  stateSelfesteem?: number
  stateInteligence?: number
  stateSocialSkill?: number
  stateImmerse?: number
  stres?: number
  workload?: number
  
  // Substances
  stimMg?: number
  stimSum?: number
  methylphenidateTabs?: number
  methylphenidateMg?: number
  alcohol?: number
  
  // Diet
  dietKcal?: number
  dietCarbs?: number
  dietProtein?: number
  dietFats?: number
  
  // Cosmic data
  ageOfMoon?: number
  earthSunDistance?: number
  moonPhase?: string
  
  // Other metrics
  void?: number
  oCount?: number
  oQuality?: number
  missSum?: number
  singleTrialMean?: number
  singleTrialSum?: number
  luck?: number
}

// Helper functions for data fetching
export const fetchAllData = async (): Promise<SynchroData[]> => {
  const { data, error } = await supabase
    .from('synchrodata')
    .select('*')
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching data:', error)
    return []
  }

  return data || []
}

export const fetchDataByDateRange = async (startDate: string, endDate: string): Promise<SynchroData[]> => {
  const { data, error } = await supabase
    .from('synchrodata')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching data by date range:', error)
    return []
  }

  return data || []
}

export const insertSynchroData = async (data: Partial<SynchroData>) => {
  const { data: result, error } = await supabase
    .from('synchrodata')
    .insert([data])
    .select()

  if (error) {
    console.error('Error inserting data:', error)
    throw error
  }

  return result
}