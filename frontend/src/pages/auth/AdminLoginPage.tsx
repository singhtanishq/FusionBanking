import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { LockClosedIcon, EnvelopeIcon, UserCircleIcon, BuildingOfficeIcon, KeyIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { api } from '@/services/api'
import { login, setUserType } from '@/services/auth'
import { toast } from 'react-hot-toast'

const adminLoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  bank_access_token: z.string().min(1, 'Bank access token is required'),
})

type AdminLoginForm = z.infer<typeof adminLoginSchema>

export function AdminLoginPage() {
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
  } = useForm<AdminLoginForm>({
    resolver: zodResolver(adminLoginSchema),
  })

  const onSubmit = async (data: AdminLoginForm) => {
    setLoading(true)
    try {
      const response = await api.post('/auth/admin/login', data)
      
      if (response.data.success) {
        if (response.data.data.requires_otp) {
          setOtpSent(true)
          toast.success('Verification code sent to your registered email')
        } else {
          login(response.data.data.token, response.data.data.user, 'admin')
          setUserType('admin')
          navigate('/admin')
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
    if (otp.length !== 16) {
      toast.error('Please enter the 16-character verification token')
      return
    }

    setVerifyingOtp(true)
    try {
      const response = await api.post('/auth/admin/verify-otp', { otp })
      
      if (response.data.success) {
        login(response.data.data.token, response.data.data.user, 'admin')
        setUserType('admin')
        navigate('/admin')
      } else {
        toast.error(response.data.message || 'Invalid verification token')
      }
    } catch (error) {
      toast.error('Invalid verification token')
    } finally {
      setVerifyingOtp(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 rounded-xl bg-primary-100 flex items-center justify-center mx-auto mb-4">
            <BuildingOfficeIcon className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-navy-900">Admin Portal Login</h1>
          <p className="mt-2 text-navy-600">Secure access to FusionBanking administration</p>
        </CardHeader>

        <CardContent>
          {!otpSent ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                {...register('username')}
                label="Username"
                placeholder="admin"
                error={errors.username?.message}
                icon={<UserCircleIcon className="h-5 w-5 text-navy-400" />}
              />
              <Input
                {...register('password')}
                type="password"
                label="Password"
                error={errors.password?.message}
                icon={<LockClosedIcon className="h-5 w-5 text-navy-400" />}
              />
              <Input
                {...register('bank_access_token')}
                type="password"
                label="Bank Access Token"
                placeholder="Enter your secure bank access token"
                error={errors.bank_access_token?.message}
                icon={<KeyIcon className="h-5 w-5 text-navy-400" />}
                helperText="This is your administrative credential"
              />
              
              <Button type="submit" className="w-full" loading={loading}>
                Login
                <LockClosedIcon className="h-5 w-5" />
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <Alert variant="info" icon>
                <p className="text-sm">
                  A 16-character verification token has been sent to your registered email address. 
                  Please enter it below to complete your login.
                </p>
              </Alert>

              <Input
                label="Verification Token"
                placeholder="A7K9Q2M8X4P6T1ZR"
                value={otp}
                onChange={(e) => setOtp(e.target.value.toUpperCase())}
                maxLength={16}
                icon={<KeyIcon className="h-5 w-5 text-navy-400" />}
              />

              <Button className="w-full" onClick={verifyOtp} disabled={verifyingOtp || otp.length !== 16}>
                Verify & Access Dashboard
                <LockClosedIcon className="h-5 w-5" />
              </Button>

              <Button variant="ghost" className="w-full" onClick={() => { setOtpSent(false); setOtp(''); reset() }}>
                Back to Login
              </Button>

              <p className="text-center text-sm text-navy-500">
                Didn't receive the token?{' '}
                <button className="text-primary-600 hover:underline" onClick={() => toast('Verification token resent')}>
                  Resend
                </button>
              </p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-navy-100">
            <Alert variant="warning" className="text-sm">
              <p>This is a restricted administrative portal. Unauthorized access is prohibited and monitored.</p>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}