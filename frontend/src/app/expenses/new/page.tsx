'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save } from 'lucide-react'
import { BackButton } from '@/components/ui/BackButton'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Input'
import { expenseSchema } from '@/lib/validations/schemas'
import { EXPENSE_CATEGORY_OPTIONS, PAYMENT_METHOD_OPTIONS } from '@/types'
import { toast } from '@/components/ui/Toast'
import { useToast } from '@/components/ui/Toast'

type ExpenseForm = {
  category: string
  amount: number
  date: string
  description: string
  paymentMethod: string
  reference: string
  receiptUrl: string
  notes: string
  isRecurring: boolean
  recurringPeriod: string
}

export default function NewExpensePage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      description: '',
      paymentMethod: 'CASH',
      reference: '',
      receiptUrl: '',
      notes: '',
      isRecurring: false,
      recurringPeriod: '',
    },
  })

  const isRecurring = watch('isRecurring')

  const onSubmit = async (data: ExpenseForm) => {
    setLoading(true)
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          amount: Number(data.amount),
          date: new Date(data.date).toISOString(),
        }),
      })

      const result = await response.json()

      if (result.success) {
        addToast({ type: 'success', title: 'Expense created', message: result.message })
        router.push('/expenses')
      } else {
        addToast({ type: 'error', title: 'Failed to create expense', message: result.error })
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to create expense' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <BackButton />
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">New Expense</h1>
        <p className="text-secondary-500 dark:text-secondary-400 mt-1">Record a new business expense</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 shadow-card space-y-6">
          <h3 className="text-lg font-semibold text-secondary-900">Expense Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Category"
              placeholder="Select category"
              error={errors.category?.message}
              options={[{ value: '', label: 'Select category' }, ...EXPENSE_CATEGORY_OPTIONS]}
              {...register('category')}
              required
            />

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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              error={errors.date?.message}
              {...register('date')}
              required
            />

            <Select
              label="Payment Method"
              placeholder="Select method"
              error={errors.paymentMethod?.message}
              options={PAYMENT_METHOD_OPTIONS}
              {...register('paymentMethod')}
            />
          </div>

          <Input
            label="Description"
            placeholder="What was this expense for?"
            error={errors.description?.message}
            {...register('description')}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Reference"
              placeholder="Invoice/Receipt number"
              error={errors.reference?.message}
              {...register('reference')}
            />

            <Input
              label="Receipt URL (optional)"
              type="url"
              placeholder="https://..."
              error={errors.receiptUrl?.message}
              {...register('receiptUrl')}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isRecurring"
              {...register('isRecurring')}
              className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="isRecurring" className="text-sm text-secondary-700 cursor-pointer">
              Recurring Expense
            </label>
          </div>

          {isRecurring && (
            <Select
              label="Recurring Period"
              placeholder="Select period"
              error={errors.recurringPeriod?.message}
              options={[
                { value: 'MONTHLY', label: 'Monthly' },
                { value: 'QUARTERLY', label: 'Quarterly' },
                { value: 'YEARLY', label: 'Yearly' },
              ]}
              {...register('recurringPeriod')}
            />
          )}

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
          <Button type="submit" isLoading={loading}>
            <Save className="w-4 h-4 mr-2" />Create Expense
          </Button>
        </div>
      </form>
    </div>
  )
}