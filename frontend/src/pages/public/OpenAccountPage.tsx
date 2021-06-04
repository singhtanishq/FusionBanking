import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { ArrowRightIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { StepTracker } from '@/components/forms/StepTracker'
import { ApplicationService } from '@/services/application'
import { toast } from 'react-hot-toast'

const personalInfoSchema = z.object({
  full_name: z.string().min(2, 'Full name is required').max(100),
  father_name: z.string().min(2, 'Father\'s name is required').max(100),
  mother_name: z.string().min(2, 'Mother\'s name is required').max(100),
  date_of_birth: z.string().refine(date => {
    const dob = new Date(date)
    const today = new Date()
    const age = today.getFullYear() - dob.getFullYear()
    return age >= 18 && age <= 100
  }, 'You must be between 18 and 100 years old'),
  gender: z.enum(['male', 'female', 'other']),
  marital_status: z.enum(['single', 'married', 'divorced', 'widowed']),
  nationality: z.string().min(2, 'Nationality is required'),
  occupation: z.string().min(2, 'Occupation is required'),
  annual_income: z.coerce.number().min(0, 'Annual income must be positive'),
  preferred_account_type: z.enum(['savings', 'current']),
})

const contactInfoSchema = z.object({
  mobile_number: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  email: z.string().email('Enter a valid email address'),
  alternate_mobile: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number').optional().or(z.literal('')),
  address_line_1: z.string().min(5, 'Address is required'),
  address_line_2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postal_code: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit PIN code'),
  country: z.string().default('India'),
})

const kycSchema = z.object({
  pan_number: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i, 'Enter a valid PAN (e.g., ABCDE1234F)'),
  aadhaar_number: z.string().regex(/^\d{12}$/, 'Enter a valid 12-digit Aadhaar number'),
  kyc_type: z.string().min(1, 'KYC type is required'),
})

const addressSchema = z.object({
  residential_address_line_1: z.string().min(5, 'Address is required'),
  residential_address_line_2: z.string().optional(),
  residential_city: z.string().min(2, 'City is required'),
  residential_state: z.string().min(2, 'State is required'),
  residential_postal_code: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit PIN code'),
  residential_country: z.string().default('India'),
  residential_landmark: z.string().optional(),
  permanent_address_line_1: z.string().min(5, 'Address is required'),
  permanent_address_line_2: z.string().optional(),
  permanent_city: z.string().min(2, 'City is required'),
  permanent_state: z.string().min(2, 'State is required'),
  permanent_postal_code: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit PIN code'),
  permanent_country: z.string().default('India'),
  permanent_landmark: z.string().optional(),
  same_as_residential: z.boolean(),
})

type PersonalInfoForm = z.infer<typeof personalInfoSchema>
type ContactInfoForm = z.infer<typeof contactInfoSchema>
type KycForm = z.infer<typeof kycSchema>
type AddressForm = z.infer<typeof addressSchema>

const steps = [
  { key: 'personal_info', label: 'Personal Information', href: '/open-account' },
  { key: 'contact_info', label: 'Contact Details', href: '/open-account/contact' },
  { key: 'kyc_info', label: 'KYC', href: '/open-account/kyc' },
  { key: 'address_info', label: 'Address', href: '/open-account/address' },
  { key: 'documents', label: 'Documents', href: '/open-account/documents' },
  { key: 'review', label: 'Review', href: '/open-account/review' },
]

export function OpenAccountPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PersonalInfoForm>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      gender: 'male',
      marital_status: 'single',
      nationality: 'Indian',
      preferred_account_type: 'savings',
    },
  })

  const onSubmit = async (data: PersonalInfoForm) => {
    setSubmitting(true)
    try {
      let appId = applicationId
      if (!appId) {
        const app = await ApplicationService.createDraft()
        appId = app.id
        setApplicationId(appId)
      }
      
      await ApplicationService.savePersonalInfo(appId, data)
      setFormData(prev => ({ ...prev, personal_info: data }))
      setCurrentStep(1)
      toast.success('Personal information saved')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-navy-900">Open a New Account</h1>
        <p className="mt-2 text-navy-600">Step 1 of 6: Personal Information</p>
      </div>

      <StepTracker steps={steps} currentStep={currentStep} />

      <Card className="mt-8">
        <CardHeader title="Personal Information" description="Enter your personal details as per official documents" />
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Input {...register('full_name')} label="Full Name" error={errors.full_name?.message} placeholder="As per PAN/Aadhaar" />
              <Input {...register('father_name')} label="Father's Name" error={errors.father_name?.message} />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Input {...register('mother_name')} label="Mother's Name" error={errors.mother_name?.message} />
              <Input {...register('date_of_birth')} type="date" label="Date of Birth" error={errors.date_of_birth?.message} max={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <Select {...register('gender')} label="Gender" error={errors.gender?.message} options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
              ]} />
              <Select {...register('marital_status')} label="Marital Status" error={errors.marital_status?.message} options={[
                { value: 'single', label: 'Single' },
                { value: 'married', label: 'Married' },
                { value: 'divorced', label: 'Divorced' },
                { value: 'widowed', label: 'Widowed' },
              ]} />
              <Input {...register('nationality')} label="Nationality" error={errors.nationality?.message} defaultValue="Indian" />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Input {...register('occupation')} label="Occupation" error={errors.occupation?.message} placeholder="e.g., Software Engineer" />
              <Input {...register('annual_income')} type="number" label="Annual Income (₹)" error={errors.annual_income?.message} placeholder="e.g., 1200000" />
            </div>
            <Select {...register('preferred_account_type')} label="Preferred Account Type" error={errors.preferred_account_type?.message} options={[
              { value: 'savings', label: 'Savings Account' },
              { value: 'current', label: 'Current Account' },
            ]} />

            <div className="flex justify-end gap-3 pt-4 border-t border-navy-100">
              <Button type="submit" loading={submitting} size="lg">
                Continue
                <ArrowRightIcon className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}