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
import { format, parseISO, startOfWeek, startOfMonth, startOfYear, getDay } from 'date-fns'
import { 
  ChartBarIcon,
  FireIcon,
  HeartIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  MoonIcon,
  SunIcon
} from '@heroicons/react/24/outline'

interface AnalyticsSectionProps {
  data: SynchroData[]
}

type HeatmapType = 'weeks' | 'months' | 'years' | 'dayOfWeek' | 'earthSunDistance' | 'moonPhase'
type TimelineMetric = 'subjectivesynchro' | 'subjectivemood' | 'productivity' | 'sleepavg' | 'stres'
type CorrelationMetric = 'subjectivesynchro' | 'subjectivemood' | 'productivity' | 'sleepavg' | 'stres'

export default function AnalyticsSection({ data }: AnalyticsSectionProps) {
  const [selectedChart, setSelectedChart] = useState<'timeline' | 'heatmap' | 'correlations' | 'mood'>('heatmap')
  const [heatmapType, setHeatmapType] = useState<HeatmapType>('weeks')
  const [timelineMetrics, setTimelineMetrics] = useState<TimelineMetric[]>(['subjectivesynchro', 'subjectivemood'])
  const [correlationX, setCorrelationX] = useState<CorrelationMetric>('subjectivesynchro')
  const [correlationY, setCorrelationY] = useState<CorrelationMetric>('subjectivemood')

  // Convert sleep from minutes to hours for display
  const convertSleepToHours = (minutes: number | undefined): number => {
    return minutes ? minutes / 60 : 0
  }

  // Process data for timeline chart with selectable metrics
  const prepareTimelineData = () => {
    return data
      .filter(d => d.date)
      .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
      .map(d => {
        const entry: any = {
          date: d.date!,
        }
        
        timelineMetrics.forEach(metric => {
          if (metric === 'sleepavg') {
            entry[metric] = convertSleepToHours(d[metric])
          } else {
            entry[metric] = d[metric] || 0
          }
        })
        
        return entry
      })
  }

  // Enhanced heatmap data preparation
  const prepareHeatmapData = () => {
    const filteredData = data.filter(d => d.date && d.subjectivesynchro != null)
    
    switch (heatmapType) {
      case 'weeks':
        return prepareWeeklyHeatmap(filteredData)
      case 'months':
        return prepareMonthlyHeatmap(filteredData)
      case 'years':
        return prepareYearlyHeatmap(filteredData)
      case 'dayOfWeek':
        return prepareDayOfWeekHeatmap(filteredData)
      case 'earthSunDistance':
        return prepareEarthSunDistanceHeatmap(filteredData)
      case 'moonPhase':
        return prepareMoonPhaseHeatmap(filteredData)
      default:
        return prepareWeeklyHeatmap(filteredData)
    }
  }

  const prepareWeeklyHeatmap = (filteredData: SynchroData[]) => {
    const weeklyData = new Map<string, number[]>()
    const weeklyCounts = new Map<string, number>()
    
    filteredData.forEach(d => {
      const date = new Date(d.date!)
      const weekStart = startOfWeek(date, { weekStartsOn: 1 }) // Monday start
      const weekKey = format(weekStart, 'yyyy-MM-dd')
      const dayOfWeek = getDay(date) === 0 ? 6 : getDay(date) - 1 // Monday = 0, Sunday = 6
      
      if (!weeklyData.has(weekKey)) {
        weeklyData.set(weekKey, new Array(7).fill(0))
        weeklyCounts.set(weekKey, 0)
      }
      
      const weekValues = weeklyData.get(weekKey)!
      const count = weeklyCounts.get(weekKey)!
      
      weekValues[dayOfWeek] += d.subjectivesynchro || 0
      weeklyCounts.set(weekKey, count + 1)
    })

    const heatmapData: any[] = []
    const weeks = Array.from(weeklyData.keys()).sort().slice(-12) // Last 12 weeks
    const maxValue = Math.max(...Array.from(weeklyData.values()).flat().filter(v => v > 0))
    
    weeks.forEach((weekKey, weekIndex) => {
      const weekValues = weeklyData.get(weekKey)!
      weekValues.forEach((value, dayIndex) => {
        const intensity = maxValue > 0 ? (value / maxValue) : 0
        heatmapData.push({
          x: dayIndex,
          y: weekIndex,
          value,
          intensity,
          label: `Week ${format(parseISO(weekKey), 'MMM dd')}, ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][dayIndex]}`
        })
      })
    })

    return { 
      heatmapData, 
      maxValue, 
      xLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      yLabels: weeks.map(w => format(parseISO(w), 'MMM dd'))
    }
  }

  const prepareMonthlyHeatmap = (filteredData: SynchroData[]) => {
    const monthlyData = new Map<string, number>()
    const monthlyCounts = new Map<string, number>()
    
    filteredData.forEach(d => {
      const date = new Date(d.date!)
      const monthKey = format(startOfMonth(date), 'yyyy-MM')
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, 0)
        monthlyCounts.set(monthKey, 0)
      }
      
      monthlyData.set(monthKey, monthlyData.get(monthKey)! + (d.subjectivesynchro || 0))
      monthlyCounts.set(monthKey, monthlyCounts.get(monthKey)! + 1)
    })

    const heatmapData: any[] = []
    const months = Array.from(monthlyData.keys()).sort().slice(-24) // Last 24 months
    const maxValue = Math.max(...Array.from(monthlyData.values()))
    
    months.forEach((monthKey, index) => {
      const value = monthlyData.get(monthKey)! / (monthlyCounts.get(monthKey)! || 1)
      const intensity = maxValue > 0 ? (value / maxValue) : 0
      
      heatmapData.push({
        x: index % 12,
        y: Math.floor(index / 12),
        value: value.toFixed(1),
        intensity,
        label: format(parseISO(monthKey + '-01'), 'MMM yyyy')
      })
    })

    return { 
      heatmapData, 
      maxValue, 
      xLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      yLabels: ['Last Year', 'This Year']
    }
  }

  const prepareYearlyHeatmap = (filteredData: SynchroData[]) => {
    const yearlyData = new Map<string, number>()
    const yearlyCounts = new Map<string, number>()
    
    filteredData.forEach(d => {
      const date = new Date(d.date!)
      const yearKey = format(startOfYear(date), 'yyyy')
      
      if (!yearlyData.has(yearKey)) {
        yearlyData.set(yearKey, 0)
        yearlyCounts.set(yearKey, 0)
      }
      
      yearlyData.set(yearKey, yearlyData.get(yearKey)! + (d.subjectivesynchro || 0))
      yearlyCounts.set(yearKey, yearlyCounts.get(yearKey)! + 1)
    })

    const heatmapData: any[] = []
    const years = Array.from(yearlyData.keys()).sort()
    const maxValue = Math.max(...Array.from(yearlyData.values()))
    
    years.forEach((yearKey, index) => {
      const value = yearlyData.get(yearKey)! / (yearlyCounts.get(yearKey)! || 1)
      const intensity = maxValue > 0 ? (value / maxValue) : 0
      
      heatmapData.push({
        x: index,
        y: 0,
        value: value.toFixed(1),
        intensity,
        label: yearKey
      })
    })

    return { 
      heatmapData, 
      maxValue, 
      xLabels: years,
      yLabels: ['Average']
    }
  }

  const prepareDayOfWeekHeatmap = (filteredData: SynchroData[]) => {
    const dayData = new Array(7).fill(0)
    const dayCounts = new Array(7).fill(0)
    
    filteredData.forEach(d => {
      if (d.day_of_the_week) {
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        const dayIndex = dayNames.indexOf(d.day_of_the_week)
        if (dayIndex !== -1) {
          dayData[dayIndex] += d.subjectivesynchro || 0
          dayCounts[dayIndex]++
        }
      }
    })

    const heatmapData: any[] = []
    const maxValue = Math.max(...dayData.map((sum, i) => dayCounts[i] > 0 ? sum / dayCounts[i] : 0))
    
    dayData.forEach((sum, index) => {
      const avgValue = dayCounts[index] > 0 ? sum / dayCounts[index] : 0
      const intensity = maxValue > 0 ? (avgValue / maxValue) : 0
      
      heatmapData.push({
        x: index,
        y: 0,
        value: avgValue.toFixed(1),
        intensity,
        label: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]
      })
    })

    return { 
      heatmapData, 
      maxValue, 
      xLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      yLabels: ['Average']
    }
  }

  const prepareEarthSunDistanceHeatmap = (filteredData: SynchroData[]) => {
    const distances = filteredData
      .filter(d => d.earthsundistance != null)
      .map(d => d.earthsundistance!)
    
    if (distances.length === 0) return { heatmapData: [], maxValue: 0, xLabels: [], yLabels: [] }
    
    const minDist = Math.min(...distances)
    const maxDist = Math.max(...distances)
    const binSize = (maxDist - minDist) / 4
    
    const bins = Array(4).fill(0).map(() => ({ sum: 0, count: 0 }))
    
    filteredData.forEach(d => {
      if (d.earthsundistance != null && d.subjectivesynchro != null) {
        const binIndex = Math.min(3, Math.floor((d.earthsundistance - minDist) / binSize))
        bins[binIndex].sum += d.subjectivesynchro
        bins[binIndex].count++
      }
    })

    const heatmapData: any[] = []
    const maxValue = Math.max(...bins.map(bin => bin.count > 0 ? bin.sum / bin.count : 0))
    
    bins.forEach((bin, index) => {
      const avgValue = bin.count > 0 ? bin.sum / bin.count : 0
      const intensity = maxValue > 0 ? (avgValue / maxValue) : 0
      
      heatmapData.push({
        x: index,
        y: 0,
        value: avgValue.toFixed(1),
        intensity,
        label: `Bin ${index + 1}`
      })
    })

    return { 
      heatmapData, 
      maxValue, 
      xLabels: ['Near', 'Med-Near', 'Med-Far', 'Far'],
      yLabels: ['Earth-Sun Distance']
    }
  }

  const prepareMoonPhaseHeatmap = (filteredData: SynchroData[]) => {
    const phases = Array(8).fill(0).map(() => ({ sum: 0, count: 0 }))
    const phaseNames = ['New', 'Wax Cres', 'First Q', 'Wax Gib', 'Full', 'Wan Gib', 'Last Q', 'Wan Cres']
    
    filteredData.forEach(d => {
      if (d.moonphase != null && d.subjectivesynchro != null) {
        const phaseIndex = Math.floor((d.moonphase / 45)) % 8
        phases[phaseIndex].sum += d.subjectivesynchro
        phases[phaseIndex].count++
      }
    })

    const heatmapData: any[] = []
    const maxValue = Math.max(...phases.map(phase => phase.count > 0 ? phase.sum / phase.count : 0))
    
    phases.forEach((phase, index) => {
      const avgValue = phase.count > 0 ? phase.sum / phase.count : 0
      const intensity = maxValue > 0 ? (avgValue / maxValue) : 0
      
      heatmapData.push({
        x: index,
        y: 0,
        value: avgValue.toFixed(1),
        intensity,
        label: phaseNames[index]
      })
    })

    return { 
      heatmapData, 
      maxValue, 
      xLabels: phaseNames,
      yLabels: ['Moon Phase']
    }
  }

  // Process data for mood distribution (1-5 scale)
  const prepareMoodData = () => {
    const moodRanges = [
      { range: '1-2', min: 1, max: 2, color: '#ef4444', label: 'Very Low' },
      { range: '2-3', min: 2, max: 3, color: '#f97316', label: 'Low' },
      { range: '3-4', min: 3, max: 4, color: '#eab308', label: 'Neutral' },
      { range: '4-5', min: 4, max: 5, color: '#22c55e', label: 'Good' },
      { range: '5', min: 5, max: 5, color: '#10b981', label: 'Excellent' }
    ]

    return moodRanges.map(range => ({
      ...range,
      count: data.filter(d => 
        d.subjectivemood != null && 
        d.subjectivemood >= range.min && 
        d.subjectivemood <= range.max
      ).length
    }))
  }

  // Process correlation data with selectable variables
  const prepareCorrelationData = () => {
    return data
      .filter(d => d[correlationX] != null && d[correlationY] != null)
      .map(d => {
        const xValue = correlationX === 'sleepavg' ? convertSleepToHours(d[correlationX]) : d[correlationX]
        const yValue = correlationY === 'sleepavg' ? convertSleepToHours(d[correlationY]) : d[correlationY]
        
        return {
          x: xValue || 0,
          y: yValue || 0,
          date: d.date
        }
      })
  }

  const timelineData = prepareTimelineData()
  const { heatmapData, maxValue, xLabels, yLabels } = prepareHeatmapData()
  const moodData = prepareMoodData()
  const correlationData = prepareCorrelationData()

  const chartOptions = [
    { id: 'heatmap', label: 'Smart Heatmap', description: 'Visual patterns across time dimensions', icon: FireIcon },
    { id: 'timeline', label: 'Multi-Metric Timeline', description: 'Track multiple metrics over time', icon: ChartBarIcon },
    { id: 'mood', label: 'Mood Distribution', description: 'Your emotional patterns', icon: HeartIcon },
    { id: 'correlations', label: 'Correlation Explorer', description: 'Discover relationships between metrics', icon: ArrowTrendingUpIcon }
  ]

  const metricOptions = [
    { value: 'subjectivesynchro', label: 'Synchronicity', color: '#3399e6' },
    { value: 'subjectivemood', label: 'Mood', color: '#22c55e' },
    { value: 'productivity', label: 'Productivity', color: '#339999' },
    { value: 'sleepavg', label: 'Sleep (hours)', color: '#8b5cf6' },
    { value: 'stres', label: 'Stress', color: '#f59e0b' }
  ]

  const heatmapOptions = [
    { value: 'weeks', label: 'Weekly Pattern', icon: CalendarIcon },
    { value: 'months', label: 'Monthly Trends', icon: CalendarIcon },
    { value: 'years', label: 'Yearly Overview', icon: CalendarIcon },
    { value: 'dayOfWeek', label: 'Day of Week', icon: ClockIcon },
    { value: 'earthSunDistance', label: 'Earth-Sun Distance', icon: SunIcon },
    { value: 'moonPhase', label: 'Moon Phases', icon: MoonIcon }
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

  const EnhancedHeatmap = () => {
    const cellSize = heatmapType === 'years' || heatmapType === 'dayOfWeek' || heatmapType === 'earthSunDistance' || heatmapType === 'moonPhase' ? 60 : 40
    const gap = 2

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap justify-center gap-2">
          {heatmapOptions.map(option => {
            const Icon = option.icon
            return (
              <button
                key={option.value}
                onClick={() => setHeatmapType(option.value as HeatmapType)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  heatmapType === option.value
                    ? 'bg-gradient-primary text-white shadow-soft'
                    : 'bg-white text-text-secondary border border-gray-200 hover:border-primary-200 hover:text-text-primary'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            )
          })}
        </div>

        <div className="text-center">
          <h3 className="section-subheader">{heatmapOptions.find(h => h.value === heatmapType)?.label} Heatmap</h3>
          <p className="text-sm text-text-secondary">Darker colors indicate higher synchronicity levels</p>
        </div>
        
        <div className="overflow-x-auto w-full">
          <div className="flex flex-col items-center min-w-max">
            {/* Y-axis labels */}
            <div className="flex">
              <div className="w-20"></div>
              <div className="flex space-x-1">
                {xLabels.map((label, index) => (
                  <div 
                    key={index} 
                    className="text-xs text-text-muted text-center"
                    style={{ width: cellSize + gap }}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Heatmap grid */}
            <div className="flex flex-col space-y-1 mt-2">
              {yLabels.map((yLabel, yIndex) => (
                <div key={yIndex} className="flex items-center space-x-1">
                  <div className="w-20 text-xs text-text-muted text-right pr-2">
                    {yLabel}
                  </div>
                  <div className="flex space-x-1">
                    {xLabels.map((xLabel, xIndex) => {
                      const cellData = heatmapData.find(d => d.x === xIndex && d.y === yIndex)
                      const intensity = cellData?.intensity || 0
                      const value = cellData?.value || 0
                      const label = cellData?.label || `${xLabel}`
                      
                      return (
                        <div
                          key={`${yIndex}-${xIndex}`}
                          className="group relative cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-soft rounded-lg tooltip flex items-center justify-center text-xs font-semibold"
                          style={{
                            width: cellSize,
                            height: cellSize,
                            backgroundColor: getHeatmapColor(intensity),
                            border: '1px solid #e5e7eb',
                            color: intensity > 0.5 ? 'white' : '#374151'
                          }}
                          data-tooltip={`${label}: ${value}`}
                        >
                          {heatmapType === 'dayOfWeek' || heatmapType === 'earthSunDistance' || heatmapType === 'moonPhase' || heatmapType === 'years' ? value : ''}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-4 text-xs text-text-secondary">
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
          <span className="ml-4 badge badge-primary">Range: 1-5</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="section-header">Enhanced Analytics</h2>
        <p className="text-text-secondary text-lg">
          Discover patterns and insights in your synchronicity journey
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
                  ? 'bg-gradient-primary text-white shadow-medium'
                  : 'bg-white text-text-secondary border border-gray-200 hover:border-primary-300 hover:shadow-soft hover:scale-105'
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
        {selectedChart === 'heatmap' && <EnhancedHeatmap />}

        {selectedChart === 'timeline' && (
          <div className="space-y-6">
            <div className="flex flex-wrap justify-center gap-2">
              <span className="text-sm font-medium text-text-primary py-2">Select metrics:</span>
              {metricOptions.map(metric => (
                <button
                  key={metric.value}
                  onClick={() => {
                    const currentMetrics = [...timelineMetrics]
                    const index = currentMetrics.indexOf(metric.value as TimelineMetric)
                    if (index >= 0) {
                      currentMetrics.splice(index, 1)
                    } else {
                      currentMetrics.push(metric.value as TimelineMetric)
                    }
                    setTimelineMetrics(currentMetrics)
                  }}
                  className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                    timelineMetrics.includes(metric.value as TimelineMetric)
                      ? 'text-white shadow-soft'
                      : 'bg-white text-text-secondary border border-gray-200 hover:border-primary-200'
                  }`}
                  style={timelineMetrics.includes(metric.value as TimelineMetric) ? {
                    backgroundColor: metric.color
                  } : {}}
                >
                  {metric.label}
                </button>
              ))}
            </div>
            
            <h3 className="section-subheader text-center">Multi-Metric Timeline</h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f7" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    tick={{ fontSize: 12, fill: '#4a5568' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#4a5568' }}
                    domain={[0, 'dataMax']}
                  />
                  <Tooltip 
                    labelFormatter={(value) => formatDate(value as string)}
                    formatter={(value, name) => [
                      name === 'sleepavg' ? `${Number(value).toFixed(1)}h` : Number(value).toFixed(1),
                      metricOptions.find(m => m.value === name)?.label || name
                    ]}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  {timelineMetrics.map(metric => {
                    const metricConfig = metricOptions.find(m => m.value === metric)
                    return (
                      <Line 
                        key={metric}
                        type="monotone" 
                        dataKey={metric} 
                        stroke={metricConfig?.color || '#3399e6'} 
                        strokeWidth={3}
                        name={metric}
                        dot={{ fill: metricConfig?.color, strokeWidth: 2, r: 4 }}
                        connectNulls={false}
                      />
                    )
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {selectedChart === 'mood' && (
          <div>
            <h3 className="section-subheader text-center">Mood Distribution (1-5 Scale)</h3>
            <div className="h-96 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={moodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ count, label }) => `${label}: ${count}`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {moodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [value, 'Count']}
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
          <div className="space-y-6">
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-text-primary">X-Axis:</span>
                <select
                  value={correlationX}
                  onChange={(e) => setCorrelationX(e.target.value as CorrelationMetric)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {metricOptions.map(metric => (
                    <option key={metric.value} value={metric.value}>{metric.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-text-primary">Y-Axis:</span>
                <select
                  value={correlationY}
                  onChange={(e) => setCorrelationY(e.target.value as CorrelationMetric)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {metricOptions.map(metric => (
                    <option key={metric.value} value={metric.value}>{metric.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <h3 className="section-subheader text-center">
              {metricOptions.find(m => m.value === correlationX)?.label} vs {metricOptions.find(m => m.value === correlationY)?.label}
            </h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={correlationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f7" />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name={metricOptions.find(m => m.value === correlationX)?.label}
                    tick={{ fontSize: 12, fill: '#4a5568' }}
                    domain={[0, 'dataMax']}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name={metricOptions.find(m => m.value === correlationY)?.label}
                    tick={{ fontSize: 12, fill: '#4a5568' }}
                    domain={[0, 'dataMax']}
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value, name) => [
                      Number(value).toFixed(1), 
                      name === 'x' ? metricOptions.find(m => m.value === correlationX)?.label : 
                      metricOptions.find(m => m.value === correlationY)?.label
                    ]}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Scatter name="Data Points" fill="#3399e6" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}