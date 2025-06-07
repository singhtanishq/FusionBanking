import { Link } from 'react-router-dom'
import { 
  ShieldCheckIcon, 
  LockClosedIcon, 
  ArrowPathIcon, 
  ChartBarIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  BanknotesIcon,
  ArrowRightIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

const features = [
  {
    name: 'Digital Savings',
    description: 'Open a savings account in minutes with competitive interest rates and zero maintenance fees.',
    icon: CreditCardIcon,
  },
  {
    name: 'Secure Transfers',
    description: 'Send money instantly to any FusionBanking customer with 2FA verification and real-time tracking.',
    icon: ArrowPathIcon,
  },
  {
    name: 'Fixed Deposits',
    description: 'Earn higher returns with flexible tenure options and guaranteed returns on your savings.',
    icon: BanknotesIcon,
  },
  {
    name: 'Personal Loans',
    description: 'Get instant loan approval with competitive rates and flexible repayment options.',
    icon: BuildingOfficeIcon,
  },
  {
    name: '24/7 NetBanking',
    description: 'Access your account anytime, anywhere with our secure online and mobile banking platform.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Account Management',
    description: 'Complete control over your profile, beneficiaries, statements, and security settings.',
    icon: LockClosedIcon,
  },
]

const securityFeatures = [
  { name: 'Secure Authentication', description: 'Multi-factor authentication with email OTP verification' },
  { name: 'Encrypted Data', description: 'End-to-end encryption for all sensitive information' },
  { name: 'Transaction Verification', description: 'Every transfer requires explicit authorization' },
  { name: 'Auditable Activity', description: 'Complete audit trail of all account activities' },
  { name: 'Multi-step Authorization', description: 'Layered approval process for sensitive operations' },
]

const products = [
  { name: 'Savings Account', description: 'Earn interest on your daily balance with easy access to funds', icon: CreditCardIcon, href: '/products/savings' },
  { name: 'Current Account', description: 'Designed for businesses with higher transaction limits', icon: BuildingOfficeIcon, href: '/products/current' },
  { name: 'Fixed Deposit', description: 'Guaranteed returns with flexible tenure from 7 days to 10 years', icon: BanknotesIcon, href: '/products/fd' },
  { name: 'Personal Loan', description: 'Quick approval with minimal documentation and competitive rates', icon: ChartBarIcon, href: '/products/loans' },
  { name: 'Education Loan', description: 'Fund your dreams with special rates for students', icon: ChartBarIcon, href: '/products/education-loan' },
  { name: 'Business Banking', description: 'Complete banking solutions for your growing business', icon: BuildingOfficeIcon, href: '/products/business' },
]

const stats = [
  { value: '50,000+', label: 'Happy Customers' },
  { value: '₹2,500 Cr+', label: 'Total Deposits' },
  { value: '99.9%', label: 'Uptime Guarantee' },
  { value: '24/7', label: 'Customer Support' },
]

const faqs = [
  {
    question: 'How do I open a FusionBanking account?',
    answer: 'Click "Open an Account" and follow our guided multi-step application process. You\'ll need your PAN, Aadhaar, and basic personal information.',
  },
  {
    question: 'What documents are required for KYC?',
    answer: 'You\'ll need a valid PAN card, Aadhaar card, and one additional identity proof (passport, voter ID, or driving license) plus address proof.',
  },
  {
    question: 'Is my money safe with FusionBanking?',
    answer: 'Yes, we use bank-grade encryption, multi-factor authentication, and all transactions are audited. This is a demo banking environment.',
  },
  {
    question: 'How long does account opening take?',
    answer: 'Applications are typically processed within 3-5 business days. You\'ll receive email updates at each stage.',
  },
  {
    question: 'Can I transfer money to other banks?',
    answer: 'Currently, transfers are supported between FusionBanking accounts only. External bank transfers are coming soon.',
  },
  {
    question: 'What is the initial deposit?',
    answer: 'Every new account receives a welcome deposit of ₹1,00,000 which appears in your transaction history.',
  },
]

export function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-50 to-white pt-32 pb-20 lg:pt-48 lg:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-full w-full bg-primary-500"></span>
              </span>
              Now accepting new applications
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-navy-900 tracking-tight text-balance">
              Banking, redesigned for the modern world.
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-navy-600 max-w-2xl">
              Experience secure, convenient digital banking with instant account opening, 
              real-time transfers, flexible loans, and guaranteed returns on fixed deposits.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/open-account">
                <Button size="lg" className="w-full sm:w-auto">
                  Open an Account
                  <ArrowRightIcon className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/track-application">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Track Application
                </Button>
              </Link>
              <Link to="/netbanking/login">
                <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                  NetBanking Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-100/50 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-navy-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <dt className="text-3xl sm:text-4xl font-bold text-navy-900">{stat.value}</dt>
                <dd className="mt-1 text-sm text-navy-600">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 tracking-tight">
              Everything you need for modern banking
            </h2>
            <p className="mt-4 text-lg text-navy-600">
              Our platform provides a complete suite of banking services designed for your convenience and security.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.name} hover padding="lg">
                <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary-600" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-navy-900 mb-2">{feature.name}</h3>
                <p className="text-navy-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 bg-navy-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 tracking-tight">
              Security at our core
            </h2>
            <p className="mt-4 text-lg text-navy-600">
              Your financial security is our top priority. We implement multiple layers of protection.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityFeatures.map((feature) => (
              <div key={feature.name} className="bg-white rounded-xl p-6 border border-navy-100">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                  <ShieldCheckIcon className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-navy-900 mb-2">{feature.name}</h3>
                <p className="text-navy-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 tracking-tight">
              Our Banking Products
            </h2>
            <p className="mt-4 text-lg text-navy-600">
              Choose from a range of products designed to meet your financial goals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Link key={product.name} to={product.href}>
                <Card hover padding="lg" className="h-full">
                  <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center mb-4">
                    <product.icon className="h-6 w-6 text-primary-600" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-navy-900 mb-2">{product.name}</h3>
                  <p className="text-navy-600 mb-4">{product.description}</p>
                  <div className="flex items-center text-primary-600 font-medium text-sm">
                    Learn more
                    <ArrowRightIcon className="h-4 w-4 ml-1" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-navy-50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 tracking-tight text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="group bg-white rounded-xl border border-navy-100 overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <h3 className="text-lg font-medium text-navy-900 pr-8">{faq.question}</h3>
                  <ChevronDownIcon className="h-5 w-5 text-navy-400 transition-transform group-open:rotate-180 flex-shrink-0" />
                </summary>
                <div className="px-6 pb-6 text-navy-600 border-t border-navy-100 animate-slide-down">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-navy-900">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Ready to start your digital banking journey?
          </h2>
          <p className="text-lg text-navy-300 mb-8">
            Join thousands of customers who trust FusionBanking for their financial needs.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/open-account">
              <Button size="lg" className="w-full sm:w-auto bg-white text-navy-900 hover:bg-navy-100">
                Open an Account
                <ArrowRightIcon className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/products">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-navy-800">
                Explore Products
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
