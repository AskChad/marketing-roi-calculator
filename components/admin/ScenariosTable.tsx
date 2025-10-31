'use client'

import { useState, useMemo } from 'react'
import { Search, Filter, Eye, X, Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface Scenario {
  id: string
  scenario_name: string
  user_id: string
  session_id: string
  target_conversion_rate: number
  adjusted_leads: number | null
  adjusted_ad_spend: number | null
  new_sales: number
  new_cpl: number
  new_cpa: number
  new_revenue: number
  sales_increase: number
  revenue_increase: number
  cpa_improvement_percent: number
  created_at: string
  updated_at: string
  users?: {
    email: string
  }
  calculator_sessions?: {
    time_period: string
    current_leads: number
    current_sales: number
    current_ad_spend: number
    current_revenue: number
    current_conversion_rate: number
    current_cpl: number
    current_cpa: number
    avg_revenue_per_sale: number
  }
}

type ColumnKey =
  | 'name'
  | 'user'
  | 'period'
  | 'current_leads'
  | 'current_sales'
  | 'current_conv_rate'
  | 'current_cpl'
  | 'current_cpa'
  | 'current_spend'
  | 'current_revenue'
  | 'target_conv_rate'
  | 'adjusted_leads'
  | 'adjusted_spend'
  | 'new_sales'
  | 'new_cpl'
  | 'new_cpa'
  | 'new_revenue'
  | 'sales_increase'
  | 'sales_increase_pct'
  | 'revenue_increase'
  | 'revenue_increase_pct'
  | 'cpa_improvement'
  | 'cpa_improvement_pct'
  | 'cpl_improvement'
  | 'cpl_improvement_pct'
  | 'conv_rate_change'
  | 'date'

interface ScenariosTableProps {
  scenarios: Scenario[]
}

interface NumericFilters {
  minCPL?: number
  maxCPL?: number
  minCPA?: number
  maxCPA?: number
  minRevenue?: number
  maxRevenue?: number
  minSales?: number
  maxSales?: number
}

export default function ScenariosTable({ scenarios }: ScenariosTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [numericFilters, setNumericFilters] = useState<NumericFilters>({})
  const [showFilters, setShowFilters] = useState(true)
  const [showColumnSelector, setShowColumnSelector] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(100)

  // Default columns: name, user, current CPL, current CPA, new CPL, new CPA, sales increase, revenue increase, date
  const [visibleColumns, setVisibleColumns] = useState<Set<ColumnKey>>(
    new Set(['name', 'user', 'current_cpl', 'current_cpa', 'new_cpl', 'new_cpa', 'sales_increase', 'revenue_increase', 'date'])
  )

  const columnDefinitions: Record<ColumnKey, { label: string, width: string }> = {
    name: { label: 'Scenario Name', width: 'w-48' },
    user: { label: 'User', width: 'w-40' },
    period: { label: 'Period', width: 'w-24' },
    current_leads: { label: 'Current Leads', width: 'w-32' },
    current_sales: { label: 'Current Sales', width: 'w-32' },
    current_conv_rate: { label: 'Current Conv Rate', width: 'w-32' },
    current_cpl: { label: 'Current CPL', width: 'w-28' },
    current_cpa: { label: 'Current CPA', width: 'w-28' },
    current_spend: { label: 'Current Spend', width: 'w-32' },
    current_revenue: { label: 'Current Revenue', width: 'w-36' },
    target_conv_rate: { label: 'Target Conv Rate', width: 'w-32' },
    adjusted_leads: { label: 'Adjusted Leads', width: 'w-32' },
    adjusted_spend: { label: 'Adjusted Spend', width: 'w-32' },
    new_sales: { label: 'New Sales', width: 'w-28' },
    new_cpl: { label: 'New CPL', width: 'w-28' },
    new_cpa: { label: 'New CPA', width: 'w-28' },
    new_revenue: { label: 'New Revenue', width: 'w-36' },
    sales_increase: { label: 'Sales Increase', width: 'w-32' },
    sales_increase_pct: { label: 'Sales Increase %', width: 'w-32' },
    revenue_increase: { label: 'Revenue Increase', width: 'w-36' },
    revenue_increase_pct: { label: 'Revenue Increase %', width: 'w-36' },
    cpa_improvement: { label: 'CPA Improvement $', width: 'w-36' },
    cpa_improvement_pct: { label: 'CPA Improvement %', width: 'w-36' },
    cpl_improvement: { label: 'CPL Improvement $', width: 'w-36' },
    cpl_improvement_pct: { label: 'CPL Improvement %', width: 'w-36' },
    conv_rate_change: { label: 'Conv Rate Change', width: 'w-36' },
    date: { label: 'Created', width: 'w-32' },
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

  const updateNumericFilter = (key: keyof NumericFilters, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value)
    setNumericFilters(prev => ({
      ...prev,
      [key]: numValue
    }))
  }

  // Filter and search logic
  const filteredScenarios = useMemo(() => {
    return scenarios.filter(scenario => {
      const session = scenario.calculator_sessions

      // Calculate all percentage metrics for search
      const salesIncreasePct = session ? (scenario.sales_increase / session.current_sales) * 100 : 0
      const revenueIncreasePct = session ? (scenario.revenue_increase / session.current_revenue) * 100 : 0
      const cpaImprovement = session ? session.current_cpa - scenario.new_cpa : 0
      const cplImprovement = session ? session.current_cpl - scenario.new_cpl : 0
      const cplImprovementPct = session ? ((session.current_cpl - scenario.new_cpl) / session.current_cpl) * 100 : 0
      const convRateChange = session ? scenario.target_conversion_rate - session.current_conversion_rate : 0

      // Text search filter - search text fields only (name, user, period)
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        const matchesSearch =
          scenario.scenario_name.toLowerCase().includes(search) ||
          (scenario.users?.email.toLowerCase().includes(search)) ||
          (session?.time_period.toLowerCase().includes(search))

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

      // Numeric filters
      if (Object.keys(numericFilters).length > 0) {
        if (!session) return false

        // CPL filter
        if (numericFilters.minCPL !== undefined && session.current_cpl < numericFilters.minCPL) return false
        if (numericFilters.maxCPL !== undefined && session.current_cpl > numericFilters.maxCPL) return false

        // CPA filter
        if (numericFilters.minCPA !== undefined && session.current_cpa < numericFilters.minCPA) return false
        if (numericFilters.maxCPA !== undefined && session.current_cpa > numericFilters.maxCPA) return false

        // Revenue filter
        if (numericFilters.minRevenue !== undefined && scenario.revenue_increase < numericFilters.minRevenue) return false
        if (numericFilters.maxRevenue !== undefined && scenario.revenue_increase > numericFilters.maxRevenue) return false

        // Sales filter
        if (numericFilters.minSales !== undefined && scenario.sales_increase < numericFilters.minSales) return false
        if (numericFilters.maxSales !== undefined && scenario.sales_increase > numericFilters.maxSales) return false
      }

      return true
    })
  }, [scenarios, searchTerm, dateFrom, dateTo, numericFilters])

  const clearFilters = () => {
    setSearchTerm('')
    setNumericFilters({})
    setDateFrom('')
    setDateTo('')
    setCurrentPage(1)
  }

  const hasActiveFilters = searchTerm || dateFrom || dateTo || Object.keys(numericFilters).length > 0

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
              placeholder="Search text fields (name, user, period)..."
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
        <div className="bg-white border border-neutral-200 rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-neutral-900">Filters</h4>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-brand-primary hover:text-blue-700 flex items-center gap-1 font-medium"
              >
                <X className="h-4 w-4" />
                Clear All
              </button>
            )}
          </div>

          {/* Date Range Filters */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Date Range</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-neutral-600 mb-1">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-neutral-600 mb-1">End Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Numeric Filters */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Numeric Filters</label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* CPL Filters */}
              <div>
                <label className="block text-xs text-neutral-600 mb-1">Min CPL ($)</label>
                <input
                  type="number"
                  placeholder="Min"
                  step="0.01"
                  value={numericFilters.minCPL ?? ''}
                  onChange={(e) => updateNumericFilter('minCPL', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-600 mb-1">Max CPL ($)</label>
                <input
                  type="number"
                  placeholder="Max"
                  step="0.01"
                  value={numericFilters.maxCPL ?? ''}
                  onChange={(e) => updateNumericFilter('maxCPL', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary text-sm"
                />
              </div>

              {/* CPA Filters */}
              <div>
                <label className="block text-xs text-neutral-600 mb-1">Min CPA ($)</label>
                <input
                  type="number"
                  placeholder="Min"
                  step="0.01"
                  value={numericFilters.minCPA ?? ''}
                  onChange={(e) => updateNumericFilter('minCPA', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-600 mb-1">Max CPA ($)</label>
                <input
                  type="number"
                  placeholder="Max"
                  step="0.01"
                  value={numericFilters.maxCPA ?? ''}
                  onChange={(e) => updateNumericFilter('maxCPA', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary text-sm"
                />
              </div>

              {/* Revenue Filters */}
              <div>
                <label className="block text-xs text-neutral-600 mb-1">Min Revenue ($)</label>
                <input
                  type="number"
                  placeholder="Min"
                  step="1"
                  value={numericFilters.minRevenue ?? ''}
                  onChange={(e) => updateNumericFilter('minRevenue', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-600 mb-1">Max Revenue ($)</label>
                <input
                  type="number"
                  placeholder="Max"
                  step="1"
                  value={numericFilters.maxRevenue ?? ''}
                  onChange={(e) => updateNumericFilter('maxRevenue', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary text-sm"
                />
              </div>

              {/* Sales Filters */}
              <div>
                <label className="block text-xs text-neutral-600 mb-1">Min Sales</label>
                <input
                  type="number"
                  placeholder="Min"
                  step="1"
                  value={numericFilters.minSales ?? ''}
                  onChange={(e) => updateNumericFilter('minSales', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-600 mb-1">Max Sales</label>
                <input
                  type="number"
                  placeholder="Max"
                  step="1"
                  value={numericFilters.maxSales ?? ''}
                  onChange={(e) => updateNumericFilter('maxSales', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary text-sm"
                />
              </div>
            </div>
          </div>

          {/* Filter Results Count */}
          {hasActiveFilters && (
            <div className="pt-4 border-t border-neutral-200">
              <p className="text-sm text-neutral-600">
                Showing <span className="font-semibold text-neutral-900">{filteredScenarios.length}</span> of{' '}
                <span className="font-semibold text-neutral-900">{scenarios.length}</span> scenarios
              </p>
            </div>
          )}
        </div>
      )}

      {/* Column Selector Panel */}
      {showColumnSelector && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
          <h4 className="font-semibold text-neutral-900 mb-3">Select Columns to Display ({visibleColumns.size} of {Object.keys(columnDefinitions).length} selected)</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
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
                {visibleColumns.has('period') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">Period</th>
                )}
                {visibleColumns.has('current_leads') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">Current Leads</th>
                )}
                {visibleColumns.has('current_sales') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">Current Sales</th>
                )}
                {visibleColumns.has('current_conv_rate') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">Current Conv Rate</th>
                )}
                {visibleColumns.has('current_cpl') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">Current CPL</th>
                )}
                {visibleColumns.has('current_cpa') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">Current CPA</th>
                )}
                {visibleColumns.has('current_spend') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">Current Spend</th>
                )}
                {visibleColumns.has('current_revenue') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">Current Revenue</th>
                )}
                {visibleColumns.has('target_conv_rate') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">Target Conv Rate</th>
                )}
                {visibleColumns.has('adjusted_leads') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">Adjusted Leads</th>
                )}
                {visibleColumns.has('adjusted_spend') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">Adjusted Spend</th>
                )}
                {visibleColumns.has('new_sales') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">New Sales</th>
                )}
                {visibleColumns.has('new_cpl') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">New CPL</th>
                )}
                {visibleColumns.has('new_cpa') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">New CPA</th>
                )}
                {visibleColumns.has('new_revenue') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">New Revenue</th>
                )}
                {visibleColumns.has('sales_increase') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">Sales Increase</th>
                )}
                {visibleColumns.has('sales_increase_pct') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">Sales Increase %</th>
                )}
                {visibleColumns.has('revenue_increase') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">Revenue Increase</th>
                )}
                {visibleColumns.has('revenue_increase_pct') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">Revenue Increase %</th>
                )}
                {visibleColumns.has('cpa_improvement') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">CPA Improvement $</th>
                )}
                {visibleColumns.has('cpa_improvement_pct') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">CPA Improvement %</th>
                )}
                {visibleColumns.has('cpl_improvement') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">CPL Improvement $</th>
                )}
                {visibleColumns.has('cpl_improvement_pct') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">CPL Improvement %</th>
                )}
                {visibleColumns.has('conv_rate_change') && (
                  <th className="text-left text-xs font-semibold text-neutral-600 px-4 py-3">Conv Rate Change</th>
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
                paginatedScenarios.map((scenario) => {
                  const session = scenario.calculator_sessions
                  // Calculate additional metrics
                  const salesIncreasePct = session ? (scenario.sales_increase / session.current_sales) * 100 : 0
                  const revenueIncreasePct = session ? (scenario.revenue_increase / session.current_revenue) * 100 : 0
                  const cpaImprovement = session ? session.current_cpa - scenario.new_cpa : 0
                  const cplImprovement = session ? session.current_cpl - scenario.new_cpl : 0
                  const cplImprovementPct = session ? ((session.current_cpl - scenario.new_cpl) / session.current_cpl) * 100 : 0
                  const convRateChange = session ? scenario.target_conversion_rate - session.current_conversion_rate : 0

                  return (
                    <tr key={scenario.id} className="hover:bg-neutral-50 transition">
                      {visibleColumns.has('name') && (
                        <td className="px-4 py-3 text-sm font-medium text-neutral-900">{scenario.scenario_name}</td>
                      )}
                      {visibleColumns.has('user') && (
                        <td className="px-4 py-3 text-sm text-neutral-600">{scenario.users?.email || 'Unknown'}</td>
                      )}
                      {visibleColumns.has('period') && (
                        <td className="px-4 py-3 text-sm text-neutral-600 capitalize">{session?.time_period || 'N/A'}</td>
                      )}
                      {visibleColumns.has('current_leads') && (
                        <td className="px-4 py-3 text-sm text-neutral-900 font-mono">{session?.current_leads.toLocaleString() || 'N/A'}</td>
                      )}
                      {visibleColumns.has('current_sales') && (
                        <td className="px-4 py-3 text-sm text-neutral-900 font-mono">{session?.current_sales.toLocaleString() || 'N/A'}</td>
                      )}
                      {visibleColumns.has('current_conv_rate') && (
                        <td className="px-4 py-3 text-sm text-neutral-900 font-mono">{session ? `${session.current_conversion_rate.toFixed(2)}%` : 'N/A'}</td>
                      )}
                      {visibleColumns.has('current_cpl') && (
                        <td className="px-4 py-3 text-sm text-neutral-900 font-mono">{session ? `$${session.current_cpl.toFixed(2)}` : 'N/A'}</td>
                      )}
                      {visibleColumns.has('current_cpa') && (
                        <td className="px-4 py-3 text-sm text-neutral-900 font-mono">{session ? `$${session.current_cpa.toFixed(2)}` : 'N/A'}</td>
                      )}
                      {visibleColumns.has('current_spend') && (
                        <td className="px-4 py-3 text-sm text-neutral-900 font-mono">{session ? `$${session.current_ad_spend.toLocaleString()}` : 'N/A'}</td>
                      )}
                      {visibleColumns.has('current_revenue') && (
                        <td className="px-4 py-3 text-sm text-neutral-900 font-mono">{session ? `$${session.current_revenue.toLocaleString()}` : 'N/A'}</td>
                      )}
                      {visibleColumns.has('target_conv_rate') && (
                        <td className="px-4 py-3 text-sm text-neutral-900 font-mono">{scenario.target_conversion_rate.toFixed(2)}%</td>
                      )}
                      {visibleColumns.has('adjusted_leads') && (
                        <td className="px-4 py-3 text-sm text-neutral-900 font-mono">{scenario.adjusted_leads?.toLocaleString() || 'N/A'}</td>
                      )}
                      {visibleColumns.has('adjusted_spend') && (
                        <td className="px-4 py-3 text-sm text-neutral-900 font-mono">{scenario.adjusted_ad_spend ? `$${scenario.adjusted_ad_spend.toLocaleString()}` : 'N/A'}</td>
                      )}
                      {visibleColumns.has('new_sales') && (
                        <td className="px-4 py-3 text-sm text-neutral-900 font-mono font-semibold">{scenario.new_sales.toLocaleString()}</td>
                      )}
                      {visibleColumns.has('new_cpl') && (
                        <td className="px-4 py-3 text-sm text-neutral-900 font-mono font-semibold">${scenario.new_cpl.toFixed(2)}</td>
                      )}
                      {visibleColumns.has('new_cpa') && (
                        <td className="px-4 py-3 text-sm text-neutral-900 font-mono font-semibold">${scenario.new_cpa.toFixed(2)}</td>
                      )}
                      {visibleColumns.has('new_revenue') && (
                        <td className="px-4 py-3 text-sm text-neutral-900 font-mono font-semibold">${scenario.new_revenue.toLocaleString()}</td>
                      )}
                      {visibleColumns.has('sales_increase') && (
                        <td className="px-4 py-3 text-sm text-success-dark font-mono font-semibold">+{scenario.sales_increase.toLocaleString()}</td>
                      )}
                      {visibleColumns.has('sales_increase_pct') && (
                        <td className="px-4 py-3 text-sm text-success-dark font-mono font-semibold">+{salesIncreasePct.toFixed(1)}% ↑</td>
                      )}
                      {visibleColumns.has('revenue_increase') && (
                        <td className="px-4 py-3 text-sm text-success-dark font-mono font-semibold">+${scenario.revenue_increase.toLocaleString()}</td>
                      )}
                      {visibleColumns.has('revenue_increase_pct') && (
                        <td className="px-4 py-3 text-sm text-success-dark font-mono font-semibold">+{revenueIncreasePct.toFixed(1)}% ↑</td>
                      )}
                      {visibleColumns.has('cpa_improvement') && (
                        <td className="px-4 py-3 text-sm text-success-dark font-mono font-semibold">-${cpaImprovement.toFixed(2)} ↓</td>
                      )}
                      {visibleColumns.has('cpa_improvement_pct') && (
                        <td className="px-4 py-3 text-sm text-success-dark font-mono font-semibold">{scenario.cpa_improvement_percent.toFixed(1)}% ↓</td>
                      )}
                      {visibleColumns.has('cpl_improvement') && (
                        <td className="px-4 py-3 text-sm text-success-dark font-mono font-semibold">-${cplImprovement.toFixed(2)} ↓</td>
                      )}
                      {visibleColumns.has('cpl_improvement_pct') && (
                        <td className="px-4 py-3 text-sm text-success-dark font-mono font-semibold">{cplImprovementPct.toFixed(1)}% ↓</td>
                      )}
                      {visibleColumns.has('conv_rate_change') && (
                        <td className="px-4 py-3 text-sm text-success-dark font-mono font-semibold">+{convRateChange.toFixed(2)}% ↑</td>
                      )}
                      {visibleColumns.has('date') && (
                        <td className="px-4 py-3 text-sm text-neutral-600">
                          {new Date(scenario.created_at).toLocaleDateString()}
                        </td>
                      )}
                    </tr>
                  )
                })
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
