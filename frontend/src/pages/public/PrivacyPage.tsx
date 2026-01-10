import { Link } from 'react-router-dom'
import {
  ArrowRightIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'


const sections = [
  {
    title: 'Information We Collect',
    items: [
      {
        title: 'Personal Information',
        description: 'We collect information you provide directly to us, including your name, email address, phone number, date of birth, PAN, Aadhaar, address, occupation, and income details when you open an account or apply for our services.',
      },
      {
        title: 'Financial Information',
        description: 'Account balances, transaction history, credit scores, loan details, investment holdings, and other financial data necessary to provide banking services.',
      },
      {
        title: 'Usage Data',
        description: 'Information about how you interact with our digital platforms, including IP addresses, device identifiers, browser types, pages visited, and timestamps.',
      },
      {
        title: 'Communications',
        description: 'Records of your communications with us, including emails, chat logs, call recordings, and support tickets.',
      },
    ],
  },
  {
    title: 'How We Use Your Information',
    items: [
      {
        title: 'Provide Banking Services',
        description: 'To open and maintain accounts, process transactions, provide loans and credit facilities, manage investments, and deliver all banking services you request.',
      },
      {
        title: 'Security & Fraud Prevention',
        description: 'To detect and prevent fraud, monitor suspicious activities, verify identities, and protect your accounts and our systems from unauthorized access.',
      },
      {
        title: 'Legal & Regulatory Compliance',
        description: 'To comply with applicable laws, regulations, and regulatory requirements including KYC/AML norms, RBI guidelines, and tax reporting obligations.',
      },
      {
        title: 'Service Improvement',
        description: 'To analyze usage patterns, develop new features, personalize your experience, and improve our products and services.',
      },
      {
        title: 'Marketing & Communications',
        description: 'To send you relevant offers, product updates, and important notifications (with your consent where required). You can opt out anytime.',
      },
    ],
  },
  {
    title: 'Information Sharing & Disclosure',
    items: [
      {
        title: 'With Your Consent',
        description: 'We share your information with third parties only when you have given explicit consent, such as for joint applications or authorized third-party services.',
      },
      {
        title: 'Service Providers',
        description: 'We engage trusted third-party service providers (cloud hosting, payment processors, KYC verification, credit bureaus) who process data on our behalf under strict contractual obligations.',
      },
      {
        title: 'Legal Requirements',
        description: 'We may disclose information when required by law, regulation, court order, or government/regulatory authority request (e.g., RBI, income tax, law enforcement).',
      },
      {
        title: 'Business Transfers',
        description: 'In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the business, subject to confidentiality protections.',
      },
    ],
  },
  {
    title: 'Data Security & Retention',
    items: [
      {
        title: 'Encryption & Security',
        description: 'All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We implement multi-factor authentication, regular security audits, and 24/7 monitoring.',
      },
      {
        title: 'Access Controls',
        description: 'Role-based access controls, principle of least privilege, and regular access reviews ensure only authorized personnel can access your data.',
      },
      {
        title: 'Data Retention',
        description: 'We retain personal data for the duration of our relationship plus 10 years post-account closure, or as required by applicable laws (RBI, tax, anti-money laundering laws).',
      },
      {
        title: 'Data Minimization',
        description: 'We collect only the data necessary for the stated purposes and anonymize or delete data when no longer needed.',
      },
    ],
  },
  {
    title: 'Your Rights',
    items: [
      {
        title: 'Access & Portability',
        description: 'You have the right to request a copy of your personal data in a structured, commonly used format, and to request its transfer to another provider.',
      },
      {
        title: 'Rectification',
        description: 'You can request correction of inaccurate or incomplete personal data. Use our self-service portal or contact support.',
      },
      {
        title: 'Erasure (Right to be Forgotten)',
        description: 'You may request deletion of your personal data where legally permissible, subject to regulatory retention requirements.',
      },
      {
        title: 'Restriction & Objection',
        description: 'You can restrict processing of your data or object to processing for direct marketing and automated decision-making.',
      },
      {
        title: 'Withdraw Consent',
        description: 'Where processing is based on consent, you can withdraw it at any time without affecting the lawfulness of prior processing.',
      },
    ],
  },
  {
    title: 'Cookies & Tracking Technologies',
    items: [
      {
        title: 'Essential Cookies',
        description: 'Required for core functionality like authentication, security, and session management. Cannot be disabled.',
      },
      {
        title: 'Analytics Cookies',
        description: 'Help us understand how visitors use our site (Google Analytics). You can opt out via cookie settings.',
      },
      {
        title: 'Marketing Cookies',
        description: 'Used to show relevant ads across platforms. You can opt out without affecting core functionality.',
      },
      {
        title: 'Cookie Management',
        description: 'Manage your cookie preferences anytime via the cookie banner or browser settings. Blocking essential cookies may impair functionality.',
      },
    ],
  },
  {
    title: 'International Data Transfers',
    items: [
      {
        title: 'Cross-border Transfers',
        description: 'Your data may be processed in India and other countries where our service providers operate. We ensure adequate safeguards (Standard Contractual Clauses, adequacy decisions) for international transfers.',
      },
      {
        title: 'Data Localization',
        description: 'As per RBI guidelines, critical financial data of Indian residents is stored and processed within India. Only non-critical, anonymized data may be processed internationally.',
      },
    ],
  },
  {
    title: 'Children\'s Privacy',
    items: [
      {
        title: 'Age Restriction',
        description: 'Our services are not directed to individuals under 18 years of age. We do not knowingly collect personal information from minors without verifiable parental consent.',
      },
      {
        title: 'Guardian Accounts',
        description: 'Accounts for minors can only be opened and operated by legal guardians. We verify guardian identity and consent during onboarding.',
      },
    ],
  },
  {
    title: 'Changes to This Policy',
    items: [
      {
        title: 'Policy Updates',
        description: 'We may update this Privacy Policy periodically to reflect changes in our practices, technology, or legal requirements. Material changes will be communicated via email, app notification, or prominent notice on our website at least 30 days before taking effect.',
      },
      {
        title: 'Effective Date',
        description: 'This policy was last updated on September 20, 2026. The effective date is posted at the top of this page.',
      },
    ],
  },
  {
    title: 'Contact Us',
    items: [
      {
        title: 'Data Protection Officer',
        description: 'For privacy-related queries, complaints, or to exercise your rights, contact our Data Protection Officer at: privacy@fusionbanking.com or write to: Data Protection Officer, FusionBanking, FusionBanking Tower, BKC, Mumbai - 400051.',
      },
      {
        title: 'Grievance Redressal',
        description: 'If you are not satisfied with our response, you can escalate to our Grievance Redressal Officer at grievance@fusionbanking.com or call 1800-123-4569 (Mon-Fri, 10 AM - 4 PM).',
      },
    ],
  },
]

export function PrivacyPage() {
  // TypeScript workaround for unused imports
  void ShieldCheckIcon;
  
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-400">
            Privacy Policy
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Your Privacy Matters
          </h1>
          <p className="mt-6 text-lg leading-8 text-navy-200 max-w-2xl mx-auto">
            This Privacy Policy explains how FusionBanking collects, uses, protects, and shares your personal information when you use our banking services.
          </p>
          <p className="mt-4 text-sm text-navy-300">
            Last updated: September 20, 2026
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <nav className="mb-12" aria-label="Table of Contents">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-primary-600 mb-4">
              Table of Contents
            </h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {sections.map((section, index) => (
                <Link
                  key={section.title}
                  to={`#${section.title.toLowerCase().replace(/\s+/g, '-').replace("'", '')}`}
                  className="px-4 py-2 text-sm text-navy-600 hover:text-primary-600 hover:bg-navy-50 rounded-lg transition-colors"
                >
                  {index + 1}. {section.title}
                </Link>
              ))}
            </div>
          </nav>

          {sections.map((section) => (
            <section
              key={section.title}
              id={section.title.toLowerCase().replace(/\s+/g, '-').replace("'", '')}
              className="mb-16"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-12 flex-shrink-0 rounded-xl bg-primary-100 flex items-center justify-center">
                  <ShieldCheckIcon className="h-6 w-6 text-primary-600" aria-hidden="true" />
                </div>
                <h2 id={section.title.toLowerCase().replace(/\s+/g, '-').replace("'", '')} className="text-2xl font-bold text-navy-900">
                  {section.title}
                </h2>
              </div>

              <div className="space-y-6">
                {section.items.map((item) => (
                  <div key={item.title} className="bg-white rounded-2xl border border-navy-100 p-6">
                    <dt className="font-semibold text-navy-900 text-lg mb-2">{item.title}</dt>
                    <dd className="text-navy-600 leading-relaxed">{item.description}</dd>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* Contact CTA */}
          <div className="mt-16 p-8 bg-navy-50 rounded-2xl text-center">
            <h2 className="text-2xl font-bold text-navy-900 mb-4">Questions about your privacy?</h2>
            <p className="text-navy-600 mb-6 max-w-xl mx-auto">
              Our Data Protection Officer is here to help. Contact us at
              <a href="mailto:privacy@fusionbanking.com" className="text-primary-600 hover:underline font-medium">
                privacy@fusionbanking.com
              </a>
            </p>
            <Link to="/contact">
              <Button variant="outline" className="mt-4">
                Contact Us
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer navigation */}
      <nav className="py-8 border-t border-navy-100" aria-label="Footer navigation">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link to="/" className="text-sm text-navy-500 hover:text-navy-700">
              <ArrowLeftIcon className="h-4 w-4 inline mr-1" aria-hidden="true" />
              Back to Home
            </Link>
            <div className="flex gap-6 text-sm text-navy-500">
              <Link to="/terms" className="hover:text-primary-600">Terms of Service</Link>
              <Link to="/contact" className="hover:text-primary-600">Contact Us</Link>
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}