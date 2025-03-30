import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import { api, handleApiError } from '@/services/api'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { toast } from 'react-hot-toast'

interface Promotion {
  id: number
  title: string
  subtitle: string
  cta_text: string
  cta_url: string
  is_active: boolean
  display_order: number
}

interface PromotionForm {
  title: string
  subtitle: string
  cta_text: string
  cta_url: string
  display_order: number
}

const emptyForm: PromotionForm = { title: '', subtitle: '', cta_text: 'Learn more', cta_url: '/', display_order: 1 }

export function AdminPromotionsPage() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<Promotion | 'new' | null>(null)
  const [form, setForm] = useState<PromotionForm>(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null)

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-promotions'],
    queryFn: async (): Promise<{ success: boolean; data: Promotion[] }> => {
      const response = await api.get('/admin/promotions')
      return response.data
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const isNew = editing === 'new'
      const response = isNew
        ? await api.post('/admin/promotions', form)
        : await api.put(`/admin/promotions/${(editing as Promotion).id}`, form)
      if (!response.data.success) throw new Error(response.data.message)
      return response.data
    },
    onSuccess: () => {
      toast.success(editing === 'new' ? 'Promotion created' : 'Promotion updated')
      setEditing(null)
      queryClient.invalidateQueries({ queryKey: ['admin-promotions'] })
    },
    onError: (e) => toast.error(handleApiError(e as never)),
  })

  const deleteMutation = useMutation({
    mutationFn: async (promo: Promotion) => {
      const response = await api.delete(`/admin/promotions/${promo.id}`)
      if (!response.data.success) throw new Error(response.data.message)
      return response.data
    },
    onSuccess: () => {
      toast.success('Promotion deleted')
      setDeleteTarget(null)
      queryClient.invalidateQueries({ queryKey: ['admin-promotions'] })
    },
    onError: (e) => toast.error(handleApiError(e as never)),
  })

  const toggleMutation = useMutation({
    mutationFn: async (promo: Promotion) => {
      const response = await api.put(`/admin/promotions/${promo.id}`, {
        title: promo.title,
        subtitle: promo.subtitle,
        cta_text: promo.cta_text,
        cta_url: promo.cta_url,
        display_order: promo.display_order,
        is_active: !promo.is_active,
      })
      if (!response.data.success) throw new Error(response.data.message)
      return response.data
    },
    onSuccess: () => {
      toast.success('Promotion updated')
      queryClient.invalidateQueries({ queryKey: ['admin-promotions'] })
    },
    onError: (e) => toast.error(handleApiError(e as never)),
  })

  const openEdit = (promo: Promotion | 'new') => {
    setEditing(promo)
    if (promo === 'new') {
      setForm(emptyForm)
    } else {
      setForm({
        title: promo.title,
        subtitle: promo.subtitle,
        cta_text: promo.cta_text,
        cta_url: promo.cta_url,
        display_order: promo.display_order,
      })
    }
  }

  const promotions = data?.data ?? []
  const formValid = form.title.trim().length > 0 && form.subtitle.trim().length > 0 && form.cta_text.trim().length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Promotions</h1>
          <p className="text-navy-600">Marketing banners shown on the public website</p>
        </div>
        <Button onClick={() => openEdit('new')}>
          <PlusIcon className="h-5 w-5" /> New promotion
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="animate-pulse h-14 bg-navy-100 rounded" />)}
            </div>
          ) : isError ? (
            <div className="p-8 text-center">
              <p className="text-red-600 mb-3">{handleApiError(error as never)}</p>
              <Button variant="outline" onClick={() => refetch()}>Retry</Button>
            </div>
          ) : promotions.length === 0 ? (
            <div className="p-8 text-center text-navy-500">No promotions configured.</div>
          ) : (
            <ul className="divide-y divide-navy-100" role="list">
              {promotions.map((p) => (
                <li key={p.id} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-navy-900 truncate">{p.title}</p>
                      <Badge variant={p.is_active ? 'success' : 'gray'}>{p.is_active ? 'Active' : 'Inactive'}</Badge>
                      <Badge variant="gray">#{p.display_order}</Badge>
                    </div>
                    <p className="text-sm text-navy-500 truncate">{p.subtitle} → {p.cta_url}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => toggleMutation.mutate(p)}>
                      {p.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(p)} aria-label={`Edit ${p.title}`}>
                      <PencilSquareIcon className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-600" onClick={() => setDeleteTarget(p)} aria-label={`Delete ${p.title}`}>
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit modal */}
      <Modal
        isOpen={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'New promotion' : 'Edit promotion'}
      >
        <div className="space-y-3">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input label="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          <Input label="CTA Text" value={form.cta_text} onChange={(e) => setForm({ ...form, cta_text: e.target.value })} />
          <Input label="CTA URL" value={form.cta_url} onChange={(e) => setForm({ ...form, cta_url: e.target.value })} />
          <Input
            label="Display Order"
            type="number"
            value={String(form.display_order)}
            onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) || 0 })}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button disabled={!formValid} loading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
              {editing === 'new' ? 'Create' : 'Save changes'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
        title="Delete promotion"
        message={`Delete "${deleteTarget?.title ?? ''}"? This cannot be undone.`}
        confirmText="Delete"
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
