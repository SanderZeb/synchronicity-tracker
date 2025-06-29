'use client'

import { useState, useMemo } from 'react'
import { SynchroData } from '../lib/supabase'
import { convertSleepToHours, formatDate, getStatusColor, getScaleDescription } from '../lib/utils'
import { 
  MagnifyingGlassIcon, 
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FunnelIcon,
  EyeIcon,
  Squares2X2Icon,
  ListBulletIcon,
  BoltIcon,
  HeartIcon,
  MoonIcon,
  SunIcon,
  ClockIcon
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
    synchroMin: 1,
    synchroMax: 5,
    moodMin: 1,
    moodMax: 5
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

    // Apply range filters (1-5 scale)
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

      // Special handling for sleep (convert to hours for sorting)
      if (sortField === 'sleepavg') {
        aVal = convertSleepToHours(aVal as number)
        bVal = convertSleepToHours(bVal as number)
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

  const formatDateDisplay = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A'
    try {
      return format(parseISO(dateStr), 'MMM dd, yyyy')
    } catch {
      return dateStr
    }
  }

  const getValueColor = (value: number | undefined, max: number = 5) => {
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
      className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-surface-secondary transition-colors duration-200 group"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span className="group-hover:text-text-primary transition-colors duration-200">{children}</span>
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
    <div className="card-interactive group overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <CalendarIcon className="h-5 w-5 text-text-muted" />
            <span className="font-semibold text-text-primary">{formatDateDisplay(entry.date)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedEntries.has(entry.id!)}
              onChange={() => toggleSelectEntry(entry.id!)}
              className="rounded text-primary-600 focus:ring-primary-500 focus:ring-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200">
            <BoltIcon className="h-5 w-5 text-primary-600 mx-auto mb-2" />
            <div className={`text-xl font-bold ${getValueColor(entry.subjectivesynchro, 5)}`}>
              {entry.subjectivesynchro?.toFixed(1) || 'N/A'}
            </div>
            <div className="text-xs text-text-muted">Synchronicity</div>
            <div className="text-xs text-primary-600 font-medium mt-1">
              {entry.subjectivesynchro ? getScaleDescription(entry.subjectivesynchro) : ''}
            </div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
            <HeartIcon className="h-5 w-5 text-green-600 mx-auto mb-2" />
            <div className={`text-xl font-bold ${getValueColor(entry.subjectivemood, 5)}`}>
              {entry.subjectivemood?.toFixed(1) || 'N/A'}
            </div>
            <div className="text-xs text-text-muted">Mood</div>
            <div className="text-xs text-green-600 font-medium mt-1">
              {entry.subjectivemood ? getScaleDescription(entry.subjectivemood) : ''}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gradient-to-br from-accent-50 to-accent-100 rounded-lg border border-accent-200">
            <SunIcon className="h-4 w-4 text-accent-600 mx-auto mb-1" />
            <div className={`text-lg font-bold ${getValueColor(entry.productivity, 5)}`}>
              {entry.productivity?.toFixed(1) || 'N/A'}
            </div>
            <div className="text-xs text-text-muted">Productivity</div>
          </div>
          
          <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
            <MoonIcon className="h-4 w-4 text-purple-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-purple-600">
              {entry.sleepavg ? `${convertSleepToHours(entry.sleepavg).toFixed(1)}h` : 'N/A'}
            </div>
            <div className="text-xs text-text-muted">Sleep</div>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center space-x-2">
            <span className="badge badge-primary flex items-center space-x-1">
              <FireIcon className="h-3 w-3" />
              <span>{entry.synchrosum || 0} events</span>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-4 w-4 text-text-muted" />
            <span className="text-text-secondary">{entry.day_of_the_week || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="section-header">Data Explorer</h2>
        <p className="text-text-secondary text-lg">
          Browse and analyze your synchronicity records (1-5 scale)
        </p>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="card p-6 shadow-soft">
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
                viewMode === 'cards' ? 'bg-white shadow text-primary-600' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <Squares2X2Icon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'table' ? 'bg-white shadow text-primary-600' : 'text-text-muted hover:text-text-primary'
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
                ? 'bg-gradient-primary text-white shadow-medium' 
                : 'bg-surface-secondary text-text-secondary hover:text-text-primary hover:bg-white hover:shadow-soft'
            }`}
          >
            <FunnelIcon className="h-5 w-5" />
            <span>Filters</span>
            {Object.values(rangeFilters).some(v => v !== 1 && v !== 5) && (
              <div className="w-2 h-2 bg-accent-400 rounded-full"></div>
            )}
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-6 fade-in">
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

            {/* Range Filters for 1-5 Scale */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-text-primary">
                  Synchronicity Range: {rangeFilters.synchroMin} - {rangeFilters.synchroMax}
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={rangeFilters.synchroMin}
                    onChange={(e) => setRangeFilters(prev => ({ ...prev, synchroMin: parseFloat(e.target.value) }))}
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={rangeFilters.synchroMax}
                    onChange={(e) => setRangeFilters(prev => ({ ...prev, synchroMax: parseFloat(e.target.value) }))}
                    className="flex-1"
                  />
                </div>
                <div className="flex justify-between text-xs text-text-muted">
                  <span>Very Low</span>
                  <span>Very High</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-text-primary">
                  Mood Range: {rangeFilters.moodMin} - {rangeFilters.moodMax}
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={rangeFilters.moodMin}
                    onChange={(e) => setRangeFilters(prev => ({ ...prev, moodMin: parseFloat(e.target.value) }))}
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={rangeFilters.moodMax}
                    onChange={(e) => setRangeFilters(prev => ({ ...prev, moodMax: parseFloat(e.target.value) }))}
                    className="flex-1"
                  />
                </div>
                <div className="flex justify-between text-xs text-text-muted">
                  <span>Very Low</span>
                  <span>Very High</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setDateFilter({ start: '', end: '' })
                  setRangeFilters({ synchroMin: 1, synchroMax: 5, moodMin: 1, moodMax: 5 })
                  setSearchTerm('')
                }}
                className="btn-secondary text-sm"
              >
                Clear All Filters
              </button>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm input-field"
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
              <span className="font-medium text-text-primary">{selectedEntries.size}</span> entries selected
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
            Showing <span className="font-medium text-text-primary">{paginatedData.length}</span> of <span className="font-medium text-text-primary">{filteredAndSortedData.length}</span> entries
            {filteredAndSortedData.length !== data.length && (
              <span className="text-text-muted"> (filtered from {data.length} total)</span>
            )}
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
        <div className="card overflow-hidden shadow-soft">
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
                  <tr key={entry.id} className="hover:bg-surface-secondary transition-colors duration-200 group">
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
                        <span className="font-medium">{formatDateDisplay(entry.date)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {entry.day_of_the_week || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(entry.subjectivesynchro, 'dot')}`} />
                        <span className={`font-medium ${getValueColor(entry.subjectivesynchro, 5)}`}>
                          {entry.subjectivesynchro?.toFixed(1) || 'N/A'}
                        </span>
                        <span className="text-xs text-text-muted">
                          {entry.subjectivesynchro ? `(${getScaleDescription(entry.subjectivesynchro)})` : ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(entry.subjectivemood, 'dot')}`} />
                        <span className={`font-medium ${getValueColor(entry.subjectivemood, 5)}`}>
                          {entry.subjectivemood?.toFixed(1) || 'N/A'}
                        </span>
                        <span className="text-xs text-text-muted">
                          {entry.subjectivemood ? `(${getScaleDescription(entry.subjectivemood)})` : ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-medium ${getValueColor(entry.productivity, 5)}`}>
                        {entry.productivity?.toFixed(1) || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary font-semibold">
                      <span className="badge badge-accent">
                        {entry.synchrosum || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      <div className="flex items-center space-x-1">
                        <MoonIcon className="h-4 w-4 text-purple-500" />
                        <span>{entry.sleepavg ? `${convertSleepToHours(entry.sleepavg).toFixed(1)}h` : 'N/A'}</span>
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
        <div className="card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-text-primary">
                Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
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
                        ? 'bg-gradient-primary text-white shadow-soft'
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
            <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto shadow-soft">
              <EyeIcon className="h-16 w-16 text-text-muted" />
            </div>
            <div className="absolute inset-0 w-32 h-32 bg-gray-200 rounded-2xl animate-pulse opacity-30 mx-auto" />
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-text-secondary">No entries found</h3>
            <p className="text-text-muted text-lg max-w-md mx-auto">
              Try adjusting your search or filter criteria to find matching entries.
            </p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setDateFilter({ start: '', end: '' })
                  setRangeFilters({ synchroMin: 1, synchroMax: 5, moodMin: 1, moodMax: 5 })
                }}
                className="btn-primary"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}