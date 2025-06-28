'use client'

import { useState, useEffect } from 'react'
import { SynchroData, fetchAllData} from '../lib/supabase'
import AnalyticsSection from '../components/AnalyticsSection'
import InputSection from '../components/InputSection'
import SummarySection from '../components/SummarySection'
import ViewSection from '../components/ViewSection'
import { 
  ChartBarIcon, 
  PlusIcon, 
  DocumentTextIcon, 
  EyeIcon,
  Cog6ToothIcon,
  ArrowDownTrayIcon,
  HomeIcon,
  BellIcon,
  UserIcon
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
    loadData()
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
    { id: 'overview', label: 'Overview', icon: HomeIcon },
    { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
    { id: 'input', label: 'Add Entry', icon: PlusIcon },
    { id: 'data', label: 'Data', icon: EyeIcon },
  ]

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
    totalEvents: data.reduce((sum, d) => sum + (d.synchrosum || 0), 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto"></div>
            </div>
            <div className="space-y-2">
              <p className="text-xl font-semibold text-text-primary">Loading dashboard...</p>
              <p className="text-sm text-text-secondary">Fetching your data</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-red-600 text-2xl">⚠</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-red-800">Connection Error</h2>
            <p className="text-red-600 max-w-md">{error}</p>
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
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-soft">
        <div className="container mx-auto container-padding">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Title */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <h1 className="text-xl font-bold text-text-primary">Synchronicity Tracker</h1>
            </div>

            {/* Quick Stats */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-lg font-bold text-text-primary">{quickStats.totalEntries}</div>
                <div className="text-xs text-text-secondary">Entries</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-text-primary">{quickStats.avgSynchronicity}</div>
                <div className="text-xs text-text-secondary">Avg Score</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-text-primary">{quickStats.totalEvents}</div>
                <div className="text-xs text-text-secondary">Events</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowExportModal(true)}
                className="btn-ghost"
                title="Export Data"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
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

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto container-padding">
          <div className="flex space-x-1 py-4">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-primary text-white shadow-soft' 
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
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

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-strong p-6 max-w-md w-full mx-4 scale-in">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Export Data</h3>
            <p className="text-text-secondary text-sm mb-6">
              Choose the format to export your synchronicity data
            </p>
            <div className="space-y-3">
              <button
                onClick={() => exportData('json')}
                className="w-full flex items-center justify-between p-4 bg-primary-50 hover:bg-primary-100 rounded-lg border border-primary-200 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">JSON</span>
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-text-primary">JSON Format</div>
                    <div className="text-xs text-text-secondary">Structured data format</div>
                  </div>
                </div>
                <ArrowDownTrayIcon className="h-5 w-5 text-primary-600" />
              </button>
              
              <button
                onClick={() => exportData('csv')}
                className="w-full flex items-center justify-between p-4 bg-accent-50 hover:bg-accent-100 rounded-lg border border-accent-200 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent-400 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">CSV</span>
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-text-primary">CSV Format</div>
                    <div className="text-xs text-text-secondary">Spreadsheet compatible</div>
                  </div>
                </div>
                <ArrowDownTrayIcon className="h-5 w-5 text-accent-600" />
              </button>
            </div>
            
            <button
              onClick={() => setShowExportModal(false)}
              className="w-full mt-6 btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="fixed bottom-4 right-4">
        <div className="flex items-center space-x-2 bg-white rounded-lg shadow-soft border border-gray-200 px-3 py-2">
          <div className="status-active"></div>
          <span className="text-xs text-text-secondary">Connected</span>
        </div>
      </div>
    </div>
  )
}