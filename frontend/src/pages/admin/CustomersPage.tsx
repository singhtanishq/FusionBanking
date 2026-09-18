import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon, NoSymbolIcon, PlayIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { api, handleApiError } from '@/services/api'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { StatusBadge } from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'react-hot-toast'

interface AdminCustomer {
  id: number
  customer_id: string
  full_name: string
  email: string
  mobile: string
  is_active: boolean
  kyc_verified_at: string | null
  netbanking_activated_at: string | null
  created_at: string
  primary_account: { account_number: string; status: string; balance: string } | null
}

interface CustomerDetail extends AdminCustomer {
  addresses: Array<{ type: string; city: string; state: string }>
}

interface ListResponse<T> {
  success: boolean
  data: T[]
  pagination: { current_page: number; last_page: number; total: number }
}

export function AdminCustomersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [detailId, setDetailId] = useState<number | null>(null)
  const [restrictTarget, setRestrictTarget] = useState<AdminCustomer | null>(null)

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-customers', query, page],
    queryFn: async (): Promise<ListResponse<AdminCustomer>> => {
      const response = await api.get('/admin/customers', {
        params: { search: query || undefined, page },
      })
      return response.data
    },
  })

  const detailQuery = useQuery({
    queryKey: ['admin-customer', detailId],
    enabled: detailId !== null,
    queryFn: async (): Promise<CustomerDetail> => {
      const response = await api.get(`/admin/customers/${detailId}`)
      return response.data.data
    },
  })

  const restrictMutation = useMutation({
    mutationFn: async ({ customer, restrict }: { customer: AdminCustomer; restrict: boolean }) => {
      const response = await api.put(`/admin/customers/${customer.id}/${restrict ? 'restrict' : 'unrestrict'}`)
      if (!response.data.success) throw new Error(response.data.message)
      return response.data
    },
    onSuccess: (_data, vars) => {
      toast.success(vars.restrict ? 'Customer restricted' : 'Customer unrestricted')
      setRestrictTarget(null)
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] })
    },
    onError: (e) => toast.error(handleApiError(e as never)),
  })

  const customers = data?.data ?? []
  const pagination = data?.pagination

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Customers</h1>
          <p className="text-navy-600">Manage customer accounts and access</p>
        </div>
        <form
          className="w-full sm:w-72"
          onSubmit={(e) => {
            e.preventDefault()
            setPage(1)
            setQuery(search)
          }}
        >
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, name, email or mobile"
            aria-label="Search customers"
          />
        </form>
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
          ) : customers.length === 0 ? (
            <div className="p-8 text-center text-navy-500">
              <MagnifyingGlassIcon className="h-8 w-8 mx-auto mb-2 text-navy-300" />
              No customers found{query ? ` for "${query}"` : ''}.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[760px]">
                <thead>
                  <tr className="bg-navy-50 border-b border-navy-200">
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">Customer</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">Contact</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">Primary Account</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">KYC</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">Status</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold text-navy-700 uppercase tracking-wider text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-navy-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-navy-900">{c.full_name}</p>
                        <p className="text-xs font-mono text-navy-500">{c.customer_id}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-navy-700">{c.email}</p>
                        <p className="text-xs text-navy-500">{c.mobile}</p>
                      </td>
                      <td className="px-4 py-3">
                        {c.primary_account ? (
                          <>
                            <p className="font-mono text-xs text-navy-700">XXXXXX{c.primary_account.account_number.slice(-4)}</p>
                            <p className="text-xs text-navy-500">{formatCurrency(Number(c.primary_account.balance))}</p>
                          </>
                        ) : (
                          <span className="text-navy-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {c.kyc_verified_at ? (
                          <StatusBadge status="verified" />
                        ) : (
                          <StatusBadge status="pending" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {c.is_active ? <StatusBadge status="active" /> : <StatusBadge status="restricted" />}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => setDetailId(c.id)} aria-label={`View ${c.full_name}`}>
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          {c.is_active ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600"
                              onClick={() => setRestrictTarget(c)}
                              aria-label={`Restrict ${c.full_name}`}
                            >
                              <NoSymbolIcon className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-emerald-600"
                              onClick={() => restrictMutation.mutate({ customer: c, restrict: false })}
                              loading={restrictMutation.isPending}
                              aria-label={`Unrestrict ${c.full_name}`}
                            >
                              <PlayIcon className="h-4 w-4" />
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

      {/* Detail modal */}
      <Modal
        isOpen={detailId !== null}
        onClose={() => setDetailId(null)}
        title={detailQuery.data?.full_name ?? 'Customer details'}
        description={detailQuery.data ? `${detailQuery.data.customer_id} · ${detailQuery.data.email}` : undefined}
      >
        {detailQuery.isLoading ? (
          <div className="animate-pulse h-48 bg-navy-100 rounded" />
        ) : detailQuery.data ? (
          <dl className="grid sm:grid-cols-2 gap-3">
            <div><dt className="text-xs text-navy-400 uppercase">Mobile</dt><dd className="text-sm text-navy-900">{detailQuery.data.mobile}</dd></div>
            <div><dt className="text-xs text-navy-400 uppercase">KYC Verified</dt><dd className="text-sm text-navy-900">{detailQuery.data.kyc_verified_at ? formatDate(detailQuery.data.kyc_verified_at) : 'No'}</dd></div>
            <div><dt className="text-xs text-navy-400 uppercase">NetBanking</dt><dd className="text-sm text-navy-900">{detailQuery.data.netbanking_activated_at ? `Activated ${formatDate(detailQuery.data.netbanking_activated_at)}` : 'Not activated'}</dd></div>
            <div><dt className="text-xs text-navy-400 uppercase">Member Since</dt><dd className="text-sm text-navy-900">{formatDate(detailQuery.data.created_at)}</dd></div>
            {detailQuery.data.addresses.length > 0 && (
              <div className="sm:col-span-2">
                <dt className="text-xs text-navy-400 uppercase mb-1">Addresses</dt>
                {detailQuery.data.addresses.map((a, i) => (
                  <dd key={i} className="text-sm text-navy-900 capitalize">{a.type}: {a.city}, {a.state}</dd>
                ))}
              </div>
            )}
          </dl>
        ) : (
          <p className="text-sm text-navy-500">Unable to load customer.</p>
        )}
      </Modal>

      {/* Restrict confirmation */}
      <ConfirmDialog
        isOpen={restrictTarget !== null}
        onClose={() => setRestrictTarget(null)}
        onConfirm={() => restrictTarget && restrictMutation.mutate({ customer: restrictTarget, restrict: true })}
        title="Restrict customer"
        message={`Restrict ${restrictTarget?.full_name ?? 'this customer'}? They will no longer be able to log in to NetBanking.`}
        confirmText="Restrict"
        loading={restrictMutation.isPending}
      />

      {/* Close button for a11y */}
      <button type="button" className="sr-only" onClick={() => setDetailId(null)} aria-label="Close details">
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  )
}
