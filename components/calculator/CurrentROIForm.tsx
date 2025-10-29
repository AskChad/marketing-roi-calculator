'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BaselineMetrics } from '@/lib/calculations'
import { Calculator } from 'lucide-react'

const currentROISchema = z.object({
  timePeriod: z.enum(['weekly', 'monthly']),
  currentLeads: z.number().int().positive('Must be positive'),
  currentSales: z.number().int().positive('Must be positive'),
  currentAdSpend: z.number().positive('Must be positive'),
  currentRevenue: z.number().positive('Must be positive'),
})

type CurrentROIFormData = z.infer<typeof currentROISchema>

interface CurrentROIFormProps {
  onSubmit: (data: BaselineMetrics) => void
  initialData?: BaselineMetrics | null
}

export default function CurrentROIForm({ onSubmit, initialData }: CurrentROIFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CurrentROIFormData>({
    resolver: zodResolver(currentROISchema),
    defaultValues: initialData || {
      timePeriod: 'monthly',
      currentLeads: undefined,
      currentSales: undefined,
      currentAdSpend: undefined,
      currentRevenue: undefined,
    },
  })

  const timePeriod = watch('timePeriod')

  const handleFormSubmit = (data: CurrentROIFormData) => {
    onSubmit({
      leads: data.currentLeads,
      sales: data.currentSales,
      adSpend: data.currentAdSpend,
      revenue: data.currentRevenue,
      timePeriod: data.timePeriod,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Time Period Toggle */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          Time Period
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className={`flex items-center justify-center px-4 py-3 border-2 rounded-lg cursor-pointer transition ${
            timePeriod === 'weekly'
              ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
              : 'border-neutral-300 text-neutral-700 hover:border-neutral-400'
          }`}>
            <input
              type="radio"
              value="weekly"
              {...register('timePeriod')}
              className="sr-only"
            />
            <span className="font-medium">Weekly</span>
          </label>
          <label className={`flex items-center justify-center px-4 py-3 border-2 rounded-lg cursor-pointer transition ${
            timePeriod === 'monthly'
              ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
              : 'border-neutral-300 text-neutral-700 hover:border-neutral-400'
          }`}>
            <input
              type="radio"
              value="monthly"
              {...register('timePeriod')}
              className="sr-only"
            />
            <span className="font-medium">Monthly</span>
          </label>
        </div>
      </div>

      {/* Number of Leads */}
      <div>
        <label htmlFor="currentLeads" className="block text-sm font-medium text-neutral-700 mb-2">
          Number of Leads
        </label>
        <input
          type="number"
          id="currentLeads"
          {...register('currentLeads', { valueAsNumber: true })}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition"
          placeholder="5,202"
        />
        {errors.currentLeads && (
          <p className="mt-1 text-sm text-danger">{errors.currentLeads.message}</p>
        )}
      </div>

      {/* Number of Sales */}
      <div>
        <label htmlFor="currentSales" className="block text-sm font-medium text-neutral-700 mb-2">
          Number of Sales
        </label>
        <input
          type="number"
          id="currentSales"
          {...register('currentSales', { valueAsNumber: true })}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition"
          placeholder="308"
        />
        {errors.currentSales && (
          <p className="mt-1 text-sm text-danger">{errors.currentSales.message}</p>
        )}
      </div>

      {/* Total Ad Spend */}
      <div>
        <label htmlFor="currentAdSpend" className="block text-sm font-medium text-neutral-700 mb-2">
          Total Ad Spend ($)
        </label>
        <input
          type="number"
          step="0.01"
          id="currentAdSpend"
          {...register('currentAdSpend', { valueAsNumber: true })}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition"
          placeholder="560,000"
        />
        {errors.currentAdSpend && (
          <p className="mt-1 text-sm text-danger">{errors.currentAdSpend.message}</p>
        )}
      </div>

      {/* Total Revenue */}
      <div>
        <label htmlFor="currentRevenue" className="block text-sm font-medium text-neutral-700 mb-2">
          Total Revenue ($)
        </label>
        <input
          type="number"
          step="0.01"
          id="currentRevenue"
          {...register('currentRevenue', { valueAsNumber: true })}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition"
          placeholder="4,000,000"
        />
        {errors.currentRevenue && (
          <p className="mt-1 text-sm text-danger">{errors.currentRevenue.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center"
      >
        <Calculator className="mr-2 h-5 w-5" />
        Calculate Current Metrics
      </button>
    </form>
  )
}
