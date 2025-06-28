'use client'

import { useState, useMemo } from 'react'
import { SynchroData } from '../lib/supabase'
import { 
  MagnifyingGlassIcon, 
  AdjustmentsHorizontalIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FunnelIcon,
  EyeIcon,
  TrashIcon,
  PencilIcon,
  ChartBarIcon,
  SparklesIcon,
  HeartIcon,
  MoonIcon
} from '@heroicons/react/24/outline'
import { format, parseISO } from 'date-fns'

interface ViewSectionProps {
  data: SynchroData[]
  onDataUpdate: () => void
}

type SortField = 'date' | 'subjectiveSynchro' | 'subjectiveMood' | 'productivity' | 'synchroSum' | 'sleepAvg'
type SortDirection = 'asc' | 'desc'

export default function ViewSection({ data }: ViewSectionProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' })
  const [rangeFilters, setRangeFilters] = useState({
    synchroMin: 0,
    synchroMax: 10,
    moodMin: 0,
    moodMax: 10
  })
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [selectedEntries, setSelectedEntries] = useState<Set<number>>(new Set())
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = data

    // Apply date filter
    if (dateFilter.start) {
      filtered = filtered.filter(d => d.date && d.date >= dateFilter.start)
    }
    if (dateFilter.end) {
      filtered = filtered.filter(d => d.date && d.date <= dateFilter.end)
    }

    // Apply range filters
    filtered = filtered.filter(d => {
      const synchro = d.subjectiveSynchro ?? 0
      const mood = d.subjectiveMood ?? 0
      return synchro >= rangeFilters.synchroMin && synchro <= rangeFilters.synchroMax &&
             mood >= rangeFilters.moodMin && mood <= rangeFilters.moodMax
    })

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(d => 
        d.date?.toLowerCase().includes(term) ||
        d.day_of_the_week?.toLowerCase().includes(term) ||
        d.moonPhase?.toLowerCase().includes(term) ||
        d.id?.toString().includes(term)
      )
    }

    // Sort data
    filtered.sort((a, b) => {
      let aVal = a[sortField]
      let bVal = b[sortField]

      // Handle null/undefined values
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1

      // Convert to numbers if needed
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        if (sortField === 'date') {
          aVal = new Date(aVal).getTime()
          bVal = new Date(bVal).getTime()
        } else {
          aVal = aVal.toLowerCase()
          bVal = bVal.toLowerCase()
        }
      }

      const result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return sortDirection === 'asc' ? result : -result
    })

    return filtered
  }, [data, searchTerm, dateFilter, rangeFilters, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage)
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const toggleSelectEntry = (id: number) => {
    const newSelected = new Set(selectedEntries)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedEntries(newSelected)
  }

  const selectAllVisible = () => {
    const newSelected = new Set(selectedEntries)
    paginatedData.forEach(entry => {
      if (entry.id) newSelected.add(entry.id)
    })
    setSelectedEntries(newSelected)
  }

  const clearSelection = () => {
    setSelectedEntries(new Set())
  }

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A'
    try {
      return format(parseISO(dateStr), 'MMM dd, yyyy')
    } catch {
      return dateStr
    }
  }

  const getIntensityColor = (value: number | undefined, max: number = 10) => {
    if (!value) return 'bg-gray-100'
    const intensity = value / max
    if (intensity >= 0.8) return 'bg-green-500'
    if (intensity >= 0.6) return 'bg-green-400'
    if (intensity >= 0.4) return 'bg-yellow-400'
    if (intensity >= 0.2) return 'bg-orange-400'
    return 'bg-red-400'
  }

  const SortHeader = ({ field, children }: { field: SortField, children: React.ReactNode }) => (
    <th 
      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors duration-200"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field && (
          <div className="flex flex-col">
            {sortDirection === 'asc' 
              ? <ArrowUpIcon className="h-4 w-4 text-cosmic-600" />
              : <ArrowDownIcon className="h-4 w-4 text-cosmic-600" />
            }
          </div>
        )}
      </div>
    </th>
  )

  const EntryCard = ({ entry }: { entry: SynchroData }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <span className="font-semibold text-gray-900">{formatDate(entry.date)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedEntries.has(entry.id!)}
              onChange={() => toggleSelectEntry(entry.id!)}
              className="rounded text-cosmic-600 focus:ring-cosmic-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-cosmic-50 rounded-lg">
            <SparklesIcon className="h-5 w-5 text-cosmic-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-cosmic-700">
              {entry.subjectiveSynchro?.toFixed(1) || 'N/A'}
            </div>
            <div className="text-xs text-gray-500">Synchronicity</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <HeartIcon className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-green-700">
              {entry.subjectiveMood?.toFixed(1) || 'N/A'}
            </div>
            <div className="text-xs text-gray-500">Mood</div>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Events: {entry.synchroSum || 0}</span>
          <span>Sleep: {entry.sleepAvg?.toFixed(1) || 'N/A'}h</span>
          <span>{entry.day_of_the_week || 'N/A'}</span>
        </div>

        {entry.moonPhase && (
          <div className="mt-3 text-xs text-gray-500 text-center">
            🌙 {entry.moonPhase}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cosmic-600 to-synchro-600 bg-clip-text text-transparent mb-2">
          Browse Data
        </h2>
        <p className="text-gray-600 text-lg">
          Explore and analyze your synchronicity records
        </p>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by date, day, moon phase, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input-field"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'table' ? 'bg-white shadow text-cosmic-600' : 'text-gray-500'
              }`}
            >
              <ChartBarIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'cards' ? 'bg-white shadow text-cosmic-600' : 'text-gray-500'
              }`}
            >
              <EyeIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              showFilters 
                ? 'bg-gradient-to-r from-cosmic-500 to-synchro-500 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FunnelIcon className="h-5 w-5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={dateFilter.start}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={dateFilter.end}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                  className="input-field"
                />
              </div>
            </div>

            {/* Range Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Synchronicity Range: {rangeFilters.synchroMin} - {rangeFilters.synchroMax}
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={rangeFilters.synchroMin}
                    onChange={(e) => setRangeFilters(prev => ({ ...prev, synchroMin: parseFloat(e.target.value) }))}
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={rangeFilters.synchroMax}
                    onChange={(e) => setRangeFilters(prev => ({ ...prev, synchroMax: parseFloat(e.target.value) }))}
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Mood Range: {rangeFilters.moodMin} - {rangeFilters.moodMax}
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={rangeFilters.moodMin}
                    onChange={(e) => setRangeFilters(prev => ({ ...prev, moodMin: parseFloat(e.target.value) }))}
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={rangeFilters.moodMax}
                    onChange={(e) => setRangeFilters(prev => ({ ...prev, moodMax: parseFloat(e.target.value) }))}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setDateFilter({ start: '', end: '' })
                  setRangeFilters({ synchroMin: 0, synchroMax: 10, moodMin: 0, moodMax: 10 })
                  setSearchTerm('')
                }}
                className="btn-secondary text-sm"
              >
                Clear All Filters
              </button>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
          </div>
        )}

        {/* Selection Actions */}
        {selectedEntries.size > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedEntries.size} entries selected
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearSelection}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div>
            Showing {paginatedData.length} of {filteredAndSortedData.length} entries
            {filteredAndSortedData.length !== data.length && ` (filtered from ${data.length} total)`}
          </div>
          {filteredAndSortedData.length > itemsPerPage && (
            <button
              onClick={selectAllVisible}
              className="text-cosmic-600 hover:text-cosmic-700 font-medium"
            >
              Select all visible
            </button>
          )}
        </div>
      </div>

      {/* Data Display */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      onChange={selectAllVisible}
                      className="rounded text-cosmic-600 focus:ring-cosmic-500"
                    />
                  </th>
                  <SortHeader field="date">Date</SortHeader>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Day
                  </th>
                  <SortHeader field="subjectiveSynchro">Synchronicity</SortHeader>
                  <SortHeader field="subjectiveMood">Mood</SortHeader>
                  <SortHeader field="productivity">Productivity</SortHeader>
                  <SortHeader field="synchroSum">Events</SortHeader>
                  <SortHeader field="sleepAvg">Sleep</SortHeader>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Moon Phase
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedEntries.has(entry.id!)}
                        onChange={() => toggleSelectEntry(entry.id!)}
                        className="rounded text-cosmic-600 focus:ring-cosmic-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{formatDate(entry.date)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {entry.day_of_the_week || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getIntensityColor(entry.subjectiveSynchro)}`} />
                        <span className="font-medium">{entry.subjectiveSynchro?.toFixed(1) || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getIntensityColor(entry.subjectiveMood)}`} />
                        <span className="font-medium">{entry.subjectiveMood?.toFixed(1) || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.productivity?.toFixed(1) || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      <span className="px-2 py-1 bg-synchro-100 text-synchro-800 rounded-full text-xs">
                        {entry.synchroSum || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <MoonIcon className="h-4 w-4 text-purple-500" />
                        <span>{entry.sleepAvg?.toFixed(1) || 'N/A'}h</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {entry.moonPhase || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedData.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <span className="text-sm text-gray-500">
                ({filteredAndSortedData.length} total entries)
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages, currentPage - 2 + i))
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? 'bg-gradient-to-r from-cosmic-500 to-synchro-500 text-white'
                        : 'bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      )}

      {paginatedData.length === 0 && (
        <div className="text-center py-20">
          <div className="relative">
            <MagnifyingGlassIcon className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <div className="absolute inset-0 h-24 w-24 text-cosmic-200 mx-auto animate-pulse">
              <MagnifyingGlassIcon className="h-24 w-24" />
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-gray-600">No entries found</h3>
            <p className="text-gray-500 text-lg max-w-md mx-auto">
              Try adjusting your search or filter criteria to find matching entries.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}