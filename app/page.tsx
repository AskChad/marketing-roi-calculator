import Header from '@/components/Header'
import ContactForm from '@/components/ContactForm'
import BenefitsSection from '@/components/BenefitsSection'
import HeroSection from '@/components/HeroSection'
import Footer from '@/components/Footer'
import { Calculator, LineChart, Zap } from 'lucide-react'

export default function Home() {
  return (
    <>
      <Header showLogin={true} />

      <main className="min-h-screen bg-gradient-to-br from-neutral-50 to-white">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <HeroSection />

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

      <Footer />
    </>
  )
}
