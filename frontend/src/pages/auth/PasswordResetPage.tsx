import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { LockClosedIcon, EnvelopeIcon, UserCircleIcon, KeyIcon, CheckCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { api } from '@/services/api'
import { login, setUserType } from '@/services/auth'
import { toast } from 'react-hot-toast'

const resetSchema = z.object({
  customer_id: z.string().min(1, 'Customer ID is required'),
  token: z.string().length(16, 'Token must be 16 characters'),
})

const passwordSchema = z.object({
  password: z.string().min(10, 'Password must be at least 10 characters'),
  confirm_password: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

type ResetForm = z.infer<typeof resetSchema>
type PasswordForm = z.infer<typeof passwordSchema>

export function PasswordResetPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'verify' | 'password'>('verify')
  const [loading, setLoading] = useState(false)
  const [customerId, setCustomerId] = useState('')

  const resetForm = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  })

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  const onVerifySubmit = async (data: ResetForm) => {
    setLoading(true)
    try {
      const response = await api.post('/auth/customer/reset-password', {
        customer_id: data.customer_id,
        token: data.token,
        password: 'temp', // Will be set in next step
      })
      
      if (response.data.success) {
        setCustomerId(data.customer_id)
        setStep('password')
        toast.success('Token verified. Now set your new password.')
      } else {
        toast.error(response.data.message || 'Invalid token')
      }
    } catch (error) {
      toast.error('Invalid token. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const onPasswordSubmit = async (data: PasswordForm) => {
    setLoading(true)
    try {
      const response = await api.post('/auth/customer/reset-password', {
        customer_id: customerId,
        token: resetForm.getValues('token'),
        password: data.password,
      })
      
      if (response.data.success) {
        toast.success('Password reset successful!')
        navigate('/netbanking/login')
      } else {
        toast.error(response.data.message || 'Password reset failed')
      }
    } catch (error) {
      toast.error('Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'verify') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50 px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 rounded-xl bg-primary-100 flex items-center justify-center mx-auto mb-4">
              <KeyIcon className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-navy-900">Reset Password</h1>
            <p className="mt-2 text-navy-600">Enter your Customer ID and reset token</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={resetForm.handleSubmit(onVerifySubmit)} className="space-y-4">
              <Input
                {...resetForm.register('customer_id')}
                label="Customer ID"
                placeholder="CUS1234567"
                icon={<UserCircleIcon className="h-5 w-5 text-navy-400" />}
              />
              <Input
                {...resetForm.register('token')}
                label="Reset Token"
                placeholder="A7K9Q2M8X4P6T1ZR"
                maxLength={16}
                icon={<KeyIcon className="h-5 w-5 text-navy-400" />}
                helperText="16-character token from email"
              />
              
              <Button type="submit" className="w-full" loading={loading}>
                Verify Token
                <KeyIcon className="h-5 w-5" />
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-navy-100">
              <Link to="/netbanking/login" className="text-center text-sm text-primary-600 hover:underline block">
                <ArrowLeftIcon className="h-4 w-4 inline mr-1" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-navy-900">Set New Password</h1>
          <p className="mt-2 text-navy-600">Create a secure password for your account</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <Input
              {...passwordForm.register('password')}
              type="password"
              label="New Password"
              placeholder="Enter new password"
              icon={<LockClosedIcon className="h-5 w-5 text-navy-400" />}
              helperText="Minimum 10 characters"
            />
            <Input
              {...passwordForm.register('confirm_password')}
              type="password"
              label="Confirm Password"
              placeholder="Confirm new password"
              icon={<LockClosedIcon className="h-5 w-5 text-navy-400" />}
            />
            
            <Alert variant="info" className="text-sm">
              <p>Your password must be at least 10 characters long. Use a mix of uppercase, lowercase, numbers, and symbols for better security.</p>
            </Alert>

            <Button type="submit" className="w-full" loading={loading}>
              Reset Password
              <CheckCircleIcon className="h-5 w-5" />
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link to="/netbanking/login" className="text-sm text-primary-600 hover:underline">
              <ArrowLeftIcon className="h-4 w-4 inline mr-1" />
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}