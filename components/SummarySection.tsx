'use client'

import { SynchroData } from '../lib/supabase'
import {
  BoltIcon,
  HeartIcon,
  MoonIcon,
  SunIcon,
  ChartBarIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  FireIcon,
  PlusIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline'
import { LineChart, Line, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

interface SummarySectionProps {
  data: SynchroData[]
}

export default function SummarySection({ data }: SummarySectionProps) {
  // Calculate comprehensive statistics
  const calculateStats = () => {
    if (data.length === 0) return null

    const validSynchro = data.filter(d => d.subjectivesynchro != null)
    const validMood = data.filter(d => d.subjectivemood != null)
    const validProductivity = data.filter(d => d.productivity != null)
    const validSleep = data.filter(d => d.sleepavg != null)

    // Basic averages
    const avgSynchro = validSynchro.length > 0
      ? validSynchro.reduce((sum, d) => sum + (d.subjectivesynchro || 0), 0) / validSynchro.length
      : 0

    const totalSynchroSum = data.reduce((sum, d) => sum + (d.synchrosum || 0), 0)

    const avgMood = validMood.length > 0
      ? validMood.reduce((sum, d) => sum + (d.subjectivemood || 0), 0) / validMood.length
      : 0

    const avgProductivity = validProductivity.length > 0
      ? validProductivity.reduce((sum, d) => sum + (d.productivity || 0), 0) / validProductivity.length
      : 0

    const avgSleep = validSleep.length > 0
      ? validSleep.reduce((sum, d) => sum + (d.sleepavg || 0), 0) / validSleep.length
      : 0

    // Trend analysis (last 7 days vs previous 7 days)
    const sortedData = data.filter(d => d.date).sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())
    const recent7 = sortedData.slice(0, 7)
    const previous7 = sortedData.slice(7, 14)

    const recentAvgSynchro = recent7.filter(d => d.subjectivesynchro != null).length > 0
      ? recent7.filter(d => d.subjectivesynchro != null).reduce((sum, d) => sum + (d.subjectivesynchro || 0), 0) / recent7.filter(d => d.subjectivesynchro != null).length
      : 0

    const previousAvgSynchro = previous7.filter(d => d.subjectivesynchro != null).length > 0
      ? previous7.filter(d => d.subjectivesynchro != null).reduce((sum, d) => sum + (d.subjectivesynchro || 0), 0) / previous7.filter(d => d.subjectivesynchro != null).length
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
    const daysWithSynchro = data.filter(d => d.date && d.subjectivesynchro != null)
    const bestDay = daysWithSynchro.reduce((best, current) =>
      (current.subjectivesynchro || 0) > (best.subjectivesynchro || 0) ? current : best
    , daysWithSynchro[0])

    const worstDay = daysWithSynchro.reduce((worst, current) =>
      (current.subjectivesynchro || 0) < (worst.subjectivesynchro || 0) ? current : worst
    , daysWithSynchro[0])

    // Date range
    const dates = data.filter(d => d.date).map(d => new Date(d.date!))
    const startDate = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : null
    const endDate = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : null

    // Weekly pattern
    const weeklyData = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
      const dayData = data.filter(d => d.day_of_the_week === day)
      const avgSynchroForDay = dayData.filter(d => d.subjectivesynchro != null).length > 0
        ? dayData.filter(d => d.subjectivesynchro != null).reduce((sum, d) => sum + (d.subjectivesynchro || 0), 0) / dayData.filter(d => d.subjectivesynchro != null).length
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
      value: d.subjectivesynchro || 0
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
      if (entry.subjectivesynchro && entry.subjectivesynchro >= 5) {
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
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <CpuChipIcon className="h-12 w-12 text-text-muted" />
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold text-text-primary">No data yet</h3>
          <p className="text-text-secondary text-lg max-w-md mx-auto">
            Start tracking your synchronicity patterns by adding your first entry.
          </p>
          <div className="mt-8">
            <button className="btn-primary">
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Your First Entry
            </button>
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
    color = 'primary',
    trend,
    miniChart
  }: {
    title: string
    value: string | number
    subtitle?: string
    icon: React.ComponentType<any>
    color?: 'primary' | 'accent' | 'success' | 'warning'
    trend?: number
    miniChart?: any[]
  }) => {
    const colorClasses = {
      primary: 'from-primary-500 to-primary-600',
      accent: 'from-accent-400 to-accent-500',
      success: 'from-green-500 to-green-600',
      warning: 'from-orange-500 to-orange-600'
    }

    return (
      <div className="metric-card group relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-r ${colorClasses[color]} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

        <div className="relative p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} shadow-soft`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            {trend !== undefined && (
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                trend > 0 ? 'metric-trend-positive' : trend < 0 ? 'metric-trend-negative' : 'metric-trend-neutral'
              }`}>
                {trend > 0 ? (
                  <ArrowTrendingUpIcon className="h-3 w-3" />
                ) : trend < 0 ? (
                  <ArrowTrendingDownIcon className="h-3 w-3" />
                ) : null}
                <span>{trend > 0 ? '+' : ''}{trend?.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="metric-label">{title}</h3>
            <p className="metric-value">{value}</p>
            {subtitle && <p className="text-sm text-text-secondary">{subtitle}</p>}
          </div>

          {miniChart && (
            <div className="mt-4 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={miniChart}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3399e6"
                    strokeWidth={2}
                    dot={false}
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
    color = 'primary'
  }: {
    icon: React.ComponentType<any>
    title: string
    description: string
    highlight?: string
    color?: string
  }) => (
    <div className="card-hover p-6">
      <div className="flex items-start space-x-4">
        <div className={`p-2 rounded-lg bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-text-primary mb-1">{title}</h4>
          <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
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
        <h2 className="section-header">Dashboard Overview</h2>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          Your synchronicity journey insights and patterns
        </p>
      </div>

      {/* Tracking Period Banner */}
      <div className="relative bg-gradient-primary rounded-2xl p-8 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative text-center space-y-3">
          <CalendarIcon className="h-10 w-10 mx-auto opacity-90" />
          <h3 className="text-xl font-semibold">Tracking Period</h3>
          <div className="text-lg">
            {stats.startDate?.toLocaleDateString()} — {stats.endDate?.toLocaleDateString()}
          </div>
          <div className="text-white/80">
            {stats.totalDays} days of tracking
          </div>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Average Synchronicity"
          value={stats.avgSynchro.toFixed(1)}
          subtitle="Daily rating (0-10)"
          icon={BoltIcon}
          color="primary"
          trend={stats.synchroTrend}
          miniChart={stats.recentTimeline}
        />
        <MetricCard
          title="Total Events"
          value={stats.totalSynchroSum}
          subtitle="Recorded synchronicities"
          icon={FireIcon}
          color="accent"
        />
        <MetricCard
          title="Average Mood"
          value={stats.avgMood.toFixed(1)}
          subtitle="Daily mood rating"
          icon={HeartIcon}
          color="success"
        />
        <MetricCard
          title="Sleep Quality"
          value={`${stats.avgSleep.toFixed(1)}h`}
          subtitle="Average sleep duration"
          icon={MoonIcon}
          color="warning"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Productivity Score"
          value={stats.avgProductivity.toFixed(1)}
          subtitle="Daily productivity rating"
          icon={SunIcon}
          color="warning"
        />
        <MetricCard
          title="Active Streak"
          value={`${stats.streakDays} days`}
          subtitle="Consecutive high-sync days"
          icon={ArrowTrendingUpIcon}
          color="success"
        />
        <MetricCard
          title="Peak Time"
          value={stats.topTimes[0]?.time || 'N/A'}
          subtitle="Most active sync time"
          icon={ClockIcon}
          color="primary"
        />
      </div>

      {/* Weekly Pattern */}
      <div className="chart-container">
        <h3 className="section-subheader text-center">Weekly Synchronicity Pattern</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.weeklyData}>
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#4a5568' }} />
              <YAxis tick={{ fontSize: 12, fill: '#4a5568' }} />
              <Tooltip
                formatter={(value) => [Number(value).toFixed(1), 'Avg Synchronicity']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="synchronicity" fill="#3399e6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Synchronicity Times */}
      <div className="chart-container">
        <h3 className="section-subheader flex items-center space-x-2">
          <ClockIcon className="h-6 w-6 text-primary-600" />
          <span>Most Active Synchronicity Times</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {stats.topTimes.map((timeData, index) => (
            <div key={timeData.time} className="relative group">
              <div className="text-center p-4 bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl border border-primary-200 card-hover">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-primary text-white rounded-xl mx-auto mb-3 text-lg font-bold">
                  #{index + 1}
                </div>
                <div className="text-xl font-bold text-primary-600 mb-1">
                  {timeData.time}
                </div>
                <div className="text-sm text-text-secondary">
                  {timeData.total} events
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights Section */}
      <div className="space-y-6">
        <h3 className="section-subheader text-center">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InsightCard
            icon={ArrowTrendingUpIcon}
            title="Best Synchronicity Day"
            description={`Your highest synchronicity rating was on ${stats.bestDay?.date ? new Date(stats.bestDay.date).toLocaleDateString() : 'N/A'}`}
            highlight={`Score: ${stats.bestDay?.subjectivesynchro?.toFixed(1) || 'N/A'}/10`}
            color="primary"
          />
          <InsightCard
            icon={BoltIcon}
            title="Synchronicity Strength"
            description={`Your average synchronicity level is ${stats.avgSynchro >= 7 ? 'exceptionally high' : stats.avgSynchro >= 5 ? 'moderately strong' : 'developing'}`}
            highlight={`Awareness level: ${Math.round((stats.avgSynchro / 10) * 100)}%`}
            color="accent"
          />
          <InsightCard
            icon={HeartIcon}
            title="Mood Connection"
            description="Your mood and synchronicity levels show correlation patterns, suggesting a connection between inner state and awareness"
            highlight={`Mood-Sync correlation appears ${stats.avgMood > stats.avgSynchro ? 'positive' : 'balanced'}`}
            color="success"
          />
          <InsightCard
            icon={ClockIcon}
            title="Temporal Patterns"
            description={`Your most active synchronicity time is ${stats.topTimes[0]?.time}, indicating peak awareness periods`}
            highlight={`${stats.topTimes[0]?.total || 0} events at this time`}
            color="primary"
          />
        </div>
      </div>
    </div>
  )
}