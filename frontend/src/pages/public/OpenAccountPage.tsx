import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { ArrowRightIcon, ArrowLeftIcon, CheckCircleIcon, DocumentArrowUpIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { StepTracker } from '@/components/forms/StepTracker'
import { ApplicationService } from '@/services/application'
import { api, handleApiError } from '@/services/api'
import { toast } from 'react-hot-toast'

const personalInfoSchema = z.object({
  full_name: z.string().min(2, 'Full name is required').max(100),
  father_name: z.string().min(2, 'Father\'s name is required').max(100),
  mother_name: z.string().min(2, 'Mother\'s name is required').max(100),
  date_of_birth: z.string().refine(date => {
    const dob = new Date(date)
    if (Number.isNaN(dob.getTime())) return false
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const monthDiff = today.getMonth() - dob.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age -= 1
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
  { key: 'personal_info', label: 'Personal Information' },
  { key: 'contact_info', label: 'Contact Details' },
  { key: 'kyc_info', label: 'KYC' },
  { key: 'address_info', label: 'Address' },
  { key: 'documents', label: 'Documents' },
  { key: 'review', label: 'Review & Submit' },
]

interface UploadedDoc {
  document_id: number
  original_filename: string
  category: 'identity_proof' | 'address_proof'
}

const identityTypes = [
  { value: 'pan', label: 'PAN Card' },
  { value: 'aadhaar', label: 'Aadhaar Card' },
  { value: 'passport', label: 'Passport' },
  { value: 'voter_id', label: 'Voter ID' },
  { value: 'driving_license', label: 'Driving License' },
]

const addressTypes = [
  { value: 'utility_bill', label: 'Utility Bill' },
  { value: 'bank_statement', label: 'Bank Statement' },
  { value: 'aadhaar', label: 'Aadhaar Card' },
  { value: 'passport', label: 'Passport' },
]

export function OpenAccountPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [identityDoc, setIdentityDoc] = useState<UploadedDoc | null>(null)
  const [addressDoc, setAddressDoc] = useState<UploadedDoc | null>(null)
  const [identityType, setIdentityType] = useState('pan')
  const [addressType, setAddressType] = useState('utility_bill')
  const [submittedAck, setSubmittedAck] = useState<string | null>(null)
  const [completed, setCompleted] = useState<Record<string, unknown>>({})

  const personalForm = useForm<PersonalInfoForm>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      gender: 'male',
      marital_status: 'single',
      nationality: 'Indian',
      preferred_account_type: 'savings',
    },
  })

  const contactForm = useForm<ContactInfoForm>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: { country: 'India' },
  })

  const kycForm = useForm<KycForm>({
    resolver: zodResolver(kycSchema),
    defaultValues: { kyc_type: 'full' },
  })

  const addressForm = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      residential_country: 'India',
      permanent_country: 'India',
      same_as_residential: true,
    },
  })

  const sameAsResidential = addressForm.watch('same_as_residential')

  const ensureApplication = async (): Promise<string> => {
    if (applicationId) return applicationId
    const app = await ApplicationService.createDraft()
    setApplicationId(app.id)
    return app.id
  }

  const onPersonalSubmit = async (data: PersonalInfoForm) => {
    setSubmitting(true)
    try {
      const appId = await ensureApplication()
      await ApplicationService.savePersonalInfo(appId, data)
      setCompleted(prev => ({ ...prev, personal: data }))
      setCurrentStep(1)
      toast.success('Personal information saved')
    } catch (error) {
      toast.error(handleApiError(error as never) || 'Failed to save')
    } finally {
      setSubmitting(false)
    }
  }

  const onContactSubmit = async (data: ContactInfoForm) => {
    setSubmitting(true)
    try {
      await ApplicationService.saveContactInfo(applicationId!, data)
      setCompleted(prev => ({ ...prev, contact: data }))
      setCurrentStep(2)
      toast.success('Contact details saved')
    } catch (error) {
      toast.error(handleApiError(error as never) || 'Failed to save')
    } finally {
      setSubmitting(false)
    }
  }

  const onKycSubmit = async (data: KycForm) => {
    setSubmitting(true)
    try {
      await ApplicationService.saveKycInfo(applicationId!, {
        ...data,
        pan_number: data.pan_number.toUpperCase(),
      })
      setCompleted(prev => ({ ...prev, kyc: data }))
      setCurrentStep(3)
      toast.success('KYC information saved')
    } catch (error) {
      toast.error(handleApiError(error as never) || 'Failed to save')
    } finally {
      setSubmitting(false)
    }
  }

  const onAddressSubmit = async (data: AddressForm) => {
    setSubmitting(true)
    try {
      const payload = data.same_as_residential
        ? {
            ...data,
            permanent_address_line_1: data.residential_address_line_1,
            permanent_address_line_2: data.residential_address_line_2 ?? null,
            permanent_city: data.residential_city,
            permanent_state: data.residential_state,
            permanent_postal_code: data.residential_postal_code,
            permanent_country: data.residential_country,
            permanent_landmark: data.residential_landmark ?? null,
          }
        : data
      await ApplicationService.saveAddressInfo(applicationId!, payload)
      setCompleted(prev => ({ ...prev, address: payload }))
      setCurrentStep(4)
      toast.success('Address information saved')
    } catch (error) {
      toast.error(handleApiError(error as never) || 'Failed to save')
    } finally {
      setSubmitting(false)
    }
  }

  const uploadDocument = async (
    file: File,
    documentType: string,
    category: 'identity_proof' | 'address_proof'
  ) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('step_key', 'documents')
      formData.append('document_type', documentType)
      formData.append('document_category', category)
      formData.append('file', file)

      const response = await api.post(`/applications/${applicationId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (!response.data.success) throw new Error(response.data.message)

      const doc: UploadedDoc = {
        document_id: response.data.data.document_id,
        original_filename: response.data.data.original_filename,
        category,
      }
      if (category === 'identity_proof') setIdentityDoc(doc)
      else setAddressDoc(doc)
      toast.success('Document uploaded')
    } catch (error) {
      toast.error(handleApiError(error as never) || 'Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  const onSubmitApplication = async () => {
    setSubmitting(true)
    try {
      const result = await ApplicationService.submitApplication(applicationId!)
      setSubmittedAck(result.acknowledgement_number)
      setCurrentStep(5)
      toast.success('Application submitted successfully!')
    } catch (error) {
      toast.error(handleApiError(error as never) || 'Failed to submit application')
    } finally {
      setSubmitting(false)
    }
  }

  const personal = completed.personal as PersonalInfoForm | undefined
  const contact = completed.contact as ContactInfoForm | undefined
  const kyc = completed.kyc as KycForm | undefined
  const address = completed.address as Record<string, string | boolean | null | undefined> | undefined

  // Submission success screen
  if (submittedAck) {
    return (
      <div className="max-w-lg mx-auto py-16 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircleIcon className="h-10 w-10 text-emerald-600" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold text-navy-900">Application Submitted!</h1>
        <p className="mt-3 text-navy-600">
          Thank you, {personal?.full_name?.split(' ')[0]}. Your account opening application has been received
          and is now under review by our team.
        </p>
        <div className="mt-8 p-6 bg-navy-50 rounded-xl">
          <p className="text-sm text-navy-500 mb-1">Your acknowledgement number</p>
          <p className="text-2xl font-bold font-mono text-primary-600">{submittedAck}</p>
          <p className="text-sm text-navy-500 mt-2">Keep this safe — you'll need it to track your application.</p>
        </div>
        <p className="mt-4 text-sm text-navy-500">
          A confirmation email has been sent to {contact?.email}.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/track-application">
            <Button>Track Application</Button>
          </Link>
          <Link to="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-navy-900">Open a New Account</h1>
        <p className="mt-2 text-navy-600">Step {currentStep + 1} of {steps.length}: {steps[currentStep].label}</p>
      </div>

      <StepTracker steps={steps} currentStep={currentStep} />

      {/* Step 0: Personal Information */}
      {currentStep === 0 && (
        <Card className="mt-8">
          <CardHeader title="Personal Information" description="Enter your personal details as per official documents" />
          <CardContent>
            <form onSubmit={personalForm.handleSubmit(onPersonalSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Input {...personalForm.register('full_name')} label="Full Name" error={personalForm.formState.errors.full_name?.message} placeholder="As per PAN/Aadhaar" />
                <Input {...personalForm.register('father_name')} label="Father's Name" error={personalForm.formState.errors.father_name?.message} />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <Input {...personalForm.register('mother_name')} label="Mother's Name" error={personalForm.formState.errors.mother_name?.message} />
                <Input {...personalForm.register('date_of_birth')} type="date" label="Date of Birth" error={personalForm.formState.errors.date_of_birth?.message} max={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <Select {...personalForm.register('gender')} label="Gender" error={personalForm.formState.errors.gender?.message} options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                ]} />
                <Select {...personalForm.register('marital_status')} label="Marital Status" error={personalForm.formState.errors.marital_status?.message} options={[
                  { value: 'single', label: 'Single' },
                  { value: 'married', label: 'Married' },
                  { value: 'divorced', label: 'Divorced' },
                  { value: 'widowed', label: 'Widowed' },
                ]} />
                <Input {...personalForm.register('nationality')} label="Nationality" error={personalForm.formState.errors.nationality?.message} />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <Input {...personalForm.register('occupation')} label="Occupation" error={personalForm.formState.errors.occupation?.message} placeholder="e.g., Software Engineer" />
                <Input {...personalForm.register('annual_income')} type="number" label="Annual Income (₹)" error={personalForm.formState.errors.annual_income?.message} placeholder="e.g., 1200000" />
              </div>
              <Select {...personalForm.register('preferred_account_type')} label="Preferred Account Type" error={personalForm.formState.errors.preferred_account_type?.message} options={[
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
      )}

      {/* Step 1: Contact Information */}
      {currentStep === 1 && (
        <Card className="mt-8">
          <CardHeader title="Contact Details" description="How can we reach you?" />
          <CardContent>
            <form onSubmit={contactForm.handleSubmit(onContactSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Input {...contactForm.register('mobile_number')} label="Mobile Number" error={contactForm.formState.errors.mobile_number?.message} placeholder="9876543210" />
                <Input {...contactForm.register('email')} type="email" label="Email Address" error={contactForm.formState.errors.email?.message} placeholder="you@example.com" />
              </div>
              <Input {...contactForm.register('alternate_mobile')} label="Alternate Mobile (optional)" error={contactForm.formState.errors.alternate_mobile?.message} placeholder="Optional" />
              <Input {...contactForm.register('address_line_1')} label="Address Line 1" error={contactForm.formState.errors.address_line_1?.message} />
              <Input {...contactForm.register('address_line_2')} label="Address Line 2 (optional)" error={contactForm.formState.errors.address_line_2?.message} />
              <div className="grid md:grid-cols-3 gap-6">
                <Input {...contactForm.register('city')} label="City" error={contactForm.formState.errors.city?.message} />
                <Input {...contactForm.register('state')} label="State" error={contactForm.formState.errors.state?.message} />
                <Input {...contactForm.register('postal_code')} label="PIN Code" error={contactForm.formState.errors.postal_code?.message} placeholder="400001" />
              </div>

              <div className="flex justify-between gap-3 pt-4 border-t border-navy-100">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(0)} size="lg">
                  <ArrowLeftIcon className="h-5 w-5" />
                  Back
                </Button>
                <Button type="submit" loading={submitting} size="lg">
                  Continue
                  <ArrowRightIcon className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: KYC */}
      {currentStep === 2 && (
        <Card className="mt-8">
          <CardHeader title="KYC Information" description="Your identity details for verification" />
          <CardContent>
            <form onSubmit={kycForm.handleSubmit(onKycSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Input {...kycForm.register('pan_number')} label="PAN Number" error={kycForm.formState.errors.pan_number?.message} placeholder="ABCDE1234F" className="uppercase" />
                <Input {...kycForm.register('aadhaar_number')} label="Aadhaar Number" error={kycForm.formState.errors.aadhaar_number?.message} placeholder="123456789012" maxLength={12} />
              </div>
              <input type="hidden" {...kycForm.register('kyc_type')} />
              <p className="text-sm text-navy-500">
                Your details are verified against official records. PAN must match the name provided in the personal information step.
              </p>

              <div className="flex justify-between gap-3 pt-4 border-t border-navy-100">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(1)} size="lg">
                  <ArrowLeftIcon className="h-5 w-5" />
                  Back
                </Button>
                <Button type="submit" loading={submitting} size="lg">
                  Continue
                  <ArrowRightIcon className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Address */}
      {currentStep === 3 && (
        <Card className="mt-8">
          <CardHeader title="Address Information" description="Your residential and permanent addresses" />
          <CardContent>
            <form onSubmit={addressForm.handleSubmit(onAddressSubmit)} className="space-y-6">
              <h3 className="text-sm font-semibold text-navy-700 uppercase tracking-wide">Residential Address</h3>
              <Input {...addressForm.register('residential_address_line_1')} label="Address Line 1" error={addressForm.formState.errors.residential_address_line_1?.message} />
              <Input {...addressForm.register('residential_address_line_2')} label="Address Line 2 (optional)" />
              <div className="grid md:grid-cols-4 gap-6">
                <Input {...addressForm.register('residential_city')} label="City" error={addressForm.formState.errors.residential_city?.message} />
                <Input {...addressForm.register('residential_state')} label="State" error={addressForm.formState.errors.residential_state?.message} />
                <Input {...addressForm.register('residential_postal_code')} label="PIN Code" error={addressForm.formState.errors.residential_postal_code?.message} />
                <Input {...addressForm.register('residential_landmark')} label="Landmark (optional)" />
              </div>

              <label className="flex items-center gap-2 text-sm text-navy-700">
                <input
                  type="checkbox"
                  {...addressForm.register('same_as_residential')}
                  className="rounded border-navy-300 text-primary-600 focus:ring-primary-500"
                />
                Permanent address is the same as residential address
              </label>

              {!sameAsResidential && (
                <>
                  <h3 className="text-sm font-semibold text-navy-700 uppercase tracking-wide">Permanent Address</h3>
                  <Input {...addressForm.register('permanent_address_line_1')} label="Address Line 1" error={addressForm.formState.errors.permanent_address_line_1?.message} />
                  <Input {...addressForm.register('permanent_address_line_2')} label="Address Line 2 (optional)" />
                  <div className="grid md:grid-cols-4 gap-6">
                    <Input {...addressForm.register('permanent_city')} label="City" error={addressForm.formState.errors.permanent_city?.message} />
                    <Input {...addressForm.register('permanent_state')} label="State" error={addressForm.formState.errors.permanent_state?.message} />
                    <Input {...addressForm.register('permanent_postal_code')} label="PIN Code" error={addressForm.formState.errors.permanent_postal_code?.message} />
                    <Input {...addressForm.register('permanent_landmark')} label="Landmark (optional)" />
                  </div>
                </>
              )}

              <div className="flex justify-between gap-3 pt-4 border-t border-navy-100">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(2)} size="lg">
                  <ArrowLeftIcon className="h-5 w-5" />
                  Back
                </Button>
                <Button type="submit" loading={submitting} size="lg">
                  Continue
                  <ArrowRightIcon className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Documents */}
      {currentStep === 4 && (
        <Card className="mt-8">
          <CardHeader title="Document Upload" description="Upload one identity proof and one address proof (PDF, JPG or PNG, max 5 MB)" />
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Identity proof */}
              <div className="p-4 border border-navy-200 rounded-lg">
                <h3 className="text-sm font-semibold text-navy-900 mb-3">Identity Proof</h3>
                <Select
                  value={identityType}
                  onChange={(e) => setIdentityType(e.target.value)}
                  options={identityTypes}
                  label="Document type"
                />
                <label className="mt-3 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-navy-300 rounded-lg p-6 cursor-pointer hover:border-primary-400 hover:bg-primary-50/40 transition-colors">
                  <DocumentArrowUpIcon className="h-8 w-8 text-navy-400" aria-hidden="true" />
                  <span className="text-sm text-navy-600">{identityDoc ? 'Replace file' : 'Choose file'}</span>
                  <input
                    type="file"
                    className="sr-only"
                    accept=".pdf,.jpg,.jpeg,.png"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) uploadDocument(file, identityType, 'identity_proof')
                      e.target.value = ''
                    }}
                  />
                </label>
                {identityDoc && (
                  <p className="mt-3 text-sm text-emerald-700 flex items-center gap-1">
                    <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
                    {identityDoc.original_filename}
                  </p>
                )}
              </div>

              {/* Address proof */}
              <div className="p-4 border border-navy-200 rounded-lg">
                <h3 className="text-sm font-semibold text-navy-900 mb-3">Address Proof</h3>
                <Select
                  value={addressType}
                  onChange={(e) => setAddressType(e.target.value)}
                  options={addressTypes}
                  label="Document type"
                />
                <label className="mt-3 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-navy-300 rounded-lg p-6 cursor-pointer hover:border-primary-400 hover:bg-primary-50/40 transition-colors">
                  <DocumentArrowUpIcon className="h-8 w-8 text-navy-400" aria-hidden="true" />
                  <span className="text-sm text-navy-600">{addressDoc ? 'Replace file' : 'Choose file'}</span>
                  <input
                    type="file"
                    className="sr-only"
                    accept=".pdf,.jpg,.jpeg,.png"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) uploadDocument(file, addressType, 'address_proof')
                      e.target.value = ''
                    }}
                  />
                </label>
                {addressDoc && (
                  <p className="mt-3 text-sm text-emerald-700 flex items-center gap-1">
                    <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
                    {addressDoc.original_filename}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-between gap-3 pt-6 border-t border-navy-100 mt-6">
              <Button type="button" variant="outline" onClick={() => setCurrentStep(3)} size="lg">
                <ArrowLeftIcon className="h-5 w-5" />
                Back
              </Button>
              <Button
                type="button"
                onClick={() => setCurrentStep(5)}
                disabled={!identityDoc || !addressDoc || uploading}
                size="lg"
              >
                Continue to Review
                <ArrowRightIcon className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Review & Submit */}
      {currentStep === 5 && (
        <Card className="mt-8">
          <CardHeader title="Review Your Application" description="Please verify all details before submitting" />
          <CardContent>
            <div className="space-y-6">
              {personal && (
                <div className="bg-navy-50 rounded-lg p-4">
                  <h4 className="font-medium text-navy-900 mb-3">Personal Information</h4>
                  <dl className="grid sm:grid-cols-2 gap-2 text-sm">
                    <dt className="text-navy-500">Full Name</dt><dd className="text-navy-900">{personal.full_name}</dd>
                    <dt className="text-navy-500">Date of Birth</dt><dd className="text-navy-900">{personal.date_of_birth}</dd>
                    <dt className="text-navy-500">Occupation</dt><dd className="text-navy-900">{personal.occupation}</dd>
                    <dt className="text-navy-500">Annual Income</dt><dd className="text-navy-900">₹{Number(personal.annual_income).toLocaleString('en-IN')}</dd>
                    <dt className="text-navy-500">Account Type</dt><dd className="text-navy-900 capitalize">{personal.preferred_account_type}</dd>
                  </dl>
                </div>
              )}
              {contact && (
                <div className="bg-navy-50 rounded-lg p-4">
                  <h4 className="font-medium text-navy-900 mb-3">Contact Details</h4>
                  <dl className="grid sm:grid-cols-2 gap-2 text-sm">
                    <dt className="text-navy-500">Mobile</dt><dd className="text-navy-900">{contact.mobile_number}</dd>
                    <dt className="text-navy-500">Email</dt><dd className="text-navy-900">{contact.email}</dd>
                    <dt className="text-navy-500">Address</dt><dd className="text-navy-900">{contact.address_line_1}, {contact.city}, {contact.state} - {contact.postal_code}</dd>
                  </dl>
                </div>
              )}
              {kyc && (
                <div className="bg-navy-50 rounded-lg p-4">
                  <h4 className="font-medium text-navy-900 mb-3">KYC</h4>
                  <dl className="grid sm:grid-cols-2 gap-2 text-sm">
                    <dt className="text-navy-500">PAN</dt><dd className="text-navy-900 font-mono">{kyc.pan_number.toUpperCase()}</dd>
                    <dt className="text-navy-500">Aadhaar</dt><dd className="text-navy-900 font-mono">XXXX XXXX {kyc.aadhaar_number.slice(-4)}</dd>
                  </dl>
                </div>
              )}
              {address && (
                <div className="bg-navy-50 rounded-lg p-4">
                  <h4 className="font-medium text-navy-900 mb-3">Address</h4>
                  <dl className="grid sm:grid-cols-2 gap-2 text-sm">
                    <dt className="text-navy-500">Residential</dt>
                    <dd className="text-navy-900">{String(address.residential_address_line_1)}, {String(address.residential_city)}, {String(address.residential_state)} - {String(address.residential_postal_code)}</dd>
                    <dt className="text-navy-500">Permanent</dt>
                    <dd className="text-navy-900">{address.same_as_residential ? 'Same as residential' : `${String(address.permanent_address_line_1)}, ${String(address.permanent_city)} - ${String(address.permanent_postal_code)}`}</dd>
                  </dl>
                </div>
              )}
              <div className="bg-navy-50 rounded-lg p-4">
                <h4 className="font-medium text-navy-900 mb-3">Documents</h4>
                <ul className="space-y-1 text-sm text-navy-700">
                  {identityDoc && <li className="flex items-center gap-2"><CheckCircleIcon className="h-4 w-4 text-emerald-500" /> Identity: {identityDoc.original_filename}</li>}
                  {addressDoc && <li className="flex items-center gap-2"><CheckCircleIcon className="h-4 w-4 text-emerald-500" /> Address: {addressDoc.original_filename}</li>}
                  {!identityDoc && <li className="flex items-center gap-2 text-red-600"><TrashIcon className="h-4 w-4" /> Identity proof missing</li>}
                  {!addressDoc && <li className="flex items-center gap-2 text-red-600"><TrashIcon className="h-4 w-4" /> Address proof missing</li>}
                </ul>
              </div>

              <p className="text-sm text-navy-600">
                By submitting this application you declare that the information provided is accurate and
                agree to FusionBanking's terms of service and KYC policy.
              </p>

              <div className="flex justify-between gap-3 pt-4 border-t border-navy-100">
                <Button variant="outline" onClick={() => setCurrentStep(4)} size="lg">
                  <ArrowLeftIcon className="h-5 w-5" />
                  Back
                </Button>
                <Button onClick={onSubmitApplication} loading={submitting} size="lg">
                  Submit Application
                  <CheckCircleIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
