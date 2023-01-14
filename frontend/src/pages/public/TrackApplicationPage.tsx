import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { MagnifyingGlassIcon, CheckCircleIcon, AlertCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { ApplicationService } from '@/services/application'
import { formatDateTime } from '@/lib/utils'
import { toast } from 'react-hot-toast'

const trackSchema = z.object({
  acknowledgement_number: z.string().min(1, 'Acknowledgement number is required'),
})

type TrackForm = z.infer<typeof trackSchema>

const stepOrder = [
  { key: 'submitted', label: 'Application Submitted', icon: CheckCircleIcon },
  { key: 'personal_info', label: 'Personal Information', icon: CheckCircleIcon },
  { key: 'contact_info', label: 'Contact Details', icon: CheckCircleIcon },
  { key: 'kyc_info', label: 'KYC Verification', icon: CheckCircleIcon },
  { key: 'documents', label: 'Document Verification', icon: CheckCircleIcon },
  { key: 'review', label: 'Final Review', icon: CheckCircleIcon },
  { key: 'account_creation', label: 'Account Creation', icon: CheckCircleIcon },
]

export function TrackApplicationPage() {
  const [application, setApplication] = useState<Application | null>(null)
  const [searching, setSearching] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TrackForm>({
    resolver: zodResolver(trackSchema),
  })

  const onSubmit = async (data: TrackForm) => {
    setSearching(true)
    try {
      const result = await ApplicationService.getApplication(data.acknowledgement_number)
      setApplication(result)
      setShowDetails(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Application not found')
      setApplication(null)
      setShowDetails(false)
    } finally {
      setSearching(false)
    }
  }

  const getStepStatus = (stepKey: string) => {
    if (!application) return 'pending'
    const step = application.steps.find(s => s.step_key === stepKey)
    if (!step) return 'pending'
    
    if (step.status === 'verified' || step.status === 'completed') return 'completed'
    if (step.status === 'in_review') return 'current'
    if (step.status === 'rejected' || step.status === 'correction_required') return 'error'
    return 'pending'
  }

  if (!showDetails) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
            <MagnifyingGlassIcon className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-navy-900">Track Your Application</h1>
          <p className="mt-2 text-navy-600">Enter your acknowledgement number to check the status</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                {...register('acknowledgement_number')}
                label="Acknowledgement Number"
                placeholder="FBK-2026-XXXXXXXX"
                error={errors.acknowledgement_number?.message}
                autoComplete="off"
              />
              <Button type="submit" className="w-full" loading={searching}>
                Track Application
                <MagnifyingGlassIcon className="h-5 w-5" />
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-navy-500">
              Don't have an acknowledgement number?{' '}
              <Link to="/open-account" className="text-primary-600 hover:underline">
                Open an Account
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Application Status</h1>
            <p className="text-navy-600">Acknowledgement: <span className="font-mono font-medium">{application.acknowledgement_number}</span></p>
          </div>
          <Button variant="ghost" onClick={() => setShowDetails(false)}>
            New Search
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-navy-50 rounded-lg">
              <p className="text-2xl font-bold text-navy-900">{application.status.replace('_', ' ').toUpperCase()}</p>
              <p className="text-sm text-navy-600">Current Status</p>
            </div>
            <div className="text-center p-4 bg-navy-50 rounded-lg">
              <p className="text-2xl font-bold text-navy-900">{application.preferred_account_type}</p>
              <p className="text-sm text-navy-600">Account Type</p>
            </div>
            <div className="text-center p-4 bg-navy-50 rounded-lg">
              <p className="text-2xl font-bold text-navy-900">{application.submitted_at ? formatDateTime(application.submitted_at).split(',')[0] : 'N/A'}</p>
              <p className="text-sm text-navy-600">Submitted On</p>
            </div>
            <div className="text-center p-4 bg-navy-50 rounded-lg">
              <p className="text-2xl font-bold text-navy-900">{application.steps.filter(s => s.status === 'verified' || s.status === 'completed').length}</p>
              <p className="text-sm text-navy-600">Steps Completed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Tracker */}
      <Card className="mb-6">
        <CardHeader title="Application Progress" />
        <CardContent>
          <ol className="space-y-4" role="list">
            {stepOrder.map((step, index) => {
              const status = getStepStatus(step.key)
              const isLast = index === stepOrder.length - 1
              
              return (
                <li key={step.key} className="relative flex items-start gap-4">
                  {!isLast && (
                    <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-navy-200" aria-hidden="true">
                      <div className="h-full bg-primary-600" style={{ height: status === 'completed' ? '100%' : '0%' }} />
                    </div>
                  )}
                  <div className={cn('relative flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center', 
                    status === 'completed' && 'bg-emerald-500 border-emerald-500',
                    status === 'current' && 'bg-white border-primary-500',
                    status === 'error' && 'bg-red-500 border-red-500',
                    status === 'pending' && 'bg-white border-navy-300'
                  )}>
                    {status === 'completed' && <CheckCircleIcon className="h-6 w-6 text-white" />}
                    {status === 'current' && <div className="w-3 h-3 rounded-full bg-primary-500" />}
                    {status === 'error' && <XCircleIcon className="h-6 w-6 text-white" />}
                    {status === 'pending' && <span className="text-sm font-medium text-navy-400">{index + 1}</span>}
                  </div>
                  <div className="flex-1 pt-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-navy-900">{step.label}</h3>
                      <StatusBadge status={application.steps.find(s => s.step_key === step.key)?.status || 'pending'} />
                    </div>
                    {application.steps.find(s => s.step_key === step.key)?.rejection_reason && (
                      <p className="mt-1 text-sm text-red-600">Reason: {application.steps.find(s => s.step_key === step.key)!.rejection_reason}</p>
                    )}
                    {application.steps.find(s => s.step_key === step.key)?.reviewed_at && (
                      <p className="mt-1 text-xs text-navy-500">Reviewed: {formatDateTime(application.steps.find(s => s.step_key === step.key)!.reviewed_at)}</p>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardHeader title="Application Details" />
        <CardContent>
          <dl className="grid md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-navy-500">Acknowledgement Number</dt>
              <dd className="text-sm font-medium font-mono text-navy-900">{application.acknowledgement_number}</dd>
            </div>
            <div>
              <dt className="text-sm text-navy-500">Status</dt>
              <dd className="text-sm font-medium text-navy-900">
                <StatusBadge status={application.status} />
              </dd>
            </div>
            <div>
              <dt className="text-sm text-navy-500">Account Type</dt>
              <dd className="text-sm font-medium text-navy-900">{application.preferred_account_type}</dd>
            </div>
            <div>
              <dt className="text-sm text-navy-500">Submitted</dt>
              <dd className="text-sm font-medium text-navy-900">{application.submitted_at ? formatDateTime(application.submitted_at) : 'Not submitted'}</dd>
            </div>
            <div>
              <dt className="text-sm text-navy-500">Approved</dt>
              <dd className="text-sm font-medium text-navy-900">{application.approved_at ? formatDateTime(application.approved_at) : 'Pending'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}

import { Application } from '@/services/application'
import { cn } from '@/lib/utils'