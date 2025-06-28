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
  SparklesIcon 
} from '@heroicons/react/24/outline'

type TabType = 'summary' | 'analytics' | 'input' | 'view'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('summary')
  const [data, setData] = useState<SynchroData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const tabs = [
    { id: 'summary', label: 'Summary', icon: DocumentTextIcon },
    { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
    { id: 'input', label: 'Add Entry', icon: PlusIcon },
    { id: 'view', label: 'Browse Data', icon: EyeIcon },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <SparklesIcon className="h-12 w-12 text-cosmic-500 mx-auto mb-4 animate-spin" />
          <p className="text-lg text-gray-600">Loading synchronicity data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadData}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cosmic-50 to-synchro-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-2">
            Synchronicity Tracker
          </h1>
          <p className="text-gray-600 text-lg">
            Track patterns, synchronicities, and life metrics
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Total entries: {data.length}
          </div>
        </div>

        {/* Navigation */}
        <Navigation 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Main Content */}
        <div className="mt-8">
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
        </div>
      </div>
    </div>
  )
}