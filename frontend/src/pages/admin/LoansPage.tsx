import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon, XCircleIcon, BanknotesIcon } from '@heroicons/react/24/outline'
import { api, handleApiError } from '@/services/api'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { StatusBadge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'react-hot-toast'

interface AdminLoan {
  id: number
  loan_number: string
  status: string
  principal_amount: string
  approved_amount: string | null
  interest_rate: string
  tenure_months: number
  emi: string | null
  total_repayment: string | null
  customer: { customer_id: string; full_name: string } | null
  product: { name: string } | null
  disbursed_at: string | null
  maturity_date: string | null
}

interface ListResponse<T> {
  success: boolean
  data: T[]
  pagination: { current_page: number; last_page: number; total: number }
}

const statusFilters = [
  { value: '', label: 'All' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'disbursed', label: 'Disbursed' },
  { value: 'active', label: 'Active' },
  { value: 'rejected', label: 'Rejected' },
]

export function AdminLoansPage() {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [actionTarget, setActionTarget] = useState<{ loan: AdminLoan; action: 'approve' | 'reject' | 'disburse' } | null>(null)
  const [reason, setReason] = useState('')

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-loans', status, page],
    queryFn: async (): Promise<ListResponse<AdminLoan>> => {
      const response = await api.get('/admin/loans', {
        params: { status: status || undefined, page },
      })
      return response.data
    },
  })

  const actionMutation = useMutation({
    mutationFn: async ({ loan, action }: { loan: AdminLoan; action: 'approve' | 'reject' | 'disburse' }) => {
      const response = await api.post(`/admin/loans/${loan.id}/${action}`, action === 'approve' ? {} : { reason })
      if (!response.data.success) throw new Error(response.data.message)
      return response.data
    },
    onSuccess: (_d, vars) => {
      const messages = { approve: 'Loan approved', reject: 'Loan rejected', disburse: 'Loan disbursed' } as const
      toast.success(messages[vars.action])
      setActionTarget(null)
      setReason('')
      queryClient.invalidateQueries({ queryKey: ['admin-loans'] })
    },
    onError: (e) => toast.error(handleApiError(e as never)),
  })

  const loans = data?.data ?? []
  const pagination = data?.pagination

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Loans</h1>
        <p className="text-navy-600">Review, approve and disburse loan applications</p>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by status">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            type="button"
            role="tab"
            aria-selected={status === f.value}
            onClick={() => { setStatus(f.value); setPage(1) }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              status === f.value
                ? 'bg-primary-600 text-white'
                : 'bg-white text-navy-600 border border-navy-200 hover:bg-navy-50'
            }`}
          >
            {f.label}
          </button>
        ))}
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
          ) : loans.length === 0 ? (
            <div className="p-8 text-center text-navy-500">No loans found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[820px]">
                <thead>
                  <tr className="bg-navy-50 border-b border-navy-200">
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">Loan</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">Customer</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold text-navy-700 uppercase tracking-wider text-xs">Principal</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold text-navy-700 uppercase tracking-wider text-xs">Rate / Tenure</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold text-navy-700 uppercase tracking-wider text-xs">EMI</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">Status</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold text-navy-700 uppercase tracking-wider text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {loans.map((l) => (
                    <tr key={l.id} className="hover:bg-navy-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs text-navy-900">{l.loan_number}</p>
                        <p className="text-xs text-navy-500">{l.product?.name ?? ''}</p>
                      </td>
                      <td className="px-4 py-3">
                        {l.customer ? (
                          <>
                            <p className="text-navy-900">{l.customer.full_name}</p>
                            <p className="text-xs font-mono text-navy-500">{l.customer.customer_id}</p>
                          </>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-navy-900 whitespace-nowrap">{formatCurrency(Number(l.principal_amount))}</td>
                      <td className="px-4 py-3 text-right text-navy-600 whitespace-nowrap">{l.interest_rate}% · {l.tenure_months}m</td>
                      <td className="px-4 py-3 text-right text-navy-700 whitespace-nowrap">{l.emi ? formatCurrency(Number(l.emi)) : '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex flex-wrap gap-1 justify-end">
                          {l.status === 'under_review' && (
                            <>
                              <Button size="sm" variant="ghost" className="text-emerald-600" onClick={() => setActionTarget({ loan: l, action: 'approve' })}>
                                <CheckCircleIcon className="h-4 w-4" /> Approve
                              </Button>
                              <Button size="sm" variant="ghost" className="text-red-600" onClick={() => setActionTarget({ loan: l, action: 'reject' })}>
                                <XCircleIcon className="h-4 w-4" /> Reject
                              </Button>
                            </>
                          )}
                          {l.status === 'approved' && (
                            <Button size="sm" variant="ghost" className="text-primary-600" onClick={() => setActionTarget({ loan: l, action: 'disburse' })}>
                              <BanknotesIcon className="h-4 w-4" /> Disburse
                            </Button>
                          )}
                        </div>
                      </td>
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

      {/* Reason modal for reject / disburse */}
      <Modal
        isOpen={actionTarget !== null && actionTarget.action === 'reject'}
        onClose={() => setActionTarget(null)}
        title="Reject loan"
        description={actionTarget ? `${actionTarget.loan.loan_number} · ${formatCurrency(Number(actionTarget.loan.principal_amount))}` : undefined}
      >
        <Input
          label="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Minimum 5 characters"
          error={reason.length > 0 && reason.length < 5 ? 'Reason must be at least 5 characters' : undefined}
        />
        <div className="flex gap-2 mt-4 justify-end">
          <Button variant="ghost" onClick={() => setActionTarget(null)}>Cancel</Button>
          <Button
            variant="danger"
            disabled={reason.trim().length < 5}
            loading={actionMutation.isPending}
            onClick={() => actionTarget && actionMutation.mutate({ loan: actionTarget.loan, action: 'reject' })}
          >
            Reject loan
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={actionTarget !== null && actionTarget.action === 'approve'}
        onClose={() => setActionTarget(null)}
        onConfirm={() => actionTarget && actionMutation.mutate({ loan: actionTarget.loan, action: 'approve' })}
        title="Approve loan"
        message={actionTarget ? `Approve ${actionTarget.loan.loan_number} for ${formatCurrency(Number(actionTarget.loan.principal_amount))} at ${actionTarget.loan.interest_rate}%?` : ''}
        confirmText="Approve"
        loading={actionMutation.isPending}
      />

      <ConfirmDialog
        isOpen={actionTarget !== null && actionTarget.action === 'disburse'}
        onClose={() => setActionTarget(null)}
        onConfirm={() => actionTarget && actionMutation.mutate({ loan: actionTarget.loan, action: 'disburse' })}
        title="Disburse loan"
        message={actionTarget ? `Disburse ${formatCurrency(Number(actionTarget.loan.approved_amount ?? actionTarget.loan.principal_amount))} to the customer's primary account?` : ''}
        confirmText="Disburse"
        loading={actionMutation.isPending}
      />
    </div>
  )
}
