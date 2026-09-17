import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  PlusIcon, 
  BanknotesIcon, 
  ChartBarIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'

interface Loan {
  id: string
  loan_number: string
  status: string
  principal_amount: number
  approved_amount: number | null
  interest_rate: number
  tenure_months: number
  emi: number | null
  total_interest: number | null
  total_repayment: number | null
  disbursed_at: string | null
  first_emi_date: string | null
  maturity_date: string | null
  purpose: string
  employment_type: string
  employer_name: string | null
  monthly_salary: number
  existing_obligations: number
  created_at: string
}

interface LoanProduct {
  id: string
  name: string
  code: string
  min_amount: number
  max_amount: number
  min_tenure_months: number
  max_tenure_months: number
  interest_rate: number
  processing_fee_percent: number
}

const loanSchema = z.object({
  loan_product_id: z.string().min(1, 'Select a loan product'),
  principal_amount: z.coerce.number().min(10000, 'Minimum amount is ₹10,000'),
  tenure_months: z.coerce.number().min(12, 'Minimum tenure is 12 months'),
  purpose: z.string().min(10, 'Purpose is required'),
  employment_type: z.enum(['salaried', 'self_employed', 'business', 'other']),
  employer_name: z.string().optional(),
  employment_duration_months: z.coerce.number().optional(),
  monthly_salary: z.coerce.number().min(1, 'Monthly salary is required'),
  existing_obligations: z.coerce.number().default(0),
})

type LoanForm = z.infer<typeof loanSchema>

