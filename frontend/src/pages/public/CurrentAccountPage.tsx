import { Link } from 'react-router-dom'
import {
  CheckCircleIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  LockClosedIcon,
  ArrowRightIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

const features = [
  {
    title: 'Higher Transaction Limits',
    description: 'No daily transaction limits - perfect for businesses with high transaction volumes.',
    icon: CurrencyDollarIcon,
  },
  {
    title: 'Overdraft Facility',
    description: 'Access overdraft up to ₹50 Lakhs with competitive interest rates.',
    icon: CurrencyDollarIcon,
  },
  {
    title: 'Bulk Payments',
    description: 'Process salary payments, vendor payments, and bulk transfers in a single click.',
    icon: ArrowPathIcon,
  },
  {
    title: 'Multi-user Access',
    description: 'Role-based access for your finance team with customizable permissions.',
    icon: LockClosedIcon,
  },
  {
    title: 'Dedicated Relationship Manager',
    description: 'Get personalized support from a dedicated relationship manager.',
    icon: ShieldCheckIcon,
  },
  {
    title: 'Auto-sweep Facility',
    description: 'Automatically sweep idle funds into FDs to earn higher returns.',
    icon: SparklesIcon,
  },
]

const requirements = [
  'Valid PAN Card of Business/Proprietor',
  'Valid Aadhaar Card of Authorized Signatory',
  'Business Registration Certificate (GST/Shop Act/Udyam)',
  'Board Resolution / Partnership Deed / Proprietorship Declaration',
  'Proof of Business Address',
  'Cancelled Cheque of Existing Bank Account',
]

const faqs = [
  {
    q: 'What is the minimum balance requirement?',
    a: 'Current Accounts require a minimum average quarterly balance of ₹10,000. Failure to maintain attracts charges.',
  },
  {
    q: 'Can I open a Current Account for a startup?',
    a: 'Yes, startups registered under Startup India or with valid DPIIT recognition get waived minimum balance for first year.',
  },
  {
    q: 'Is there an overdraft facility?',
    a: 'Yes, overdraft facility up to ₹50 Lakhs is available subject to credit assessment and collateral.',
  },
  {
    q: 'Can I have multiple users with different permissions?',
    a: 'Yes, role-based access control allows you to set Viewer, Maker, Checker, and Admin roles for your team.',
  },
]

export function CurrentAccountPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-400">
              Business Banking
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Current Account for Business
            </h1>

            <p className="mt-6 text-lg leading-8 text-navy-200">
              Built for growing businesses with unlimited transactions, overdraft facility,
              and powerful payment tools - all in one place.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link to="/open-account">
                <Button size="lg" className="w-full sm:w-auto">
                  Open Current Account
                  <ArrowRightIcon className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/products" className="btn-outline inline-flex items-center justify-center px-6 py-3">
                View All Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">
              Key Features
            </p>
            <h2 className="mt-2 text-3xl font-bold text-navy-900 sm:text-4xl">
              Built for business growth
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="p-6 rounded-2xl border border-navy-100 bg-white transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                  <feature.icon className="h-6 w-6 text-primary-600" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-navy-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-navy-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-16 bg-navy-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-900">Documents required to open a Current Account</h2>
            <p className="mt-4 text-navy-600 max-w-2xl mx-auto">
              Keep these documents ready for a smooth application process.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {requirements.map((req) => (
              <div key={req} className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-navy-100">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100">
                  <CheckCircleIcon className="h-6 w-6 text-primary-600" aria-hidden="true" />
                </div>
                <span className="font-medium text-navy-900">{req}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">
              Frequently Asked Questions
            </p>
            <h2 className="mt-2 text-3xl font-bold text-navy-900">
              Still have questions?
            </h2>
          </div>

          <dl className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-white rounded-2xl border border-navy-100 p-6">
                <dt className="font-semibold text-navy-900">{faq.q}</dt>
                <dd className="mt-2 text-navy-600">{faq.a}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-12 text-center">
            <Link to="/help" className="btn-outline inline-flex items-center gap-2">
              View All FAQs
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy-900 text-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to power your business banking?
          </h2>
          <p className="mt-4 text-lg text-navy-300">
            Join thousands of businesses who trust FusionBanking for their financial operations.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/open-account">
              <Button size="lg" className="w-full sm:w-auto bg-white text-navy-900 hover:bg-navy-100">
                Open Current Account
                <ArrowRightIcon className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}