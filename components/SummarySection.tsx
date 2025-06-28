'use client'

import { SynchroData } from '../lib/supabase'
import {
  SparklesIcon,
  HeartIcon,
  MoonIcon,
  SunIcon,
  ChartBarIcon,
  CalendarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ClockIcon,
  FireIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { LineChart, Line, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

interface SummarySectionProps {
  data: SynchroData[]
}

export default function SummarySection({ data }: SummarySectionProps) {
  // Calculate comprehensive statistics
  const calculateStats = () => {
    if (data.length === 0) return null

    const validSynchro = data.filter(d => d.subjectiveSynchro != null)
    const validMood = data.filter(d => d.subjectiveMood != null)
    const validProductivity = data.filter(d => d.productivity != null)
    const validSleep = data.filter(d => d.sleepAvg != null)

    // Basic averages
    const avgSynchro = validSynchro.length > 0
      ? validSynchro.reduce((sum, d) => sum + (d.subjectiveSynchro || 0), 0) / validSynchro.length
      : 0

    const totalSynchroSum = data.reduce((sum, d) => sum + (d.synchroSum || 0), 0)

    const avgMood = validMood.length > 0
      ? validMood.reduce((sum, d) => sum + (d.subjectiveMood || 0), 0) / validMood.length
      : 0

    const avgProductivity = validProductivity.length > 0
      ? validProductivity.reduce((sum, d) => sum + (d.productivity || 0), 0) / validProductivity.length
      : 0

    const avgSleep = validSleep.length > 0
      ? validSleep.reduce((sum, d) => sum + (d.sleepAvg || 0), 0) / validSleep.length
      : 0

    // Trend analysis (last 7 days vs previous 7 days)
    const sortedData = data.filter(d => d.date).sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())
    const recent7 = sortedData.slice(0, 7)
    const previous7 = sortedData.slice(7, 14)

    const recentAvgSynchro = recent7.filter(d => d.subjectiveSynchro != null).length > 0
      ? recent7.filter(d => d.subjectiveSynchro != null).reduce((sum, d) => sum + (d.subjectiveSynchro || 0), 0) / recent7.filter(d => d.subjectiveSynchro != null).length
      : 0

    const previousAvgSynchro = previous7.filter(d => d.subjectiveSynchro != null).length > 0
      ? previous7.filter(d => d.subjectiveSynchro != null).reduce((sum, d) => sum + (d.subjectiveSynchro || 0), 0) / previous7.filter(d => d.subjectiveSynchro != null).length
      : 0

    const synchroTrend = recentAvgSynchro - previousAvgSynchro

    // Most active synchronicity times
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

    // Best and worst days
    const daysWithSynchro = data.filter(d => d.date && d.subjectiveSynchro != null)
    const bestDay = daysWithSynchro.reduce((best, current) =>
      (current.subjectiveSynchro || 0) > (best.subjectiveSynchro || 0) ? current : best
    , daysWithSynchro[0])

    const worstDay = daysWithSynchro.reduce((worst, current) =>
      (current.subjectiveSynchro || 0) < (worst.subjectiveSynchro || 0) ? current : worst
    , daysWithSynchro[0])

    // Date range
    const dates = data.filter(d => d.date).map(d => new Date(d.date!))
    const startDate = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : null
    const endDate = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : null

    // Weekly pattern
    const weeklyData = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
      const dayData = data.filter(d => d.day_of_the_week === day)
      const avgSynchroForDay = dayData.filter(d => d.subjectiveSynchro != null).length > 0
        ? dayData.filter(d => d.subjectiveSynchro != null).reduce((sum, d) => sum + (d.subjectiveSynchro || 0), 0) / dayData.filter(d => d.subjectiveSynchro != null).length
        : 0

      return {
        day: day.slice(0, 3),
        synchronicity: avgSynchroForDay,
        count: dayData.length
      }
    })

    // Recent timeline for mini chart
    const recentTimeline = sortedData.slice(0, 14).reverse().map(d => ({
      date: d.date?.slice(-2),
      value: d.subjectiveSynchro || 0
    }))

    return {
      avgSynchro,
      totalSynchroSum,
      avgMood,
      avgProductivity,
      avgSleep,
      topTimes,
      startDate,
      endDate,
      totalDays: dates.length,
      synchroTrend,
      bestDay,
      worstDay,
      weeklyData,
      recentTimeline,
      streakDays: calculateStreak(sortedData)
    }
  }

  const calculateStreak = (sortedData: SynchroData[]) => {
    let streak = 0
    for (const entry of sortedData) {
      if (entry.subjectiveSynchro && entry.subjectiveSynchro >= 5) {
        streak++
      } else {
        break
      }
    }
    return streak
  }

  const stats = calculateStats()

  if (!stats) {
    return (
      <div className="text-center py-20">
        <div className="relative">
          <SparklesIcon className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <div className="absolute inset-0 h-24 w-24 text-cosmic-200 mx-auto animate-pulse">
            <SparklesIcon className="h-24 w-24" />
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-2xl font-semibold text-gray-600">No synchronicity data yet</h3>
          <p className="text-gray-500 text-lg max-w-md mx-auto">
            Start your journey by adding your first entry. The universe is waiting to reveal its patterns.
          </p>
          <div className="mt-6">
            <div className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cosmic-500 to-synchro-500 text-white rounded-lg font-medium">
              <PlusIcon className="h-5 w-5" />
              <span>Add Your First Entry</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const MetricCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color = 'cosmic',
    trend,
    miniChart
  }: {
    title: string
    value: string | number
    subtitle?: string
    icon: React.ComponentType<any>
    color?: 'cosmic' | 'synchro' | 'green' | 'blue' | 'purple' | 'orange'
    trend?: number
    miniChart?: any[]
  }) => {
    const colorClasses = {
      cosmic: 'from-cosmic-500 to-cosmic-600',
      synchro: 'from-synchro-500 to-synchro-600',
      green: 'from-green-500 to-green-600',
      blue: 'from-blue-500 to-blue-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600'
    }

    return (
      <div className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-r ${colorClasses[color]} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

        <div className="relative p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} shadow-lg`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            {trend !== undefined && (
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                trend > 0 ? 'bg-green-100 text-green-700' : trend < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {trend > 0 ? (
                  <TrendingUpIcon className="h-3 w-3" />
                ) : trend < 0 ? (
                  <TrendingDownIcon className="h-3 w-3" />
                ) : null}
                <span>{trend > 0 ? '+' : ''}{trend?.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700 text-sm">{title}</h3>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>

          {miniChart && (
            <div className="mt-4 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={miniChart}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="currentColor"
                    strokeWidth={2}
                    dot={false}
                    className="text-cosmic-500"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    )
  }

  const InsightCard = ({
    icon: Icon,
    title,
    description,
    highlight,
    color = 'cosmic'
  }: {
    icon: React.ComponentType<any>
    title: string
    description: string
    highlight?: string
    color?: string
  }) => (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start space-x-4">
        <div className={`p-2 rounded-lg bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 mb-1">{title}</h4>
          <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
          {highlight && (
            <p className={`text-${color}-600 font-medium text-sm mt-2`}>{highlight}</p>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cosmic-600 to-synchro-600 bg-clip-text text-transparent">
          Summary Overview
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Your synchronicity journey insights and patterns from the cosmic database
        </p>
      </div>

      {/* Tracking Period Banner */}
      <div className="relative bg-gradient-to-r from-cosmic-500 to-synchro-500 rounded-2xl p-8 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative text-center space-y-3">
          <CalendarIcon className="h-10 w-10 mx-auto opacity-90" />
          <h3 className="text-xl font-semibold">Tracking Period</h3>
          <div className="text-lg">
            {stats.startDate?.toLocaleDateString()} — {stats.endDate?.toLocaleDateString()}
          </div>
          <div className="text-white/80">
            {stats.totalDays} days of cosmic consciousness tracking
          </div>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Average Synchronicity"
          value={stats.avgSynchro.toFixed(1)}
          subtitle="Subjective rating (0-10)"
          icon={SparklesIcon}
          color="cosmic"
          trend={stats.synchroTrend}
          miniChart={stats.recentTimeline}
        />
        <MetricCard
          title="Total Events"
          value={stats.totalSynchroSum}
          subtitle="Recorded synchronicities"
          icon={FireIcon}
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
          title="Sleep Quality"
          value={`${stats.avgSleep.toFixed(1)}h`}
          subtitle="Average sleep duration"
          icon={MoonIcon}
          color="purple"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Productivity Score"
          value={stats.avgProductivity.toFixed(1)}
          subtitle="Daily productivity rating"
          icon={SunIcon}
          color="orange"
        />
        <MetricCard
          title="Active Streak"
          value={`${stats.streakDays} days`}
          subtitle="Consecutive high-sync days"
          icon={TrendingUpIcon}
          color="green"
        />
        <MetricCard
          title="Peak Time"
          value={stats.topTimes[0]?.time || 'N/A'}
          subtitle="Most active sync time"
          icon={ClockIcon}
          color="blue"
        />
      </div>

      {/* Weekly Pattern */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">Weekly Synchronicity Pattern</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.weeklyData}>
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => [Number(value).toFixed(1), 'Avg Synchronicity']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="synchronicity" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Synchronicity Times */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
          <ClockIcon className="h-6 w-6 text-cosmic-600" />
          <span>Most Active Synchronicity Times</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {stats.topTimes.map((timeData, index) => (
            <div key={timeData.time} className="relative group">
              <div className="text-center p-4 bg-gradient-to-br from-cosmic-50 to-synchro-50 rounded-xl border border-cosmic-200 hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-cosmic-500 to-synchro-500 text-white rounded-xl mx-auto mb-3 text-lg font-bold">
                  #{index + 1}
                </div>
                <div className="text-xl font-bold text-cosmic-600 mb-1">
                  {timeData.time}
                </div>
                <div className="text-sm text-gray-600">
                  {timeData.total} events
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800 text-center">Cosmic Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InsightCard
            icon={TrendingUpIcon}
            title="Best Synchronicity Day"
            description={`Your highest synchronicity rating was on ${stats.bestDay?.date ? new Date(stats.bestDay.date).toLocaleDateString() : 'N/A'}`}
            highlight={`Score: ${stats.bestDay?.subjectiveSynchro?.toFixed(1) || 'N/A'}/10`}
            color="cosmic"
          />
          <InsightCard
            icon={SparklesIcon}
            title="Synchronicity Strength"
            description={`Your average synchronicity level is ${stats.avgSynchro >= 7 ? 'exceptionally high' : stats.avgSynchro >= 5 ? 'moderately strong' : 'developing'}`}
            highlight={`You're in tune with cosmic patterns ${Math.round((stats.avgSynchro / 10) * 100)}% of the time`}
            color="synchro"
          />
          <InsightCard
            icon={HeartIcon}
            title="Mood Connection"
            description="Your mood and synchronicity levels often correlate, suggesting a deep connection between inner state and cosmic awareness"
            highlight={`Mood-Sync correlation appears ${stats.avgMood > stats.avgSynchro ? 'positive' : 'inverse'}`}
            color="green"
          />
          <InsightCard
            icon={ClockIcon}
            title="Temporal Patterns"
            description={`Your most active synchronicity time is ${stats.topTimes[0]?.time}, when cosmic energy aligns with your awareness`}
            highlight={`${stats.topTimes[0]?.total || 0} events recorded at this time`}
            color="blue"
          />
        </div>
      </div>
    </div>
  )
}