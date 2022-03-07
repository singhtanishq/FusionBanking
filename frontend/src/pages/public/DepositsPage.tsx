import { Link } from 'react-router-dom'
import {
  BanknotesIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'

const depositOptions = [
  {
    title: 'Fixed Deposit',
    description:
      'Invest a lump sum for a selected tenure and receive predictable returns at maturity.',
    icon: BanknotesIcon,
    features: ['Multiple tenure options', 'Maturity tracking', 'Predictable returns'],
  },
  {
    title: 'Short-Term Deposit',
    description:
      'A flexible option for keeping funds invested for shorter periods while planning upcoming needs.',
    icon: CalendarDaysIcon,
    features: ['Shorter tenures', 'Simple digital management', 'Flexible planning'],
  },
  {
    title: 'Growth Deposit',
    description:
      'Plan your savings over a longer horizon with deposit options designed around your financial goals.',
    icon: ArrowTrendingUpIcon,
    features: ['Long-term savings', 'Goal-oriented planning', 'Digital servicing'],
  },
]

export function DepositsPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-400">
              Savings & Deposits
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Make your savings work harder
            </h1>

            <p className="mt-6 text-lg leading-8 text-navy-200">
              Explore deposit options that help you organize your savings,
              choose suitable tenures and plan toward your financial goals.
            </p>
          </div>
        </div>
      </section>

      {/* Deposit options */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {depositOptions.map((deposit) => {
              const Icon = deposit.icon

              return (
                <div
                  key={deposit.title}
                  className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>

                  <h2 className="mt-6 text-xl font-semibold text-navy-900">
                    {deposit.title}
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-navy-600">
                    {deposit.description}
                  </p>

                  <ul className="mt-6 space-y-2">
                    {deposit.features.map((feature) => (
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
                    Get started
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-y border-navy-100 bg-navy-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">
                Built for confidence
              </p>

              <h2 className="mt-3 text-3xl font-bold text-navy-900">
                Simple deposit management
              </h2>

              <p className="mt-4 text-navy-600 leading-7">
                Manage your deposits digitally with clear account information,
                maturity visibility and secure banking access.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100">
                  <ShieldCheckIcon className="h-6 w-6 text-primary-600" />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-navy-900">
                    Secure account access
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-navy-600">
                    Your deposit information remains accessible through
                    authenticated digital banking channels.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-primary-600 px-8 py-12 text-center text-white">
            <h2 className="text-3xl font-bold">
              Ready to start saving?
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-primary-50">
              Open your FusionBanking account and manage your savings digitally.
            </p>

            <Link
              to="/open-account"
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary-700 hover:bg-primary-50"
            >
              Open an Account
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}