export function LoansPage() {
  const queryClient = useQueryClient()
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active')

  const { data: loans } = useQuery({
    queryKey: ['loans'],
    queryFn: async () => {
      const response = await api.get('/customer/loans')
      return response.data.data as Loan[]
    },
  })

  const { data: products } = useQuery({
    queryKey: ['loan-products'],
    queryFn: async () => {
      const response = await api.get('/customer/loan-products')
      return response.data.data as LoanProduct[]
    },
  })

  const form = useForm<LoanForm>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      employment_type: 'salaried',
      existing_obligations: 0,
    },
  })

  const applyMutation = useMutation({
    mutationFn: (data: LoanForm) => api.post('/customer/loans', data),
    onSuccess: () => {
      toast.success('Loan application submitted successfully')
      setShowApplyModal(false)
      form.reset()
      queryClient.invalidateQueries({ queryKey: ['loans'] })
    },
    onError: () => {
      toast.error('Failed to submit loan application')
    },
  })

  const activeLoans = loans?.filter(l => ['approved', 'disbursed', 'active'].includes(l.status)) || []
  const historyLoans = loans?.filter(l => ['rejected', 'closed'].includes(l.status)) || []
  const pendingLoans = loans?.filter(l => ['draft', 'submitted', 'under_review', 'additional_info_required'].includes(l.status)) || []

  const handleSubmit = (data: LoanForm) => {
    applyMutation.mutate(data)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Loans</h1>
          <p className="text-navy-600">Apply for loans and track your applications</p>
        </div>
        <Button onClick={() => setShowApplyModal(true)}>
          <PlusIcon className="h-5 w-5" />
          Apply for Loan
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-navy-500">Active Loans</p>
              <p className="text-2xl font-bold text-navy-900">{activeLoans.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <BanknotesIcon className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-navy-500">Pending Applications</p>
              <p className="text-2xl font-bold text-amber-600">{pendingLoans.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <ClockIcon className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-navy-500">Completed Loans</p>
              <p className="text-2xl font-bold text-emerald-600">{historyLoans.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-navy-200 mb-6">
        <nav className="flex gap-8" aria-label="Loan tabs">
          <button
            onClick={() => setActiveTab('active')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'active' ? 'border-primary-600 text-primary-600' : 'border-transparent text-navy-500 hover:text-navy-700'}`}
          >
            Active Loans
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'history' ? 'border-primary-600 text-primary-600' : 'border-transparent text-navy-500 hover:text-navy-700'}`}
          >
            History
          </button>
        </nav>
      </div>

      {/* Loans List */}
      <Card>
        <CardContent className="pt-0">
          {activeTab === 'active' && activeLoans.length === 0 && activeTab === 'history' && historyLoans.length === 0 ? (
            <div className="pt-12 pb-12 text-center">
              <BanknotesIcon className="h-16 w-16 text-navy-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-navy-900 mb-2">No Loans Found</h3>
              <p className="text-navy-600 mb-6">You don't have any loans yet.</p>
              <Button onClick={() => setShowApplyModal(true)}>
                <PlusIcon className="h-5 w-5" />
                Apply for Your First Loan
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {(activeTab === 'active' ? activeLoans : historyLoans).map((loan) => (
                <Link key={loan.id} to={`/customer/loans/${loan.id}`} className="flex items-center justify-between p-4 rounded-lg border border-navy-100 hover:bg-navy-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                      <BanknotesIcon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-navy-900">{loan.loan_number}</p>
                      <p className="text-sm text-navy-500">Purpose: {loan.purpose}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={
                      loan.status === 'active' ? 'success' :
                      loan.status === 'disbursed' ? 'info' :
                      loan.status === 'approved' ? 'success' :
                      loan.status === 'rejected' ? 'danger' : 'warning'
                    }>
                      {loan.status.replace('_', ' ')}
                    </Badge>
                    <span className="font-semibold text-navy-900 tabular-nums">
                      {loan.approved_amount ? formatCurrency(loan.approved_amount) : formatCurrency(loan.principal_amount)}
                    </Badge>
                    {loan.emi && <span className="text-sm text-navy-500">EMI: {formatCurrency(loan.emi)}</span>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Apply for Loan Modal */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => { setShowApplyModal(false); form.reset(); }}
        title="Apply for Loan"
        size="lg"
      >
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Alert variant="info" className="text-sm">
            <p>Fill in the details below to apply for a loan. Our team will review your application and get back to you within 3-5 business days.</p>
          </Alert>

          <div className="grid sm:grid-cols-2 gap-6">
            <Select
              {...form.register('loan_product_id')}
              label="Loan Type"
              error={form.formState.errors.loan_product_id?.message}
              options={products?.map(p => ({ value: p.id.toString(), label: `${p.name} (${p.interest_rate}% p.a.)` })) || []}
              placeholder="Select loan product"
            />
            <Input
              {...form.register('principal_amount')}
              type="number"
              label="Loan Amount (₹)"
              placeholder="500000"
              error={form.formState.errors.principal_amount?.message}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <Input
              {...form.register('tenure_months')}
              type="number"
              label="Tenure (Months)"
              placeholder="36"
              error={form.formState.errors.tenure_months?.message}
            />
            <Select
              {...form.register('employment_type')}
              label="Employment Type"
              error={form.formState.errors.employment_type?.message}
              options={[
                { value: 'salaried', label: 'Salaried' },
                { value: 'self_employed', label: 'Self Employed' },
                { value: 'business', label: 'Business' },
                { value: 'other', label: 'Other' },
              ]}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <Input
              {...form.register('employer_name')}
              label="Employer Name"
              placeholder="Company Name"
            />
            <Input
              {...form.register('employment_duration_months')}
              type="number"
              label="Employment Duration (Months)"
              placeholder="24"
            />
          </div>

          <Input
            {...form.register('monthly_salary')}
            type="number"
            label="Monthly Salary (₹)"
            placeholder="50000"
            error={form.formState.errors.monthly_salary?.message}
          />
          <Input
            {...form.register('existing_obligations')}
            type="number"
            label="Existing Monthly Obligations (₹)"
            placeholder="0"
            helperText="Other loan EMIs, credit card payments, etc."
          />
          <Input
            {...form.register('purpose')}
            label="Loan Purpose"
            placeholder="Home renovation, education, medical, etc."
            error={form.formState.errors.purpose?.message}
          />

          <Alert variant="warning" className="text-sm">
            <p className="font-medium">Important:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Loan approval is subject to credit assessment and eligibility criteria</li>
              <li>Interest rates and terms are indicative and may vary based on your profile</li>
              <li>Processing fees apply as per the selected loan product</li>
            </ul>
          </Alert>

          <div className="flex justify-end gap-3 pt-4 border-t border-navy-100">
            <Button type="button" variant="outline" onClick={() => { setShowApplyModal(false); form.reset(); }}>
              Cancel
            </Button>
            <Button type="submit" loading={applyMutation.isPending}>
              Submit Application
              <PlusIcon className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}