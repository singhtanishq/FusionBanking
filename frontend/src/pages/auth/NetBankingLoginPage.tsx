import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { LockClosedIcon, EnvelopeIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { api } from '@/services/api'
import { login, setUserType } from '@/services/auth'
import { toast } from 'react-hot-toast'

const loginSchema = z.object({
  customer_id: z.string().min(1, 'Customer ID is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

export function NetBankingLoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [otp, setOtp] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    try {
      const response = await api.post('/auth/customer/login', data)
      
      if (response.data.success) {
        if (response.data.data.requires_otp) {
          setOtpSent(true)
          toast.success('Verification code sent to your registered email')
        } else {
          login(response.data.data.token, response.data.data.user, 'customer')
          setUserType('customer')
          navigate('/customer/dashboard')
        }
      } else {
        toast.error(response.data.message || 'Invalid credentials')
      }
    } catch (error) {
      toast.error('Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit code')
      return
    }

    setVerifyingOtp(true)
    try {
      const response = await api.post('/auth/customer/verify-otp', { otp })
      
      if (response.data.success) {
        login(response.data.data.token, response.data.data.user, 'customer')
        setUserType('customer')
        navigate('/customer/dashboard')
      } else {
        toast.error(response.data.message || 'Invalid verification code')
      }
    } catch (error) {
      toast.error('Invalid verification code. Please try again.')
    } finally {
      setVerifyingOtp(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 rounded-xl bg-primary-100 flex items-center justify-center mx-auto mb-4">
            <LockClosedIcon className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-navy-900">NetBanking Login</h1>
          <p className="mt-2 text-navy-600">Secure access to your FusionBanking account</p>
        </CardHeader>

        <CardContent>
          {!otpSent ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                {...register('customer_id')}
                label="Customer ID"
                placeholder="CUS1234567"
                error={errors.customer_id?.message}
                icon={<UserCircleIcon className="h-5 w-5 text-navy-400" />}
              />
              <Input
                {...register('password')}
                type="password"
                label="Password"
                error={errors.password?.message}
                icon={<LockClosedIcon className="h-5 w-5 text-navy-400" />}
              />
              
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-navy-300 text-primary-600 focus:ring-primary-500" />
                  <span className="text-sm text-navy-600">Remember me</span>
                </label>
                <Link to="/netbanking/password/reset" className="text-sm text-primary-600 hover:underline">
                  Forgot Password?
                </Link>
              </div>

              <Button type="submit" className="w-full" loading={loading}>
                Login
                <LockClosedIcon className="h-5 w-5" />
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <Alert variant="info" icon>
                <p className="text-sm">
                  We've sent a 6-digit verification code to your registered email address. 
                  Please enter it below to complete your login.
                </p>
              </Alert>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-navy-700">Verification Code</label>
                <div className="flex gap-2">
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
                          e.target.nextElementSibling?.focus()
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !otp[index] && index > 0) {
                          e.target.previousElementSibling?.focus()
                        }
                      }}
                      className="w-12 h-12 text-center text-lg font-semibold rounded-lg border border-navy-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                      inputMode="numeric"
                    />
                  ))}
                </div>
              </div>

              <Button className="w-full" onClick={verifyOtp} loading={verifyingOtp}>
                Verify & Login
                <LockClosedIcon className="h-5 w-5" />
              </Button>

              <Button variant="ghost" className="w-full" onClick={() => { setOtpSent(false); setOtp(''); reset() }}>
                Back to Login
              </Button>

              <p className="text-center text-sm text-navy-500">
                Didn't receive the code?{' '}
                <button className="text-primary-600 hover:underline" onClick={() => toast('Verification code resent')}>
                  Resend
                </button>
              </p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-navy-100">
            <p className="text-center text-sm text-navy-500">
              New to FusionBanking?{' '}
              <Link to="/open-account" className="text-primary-600 hover:underline font-medium">
                Open an Account
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}