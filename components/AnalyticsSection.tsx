'use client'

import { useState } from 'react'
import { SynchroData } from '../lib/supabase'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Scatter,
  ScatterChart
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { 
  ChartBarIcon,
  FireIcon,
  HeartIcon,
  BoltIcon,
  ClockIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'

interface AnalyticsSectionProps {
  data: SynchroData[]
}

export default function AnalyticsSection({ data }: AnalyticsSectionProps) {
  const [selectedChart, setSelectedChart] = useState<'timeline' | 'heatmap' | 'correlations' | 'mood'>('heatmap')

  // Process data for timeline chart
  const prepareTimelineData = () => {
    return data
      .filter(d => d.date && d.subjectivesynchro != null)
      .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
      .map(d => ({
        date: d.date!,
        synchronicity: d.subjectivesynchro || 0,
        mood: d.subjectivemood || 0,
        productivity: d.productivity || 0,
        sleep: d.sleepavg || 0
      }))
  }

  // Process data for synchronicity heatmap
   const prepareHeatmapData = () => {
    const timeColumns = [
      '00:00', '01:01', '02:02', '03:03', '04:04', '05:05', '06:06', 
      '07:07', '08:08', '09:09', '10:10', '11:11', '12:12',
      '13:13', '14:14', '15:15', '16:16', '17:17', '18:18',
      '19:19', '20:20', '21:21', '22:22', '23:23'
    ]

    const heatmapData = []
    const maxValue = Math.max(...timeColumns.map(time => 
      data.reduce((sum, d) => sum + (d[time as keyof SynchroData] as number || 0), 0)
    ))

    // Create rows (weeks/days) and columns (times)
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < timeColumns.length; col++) {
        const time = timeColumns[col]
        
        // Add a check to ensure 'time' is not undefined
        if (time) {
          const total = data.reduce((sum, d) => sum + (d[time as keyof SynchroData] as number || 0), 0)
          const intensity = maxValue > 0 ? (total / maxValue) : 0
          
          heatmapData.push({
            x: col,
            y: row,
            time,
            value: total,
            intensity,
            hour: time.split(':')[0],
            minute: time.split(':')[1]
          })
        }
      }
    }

    return { heatmapData, maxValue, timeColumns }
  }

  // Process data for mood distribution
  const prepareMoodData = () => {
    const moodRanges = [
      { range: '0-2', min: 0, max: 2, color: '#ef4444', label: 'Very Low' },
      { range: '2-4', min: 2, max: 4, color: '#f97316', label: 'Low' },
      { range: '4-6', min: 4, max: 6, color: '#eab308', label: 'Neutral' },
      { range: '6-8', min: 6, max: 8, color: '#22c55e', label: 'Good' },
      { range: '8-10', min: 8, max: 10, color: '#10b981', label: 'Excellent' }
    ]

    return moodRanges.map(range => ({
      ...range,
      count: data.filter(d => 
        d.subjectivemood != null && 
        d.subjectivemood >= range.min && 
        d.subjectivemood < range.max
      ).length
    }))
  }

  // Process correlation data
  const prepareCorrelationData = () => {
    return data
      .filter(d => d.subjectivesynchro != null && d.subjectivemood != null)
      .map(d => ({
        synchronicity: d.subjectivesynchro || 0,
        mood: d.subjectivemood || 0,
        productivity: d.productivity || 0,
        sleep: d.sleepavg || 0,
        date: d.date
      }))
  }

  const timelineData = prepareTimelineData()
  const { heatmapData, maxValue, timeColumns } = prepareHeatmapData()
  const moodData = prepareMoodData()
  const correlationData = prepareCorrelationData()

  const chartOptions = [
    { id: 'heatmap', label: 'Synchronicity Heatmap', description: 'Visual pattern of synchronicity times', icon: FireIcon },
    { id: 'timeline', label: 'Timeline Trends', description: 'Track metrics over time', icon: ChartBarIcon },
    { id: 'mood', label: 'Mood Distribution', description: 'Your mood patterns', icon: HeartIcon },
    { id: 'correlations', label: 'Correlations', description: 'Relationship between metrics', icon: ArrowTrendingUpIcon }
  ]

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM dd')
    } catch {
      return dateStr
    }
  }

  const getHeatmapColor = (intensity: number) => {
    if (intensity === 0) return '#f8fafc'
    if (intensity < 0.2) return '#deeffe'
    if (intensity < 0.4) return '#b4e2fd'
    if (intensity < 0.6) return '#7bd0fc'
    if (intensity < 0.8) return '#3bb9f8'
    return '#3399e6'
  }

  // Synchronicity Heatmap Component
  const SynchroHeatmap = () => {
    const cellSize = 32
    const gap = 2

    return (
      <div className="flex flex-col items-center space-y-6">
        <div className="text-center">
          <h3 className="section-subheader">Synchronicity Time Heatmap</h3>
          <p className="text-sm text-text-secondary">Darker colors indicate more synchronicity events</p>
        </div>
        
        {/* Time labels */}
        <div className="overflow-x-auto w-full">
          <div className="flex items-center space-x-2 text-xs text-text-muted ml-12 min-w-max">
            {timeColumns.map((time, index) => (
              <div 
                key={time} 
                className="w-8 text-center"
                style={{ 
                  marginLeft: index === 0 ? 0 : gap,
                  transform: 'rotate(-45deg)',
                  transformOrigin: 'center'
                }}
              >
                {time}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex flex-col space-y-1 mt-4">
            {[0, 1, 2, 3, 4, 5, 6].map(row => (
              <div key={row} className="flex items-center space-x-1">
                <div className="w-10 text-xs text-text-muted text-right pr-2">
                  Week {row + 1}
                </div>
                <div className="flex space-x-1">
                  {timeColumns.map((time, col) => {
                    const cellData = heatmapData.find(d => d.x === col && d.y === row)
                    const intensity = cellData?.intensity || 0
                    const value = cellData?.value || 0
                    
                    return (
                      <div
                        key={`${row}-${col}`}
                        className="group relative cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-soft rounded tooltip"
                        style={{
                          width: cellSize,
                          height: cellSize,
                          backgroundColor: getHeatmapColor(intensity),
                          border: '1px solid #e5e7eb'
                        }}
                        data-tooltip={`${time}: ${value} events`}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 text-xs text-text-secondary">
          <span>Less</span>
          <div className="flex space-x-1">
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map(intensity => (
              <div
                key={intensity}
                className="w-4 h-4 rounded"
                style={{ backgroundColor: getHeatmapColor(intensity) }}
              />
            ))}
          </div>
          <span>More</span>
          <span className="ml-4 badge badge-primary">Max: {maxValue} events</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="section-header">Analytics Dashboard</h2>
        <p className="text-text-secondary text-lg">
          Explore patterns and trends in your synchronicity data
        </p>
      </div>

      {/* Chart Selection */}
      <div className="flex flex-wrap justify-center gap-3">
        {chartOptions.map(option => {
          const Icon = option.icon
          return (
            <button
              key={option.id}
              onClick={() => setSelectedChart(option.id as any)}
              className={`group relative px-6 py-4 rounded-xl transition-all duration-200 ${
                selectedChart === option.id
                  ? 'bg-gradient-primary text-white shadow-soft'
                  : 'bg-white text-text-secondary border border-gray-200 hover:border-primary-200 hover:shadow-soft'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">{option.label}</div>
                  <div className={`text-sm ${selectedChart === option.id ? 'text-white/80' : 'text-text-muted'}`}>
                    {option.description}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Charts */}
      <div className="chart-container">
        {selectedChart === 'heatmap' && <SynchroHeatmap />}

        {selectedChart === 'timeline' && (
          <div>
            <h3 className="section-subheader text-center">Timeline Trends</h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f7" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    tick={{ fontSize: 12, fill: '#4a5568' }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: '#4a5568' }} />
                  <Tooltip 
                    labelFormatter={(value) => formatDate(value as string)}
                    formatter={(value, name) => [Number(value).toFixed(1), name]}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="synchronicity" 
                    stroke="#3399e6" 
                    strokeWidth={3}
                    name="Synchronicity"
                    dot={{ fill: '#3399e6', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="mood" 
                    stroke="#22c55e" 
                    strokeWidth={3}
                    name="Mood"
                    dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="productivity" 
                    stroke="#339999" 
                    strokeWidth={3}
                    name="Productivity"
                    dot={{ fill: '#339999', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {selectedChart === 'mood' && (
          <div>
            <h3 className="section-subheader text-center">Mood Distribution</h3>
            <div className="h-96 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={moodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ range, count, label }) => `${label}: ${count}`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {moodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [value, 'Count']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {selectedChart === 'correlations' && (
          <div>
            <h3 className="section-subheader text-center">Synchronicity vs Mood Correlation</h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={correlationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f7" />
                  <XAxis 
                    type="number" 
                    dataKey="synchronicity" 
                    name="Synchronicity"
                    tick={{ fontSize: 12, fill: '#4a5568' }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="mood" 
                    name="Mood"
                    tick={{ fontSize: 12, fill: '#4a5568' }}
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value, name) => [Number(value).toFixed(1), name]}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Scatter name="Synchro vs Mood" fill="#3399e6" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { 
            label: 'Total Entries', 
            value: data.length, 
            icon: ChartBarIcon, 
            color: 'primary',
            description: 'Total recorded days'
          },
          { 
            label: 'Avg Synchronicity', 
            value: timelineData.length > 0 ? (timelineData.reduce((sum, d) => sum + d.synchronicity, 0) / timelineData.length).toFixed(1) : '0', 
            icon: BoltIcon, 
            color: 'primary',
            description: 'Average daily score'
          },
          { 
            label: 'Peak Time', 
            value: timeColumns.reduce((max, time) => {
              const total = data.reduce((sum, d) => sum + (d[time as keyof SynchroData] as number || 0), 0)
              const maxTotal = data.reduce((sum, d) => sum + (d[max as keyof SynchroData] as number || 0), 0)
              return total > maxTotal ? time : max
            }, '00:00'), 
            icon: ClockIcon, 
            color: 'accent',
            description: 'Most active time'
          },
          { 
            label: 'Tracking Days', 
            value: timelineData.length > 0 ? Math.ceil((new Date(timelineData[timelineData.length - 1].date).getTime() - new Date(timelineData[0].date).getTime()) / (1000 * 60 * 60 * 24)) : 0, 
            icon: ArrowTrendingUpIcon, 
            color: 'success',
            description: 'Days tracked'
          }
        ].map((stat, index) => (
          <div key={index} className="metric-card group relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-r ${
              stat.color === 'primary' ? 'from-primary-500 to-primary-600' :
              stat.color === 'accent' ? 'from-accent-400 to-accent-500' :
              'from-green-500 to-green-600'
            } opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${
                  stat.color === 'primary' ? 'from-primary-500 to-primary-600' :
                  stat.color === 'accent' ? 'from-accent-400 to-accent-500' :
                  'from-green-500 to-green-600'
                } shadow-soft`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="metric-label">{stat.label}</p>
                <p className="metric-value">{stat.value}</p>
                <p className="text-sm text-text-secondary">{stat.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Data Quality Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-hover p-6">
          <h4 className="font-semibold text-text-primary mb-3">Data Completeness</h4>
          <div className="space-y-3">
            {[
              { label: 'Synchronicity', field: 'subjectivesynchro' },
              { label: 'Mood', field: 'subjectivemood' },
              { label: 'Sleep', field: 'sleepavg' }
            ].map(item => {
              const completeness = data.length > 0 
                ? (data.filter(d => d[item.field as keyof SynchroData] != null).length / data.length) * 100 
                : 0
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-secondary">{item.label}</span>
                    <span className="text-text-primary font-medium">{completeness.toFixed(0)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${completeness}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card-hover p-6">
          <h4 className="font-semibold text-text-primary mb-3">Recent Activity</h4>
          <div className="space-y-2">
            {timelineData.slice(-5).map((entry, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-text-secondary">
                  {formatDate(entry.date)}
                </span>
                <div className="flex items-center space-x-2">
                  <div className={`status-dot ${
                    entry.synchronicity >= 7 ? 'bg-green-500' :
                    entry.synchronicity >= 5 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} />
                  <span className="text-sm font-medium text-text-primary">
                    {entry.synchronicity.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-hover p-6">
          <h4 className="font-semibold text-text-primary mb-3">Trending Metrics</h4>
          <div className="space-y-3">
            {[
              { label: 'Synchronicity', trend: 0.8, positive: true },
              { label: 'Mood Stability', trend: 0.3, positive: true },
              { label: 'Sleep Quality', trend: -0.2, positive: false }
            ].map(metric => (
              <div key={metric.label} className="flex justify-between items-center">
                <span className="text-sm text-text-secondary">{metric.label}</span>
                <div className={`flex items-center space-x-1 ${
                  metric.positive ? 'metric-trend-positive' : 'metric-trend-negative'
                }`}>
                  {metric.positive ? (
                    <ArrowTrendingUpIcon className="h-3 w-3" />
                  ) : (
                    <ArrowTrendingUpIcon className="h-3 w-3 transform rotate-180" />
                  )}
                  <span className="text-xs font-medium">
                    {metric.positive ? '+' : ''}{metric.trend.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}