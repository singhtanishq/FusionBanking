import { Link } from 'react-router-dom'
import {
  BanknotesIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  ChartBarIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'

const products = [
  {
    title: 'Savings Account',
    description:
      'Earn interest on your balance while keeping your money accessible for everyday needs.',
    icon: CreditCardIcon,
    href: '/products/savings',
    badge: 'Personal Banking',
  },
  {
    title: 'Current Account',
    description:
      'Built for businesses with higher transaction volumes and flexible banking features.',
    icon: BuildingOfficeIcon,
    href: '/products/current',
    badge: 'Business Banking',
  },
  {
    title: 'Fixed Deposits',
    description:
      'Lock in your savings for a chosen tenure with predictable returns and maturity tracking.',
    icon: BanknotesIcon,
    href: '/deposits',
    badge: 'Savings',
  },
  {
    title: 'Personal Loans',
    description:
      'Flexible financing for personal needs with a straightforward digital application process.',
    icon: ChartBarIcon,
    href: '/loans',
    badge: 'Loans',
  },
  {
    title: 'Education Loans',
    description:
      'Financial support designed to help students fund education and related expenses.',
    icon: BanknotesIcon,
    href: '/loans',
    badge: 'Loans',
  },
  {
    title: 'Business Banking',
    description:
      'Banking solutions designed to support businesses with payments, accounts and financial management.',
    icon: BuildingOfficeIcon,
    href: '/products/current',
    badge: 'Business Banking',
  },
]

export function ProductsPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-400">
              Banking Products
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Banking products built around your needs
            </h1>

            <p className="mt-6 text-lg leading-8 text-navy-200">
              Explore FusionBanking accounts, deposits, loans and business banking
              products designed for secure and convenient digital banking.
            </p>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const Icon = product.icon

              return (
                <div
                  key={product.title}
                  className="group rounded-2xl border border-navy-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                      <Icon className="h-6 w-6 text-primary-600" />
                    </div>

                    <span className="rounded-full bg-navy-50 px-3 py-1 text-xs font-medium text-navy-600">
                      {product.badge}
                    </span>
                  </div>

                  <h2 className="mt-6 text-xl font-semibold text-navy-900">
                    {product.title}
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-navy-600">
                    {product.description}
                  </p>

                  <Link
                    to={product.href}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700"
                  >
                    Learn more
                    <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Security / CTA */}
      <section className="border-t border-navy-100 bg-navy-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col gap-8 rounded-2xl bg-white p-8 shadow-sm md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100">
                <ShieldCheckIcon className="h-6 w-6 text-primary-600" />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-navy-900">
                  Secure digital banking
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-navy-600">
                  Your banking experience is protected with authentication,
                  transaction verification and security controls.
                </p>
              </div>
            </div>

            <Link
              to="/open-account"
              className="btn-primary inline-flex shrink-0 items-center justify-center"
            >
              Open an Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}