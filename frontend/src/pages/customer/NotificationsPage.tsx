import { useState } from 'react'
import {
  BellIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDateTime } from '@/lib/utils'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { toast } from 'react-hot-toast'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  data: Record<string, unknown> | null
  read_at: string | null
  action_url: string | null
  priority: string
  created_at: string
}

export function NotificationsPage() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await api.get('/customer/notifications')
      return response.data.data as Notification[]
    },
  })

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => api.put(`/customer/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: () => {
      toast.error('Failed to mark as read')
    },
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: () => api.put('/customer/notifications/read-all'),
    onSuccess: () => {
      toast.success('All notifications marked as read')
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: () => {
      toast.error('Failed to mark all as read')
    },
  })

  const filteredNotifications = notifications?.filter(n => {
    if (filter === 'unread') return !n.read_at
    if (filter === 'read') return !!n.read_at
    return true
  }) || []

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'application_update':
      case 'kyc_approved':
      case 'loan_approved':
      case 'fd_created':
        return <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
      case 'kyc_rejected':
      case 'loan_rejected':
      case 'transfer_failed':
      case 'security_alert':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
      case 'transfer_completed':
      case 'money_received':
        return <InformationCircleIcon className="h-5 w-5 text-primary-600" />
      default:
        return <BellIcon className="h-5 w-5 text-amber-600" />
    }
  }

  const getPriorityVariant = (priority: string): 'danger' | 'warning' | 'info' | 'gray' => {
    switch (priority) {
      case 'urgent': return 'danger'
      case 'high': return 'warning'
      case 'normal': return 'info'
      default: return 'gray'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Notifications</h1>
          <p className="text-navy-600">Stay updated with your account activity</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => markAllAsReadMutation.mutate()} disabled={markAllAsReadMutation.isPending}>
            <CheckIcon className="h-5 w-5" />
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-navy-200 mb-6">
        <nav className="flex gap-8" aria-label="Notification filters">
          {(['all', 'unread', 'read'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${filter === f ? 'border-primary-600 text-primary-600' : 'border-transparent text-navy-500 hover:text-navy-700'}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {notifications && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-navy-100 text-navy-600">
                  {notifications.filter(n => f === 'all' || (f === 'unread' && !n.read_at) || (f === 'read' && n.read_at)).length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Notifications List */}
      <Card>
        <CardContent className="pt-0">
          {filteredNotifications.length === 0 ? (
            <div className="pt-12 pb-12 text-center">
              <BellIcon className="h-16 w-16 text-navy-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-navy-900 mb-2">
                {filter === 'unread' ? 'No Unread Notifications' : filter === 'read' ? 'No Read Notifications' : 'No Notifications'}
              </h3>
              <p className="text-navy-600">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-navy-100">
              {filteredNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 flex items-start gap-3 hover:bg-navy-50 transition-colors ${!notification.read_at ? 'bg-primary-50/30' : ''}`}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    notification.type.includes('rejected') || notification.type.includes('failed') || notification.type === 'security_alert' 
                      ? 'bg-red-100' 
                      : notification.type.includes('approved') || notification.type.includes('completed') || notification.type.includes('created')
                        ? 'bg-emerald-100'
                        : 'bg-primary-100'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className={`font-medium text-navy-900 ${!notification.read_at ? 'font-bold' : ''}`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-navy-600 mt-1">{notification.message}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityVariant(notification.priority)}>
                          {notification.priority}
                        </Badge>
                        <span className="text-xs text-navy-500 whitespace-nowrap">
                          {formatDateTime(notification.created_at)}
                        </span>
                      </div>
                    </div>
                    {notification.action_url && !notification.read_at && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-shrink-0"
                        onClick={() => { 
                          markAsReadMutation.mutate(notification.id);
                          window.location.href = notification.action_url!;
                        }}
                      >
                        View
                      </Button>
                    )}
                    {!notification.read_at && !notification.action_url && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex-shrink-0 text-primary-600 hover:bg-primary-50"
                        onClick={() => markAsReadMutation.mutate(notification.id)}
                      >
                        <CheckIcon className="h-4 w-4" />
                        Mark Read
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}