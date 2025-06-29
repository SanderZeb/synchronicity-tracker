'use client'

import { SynchroData } from '../lib/supabase'
import { convertSleepToHours, formatDate, getInsightText, getStatusColor } from '../lib/utils'
import {
  BoltIcon,
  HeartIcon,
  MoonIcon,
  SunIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  FireIcon,
  PlusIcon,
  CpuChipIcon,
  ChartBarIcon
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

    // Basic averages (updated for 1-5 scale)
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

    // Sleep average (convert from minutes to hours)
    const avgSleep = validSleep.length > 0
      ? validSleep.reduce((sum, d) => sum + convertSleepToHours(d.sleepavg || 0), 0) / validSleep.length
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
      if (entry.subjectivesynchro && entry.subjectivesynchro >= 3) { // Updated threshold for 1-5 scale
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
          <div className="w-32 h-32 bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl flex items-center justify-center mx-auto shadow-soft">
            <CpuChipIcon className="h-16 w-16 text-primary-600" />
          </div>
          <div className="absolute inset-0 w-32 h-32 bg-primary-200 rounded-2xl animate-ping opacity-20 mx-auto" />
        </div>
        <div className="space-y-6">
          <h3 className="text-3xl font-bold text-text-primary">Start Your Journey</h3>
          <p className="text-text-secondary text-lg max-w-lg mx-auto leading-relaxed">
            Begin tracking your synchronicity patterns and discover the hidden connections in your daily life.
          </p>
          <div className="mt-8">
            <button className="btn-primary text-lg px-8 py-4 hover:scale-105 transform transition-all duration-200">
              <PlusIcon className="h-6 w-6 mr-3" />
              Create Your First Entry
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
    miniChart,
    description
  }: {
    title: string
    value: string | number
    subtitle?: string
    icon: React.ComponentType<any>
    color?: 'primary' | 'accent' | 'success' | 'warning' | 'purple'
    trend?: number
    miniChart?: any[]
    description?: string
  }) => {
    const colorClasses = {
      primary: 'from-primary-500 to-primary-600',
      accent: 'from-accent-400 to-accent-500',
      success: 'from-green-500 to-green-600',
      warning: 'from-orange-500 to-orange-600',
      purple: 'from-purple-500 to-purple-600'
    }

    return (
      <div className="metric-card group relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-r ${colorClasses[color]} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

        <div className="relative p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} shadow-soft group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            {trend !== undefined && (
              <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
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

          <div className="space-y-3">
            <h3 className="metric-label">{title}</h3>
            <p className="metric-value">{value}</p>
            {subtitle && <p className="text-sm text-text-secondary">{subtitle}</p>}
            {description && <p className="text-xs text-text-muted italic">{description}</p>}
          </div>

          {miniChart && (
            <div className="mt-4 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={miniChart}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={colorClasses[color].includes('primary') ? '#3399e6' : '#339999'}
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
    <div className="card-hover p-6 group">
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-xl bg-${color}-100 group-hover:bg-${color}-200 transition-colors duration-200`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-text-primary mb-2 group-hover:text-primary-600 transition-colors duration-200">{title}</h4>
          <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
          {highlight && (
            <p className={`text-${color}-600 font-medium text-sm mt-3 px-3 py-1 bg-${color}-50 rounded-lg inline-block`}>
              {highlight}
            </p>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="text-center space-y-4">
        <h2 className="section-header bg-gradient-primary bg-clip-text text-transparent">
          Dashboard Overview
        </h2>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          Your personal synchronicity insights and patterns on a 1-5 scale
        </p>
      </div>

      {/* Enhanced Tracking Period Banner */}
      <div className="relative bg-gradient-to-r from-primary-500 via-primary-600 to-accent-500 rounded-2xl p-8 text-white overflow-hidden shadow-strong">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full transform translate-x-32 -translate-y-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full transform -translate-x-24 translate-y-24" />
        <div className="relative text-center space-y-4">
          <CalendarIcon className="h-12 w-12 mx-auto opacity-90" />
          <h3 className="text-2xl font-bold">Journey Timeline</h3>
          <div className="text-xl font-semibold">
            {stats.startDate && stats.endDate ? (
              <>
                {formatDate(stats.startDate.toISOString())} — {formatDate(stats.endDate.toISOString())}
              </>
            ) : (
              'Start your tracking today'
            )}
          </div>
          <div className="text-white/80 text-lg">
            <span className="font-medium">{stats.totalDays}</span> days of cosmic awareness
          </div>
        </div>
      </div>

      {/* Main Metrics Grid - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Synchronicity Level"
          value={stats.avgSynchro.toFixed(1)}
          subtitle="Average daily rating (1-5)"
          description={getInsightText(stats.avgSynchro, 'synchronicity')}
          icon={BoltIcon}
          color="primary"
          trend={stats.synchroTrend}
          miniChart={stats.recentTimeline}
        />
        <MetricCard
          title="Total Events"
          value={stats.totalSynchroSum}
          subtitle="Recorded synchronicities"
          description="Meaningful coincidences captured"
          icon={FireIcon}
          color="accent"
        />
        <MetricCard
          title="Emotional Balance"
          value={stats.avgMood.toFixed(1)}
          subtitle="Average mood rating"
          description={getInsightText(stats.avgMood, 'mood')}
          icon={HeartIcon}
          color="success"
        />
        <MetricCard
          title="Sleep Quality"
          value={`${stats.avgSleep.toFixed(1)}h`}
          subtitle="Average sleep duration"
          description="Rest and recovery patterns"
          icon={MoonIcon}
          color="purple"
        />
      </div>

      {/* Secondary Metrics - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Productivity Flow"
          value={stats.avgProductivity.toFixed(1)}
          subtitle="Daily focus rating (1-5)"
          description={getInsightText(stats.avgProductivity, 'productivity')}
          icon={SunIcon}
          color="warning"
        />
        <MetricCard
          title="Awareness Streak"
          value={`${stats.streakDays} days`}
          subtitle="Consecutive high-sync days"
          description="Sustained cosmic connection"
          icon={ArrowTrendingUpIcon}
          color="success"
        />
        <MetricCard
          title="Peak Sync Time"
          value={stats.topTimes[0]?.time || 'N/A'}
          subtitle="Most active synchronicity time"
          description="Your cosmic power hour"
          icon={ClockIcon}
          color="primary"
        />
      </div>

      {/* Enhanced Weekly Pattern */}
      <div className="chart-container">
        <div className="flex items-center justify-between mb-6">
          <h3 className="section-subheader flex items-center space-x-2">
            <ChartBarIcon className="h-6 w-6 text-primary-600" />
            <span>Weekly Synchronicity Rhythm</span>
          </h3>
          <div className="badge badge-primary">1-5 Scale</div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.weeklyData}>
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12, fill: '#4a5568' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#4a5568' }}
                axisLine={{ stroke: '#e2e8f0' }}
                domain={[0, 5]}
              />
              <Tooltip
                formatter={(value) => [Number(value).toFixed(1), 'Avg Synchronicity']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey="synchronicity" 
                fill="url(#barGradient)" 
                radius={[6, 6, 0, 0]}
              />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3399e6" />
                  <stop offset="100%" stopColor="#339999" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Enhanced Top Synchronicity Times */}
      <div className="chart-container">
        <h3 className="section-subheader flex items-center space-x-2 mb-6">
          <ClockIcon className="h-6 w-6 text-primary-600" />
          <span>Cosmic Power Hours</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {stats.topTimes.map((timeData, index) => (
            <div key={timeData.time} className="relative group">
              <div className="text-center p-6 bg-gradient-to-br from-primary-50 via-white to-accent-50 rounded-xl border-2 border-primary-200 card-hover">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-primary text-white rounded-xl mx-auto mb-4 text-lg font-bold shadow-soft group-hover:scale-110 transition-transform duration-200">
                  #{index + 1}
                </div>
                <div className="text-2xl font-bold text-primary-600 mb-2">
                  {timeData.time}
                </div>
                <div className="text-sm text-text-secondary">
                  <span className="font-medium">{timeData.total}</span> events
                </div>
                <div className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${getStatusColor(timeData.total / 10, 'bg')}`}>
                  {timeData.total >= 20 ? 'Very High' : timeData.total >= 15 ? 'High' : timeData.total >= 10 ? 'Medium' : 'Low'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Insights Section */}
      <div className="space-y-6">
        <h3 className="section-subheader text-center">Personalized Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InsightCard
            icon={ArrowTrendingUpIcon}
            title="Peak Synchronicity Day"
            description={`Your highest recorded synchronicity was on ${stats.bestDay?.date ? formatDate(stats.bestDay.date) : 'N/A'}, showing exceptional cosmic awareness.`}
            highlight={`Score: ${stats.bestDay?.subjectivesynchro?.toFixed(1) || 'N/A'}/5`}
            color="primary"
          />
          <InsightCard
            icon={BoltIcon}
            title="Awareness Strength"
            description={`Your synchronicity level averages ${stats.avgSynchro.toFixed(1)}/5, indicating ${stats.avgSynchro >= 4 ? 'exceptional' : stats.avgSynchro >= 3 ? 'strong' : 'developing'} cosmic awareness.`}
            highlight={`Top ${Math.round((stats.avgSynchro / 5) * 100)}% awareness level`}
            color="accent"
          />
          <InsightCard
            icon={HeartIcon}
            title="Emotional Harmony"
            description={`Your mood patterns show ${stats.avgMood >= 4 ? 'excellent' : stats.avgMood >= 3 ? 'good' : 'developing'} emotional balance, which often correlates with synchronicity awareness.`}
            highlight={`Mood score: ${stats.avgMood.toFixed(1)}/5`}
            color="success"
          />
          <InsightCard
            icon={ClockIcon}
            title="Temporal Patterns"
            description={`Your most active synchronicity time is ${stats.topTimes[0]?.time || 'N/A'}, suggesting this is when you're most attuned to cosmic signals.`}
            highlight={`${stats.topTimes[0]?.total || 0} events recorded`}
            color="primary"
          />
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-surface-secondary to-white rounded-2xl p-8 border border-gray-200">
        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold text-text-primary">Your Synchronicity Journey</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">{stats.totalDays}</div>
              <div className="text-sm text-text-secondary">Days Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-500">{stats.totalSynchroSum}</div>
              <div className="text-sm text-text-secondary">Total Events</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.streakDays}</div>
              <div className="text-sm text-text-secondary">Current Streak</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{(stats.avgSynchro * 20).toFixed(0)}%</div>
              <div className="text-sm text-text-secondary">Awareness Level</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}