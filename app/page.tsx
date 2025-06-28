'use client'

import { useState, useEffect } from 'react'
import { SynchroData, fetchAllData } from '../lib/supabase'
import AnalyticsSection from '../components/AnalyticsSection'
import InputSection from '../components/InputSection'
import SummarySection from '../components/SummarySection'
import ViewSection from '../components/ViewSection'
import Navigation from '../components/Navigation'
import { 
  ChartBarIcon, 
  PlusIcon, 
  DocumentTextIcon, 
  EyeIcon,
  SparklesIcon,
  ArrowDownTrayIcon,
  Cog6ToothIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

type TabType = 'summary' | 'analytics' | 'input' | 'view'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('summary')
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
      const fetchedData = await fetchAllData()
      setData(fetchedData)
      setError(null)
    } catch (err) {
      setError('Failed to load data from database')
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const onDataUpdate = () => {
    loadData() // Reload data when new entries are added
  }

  const exportData = (format: 'json' | 'csv') => {
    if (format === 'json') {
      const dataStr = JSON.stringify(data, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `synchronicity-data-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } else if (format === 'csv') {
      if (data.length === 0) return
      
      const headers = Object.keys(data[0]).join(',')
      const rows = data.map(row => 
        Object.values(row).map(value => 
          typeof value === 'string' ? `"${value}"` : value || ''
        ).join(',')
      )
      const csvContent = [headers, ...rows].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `synchronicity-data-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    }
    setShowExportModal(false)
  }

  const tabs = [
    { id: 'summary', label: 'Summary', icon: DocumentTextIcon, description: 'Overview & insights' },
    { id: 'analytics', label: 'Analytics', icon: ChartBarIcon, description: 'Charts & patterns' },
    { id: 'input', label: 'Add Entry', icon: PlusIcon, description: 'Record new data' },
    { id: 'view', label: 'Browse Data', icon: EyeIcon, description: 'View & filter entries' },
  ]

  const quickStats = {
    totalEntries: data.length,
    avgSynchronicity: data.length > 0 
      ? (data.filter(d => d.subjectiveSynchro != null)
          .reduce((sum, d) => sum + (d.subjectiveSynchro || 0), 0) / 
         data.filter(d => d.subjectiveSynchro != null).length).toFixed(1)
      : '0',
    lastEntry: data.length > 0 && data[0]?.date 
      ? new Date(data[0].date).toLocaleDateString()
      : 'No entries',
    totalEvents: data.reduce((sum, d) => sum + (d.synchroSum || 0), 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cosmic-50 via-white to-synchro-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="relative">
              <SparklesIcon className="h-16 w-16 text-cosmic-500 mx-auto animate-spin" />
              <div className="absolute inset-0 h-16 w-16 text-synchro-500 mx-auto animate-ping">
                <SparklesIcon className="h-16 w-16" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xl font-semibold text-gray-700">Loading synchronicity data...</p>
              <p className="text-sm text-gray-500">Connecting to the cosmic database</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <InformationCircleIcon className="h-8 w-8 text-red-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-red-800">Connection Error</h2>
            <p className="text-red-600 max-w-md">{error}</p>
          </div>
          <button 
            onClick={loadData}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cosmic-50 via-white to-synchro-50">
      {/* Header */}
      <header className="relative overflow-hidden bg-white shadow-lg border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-r from-cosmic-500/5 to-synchro-500/5" />
        <div className="relative container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center items-center space-x-3">
              <div className="relative">
                <SparklesIcon className="h-12 w-12 text-cosmic-600" />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-synchro-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{quickStats.totalEntries}</span>
                </div>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cosmic-600 via-synchro-600 to-cosmic-600 bg-clip-text text-transparent">
                Synchronicity Tracker
              </h1>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Track patterns, synchronicities, and life metrics to discover the hidden connections in your universe
            </p>
            
            {/* Quick Stats Bar */}
            <div className="flex flex-wrap justify-center gap-6 mt-6">
              {[
                { label: 'Total Entries', value: quickStats.totalEntries, icon: '📊' },
                { label: 'Avg Synchronicity', value: quickStats.avgSynchronicity, icon: '✨' },
                { label: 'Total Events', value: quickStats.totalEvents, icon: '🎯' },
                { label: 'Last Entry', value: quickStats.lastEntry, icon: '📅' }
              ].map((stat, index) => (
                <div key={index} className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                  <span className="text-lg">{stat.icon}</span>
                  <div className="text-left">
                    <div className="text-sm text-gray-600">{stat.label}</div>
                    <div className="font-bold text-gray-900">{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation with enhanced styling */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-2 inline-flex space-x-1 border border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`
                    group relative flex items-center space-x-3 px-6 py-4 rounded-xl transition-all duration-300 transform hover:scale-105
                    ${isActive 
                      ? 'bg-gradient-to-r from-cosmic-500 to-synchro-500 text-white shadow-lg' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">{tab.label}</div>
                    <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                      {tab.description}
                    </div>
                  </div>
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors duration-200"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Export</span>
            </button>
          </div>
          
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Main Content */}
        <main className="relative">
          {activeTab === 'summary' && (
            <SummarySection data={data} />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsSection data={data} />
          )}
          {activeTab === 'input' && (
            <InputSection onDataUpdate={onDataUpdate} />
          )}
          {activeTab === 'view' && (
            <ViewSection data={data} onDataUpdate={onDataUpdate} />
          )}
        </main>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Data</h3>
            <p className="text-gray-600 text-sm mb-6">
              Choose the format to export your synchronicity data
            </p>
            <div className="space-y-3">
              <button
                onClick={() => exportData('json')}
                className="w-full flex items-center justify-between p-4 bg-cosmic-50 hover:bg-cosmic-100 rounded-lg border border-cosmic-200 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-cosmic-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">JSON</span>
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">JSON Format</div>
                    <div className="text-xs text-gray-500">Structured data format</div>
                  </div>
                </div>
                <ArrowDownTrayIcon className="h-5 w-5 text-cosmic-600" />
              </button>
              
              <button
                onClick={() => exportData('csv')}
                className="w-full flex items-center justify-between p-4 bg-synchro-50 hover:bg-synchro-100 rounded-lg border border-synchro-200 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-synchro-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">CSV</span>
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">CSV Format</div>
                    <div className="text-xs text-gray-500">Spreadsheet compatible</div>
                  </div>
                </div>
                <ArrowDownTrayIcon className="h-5 w-5 text-synchro-600" />
              </button>
            </div>
            
            <button
              onClick={() => setShowExportModal(false)}
              className="w-full mt-6 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 bg-gradient-to-r from-cosmic-900 to-synchro-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center items-center space-x-2">
              <SparklesIcon className="h-6 w-6" />
              <span className="font-semibold">Synchronicity Tracker</span>
            </div>
            <p className="text-white/70 text-sm max-w-md mx-auto">
              Discover the patterns in your life and connect with the universe's hidden rhythms.
            </p>
            <div className="text-white/50 text-xs">
              Made with ✨ for consciousness exploration
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}