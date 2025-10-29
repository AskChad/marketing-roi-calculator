import Header from '@/components/Header'
import ContactForm from '@/components/ContactForm'
import BenefitsSection from '@/components/BenefitsSection'
import { Calculator, LineChart, Zap } from 'lucide-react'

export default function Home() {
  return (
    <>
      <Header showLogin={true} />

      <main className="min-h-screen bg-gradient-to-br from-neutral-50 to-white">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              Calculate Your <span className="text-brand-primary">Marketing ROI</span>
            </h1>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Optimize your advertising spend with AI-powered insights and platform-by-platform breakdown analysis.
              Model unlimited scenarios and make data-driven decisions.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-neutral-200">
              <Calculator className="h-6 w-6 text-brand-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-neutral-900 mb-1">Two-Input Design</h3>
                <p className="text-sm text-neutral-600">Compare current vs prospective scenarios</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-neutral-200">
              <LineChart className="h-6 w-6 text-brand-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-neutral-900 mb-1">Dual Timeframe</h3>
                <p className="text-sm text-neutral-600">See results in both weekly and monthly views</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-neutral-200">
              <Zap className="h-6 w-6 text-brand-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-neutral-900 mb-1">Instant Results</h3>
                <p className="text-sm text-neutral-600">Real-time calculations with visual charts</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-neutral-200">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-neutral-900 mb-3">
                Get Started Free
              </h2>
              <p className="text-neutral-600">
                Enter your information below to access the ROI calculator
              </p>
            </div>

            <ContactForm />

            {/* Benefits Section */}
            <BenefitsSection />
          </div>

          {/* Social Proof / Trust Section */}
          <div className="mt-16 text-center">
            <p className="text-neutral-600 text-sm">
              Join marketers who are optimizing their ad spend with data-driven insights
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Marketing ROI Calculator. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  )
}
