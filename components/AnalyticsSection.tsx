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
  ScatterPlot,
  Scatter
} from 'recharts'
import { format, parseISO } from 'date-fns'

interface AnalyticsSectionProps {
  data: SynchroData[]
}

export default function AnalyticsSection({ data }: AnalyticsSectionProps) {
  const [selectedChart, setSelectedChart] = useState<'timeline' | 'times' | 'correlations' | 'mood'>('timeline')

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

  // Process data for synchronicity times distribution
  const prepareSynchroTimesData = () => {
    const timeColumns = [
      '00:00', '01:01', '02:02', '03:03', '04:04', '05:05', '06:06', 
      '07:07', '08:08', '09:09', '10:10', '11:11', '12:12',
      '13:13', '14:14', '15:15', '16:16', '17:17', '18:18',
      '19:19', '20:20', '21:21', '22:22', '23:23'
    ]

    return timeColumns.map(time => ({
      time,
      total: data.reduce((sum, d) => sum + (d[time as keyof SynchroData] as number || 0), 0)
    }))
  }

  // Process data for mood distribution
  const prepareMoodData = () => {
    const moodRanges = [
      { range: '0-2', min: 0, max: 2, color: '#ef4444' },
      { range: '2-4', min: 2, max: 4, color: '#f97316' },
      { range: '4-6', min: 4, max: 6, color: '#eab308' },
      { range: '6-8', min: 6, max: 8, color: '#22c55e' },
      { range: '8-10', min: 8, max: 10, color: '#10b981' }
    ]

    return moodRanges.map(range => ({
      range: range.range,
      count: data.filter(d => 
        d.subjectiveMood != null && 
        d.subjectiveMood >= range.min && 
        d.subjectiveMood < range.max
      ).length,
      color: range.color
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
        sleep: d.sleepAvg || 0
      }))
  }

  const timelineData = prepareTimelineData()
  const synchroTimesData = prepareSynchroTimesData()
  const moodData = prepareMoodData()
  const correlationData = prepareCorrelationData()

  const chartOptions = [
    { id: 'timeline', label: 'Timeline Trends', description: 'Track metrics over time' },
    { id: 'times', label: 'Synchro Times', description: 'Most common synchronicity times' },
    { id: 'mood', label: 'Mood Distribution', description: 'Your mood patterns' },
    { id: 'correlations', label: 'Correlations', description: 'Relationship between metrics' }
  ]

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM dd')
    } catch {
      return dateStr
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="section-header">Analytics Dashboard</h2>
        <p className="text-gray-600">
          Explore patterns and trends in your data
        </p>
      </div>

      {/* Chart Selection */}
      <div className="flex flex-wrap justify-center gap-3">
        {chartOptions.map(option => (
          <button
            key={option.id}
            onClick={() => setSelectedChart(option.id as any)}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
              selectedChart === option.id
                ? 'bg-cosmic-100 text-cosmic-800 border border-cosmic-300'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="font-medium">{option.label}</div>
            <div className="text-xs opacity-75">{option.description}</div>
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="card">
        {selectedChart === 'timeline' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Timeline Trends</h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelFormatter={(value) => formatDate(value as string)}
                    formatter={(value, name) => [Number(value).toFixed(1), name]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="synchronicity" 
                    stroke="#0ea5e9" 
                    strokeWidth={2}
                    name="Synchronicity"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="mood" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    name="Mood"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="productivity" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    name="Productivity"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {selectedChart === 'times' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Synchronicity Times Distribution</h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={synchroTimesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#d946ef" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {selectedChart === 'mood' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Mood Distribution</h3>
            <div className="h-96 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={moodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ range, count }) => `${range}: ${count}`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {moodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {selectedChart === 'correlations' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Synchronicity vs Mood Correlation</h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterPlot data={correlationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    dataKey="synchronicity" 
                    name="Synchronicity"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="mood" 
                    name="Mood"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Synchro vs Mood" fill="#0ea5e9" />
                </ScatterPlot>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <h4 className="font-semibold text-gray-800 mb-2">Data Points</h4>
          <p className="text-3xl font-bold text-cosmic-600">{data.length}</p>
          <p className="text-sm text-gray-500">Total entries</p>
        </div>
        
        <div className="card text-center">
          <h4 className="font-semibold text-gray-800 mb-2">Date Range</h4>
          <p className="text-lg font-bold text-gray-800">
            {timelineData.length > 0 && (
              <>
                {Math.ceil((new Date(timelineData[timelineData.length - 1].date).getTime() - 
                new Date(timelineData[0].date).getTime()) / (1000 * 60 * 60 * 24))} days
              </>
            )}
          </p>
          <p className="text-sm text-gray-500">Tracking period</p>
        </div>

        <div className="card text-center">
          <h4 className="font-semibold text-gray-800 mb-2">Peak Synchro Time</h4>
          <p className="text-2xl font-bold text-synchro-600">
            {synchroTimesData.sort((a, b) => b.total - a.total)[0]?.time || 'N/A'}
          </p>
          <p className="text-sm text-gray-500">Most active time</p>
        </div>
      </div>
    </div>
  )
}