'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  companyName: z.string().min(1, 'Company name is required').max(255),
  websiteUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
})

type ContactFormData = z.infer<typeof contactSchema>

export default function ContactForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

    try {
      // Submit to API endpoint
      const response = await fetch('/api/lead-capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to submit form')
      }

      const result = await response.json()

      // Store lead capture ID in session storage for calculator page
      if (result.leadCaptureId) {
        sessionStorage.setItem('leadCaptureId', result.leadCaptureId)
      }

      // Sync tracking_id to localStorage if returned (for existing email reuse)
      if (result.trackingId) {
        localStorage.setItem('roi_tracking_id', result.trackingId)
        console.log('Synced tracking_id from server:', result.trackingId)
      }

      // Redirect to calculator
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
          Email <span className="text-danger">*</span>
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

      {/* Phone Field (Optional) */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2">
          Phone <span className="text-neutral-400">(Optional)</span>
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
