'use client'

import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useBrand } from '@/lib/brand/BrandContext'

// Create schema factory based on A2P compliance setting
const createContactSchema = (a2pEnabled: boolean) => {
  if (a2pEnabled) {
    // A2P Mode: Email and Phone optional, SMS checkboxes shown
    return z.object({
      firstName: z.string().min(1, 'First name is required').max(100),
      lastName: z.string().min(1, 'Last name is required').max(100),
      email: z.string().email('Invalid email address').optional().or(z.literal('')),
      phone: z.string().optional(),
      companyName: z.string().min(1, 'Company name is required').max(255),
      websiteUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
      smsOptInMarketing: z.boolean().optional(),
      smsOptInTransactional: z.boolean().optional(),
    })
  } else {
    // Non-A2P Mode: Email and Phone required, no SMS checkboxes
    return z.object({
      firstName: z.string().min(1, 'First name is required').max(100),
      lastName: z.string().min(1, 'Last name is required').max(100),
      email: z.string().email('Invalid email address'),
      phone: z.string().min(1, 'Phone number is required'),
      companyName: z.string().min(1, 'Company name is required').max(255),
      websiteUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
    })
  }
}

type ContactFormData = z.infer<ReturnType<typeof createContactSchema>>

export default function ContactForm() {
  const router = useRouter()
  const brand = useBrand()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create schema based on brand's A2P compliance setting
  const contactSchema = useMemo(
    () => createContactSchema(brand.a2p_compliance_enabled ?? true),
    [brand.a2p_compliance_enabled]
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    setError(null)

    console.log('[ContactForm] Submitting data:', data)

    try {
      // Submit to API endpoint
      const response = await fetch('/api/lead-capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      console.log('[ContactForm] Response status:', response.status)

      if (!response.ok) {
        // Try to get error details from response
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('[ContactForm] Error response:', errorData)
        throw new Error(errorData.error || errorData.details || 'Failed to submit form')
      }

      const result = await response.json()
      console.log('[ContactForm] Success response:', result)

      // Store lead capture ID in session storage for calculator page
      if (result.leadCaptureId) {
        sessionStorage.setItem('leadCaptureId', result.leadCaptureId)
        console.log('[ContactForm] ✅ Stored leadCaptureId in sessionStorage:', result.leadCaptureId)
      } else {
        console.warn('[ContactForm] ⚠️ No leadCaptureId in response!')
      }

      // Sync tracking_id to localStorage if returned (for existing email reuse)
      if (result.trackingId) {
        localStorage.setItem('roi_tracking_id', result.trackingId)
        console.log('[ContactForm] ✅ Stored trackingId in localStorage:', result.trackingId)
      } else {
        console.warn('[ContactForm] ⚠️ No trackingId in response!')
      }

      // Redirect to calculator
      console.log('[ContactForm] 🚀 Redirecting to /calculator...')
      router.push('/calculator')
    } catch (err) {
      setError('Failed to submit form. Please try again.')
      console.error('Form submission error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 bg-danger-light/20 border border-danger text-danger-dark rounded-lg">
          {error}
        </div>
      )}

      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-neutral-700 mb-2">
            First Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            {...register('firstName')}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition"
            placeholder="John"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-danger">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-neutral-700 mb-2">
            Last Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            {...register('lastName')}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition"
            placeholder="Doe"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-danger">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
          Email{' '}
          {brand.a2p_compliance_enabled ? (
            <span className="text-neutral-400">(Optional)</span>
          ) : (
            <span className="text-danger">*</span>
          )}
        </label>
        <input
          type="email"
          id="email"
          {...register('email')}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition"
          placeholder="john@company.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-danger">{errors.email.message}</p>
        )}
      </div>

      {/* Phone Field */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2">
          Phone{' '}
          {brand.a2p_compliance_enabled ? (
            <span className="text-neutral-400">(Optional)</span>
          ) : (
            <span className="text-danger">*</span>
          )}
        </label>
        <input
          type="tel"
          id="phone"
          {...register('phone')}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition"
          placeholder="+1 (555) 123-4567"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-danger">{errors.phone.message}</p>
        )}
      </div>

      {/* Company Name */}
      <div>
        <label htmlFor="companyName" className="block text-sm font-medium text-neutral-700 mb-2">
          Company Name <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          id="companyName"
          {...register('companyName')}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition"
          placeholder="Acme Inc."
        />
        {errors.companyName && (
          <p className="mt-1 text-sm text-danger">{errors.companyName.message}</p>
        )}
      </div>

      {/* Website URL (Optional) */}
      <div>
        <label htmlFor="websiteUrl" className="block text-sm font-medium text-neutral-700 mb-2">
          Website <span className="text-neutral-400">(Optional)</span>
        </label>
        <input
          type="url"
          id="websiteUrl"
          {...register('websiteUrl')}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition"
          placeholder="https://example.com"
        />
        {errors.websiteUrl && (
          <p className="mt-1 text-sm text-danger">{errors.websiteUrl.message}</p>
        )}
      </div>

      {/* SMS Opt-In (A2P 10DLC Compliant) - Only show when A2P compliance is enabled */}
      {brand.a2p_compliance_enabled && (
        <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50 space-y-4">
          <div className="text-sm font-medium text-neutral-900 mb-3">
            SMS Messaging Preferences (Optional)
          </div>

          {/* Marketing SMS */}
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              {...register('smsOptInMarketing')}
              className="mt-1 h-4 w-4 text-brand-primary border-neutral-300 rounded focus:ring-2 focus:ring-brand-primary"
            />
            <span className="ml-3 text-sm text-neutral-700">
              I agree to receive automated marketing text messages from AskChad at the phone number provided.
              Message frequency varies. Message & data rates may apply. Reply HELP for help, STOP to end.{' '}
              <Link href="/sms-terms" target="_blank" className="text-brand-primary hover:underline font-medium">
                Terms
              </Link>
              {' '}&{' '}
              <Link href="/privacy" target="_blank" className="text-brand-primary hover:underline font-medium">
                Privacy Policy
              </Link>
              {' '}apply.
            </span>
          </label>

          {/* Transactional SMS */}
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              {...register('smsOptInTransactional')}
              className="mt-1 h-4 w-4 text-brand-primary border-neutral-300 rounded focus:ring-2 focus:ring-brand-primary"
            />
            <span className="ml-3 text-sm text-neutral-700">
              I agree to receive automated transactional and service-based text messages from AskChad at the phone number provided.
              Message frequency varies. Message & data rates may apply. Reply HELP for help, STOP to end.{' '}
              <Link href="/sms-terms" target="_blank" className="text-brand-primary hover:underline font-medium">
                Terms
              </Link>
              {' '}&{' '}
              <Link href="/privacy" target="_blank" className="text-brand-primary hover:underline font-medium">
                Privacy Policy
              </Link>
              {' '}apply.
            </span>
          </label>

          <p className="text-xs text-neutral-500 pt-2 border-t border-neutral-200">
            Optional. Consent is not a condition of purchase or use of our calculator.
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-hover transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin mr-2 h-5 w-5" />
            Submitting...
          </>
        ) : (
          'Get Started - Calculate Your ROI'
        )}
      </button>

      {/* Login Link */}
      <p className="text-center text-sm text-neutral-600">
        Already have an account?{' '}
        <Link href="/login" className="text-brand-primary hover:underline font-medium">
          Click here to login
        </Link>
      </p>
    </form>
  )
}
