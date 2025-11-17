import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'

export const metadata = {
  title: 'Contact Us | Marketing ROI Calculator',
  description: 'Get in touch with AskChad for support, questions, or feedback about the Marketing ROI Calculator.',
}

export default function ContactPage() {
  return (
    <>
      <Header showLogin={true} />

      <main className="min-h-screen bg-gradient-to-br from-neutral-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-neutral-900 mb-4">
                Contact Us
              </h1>
              <p className="text-lg text-neutral-600">
                Have questions? We're here to help. Reach out to us using the information below.
              </p>
            </div>

            {/* Contact Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {/* Address */}
              <div className="bg-white rounded-lg border border-neutral-200 p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-brand-primary/10 p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-brand-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-2">Our Address</h3>
                    <p className="text-neutral-600 text-sm">
                      [Business Address]<br />
                      [City, State ZIP]<br />
                      United States
                    </p>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="bg-white rounded-lg border border-neutral-200 p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-brand-primary/10 p-3 rounded-lg">
                    <Phone className="h-6 w-6 text-brand-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-2">Phone</h3>
                    <a
                      href="tel:+15555555555"
                      className="text-brand-primary hover:underline text-sm"
                    >
                      (555) 555-5555
                    </a>
                    <p className="text-neutral-500 text-xs mt-1">
                      Monday - Friday, 9am - 5pm EST
                    </p>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="bg-white rounded-lg border border-neutral-200 p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-brand-primary/10 p-3 rounded-lg">
                    <Mail className="h-6 w-6 text-brand-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-2">Email</h3>
                    <a
                      href="mailto:support@askchad.net"
                      className="text-brand-primary hover:underline text-sm"
                    >
                      support@askchad.net
                    </a>
                    <p className="text-neutral-500 text-xs mt-1">
                      We typically respond within 24 hours
                    </p>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-white rounded-lg border border-neutral-200 p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-brand-primary/10 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-brand-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-2">Business Hours</h3>
                    <div className="text-neutral-600 text-sm space-y-1">
                      <p>Monday - Friday: 9:00 AM - 5:00 PM EST</p>
                      <p>Saturday - Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white rounded-lg border border-neutral-200 p-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                Get in Touch
              </h2>
              <div className="space-y-4 text-neutral-600">
                <p>
                  <strong className="text-neutral-900">AskChad</strong> provides the Marketing ROI Calculator
                  to help businesses optimize their marketing spend and maximize returns on investment.
                </p>
                <p>
                  For general inquiries, support questions, or feedback about the ROI Calculator,
                  please contact us using any of the methods above. We're here to help you make
                  data-driven decisions for your marketing campaigns.
                </p>
                <div className="pt-4 border-t border-neutral-200">
                  <h3 className="font-semibold text-neutral-900 mb-2">Support Topics</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Technical support and troubleshooting</li>
                    <li>Account and login assistance</li>
                    <li>Questions about ROI calculations</li>
                    <li>Feature requests and feedback</li>
                    <li>Business inquiries and partnerships</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* SMS Compliance Note */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> If you have questions about SMS messaging, opt-out requests,
                or privacy concerns, please review our{' '}
                <a href="/privacy" className="underline hover:text-blue-700">Privacy Policy</a>
                {' '}and{' '}
                <a href="/sms-terms" className="underline hover:text-blue-700">SMS Terms of Service</a>.
                You can also text HELP to our SMS number or STOP to unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
