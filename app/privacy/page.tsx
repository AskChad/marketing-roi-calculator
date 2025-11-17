import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy | ROI Calculator',
  description: 'Privacy Policy for ROI Calculator including SMS messaging practices',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link
            href="/"
            className="text-brand-primary hover:underline text-sm font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-neutral-900 mb-2">Privacy Policy</h1>
        <p className="text-neutral-600 mb-8">
          <strong>Effective Date:</strong> November 16, 2025
        </p>

        <div className="prose prose-neutral max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">1. Introduction</h2>
            <p className="text-neutral-700 mb-4">
              ROI Calculator ("we," "our," "us") values your privacy. This Privacy Policy explains
              how we collect, use, and protect information when you visit our website, enroll in our
              SMS program ROI Calculator Alerts, or interact with our services.
            </p>
            <p className="text-neutral-700">
              By using our website or opting in to receive text messages, you agree to this Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">2. Information We Collect</h2>
            <p className="text-neutral-700 mb-4">We may collect:</p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700">
              <li>
                Personal information (name, phone number, email, address) you provide when opting
                in or contacting support.
              </li>
              <li>
                Technical data (IP address, device type, browser type) collected automatically.
              </li>
              <li>
                Communication data related to your participation in ROI Calculator Alerts
                (e.g., opt-in status, delivery confirmations).
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-neutral-700 mb-4">We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700">
              <li>Send marketing and ROI calculation updates messages through our SMS program.</li>
              <li>Respond to customer inquiries.</li>
              <li>Improve our products and services.</li>
              <li>Comply with legal obligations.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">
              4. Mobile Information and Text Messaging
            </h2>
            <p className="text-neutral-700 mb-4">
              <strong>No mobile information will be shared with third parties/affiliates for marketing
              or promotional purposes.</strong>
            </p>
            <p className="text-neutral-700 mb-4">
              Information sharing to subcontractors in support services, such as customer service,
              is permitted. All other use-case categories exclude text-messaging originator opt-in
              data and consent; this information will not be shared with any third parties, excluding
              aggregators and providers of the text-message services.
            </p>
            <p className="text-neutral-700">
              <strong>Text-messaging originator opt-in data and consent will not be shared with any
              third parties except for aggregators and providers of the text-message services who
              enable delivery on our behalf.</strong>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">5. How We Share Information</h2>
            <p className="text-neutral-700 mb-4">We may share information only as follows:</p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700">
              <li>
                With service providers who perform operational tasks (hosting, analytics, messaging delivery).
              </li>
              <li>To comply with law, regulation, or legal process.</li>
              <li>In connection with a merger, sale, or asset transfer.</li>
            </ul>
            <p className="text-neutral-700 mt-4">
              <strong>All the above categories exclude text-messaging originator opt-in data and
              consent; this information will not be shared with any third parties, excluding aggregators
              and providers of the text-message services.</strong>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">6. Data Security</h2>
            <p className="text-neutral-700">
              We implement reasonable security measures to protect your personal data from unauthorized
              access, disclosure, alteration, or destruction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">7. Your Rights and Choices</h2>
            <p className="text-neutral-700 mb-4">You may:</p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700">
              <li>Opt out of SMS messages by texting <strong>STOP</strong>.</li>
              <li>
                Request access, correction, or deletion of your data by contacting{' '}
                <a href="mailto:support@roicalculator.app" className="text-brand-primary hover:underline">
                  support@roicalculator.app
                </a>.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">8. Contact Us</h2>
            <p className="text-neutral-700 mb-4">
              For questions about this Privacy Policy or our data practices, contact:
            </p>
            <div className="bg-neutral-100 p-4 rounded-lg">
              <p className="text-neutral-900 font-semibold">ROI Calculator</p>
              <p className="text-neutral-700">123 Marketing Street, Suite 100</p>
              <p className="text-neutral-700">San Francisco, CA 94102</p>
              <p className="text-neutral-700">
                Email:{' '}
                <a href="mailto:support@roicalculator.app" className="text-brand-primary hover:underline">
                  support@roicalculator.app
                </a>
              </p>
              <p className="text-neutral-700">Phone: (555) 123-4567</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">9. Updates to This Policy</h2>
            <p className="text-neutral-700">
              We may update this Privacy Policy periodically. Updates take effect on the Effective
              Date shown above.
            </p>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-neutral-200">
          <p className="text-sm text-neutral-600">
            <Link href="/sms-terms" className="text-brand-primary hover:underline">
              SMS Terms of Service
            </Link>
            {' '}|{' '}
            <Link href="/" className="text-brand-primary hover:underline">
              Back to Home
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
