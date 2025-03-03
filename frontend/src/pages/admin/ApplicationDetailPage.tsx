import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import { api, handleApiError } from '@/services/api'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/Badge'
import { formatDateTime, formatCurrency } from '@/lib/utils'
import { toast } from 'react-hot-toast'

interface ApplicationStep {
  id: number
  step_key: string
  step_name: string
  step_order: number
  status: string
  reviewed_at: string | null
  reviewed_by: string | null
  rejection_reason: string | null
  documents: Array<{
    id: number
    document_type: string
    document_category: string
    original_filename: string
    is_verified: boolean
    verified_at: string | null
    rejection_reason: string | null
  }>
}

interface ApplicationDetail {
  id: number
  acknowledgement_number: string
  status: string
  preferred_account_type: string
  submitted_at: string | null
  approved_at: string | null
  rejected_at: string | null
  rejection_reason: string | null
  personal_info: Record<string, string | number | null> | null
  contact_info: Record<string, string | null> | null
  kyc_info: { pan_number: string; aadhaar_number: string; kyc_type: string } | null
  address_info: Record<string, string | boolean | null> | null
  steps: ApplicationStep[]
  timeline: Array<{
    id: number
    action: string
    step_name: string | null
    previous_status: string
    new_status: string
    reason: string
    admin_name: string | null
    created_at: string
  }>
}

type ReviewAction = 'approve' | 'reject' | 'request_correction'

