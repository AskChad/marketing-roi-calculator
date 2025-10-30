'use client'

import { useState, useMemo } from 'react'
import { Search, Filter, Eye, EyeOff, X, Calendar } from 'lucide-react'

interface LeadCapture {
  tracking_id: string | null
  email: string
  first_name: string
  last_name: string
  company_name: string | null
  phone: string | null
}

interface UserData {
  id: string
  email: string
  phone: string | null
}

interface CalculatorVisit {
  id: string
  tracking_id: string | null
  user_id: string | null
  ip_address: string | null
  user_agent: string | null
  referrer: string | null
  country: string | null
  region: string | null
  city: string | null
  zipcode: string | null
  latitude: number | null
  longitude: number | null
  timezone: string | null
  visited_at: string
  lead_captures: LeadCapture | null
  user_data: UserData | null
}

type ColumnKey = 'name' | 'email' | 'phone' | 'company' | 'ip' | 'city' | 'state' | 'zip' | 'country' | 'date' | 'referrer'

interface VisitsTableProps {
  visits: CalculatorVisit[]
}

export default function VisitsTable({ visits }: VisitsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [showColumnSelector, setShowColumnSelector] = useState(false)

  // Default columns: name, city, state, zip, IP, date
  const [visibleColumns, setVisibleColumns] = useState<Set<ColumnKey>>(
    new Set(['name', 'city', 'state', 'zip', 'ip', 'date'])
  )

  const columnDefinitions: Record<ColumnKey, { label: string, width: string }> = {
    name: { label: 'Name', width: 'w-48' },
    email: { label: 'Email', width: 'w-48' },
    phone: { label: 'Phone', width: 'w-32' },
    company: { label: 'Company', width: 'w-40' },
    ip: { label: 'IP Address', width: 'w-32' },
    city: { label: 'City', width: 'w-32' },
    state: { label: 'State', width: 'w-24' },
    zip: { label: 'ZIP', width: 'w-24' },
    country: { label: 'Country', width: 'w-32' },
    date: { label: 'Last Visit', width: 'w-40' },
    referrer: { label: 'Referrer', width: 'w-48' },
  }

  const toggleColumn = (column: ColumnKey) => {
    const newColumns = new Set(visibleColumns)
    if (newColumns.has(column)) {
      newColumns.delete(column)
    } else {
      newColumns.add(column)
    }
    setVisibleColumns(newColumns)
  }

  const getName = (visit: CalculatorVisit): string => {
    if (visit.lead_captures) {
      return `${visit.lead_captures.first_name} ${visit.lead_captures.last_name}`
    }
    if (visit.user_data) {
      return visit.user_data.email.split('@')[0] || 'User'
    }
    return 'Unknown'
  }

  const getEmail = (visit: CalculatorVisit): string => {
    if (visit.lead_captures) return visit.lead_captures.email
    if (visit.user_data) return visit.user_data.email
    return 'N/A'
  }

  const getPhone = (visit: CalculatorVisit): string => {
    if (visit.lead_captures?.phone) return visit.lead_captures.phone
    if (visit.user_data?.phone) return visit.user_data.phone
    return 'N/A'
  }

  const getCompany = (visit: CalculatorVisit): string => {
    return visit.lead_captures?.company_name || 'N/A'
  }

  // Filter and search logic
  const filteredVisits = useMemo(() => {
    return visits.filter(visit => {
      // Search term filter (searches across all fields)
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        const matchesSearch =
          getName(visit).toLowerCase().includes(search) ||
          getEmail(visit).toLowerCase().includes(search) ||
          getPhone(visit).toLowerCase().includes(search) ||
          getCompany(visit).toLowerCase().includes(search) ||
          (visit.ip_address?.toLowerCase().includes(search)) ||
          (visit.city?.toLowerCase().includes(search)) ||
          (visit.region?.toLowerCase().includes(search)) ||
          (visit.zipcode?.toLowerCase().includes(search)) ||
          (visit.country?.toLowerCase().includes(search))

        if (!matchesSearch) return false
      }

      // Date range filter
      if (dateFrom) {
        const visitDate = new Date(visit.visited_at)
        const fromDate = new Date(dateFrom)
        if (visitDate < fromDate) return false
      }

      if (dateTo) {
        const visitDate = new Date(visit.visited_at)
        const toDate = new Date(dateTo)
        toDate.setHours(23, 59, 59, 999) // End of day
        if (visitDate > toDate) return false
      }

      return true
    })
  }, [visits, searchTerm, dateFrom, dateTo])

  const clearFilters = () => {
    setSearchTerm('')
    setDateFrom('')
    setDateTo('')
  }

  const hasActiveFilters = searchTerm || dateFrom || dateTo

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Search Bar */}
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by name, email, IP, city, state, zip..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition ${
              showFilters ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">!</span>}
          </button>

          <button
            onClick={() => setShowColumnSelector(!showColumnSelector)}
            className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition ${
              showColumnSelector ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
            }`}
          >
            <Eye className="h-4 w-4" />
            Columns
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-neutral-900">Date Range Filter</h4>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-brand-primary hover:text-blue-700 flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Clear All
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                From Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                To Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Column Selector Panel */}
      {showColumnSelector && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
          <h4 className="font-semibold text-neutral-900 mb-3">Select Columns to Display</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(Object.keys(columnDefinitions) as ColumnKey[]).map((column) => (
              <label key={column} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visibleColumns.has(column)}
                  onChange={() => toggleColumn(column)}
                  className="w-4 h-4 text-brand-primary rounded focus:ring-brand-primary"
                />
                <span className="text-sm text-neutral-700">{columnDefinitions[column].label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-neutral-600">
        Showing {filteredVisits.length} of {visits.length} visits
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                {visibleColumns.has('name') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">Name</th>
                )}
                {visibleColumns.has('email') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">Email</th>
                )}
                {visibleColumns.has('phone') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">Phone</th>
                )}
                {visibleColumns.has('company') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">Company</th>
                )}
                {visibleColumns.has('ip') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">IP Address</th>
                )}
                {visibleColumns.has('city') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">City</th>
                )}
                {visibleColumns.has('state') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">State</th>
                )}
                {visibleColumns.has('zip') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">ZIP</th>
                )}
                {visibleColumns.has('country') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">Country</th>
                )}
                {visibleColumns.has('date') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">Last Visit</th>
                )}
                {visibleColumns.has('referrer') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">Referrer</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredVisits.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.size} className="px-4 py-8 text-center text-neutral-500">
                    No visits found matching your filters
                  </td>
                </tr>
              ) : (
                filteredVisits.map((visit) => (
                  <tr key={visit.id} className="hover:bg-neutral-50 transition">
                    {visibleColumns.has('name') && (
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-neutral-900">{getName(visit)}</div>
                        {visit.user_data && (
                          <div className="text-xs text-blue-600">Registered User</div>
                        )}
                      </td>
                    )}
                    {visibleColumns.has('email') && (
                      <td className="px-4 py-3 text-sm text-neutral-600">{getEmail(visit)}</td>
                    )}
                    {visibleColumns.has('phone') && (
                      <td className="px-4 py-3 text-sm text-neutral-600">{getPhone(visit)}</td>
                    )}
                    {visibleColumns.has('company') && (
                      <td className="px-4 py-3 text-sm text-neutral-600">{getCompany(visit)}</td>
                    )}
                    {visibleColumns.has('ip') && (
                      <td className="px-4 py-3 text-sm text-neutral-900 font-mono">{visit.ip_address || 'N/A'}</td>
                    )}
                    {visibleColumns.has('city') && (
                      <td className="px-4 py-3 text-sm text-neutral-600">{visit.city || 'N/A'}</td>
                    )}
                    {visibleColumns.has('state') && (
                      <td className="px-4 py-3 text-sm text-neutral-600">{visit.region || 'N/A'}</td>
                    )}
                    {visibleColumns.has('zip') && (
                      <td className="px-4 py-3 text-sm text-neutral-600">{visit.zipcode || 'N/A'}</td>
                    )}
                    {visibleColumns.has('country') && (
                      <td className="px-4 py-3 text-sm text-neutral-600">{visit.country || 'N/A'}</td>
                    )}
                    {visibleColumns.has('date') && (
                      <td className="px-4 py-3 text-sm text-neutral-600">
                        {new Date(visit.visited_at).toLocaleString()}
                      </td>
                    )}
                    {visibleColumns.has('referrer') && (
                      <td className="px-4 py-3 text-sm text-neutral-600 truncate max-w-xs">
                        {visit.referrer || 'Direct'}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
