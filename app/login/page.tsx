'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { Loader2, LogIn } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Login failed')
      }

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please try again.')
      console.error('Login error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Header showLogin={false} />

      <main className="min-h-screen bg-gradient-to-br from-neutral-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-neutral-900 mb-3">
                Welcome Back
              </h1>
              <p className="text-neutral-600">
                Login to access your ROI scenarios and insights
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
                    Email
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

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                    Password
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

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-5 w-5" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-5 w-5" />
                      Login
                    </>
                  )}
                </button>
              </form>

              {/* Register Link */}
              <div className="mt-6 pt-6 border-t border-neutral-200 text-center">
                <p className="text-sm text-neutral-600">
                  Don't have an account?{' '}
                  <Link href="/register" className="text-brand-primary hover:underline font-medium">
                    Create free account
                  </Link>
                </p>
              </div>
            </div>

            {/* Back to Calculator */}
            <div className="mt-6 text-center">
              <Link href="/calculator" className="text-sm text-neutral-600 hover:text-brand-primary transition">
                ← Back to Calculator
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
