import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { api, handleApiError } from '@/services/api'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatDateTime } from '@/lib/utils'

interface AuditLog {
  id: number
  actor_type: string
  actor_id: number
  action: string
  resource_type: string
  resource_id: number
  ip_address: string
  created_at: string
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
}

interface ListResponse<T> {
  success: boolean
  data: T[]
  pagination: { current_page: number; last_page: number; total: number }
}

export function AdminAuditLogsPage() {
  const [page, setPage] = useState(1)
  const [action, setAction] = useState('')
  const [query, setQuery] = useState('')

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-audit-logs', page, action, query],
    queryFn: async (): Promise<ListResponse<AuditLog>> => {
      const response = await api.get('/admin/audit-logs', {
        params: { page, action: action || undefined },
      })
      return response.data
    },
  })

  const logs = data?.data ?? []
  const pagination = data?.pagination

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Audit Logs</h1>
        <p className="text-navy-600">Complete trail of sensitive actions across the bank</p>
      </div>

      <form
        className="flex flex-col sm:flex-row gap-3"
        onSubmit={(e) => { e.preventDefault(); setPage(1); setAction(query) }}
      >
        <div className="flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by action (e.g. loan_approved)"
            aria-label="Filter by action"
          />
        </div>
        <Button type="submit" variant="outline">Filter</Button>
      </form>

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
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-navy-500">No audit entries found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <thead>
                  <tr className="bg-navy-50 border-b border-navy-200">
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">Action</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">Actor</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">Resource</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">IP Address</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-navy-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-navy-900">{log.action}</td>
                      <td className="px-4 py-3 text-navy-700">
                        {log.actor_type === 'system' ? (
                          <span className="text-navy-400 italic">System</span>
                        ) : (
                          `${log.actor_type.replace('App\\Models\\', '')} #${log.actor_id}`
                        )}
                      </td>
                      <td className="px-4 py-3 text-navy-600 font-mono text-xs">{log.resource_type} #{log.resource_id}</td>
                      <td className="px-4 py-3 font-mono text-xs text-navy-600">{log.ip_address}</td>
                      <td className="px-4 py-3 text-navy-600 whitespace-nowrap">{formatDateTime(log.created_at)}</td>
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
