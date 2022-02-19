import { Link } from 'react-router-dom'
import {
  BanknotesIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  ArrowRightIcon,
  CalculatorIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'

const loanProducts = [
  {
    title: 'Personal Loan',
    description:
      'Flexible financing for personal expenses, planned purchases and unexpected financial needs.',
    icon: BanknotesIcon,
    features: ['Flexible repayment tenure', 'Simple application process', 'Transparent terms'],
  },
  {
    title: 'Education Loan',
    description:
      'Financial support for tuition, education expenses and other eligible academic costs.',
    icon: AcademicCapIcon,
    features: ['Education-focused financing', 'Flexible repayment options', 'Digital application'],
  },
  {
    title: 'Business Loan',
    description:
      'Funding designed to help businesses manage working capital, expansion and growth requirements.',
    icon: BuildingOfficeIcon,
    features: ['Business-focused financing', 'Flexible loan structures', 'Digital servicing'],
  },
]

export function LoansPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-400">
              Lending Solutions
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Loans designed around your goals
            </h1>

            <p className="mt-6 text-lg leading-8 text-navy-200">
              Explore flexible lending options for personal needs, education and
              business requirements through a simple digital banking experience.
            </p>
          </div>
        </div>
      </section>

      {/* Loan Products */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {loanProducts.map((loan) => {
              const Icon = loan.icon

              return (
                <div
                  key={loan.title}
                  className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>

                  <h2 className="mt-6 text-xl font-semibold text-navy-900">
                    {loan.title}
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-navy-600">
                    {loan.description}
                  </p>

                  <ul className="mt-6 space-y-2">
                    {loan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-navy-600"
                      >
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/open-account"
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700"
                  >
                    Apply now
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* EMI Calculator CTA */}
      <section className="border-y border-navy-100 bg-navy-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col gap-8 rounded-2xl bg-white p-8 shadow-sm md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100">
                <CalculatorIcon className="h-6 w-6 text-primary-600" />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-navy-900">
                  Plan your repayments
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-navy-600">
                  Use the banking platform's EMI tools to understand your
                  potential monthly repayment before applying.
                </p>
              </div>
            </div>

            <Link
              to="/open-account"
              className="btn-primary inline-flex shrink-0 items-center justify-center"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
              <ShieldCheckIcon className="h-6 w-6 text-primary-600" />
            </div>

            <h2 className="mt-5 text-2xl font-bold text-navy-900">
              A secure digital borrowing experience
            </h2>

            <p className="mt-3 text-navy-600">
              FusionBanking combines digital applications, verification and
              account security controls to support the lending journey.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}