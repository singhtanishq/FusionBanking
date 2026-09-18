import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { LockClosedIcon, EnvelopeIcon, UserCircleIcon, KeyIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { api } from '@/services/api'
import { login } from '@/services/auth'
import { toast } from 'react-hot-toast'

const activationSchema = z.object({
  customer_id: z.string().min(1, 'Customer ID is required'),
  account_number: z.string().min(1, 'Account number is required'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
})

const passwordSchema = z.object({
  password: z.string().min(10, 'Password must be at least 10 characters'),
  confirm_password: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

type ActivationForm = z.infer<typeof activationSchema>
type PasswordForm = z.infer<typeof passwordSchema>

export function NetBankingActivatePage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'verify' | 'password'>('verify')
  const [loading, setLoading] = useState(false)

  const activationForm = useForm<ActivationForm>({
    resolver: zodResolver(activationSchema),
  })

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  const onActivationSubmit = async (data: ActivationForm) => {
    setLoading(true)
    try {
      const response = await api.post('/netbanking/activate', data)
      
      if (response.data.success) {
        setStep('password')
        toast.success('Verification successful. Now set your password.')
      } else {
        toast.error(response.data.message || 'Activation failed')
      }
    } catch (error) {
      toast.error('Invalid details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const onPasswordSubmit = async (data: PasswordForm) => {
    setLoading(true)
    try {
      const response = await api.post('/netbanking/verify-activation', {
        customer_id: activationForm.getValues('customer_id'),
        password: data.password,
      })
      
      if (response.data.success) {
        login(response.data.data.token, response.data.data.user, 'customer')
        navigate('/customer/dashboard')
      } else {
        toast.error(response.data.message || 'Password setup failed')
      }
    } catch (error) {
      toast.error('Failed to set password. Please try again.')
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
            <h1 className="text-2xl font-bold text-navy-900">NetBanking Activation</h1>
            <p className="mt-2 text-navy-600">Activate your FusionBanking NetBanking access</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={activationForm.handleSubmit(onActivationSubmit)} className="space-y-4">
              <Input
                {...activationForm.register('customer_id')}
                label="Customer ID"
                placeholder="CUS1234567"
                icon={<UserCircleIcon className="h-5 w-5 text-navy-400" />}
              />
              <Input
                {...activationForm.register('account_number')}
                label="Account Number"
                placeholder="501234567891"
                icon={<LockClosedIcon className="h-5 w-5 text-navy-400" />}
              />
              <Input
                {...activationForm.register('mobile')}
                label="Mobile Number"
                placeholder="9876543210"
                icon={<EnvelopeIcon className="h-5 w-5 text-navy-400" />}
              />
              <Input
                {...activationForm.register('date_of_birth')}
                type="date"
                label="Date of Birth"
                icon={<LockClosedIcon className="h-5 w-5 text-navy-400" />}
                max={new Date().toISOString().split('T')[0]}
              />
              
              <Button type="submit" className="w-full" loading={loading}>
                Verify & Continue
                <KeyIcon className="h-5 w-5" />
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-navy-100">
              <p className="text-center text-sm text-navy-500">
                Need help?{' '}
                <Link to="/help" className="text-primary-600 hover:underline font-medium">
                  Contact Support
                </Link>
              </p>
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
          <h1 className="text-2xl font-bold text-navy-900">Set Your Password</h1>
          <p className="mt-2 text-navy-600">Create a secure password for NetBanking</p>
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
              Activate NetBanking
              <CheckCircleIcon className="h-5 w-5" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}