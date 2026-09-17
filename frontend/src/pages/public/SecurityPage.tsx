import { Link } from 'react-router-dom'
import {
  ShieldCheckIcon,
  LockClosedIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  EyeSlashIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'

const securityFeatures = [
  {
    title: 'Secure Authentication',
    description:
      'Customer access is protected with authenticated sessions and additional verification for sensitive banking actions.',
    icon: LockClosedIcon,
  },
  {
    title: 'Transaction Verification',
    description:
      'Sensitive transactions can require additional verification before they are completed.',
    icon: KeyIcon,
  },
  {
    title: 'Session Security',
    description:
      'Security controls help customers review and manage active banking sessions.',
    icon: DevicePhoneMobileIcon,
  },
  {
    title: 'Data Protection',
    description:
      'Sensitive banking information is handled with controlled access and data masking across the application.',
    icon: EyeSlashIcon,
  },
]

export function SecurityPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="max-w-3xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600">
              <ShieldCheckIcon className="h-8 w-8 text-white" />
            </div>

            <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-primary-400">
              Security Center
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Security built into your banking experience
            </h1>

            <p className="mt-6 text-lg leading-8 text-navy-200">
              FusionBanking uses multiple security controls to protect account
              access, sensitive information and financial transactions.
            </p>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">
              Protection at every layer
            </p>

            <h2 className="mt-3 text-3xl font-bold text-navy-900">
              Security controls that matter
            </h2>

            <p className="mt-4 text-navy-600">
              Banking security is built across authentication, transactions,
              sessions and sensitive customer information.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {securityFeatures.map((feature) => {
              const Icon = feature.icon

              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>

                  <h3 className="mt-5 text-xl font-semibold text-navy-900">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-navy-600">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Security Practices */}
      <section className="border-y border-navy-100 bg-navy-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">
                Safe banking practices
              </p>

              <h2 className="mt-3 text-3xl font-bold text-navy-900">
                Keep your account protected
              </h2>

              <p className="mt-4 leading-7 text-navy-600">
                Good security also depends on how you use your banking account.
                Keep your credentials private and review unexpected account
                activity carefully.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <ul className="space-y-4">
                {[
                  'Never share passwords or verification codes with anyone.',
                  'Use a strong, unique password for your banking account.',
                  'Review account and transaction activity regularly.',
                  'Sign out of banking sessions on shared or public devices.',
                ].map((tip) => (
                  <li
                    key={tip}
                    className="flex items-start gap-3 text-sm text-navy-700"
                  >
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary-600" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-primary-600 px-8 py-12 text-center text-white">
            <h2 className="text-3xl font-bold">
              Need help securing your account?
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-primary-50">
              Visit the Help Center or sign in to review your account security
              settings.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/help"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary-700 hover:bg-primary-50"
              >
                Visit Help Center
                <ArrowRightIcon className="h-4 w-4" />
              </Link>

              <Link
                to="/netbanking/login"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                NetBanking Login
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}