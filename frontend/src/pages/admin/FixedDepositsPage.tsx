import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { api, handleApiError } from '@/services/api'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'

interface AdminFD {
  id: number
  fd_number: string
  status: string
  principal_amount: string
  interest_rate: string
  tenure_months: number
  maturity_amount: string
  maturity_date: string | null
  opened_at: string | null
  customer: { customer_id: string; full_name: string } | null
  product: { name: string } | null
}

interface ListResponse<T> {
  success: boolean
  data: T[]
  pagination: { current_page: number; last_page: number; total: number }
}

export function AdminFixedDepositsPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-fds', page],
    queryFn: async (): Promise<ListResponse<AdminFD>> => {
      const response = await api.get('/admin/fixed-deposits', { params: { page } })
      return response.data
    },
  })

  const fds = data?.data ?? []
  const pagination = data?.pagination

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Fixed Deposits</h1>
        <p className="text-navy-600">Fixed deposit portfolio overview</p>
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
          ) : fds.length === 0 ? (
            <div className="p-8 text-center text-navy-500">No fixed deposits found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[760px]">
                <thead>
                  <tr className="bg-navy-50 border-b border-navy-200">
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">FD Number</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">Customer</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold text-navy-700 uppercase tracking-wider text-xs">Principal</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold text-navy-700 uppercase tracking-wider text-xs">Rate / Tenure</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold text-navy-700 uppercase tracking-wider text-xs">Maturity</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">Maturity Date</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {fds.map((fd) => (
                    <tr key={fd.id} className="hover:bg-navy-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs text-navy-900">{fd.fd_number}</p>
                        <p className="text-xs text-navy-500">{fd.product?.name ?? ''}</p>
                      </td>
                      <td className="px-4 py-3">
                        {fd.customer ? (
                          <>
                            <p className="text-navy-900">{fd.customer.full_name}</p>
                            <p className="text-xs font-mono text-navy-500">{fd.customer.customer_id}</p>
                          </>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-navy-900 whitespace-nowrap">{formatCurrency(Number(fd.principal_amount))}</td>
                      <td className="px-4 py-3 text-right text-navy-600 whitespace-nowrap">{fd.interest_rate}% · {fd.tenure_months}m</td>
                      <td className="px-4 py-3 text-right text-navy-700 whitespace-nowrap">{formatCurrency(Number(fd.maturity_amount))}</td>
                      <td className="px-4 py-3 text-navy-600 whitespace-nowrap">{fd.maturity_date ? formatDate(fd.maturity_date) : '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={fd.status} /></td>
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
