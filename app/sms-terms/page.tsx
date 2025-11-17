import Link from 'next/link'

export const metadata = {
  title: 'SMS Terms of Service | ROI Calculator',
  description: 'Terms of Service for ROI Calculator SMS messaging program',
}

export default function SmsTermsPage() {
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
        <h1 className="text-4xl font-bold text-neutral-900 mb-2">SMS Terms of Service</h1>
        <p className="text-neutral-600 mb-8">
          <strong>Effective Date:</strong> November 16, 2025
        </p>

        <div className="prose prose-neutral max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">1. Program Description</h2>
            <p className="text-neutral-700 mb-4">
              The <strong>ROI Calculator Alerts</strong> offers marketing and ROI calculation updates
              messages from ROI Calculator to users who opt in.
            </p>
            <p className="text-neutral-700 mb-4">
              <strong>Message frequency</strong>: varies.
            </p>
            <p className="text-neutral-700">
              By subscribing, you consent to receive recurring automated text messages.{' '}
              <strong>Consent is not a condition of purchase.</strong>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">2. Opt-In</h2>
            <p className="text-neutral-700 mb-4">
              You may opt in by submitting your phone number through our website form, keyword, or
              written consent.
            </p>
            <p className="text-neutral-700">
              By opting in, you confirm ownership of the provided number and authorize ROI Calculator
              to send you SMS/MMS messages.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">3. Opt-Out</h2>
            <p className="text-neutral-700 mb-4">
              You can cancel the SMS service at any time. Text <strong>STOP</strong> to the number
              or shortcode from which you receive messages.
            </p>
            <p className="text-neutral-700 mb-4">
              After sending "STOP," you'll receive a final confirmation message that you've been
              unsubscribed. After confirmation, you will no longer receive messages from us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">4. Rejoining the Program</h2>
            <p className="text-neutral-700">
              To rejoin, opt in again using the same process you used originally.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">5. Help and Support</h2>
            <p className="text-neutral-700">
              If you experience issues, text <strong>HELP</strong> for assistance or contact us at{' '}
              <a href="mailto:support@roicalculator.app" className="text-brand-primary hover:underline">
                support@roicalculator.app
              </a>{' '}
              or (555) 123-4567.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">6. Message and Data Rates</h2>
            <p className="text-neutral-700 mb-4">
              <strong>Message and data rates may apply</strong> for any messages sent to you from us
              and from you to us.
            </p>
            <p className="text-neutral-700 mb-4">
              <strong>Message frequency</strong>: varies.
            </p>
            <p className="text-neutral-700">
              For questions about your text plan or data plan, contact your wireless provider.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">7. Carrier Liability Disclaimer</h2>
            <p className="text-neutral-700">
              Wireless carriers are not liable for delayed or undelivered messages.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">8. Eligibility</h2>
            <p className="text-neutral-700">
              You must be at least <strong>18 years old</strong> (or of legal age in your jurisdiction)
              to participate in ROI Calculator Alerts.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">9. Privacy</h2>
            <p className="text-neutral-700">
              Your use of the ROI Calculator Alerts is subject to our{' '}
              <Link href="/privacy" className="text-brand-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">10. Legal Compliance</h2>
            <p className="text-neutral-700 mb-4">
              This messaging program complies with CTIA, TCPA, and applicable U.S. laws.
            </p>
            <p className="text-neutral-700">
              You agree to use our messaging services only for lawful purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">11. Changes to Terms</h2>
            <p className="text-neutral-700">
              ROI Calculator may modify these Terms at any time. Updates will be posted at
              https://www.roicalculator.app/sms-terms and will take effect upon posting.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">12. Contact Information</h2>
            <p className="text-neutral-700 mb-4">
              For any questions regarding these Terms or the ROI Calculator Alerts, contact:
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
        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-neutral-200">
          <p className="text-sm text-neutral-600">
            <Link href="/privacy" className="text-brand-primary hover:underline">
              Privacy Policy
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
