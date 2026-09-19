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
import { taxRecordSchema } from '@/lib/validations/schemas'
import { TAX_STATUS_OPTIONS } from '@/types'
import { toast } from '@/components/ui/Toast'
import { useToast } from '@/components/ui/Toast'

type TaxForm = {
  taxType: string
  period: string
  amount: number
  dueDate: string
  paidDate: string
  status: string
  reference: string
  challanNo: string
  notes: string
  attachmentUrl: string
}

export default function EditTaxPage() {
  const router = useRouter()
  const params = useParams()
  const { addToast } = useToast()
  const taxId = params.id as string
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<TaxForm>({
    resolver: zodResolver(taxRecordSchema),
    defaultValues: {
      taxType: '',
      period: '',
      amount: 0,
      dueDate: new Date().toISOString().split('T')[0],
      paidDate: '',
      status: 'PENDING',
      reference: '',
      challanNo: '',
      notes: '',
      attachmentUrl: '',
    },
  })

  const status = watch('status')

  const fetchTax = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/taxes/${taxId}`)
      const data = await response.json()

      if (data.success) {
        const tax = data.data
        reset({
          taxType: tax.taxType,
          period: tax.period,
          amount: tax.amount,
          dueDate: tax.dueDate?.split('T')[0] || '',
          paidDate: tax.paidDate?.split('T')[0] || '',
          status: tax.status,
          reference: tax.reference || '',
          challanNo: tax.challanNo || '',
          notes: tax.notes || '',
          attachmentUrl: tax.attachmentUrl || '',
        })
      }
    } catch (error) {
      console.error('Failed to fetch tax record')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTax()
  }, [])

  const onSubmit = async (data: TaxForm) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/taxes/${taxId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          amount: Number(data.amount),
          dueDate: new Date(data.dueDate).toISOString(),
          paidDate: data.paidDate ? new Date(data.paidDate).toISOString() : undefined,
        }),
      })

      const result = await response.json()

      if (result.success) {
        addToast({ type: 'success', title: 'Tax record updated', message: result.message })
        router.push('/taxes')
      } else {
        addToast({ type: 'error', title: 'Failed to update tax record', message: result.error })
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to update tax record' })
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
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Edit Tax Record</h1>
        <p className="text-secondary-500 dark:text-secondary-400 mt-1">Update tax details</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 shadow-card space-y-6">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">Tax Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tax Type"
              placeholder="e.g., GST, Income Tax, Professional Tax"
              error={errors.taxType?.message}
              {...register('taxType')}
              required
            />

            <Input
              label="Period"
              placeholder="e.g., 2024-01, 2024-Q1, 2024"
              error={errors.period?.message}
              {...register('period')}
              required
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
              required
            />

            <Input
              label="Due Date"
              type="date"
              error={errors.dueDate?.message}
              {...register('dueDate')}
              required
            />
          </div>

          <Select
            label="Status"
            error={errors.status?.message}
            options={TAX_STATUS_OPTIONS}
            {...register('status')}
          />

          {status === 'PAID' && (
            <Input
              label="Paid Date"
              type="date"
              error={errors.paidDate?.message}
              {...register('paidDate')}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Reference"
              placeholder="Payment reference"
              error={errors.reference?.message}
              {...register('reference')}
            />

            <Input
              label="Challan Number"
              placeholder="Challan/CIN number"
              error={errors.challanNo?.message}
              {...register('challanNo')}
            />
          </div>

          <Input
            label="Attachment URL (optional)"
            type="url"
            placeholder="https://... (tax challan/receipt)"
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