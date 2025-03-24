import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, handleApiError } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { formatDateTime } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface SupportTicket {
  id: number
  ticket_number: string
  subject: string
  category: string
  priority: string
  status: string
  customer: { customer_id: string; full_name: string; email: string; mobile: string } | null
  assigned_admin: { id: number; full_name: string } | null
  created_at: string
}

interface TicketDetail extends SupportTicket {
  description: string
  messages: Array<{ id: number; message: string; sender_type: string; created_at: string }>
}

const statuses = ['open', 'assigned', 'in_progress', 'waiting_customer', 'resolved', 'closed'] as const

const priorityVariant: Record<string, 'success' | 'warning' | 'danger' | 'gray' | 'info' | 'primary'> = {
  low: 'gray',
  medium: 'info',
  high: 'warning',
  urgent: 'danger',
}

export function AdminSupportPage() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [status, setStatus] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [reply, setReply] = useState('')

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-support-tickets', status],
    queryFn: async (): Promise<{ success: boolean; data: SupportTicket[] }> => {
      const response = await api.get('/admin/support/tickets', { params: { status: status || undefined } })
      return response.data
    },
  })

  const detailQuery = useQuery({
    queryKey: ['admin-support-ticket', selectedId],
    enabled: selectedId !== null,
    queryFn: async (): Promise<TicketDetail> => {
      const response = await api.get(`/admin/support/tickets/${selectedId}`)
      return response.data.data
    },
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] })
    queryClient.invalidateQueries({ queryKey: ['admin-support-ticket', selectedId] })
  }

  const statusMutation = useMutation({
    mutationFn: async ({ id, next }: { id: number; next: string }) => {
      const response = await api.put(`/admin/support/tickets/${id}/status`, { status: next })
      if (!response.data.success) throw new Error(response.data.message)
      return response.data
    },
    onSuccess: () => { toast.success('Status updated'); invalidate() },
    onError: (e) => toast.error(handleApiError(e as never)),
  })

  const assignMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.put(`/admin/support/tickets/${id}/assign`, { admin_id: user && 'id' in user ? user.id : undefined })
      if (!response.data.success) throw new Error(response.data.message)
      return response.data
    },
    onSuccess: () => { toast.success('Ticket assigned to you'); invalidate() },
    onError: (e) => toast.error(handleApiError(e as never)),
  })

  const messageMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/admin/support/tickets/${id}/messages`, { message: reply })
      if (!response.data.success) throw new Error(response.data.message)
      return response.data
    },
    onSuccess: () => { toast.success('Reply sent'); setReply(''); invalidate() },
    onError: (e) => toast.error(handleApiError(e as never)),
  })

  const tickets = data?.data ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Support Tickets</h1>
        <p className="text-navy-600">Respond to customer support requests</p>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by status">
        <button
          type="button"
          role="tab"
          aria-selected={status === ''}
          onClick={() => setStatus('')}
          className={cn('px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
            status === '' ? 'bg-primary-600 text-white' : 'bg-white text-navy-600 border border-navy-200 hover:bg-navy-50')}
        >
          All
        </button>
        {statuses.map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={status === s}
            onClick={() => setStatus(s)}
            className={cn('px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors',
              status === s ? 'bg-primary-600 text-white' : 'bg-white text-navy-600 border border-navy-200 hover:bg-navy-50')}
          >
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="animate-pulse h-12 bg-navy-100 rounded" />)}
            </div>
          ) : isError ? (
            <div className="p-8 text-center">
              <p className="text-red-600 mb-3">{handleApiError(error as never)}</p>
              <Button variant="outline" onClick={() => refetch()}>Retry</Button>
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center text-navy-500">No tickets found.</div>
          ) : (
            <ul className="divide-y divide-navy-100" role="list">
              {tickets.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-3 hover:bg-navy-50 transition-colors"
                    onClick={() => setSelectedId(t.id)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-navy-900 truncate">{t.subject}</p>
                        <p className="text-xs text-navy-500 font-mono">
                          {t.ticket_number} · {t.customer?.full_name ?? 'Unknown'} · {formatDateTime(t.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant={priorityVariant[t.priority] ?? 'gray'}>{t.priority}</Badge>
                        <Badge variant="info">{t.status.replace(/_/g, ' ')}</Badge>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={selectedId !== null}
        onClose={() => setSelectedId(null)}
        title={detailQuery.data?.subject ?? 'Ticket'}
        description={detailQuery.data ? `${detailQuery.data.ticket_number} · ${detailQuery.data.customer?.full_name ?? ''}` : undefined}
        size="lg"
      >
        {detailQuery.isLoading ? (
          <div className="animate-pulse h-48 bg-navy-100 rounded" />
        ) : detailQuery.data ? (
          <div className="space-y-4">
            <p className="text-sm text-navy-700">{detailQuery.data.description}</p>

            <div className="flex flex-wrap gap-2">
              {statuses.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={detailQuery.data.status === s ? 'primary' : 'outline'}
                  onClick={() => statusMutation.mutate({ id: detailQuery.data.id, next: s })}
                >
                  {s.replace(/_/g, ' ')}
                </Button>
              ))}
            </div>
            {!detailQuery.data.assigned_admin && user && 'id' in user && (
              <Button size="sm" variant="ghost" onClick={() => assignMutation.mutate(detailQuery.data.id)}>
                Assign to me
              </Button>
            )}

            <div className="border-t border-navy-100 pt-4 space-y-3 max-h-64 overflow-y-auto">
              {detailQuery.data.messages.map((m) => (
                <div key={m.id} className={cn('p-3 rounded-lg text-sm', m.sender_type === 'admin' ? 'bg-primary-50 ml-8' : 'bg-navy-50')}>
                  <p className="text-navy-900">{m.message}</p>
                  <p className="text-xs text-navy-400 mt-1">
                    {m.sender_type} · {formatDateTime(m.created_at)}
                  </p>
                </div>
              ))}
              {detailQuery.data.messages.length === 0 && (
                <p className="text-sm text-navy-500">No messages yet.</p>
              )}
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Write a reply…"
                  aria-label="Reply message"
                />
              </div>
              <Button
                disabled={!reply.trim()}
                loading={messageMutation.isPending}
                onClick={() => messageMutation.mutate(detailQuery.data.id)}
              >
                Send
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-navy-500">Unable to load ticket.</p>
        )}
      </Modal>
    </div>
  )
}
