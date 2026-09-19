'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save } from 'lucide-react'
import { BackButton } from '@/components/ui/BackButton'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Input'
import { marketingExpenseSchema } from '@/lib/validations/schemas'
import { toast } from '@/components/ui/Toast'
import { useToast } from '@/components/ui/Toast'

type MarketingForm = {
  platform: string
  campaignName: string
  adSetName: string
  adName: string
  date: string
  amount: number
  impressions: number
  clicks: number
  conversions: number
  cpm: number
  cpc: number
  cpa: number
  roas: number
  notes: string
  externalId: string
}

export default function EditMarketingPage() {
  const router = useRouter()
  const params = useParams()
  const { addToast } = useToast()
  const marketingId = params.id as string
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MarketingForm>({
    resolver: zodResolver(marketingExpenseSchema),
    defaultValues: {
      platform: 'FACEBOOK',
      campaignName: '',
      adSetName: '',
      adName: '',
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      cpm: 0,
      cpc: 0,
      cpa: 0,
      roas: 0,
      notes: '',
      externalId: '',
    },
  })

  const fetchMarketing = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/marketing/${marketingId}`)
      const data = await response.json()

      if (data.success) {
        const marketing = data.data
        reset({
          platform: marketing.platform,
          campaignName: marketing.campaignName || '',
          adSetName: marketing.adSetName || '',
          adName: marketing.adName || '',
          date: marketing.date?.split('T')[0] || '',
          amount: marketing.amount,
          impressions: marketing.impressions || 0,
          clicks: marketing.clicks || 0,
          conversions: marketing.conversions || 0,
          cpm: marketing.cpm || 0,
          cpc: marketing.cpc || 0,
          cpa: marketing.cpa || 0,
          roas: marketing.roas || 0,
          notes: marketing.notes || '',
          externalId: marketing.externalId || '',
        })
      }
    } catch (error) {
      console.error('Failed to fetch marketing expense')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMarketing()
  }, [])

  const onSubmit = async (data: MarketingForm) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/marketing/${marketingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          amount: Number(data.amount),
          date: new Date(data.date).toISOString(),
          impressions: Number(data.impressions) || 0,
          clicks: Number(data.clicks) || 0,
          conversions: Number(data.conversions) || 0,
          cpm: Number(data.cpm) || 0,
          cpc: Number(data.cpc) || 0,
          cpa: Number(data.cpa) || 0,
          roas: Number(data.roas) || 0,
        }),
      })

      const result = await response.json()

      if (result.success) {
        addToast({ type: 'success', title: 'Campaign updated', message: result.message })
        router.push('/marketing')
      } else {
        addToast({ type: 'error', title: 'Failed to update campaign', message: result.error })
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to update campaign' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <BackButton />
      <div>
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Edit Marketing Campaign</h1>
        <p className="text-secondary-500 dark:text-secondary-400 mt-1">Update campaign details</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 shadow-card space-y-6">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">Campaign Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Platform"
              placeholder="Select platform"
              error={errors.platform?.message}
              options={[
                { value: 'FACEBOOK', label: 'Facebook' },
                { value: 'INSTAGRAM', label: 'Instagram' },
                { value: 'GOOGLE', label: 'Google Ads' },
                { value: 'OTHER', label: 'Other' },
              ]}
              {...register('platform')}
            />

            <Input
              label="Date"
              type="date"
              error={errors.date?.message}
              {...register('date')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Amount (PKR)"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              error={errors.amount?.message}
              {...register('amount', { valueAsNumber: true })}
            />

            <Input
              label="Campaign Name"
              placeholder="e.g., Summer Sale 2024"
              error={errors.campaignName?.message}
              {...register('campaignName')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Ad Set Name"
              placeholder="e.g., Retargeting"
              error={errors.adSetName?.message}
              {...register('adSetName')}
            />

            <Input
              label="Ad Name"
              placeholder="e.g., Carousel Ad 1"
              error={errors.adName?.message}
              {...register('adName')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Impressions"
              type="number"
              min="0"
              placeholder="0"
              error={errors.impressions?.message}
              {...register('impressions', { valueAsNumber: true })}
            />

            <Input
              label="Clicks"
              type="number"
              min="0"
              placeholder="0"
              error={errors.clicks?.message}
              {...register('clicks', { valueAsNumber: true })}
            />

            <Input
              label="Conversions"
              type="number"
              min="0"
              placeholder="0"
              error={errors.conversions?.message}
              {...register('conversions', { valueAsNumber: true })}
            />

            <Input
              label="External ID (Meta Campaign ID)"
              placeholder="1234567890"
              error={errors.externalId?.message}
              {...register('externalId')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="CPM (PKR)"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              error={errors.cpm?.message}
              {...register('cpm', { valueAsNumber: true })}
            />

            <Input
              label="CPC (PKR)"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              error={errors.cpc?.message}
              {...register('cpc', { valueAsNumber: true })}
            />

            <Input
              label="CPA (PKR)"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              error={errors.cpa?.message}
              {...register('cpa', { valueAsNumber: true })}
            />

            <Input
              label="ROAS"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              error={errors.roas?.message}
              {...register('roas', { valueAsNumber: true })}
            />
          </div>

          <Textarea
            label="Notes"
            placeholder="Additional notes..."
            rows={3}
            error={errors.notes?.message}
            {...register('notes')}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" isLoading={saving}>
            <Save className="w-4 h-4 mr-2" />Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}