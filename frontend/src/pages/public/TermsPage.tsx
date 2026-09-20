import { Link } from 'react-router-dom'
import {
  DocumentTextIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'


const sections = [
  {
    title: 'Acceptance of Terms',
    items: [
      {
        title: 'Agreement',
        description: 'By accessing or using FusionBanking services (website, mobile app, APIs, and all related services), you agree to be bound by these Terms of Service, our Privacy Policy, and all applicable laws and regulations. If you do not agree, please do not use our services.',
      },
      {
        title: 'Eligibility',
        description: 'You must be at least 18 years old and legally capable of entering into contracts. For joint accounts or business accounts, all parties must meet eligibility requirements. We reserve the right to refuse service to anyone.',
      },
      {
        title: 'Account Registration',
        description: 'You must provide accurate, complete, and current information during registration. You are responsible for maintaining the confidentiality of your credentials and for all activities under your account. Notify us immediately of any unauthorized access.',
      },
    ],
  },
  {
    title: 'Banking Services',
    items: [
      {
        title: 'Account Types',
        description: 'We offer Savings Accounts, Current Accounts, Fixed Deposits, Loans, Credit Cards, and other financial products. Each product has specific terms, conditions, interest rates, fees, and eligibility criteria detailed in their respective agreements.',
      },
      {
        title: 'Digital Banking',
        description: 'Our digital services (NetBanking, mobile app, UPI, APIs) are provided "as is" with commercially reasonable uptime. Scheduled maintenance windows will be communicated in advance. We reserve the right to suspend services for maintenance, security, or regulatory reasons.',
      },
      {
        title: 'Transactions & Transfers',
        description: 'All transactions are subject to verification, limits, and regulatory reporting. We may decline, delay, or reverse transactions suspected of fraud, error, or regulatory violation. You are responsible for verifying recipient details before initiating transfers.',
      },
      {
        title: 'Interest Rates & Charges',
        description: 'Interest rates, fees, and charges are subject to change with prior notice as per regulatory requirements. Current rates are published on our website and mobile app. Penal charges apply for defaults, delays, or violations.',
      },
    ],
  },
  {
    title: 'Security & Authentication',
    items: [
      {
        title: 'Multi-Factor Authentication',
        description: 'We require multi-factor authentication (MPIN, biometric, OTP, hardware token) for all sensitive actions. You must never share OTPs, MPINs, or credentials with anyone, including bank staff.',
      },
      {
        title: 'Device Security',
        description: 'You are responsible for securing your devices. Use updated OS, official apps only, avoid public Wi-Fi for banking, and enable device lock. Report lost/stolen devices immediately.',
      },
      {
        title: 'Unauthorized Access',
        description: 'Report lost/stolen devices, compromised credentials, or suspicious activity immediately via app, website, or 24/7 helpline. We are not liable for losses due to delayed reporting or credential sharing.',
      },
      {
        title: 'Security Incidents',
        description: 'In case of a security breach affecting your data, we will notify you and regulators as required by law, and provide guidance on protective steps.',
      },
    ],
  },
  {
    title: 'Fees, Charges & Interest',
    items: [
      {
        title: 'Schedule of Charges',
        description: 'A detailed schedule of charges (account maintenance, transaction fees, penalty charges, service fees) is available on our website and mobile app. We provide 30 days\' notice for any increase in charges.',
      },
      {
        title: 'Interest Calculation',
        description: 'Interest on savings accounts is calculated daily on end-of-day balance and credited quarterly. Loan interest is calculated on reducing balance basis. FD interest is compounded quarterly.',
      },
      {
        title: 'Penalty Charges',
        description: 'Late payment fees, bounce charges, minimum balance non-maintenance charges, and other penalties apply as per the schedule of charges. GST is applicable on all charges.',
      },
      {
        title: 'Tax Deduction',
        description: 'TDS is deducted on interest income as per Income Tax Act. Form 15G/15H can be submitted to avoid TDS if eligible. TDS certificates are available in NetBanking.',
      },
    ],
  },
  {
    title: 'Intellectual Property',
    items: [
      {
        title: 'Ownership',
        description: 'All content, trademarks, logos, software, algorithms, and proprietary technology are owned by or licensed to FusionBanking. You may not copy, reproduce, modify, distribute, or create derivative works without written permission.',
      },
      {
        title: 'License to Use',
        description: 'We grant you a limited, non-exclusive, non-transferable license to access and use our digital services for personal or business banking purposes, subject to these terms.',
      },
      {
        title: 'Feedback',
        description: 'Any feedback, suggestions, or ideas you provide become our property and may be used freely without compensation or attribution.',
      },
    ],
  },
  {
    title: 'Prohibited Activities',
    items: [
      {
        title: 'Illegal Activities',
        description: 'Using our services for money laundering, terrorism financing, fraud, tax evasion, or any illegal activity is strictly prohibited and will result in immediate account termination and reporting to authorities.',
      },
      {
        title: 'System Abuse',
        description: 'Attempting to hack, reverse engineer, overload, or disrupt our systems; using automated tools to scrape data; or circumventing security controls is prohibited.',
      },
      {
        title: 'Misrepresentation',
        description: 'Providing false information, impersonating others, or using forged documents during onboarding or transactions will result in immediate account closure and legal action.',
      },
    ],
  },
  {
    title: 'Liability & Disclaimers',
    items: [
      {
        title: 'Service Availability',
        description: 'We strive for 99.9% uptime but do not guarantee uninterrupted service. We are not liable for losses due to downtime, maintenance, force majeure, third-party failures, or regulatory actions.',
      },
      {
        title: 'Accuracy of Information',
        description: 'While we strive for accuracy, information on our platforms may contain errors or become outdated. We do not warrant completeness, accuracy, or timeliness of content. Verify critical information independently.',
      },
      {
        title: 'Third-Party Links',
        description: 'Our platforms may contain links to third-party websites. We do not endorse, control, or assume responsibility for their content, privacy practices, or security.',
      },
      {
        title: 'Limitation of Liability',
        description: 'To the maximum extent permitted by law, FusionBanking shall not be liable for indirect, incidental, consequential, punitive, or special damages, including loss of profits, data, or business opportunities.',
      },
    ],
  },
  {
    title: 'Termination',
    items: [
      {
        title: 'By You',
        description: 'You may close your account anytime via NetBanking, mobile app, or by contacting support. Outstanding dues must be cleared. Termination does not relieve obligations incurred prior to closure.',
      },
      {
        title: 'By Us',
        description: 'We may suspend or terminate your access for breach of terms, fraud, regulatory non-compliance, inactivity (>24 months), or risk management. We will provide reasonable notice except where immediate action is required for security or legal reasons.',
      },
      {
        title: 'Effect of Termination',
        description: 'Upon termination, your access to digital services ceases. We retain data as per our retention policy and regulatory requirements. Surviving provisions (liability, IP, dispute resolution) remain in effect.',
      },
    ],
  },
  {
    title: 'Dispute Resolution',
    items: [
      {
        title: 'Grievance Redressal',
        description: 'First, contact our support team at support@fusionbanking.com or 1800-123-4567. Unresolved issues can be escalated to our Grievance Redressal Officer at grievance@fusionbanking.com or 1800-123-4569 (Mon-Fri, 10 AM - 4 PM).',
      },
      {
        title: 'Banking Ombudsman',
        description: 'If unresolved within 30 days, you may approach the Banking Ombudsman appointed by RBI as per the Banking Ombudsman Scheme 2006.',
      },
      {
        title: 'Arbitration',
        description: 'Disputes not resolved through above channels shall be referred to arbitration under the Arbitration and Conciliation Act, 1996. Seat: Mumbai. Language: English. Three arbitrators (one each by parties, third by mutual agreement).',
      },
      {
        title: 'Governing Law',
        description: 'These terms are governed by the laws of India. Exclusive jurisdiction: courts in Mumbai, Maharashtra.',
      },
    ],
  },
  {
    title: 'General Provisions',
    items: [
      {
        title: 'Entire Agreement',
        description: 'These Terms, together with the Privacy Policy, product-specific agreements, and schedules of charges, constitute the entire agreement between you and FusionBanking.',
      },
      {
        title: 'Severability',
        description: 'If any provision is found invalid or unenforceable, the remaining provisions remain in full force and effect.',
      },
      {
        title: 'No Waiver',
        description: 'Our failure to enforce any right does not constitute a waiver. Rights and remedies are cumulative.',
      },
      {
        title: 'Assignment',
        description: 'We may assign our rights and obligations without your consent. You may not assign your rights without our written consent.',
      },
      {
        title: 'Force Majeure',
        description: 'We are not liable for delays or failures due to events beyond our reasonable control (natural disasters, wars, strikes, government actions, pandemics, cyberattacks).',
      },
      {
        title: 'Notices',
        description: 'We may communicate via email, SMS, in-app notifications, or postal mail. You consent to electronic communications. Notices are deemed received upon sending (electronic) or delivery (postal).',
      },
    ],
  },
]

export function TermsPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-400">
            Terms of Service
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-6 text-lg leading-8 text-navy-200 max-w-2xl mx-auto">
            Please read these Terms of Service carefully before using FusionBanking services.
            Your continued use constitutes acceptance of these terms.
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
              {sections.map((section, index) => {
                return (
                  <Link
                    key={section.title}
                    href={`#${section.title.toLowerCase().replace(/\s+/g, '-').replace("'", '')}`}
                    className="px-4 py-2 text-sm text-navy-600 hover:text-primary-600 hover:bg-navy-50 rounded-lg transition-colors"
                  >
                    {index + 1}. {section.title}
                  </Link>
                );
              })},
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
                  <DocumentTextIcon className="h-6 w-6 text-primary-600" aria-hidden="true" />
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
            <h2 className="text-2xl font-bold text-navy-900 mb-4">Questions about these terms?</h2>
            <p className="text-navy-600 mb-6 max-w-xl mx-auto">
              Our legal team is here to help. Contact us at
              <a href="mailto:legal@fusionbanking.com" className="text-primary-600 hover:underline font-medium">
                legal@fusionbanking.com
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
              <Link to="/privacy" className="hover:text-primary-600">Privacy Policy</Link>
              <Link to="/contact" className="hover:text-primary-600">Contact Us</Link>
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}