'use client'

import { useState, useEffect } from 'react'
import { SynchroData, fetchAllData, fetchAllDataPaginated} from '../lib/supabase'
import { convertSleepToHours } from '../lib/utils'
import AnalyticsSection from '../components/AnalyticsSection'
import InputSection from '../components/InputSection'
import SummarySection from '../components/SummarySection'
import ViewSection from '../components/ViewSection'
import { 
  ChartBarIcon, 
  PlusIcon, 
  EyeIcon,
  Cog6ToothIcon,
  ArrowDownTrayIcon,
  HomeIcon,
  UserIcon,
  SignalIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

type TabType = 'overview' | 'analytics' | 'input' | 'data'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [data, setData] = useState<SynchroData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showExportModal, setShowExportModal] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Try to fetch all data with high limit first
      try {
        console.log('Fetching all data with high limit...')
        const fetchedData = await fetchAllData({ limit: 20000 }) // Set very high limit
        console.log(`Successfully loaded ${fetchedData.length} records`)
        setData(fetchedData)
      } catch (limitError) {
        console.warn('High limit fetch failed, trying paginated approach:', limitError)
        // Fallback to paginated approach if high limit fails
        const fetchedData = await fetchAllDataPaginated()
        console.log(`Successfully loaded ${fetchedData.length} records via pagination`)
        setData(fetchedData)
      }
    } catch (err) {
      setError('Failed to load data from database')
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const onDataUpdate = () => {
    loadData()
  }

  const exportData = (format: 'json' | 'csv') => {
    if (format === 'json') {
      // Convert sleep from minutes to hours for export
      const exportData = data.map(entry => ({
        ...entry,
        sleepavg: entry.sleepavg ? convertSleepToHours(entry.sleepavg) : entry.sleepavg
      }))
      
      const dataStr = JSON.stringify(exportData, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `synchronicity-data-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } else if (format === 'csv') {
      // Safely access the first element for headers
      const [first] = data;
      if (!first) return; // Exit if data is empty

      // Create headers
      const allKeys = new Set<string>()
      data.forEach(row => {
        Object.keys(row).forEach(key => allKeys.add(key))
      })
      
      const headers = Array.from(allKeys).sort()
      const csvHeaders = headers.join(',')
      
      // Create rows with proper sleep conversion for display
      const rows = data.map(row => 
        headers.map(header => {
          let value = row[header as keyof SynchroData]
          
          // Convert sleep from minutes to hours for export
          if (header === 'sleepavg' && typeof value === 'number') {
            value = convertSleepToHours(value)
          }
          
          // Handle different data types
          if (value === null || value === undefined) {
            return ''
          } else if (typeof value === 'string') {
            return `"${value.replace(/"/g, '""')}"` // Escape quotes
          } else {
            return value.toString()
          }
        }).join(',')
      )
      
      const csvContent = [csvHeaders, ...rows].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `synchronicity-data-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setShowExportModal(false);
  };

  const tabs = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: HomeIcon,
      description: 'Dashboard summary'
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: ChartBarIcon,
      description: 'Patterns & insights'
    },
    { 
      id: 'input', 
      label: 'Add Entry', 
      icon: PlusIcon,
      description: 'Record new data'
    },
    { 
      id: 'data', 
      label: 'Browse Data', 
      icon: EyeIcon,
      description: 'Explore records'
    },
  ]

  // Calculate quick stats with proper sleep conversion
  const quickStats = {
    totalEntries: data.length,
    avgSynchronicity: data.length > 0 
      ? (data.filter(d => d.subjectivesynchro != null)
          .reduce((sum, d) => sum + (d.subjectivesynchro || 0), 0) / 
         data.filter(d => d.subjectivesynchro != null).length).toFixed(1)
      : '0',
    lastEntry: data.length > 0 && data[0]?.date 
      ? new Date(data[0].date).toLocaleDateString()
      : 'No entries',
    totalEvents: data.reduce((sum, d) => sum + (d.synchrosum || 0), 0),
    avgSleep: data.length > 0
      ? (data.filter(d => d.sleepavg != null)
          .reduce((sum, d) => sum + convertSleepToHours(d.sleepavg || 0), 0) / 
         data.filter(d => d.sleepavg != null).length).toFixed(1)
      : '0'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 w-20 h-20 bg-primary-100 rounded-full animate-ping opacity-20"></div>
            </div>
            <div className="space-y-3">
              <p className="text-2xl font-bold text-text-primary">Loading Dashboard</p>
              <p className="text-sm text-text-secondary">Connecting to your synchronicity data...</p>
              <div className="flex justify-center space-x-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"
                    style={{
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: '1s'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto shadow-soft">
            <span className="text-red-600 text-3xl">⚠</span>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-red-800">Connection Error</h2>
            <p className="text-red-600 max-w-md">{error}</p>
            <p className="text-sm text-text-muted">Check your internet connection and try again</p>
          </div>
          <button 
            onClick={loadData}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header */}
      <header className="bg-white border-b border-gray-200 shadow-soft sticky top-0 z-40">
        <div className="container mx-auto container-padding">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Title */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-soft">
                <SignalIcon className="text-white h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-text-primary">Synchronicity Tracker</h1>
                <p className="text-xs text-text-secondary">1-5 Scale Analytics</p>
              </div>
            </div>

            {/* Enhanced Quick Stats */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="text-center p-2 rounded-lg bg-primary-50 border border-primary-200">
                <div className="text-lg font-bold text-primary-600">{quickStats.totalEntries}</div>
                <div className="text-xs text-text-secondary">Entries</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-green-50 border border-green-200">
                <div className="text-lg font-bold text-green-600">{quickStats.avgSynchronicity}</div>
                <div className="text-xs text-text-secondary">Avg Sync</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-accent-50 border border-accent-200">
                <div className="text-lg font-bold text-accent-600">{quickStats.totalEvents}</div>
                <div className="text-xs text-text-secondary">Events</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-purple-50 border border-purple-200">
                <div className="text-lg font-bold text-purple-600">{quickStats.avgSleep}h</div>
                <div className="text-xs text-text-secondary">Avg Sleep</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowExportModal(true)}
                className="btn-ghost relative"
                title="Export Data"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                {data.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full"></div>
                )}
              </button>
              <button className="btn-ghost" title="Settings">
                <Cog6ToothIcon className="h-5 w-5" />
              </button>
              <button className="btn-ghost" title="Profile">
                <UserIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-soft">
        <div className="container mx-auto container-padding">
          <div className="flex space-x-1 py-4 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`
                    flex items-center space-x-3 px-6 py-3 rounded-xl font-medium transition-all duration-200 min-w-max
                    ${isActive 
                      ? 'bg-gradient-primary text-white shadow-medium transform scale-105' 
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary hover:shadow-soft'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">{tab.label}</div>
                    <div className={`text-xs ${isActive ? 'text-white/80' : 'text-text-muted'}`}>
                      {tab.description}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto container-padding py-8">
        <div className="fade-in">
          {activeTab === 'overview' && (
            <SummarySection data={data} />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsSection data={data} />
          )}
          {activeTab === 'input' && (
            <InputSection onDataUpdate={onDataUpdate} />
          )}
          {activeTab === 'data' && (
            <ViewSection data={data} onDataUpdate={onDataUpdate} />
          )}
        </div>
      </main>

      {/* Enhanced Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-strong p-8 max-w-md w-full mx-4 scale-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ArrowDownTrayIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Export Your Data</h3>
              <p className="text-text-secondary text-sm">
                Download your synchronicity records in your preferred format
              </p>
              <div className="mt-2 text-sm font-medium text-primary-600">
                Ready to export {data.length} records
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <button
                onClick={() => exportData('json')}
                className="w-full flex items-center justify-between p-4 bg-primary-50 hover:bg-primary-100 rounded-xl border-2 border-primary-200 hover:border-primary-300 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <span className="text-white font-bold text-sm">JSON</span>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-text-primary">JSON Format</div>
                    <div className="text-xs text-text-secondary">Structured data with sleep in hours</div>
                  </div>
                </div>
                <ArrowDownTrayIcon className="h-5 w-5 text-primary-600" />
              </button>
              
              <button
                onClick={() => exportData('csv')}
                className="w-full flex items-center justify-between p-4 bg-accent-50 hover:bg-accent-100 rounded-xl border-2 border-accent-200 hover:border-accent-300 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-accent-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <span className="text-white font-bold text-sm">CSV</span>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-text-primary">CSV Format</div>
                    <div className="text-xs text-text-secondary">Spreadsheet compatible format</div>
                  </div>
                </div>
                <ArrowDownTrayIcon className="h-5 w-5 text-accent-600" />
              </button>
            </div>

            <div className="bg-surface-secondary rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 text-sm text-text-secondary">
                <ClockIcon className="h-4 w-4" />
                <span>Sleep values will be converted to hours for export</span>
              </div>
            </div>
            
            <button
              onClick={() => setShowExportModal(false)}
              className="w-full btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Status Bar */}
      <div className="fixed bottom-4 right-4 z-30">
        <div className="flex items-center space-x-3 bg-white rounded-xl shadow-strong border border-gray-200 px-4 py-3">
          <div className="flex items-center space-x-2">
            <div className="status-active animate-pulse"></div>
            <span className="text-xs font-medium text-text-secondary">Connected</span>
          </div>
          <div className="h-4 w-px bg-gray-300"></div>
          <div className="text-xs text-text-muted">
            {data.length} records
          </div>
        </div>
      </div>

      {/* Mobile Quick Stats */}
      <div className="lg:hidden fixed bottom-20 left-4 right-4 z-20">
        <div className="bg-white rounded-xl shadow-strong border border-gray-200 p-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-primary-600">{quickStats.totalEntries}</div>
              <div className="text-xs text-text-secondary">Entries</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">{quickStats.avgSynchronicity}</div>
              <div className="text-xs text-text-secondary">Sync</div>
            </div>
            <div>
              <div className="text-lg font-bold text-accent-600">{quickStats.totalEvents}</div>
              <div className="text-xs text-text-secondary">Events</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">{quickStats.avgSleep}h</div>
              <div className="text-xs text-text-secondary">Sleep</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}