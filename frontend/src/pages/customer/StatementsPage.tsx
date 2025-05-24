import { useState } from 'react'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDateTime, getAuthToken } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'

interface Transaction {
  id: number
  reference_number: string
  type: string
  direction: string
  amount: string
  description: string
  created_at: string
  closing_balance: string
  status: string
}

interface TransactionsResponse {
  success: boolean
  data: Transaction[]
  pagination: { current_page: number; last_page: number; total: number }
}

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'cash_deposit', label: 'Cash Deposit' },
  { value: 'money_sent', label: 'Money Sent' },
  { value: 'money_received', label: 'Money Received' },
  { value: 'loan_disbursement', label: 'Loan Disbursement' },
  { value: 'fd_maturity', label: 'FD Maturity' },
  { value: 'interest_credit', label: 'Interest Credit' },
]

const directionOptions = [
  { value: '', label: 'All' },
  { value: 'credit', label: 'Credit' },
  { value: 'debit', label: 'Debit' },
]

export function StatementsPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [directionFilter, setDirectionFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [downloading, setDownloading] = useState(false)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['statements', page, search, typeFilter, directionFilter, dateFrom, dateTo],
    queryFn: async (): Promise<TransactionsResponse> => {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '20',
      })
      if (search) params.append('search', search)
      if (typeFilter) params.append('type', typeFilter)
      if (directionFilter) params.append('direction', directionFilter)
      if (dateFrom) params.append('date_from', dateFrom)
      if (dateTo) params.append('date_to', dateTo)

      const response = await api.get(`/customer/transactions?${params}`)
      return response.data
    },
  })

  const downloadCsv = async () => {
    setDownloading(true)
    try {
      const params = new URLSearchParams()
      if (dateFrom) params.append('date_from', dateFrom)
      if (dateTo) params.append('date_to', dateTo)

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || '/api'}/customer/statements/download?${params}`,
        { headers: { Authorization: `Bearer ${getAuthToken()}`, Accept: 'text/csv' } }
      )
      if (!response.ok) throw new Error('Download failed')

      const blob = await response.blob()
      const disposition = response.headers.get('Content-Disposition') ?? ''
      const match = disposition.match(/filename="?([^";]+)"?/)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = match?.[1] ?? 'statement.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // Blob downloads ignore CORS headers exposure in some setups; fall back
      // to opening the endpoint directly so the browser handles the download.
      try {
        const params = new URLSearchParams()
        if (dateFrom) params.append('date_from', dateFrom)
        if (dateTo) params.append('date_to', dateTo)
        window.open(`/api/customer/statements/download?${params}`, '_blank')
      } finally {
        // no-op
      }
    } finally {
      setDownloading(false)
    }
  }

  const clearFilters = () => {
    setSearch('')
    setTypeFilter('')
    setDirectionFilter('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  const transactions = data?.data ?? []
  const pagination = data?.pagination

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Account Statements</h1>
          <p className="text-navy-600">View and download your transaction statements</p>
        </div>
        <Button variant="outline" onClick={downloadCsv} loading={downloading}>
          <DocumentArrowDownIcon className="h-5 w-5" />
          Download CSV
        </Button>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-navy-400" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search by reference, description, amount..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="input pl-10"
                aria-label="Search transactions"
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="whitespace-nowrap" aria-expanded={showFilters}>
              <FunnelIcon className="h-5 w-5" aria-hidden="true" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
                options={typeOptions}
                aria-label="Filter by type"
              />
              <Select
                value={directionFilter}
                onChange={(e) => { setDirectionFilter(e.target.value); setPage(1) }}
                options={directionOptions}
                aria-label="Filter by direction"
              />
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
                label="From Date"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
                label="To Date"
              />
              <div className="flex items-end">
                <Button variant="outline" onClick={clearFilters}>
                  Clear
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent mx-auto mb-3" role="status" aria-label="Loading" />
              <p className="text-navy-500">Loading transactions...</p>
            </div>
          ) : isError ? (
            <div className="py-12 text-center">
              <p className="text-red-600 mb-3">Failed to load transactions.</p>
              <Button variant="outline" onClick={() => refetch()}>Retry</Button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-12 text-center">
              <MagnifyingGlassIcon className="h-12 w-12 text-navy-300 mx-auto mb-3" aria-hidden="true" />
              <p className="text-navy-600">No transactions found</p>
              <p className="text-sm text-navy-500 mt-1">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date &amp; Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead align="right">Amount</TableHead>
                    <TableHead align="right">Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell className="whitespace-nowrap">
                        <p className="font-medium text-navy-900">{formatDateTime(txn.created_at).split(',')[0]}</p>
                        <p className="text-sm text-navy-500">{formatDateTime(txn.created_at).split(',')[1]?.trim()}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          txn.type === 'cash_deposit' ? 'success' :
                          txn.type === 'money_received' ? 'success' :
                          txn.type === 'money_sent' ? 'info' :
                          txn.type === 'loan_disbursement' ? 'success' :
                          txn.type === 'fd_maturity' ? 'success' :
                          txn.type === 'interest_credit' ? 'success' : 'gray'
                        }>
                          {txn.type.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-navy-900">{txn.description}</p>
                      </TableCell>
                      <TableCell
                        align="right"
                        className={`font-mono ${txn.direction === 'credit' ? 'text-emerald-600' : 'text-red-600'}`}
                      >
                        {txn.direction === 'credit' ? '+' : '-'}{formatCurrency(Number(txn.amount))}
                      </TableCell>
                      <TableCell align="right" className="font-mono text-navy-900">
                        {formatCurrency(Number(txn.closing_balance))}
                      </TableCell>
                      <TableCell>
                        <Badge variant={txn.status === 'completed' ? 'success' : txn.status === 'pending' ? 'warning' : 'danger'}>
                          {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-navy-500">
                        {txn.reference_number}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination && pagination.last_page > 1 && (
                <div className="px-6 py-4 border-t border-navy-100 flex items-center justify-between">
                  <p className="text-sm text-navy-500">
                    Showing page {pagination.current_page} of {pagination.last_page} ({pagination.total} transactions)
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={pagination.current_page === 1}>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))} disabled={pagination.current_page === pagination.last_page}>
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
