import { useState } from 'react'
import { 
  ShieldCheckIcon, 
  LockClosedIcon, 
  KeyIcon,
  BellIcon,
  PhoneIcon,
  EnvelopeIcon,
  ComputerDesktopIcon,
  XCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Alert } from '@/components/ui/Alert'
import { formatDateTime } from '@/lib/utils'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'

interface SecurityEvent {
  id: string
  event_type: string
  description: string
  ip_address: string
  user_agent: string
  created_at: string
  severity: string
}

interface Session {
  id: string
  ip_address: string
  user_agent: string
  device_info: Record<string, any> | null
  last_activity_at: string
  expires_at: string
  is_revoked: boolean
}

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(10, 'New password must be at least 10 characters'),
  confirm_password: z.string().min(1, 'Please confirm new password'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

type PasswordForm = z.infer<typeof passwordSchema>

export function SecurityPage() {
  const queryClient = useQueryClient()
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [revokingSession, setRevokingSession] = useState<string | null>(null)

  const { data: events } = useQuery({
    queryKey: ['security-events'],
    queryFn: async () => {
      const response = await api.get('/customer/security/events')
      return response.data.data as SecurityEvent[]
    },
  })

  const { data: sessions } = useQuery({
    queryKey: ['customer-sessions'],
    queryFn: async () => {
      const response = await api.get('/customer/security/sessions')
      return response.data.data as Session[]
    },
  })

  const changePasswordMutation = useMutation({
    mutationFn: (data: PasswordForm) => api.put('/customer/password', data),
    onSuccess: () => {
      toast.success('Password changed successfully. Please login again.')
      setShowPasswordModal(false)
      // Logout will be handled by the backend
    },
    onError: () => {
      toast.error('Failed to change password')
    },
  })

  const revokeSessionMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/customer/security/sessions/${id}`),
    onSuccess: () => {
      toast.success('Session revoked')
      setRevokingSession(null)
      queryClient.invalidateQueries({ queryKey: ['customer-sessions'] })
    },
    onError: () => {
      toast.error('Failed to revoke session')
      setRevokingSession(null)
    },
  })

  const revokeAllSessionsMutation = useMutation({
    mutationFn: () => api.delete('/customer/security/sessions'),
    onSuccess: () => {
      toast.success('All other sessions revoked')
      queryClient.invalidateQueries({ queryKey: ['customer-sessions'] })
    },
    onError: () => {
      toast.error('Failed to revoke sessions')
    },
  })

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  const handlePasswordSubmit = (data: PasswordForm) => {
    changePasswordMutation.mutate(data)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Security Center</h1>
          <p className="text-navy-600">Manage your account security settings</p>
        </div>
        <Button onClick={() => setShowPasswordModal(true)}>
          <KeyIcon className="h-5 w-5" />
          Change Password
        </Button>
      </div>

      {/* Security Status */}
      <Card className="mb-6">
        <CardHeader title="Security Status" />
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-lg">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <ShieldCheckIcon className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-navy-900">Password</p>
                <p className="text-sm text-navy-500">Strong</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-lg">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-navy-900">2FA Status</p>
                <p className="text-sm text-navy-500">Enabled (Email OTP)</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-lg">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-navy-900">Email Verified</p>
                <p className="text-sm text-navy-500">Verified</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-lg">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-navy-900">Mobile Verified</p>
                <p className="text-sm text-navy-500">Verified</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card className="mb-6">
        <CardHeader title="Password" />
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-medium text-navy-900">Change Password</p>
              <p className="text-sm text-navy-500">Update your NetBanking password</p>
            </div>
            <Button onClick={() => setShowPasswordModal(true)}>
              <KeyIcon className="h-5 w-5" />
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Login History */}
      <Card className="mb-6">
        <CardHeader 
          title="Recent Security Events" 
          action={
            <Link to="/customer/security/events" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              View All
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          }
        />
        <CardContent>
          {events && events.length > 0 ? (
            <div className="space-y-3">
              {events.slice(0, 10).map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-navy-50">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <ExclamationTriangleIcon className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy-900">{event.description}</p>
                    <p className="text-xs text-navy-500 mt-1">
                      {event.event_type} • {event.ip_address} • {formatDateTime(event.created_at)}
                    </p>
                    <Badge variant={event.severity === 'critical' ? 'danger' : event.severity === 'warning' ? 'warning' : 'info'} className="mt-1">
                      {event.severity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-navy-500">No security events recorded</p>
          )}
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader 
          title="Active Sessions" 
          action={
            <Button variant="outline" size="sm" onClick={() => revokeAllSessionsMutation.mutate()} loading={revokeAllSessionsMutation.isPending}>
              <XCircleIcon className="h-4 w-4" />
              Revoke All Other Sessions
            </Button>
          }
        />
        <CardContent>
          {sessions && sessions.length > 0 ? (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border border-navy-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <ComputerDesktopIcon className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-navy-900">
                        {session.device_info?.browser || 'Unknown Browser'}
                        {session.device_info?.os && ` on ${session.device_info.os}`}
                      </p>
                      <p className="text-sm text-navy-500">{session.ip_address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="success">Active</Badge>
                    <span className="text-sm text-navy-500">
                      Last active: {formatDateTime(session.last_activity_at)}
                    </span>
                    <Badge variant="info">Expires: {formatDateTime(session.expires_at)}</Badge>
                    {!session.is_revoked && session.id !== 'current' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => { setRevokingSession(session.id); revokeSessionMutation.mutate(session.id); }}
                        loading={revokingSession === session.id}
                      >
                        <XCircleIcon className="h-4 w-4" />
                        Revoke
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-navy-500">No active sessions</p>
          )}
        </CardContent>
      </Card>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => { setShowPasswordModal(false); passwordForm.reset(); }}
        title="Change Password"
        size="md"
      >
        <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
          <Alert variant="info" className="text-sm">
            <p>Your password must be at least 10 characters. Use a mix of uppercase, lowercase, numbers, and symbols.</p>
          </Alert>

          <Input
            {...passwordForm.register('current_password')}
            type="password"
            label="Current Password"
            placeholder="Enter current password"
          />
          <Input
            {...passwordForm.register('new_password')}
            type="password"
            label="New Password"
            placeholder="Enter new password"
            helperText="Minimum 10 characters"
          />
          <Input
            {...passwordForm.register('confirm_password')}
            type="password"
            label="Confirm New Password"
            placeholder="Confirm new password"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-navy-100">
            <Button type="button" variant="outline" onClick={() => { setShowPasswordModal(false); passwordForm.reset(); }}>
              Cancel
            </Button>
            <Button type="submit" loading={changePasswordMutation.isPending}>
              Change Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}