'use client'

import { useState, useMemo } from 'react'
import { Search, Filter, Eye, X, Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface Scenario {
  id: string
  scenario_name: string
  user_id: string
  sales_increase: number
  revenue_increase: number
  cpa_improvement_percent: number
  created_at: string
  users?: {
    email: string
  }
}

type ColumnKey = 'name' | 'user' | 'sales' | 'revenue' | 'cpa' | 'date'

interface ScenariosTableProps {
  scenarios: Scenario[]
}

export default function ScenariosTable({ scenarios }: ScenariosTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [showColumnSelector, setShowColumnSelector] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(100)

  // Default columns: name, user, sales, revenue, CPA, date
  const [visibleColumns, setVisibleColumns] = useState<Set<ColumnKey>>(
    new Set(['name', 'user', 'sales', 'revenue', 'cpa', 'date'])
  )

  const columnDefinitions: Record<ColumnKey, { label: string, width: string }> = {
    name: { label: 'Scenario Name', width: 'w-48' },
    user: { label: 'User', width: 'w-48' },
    sales: { label: 'Sales Increase', width: 'w-32' },
    revenue: { label: 'Revenue Increase', width: 'w-32' },
    cpa: { label: 'CPA Improvement', width: 'w-32' },
    date: { label: 'Created', width: 'w-40' },
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

  // Filter and search logic
  const filteredScenarios = useMemo(() => {
    return scenarios.filter(scenario => {
      // Search term filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        const matchesSearch =
          scenario.scenario_name.toLowerCase().includes(search) ||
          (scenario.users?.email.toLowerCase().includes(search)) ||
          scenario.sales_increase.toString().includes(search) ||
          scenario.revenue_increase.toString().includes(search) ||
          scenario.cpa_improvement_percent.toString().includes(search)

        if (!matchesSearch) return false
      }

      // Date range filter
      if (dateFrom) {
        const scenarioDate = new Date(scenario.created_at)
        const fromDate = new Date(dateFrom)
        if (scenarioDate < fromDate) return false
      }

      if (dateTo) {
        const scenarioDate = new Date(scenario.created_at)
        const toDate = new Date(dateTo)
        toDate.setHours(23, 59, 59, 999)
        if (scenarioDate > toDate) return false
      }

      return true
    })
  }, [scenarios, searchTerm, dateFrom, dateTo])

  const clearFilters = () => {
    setSearchTerm('')
    setDateFrom('')
    setDateTo('')
    setCurrentPage(1)
  }

  const hasActiveFilters = searchTerm || dateFrom || dateTo

  // Pagination logic
  const totalPages = Math.ceil(filteredScenarios.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedScenarios = filteredScenarios.slice(startIndex, endIndex)

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(1)
  }

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

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
              placeholder="Search by name, user, sales, revenue, CPA..."
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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

      {/* Results Count and Page Size Selector */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="text-sm text-neutral-600">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredScenarios.length)} of {filteredScenarios.length} scenarios
          {filteredScenarios.length !== scenarios.length && ` (filtered from ${scenarios.length} total)`}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-neutral-600">Rows per page:</label>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="px-3 py-1 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={250}>250</option>
            <option value={500}>500</option>
            <option value={1000}>1000</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                {visibleColumns.has('name') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">Scenario Name</th>
                )}
                {visibleColumns.has('user') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">User</th>
                )}
                {visibleColumns.has('sales') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">Sales Increase</th>
                )}
                {visibleColumns.has('revenue') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">Revenue Increase</th>
                )}
                {visibleColumns.has('cpa') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">CPA Improvement</th>
                )}
                {visibleColumns.has('date') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">Created</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {paginatedScenarios.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.size} className="px-4 py-8 text-center text-neutral-500">
                    {filteredScenarios.length === 0 ? 'No scenarios found matching your filters' : 'No scenarios on this page'}
                  </td>
                </tr>
              ) : (
                paginatedScenarios.map((scenario) => (
                  <tr key={scenario.id} className="hover:bg-neutral-50 transition">
                    {visibleColumns.has('name') && (
                      <td className="px-4 py-3 text-sm font-medium text-neutral-900">{scenario.scenario_name}</td>
                    )}
                    {visibleColumns.has('user') && (
                      <td className="px-4 py-3 text-sm text-neutral-600">{scenario.users?.email || 'Unknown'}</td>
                    )}
                    {visibleColumns.has('sales') && (
                      <td className="px-4 py-3 text-sm text-neutral-900 font-semibold">+{scenario.sales_increase.toLocaleString()}</td>
                    )}
                    {visibleColumns.has('revenue') && (
                      <td className="px-4 py-3 text-sm text-neutral-900 font-semibold">
                        ${(scenario.revenue_increase / 1000).toFixed(1)}k
                      </td>
                    )}
                    {visibleColumns.has('cpa') && (
                      <td className="px-4 py-3 text-sm font-semibold text-success-dark">
                        {scenario.cpa_improvement_percent.toFixed(1)}% ↓
                      </td>
                    )}
                    {visibleColumns.has('date') && (
                      <td className="px-4 py-3 text-sm text-neutral-600">
                        {new Date(scenario.created_at).toLocaleDateString()}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="text-sm text-neutral-600">
            Page {currentPage} of {totalPages}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              title="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>

            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              title="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-3 py-1 rounded-lg transition ${
                      currentPage === pageNum
                        ? 'bg-brand-primary text-white'
                        : 'border border-neutral-300 hover:bg-neutral-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              title="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              title="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
