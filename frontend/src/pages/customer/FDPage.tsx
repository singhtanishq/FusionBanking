import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  PlusIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Alert } from '@/components/ui/Alert'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'

interface FixedDeposit {
  id: string
  fd_number: string
  status: string
  principal_amount: number
  interest_rate: number
  tenure_months: number
  maturity_amount: number
  maturity_date: string
  opened_at: string
  matured_at: string | null
  auto_renew: boolean
}

interface FDProduct {
  id: string
  name: string
  code: string
  min_amount: number
  max_amount: number
  min_tenure_months: number
  max_tenure_months: number
  interest_rate: number
}

const fdSchema = z.object({
  fd_product_id: z.string().min(1, 'Select an FD product'),
  principal_amount: z.coerce.number().min(10000, 'Minimum amount is ₹10,000'),
  tenure_months: z.coerce.number().min(1, 'Select a tenure'),
  auto_renew: z.boolean().default(false),
})

type FDForm = z.infer<typeof fdSchema>

export function FDPage() {
  const queryClient = useQueryClient()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'active' | 'matured'>('active')

  const { data: fds } = useQuery({
    queryKey: ['fixed-deposits'],
    queryFn: async () => {
      const response = await api.get('/customer/fixed-deposits')
      return response.data.data as FixedDeposit[]
    },
  })

  const { data: products } = useQuery({
    queryKey: ['fd-products'],
    queryFn: async () => {
      const response = await api.get('/customer/fd-products')
      return response.data.data as FDProduct[]
    },
  })

  const form = useForm<FDForm>({
    resolver: zodResolver(fdSchema),
    defaultValues: {
      auto_renew: false,
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: FDForm) => api.post('/customer/fixed-deposits', data),
    onSuccess: () => {
      toast.success('Fixed Deposit created successfully')
      setShowCreateModal(false)
      form.reset()
      queryClient.invalidateQueries({ queryKey: ['fixed-deposits'] })
    },
    onError: () => {
      toast.error('Failed to create Fixed Deposit')
    },
  })

  const prematureCloseMutation = useMutation({
    mutationFn: (id: string) => api.post(`/customer/fixed-deposits/${id}/premature-close`),
    onSuccess: () => {
      toast.success('FD closed prematurely')
      queryClient.invalidateQueries({ queryKey: ['fixed-deposits'] })
    },
    onError: () => {
      toast.error('Failed to close FD')
    },
  })

  const activeFDs = fds?.filter(f => f.status === 'active') || []
  const maturedFDs = fds?.filter(f => ['matured', 'premature_closed'].includes(f.status)) || []

  const handleSubmit = (data: FDForm) => {
    createMutation.mutate(data)
  }

  const watchProductId = form.watch('fd_product_id')
  const watchPrincipal = form.watch('principal_amount')
  const watchTenure = form.watch('tenure_months')
  const selectedProduct = products?.find(p => p.id.toString() === watchProductId)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Fixed Deposits</h1>
          <p className="text-navy-600">Grow your savings with guaranteed returns</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <PlusIcon className="h-5 w-5" />
          Create New FD
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-navy-500">Active FDs</p>
              <p className="text-2xl font-bold text-navy-900">{activeFDs.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-navy-500">Total Invested</p>
              <p className="text-2xl font-bold text-navy-900">
                {formatCurrency(activeFDs.reduce((sum, fd) => sum + fd.principal_amount, 0))}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <CurrencyDollarIcon className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-navy-500">Est. Maturity Value</p>
              <p className="text-2xl font-bold text-emerald-600">
                {formatCurrency(activeFDs.reduce((sum, fd) => sum + fd.maturity_amount, 0))}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <ChartBarIcon className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-navy-200 mb-6">
        <nav className="flex gap-8" aria-label="FD tabs">
          <button
            onClick={() => setActiveTab('active')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'active' ? 'border-primary-600 text-primary-600' : 'border-transparent text-navy-500 hover:text-navy-700'}`}
          >
            Active FDs
          </button>
          <button
            onClick={() => setActiveTab('matured')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'matured' ? 'border-primary-600 text-primary-600' : 'border-transparent text-navy-500 hover:text-navy-700'}`}
          >
            Matured / Closed
          </button>
        </nav>
      </div>

      {/* FDs List */}
      <Card>
        <CardContent className="pt-0">
          {(activeTab === 'active' ? activeFDs : maturedFDs).length === 0 ? (
            <div className="pt-12 pb-12 text-center">
              <CurrencyDollarIcon className="h-16 w-16 text-navy-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-navy-900 mb-2">No Fixed Deposits</h3>
              <p className="text-navy-600 mb-6">Start building your savings with a Fixed Deposit.</p>
              <Button onClick={() => setShowCreateModal(true)}>
                <PlusIcon className="h-5 w-5" />
                Create Your First FD
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {(activeTab === 'active' ? activeFDs : maturedFDs).map((fd) => (
                <div key={fd.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-navy-100 hover:bg-navy-50 transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <CurrencyDollarIcon className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-navy-900 font-mono text-sm">{fd.fd_number}</p>
                      <p className="text-sm text-navy-500">{fd.tenure_months} months • {fd.interest_rate}% p.a. • {formatCurrency(fd.principal_amount)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <Badge variant={
                      fd.status === 'active' ? 'success' :
                      fd.status === 'matured' ? 'info' :
                      fd.status === 'premature_closed' ? 'warning' : 'gray'
                    }>
                      {fd.status.replace(/_/g, ' ')}
                    </Badge>
                    <span className="text-sm text-navy-500">Matures: {formatDate(fd.maturity_date)}</span>
                    <span className="font-semibold text-emerald-600 tabular-nums">{formatCurrency(fd.maturity_amount)}</span>
                    {fd.status === 'active' && (
                      <Button size="sm" variant="ghost" className="text-red-600" onClick={() => setCloseTarget(fd.id)}>
                        Close early
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create FD Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); form.reset(); }}
        title="Create Fixed Deposit"
        size="lg"
      >
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Alert variant="info" className="text-sm">
            <p>Create a new Fixed Deposit. The amount will be debited from your primary account immediately.</p>
          </Alert>

          <Select
            {...form.register('fd_product_id')}
            label="FD Product"
            error={form.formState.errors.fd_product_id?.message}
            options={products?.map(p => ({ 
              value: p.id.toString(), 
              label: `${p.name} - ${p.interest_rate}% p.a. (${p.min_tenure_months}-${p.max_tenure_months} months)` 
            })) || []}
            placeholder="Select FD product"
          />

          {selectedProduct && (
            <div className="bg-navy-50 rounded-lg p-4">
              <h4 className="font-medium text-navy-900 mb-2">Product Details</h4>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-navy-500">Interest Rate: </span>
                  <span className="font-medium text-navy-900">{selectedProduct.interest_rate}% p.a.</span>
                </div>
                <div>
                  <span className="text-navy-500">Tenure Range: </span>
                  <span className="font-medium text-navy-900">{selectedProduct.min_tenure_months} - {selectedProduct.max_tenure_months} months</span>
                </div>
                <div>
                  <span className="text-navy-500">Min Amount: </span>
                  <span className="font-medium text-navy-900">{formatCurrency(selectedProduct.min_amount)}</span>
                </div>
                <div>
                  <span className="text-navy-500">Max Amount: </span>
                  <span className="font-medium text-navy-900">{formatCurrency(selectedProduct.max_amount)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-6">
            <Input
              {...form.register('principal_amount')}
              type="number"
              label="Principal Amount (₹)"
              placeholder="100000"
              error={form.formState.errors.principal_amount?.message}
            />
            <Input
              {...form.register('tenure_months')}
              type="number"
              label="Tenure (Months)"
              placeholder="36"
              error={form.formState.errors.tenure_months?.message}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...form.register('auto_renew')}
              id="auto_renew"
              className="rounded border-navy-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="auto_renew" className="text-sm text-navy-700">
              Auto-renew on maturity
            </label>
          </div>

          {selectedProduct && form.getValues('principal_amount') && form.getValues('tenure_months') && (
            <Alert variant="info" className="text-sm">
              <p className="font-medium">Estimated Maturity:</p>
              <p>Principal: {formatCurrency(form.getValues('principal_amount'))}</p>
              <p>Estimated Interest: {formatCurrency(form.getValues('principal_amount') * (selectedProduct.interest_rate / 100) * (form.getValues('tenure_months') / 12))}</p>
              <p className="font-medium">Estimated Maturity: {formatCurrency(form.getValues('principal_amount') + (form.getValues('principal_amount') * (selectedProduct.interest_rate / 100) * (form.getValues('tenure_months') / 12)))}</p>
            </Alert>
          )}

          <Alert variant="warning" className="text-sm">
            <p className="font-medium">Important:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Amount will be debited immediately from your primary account</li>
              <li>Premature withdrawal may attract penalty (typically 1% of principal)</li>
              <li>Interest rates are fixed for the chosen tenure</li>
              <li>TDS applicable as per Income Tax rules</li>
            </ul>
          </Alert>

          <div className="flex justify-end gap-3 pt-4 border-t border-navy-100">
            <Button type="button" variant="outline" onClick={() => { setShowCreateModal(false); form.reset(); }}>
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending} disabled={!selectedProduct || form.getValues('principal_amount') < (selectedProduct?.min_amount || 0) || form.getValues('tenure_months') < (selectedProduct?.min_tenure_months || 0) || form.getValues('tenure_months') > (selectedProduct?.max_tenure_months || 0)}>
              Create Fixed Deposit
              <PlusIcon className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}