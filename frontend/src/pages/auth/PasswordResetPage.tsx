import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { LockClosedIcon, UserCircleIcon, KeyIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { api, handleApiError } from '@/services/api'
import { login } from '@/services/auth'
import { toast } from 'react-hot-toast'

const resetSchema = z.object({
  customer_id: z.string().min(1, 'Customer ID is required'),
  token: z.string().length(16, 'Token must be 16 characters'),
  password: z.string().min(10, 'Password must be at least 10 characters'),
  confirm_password: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

type ResetForm = z.infer<typeof resetSchema>

export function PasswordResetPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  })

  const onSubmit = async (data: ResetForm) => {
    setLoading(true)
    try {
      const response = await api.post('/auth/customer/reset-password', {
        customer_id: data.customer_id,
        token: data.token,
        password: data.password,
        password_confirmation: data.confirm_password,
      })

      if (response.data.success) {
        toast.success('Password reset successful. Welcome back!')
        login(response.data.data.token, response.data.data.user, 'customer')
        navigate('/customer/dashboard')
      } else {
        toast.error(response.data.message || 'Password reset failed')
      }
    } catch (error) {
      toast.error(handleApiError(error as never) || 'Password reset failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 rounded-xl bg-primary-100 flex items-center justify-center mx-auto mb-4">
            <LockClosedIcon className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-navy-900">Reset Password</h1>
          <p className="mt-2 text-navy-600">
            Enter the reset token from your email along with your new password
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              {...register('customer_id')}
              label="Customer ID"
              placeholder="CUS1234567"
              error={errors.customer_id?.message}
              icon={<UserCircleIcon className="h-5 w-5 text-navy-400" />}
            />
            <Input
              {...register('token')}
              label="Reset Token"
              placeholder="16-character token from your email"
              error={errors.token?.message}
              icon={<KeyIcon className="h-5 w-5 text-navy-400" />}
              helperText="Use the reset token sent to your registered email"
            />
            <Input
              {...register('password')}
              type="password"
              label="New Password"
              error={errors.password?.message}
              icon={<LockClosedIcon className="h-5 w-5 text-navy-400" />}
              helperText="Minimum 10 characters"
            />
            <Input
              {...register('confirm_password')}
              type="password"
              label="Confirm New Password"
              error={errors.confirm_password?.message}
              icon={<LockClosedIcon className="h-5 w-5 text-navy-400" />}
            />

            <Button type="submit" className="w-full" loading={loading}>
              Reset Password
              <LockClosedIcon className="h-5 w-5" />
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-navy-100">
            <p className="text-center text-sm text-navy-500">
              Remembered your password?{' '}
              <Link to="/netbanking/login" className="text-primary-600 hover:underline font-medium">
                Back to Login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
