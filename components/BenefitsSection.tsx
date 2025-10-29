import { Bot, TrendingUp, Target } from 'lucide-react'

export default function BenefitsSection() {
  const benefits = [
    {
      icon: TrendingUp,
      title: 'Historical Data Tracking',
      description: 'Save unlimited scenarios and track your ROI performance over time. Compare past vs present to identify trends.',
    },
    {
      icon: Bot,
      title: 'AI ROI Assistant',
      description: 'Chat with our AI to analyze your data, get personalized recommendations, and model "what-if" scenarios.',
    },
    {
      icon: Target,
      title: 'Platform Breakdown Analysis',
      description: 'Track Facebook, Google, LinkedIn separately. Compare platform ROI and optimize your budget allocation.',
    },
  ]

  return (
    <div className="mt-12 pt-8 border-t border-neutral-200">
      <h3 className="text-2xl font-bold text-neutral-900 text-center mb-8">
        Why Create an Account?
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon
          return (
            <div
              key={index}
              className="p-6 bg-gradient-to-br from-neutral-50 to-white border border-neutral-200 rounded-lg hover:shadow-lg transition"
            >
              <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Icon className="h-6 w-6 text-brand-primary" />
              </div>
              <h4 className="text-lg font-semibold text-neutral-900 mb-2">
                {benefit.title}
              </h4>
              <p className="text-neutral-600 text-sm leading-relaxed">
                {benefit.description}
              </p>
            </div>
          )
        })}
      </div>

      <div className="mt-8 p-6 bg-brand-primary/5 border border-brand-primary/20 rounded-lg">
        <p className="text-center text-neutral-700">
          <strong className="text-brand-primary">Free Account Features:</strong> Save scenarios,
          view history, platform breakdown, AI chat, comparison tools, and more!
        </p>
      </div>
    </div>
  )
}
