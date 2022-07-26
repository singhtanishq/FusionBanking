import { useState } from 'react'
import { 
  UserCircleIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  MapPinIcon,
  LockClosedIcon,
  PencilIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal, Alert } from '@/components/ui/Modal'
import { formatDate, maskPan, maskAadhaar } from '@/lib/utils'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'

interface Customer {
  id: number
  customer_id: string
  email: string
  mobile: string
  alternate_mobile: string | null
  full_name: string
  father_name: string
  mother_name: string
  date_of_birth: string
  gender: string
  marital_status: string
  nationality: string
  occupation: string
  annual_income: number
  pan_number: string | null
  aadhaar_number: string | null
  kyc_type: string | null
  kyc_verified_at: string | null
  netbanking_activated_at: string | null
  last_login_at: string | null
  created_at: string
}

interface Address {
  id: number
  type: string
  address_line_1: string
  address_line_2: string | null
  city: string
  state: string
  postal_code: string
  country: string
  landmark: string | null
  is_primary: boolean
  is_verified: boolean
}

const profileSchema = z.object({
  email: z.string().email('Invalid email'),
  alternate_mobile: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number').optional().or(z.literal('')),
  occupation: z.string().min(2, 'Occupation is required'),
  annual_income: z.coerce.number().min(0),
})

type ProfileForm = z.infer<typeof profileSchema>

