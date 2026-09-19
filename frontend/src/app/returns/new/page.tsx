'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, Plus, Trash2 } from 'lucide-react'
import { BackButton } from '@/components/ui/BackButton'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Input'
import { returnSchema } from '@/lib/validations/schemas'
import { RETURN_REASON_OPTIONS } from '@/types'
import { toast } from '@/components/ui/Toast'
import { useToast } from '@/components/ui/Toast'

type ReturnForm = {
  orderId: string
  customerId: string
  reason: string
  courierId: string
  trackingNumber: string
  notes: string
  items: Array<{
    variantId: string
    quantity: number
    unitPrice: number
    condition: 'SELLABLE' | 'DAMAGED'
    notes: string
  }>
}

export default function NewReturnPageWrapper() {
  return (
    <Suspense fallback={null}>
      <NewReturnPage />
    </Suspense>
  )
}

function NewReturnPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<any[]>([])
  const [couriers, setCouriers] = useState<any[]>([])
  const [variants, setVariants] = useState<Record<string, any[]>>({})

  const defaultValues = {
    orderId: searchParams.get('orderId') || '',
    customerId: '',
    reason: '',
    courierId: '',
    trackingNumber: '',
    notes: '',
    items: [{
      variantId: '',
      quantity: 1,
      unitPrice: 0,
      condition: 'SELLABLE' as const,
      notes: '',
    }],
  }

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ReturnForm>({
    resolver: zodResolver(returnSchema),
    defaultValues,
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const watchedItems = watch('items')

  const fetchData = async () => {
    try {
      const [ordersRes, couriersRes] = await Promise.all([
        fetch('/api/orders?status=DELIVERED&limit=100'),
        fetch('/api/couriers?isActive=true&limit=100'),
      ])

      const [ordersData, couriersData] = await Promise.all([
        ordersRes.json(),
        couriersRes.json(),
      ])

      if (ordersData.success) setOrders(ordersData.data)
      if (couriersData.success) setCouriers(couriersData.data)
    } catch (error) {
      console.error('Failed to fetch data')
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const orderId = watch('orderId')
    if (orderId) {
      // Fetch order details to get customer and items
      fetch(`/api/orders/${orderId}`)
        .then(res => res.json())
        .then(async data => {
          if (data.success) {
            const order = data.data
            setValue('customerId', order.customerId)
            
            // Populate items from order
            if (order.items && order.items.length > 0) {
              const items = order.items.map((item: any) => ({
                variantId: item.variantId,
                quantity: 1,
                unitPrice: item.unitPrice,
                condition: 'SELLABLE' as const,
                notes: '',
              }))
              setValue('items', items)
            }
            
            // Fetch variants for this order's products
            for (const item of order.items || []) {
              const variantRes = await fetch(`/api/products/variants?productId=${item.productId}&limit=100&isActive=true`)
              const variantData = await variantRes.json()
              if (variantData.success) {
                setVariants(prev => ({ ...prev, [item.productId]: variantData.data }))
              }
            }
          }
        })
    } else {
      setValue('customerId', '')
      setValue('items', [{
        variantId: '',
        quantity: 1,
        unitPrice: 0,
        condition: 'SELLABLE' as const,
        notes: '',
      }])
    }
  }, [watch('orderId')])

  const onSubmit = async (data: ReturnForm) => {
    setLoading(true)
    try {
      const response = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          items: data.items.map(item => ({
            variantId: item.variantId,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            condition: item.condition,
            notes: item.notes,
          })),
        }),
      })

      const result = await response.json()

      if (result.success) {
        addToast({ type: 'success', title: 'Return created', message: result.message })
        router.push(`/returns`)
      } else {
        addToast({ type: 'error', title: 'Failed to create return', message: result.error })
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to create return' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <BackButton />
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">New Return</h1>
        <p className="text-secondary-500 dark:text-secondary-400 mt-1">Process a product return from a delivered order</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 shadow-card space-y-6">
          <h3 className="text-lg font-semibold text-secondary-900">Return Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Order"
              placeholder="Select delivered order"
              error={errors.orderId?.message}
              options={[{ value: '', label: 'Select order' }, ...orders.map(o => ({ value: o.id, label: `${o.internalOrderId} - ${o.customer?.name}` }))]}
              {...register('orderId')}
              required
            />

            <Select
              label="Return Reason"
              placeholder="Select reason"
              error={errors.reason?.message}
              options={[{ value: '', label: 'Select reason' }, ...RETURN_REASON_OPTIONS]}
              {...register('reason')}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Courier (for return pickup)"
              placeholder="Select courier"
              error={errors.courierId?.message}
              options={[{ value: '', label: 'Select courier' }, ...couriers.map(c => ({ value: c.id, label: c.name }))]}
              {...register('courierId')}
            />

            <Input
              label="Tracking Number"
              placeholder="Return tracking number"
              error={errors.trackingNumber?.message}
              {...register('trackingNumber')}
            />
          </div>

          <Input
            label="Notes"
            placeholder="Additional notes..."
            error={errors.notes?.message}
            {...register('notes')}
          />
        </div>

        <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900">Return Items</h3>
            <Button variant="outline" size="sm" type="button" onClick={() => append({ variantId: '', quantity: 1, unitPrice: 0, condition: 'SELLABLE' as const, notes: '' })}>
              <Plus className="w-4 h-4 mr-2" />Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end p-4 bg-secondary-50 dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700">
                <Select
                  label="Product Variant"
                  placeholder="Select variant"
                  error={errors.items?.[index]?.variantId?.message}
                  options={[{ value: '', label: 'Select variant' }, ...(variants[watch(`items.${index}.variantId`)] || []).map(v => ({ value: v.id, label: `${v.product?.name} - ${v.size}/${v.color} (${v.sku})` }))]}
                  {...register(`items.${index}.variantId`)}
                />

                <Input
                  label="Quantity"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="1"
                  error={errors.items?.[index]?.quantity?.message}
                  {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                />

                <Input
                  label="Unit Price (PKR)"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  error={errors.items?.[index]?.unitPrice?.message}
                  {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                />

                <Select
                  label="Condition"
                  error={errors.items?.[index]?.condition?.message}
                  options={[
                    { value: 'SELLABLE', label: 'Sellable' },
                    { value: 'DAMAGED', label: 'Damaged' },
                  ]}
                  {...register(`items.${index}.condition`)}
                />

                <Input
                  label="Notes"
                  placeholder="Notes"
                  {...register(`items.${index}.notes`)}
                />

                <div className="flex gap-2">
                  {fields.length > 1 && (
                    <Button variant="ghost" size="icon" type="button" onClick={() => remove(index)}>
                      <Trash2 className="w-4 h-4 text-danger-600" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {fields.length > 0 && (
            <div className="mt-6 pt-4 border-t border-secondary-200 dark:border-secondary-700">
              <div className="grid grid-cols-3 gap-4 md:grid-cols-5">
                <div className="md:col-span-3"></div>
                <div className="text-right">
                  <p className="text-sm text-secondary-500 dark:text-secondary-400">Total Items</p>
                  <p className="font-medium">{fields.length}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-secondary-500 dark:text-secondary-400">Total Quantity</p>
                  <p className="font-medium">{watchedItems.reduce((sum, item) => sum + (item.quantity || 0), 0)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            <Save className="w-4 h-4 mr-2" />Create Return
          </Button>
        </div>
      </form>
    </div>
  )
}