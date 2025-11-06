import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { toast } from 'react-hot-toast'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number').optional().or(z.literal('')),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
})

type ContactForm = z.infer<typeof contactSchema>

const contactInfo = [
  {
    title: 'General Support',
    description: 'For account queries, transaction issues, and general assistance.',
    email: 'support@fusionbanking.com',
    phone: '1800-123-4567',
    hours: 'Mon-Sat: 9 AM - 6 PM',
    icon: EnvelopeIcon,
  },
  {
    title: 'Business Banking',
    description: 'For corporate accounts, business loans, and merchant services.',
    email: 'business@fusionbanking.com',
    phone: '1800-123-4568',
    hours: 'Mon-Fri: 9 AM - 5 PM',
    icon: EnvelopeIcon,
  },
  {
    title: 'Complaints & Grievances',
    description: 'Escalate unresolved issues to our grievance redressal team.',
    email: 'grievance@fusionbanking.com',
    phone: '1800-123-4569',
    hours: 'Mon-Fri: 10 AM - 4 PM',
    icon: CheckCircleIcon,
  },
]

const offices = [
  {
    name: 'Head Office - Mumbai',
    address: 'FusionBanking Tower, Bandra Kurla Complex, Bandra East, Mumbai - 400051, Maharashtra',
    phone: '+91 22 6123 4567',
  },
  {
    name: 'Corporate Office - Delhi',
    address: 'Unit 1201, 12th Floor, Tower B, World Trade Center, Nauroji Nagar, New Delhi - 110029',
    phone: '+91 11 4123 4567',
  },
  {
    name: 'Technology Hub - Bangalore',
    address: '5th Floor, Prestige Tech Park, Kadubeesanahalli, Bangalore - 560103, Karnataka',
    phone: '+91 80 4123 4567',
  },
]

export function ContactPage() {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactForm) => {
    setSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Thank you for contacting us! We\'ll get back to you within 24 hours.')
      setSubmitted(true)
      reset()
    } catch {
      toast.error('Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-400">
              Contact Us
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              We&apos;re here to help
            </h1>

            <p className="mt-6 text-lg leading-8 text-navy-200">
              Have questions? Our team is ready to assist you with any banking needs.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link to="tel:18001234567">
                <Button size="lg" className="w-full sm:w-auto" variant="outline">
                  <PhoneIcon className="h-5 w-5" />
                  Call Us: 1800-123-4567
                </Button>
              </Link>
              <Link to="mailto:support@fusionbanking.com">
                <Button size="lg" className="w-full sm:w-auto">
                  <EnvelopeIcon className="h-5 w-5" />
                  Email Support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {contactInfo.map((info) => (
              <Card key={info.title} className="h-full">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100">
                      <info.icon className="h-6 w-6 text-primary-600" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-navy-900">{info.title}</h3>
                      <p className="mt-1 text-sm text-navy-600">{info.description}</p>
                      <div className="mt-4 space-y-1 text-sm text-navy-600">
                        <p className="flex items-center gap-2">
                          <EnvelopeIcon className="h-4 w-4 text-navy-400" aria-hidden="true" />
                          <Link to={`mailto:${info.email}`} className="text-primary-600 hover:underline">
                            {info.email}
                          </Link>
                        </p>
                        <p className="flex items-center gap-2">
                          <PhoneIcon className="h-4 w-4 text-navy-400" aria-hidden="true" />
                          <Link to={`tel:${info.phone}`} className="text-primary-600 hover:underline">
                            {info.phone}
                          </Link>
                        </p>
                        <p className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4 text-navy-400" aria-hidden="true" />
                          <span>{info.hours}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-navy-50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-900">Send us a message</h2>
            <p className="mt-4 text-navy-600">
              Prefer to write to us? Fill out the form below and we&apos;ll get back to you within 24 hours.
            </p>
          </div>

          {submitted && (
            <Alert variant="success" className="mb-6" onClose={() => setSubmitted(false)}>
              <CheckCircleIcon className="h-5 w-5 text-emerald-600" aria-hidden="true" />
              <div>
                <p className="font-medium text-emerald-800">Message sent successfully!</p>
                <p className="text-sm text-emerald-700">We&apos;ll get back to you at the email address provided within 24 hours.</p>
              </div>
            </Alert>
          )}

          <Card>
            <CardHeader title="Send us a message" description="All fields marked with * are required" />
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <Input
                    {...register('name')}
                    label="Full Name *"
                    placeholder="John Doe"
                    error={errors.name?.message}
                  />
                  <Input
                    {...register('email')}
                    type="email"
                    label="Email Address *"
                    placeholder="john@example.com"
                    error={errors.email?.message}
                  />
                </div>
                <Input
                  {...register('phone')}
                  label="Phone Number (optional)"
                  placeholder="+91 98765 43210"
                  error={errors.phone?.message}
                />
                <Input
                  {...register('subject')}
                  label="Subject *"
                  placeholder="What is this regarding?"
                  error={errors.subject?.message}
                />
                <Textarea
                  {...register('message')}
                  label="Message *"
                  placeholder="Describe your query in detail..."
                  rows={5}
                  error={errors.message?.message}
                />
                <Button type="submit" className="w-full" loading={submitting} disabled={submitted}>
                  {submitting ? 'Sending...' : 'Send Message'}
                  <ArrowRightIcon className="h-5 w-5" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Offices */}
      <section className="py-16 bg-navy-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-900">Visit Our Offices</h2>
            <p className="mt-4 text-navy-600 max-w-2xl mx-auto">
              Our offices are open Monday through Saturday, 9 AM to 6 PM.
              We recommend booking an appointment before visiting.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3 mt-12">
            {offices.map((office) => (
              <Card key={office.name} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100">
                    <MapPinIcon className="h-6 w-6 text-primary-600" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-navy-900">{office.name}</h3>
                    <p className="mt-2 text-sm text-navy-600">{office.address}</p>
                    <p className="mt-1 text-sm text-primary-600 font-medium">{office.phone}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}