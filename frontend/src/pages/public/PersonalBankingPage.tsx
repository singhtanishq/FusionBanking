import { Link } from 'react-router-dom'
import {
  CreditCardIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  LockClosedIcon,
  ArrowPathIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

const features = [
  {
    title: 'Digital Savings Account',
    description: 'Open a zero-balance savings account in minutes with competitive interest rates and instant activation.',
    icon: CreditCardIcon,
    href: '/open-account',
    cta: 'Open Now',
    color: 'primary',
  },
  {
    title: 'Secure Digital Banking',
    description: 'Bank from anywhere with military-grade encryption, biometric login, and real-time transaction alerts.',
    icon: ShieldCheckIcon,
    href: '/security',
    cta: 'Learn More',
    color: 'emerald',
  },
  {
    title: 'Instant Transfers',
    description: 'Send money 24/7 to any bank account with IMPS, NEFT, and RTGS - most transfers complete in seconds.',
    icon: ArrowPathIcon,
    href: '/products/savings',
    cta: 'Learn More',
    color: 'amber',
  },
  {
    title: 'Fixed Deposits',
    description: 'Grow your savings with competitive rates up to 7.25% p.a. and flexible tenures from 7 days to 10 years.',
    icon: SparklesIcon,
    href: '/deposits',
    cta: 'View Rates',
    color: 'purple',
  },
  {
    title: 'Personal Loans',
    description: 'Quick approval personal loans up to ₹50 Lakhs with flexible EMIs and minimal documentation.',
    icon: ArrowPathIcon,
    href: '/loans',
    cta: 'Check Eligibility',
    color: 'primary',
  },
  {
    title: '24/7 Customer Support',
    description: 'Dedicated support via chat, email, and phone - we\'re here when you need us.',
    icon: LockClosedIcon,
    href: '/support',
    cta: 'Contact Us',
    color: 'gray',
  },
]

const benefits = [
  {
    title: 'Zero Balance Account',
    description: 'No minimum balance requirement - your money is truly yours.',
    icon: SparklesIcon,
  },
  {
    title: 'Instant Account Opening',
    description: 'Complete KYC digitally and get your account activated in minutes.',
    icon: ArrowPathIcon,
  },
  {
    title: 'Zero Hidden Fees',
    description: 'Transparent pricing with no hidden charges or surprise fees.',
    icon: LockClosedIcon,
  },
  {
    title: 'Rewards Program',
    description: 'Earn reward points on every transaction and redeem for exciting rewards.',
    icon: SparklesIcon,
  },
]

const stats = [
  { value: '10L+', label: 'Happy Customers' },
  { value: '₹500Cr+', label: 'Deposits Managed' },
  { value: '99.9%', label: 'Uptime Guarantee' },
  { value: '24/7', label: 'Customer Support' },
]

const colorMap = {
  primary: 'bg-primary-100 text-primary-600 hover:bg-primary-200',
  emerald: 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200',
  amber: 'bg-amber-100 text-amber-600 hover:bg-amber-200',
  purple: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
  gray: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
}

const iconColorMap = {
  primary: 'text-primary-600',
  emerald: 'text-emerald-600',
  amber: 'text-amber-600',
  purple: 'text-purple-600',
  gray: 'text-gray-600',
}

export function PersonalBankingPage() {
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
              Banking that puts <span className="text-primary-400">you</span> first
            </h1>

            <p className="mt-6 text-lg leading-8 text-navy-200">
              Experience banking designed around your life. From zero-balance savings accounts to instant loans,
              we&apos;re building the bank you&apos;ve been waiting for.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link to="/open-account">
                <Button size="lg" className="w-full sm:w-auto">
                  Open Your Account
                  <ArrowRightIcon className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/products" className="btn-outline inline-flex items-center justify-center px-6 py-3">
                Explore Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-navy-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <dl className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat) => (
              <dt key={stat.label} className="text-center">
                <dd className="text-4xl font-bold text-primary-600">{stat.value}</dd>
                <dt className="mt-1 text-sm text-navy-600">{stat.label}</dt>
              </dt>
            ))}
          </dl>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">
              Why Choose FusionBanking?
            </p>
            <h2 className="mt-2 text-3xl font-bold text-navy-900 sm:text-4xl">
              Banking designed for your life
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-navy-600">
              We&apos;ve reimagined every aspect of banking to give you more control, better rates, and a truly
              digital experience.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
                <CardContent>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                    <benefit.icon className="h-6 w-6 text-primary-600" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-navy-900">{benefit.title}</h3>
                  <p className="mt-2 text-sm text-navy-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-16 bg-navy-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">
              Our Products
            </p>
            <h2 className="mt-2 text-3xl font-bold text-navy-900 sm:text-4xl">
              Banking products for every need
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl">
                <div className={cn('p-6', colorMap[feature.color])}>
                  <feature.icon className={cn('h-8 w-8', iconColorMap[feature.color])} aria-hidden="true" />
                </div>
                <CardContent className="pt-0 pb-6">
                  <h3 className="text-xl font-semibold text-navy-900">{feature.title}</h3>
                  <p className="mt-2 text-sm text-navy-600">{feature.description}</p>
                  <Link
                    to={feature.href}
                    className={cn(
                      'mt-4 inline-flex items-center gap-2 text-sm font-semibold transition-colors',
                      colorMap[feature.color].replace('hover:bg-primary-200', 'hover:bg-primary-700')
                        .replace('hover:bg-emerald-200', 'hover:bg-emerald-700')
                        .replace('hover:bg-amber-200', 'hover:bg-amber-700')
                        .replace('hover:bg-purple-200', 'hover:bg-purple-700')
                        .replace('hover:bg-gray-200', 'hover:bg-gray-700')
                    )}
                  >
                    {feature.cta}
                    <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy-900 text-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to experience better banking?
          </h2>
          <p className="mt-4 text-lg text-navy-300">
            Join over 10 lakh customers who trust FusionBanking with their financial future.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/open-account">
              <Button size="lg" className="w-full sm:w-auto bg-white text-navy-900 hover:bg-navy-100">
                Open Free Account
                <ArrowRightIcon className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/products" className="btn-outline inline-flex items-center justify-center px-8 py-3 border-white text-white hover:bg-navy-800">
              View All Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}