export function ProfilePage() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  const { data: customer } = useQuery({
    queryKey: ['customer-profile'],
    queryFn: async () => {
      const response = await api.get('/customer/me')
      return response.data.data as Customer
    },
  })

  const { data: addresses } = useQuery({
    queryKey: ['customer-addresses'],
    queryFn: async () => {
      const response = await api.get('/customer/addresses')
      return response.data.data as Address[]
    },
  })

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: '',
      alternate_mobile: '',
      occupation: '',
      annual_income: 0,
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: ProfileForm) => api.put('/customer/profile', data),
    onSuccess: () => {
      toast.success('Profile updated successfully')
      setEditing(false)
      queryClient.invalidateQueries({ queryKey: ['customer-profile'] })
    },
    onError: () => {
      toast.error('Failed to update profile')
    },
  })

  if (!customer) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent mx-auto mb-3" />
            <p className="text-navy-500">Loading profile...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (editing) {
    form.setValue('email', customer.email)
    form.setValue('alternate_mobile', customer.alternate_mobile || '')
    form.setValue('occupation', customer.occupation)
    form.setValue('annual_income', customer.annual_income)
  }

  const handleSubmit = (data: ProfileForm) => {
    updateMutation.mutate(data)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">My Profile</h1>
          <p className="text-navy-600">Manage your personal information</p>
        </div>
        {!editing && (
          <Button variant="outline" onClick={() => setEditing(true)}>
            <PencilIcon className="h-5 w-5" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Personal Information */}
      <Card className="mb-6">
        <CardHeader 
          title="Personal Information" 
          action={editing ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setEditing(false); form.reset(); }}>
                Cancel
              </Button>
              <Button onClick={() => form.handleSubmit(handleSubmit)()} loading={updateMutation.isPending}>
                Save Changes
              </Button>
            </div>
          ) : null}
        />
        <CardContent>
          {!editing ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm text-navy-500 mb-1">Customer ID</label>
                <p className="font-mono text-lg text-navy-900 font-bold">{customer.customer_id}</p>
              </div>
              <div>
                <label className="block text-sm text-navy-500 mb-1">Full Name</label>
                <p className="font-medium text-navy-900">{customer.full_name}</p>
              </div>
              <div>
                <label className="block text-sm text-navy-500 mb-1">Father's Name</label>
                <p className="text-navy-600">{customer.father_name}</p>
              </div>
              <div>
                <label className="block text-sm text-navy-500 mb-1">Mother's Name</label>
                <p className="text-navy-600">{customer.mother_name}</p>
              </div>
              <div>
                <label className="block text-sm text-navy-500 mb-1">Date of Birth</label>
                <p className="text-navy-600">{formatDate(customer.date_of_birth)}</p>
              </div>
              <div>
                <label className="block text-sm text-navy-500 mb-1">Gender</label>
                <p className="text-navy-600 capitalize">{customer.gender}</p>
              </div>
              <div>
                <label className="block text-sm text-navy-500 mb-1">Marital Status</label>
                <p className="text-navy-600 capitalize">{customer.marital_status}</p>
              </div>
              <div>
                <label className="block text-sm text-navy-500 mb-1">Nationality</label>
                <p className="text-navy-600">{customer.nationality}</p>
              </div>
              <div>
                <label className="block text-sm text-navy-500 mb-1">Occupation</label>
                <p className="text-navy-600">{customer.occupation}</p>
              </div>
              <div>
                <label className="block text-sm text-navy-500 mb-1">Annual Income</label>
                <p className="text-navy-600 font-mono">{formatCurrency(customer.annual_income)}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <Input
                  {...form.register('email')}
                  label="Email"
                  error={form.formState.errors.email?.message}
                  disabled
                  helperText="Email cannot be changed here. Contact support for email changes."
                />
                <Input
                  {...form.register('alternate_mobile')}
                  label="Alternate Mobile"
                  placeholder="9876543210"
                  error={form.formState.errors.alternate_mobile?.message}
                />
                <Input
                  {...form.register('occupation')}
                  label="Occupation"
                  error={form.formState.errors.occupation?.message}
                />
                <Input
                  {...form.register('annual_income')}
                  type="number"
                  label="Annual Income (₹)"
                  error={form.formState.errors.annual_income?.message}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-navy-100">
                <Button type="button" variant="outline" onClick={() => { setEditing(false); form.reset(); }}>
                  Cancel
                </Button>
                <Button type="submit" loading={updateMutation.isPending}>
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* KYC Information */}
      <Card className="mb-6">
        <CardHeader title="KYC Information" />
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm text-navy-500 mb-1">PAN Number</label>
              <p className="font-mono text-navy-900">{customer.pan_number ? maskPan(customer.pan_number) : 'Not provided'}</p>
              <p className="text-xs text-navy-500 mt-1">Masked for security</p>
            </div>
            <div>
              <label className="block text-sm text-navy-500 mb-1">Aadhaar Number</label>
              <p className="font-mono text-navy-900">{customer.aadhaar_number ? maskAadhaar(customer.aadhaar_number) : 'Not provided'}</p>
              <p className="text-xs text-navy-500 mt-1">Masked for security</p>
            </div>
            <div>
              <label className="block text-sm text-navy-500 mb-1">KYC Type</label>
              <p className="text-navy-600 capitalize">{customer.kyc_type || 'Not specified'}</p>
            </div>
            <div>
              <label className="block text-sm text-navy-500 mb-1">KYC Status</label>
              <Badge variant={customer.kyc_verified_at ? 'success' : 'warning'}>
                {customer.kyc_verified_at ? 'Verified' : 'Pending'}
              </Badge>
            </div>
            <div>
              <label className="block text-sm text-navy-500 mb-1">Verified On</label>
              <p className="text-navy-600">{customer.kyc_verified_at ? formatDate(customer.kyc_verified_at) : 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm text-navy-500 mb-1">NetBanking Status</label>
              <Badge variant={customer.netbanking_activated_at ? 'success' : 'warning'}>
                {customer.netbanking_activated_at ? 'Activated' : 'Not Activated'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Addresses */}
      <Card className="mb-6">
        <CardHeader title="Addresses" />
        <CardContent>
          {addresses && addresses.length > 0 ? (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div key={address.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border border-navy-100 bg-navy-50">
                  <div className="flex items-start gap-4 mb-2 sm:mb-0">
                    <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <MapPinIcon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-navy-900 capitalize">{address.type} Address</p>
                      {address.is_primary && <Badge variant="primary" className="mt-1">Primary</Badge>}
                      {address.is_verified ? (
                        <Badge variant="success" className="mt-1">Verified</Badge>
                      ) : (
                        <Badge variant="warning" className="mt-1">Pending Verification</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-navy-600 sm:ml-16 sm:w-64">
                    <p className="font-medium">{address.address_line_1}</p>
                    {address.address_line_2 && <p className="text-sm">{address.address_line_2}</p>}
                    <p className="text-sm">{address.city}, {address.state} - {address.postal_code}</p>
                    <p className="text-sm">{address.country}</p>
                    {address.landmark && <p className="text-sm text-navy-500">Landmark: {address.landmark}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-navy-500">No addresses found</p>
          )}
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card className="mb-6">
        <CardHeader title="Account Information" />
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-navy-500 mb-1">NetBanking</label>
              <div className="flex items-center gap-3">
                <Badge variant={customer.netbanking_activated_at ? 'success' : 'warning'}>
                  {customer.netbanking_activated_at ? 'Activated' : 'Not Activated'}
                </Badge>
                {!customer.netbanking_activated_at && (
                  <Button variant="outline" size="sm" onClick={() => window.location.href = '/netbanking/activate'}>
                    Activate Now
                  </Button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm text-navy-500 mb-1">Last Login</label>
              <p className="text-navy-600">{customer.last_login_at ? formatDate(customer.last_login_at) : 'Never'}</p>
            </div>
            <div>
              <label className="block text-sm text-navy-500 mb-1">Account Created</label>
              <p className="text-navy-600">{formatDate(customer.created_at)}</p>
            </div>
            <div>
              <label className="block text-sm text-navy-500 mb-1">Email Verified</label>
              <Badge variant={customer.email_verified_at ? 'success' : 'warning'}>
                {customer.email_verified_at ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
        size="md"
      >
        <ChangePasswordForm onClose={() => setShowPasswordModal(false)} />
      </Modal>
    </div>
  )
}

function ChangePasswordForm({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (password.length < 10) {
      toast.error('Password must be at least 10 characters')
      return
    }

    setLoading(true)
    try {
      const response = await api.put('/customer/password', { current_password: '', new_password: password, new_password_confirmation: confirmPassword })
      if (response.data.success) {
        toast.success('Password changed successfully')
        onClose()
      } else {
        toast.error(response.data.message || 'Failed to change password')
      }
    } catch (error) {
      toast.error('Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          label="New Password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="button"
          className="absolute right-3 top-[38px] text-navy-400 hover:text-navy-600"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
        </button>
      </div>
      <Input
        type={showPassword ? 'text' : 'password'}
        label="Confirm New Password"
        placeholder="Confirm new password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />
      <div className="flex justify-end gap-3 pt-4 border-t border-navy-100">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Change Password
        </Button>
      </div>
    </form>
  )
}