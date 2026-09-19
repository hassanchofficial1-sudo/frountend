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
import { electricityBillSchema } from '@/lib/validations/schemas'
import { toast } from '@/components/ui/Toast'
import { useToast } from '@/components/ui/Toast'

type ElectricityForm = {
  meterNumber: string
  previousReading: number
  currentReading: number
  billAmount: number
  billDate: string
  dueDate: string
  paymentMethod: string
  paymentReference: string
  notes: string
  attachmentUrl: string
}

export default function EditElectricityPage() {
  const router = useRouter()
  const params = useParams()
  const { addToast } = useToast()
  const electricityId = params.id as string
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<ElectricityForm>({
    resolver: zodResolver(electricityBillSchema),
    defaultValues: {
      meterNumber: '',
      previousReading: 0,
      currentReading: 0,
      billAmount: 0,
      billDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      paymentMethod: '',
      paymentReference: '',
      notes: '',
      attachmentUrl: '',
    },
  })

  const previousReading = watch('previousReading')
  const currentReading = watch('currentReading')
  const unitsConsumed = currentReading - previousReading

  const fetchElectricity = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/electricity/${electricityId}`)
      const data = await response.json()

      if (data.success) {
        const bill = data.data
        reset({
          meterNumber: bill.meterNumber,
          previousReading: bill.previousReading,
          currentReading: bill.currentReading,
          billAmount: bill.billAmount,
          billDate: bill.billDate?.split('T')[0] || '',
          dueDate: bill.dueDate?.split('T')[0] || '',
          paymentMethod: bill.paymentMethod || '',
          paymentReference: bill.paymentReference || '',
          notes: bill.notes || '',
          attachmentUrl: bill.attachmentUrl || '',
        })
      }
    } catch (error) {
      console.error('Failed to fetch electricity bill')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchElectricity()
  }, [])

  const onSubmit = async (data: ElectricityForm) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/electricity/${electricityId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          previousReading: Number(data.previousReading),
          currentReading: Number(data.currentReading),
          billAmount: Number(data.billAmount),
          billDate: new Date(data.billDate).toISOString(),
          dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
        }),
      })

      const result = await response.json()

      if (result.success) {
        addToast({ type: 'success', title: 'Bill updated', message: result.message })
        router.push('/electricity')
      } else {
        addToast({ type: 'error', title: 'Failed to update bill', message: result.error })
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to update bill' })
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
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Edit Electricity Bill</h1>
        <p className="text-secondary-500 dark:text-secondary-400 mt-1">Update bill details</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 shadow-card space-y-6">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">Bill Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Meter Number"
              placeholder="e.g., MET-12345"
              error={errors.meterNumber?.message}
              {...register('meterNumber')}
              required
            />

            <Input
              label="Bill Date"
              type="date"
              error={errors.billDate?.message}
              {...register('billDate')}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Previous Reading"
              type="number"
              min="0"
              step="1"
              placeholder="12450"
              error={errors.previousReading?.message}
              {...register('previousReading', { valueAsNumber: true })}
              required
            />

            <Input
              label="Current Reading"
              type="number"
              min="0"
              step="1"
              placeholder="13120"
              error={errors.currentReading?.message}
              {...register('currentReading', { valueAsNumber: true })}
              required
            />

            <div className="flex items-end">
              <div className="w-full">
                <label className="block text-sm font-medium text-secondary-700 mb-1">Units Consumed</label>
                <input
                  type="text"
                  value={unitsConsumed >= 0 ? unitsConsumed : 0}
                  readOnly
                  className="w-full px-4 py-2.5 rounded-lg border border-secondary-300 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Bill Amount (PKR)"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              error={errors.billAmount?.message}
              {...register('billAmount', { valueAsNumber: true })}
              required
            />

            <Input
              label="Due Date"
              type="date"
              error={errors.dueDate?.message}
              {...register('dueDate')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Payment Method"
              placeholder="Select method"
              options={[
                { value: '', label: 'Not Paid Yet' },
                { value: 'CASH', label: 'Cash' },
                { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
                { value: 'CARD', label: 'Card' },
                { value: 'MOBILE_WALLET', label: 'Mobile Wallet' },
                { value: 'CHEQUE', label: 'Cheque' },
                { value: 'OTHER', label: 'Other' },
              ]}
              {...register('paymentMethod')}
            />

            <Input
              label="Payment Reference"
              placeholder="Transaction ID / Cheque number"
              error={errors.paymentReference?.message}
              {...register('paymentReference')}
            />
          </div>

          <Input
            label="Attachment URL (optional)"
            type="url"
            placeholder="https://... (scanned bill)"
            error={errors.attachmentUrl?.message}
            {...register('attachmentUrl')}
          />

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