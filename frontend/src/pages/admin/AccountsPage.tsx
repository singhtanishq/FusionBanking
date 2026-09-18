import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeftIcon, ChevronRightIcon, SnowflakeIcon, FireIcon } from '@heroicons/react/24/outline'
import { api, handleApiError } from '@/services/api'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { StatusBadge } from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'react-hot-toast'

interface AdminAccount {
  id: number
  account_number: string
  account_type: string
  status: string
  balance: string
  available_balance: string
  ifsc_code: string
  opening_date: string | null
  is_primary: boolean
  customer: { customer_id: string; full_name: string } | null
}

interface ListResponse<T> {
  success: boolean
  data: T[]
  pagination: { current_page: number; last_page: number; total: number }
}

const statusFilters = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'frozen', label: 'Frozen' },
  { value: 'closed', label: 'Closed' },
]

export function AdminAccountsPage() {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [freezeTarget, setFreezeTarget] = useState<AdminAccount | null>(null)
  const [unfreezeTarget, setUnfreezeTarget] = useState<AdminAccount | null>(null)
  const [reason, setReason] = useState('')

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-accounts', status, page],
    queryFn: async (): Promise<ListResponse<AdminAccount>> => {
      const response = await api.get('/admin/accounts', {
        params: { status: status || undefined, page },
      })
      return response.data
    },
  })

  const freezeMutation = useMutation({
    mutationFn: async (account: AdminAccount) => {
      const response = await api.put(`/admin/accounts/${account.id}/freeze`, { reason })
      if (!response.data.success) throw new Error(response.data.message)
      return response.data
    },
    onSuccess: () => {
      toast.success('Account frozen')
      setFreezeTarget(null)
      setReason('')
      queryClient.invalidateQueries({ queryKey: ['admin-accounts'] })
    },
    onError: (e) => toast.error(handleApiError(e as never)),
  })

  const unfreezeMutation = useMutation({
    mutationFn: async (account: AdminAccount) => {
      const response = await api.put(`/admin/accounts/${account.id}/unfreeze`)
      if (!response.data.success) throw new Error(response.data.message)
      return response.data
    },
    onSuccess: () => {
      toast.success('Account unfrozen')
      setUnfreezeTarget(null)
      queryClient.invalidateQueries({ queryKey: ['admin-accounts'] })
    },
    onError: (e) => toast.error(handleApiError(e as never)),
  })

  const accounts = data?.data ?? []
  const pagination = data?.pagination

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Accounts</h1>
        <p className="text-navy-600">Freeze or unfreeze customer bank accounts</p>
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
          ) : accounts.length === 0 ? (
            <div className="p-8 text-center text-navy-500">No accounts found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <thead>
                  <tr className="bg-navy-50 border-b border-navy-200">
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">Account</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">Customer</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">Type</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold text-navy-700 uppercase tracking-wider text-xs">Balance</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">Opened</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">Status</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold text-navy-700 uppercase tracking-wider text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {accounts.map((a) => (
                    <tr key={a.id} className="hover:bg-navy-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-navy-900">
                        {a.account_number}
                        {a.is_primary && <span className="ml-2 text-[10px] uppercase text-primary-600 font-semibold">primary</span>}
                      </td>
                      <td className="px-4 py-3">
                        {a.customer ? (
                          <>
                            <p className="text-navy-900">{a.customer.full_name}</p>
                            <p className="text-xs font-mono text-navy-500">{a.customer.customer_id}</p>
                          </>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 capitalize text-navy-700">{a.account_type}</td>
                      <td className="px-4 py-3 text-right font-medium text-navy-900">{formatCurrency(Number(a.balance))}</td>
                      <td className="px-4 py-3 text-navy-600 whitespace-nowrap">{a.opening_date ? formatDate(a.opening_date) : '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {a.status === 'active' && (
                          <Button size="sm" variant="ghost" className="text-red-600" onClick={() => { setFreezeTarget(a); setReason('') }}>
                            <SnowflakeIcon className="h-4 w-4" /> Freeze
                          </Button>
                        )}
                        {a.status === 'frozen' && (
                          <Button size="sm" variant="ghost" className="text-emerald-600" onClick={() => setUnfreezeTarget(a)}>
                            <FireIcon className="h-4 w-4" /> Unfreeze
                          </Button>
                        )}
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

      {/* Freeze modal */}
      <Modal isOpen={freezeTarget !== null} onClose={() => setFreezeTarget(null)} title="Freeze account" description={freezeTarget ? `${freezeTarget.account_number} · ${freezeTarget.customer?.full_name ?? ''}` : undefined}>
        <Input
          label="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Minimum 5 characters"
          error={reason.length > 0 && reason.length < 5 ? 'Reason must be at least 5 characters' : undefined}
        />
        <div className="flex gap-2 mt-4 justify-end">
          <Button variant="ghost" onClick={() => setFreezeTarget(null)}>Cancel</Button>
          <Button
            variant="danger"
            disabled={reason.trim().length < 5}
            loading={freezeMutation.isPending}
            onClick={() => freezeTarget && freezeMutation.mutate(freezeTarget)}
          >
            Freeze account
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={unfreezeTarget !== null}
        onClose={() => setUnfreezeTarget(null)}
        onConfirm={() => unfreezeTarget && unfreezeMutation.mutate(unfreezeTarget)}
        title="Unfreeze account"
        message={`Restore ${unfreezeTarget?.account_number ?? 'this account'} to active? The customer can transact again immediately.`}
        confirmText="Unfreeze"
        loading={unfreezeMutation.isPending}
      />
    </div>
  )
}
