import { Link } from 'react-router-dom'
import {
  CheckCircleIcon,
  ArrowPathIcon,
  LockClosedIcon,
  ArrowRightIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

// Suppress unused import warnings for icons used in JSX
void CheckCircleIcon;
void ArrowPathIcon;
void LockClosedIcon;
void ArrowRightIcon;
void SparklesIcon;

const features = [
  {
    title: 'Zero Minimum Balance',
    description: 'No minimum balance requirement - keep your account active with any amount.',
    icon: SparklesIcon,
  },
  {
    title: 'Competitive Interest Rates',
    description: 'Earn up to 4.5% p.a. interest on your savings balance, credited quarterly.',
    icon: SparklesIcon,
  },
  {
    title: 'Instant Digital Account Opening',
    description: 'Open your account in minutes with video KYC - no branch visits required.',
    icon: ArrowPathIcon,
  },
  {
    title: 'Free Debit Card',
    description: 'Get a contactless Visa debit card with free domestic ATM withdrawals.',
    icon: LockClosedIcon,
  },
  {
    title: 'Unlimited Free Transfers',
    description: 'Unlimited IMPS, NEFT, and RTGS transfers - no charges ever.',
    icon: ArrowPathIcon,
  },
  {
    title: 'Smart Banking Tools',
    description: 'Track spending, set budgets, and automate savings with our smart tools.',
    icon: SparklesIcon,
  },
]

const requirements = [
  'Valid PAN Card',
  'Valid Aadhaar Card',
  'Registered mobile number linked to Aadhaar',
  'Age 18 years or above',
  'Valid email address',
  'Indian resident',
]

const faqs = [
  {
    q: 'Is there any minimum balance requirement?',
    a: 'No, our Digital Savings Account has zero minimum balance requirement. You can maintain any balance including zero.',
  },
  {
    q: 'How do I complete KYC?',
    a: 'Complete video KYC during the digital onboarding process. You\'ll need your original PAN and Aadhaar cards.',
  },
  {
    q: 'What is the interest rate on savings account?',
    a: 'We offer up to 4.5% p.a. interest on savings account balance, credited quarterly. Rates may vary based on balance.',
  },
  {
    q: 'Can I open a joint account?',
    a: 'Yes, joint accounts are supported. Both applicants must complete KYC individually.',
  },
]

export function SavingsAccountPage() {
  // TypeScript workaround for unused imports through array mapping
  void CheckCircleIcon;
  void ArrowPathIcon;
  void LockClosedIcon;
  void ArrowRightIcon;
  void SparklesIcon;
  void Select;
  void Badge;
  
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-400">
              Personal Banking
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Digital Savings Account
            </h1>

            <p className="mt-6 text-lg leading-8 text-navy-200">
              Zero balance, instant opening, and up to 4.5% p.a. interest.
              Banking that works for you, not the other way around.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link to="/open-account">
                <Button size="lg" className="w-full sm:w-auto">
                  Open Free Account
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
              Everything you need, nothing you don&apos;t
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
            <h2 className="text-3xl font-bold text-navy-900">What you&apos;ll need to get started</h2>
            <p className="mt-4 text-navy-600 max-w-2xl mx-auto">
              Have these documents ready for a smooth 5-minute application process.
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
            Ready to start saving smarter?
          </h2>
          <p className="mt-4 text-lg text-navy-300">
            Join thousands of customers who trust FusionBanking with their savings.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/open-account">
              <Button size="lg" className="w-full sm:w-auto bg-white text-navy-900 hover:bg-navy-100">
                Open Free Account
                <ArrowRightIcon className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}