import { Link } from 'react-router-dom'
import {
  QuestionMarkCircleIcon,
  LockClosedIcon,
  CreditCardIcon,
  BanknotesIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'

const helpTopics = [
  {
    title: 'Account & Login',
    description:
      'Get help with NetBanking access, account activation, passwords and authentication.',
    icon: LockClosedIcon,
  },
  {
    title: 'Accounts & Cards',
    description:
      'Find information about account details, balances, statements and everyday banking.',
    icon: CreditCardIcon,
  },
  {
    title: 'Payments & Transfers',
    description:
      'Learn about money transfers, beneficiaries, transaction verification and payment issues.',
    icon: BanknotesIcon,
  },
  {
    title: 'Support',
    description:
      'Need additional assistance? Contact support or raise a service request.',
    icon: ChatBubbleLeftRightIcon,
  },
]

const commonQuestions = [
  'How do I open a FusionBanking account?',
  'How do I activate NetBanking?',
  'How can I track my account application?',
  'What should I do if I forget my password?',
  'How do I report a suspicious transaction?',
]

export function HelpPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="max-w-3xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600">
              <QuestionMarkCircleIcon className="h-8 w-8 text-white" />
            </div>

            <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-primary-400">
              Help Center
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              How can we help?
            </h1>

            <p className="mt-6 text-lg leading-8 text-navy-200">
              Find answers to common banking questions or get assistance with
              your FusionBanking account.
            </p>
          </div>
        </div>
      </section>

      {/* Topics */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">
              Browse support topics
            </p>

            <h2 className="mt-3 text-3xl font-bold text-navy-900">
              What do you need help with?
            </h2>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {helpTopics.map((topic) => {
              const Icon = topic.icon

              return (
                <div
                  key={topic.title}
                  className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-navy-900">
                    {topic.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-navy-600">
                    {topic.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Common Questions */}
      <section className="border-y border-navy-100 bg-navy-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">
              Frequently asked
            </p>

            <h2 className="mt-3 text-3xl font-bold text-navy-900">
              Common questions
            </h2>
          </div>

          <div className="mt-10 overflow-hidden rounded-2xl border border-navy-100 bg-white">
            {commonQuestions.map((question, index) => (
              <div
                key={question}
                className={`flex items-center justify-between gap-4 p-5 ${
                  index !== commonQuestions.length - 1
                    ? 'border-b border-navy-100'
                    : ''
                }`}
              >
                <span className="text-sm font-medium text-navy-800">
                  {question}
                </span>

                <ArrowRightIcon className="h-4 w-4 shrink-0 text-primary-600" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-primary-600 px-8 py-12 text-center text-white">
            <h2 className="text-3xl font-bold">
              Still need assistance?
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-primary-50">
              Track an existing application, open an account or access secure
              NetBanking support.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/track-application"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary-700 hover:bg-primary-50"
              >
                Track Application
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