export function AdminApplicationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [reviewStepKey, setReviewStepKey] = useState<string | null>(null)
  const [reviewAction, setReviewAction] = useState<ReviewAction>('approve')
  const [reason, setReason] = useState('')
  const [rejectReason, setRejectReason] = useState('')

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-application', id],
    queryFn: async (): Promise<ApplicationDetail> => {
      const response = await api.get(`/admin/applications/${id}`)
      return response.data.data
    },
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-application', id] })
    queryClient.invalidateQueries({ queryKey: ['admin-applications'] })
  }

  const reviewMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/admin/applications/${id}/review`, {
        step_key: reviewStepKey,
        action: reviewAction,
        reason,
      })
      if (!response.data.success) throw new Error(response.data.message)
      return response.data
    },
    onSuccess: () => {
      toast.success('Step reviewed')
      setReviewStepKey(null)
      setReason('')
      invalidate()
    },
    onError: (e) => toast.error(handleApiError(e as never)),
  })

  const approveMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/admin/applications/${id}/approve`)
      if (!response.data.success) throw new Error(response.data.message)
      return response.data
    },
    onSuccess: () => {
      toast.success('Application approved and account created')
      invalidate()
    },
    onError: (e) => toast.error(handleApiError(e as never)),
  })

  const rejectMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/admin/applications/${id}/reject`, { reason: rejectReason })
      if (!response.data.success) throw new Error(response.data.message)
      return response.data
    },
    onSuccess: () => {
      toast.success('Application rejected')
      setRejectReason('')
      invalidate()
    },
    onError: (e) => toast.error(handleApiError(e as never)),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse h-40 bg-white rounded-xl border border-navy-200" />
        ))}
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-3">{handleApiError(error as never)}</p>
        <Link to="/admin/applications"><Button variant="outline">Back to applications</Button></Link>
      </div>
    )
  }

  const canReview = !['approved', 'rejected', 'account_active'].includes(data.status)
  const openReview = (stepKey: string, action: ReviewAction) => {
    setReviewStepKey(stepKey)
    setReviewAction(action)
    setReason('')
  }

  const personalRows = data.personal_info
    ? Object.entries(data.personal_info).filter(([, v]) => v !== null && v !== '')
    : []
  const contactRows = data.contact_info
    ? Object.entries(data.contact_info).filter(([, v]) => v !== null && v !== '')
    : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link to="/admin/applications" className="inline-flex items-center gap-1 text-sm text-navy-500 hover:text-navy-700 mb-1">
            <ArrowLeftIcon className="h-4 w-4" /> Back to applications
          </Link>
          <h1 className="text-2xl font-bold text-navy-900 font-mono">{data.acknowledgement_number}</h1>
          <p className="text-navy-600 flex items-center gap-2 mt-1">
            <StatusBadge status={data.status} />
            {data.submitted_at && <span>Submitted {formatDateTime(data.submitted_at)}</span>}
          </p>
        </div>
        {canReview && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => approveMutation.mutate()}
              loading={approveMutation.isPending}
            >
              <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
              Approve
            </Button>
          </div>
        )}
      </div>

      {data.rejection_reason && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
              <XCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Application rejected</p>
                <p className="text-sm text-red-700">{data.rejection_reason}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Applicant details */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Personal Information" />
          <CardContent>
            {personalRows.length === 0 ? (
              <p className="text-sm text-navy-500">Not provided yet.</p>
            ) : (
              <dl className="grid sm:grid-cols-2 gap-x-4 gap-y-3">
                {personalRows.map(([key, value]) => (
                  <div key={key} className="min-w-0">
                    <dt className="text-xs uppercase tracking-wide text-navy-400">{key.replace(/_/g, ' ')}</dt>
                    <dd className="text-sm text-navy-900 break-words">
                      {key === 'annual_income' ? formatCurrency(Number(value)) : String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Contact & KYC" />
          <CardContent>
            <dl className="grid sm:grid-cols-2 gap-x-4 gap-y-3">
              {contactRows.map(([key, value]) => (
                <div key={key} className="min-w-0">
                  <dt className="text-xs uppercase tracking-wide text-navy-400">{key.replace(/_/g, ' ')}</dt>
                  <dd className="text-sm text-navy-900 break-words">{String(value)}</dd>
                </div>
              ))}
              {data.kyc_info && (
                <>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-navy-400">PAN</dt>
                    <dd className="text-sm font-mono text-navy-900">{data.kyc_info.pan_number}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-navy-400">Aadhaar</dt>
                    <dd className="text-sm font-mono text-navy-900">XXXX XXXX {data.kyc_info.aadhaar_number.slice(-4)}</dd>
                  </div>
                </>
              )}
              {!data.kyc_info && contactRows.length === 0 && (
                <p className="text-sm text-navy-500 sm:col-span-2">Not provided yet.</p>
              )}
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Steps review */}
      <Card>
        <CardHeader title="Verification Steps" description="Approve, reject or request correction for each step." />
        <CardContent>
          {reviewStepKey && (
            <div className="mb-4 p-4 bg-navy-50 rounded-lg border border-navy-200">
              <p className="text-sm font-medium text-navy-900 mb-3">
                Review step: <span className="font-mono">{reviewStepKey}</span> — {reviewAction.replace('_', ' ')}
              </p>
              <Input
                label="Reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Minimum 5 characters"
                error={reason.length > 0 && reason.length < 5 ? 'Reason must be at least 5 characters' : undefined}
              />
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  disabled={reason.trim().length < 5}
                  loading={reviewMutation.isPending}
                  onClick={() => reviewMutation.mutate()}
                >
                  Submit review
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setReviewStepKey(null)}>Cancel</Button>
              </div>
            </div>
          )}

          <ol className="space-y-3" role="list">
            {data.steps.map((step) => (
              <li key={step.id} className="p-4 rounded-lg border border-navy-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-medium text-navy-900">{step.step_name}</h4>
                      <StatusBadge status={step.status} />
                    </div>
                    {step.rejection_reason && (
                      <p className="text-xs text-red-600 mt-1">Reason: {step.rejection_reason}</p>
                    )}
                    {step.reviewed_by && (
                      <p className="text-xs text-navy-400 mt-1">
                        Reviewed by {step.reviewed_by}
                        {step.reviewed_at && ` · ${formatDateTime(step.reviewed_at)}`}
                      </p>
                    )}
                  </div>
                  {canReview && (
                    <div className="flex flex-wrap gap-2 flex-shrink-0">
                      <Button size="sm" variant="outline" onClick={() => openReview(step.step_key, 'approve')}>
                        Approve
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => openReview(step.step_key, 'request_correction')}>
                        Request correction
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-600" onClick={() => openReview(step.step_key, 'reject')}>
                        Reject
                      </Button>
                    </div>
                  )}
                </div>

                {step.documents.length > 0 && (
                  <ul className="mt-3 space-y-2 border-t border-navy-100 pt-3">
                    {step.documents.map((doc) => (
                      <li key={doc.id} className="flex items-center justify-between gap-3 text-sm">
                        <span className="flex items-center gap-2 min-w-0">
                          <DocumentArrowDownIcon className="h-4 w-4 text-navy-400 flex-shrink-0" />
                          <span className="truncate text-navy-700">{doc.original_filename}</span>
                          <span className="text-xs text-navy-400">({doc.document_type.replace(/_/g, ' ')})</span>
                        </span>
                        {doc.is_verified ? (
                          <CheckCircleIcon className="h-4 w-4 text-emerald-500 flex-shrink-0" aria-label="Verified" />
                        ) : (
                          <ExclamationTriangleIcon className="h-4 w-4 text-amber-500 flex-shrink-0" aria-label="Unverified" />
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Reject with reason */}
      {canReview && (
        <Card>
          <CardHeader title="Reject Application" description="Permanently reject this application with a documented reason." />
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Rejection reason (min 5 characters)"
                  aria-label="Rejection reason"
                />
              </div>
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                disabled={rejectReason.trim().length < 5}
                loading={rejectMutation.isPending}
                onClick={() => rejectMutation.mutate()}
              >
                <XCircleIcon className="h-5 w-5" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader title="Review Timeline" />
        <CardContent>
          {data.timeline.length === 0 ? (
            <p className="text-sm text-navy-500">No reviews recorded yet.</p>
          ) : (
            <ol className="space-y-3">
              {data.timeline.map((t) => (
                <li key={t.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-sm text-navy-900">
                      <span className="font-medium capitalize">{t.action.replace(/_/g, ' ')}</span>
                      {t.step_name && <span className="text-navy-500"> · {t.step_name}</span>}
                      <span className="text-navy-400"> ({t.previous_status.replace(/_/g, ' ')} → {t.new_status.replace(/_/g, ' ')})</span>
                    </p>
                    {t.reason && <p className="text-sm text-navy-600">{t.reason}</p>}
                    <p className="text-xs text-navy-400">
                      {t.admin_name || 'System'} · {formatDateTime(t.created_at)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
