import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  PlusIcon, 
  UserCircleIcon, 
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { maskAccountNumber } from '@/lib/utils'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { toast } from 'react-hot-toast'

interface Beneficiary {
  id: string
  name: string
  account_number: string
  ifsc_code: string
  nickname: string
  is_verified: boolean
  verified_at: string | null
  cooling_period_ends_at: string | null
}

const beneficiarySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  account_number: z.string().min(12, 'Enter a valid account number').max(20),
  ifsc_code: z.string().min(8, 'Enter a valid IFSC code').max(15).toUpperCase(),
  nickname: z.string().optional(),
})

type BeneficiaryForm = z.infer<typeof beneficiarySchema>

export function BeneficiariesPage() {
  const queryClient = useQueryClient()
  const [showAddModal, setShowAddModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<Beneficiary | null>(null)
  const [validating, setValidating] = useState(false)
  const [recipient, setRecipient] = useState<{ name: string; account_number: string; ifsc: string } | null>(null)

  const { data: beneficiaries } = useQuery({
    queryKey: ['beneficiaries'],
    queryFn: async () => {
      const response = await api.get('/customer/beneficiaries')
      return response.data.data as Beneficiary[]
    },
  })

  const form = useForm<BeneficiaryForm>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: {
      nickname: '',
    },
  })

  const addBeneficiaryMutation = useMutation({
    mutationFn: (data: BeneficiaryForm) => api.post('/customer/beneficiaries', data),
    onSuccess: () => {
      toast.success('Beneficiary added successfully')
      setShowAddModal(false)
      form.reset()
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] })
    },
    onError: () => {
      toast.error('Failed to add beneficiary')
    },
  })

  const deleteBeneficiaryMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/customer/beneficiaries/${id}`),
    onSuccess: () => {
      toast.success('Beneficiary removed')
      setDeleteConfirm(null)
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] })
    },
    onError: () => {
      toast.error('Failed to remove beneficiary')
    },
  })

  const validateRecipient = async () => {
    const accountNumber = form.getValues('account_number')
    const ifsc = form.getValues('ifsc_code')
    
    if (!accountNumber || !ifsc) return

    setValidating(true)
    try {
      const response = await api.post('/transfers/validate-recipient', { 
        account_number: accountNumber, 
        ifsc: ifsc.toUpperCase() 
      })
      
      if (response.data.success && response.data.data) {
        setRecipient({
          name: response.data.data.name,
          account_number: response.data.data.account_number,
          ifsc: response.data.data.ifsc,
        })
        toast.success('Recipient verified')
      } else {
        setRecipient(null)
        toast.error('Account not found or not eligible')
      }
    } catch (error) {
      setRecipient(null)
      toast.error('Invalid account details')
    } finally {
      setValidating(false)
    }
  }

  const handleSubmit = (data: BeneficiaryForm) => {
    if (!recipient) {
      toast.error('Please verify recipient first')
      return
    }
    addBeneficiaryMutation.mutate(data)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Beneficiaries</h1>
          <p className="text-navy-600">Manage your saved payees for quick transfers</p>
        </div>
        <Button onClick={() => { setShowAddModal(true); setRecipient(null); form.reset(); }}>
          <PlusIcon className="h-5 w-5" />
          Add Beneficiary
        </Button>
      </div>

      {beneficiaries && beneficiaries.length > 0 ? (
        <Card>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-navy-50 border-b border-navy-200">
                    <th className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">Beneficiary</th>
                    <th className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">Account</th>
                    <th className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">IFSC</th>
                    <th className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-navy-700 uppercase tracking-wider text-xs">Cooling Period</th>
                    <th className="px-4 py-3 text-right font-semibold text-navy-700 uppercase tracking-wider text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {beneficiaries.map((beneficiary) => (
                    <tr key={beneficiary.id} className="hover:bg-navy-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <UserCircleIcon className="h-5 w-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-navy-900">{beneficiary.name}</p>
                            {beneficiary.nickname && (
                              <p className="text-sm text-navy-500">{beneficiary.nickname}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-mono text-navy-900">{maskAccountNumber(beneficiary.account_number)}</td>
                      <td className="px-4 py-4 font-mono text-navy-600">{beneficiary.ifsc_code}</td>
                      <td className="px-4 py-4">
                        <Badge variant={beneficiary.is_verified ? 'success' : 'warning'}>
                          {beneficiary.is_verified ? 'Verified' : 'Pending'}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-sm text-navy-600">
                        {beneficiary.cooling_period_ends_at && new Date(beneficiary.cooling_period_ends_at) > new Date() ? (
                          <span className="text-amber-600 flex items-center gap-1">
                            <ExclamationTriangleIcon className="h-4 w-4" />
                            Active
                          </span>
                        ) : (
                          <span className="text-emerald-600 flex items-center gap-1">
                            <CheckCircleIcon className="h-4 w-4" />
                            Ready
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Button 
                          variant="ghost" 
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => setDeleteConfirm(beneficiary)}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <UserCircleIcon className="h-16 w-16 text-navy-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-navy-900 mb-2">No Beneficiaries Yet</h3>
            <p className="text-navy-600 mb-6">Add beneficiaries to make transfers faster and easier.</p>
            <Button onClick={() => setShowAddModal(true)}>
              <PlusIcon className="h-5 w-5" />
              Add Your First Beneficiary
            </Button>
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setRecipient(null); form.reset(); }}
        title="Add New Beneficiary"
        size="lg"
      >
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Input
            {...form.register('name')}
            label="Beneficiary Name"
            placeholder="John Doe"
          />
          
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1.5">Account Number</label>
            <div className="flex gap-2">
              <Input
                {...form.register('account_number')}
                placeholder="501234567891"
                onBlur={validateRecipient}
              />
              <Button type="button" variant="outline" onClick={validateRecipient} loading={validating} className="h-10">
                Verify
              </Button>
            </div>
          </div>

          {recipient && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-emerald-900">Recipient Verified</p>
                  <p className="text-sm text-emerald-700">{recipient.name}</p>
                  <p className="text-xs text-emerald-600 font-mono">{maskAccountNumber(recipient.account_number)} • {recipient.ifsc}</p>
                </div>
                <Badge variant="success" className="ml-auto">Verified</Badge>
              </div>
            </div>
          )}

          <Input
            {...form.register('ifsc_code')}
            label="IFSC Code"
            placeholder="FUSB0001001"
          />
          <Input
            {...form.register('nickname')}
            label="Nickname (Optional)"
            placeholder="e.g., John's Savings"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-navy-100">
            <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); setRecipient(null); form.reset(); }}>
              Cancel
            </Button>
            <Button type="submit" loading={addBeneficiaryMutation.isPending}>
              Add Beneficiary
              <PlusIcon className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && deleteBeneficiaryMutation.mutate(deleteConfirm.id)}
        title="Remove Beneficiary"
        message={`Are you sure you want to remove ${deleteConfirm?.name} as a beneficiary? This action cannot be undone.`}
        confirmText="Remove"
        variant="danger"
        loading={deleteBeneficiaryMutation.isPending}
      />
    </div>
  )
}