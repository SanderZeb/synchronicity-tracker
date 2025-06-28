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
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Scatter,
  ScatterChart
} from 'recharts'
import { format, parseISO } from 'date-fns'

interface AnalyticsSectionProps {
  data: SynchroData[]
}

export default function AnalyticsSection({ data }: AnalyticsSectionProps) {
  const [selectedChart, setSelectedChart] = useState<'timeline' | 'heatmap' | 'correlations' | 'mood'>('heatmap')

  // Process data for timeline chart
  const prepareTimelineData = () => {
    return data
      .filter(d => d.date && d.subjectiveSynchro != null)
      .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
      .map(d => ({
        date: d.date!,
        synchronicity: d.subjectiveSynchro || 0,
        mood: d.subjectiveMood || 0,
        productivity: d.productivity || 0,
        sleep: d.sleepAvg || 0
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
        d.subjectiveMood != null && 
        d.subjectiveMood >= range.min && 
        d.subjectiveMood < range.max
      ).length
    }))
  }

  // Process correlation data
  const prepareCorrelationData = () => {
    return data
      .filter(d => d.subjectiveSynchro != null && d.subjectiveMood != null)
      .map(d => ({
        synchronicity: d.subjectiveSynchro || 0,
        mood: d.subjectiveMood || 0,
        productivity: d.productivity || 0,
        sleep: d.sleepAvg || 0,
        date: d.date
      }))
  }

  const timelineData = prepareTimelineData()
  const { heatmapData, maxValue, timeColumns } = prepareHeatmapData()
  const moodData = prepareMoodData()
  const correlationData = prepareCorrelationData()

  const chartOptions = [
    { id: 'heatmap', label: 'Synchro Heatmap', description: 'Visual pattern of synchronicity times', icon: '🔥' },
    { id: 'timeline', label: 'Timeline Trends', description: 'Track metrics over time', icon: '📈' },
    { id: 'mood', label: 'Mood Distribution', description: 'Your mood patterns', icon: '😊' },
    { id: 'correlations', label: 'Correlations', description: 'Relationship between metrics', icon: '🔗' }
  ]

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM dd')
    } catch {
      return dateStr
    }
  }

  const getHeatmapColor = (intensity: number) => {
    if (intensity === 0) return '#f3f4f6'
    if (intensity < 0.2) return '#ddd6fe'
    if (intensity < 0.4) return '#c4b5fd'
    if (intensity < 0.6) return '#a78bfa'
    if (intensity < 0.8) return '#8b5cf6'
    return '#7c3aed'
  }

  // Synchronicity Heatmap Component
  const SynchroHeatmap = () => {
    const cellSize = 32
    const gap = 2

    return (
      <div className="flex flex-col items-center space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Synchronicity Time Heatmap</h3>
          <p className="text-sm text-gray-600">Darker colors indicate more synchronicity events</p>
        </div>
        
        {/* Time labels */}
        <div className="flex items-center space-x-2 text-xs text-gray-500 ml-12">
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
        <div className="flex flex-col space-y-1">
          {[0, 1, 2, 3, 4, 5, 6].map(row => (
            <div key={row} className="flex items-center space-x-1">
              <div className="w-10 text-xs text-gray-500 text-right pr-2">
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
                      className="group relative cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-lg rounded"
                      style={{
                        width: cellSize,
                        height: cellSize,
                        backgroundColor: getHeatmapColor(intensity),
                        border: '1px solid #e5e7eb'
                      }}
                      title={`${time}: ${value} events`}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                        {time}: {value} events
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 text-xs text-gray-600">
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
          <span className="ml-4">Max: {maxValue} events</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cosmic-600 to-synchro-600 bg-clip-text text-transparent mb-2">
          Analytics Dashboard
        </h2>
        <p className="text-gray-600 text-lg">
          Explore patterns and trends in your synchronicity data
        </p>
      </div>

      {/* Chart Selection */}
      <div className="flex flex-wrap justify-center gap-3">
        {chartOptions.map(option => (
          <button
            key={option.id}
            onClick={() => setSelectedChart(option.id as any)}
            className={`group relative px-6 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${
              selectedChart === option.id
                ? 'bg-gradient-to-r from-cosmic-500 to-synchro-500 text-white shadow-lg'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-cosmic-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{option.icon}</span>
              <div className="text-left">
                <div className="font-semibold">{option.label}</div>
                <div className={`text-sm ${selectedChart === option.id ? 'text-white/80' : 'text-gray-500'}`}>
                  {option.description}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        {selectedChart === 'heatmap' && <SynchroHeatmap />}

        {selectedChart === 'timeline' && (
          <div>
            <h3 className="text-xl font-semibold mb-6 text-center">Timeline Trends</h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip 
                    labelFormatter={(value) => formatDate(value as string)}
                    formatter={(value, name) => [Number(value).toFixed(1), name]}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="synchronicity" 
                    stroke="#0ea5e9" 
                    strokeWidth={3}
                    name="Synchronicity"
                    dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
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
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    name="Productivity"
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {selectedChart === 'mood' && (
          <div>
            <h3 className="text-xl font-semibold mb-6 text-center">Mood Distribution</h3>
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
                      border: '1px solid #e5e7eb',
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
            <h3 className="text-xl font-semibold mb-6 text-center">Synchronicity vs Mood Correlation</h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={correlationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    type="number" 
                    dataKey="synchronicity" 
                    name="Synchronicity"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="mood" 
                    name="Mood"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value, name) => [Number(value).toFixed(1), name]}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Scatter name="Synchro vs Mood" fill="#0ea5e9" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Entries', value: data.length, icon: '📊', color: 'from-blue-500 to-blue-600' },
          { label: 'Avg Synchronicity', value: timelineData.length > 0 ? (timelineData.reduce((sum, d) => sum + d.synchronicity, 0) / timelineData.length).toFixed(1) : '0', icon: '✨', color: 'from-cosmic-500 to-cosmic-600' },
          { label: 'Peak Time', value: timeColumns.reduce((max, time) => {
            const total = data.reduce((sum, d) => sum + (d[time as keyof SynchroData] as number || 0), 0)
            const maxTotal = data.reduce((sum, d) => sum + (d[max as keyof SynchroData] as number || 0), 0)
            return total > maxTotal ? time : max
          }, '00:00'), icon: '⏰', color: 'from-synchro-500 to-synchro-600' },
          { label: 'Tracking Days', value: timelineData.length > 0 ? Math.ceil((new Date(timelineData[timelineData.length - 1].date).getTime() - new Date(timelineData[0].date).getTime()) / (1000 * 60 * 60 * 24)) : 0, icon: '📅', color: 'from-green-500 to-green-600' }
        ].map((stat, index) => (
          <div key={index} className="group relative bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`} />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="text-3xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}