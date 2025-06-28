'use client'

import { SynchroData } from '../lib/supabase'
import { 
  SparklesIcon, 
  HeartIcon, 
  MoonIcon, 
  SunIcon,
  ChartBarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

interface SummarySectionProps {
  data: SynchroData[]
}

export default function SummarySection({ data }: SummarySectionProps) {
  // Calculate summary statistics
  const calculateStats = () => {
    if (data.length === 0) return null

    const validSynchro = data.filter(d => d.subjectiveSynchro != null)
    const validMood = data.filter(d => d.subjectiveMood != null)
    const validProductivity = data.filter(d => d.productivity != null)
    const validSleep = data.filter(d => d.sleepAvg != null)

    // Synchronicity stats
    const avgSynchro = validSynchro.length > 0 
      ? validSynchro.reduce((sum, d) => sum + (d.subjectiveSynchro || 0), 0) / validSynchro.length 
      : 0

    const totalSynchroSum = data.reduce((sum, d) => sum + (d.synchroSum || 0), 0)

    // Mood and productivity
    const avgMood = validMood.length > 0 
      ? validMood.reduce((sum, d) => sum + (d.subjectiveMood || 0), 0) / validMood.length 
      : 0

    const avgProductivity = validProductivity.length > 0 
      ? validProductivity.reduce((sum, d) => sum + (d.productivity || 0), 0) / validProductivity.length 
      : 0

    // Sleep stats
    const avgSleep = validSleep.length > 0 
      ? validSleep.reduce((sum, d) => sum + (d.sleepAvg || 0), 0) / validSleep.length 
      : 0

    // Most common synchronicity times
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

    const topTimes = timeTotals
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)

    // Date range
    const dates = data.filter(d => d.date).map(d => new Date(d.date!))
    const startDate = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : null
    const endDate = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : null

    return {
      avgSynchro,
      totalSynchroSum,
      avgMood,
      avgProductivity,
      avgSleep,
      topTimes,
      startDate,
      endDate,
      totalDays: dates.length
    }
  }

  const stats = calculateStats()

  if (!stats) {
    return (
      <div className="text-center py-12">
        <SparklesIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No data available yet</p>
        <p className="text-gray-400">Add some entries to see your statistics</p>
      </div>
    )
  }

  const MetricCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    color = 'cosmic' 
  }: {
    title: string
    value: string | number
    subtitle?: string
    icon: React.ComponentType<any>
    color?: 'cosmic' | 'synchro' | 'green' | 'blue' | 'purple'
  }) => {
    const colorClasses = {
      cosmic: 'bg-cosmic-50 text-cosmic-700 border-cosmic-200',
      synchro: 'bg-synchro-50 text-synchro-700 border-synchro-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      purple: 'bg-purple-50 text-purple-700 border-purple-200'
    }

    return (
      <div className="metric-card">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">{title}</h3>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="section-header">Summary Overview</h2>
        <p className="text-gray-600">
          Your synchronicity and life tracking insights
        </p>
      </div>

      {/* Date Range */}
      <div className="card text-center">
        <CalendarIcon className="h-8 w-8 text-cosmic-500 mx-auto mb-2" />
        <h3 className="font-semibold text-gray-800 mb-2">Tracking Period</h3>
        <p className="text-lg">
          {stats.startDate?.toLocaleDateString()} - {stats.endDate?.toLocaleDateString()}
        </p>
        <p className="text-sm text-gray-500">{stats.totalDays} days tracked</p>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Avg Synchronicity"
          value={stats.avgSynchro.toFixed(1)}
          subtitle="Subjective rating"
          icon={SparklesIcon}
          color="cosmic"
        />
        <MetricCard
          title="Total Synchro Events"
          value={stats.totalSynchroSum}
          subtitle="All recorded events"
          icon={ChartBarIcon}
          color="synchro"
        />
        <MetricCard
          title="Average Mood"
          value={stats.avgMood.toFixed(1)}
          subtitle="Daily mood rating"
          icon={HeartIcon}
          color="green"
        />
        <MetricCard
          title="Avg Productivity"
          value={stats.avgProductivity.toFixed(1)}
          subtitle="Daily productivity"
          icon={SunIcon}
          color="blue"
        />
      </div>

      {/* Sleep and Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <MoonIcon className="h-6 w-6 text-purple-600" />
            <h3 className="font-semibold text-gray-800">Sleep Overview</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-2">
            {stats.avgSleep.toFixed(1)} hours
          </p>
          <p className="text-sm text-gray-500">Average sleep duration</p>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <SparklesIcon className="h-6 w-6 text-cosmic-600" />
            <h3 className="font-semibold text-gray-800">Data Quality</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-2">
            {data.length}
          </p>
          <p className="text-sm text-gray-500">Total entries recorded</p>
        </div>
      </div>

      {/* Top Synchronicity Times */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
          <SparklesIcon className="h-5 w-5 text-cosmic-600" />
          <span>Most Common Synchronicity Times</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {stats.topTimes.map((timeData, index) => (
            <div key={timeData.time} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-cosmic-600">
                {timeData.time}
              </div>
              <div className="text-sm text-gray-600">
                {timeData.total} events
              </div>
              <div className="text-xs text-gray-400">
                #{index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}