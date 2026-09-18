import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, handleApiError } from '@/services/api'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { toast } from 'react-hot-toast'

interface SystemSetting {
  key: string
  value: string | number | boolean
  type: string
  description: string
  is_public: boolean
  group: string
  validation_rules: string | null
}

export function AdminSettingsPage() {
  const queryClient = useQueryClient()
  const [editKey, setEditKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async (): Promise<{ success: boolean; data: SystemSetting[] }> => {
      const response = await api.get('/admin/settings')
      return response.data
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const response = await api.put(`/admin/settings/${key}`, { value })
      if (!response.data.success) throw new Error(response.data.message)
      return response.data
    },
    onSuccess: () => {
      toast.success('Setting updated')
      setEditKey(null)
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
    },
    onError: (e) => toast.error(handleApiError(e as never)),
  })

  const settings = data?.data ?? []
  const groups = settings.reduce<Record<string, SystemSetting[]>>((acc, s) => {
    ;(acc[s.group] ??= []).push(s)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">System Settings</h1>
        <p className="text-navy-600">Bank-wide operational limits and security configuration</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="animate-pulse h-40 bg-white rounded-xl border border-navy-200" />)}
        </div>
      ) : isError ? (
        <div className="p-8 text-center">
          <p className="text-red-600 mb-3">{handleApiError(error as never)}</p>
          <Button variant="outline" onClick={() => refetch()}>Retry</Button>
        </div>
      ) : (
        Object.entries(groups).map(([group, groupSettings]) => (
          <Card key={group}>
            <CardHeader title={group.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} />
            <CardContent>
              <dl className="divide-y divide-navy-100">
                {groupSettings.map((s) => (
                  <div key={s.key} className="py-3 flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <dt className="font-mono text-sm text-navy-900 flex items-center gap-2">
                        {s.key}
                        {s.is_public && <Badge variant="gray">public</Badge>}
                      </dt>
                      {s.description && <dd className="text-sm text-navy-500">{s.description}</dd>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {editKey === s.key ? (
                        <>
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            aria-label={`New value for ${s.key}`}
                            className="w-40"
                          />
                          <Button
                            size="sm"
                            disabled={!editValue.trim()}
                            loading={updateMutation.isPending}
                            onClick={() => updateMutation.mutate({ key: s.key, value: editValue })}
                          >
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditKey(null)}>Cancel</Button>
                        </>
                      ) : (
                        <>
                          <span className="font-mono text-sm text-navy-900 bg-navy-50 px-2 py-1 rounded">{String(s.value)}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setEditKey(s.key); setEditValue(String(s.value)) }}
                          >
                            Edit
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
