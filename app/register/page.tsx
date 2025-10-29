'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { Loader2, UserPlus } from 'lucide-react'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required (minimum 10 digits)'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          phone: data.phone,
          password: data.password,
        }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Registration failed')
      }

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.')
      console.error('Registration error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Header showLogin={true} />

      <main className="min-h-screen bg-gradient-to-br from-neutral-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-neutral-900 mb-3">
                Create Free Account
              </h1>
              <p className="text-neutral-600">
                Unlock unlimited scenarios, AI insights, and platform tracking
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 border border-neutral-200">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <div className="p-4 bg-danger-light/20 border border-danger text-danger-dark rounded-lg">
                    {error}
                  </div>
                )}

                {/* Email */}
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

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2">
                    Phone <span className="text-danger">*</span>
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
                  <p className="mt-1 text-xs text-neutral-500">
                    Phone is required to create an account
                  </p>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                    Password <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    {...register('password')}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition"
                    placeholder="••••••••"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-danger">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                    Confirm Password <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    {...register('confirmPassword')}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition"
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-danger">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-5 w-5" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-5 w-5" />
                      Create Account
                    </>
                  )}
                </button>
              </form>

              {/* Login Link */}
              <div className="mt-6 pt-6 border-t border-neutral-200 text-center">
                <p className="text-sm text-neutral-600">
                  Already have an account?{' '}
                  <Link href="/login" className="text-brand-primary hover:underline font-medium">
                    Login here
                  </Link>
                </p>
              </div>
            </div>

            {/* Benefits Reminder */}
            <div className="mt-6 p-4 bg-brand-primary/5 border border-brand-primary/20 rounded-lg">
              <p className="text-sm text-neutral-700 text-center">
                <strong className="text-brand-primary">Free account includes:</strong> Unlimited scenarios,
                AI chat, platform tracking, history, and more!
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
