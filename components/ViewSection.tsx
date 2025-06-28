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
  Squares2X2Icon,
  ListBulletIcon,
  BoltIcon,
  HeartIcon,
  MoonIcon
} from '@heroicons/react/24/outline'
import { format, parseISO } from 'date-fns'

interface ViewSectionProps {
  data: SynchroData[]
  onDataUpdate: () => void
}

type SortField = 'date' | 'subjectivesynchro' | 'subjectivemood' | 'productivity' | 'synchrosum' | 'sleepavg'
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
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards')

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
      const synchro = d.subjectivesynchro ?? 0
      const mood = d.subjectivemood ?? 0
      return synchro >= rangeFilters.synchroMin && synchro <= rangeFilters.synchroMax &&
             mood >= rangeFilters.moodMin && mood <= rangeFilters.moodMax
    })

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(d => 
        d.date?.toLowerCase().includes(term) ||
        d.day_of_the_week?.toLowerCase().includes(term) ||
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

  const getValueColor = (value: number | undefined, max: number = 10) => {
    if (!value) return 'text-text-muted'
    const intensity = value / max
    if (intensity >= 0.8) return 'text-green-600'
    if (intensity >= 0.6) return 'text-green-500'
    if (intensity >= 0.4) return 'text-yellow-600'
    if (intensity >= 0.2) return 'text-orange-500'
    return 'text-red-500'
  }

  const SortHeader = ({ field, children }: { field: SortField, children: React.ReactNode }) => (
    <th 
      className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-surface-secondary transition-colors duration-200"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field && (
          <div className="flex flex-col">
            {sortDirection === 'asc' 
              ? <ArrowUpIcon className="h-4 w-4 text-primary-600" />
              : <ArrowDownIcon className="h-4 w-4 text-primary-600" />
            }
          </div>
        )}
      </div>
    </th>
  )

  const EntryCard = ({ entry }: { entry: SynchroData }) => (
    <div className="card-interactive group">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <CalendarIcon className="h-5 w-5 text-text-muted" />
            <span className="font-semibold text-text-primary">{formatDate(entry.date)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedEntries.has(entry.id!)}
              onChange={() => toggleSelectEntry(entry.id!)}
              className="rounded text-primary-600 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-primary-50 rounded-lg">
            <BoltIcon className="h-5 w-5 text-primary-600 mx-auto mb-1" />
            <div className={`text-lg font-bold ${getValueColor(entry.subjectivesynchro)}`}>
              {entry.subjectivesynchro?.toFixed(1) || 'N/A'}
            </div>
            <div className="text-xs text-text-muted">Synchronicity</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <HeartIcon className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <div className={`text-lg font-bold ${getValueColor(entry.subjectivemood)}`}>
              {entry.subjectivemood?.toFixed(1) || 'N/A'}
            </div>
            <div className="text-xs text-text-muted">Mood</div>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-text-secondary">
          <span className="badge badge-primary">Events: {entry.synchrosum || 0}</span>
          <span>Sleep: {entry.sleepavg?.toFixed(1) || 'N/A'}h</span>
          <span>{entry.day_of_the_week || 'N/A'}</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="section-header">Data Browser</h2>
        <p className="text-text-secondary text-lg">
          Explore and analyze your synchronicity records
        </p>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search by date, day, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input-field"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 bg-surface-secondary p-1 rounded-lg">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'cards' ? 'bg-white shadow text-primary-600' : 'text-text-muted'
              }`}
            >
              <Squares2X2Icon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'table' ? 'bg-white shadow text-primary-600' : 'text-text-muted'
              }`}
            >
              <ListBulletIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              showFilters 
                ? 'bg-gradient-primary text-white shadow-soft' 
                : 'bg-surface-secondary text-text-secondary hover:text-text-primary hover:bg-white'
            }`}
          >
            <FunnelIcon className="h-5 w-5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-4 fade-in">
            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">Start Date</label>
                <input
                  type="date"
                  value={dateFilter.start}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">End Date</label>
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
                <label className="block text-sm font-medium text-text-primary">
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
                <label className="block text-sm font-medium text-text-primary">
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
                className="px-3 py-1 border border-gray-300 rounded text-sm input-field"
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
            <div className="text-sm text-text-secondary">
              {selectedEntries.size} entries selected
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearSelection}
                className="btn-ghost text-sm"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="mt-4 flex items-center justify-between text-sm text-text-secondary">
          <div>
            Showing {paginatedData.length} of {filteredAndSortedData.length} entries
            {filteredAndSortedData.length !== data.length && ` (filtered from ${data.length} total)`}
          </div>
          {filteredAndSortedData.length > itemsPerPage && (
            <button
              onClick={selectAllVisible}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Select all visible
            </button>
          )}
        </div>
      </div>

      {/* Data Display */}
      {viewMode === 'table' ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-surface-secondary">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      onChange={selectAllVisible}
                      className="rounded text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <SortHeader field="date">Date</SortHeader>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Day
                  </th>
                  <SortHeader field="subjectivesynchro">Synchronicity</SortHeader>
                  <SortHeader field="subjectivemood">Mood</SortHeader>
                  <SortHeader field="productivity">Productivity</SortHeader>
                  <SortHeader field="synchrosum">Events</SortHeader>
                  <SortHeader field="sleepavg">Sleep</SortHeader>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.map((entry) => (
                  <tr key={entry.id} className="hover:bg-surface-secondary transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedEntries.has(entry.id!)}
                        onChange={() => toggleSelectEntry(entry.id!)}
                        className="rounded text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-4 w-4 text-text-muted" />
                        <span className="font-medium">{formatDate(entry.date)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {entry.day_of_the_week || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          (entry.subjectivesynchro || 0) >= 7 ? 'bg-green-500' :
                          (entry.subjectivesynchro || 0) >= 5 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`} />
                        <span className={`font-medium ${getValueColor(entry.subjectivesynchro)}`}>
                          {entry.subjectivesynchro?.toFixed(1) || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          (entry.subjectivemood || 0) >= 7 ? 'bg-green-500' :
                          (entry.subjectivemood || 0) >= 5 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`} />
                        <span className={`font-medium ${getValueColor(entry.subjectivemood)}`}>
                          {entry.subjectivemood?.toFixed(1) || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                      {entry.productivity?.toFixed(1) || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary font-semibold">
                      <span className="badge badge-accent">
                        {entry.synchrosum || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      <div className="flex items-center space-x-1">
                        <MoonIcon className="h-4 w-4 text-purple-500" />
                        <span>{entry.sleepavg?.toFixed(1) || 'N/A'}h</span>
                      </div>
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
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-text-primary">
                Page {currentPage} of {totalPages}
              </span>
              <span className="text-sm text-text-muted">
                ({filteredAndSortedData.length} total entries)
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-secondary transition-colors"
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-secondary transition-colors"
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
                        ? 'bg-gradient-primary text-white'
                        : 'bg-white border border-gray-300 hover:bg-surface-secondary'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-secondary transition-colors"
              >
                Next
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-secondary transition-colors"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      )}

      {paginatedData.length === 0 && (
        <div className="text-center py-20">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <EyeIcon className="h-12 w-12 text-text-muted" />
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-text-secondary">No entries found</h3>
            <p className="text-text-muted text-lg max-w-md mx-auto">
              Try adjusting your search or filter criteria to find matching entries.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}