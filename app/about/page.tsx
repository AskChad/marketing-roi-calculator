import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Target, TrendingUp, Users, BarChart3 } from 'lucide-react'

export const metadata = {
  title: 'About Us | Marketing ROI Calculator',
  description: 'Learn about AskChad and our mission to help businesses optimize their marketing spend with data-driven insights.',
}

export default function AboutPage() {
  return (
    <>
      <Header showLogin={true} />

      <main className="min-h-screen bg-gradient-to-br from-neutral-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-neutral-900 mb-4">
                About AskChad
              </h1>
              <p className="text-lg text-neutral-600">
                Empowering businesses with data-driven marketing insights
              </p>
            </div>

            {/* Mission Statement */}
            <div className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-2xl p-8 md:p-12 mb-12">
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-lg leading-relaxed">
                At AskChad, we believe every marketing dollar should work harder. Our mission is to
                provide businesses with powerful, easy-to-use tools that transform complex marketing
                data into actionable insights, helping you optimize your ad spend and maximize your
                return on investment.
              </p>
            </div>

            {/* What We Do */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-8 text-center">
                What We Do
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-neutral-200 p-6">
                  <div className="bg-brand-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Target className="h-6 w-6 text-brand-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                    ROI Optimization
                  </h3>
                  <p className="text-neutral-600">
                    Our Marketing ROI Calculator helps you compare current marketing performance
                    against prospective scenarios, enabling you to make data-driven decisions about
                    where to invest your marketing budget.
                  </p>
                </div>

                <div className="bg-white rounded-lg border border-neutral-200 p-6">
                  <div className="bg-brand-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-brand-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                    Performance Insights
                  </h3>
                  <p className="text-neutral-600">
                    Track key metrics like conversion rates, cost per acquisition, and revenue
                    projections in real-time. Visualize your data with intuitive charts and graphs
                    that make complex metrics easy to understand.
                  </p>
                </div>

                <div className="bg-white rounded-lg border border-neutral-200 p-6">
                  <div className="bg-brand-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-brand-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                    Scenario Planning
                  </h3>
                  <p className="text-neutral-600">
                    Test different marketing strategies before investing. Our dual-input calculator
                    lets you model various scenarios and see projected outcomes in both weekly and
                    monthly timeframes.
                  </p>
                </div>

                <div className="bg-white rounded-lg border border-neutral-200 p-6">
                  <div className="bg-brand-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-brand-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                    Business Solutions
                  </h3>
                  <p className="text-neutral-600">
                    Whether you're a small business owner, marketing professional, or agency,
                    our tools are designed to help you make smarter marketing decisions and
                    demonstrate clear ROI to stakeholders.
                  </p>
                </div>
              </div>
            </div>

            {/* Our Story */}
            <div className="bg-white rounded-lg border border-neutral-200 p-8 mb-12">
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                Our Story
              </h2>
              <div className="space-y-4 text-neutral-600">
                <p>
                  AskChad was founded with a simple goal: to make marketing analytics accessible
                  and actionable for businesses of all sizes. We saw too many companies struggling
                  to understand whether their marketing investments were paying off, often relying
                  on gut feelings rather than data.
                </p>
                <p>
                  Our team combines expertise in marketing, data analytics, and software development
                  to create tools that bridge the gap between complex data and practical business
                  decisions. The Marketing ROI Calculator is our flagship product, designed to give
                  you instant clarity on your marketing performance.
                </p>
                <p>
                  We're committed to continuous improvement and innovation, always listening to our
                  users and evolving our tools to meet the changing needs of modern marketing.
                </p>
              </div>
            </div>

            {/* Company Details */}
            <div className="bg-neutral-50 rounded-lg border border-neutral-200 p-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                Company Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Legal Name</h3>
                  <p className="text-neutral-600">AskChad</p>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Address</h3>
                  <p className="text-neutral-600">
                    [Business Address]<br />
                    [City, State ZIP]<br />
                    United States
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Contact</h3>
                  <p className="text-neutral-600">
                    Email: support@askchad.net<br />
                    Phone: (555) 555-5555
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Business Hours</h3>
                  <p className="text-neutral-600">
                    Monday - Friday<br />
                    9:00 AM - 5:00 PM EST
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-12 text-center">
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                Ready to Optimize Your Marketing ROI?
              </h3>
              <p className="text-neutral-600 mb-6">
                Start using our free calculator today and make data-driven marketing decisions.
              </p>
              <a
                href="/"
                className="inline-block bg-brand-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-brand-primary/90 transition-colors"
              >
                Get Started Free
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
