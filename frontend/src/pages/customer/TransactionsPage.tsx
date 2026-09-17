import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { formatCurrency, formatDateTime, maskAccountNumber } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'

interface Transaction {
  id: string
  reference_number: string
  type: string
  direction: string
  amount: number
  description: string
  created_at: string
  closing_balance: number
  status: string
}

export function TransactionsPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [directionFilter, setDirectionFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [sortColumn, setSortColumn] = useState('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', page, search, typeFilter, directionFilter, dateFrom, dateTo, sortColumn, sortDirection],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '20',
        sort: sortColumn,
        order: sortDirection,
      })
      if (search) params.append('search', search)
      if (typeFilter) params.append('type', typeFilter)
      if (directionFilter) params.append('direction', directionFilter)
      if (dateFrom) params.append('date_from', dateFrom)
      if (dateTo) params.append('date_to', dateTo)

      const response = await api.get(`/customer/transactions?${params}`)
      return response.data as { data: Transaction[]; current_page: number; last_page: number; total: number }
    },
  })

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'cash_deposit', label: 'Cash Deposit' },
    { value: 'money_sent', label: 'Money Sent' },
    { value: 'money_received', label: 'Money Received' },
    { value: 'loan_disbursement', label: 'Loan Disbursement' },
    { value: 'loan_repayment', label: 'Loan Repayment' },
    { value: 'fd_creation', label: 'FD Creation' },
    { value: 'fd_maturity', label: 'FD Maturity' },
    { value: 'interest_credit', label: 'Interest Credit' },
  ]

  const directionOptions = [
    { value: '', label: 'All' },
    { value: 'credit', label: 'Credit' },
    { value: 'debit', label: 'Debit' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Transaction History</h1>
          <p className="text-navy-600">View and manage your transaction records</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <MagnifyingGlassIcon className="h-5 w-5" />
            Export CSV
          </Button>
          <Button variant="outline">
            <DocumentTextIcon className="h-5 w-5" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-navy-400" />
              <input
                type="text"
                placeholder="Search by reference, description, amount..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="input pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="whitespace-nowrap">
              <FunnelIcon className="h-5 w-5" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 animate-slide-down">
              <Select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
                options={typeOptions}
              />
              <Select
                value={directionFilter}
                onChange={(e) => { setDirectionFilter(e.target.value); setPage(1) }}
                options={directionOptions}
              />
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
                label="From Date"
                placeholder="DD/MM/YYYY"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
                label="To Date"
                placeholder="DD/MM/YYYY"
              />
              <div className="flex items-end">
                <Button variant="outline" onClick={() => { setSearch(''); setTypeFilter(''); setDirectionFilter(''); setDateFrom(''); setDateTo(''); setPage(1) }}>
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
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent mx-auto mb-3" />
              <p className="text-navy-500">Loading transactions...</p>
            </div>
          ) : data?.data.length === 0 ? (
            <div className="py-12 text-center">
              <MagnifyingGlassIcon className="h-12 w-12 text-navy-300 mx-auto mb-3" />
              <p className="text-navy-600">No transactions found</p>
              <p className="text-sm text-navy-500 mt-1">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead onClick={() => handleSort('created_at')} className="cursor-pointer select-none">
                      Date & Time
                      {sortColumn === 'created_at' && (sortDirection === 'asc' ? <ChevronUpIcon className="h-4 w-4 ml-1" /> : <ChevronDownIcon className="h-4 w-4 ml-1" />)}
                    </TableHead>
                    <TableHead onClick={() => handleSort('type')} className="cursor-pointer select-none">
                      Type
                      {sortColumn === 'type' && (sortDirection === 'asc' ? <ChevronUpIcon className="h-4 w-4 ml-1" /> : <ChevronDownIcon className="h-4 w-4 ml-1" />)}
                    </TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right" onClick={() => handleSort('amount')} className="cursor-pointer select-none">
                      Amount
                      {sortColumn === 'amount' && (sortDirection === 'asc' ? <ChevronUpIcon className="h-4 w-4 ml-1" /> : <ChevronDownIcon className="h-4 w-4 ml-1" />)}
                    </TableHead>
                    <TableHead className="text-right">
                      Balance
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.map((txn) => (
                    <TableRow key={txn.id} clickable onClick={() => window.open(`/customer/payments/transactions/${txn.id}`, '_blank')}>
                      <TableCell className="whitespace-nowrap">
                        <p className="font-medium text-navy-900">{formatDateTime(txn.created_at).split(',')[0]}</p>
                        <p className="text-sm text-navy-500">{formatDateTime(txn.created_at).split(',')[1]?.trim()}</p>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={txn.type} />
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-navy-900">{txn.description}</p>
                      </TableCell>
                      <TableCell className="text-right font-mono" style={{ color: txn.direction === 'credit' ? '#059669' : '#dc2626' }}>
                        {txn.direction === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-navy-900">
                        {formatCurrency(txn.closing_balance)}
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
              {data && data.last_page > 1 && (
                <div className="px-6 py-4 border-t border-navy-100 flex items-center justify-between">
                  <p className="text-sm text-navy-500">
                    Showing page {data.current_page} of {data.last_page} ({data.total} transactions)
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={data.current_page === 1}>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(data.last_page, p + 1))} disabled={data.current_page === data.last_page}>
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