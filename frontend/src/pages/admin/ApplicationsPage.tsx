import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { api, handleApiError } from '@/services/api'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/Badge'
import { formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

export interface AdminApplication {
  id: number
  acknowledgement_number: string
  status: string
  preferred_account_type: string
  submitted_at: string | null
  approved_at: string | null
  applicant_name: string | null
  email: string | null
  mobile: string | null
  progress_percentage: number
  created_at: string
}

interface ApplicationsResponse {
  success: boolean
  data: AdminApplication[]
  pagination: { current_page: number; last_page: number; total: number }
}

const statusFilters = [
  { value: '', label: 'All' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'correction_required', label: 'Correction Required' },
  { value: 'final_review', label: 'Final Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

export function AdminApplicationsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const status = searchParams.get('status') ?? ''
  const page = Number(searchParams.get('page') ?? '1')
  const [search, setSearch] = useState(searchParams.get('acknowledgement_number') ?? '')

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['admin-applications', status, page, search],
    queryFn: async (): Promise<ApplicationsResponse> => {
      const response = await api.get('/admin/applications', {
        params: {
          status: status || undefined,
          page,
          acknowledgement_number: search || undefined,
        },
      })
      return response.data
    },
  })

  const setFilter = (value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set('status', value)
    else next.delete('status')
    next.delete('page')
    setSearchParams(next)
  }

  const goToPage = (p: number) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(p))
    setSearchParams(next)
  }

  const applications = data?.data ?? []
  const pagination = data?.pagination

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Applications</h1>
          <p className="text-navy-600">Review and process account opening applications</p>
        </div>
        <div className="w-full sm:w-72">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const next = new URLSearchParams(searchParams)
              if (search) next.set('acknowledgement_number', search)
              else next.delete('acknowledgement_number')
              next.delete('page')
              setSearchParams(next)
            }}
          >
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search acknowledgement number"
              aria-label="Search acknowledgement number"
            />
          </form>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by status">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            type="button"
            role="tab"
            aria-selected={status === f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              status === f.value
                ? 'bg-primary-600 text-white'
                : 'bg-white text-navy-600 border border-navy-200 hover:bg-navy-50'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse h-12 bg-navy-100 rounded" />
              ))}
            </div>
          ) : isError ? (
            <div className="p-8 text-center">
              <p className="text-red-600 mb-3">{handleApiError(error as never)}</p>
              <Button variant="outline" onClick={() => refetch()}>Retry</Button>
            </div>
          ) : applications.length === 0 ? (
            <div className="p-8 text-center text-navy-500">
              No applications found for this filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <thead>
                  <tr className="bg-navy-50 border-b border-navy-200">
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">Acknowledgement</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">Applicant</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">Account Type</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">Progress</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">Status</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">Submitted</th>
                    <th scope="col" className="px-4 py-3" aria-label="Actions" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-navy-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-navy-900">{app.acknowledgement_number}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-navy-900">{app.applicant_name || '—'}</p>
                        <p className="text-xs text-navy-500">{app.email || app.mobile || ''}</p>
                      </td>
                      <td className="px-4 py-3 capitalize text-navy-700">{app.preferred_account_type}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-navy-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary-600 rounded-full"
                              style={{ width: `${app.progress_percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-navy-500">{app.progress_percentage}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                      <td className="px-4 py-3 text-navy-600 whitespace-nowrap">{app.submitted_at ? formatDateTime(app.submitted_at) : '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/admin/applications/${app.id}`}
                          className="text-sm font-medium text-primary-600 hover:underline"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between" aria-label="Pagination">
          <p className="text-sm text-navy-600">
            Page {pagination.current_page} of {pagination.last_page} · {pagination.total} total
            {isFetching && <span className="ml-2 text-navy-400">updating…</span>}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current_page <= 1}
              onClick={() => goToPage(pagination.current_page - 1)}
              aria-label="Previous page"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => goToPage(pagination.current_page + 1)}
              aria-label="Next page"
            >
              Next
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
