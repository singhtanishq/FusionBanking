import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import {
  CheckCircleIcon,
  UserCircleIcon,
  ArrowRightIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { StepTracker } from '@/components/forms/StepTracker'
import { Alert } from '@/components/ui/Alert'
import { api, handleApiError } from '@/services/api'
import { formatCurrency, maskAccountNumber } from '@/lib/utils'
import { toast } from 'react-hot-toast'

const transferSchema = z.object({
  recipient_account_number: z.string().min(12, 'Enter a valid account number').max(20),
  recipient_ifsc: z.string().min(8, 'Enter a valid IFSC code').max(15).toUpperCase(),
  amount: z.coerce.number().min(1, 'Amount must be at least ₹1').max(200000, 'Maximum transfer limit is ₹2,00,000'),
  remark: z.string().max(100).optional(),
})

type TransferForm = z.infer<typeof transferSchema>

const steps = [
  { key: 'details', label: 'Transfer Details' },
  { key: 'review', label: 'Review & Confirm' },
  { key: 'verify', label: 'Verify OTP' },
]

export function SendMoneyPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [recipient, setRecipient] = useState<{ name: string; account_number: string; ifsc: string } | null>(null)
  const [validating, setValidating] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [otp, setOtp] = useState('')
  const [transferId, setTransferId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<TransferForm>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      remark: '',
    },
  })

  const amount = watch('amount')

  const validateRecipient = async () => {
    const accountNumber = watch('recipient_account_number')
    const ifsc = watch('recipient_ifsc')
    
    if (!accountNumber || !ifsc) return

    setValidating(true)
    try {
      const response = await api.post('/transfers/validate-recipient', { account_number: accountNumber, ifsc: ifsc.toUpperCase() })
      
      if (response.data.success && response.data.data) {
        setRecipient({
          name: response.data.data.name,
          account_number: response.data.data.account_number,
          ifsc: response.data.data.ifsc,
        })
        toast.success('Recipient found')
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

  const initiateTransfer = async (data: TransferForm) => {
    if (!recipient) {
      toast.error('Please validate recipient first')
      return
    }

    try {
      const response = await api.post('/transfers', {
        recipient_account_number: data.recipient_account_number,
        recipient_ifsc: data.recipient_ifsc.toUpperCase(),
        amount: data.amount,
        remark: data.remark,
      })

      if (response.data.success) {
        setTransferId(response.data.data.transfer_id)
        setCurrentStep(2)
        toast.success('Verification code sent to your email')
      } else {
        toast.error(response.data.message || 'Failed to initiate transfer')
      }
    } catch (error) {
      toast.error(handleApiError(error as never) || 'Failed to initiate transfer')
    }
  }

  const verifyOtp = async () => {
    if (otp.length !== 6 || !transferId) return

    setVerifying(true)
    try {
      const response = await api.post('/transfers/verify', { transfer_id: transferId, otp })
      
      if (response.data.success) {
        toast.success('Transfer completed successfully!')
        reset()
        setRecipient(null)
        setTransferId(null)
        setOtp('')
        setCurrentStep(0)
      } else {
        toast.error(response.data.message || 'Invalid verification code')
      }
    } catch (error) {
      toast.error(handleApiError(error as never) || 'Invalid verification code')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-navy-900">Send Money</h1>
        <p className="mt-2 text-navy-600">Transfer funds securely to another FusionBanking account</p>
      </div>

      <StepTracker steps={steps} currentStep={currentStep} />

      {currentStep === 0 && (
        <Card className="mt-8">
          <CardHeader title="Transfer Details" description="Enter recipient details and amount" />
          <CardContent>
            <form onSubmit={handleSubmit(() => setCurrentStep(1))} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">Recipient Account Number</label>
                <div className="flex gap-2">
                  <Input
                    {...register('recipient_account_number')}
                    placeholder="501234567891"
                    error={errors.recipient_account_number?.message}
                    onBlur={validateRecipient}
                  />
                  <Button type="button" variant="outline" onClick={validateRecipient} loading={validating} className="h-10">
                    Validate
                  </Button>
                </div>
              </div>

              <Input
                {...register('recipient_ifsc')}
                label="Recipient IFSC Code"
                placeholder="FUSB0001001"
                error={errors.recipient_ifsc?.message}
                onBlur={validateRecipient}
              />

              {recipient && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <UserCircleIcon className="h-5 w-5 text-emerald-600" />
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

              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  {...register('amount')}
                  type="number"
                  label="Amount (₹)"
                  placeholder="10000"
                  error={errors.amount?.message}
                />
                <Input
                  {...register('remark')}
                  label="Remark (Optional)"
                  placeholder="Payment for services"
                />
              </div>

              <div className="bg-navy-50 rounded-lg p-4">
                <h4 className="font-medium text-navy-900 mb-2">Transfer Limits</h4>
                <ul className="text-sm text-navy-600 space-y-1">
                  <li>• Maximum per transaction: ₹2,00,000</li>
                  <li>• Daily limit: ₹5,00,000</li>
                  <li>• No charges for internal transfers</li>
                </ul>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="submit" disabled={!recipient || validating} size="lg">
                  Continue to Review
                  <ArrowRightIcon className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {currentStep === 1 && recipient && (
        <Card className="mt-8">
          <CardHeader title="Review Transfer" description="Please verify all details before confirming" />
          <CardContent>
            <div className="space-y-4">
              <div className="bg-navy-50 rounded-lg p-4">
                <h4 className="font-medium text-navy-900 mb-3">Recipient Details</h4>
                <dl className="grid sm:grid-cols-2 gap-3 text-sm">
                  <dt className="text-navy-500">Name</dt>
                  <dd className="font-medium text-navy-900">{recipient.name}</dd>
                  <dt className="text-navy-500">Account Number</dt>
                  <dd className="font-medium text-navy-900 font-mono">{maskAccountNumber(recipient.account_number)}</dd>
                  <dt className="text-navy-500">IFSC</dt>
                  <dd className="font-medium text-navy-900">{recipient.ifsc}</dd>
                </dl>
              </div>

              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <h4 className="font-medium text-navy-900 mb-3">Transfer Summary</h4>
                <dl className="grid sm:grid-cols-2 gap-3 text-sm">
                  <dt className="text-navy-500">Amount</dt>
                  <dd className="font-bold text-navy-900 text-lg">{formatCurrency(amount)}</dd>
                  <dt className="text-navy-500">Fee</dt>
                  <dd className="font-medium text-navy-900">₹0.00</dd>
                  <dt className="text-navy-500">Total Debit</dt>
                  <dd className="font-bold text-navy-900 text-lg">{formatCurrency(amount)}</dd>
                  <dt className="text-navy-500">Remark</dt>
                  <dd className="font-medium text-navy-900">{watch('remark') || '—'}</dd>
                </dl>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(0)}>
                  <XCircleIcon className="h-5 w-5" />
                  Back
                </Button>
                <Button onClick={() => handleSubmit(initiateTransfer)()} loading={verifying} disabled={!recipient}>
                  Confirm Transfer
                  <ArrowRightIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card className="mt-8">
          <CardHeader title="Verify Transfer" description="Enter the 6-digit code sent to your registered email" />
          <CardContent>
            <div className="space-y-4">
              <Alert variant="info" icon>
                <p className="text-sm">A verification code has been sent to your email. Please enter it below to authorize the transfer.</p>
              </Alert>

              <div className="flex gap-2 justify-center">
                {Array.from({ length: 6 }).map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={otp[index] || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '')
                      const newOtp = otp.split('')
                      newOtp[index] = value
                      setOtp(newOtp.join(''))
                      if (value && index < 5) {
                        const next = e.currentTarget.nextElementSibling as HTMLInputElement | null
                        next?.focus()
                      }
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Backspace' && !otp[index] && index > 0) {
                        (e.currentTarget.previousElementSibling as HTMLInputElement | null)?.focus()
                      }
                    }}
                    className="w-12 h-12 text-center text-lg font-semibold rounded-lg border border-navy-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                    inputMode="numeric"
                  />
                ))}
              </div>

              <Button className="w-full" onClick={verifyOtp} disabled={verifying || otp.length !== 6}>
                Verify & Complete Transfer
                <CheckCircleIcon className="h-5 w-5" />
              </Button>

              <Button variant="ghost" className="w-full" onClick={() => { setCurrentStep(1); setOtp('') }}>
                Back to Review
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 text-center">
        <Link to="/customer/dashboard" className="text-primary-600 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  )
}