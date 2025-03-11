import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { api, handleApiError } from '@/services/api'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface AdminTransaction {
  id: number
  reference_number: string
  type: string
  direction: string
  amount: string
  description: string
  status: string
  created_at: string
  completed_at: string | null
  account: { account_number: string; customer_name: string | null } | null
  related_account: { account_number: string; customer_name: string | null } | null
}

interface ListResponse<T> {
  success: boolean
  data: T[]
  pagination: { current_page: number; last_page: number; total: number }
}

const typeLabels: Record<string, string> = {
  cash_deposit: 'Cash Deposit',
  money_sent: 'Money Sent',
  money_received: 'Money Received',
  interest_credit: 'Interest Credit',
  loan_disbursement: 'Loan Disbursement',
  loan_emi: 'Loan EMI',
  fd_booking: 'FD Booking',
  fd_maturity: 'FD Maturity',
  fd_premature_close: 'FD Premature Close',
  correction: 'Correction',
}

export function AdminTransactionsPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-transactions', page],
    queryFn: async (): Promise<ListResponse<AdminTransaction>> => {
      const response = await api.get('/admin/transactions', { params: { page } })
      return response.data
    },
  })

  const transactions = data?.data ?? []
  const pagination = data?.pagination

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Transactions</h1>
        <p className="text-navy-600">All customer transactions across the bank</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => <div key={i} className="animate-pulse h-12 bg-navy-100 rounded" />)}
            </div>
          ) : isError ? (
            <div className="p-8 text-center">
              <p className="text-red-600 mb-3">{handleApiError(error as never)}</p>
              <Button variant="outline" onClick={() => refetch()}>Retry</Button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center text-navy-500">No transactions found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[760px]">
                <thead>
                  <tr className="bg-navy-50 border-b border-navy-200">
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">Reference</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">Account</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">Type</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">Description</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold text-navy-700 uppercase tracking-wider text-xs">Amount</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-navy-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-navy-700">{t.reference_number}</td>
                      <td className="px-4 py-3">
                        {t.account ? (
                          <>
                            <p className="font-mono text-xs text-navy-700">{t.account.account_number}</p>
                            <p className="text-xs text-navy-500">{t.account.customer_name}</p>
                          </>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-navy-700 whitespace-nowrap">{typeLabels[t.type] ?? t.type.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3 text-navy-600 max-w-[220px] truncate" title={t.description}>{t.description}</td>
                      <td className={cn('px-4 py-3 text-right font-medium whitespace-nowrap', t.direction === 'credit' ? 'text-emerald-600' : 'text-red-600')}>
                        {t.direction === 'credit' ? '+' : '−'} {formatCurrency(Number(t.amount))}
                      </td>
                      <td className="px-4 py-3 text-navy-600 whitespace-nowrap">{formatDateTime(t.completed_at ?? t.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-navy-600">Page {pagination.current_page} of {pagination.last_page} · {pagination.total} total</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={pagination.current_page <= 1} onClick={() => setPage(pagination.current_page - 1)} aria-label="Previous page">
              <ChevronLeftIcon className="h-4 w-4" /> Previous
            </Button>
            <Button variant="outline" size="sm" disabled={pagination.current_page >= pagination.last_page} onClick={() => setPage(pagination.current_page + 1)} aria-label="Next page">
              Next <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
