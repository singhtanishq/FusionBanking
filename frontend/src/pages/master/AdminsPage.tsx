import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { api, handleApiError } from '@/services/api'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'

interface AdminUser {
  id: number
  username: string
  email: string
  full_name: string
  is_master: boolean
  is_active: boolean
  created_at?: string
}

export function MasterAdminsPage() {
  const queryClient = useQueryClient()
  const { user: currentUser } = useAuth()
  const [creating, setCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)
  const [form, setForm] = useState({ username: '', email: '', full_name: '', password: '', is_master: false })

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['master-admins'],
    queryFn: async (): Promise<{ success: boolean; data: AdminUser[] }> => {
      const response = await api.get('/master/admins')
      return response.data
    },
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/master/admins', form)
      if (!response.data.success) throw new Error(response.data.message)
      return response.data
    },
    onSuccess: () => {
      toast.success('Admin user created')
      setCreating(false)
      setForm({ username: '', email: '', full_name: '', password: '', is_master: false })
      queryClient.invalidateQueries({ queryKey: ['master-admins'] })
    },
    onError: (e) => toast.error(handleApiError(e as never)),
  })

  const deleteMutation = useMutation({
    mutationFn: async (admin: AdminUser) => {
      const response = await api.delete(`/master/admins/${admin.id}`)
      if (!response.data.success) throw new Error(response.data.message)
      return response.data
    },
    onSuccess: () => {
      toast.success('Admin user removed')
      setDeleteTarget(null)
      queryClient.invalidateQueries({ queryKey: ['master-admins'] })
    },
    onError: (e) => toast.error(handleApiError(e as never)),
  })

  const admins = data?.data ?? []
  const formValid = form.username.trim() && form.email.trim() && form.full_name.trim() && form.password.length >= 10

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Admin Users</h1>
          <p className="text-navy-600">Master-only management of bank administrators</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <PlusIcon className="h-5 w-5" /> New admin
        </Button>
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
          ) : admins.length === 0 ? (
            <div className="p-8 text-center text-navy-500">No admin users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="bg-navy-50 border-b border-navy-200">
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">Admin</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">Role</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">Status</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">Created</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold text-navy-700 uppercase tracking-wider text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {admins.map((a) => (
                    <tr key={a.id} className="hover:bg-navy-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-navy-900">{a.full_name}</p>
                        <p className="text-xs text-navy-500">{a.username} · {a.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={a.is_master ? 'primary' : 'gray'}>{a.is_master ? 'Master Admin' : 'Admin'}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={a.is_active ? 'success' : 'gray'}>{a.is_active ? 'Active' : 'Inactive'}</Badge>
                      </td>
                      <td className="px-4 py-3 text-navy-600 whitespace-nowrap">{a.created_at ? formatDate(a.created_at) : '—'}</td>
                      <td className="px-4 py-3 text-right">
                        {currentUser && 'id' in currentUser && currentUser.id !== a.id && !a.is_master && (
                          <Button size="sm" variant="ghost" className="text-red-600" onClick={() => setDeleteTarget(a)} aria-label={`Remove ${a.username}`}>
                            <TrashIcon className="h-4 w-4" />
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

      <Modal isOpen={creating} onClose={() => setCreating(false)} title="Create admin user">
        <div className="space-y-3">
          <Input label="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          <Input label="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={form.password.length > 0 && form.password.length < 10 ? 'Minimum 10 characters' : undefined}
          />
          <label className="flex items-center gap-2 text-sm text-navy-700">
            <input
              type="checkbox"
              checked={form.is_master}
              onChange={(e) => setForm({ ...form, is_master: e.target.checked })}
              className="rounded border-navy-300 text-primary-600 focus:ring-primary-500"
            />
            Grant master admin privileges
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            <Button disabled={!formValid} loading={createMutation.isPending} onClick={() => createMutation.mutate()}>
              Create admin
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
        title="Remove admin user"
        message={`Remove ${deleteTarget?.full_name ?? 'this admin'}? They will immediately lose access to the admin portal.`}
        confirmText="Remove"
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
