'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, Plus, Trash2 } from 'lucide-react'
import { BackButton } from '@/components/ui/BackButton'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Input'
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
  refundAmount: number
  refundStatus: string
  items: Array<{
    variantId: string
    quantity: number
    unitPrice: number
    condition: string
    notes: string
  }>
}

export default function EditReturnPage() {
  const router = useRouter()
  const params = useParams()
  const { addToast } = useToast()
  const returnId = params.id as string
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [orders, setOrders] = useState<any[]>([])
  const [couriers, setCouriers] = useState<any[]>([])
  const [variants, setVariants] = useState<Record<string, any[]>>({})

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<ReturnForm>({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      orderId: '',
      customerId: '',
      reason: '',
      courierId: '',
      trackingNumber: '',
      notes: '',
      refundAmount: 0,
      refundStatus: 'UNPAID',
      items: [{
        variantId: '',
        quantity: 1,
        unitPrice: 0,
        condition: 'SELLABLE',
        notes: '',
      }],
    },
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

  const fetchReturn = async () => {
    setLoading(true)
    try {
      const [returnRes, ordersData, couriersData] = await Promise.all([
        fetch(`/api/returns/${returnId}`),
        fetch('/api/orders?status=DELIVERED&limit=100'),
        fetch('/api/couriers?isActive=true&limit=100'),
      ])

      const [returnData, ordersResData, couriersResData] = await Promise.all([
        returnRes.json(),
        ordersData.json(),
        couriersData.json(),
      ])

      if (returnData.success) {
        const returnRecord = returnData.data
        reset({
          orderId: returnRecord.orderId,
          customerId: returnRecord.customerId,
          reason: returnRecord.reason,
          courierId: returnRecord.courierId || '',
          trackingNumber: returnRecord.trackingNumber || '',
          notes: returnRecord.notes || '',
          refundAmount: returnRecord.refundAmount,
          refundStatus: returnRecord.refundStatus,
          items: returnRecord.items?.map((item: any) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            condition: item.condition,
            notes: item.notes || '',
          })) || [],
        })

        if (returnRecord.items) {
          for (const item of returnRecord.items) {
            if (item.product?.id) {
              const variantRes = await fetch(`/api/products/variants?productId=${item.product.id}&limit=100&isActive=true`)
              const variantData = await variantRes.json()
              if (variantData.success) {
                setVariants(prev => ({ ...prev, [item.product.id]: variantData.data }))
              }
            }
          }
        }
      }

      if (ordersResData.success) setOrders(ordersResData.data)
      if (couriersResData.success) setCouriers(couriersResData.data)
    } catch (error) {
      console.error('Failed to fetch return')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    fetchReturn()
  }, [])

  useEffect(() => {
    const orderId = watch('orderId')
    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then(res => res.json())
        .then(async data => {
          if (data.success) {
            const order = data.data
            setValue('customerId', order.customerId)

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
    setSaving(true)
    try {
      const response = await fetch(`/api/returns/${returnId}`, {
        method: 'PUT',
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
        addToast({ type: 'success', title: 'Return updated', message: result.message })
        router.push(`/returns`)
      } else {
        addToast({ type: 'error', title: 'Failed to update return', message: result.error })
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to update return' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <BackButton />
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Edit Return</h1>
        <p className="text-secondary-500 dark:text-secondary-400 mt-1">Update return details</p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Refund Amount (PKR)"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              error={errors.refundAmount?.message}
              {...register('refundAmount', { valueAsNumber: true })}
            />

            <Select
              label="Refund Status"
              error={errors.refundStatus?.message}
              options={[
                { value: 'UNPAID', label: 'Unpaid' },
                { value: 'PARTIAL', label: 'Partial' },
                { value: 'PAID', label: 'Paid' },
                { value: 'REFUNDED', label: 'Refunded' },
                { value: 'PARTIALLY_REFUNDED', label: 'Partially Refunded' },
              ]}
              {...register('refundStatus')}
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

        <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900">Return Items</h3>
            <Button variant="outline" size="sm" type="button" onClick={() => append({ variantId: '', quantity: 1, unitPrice: 0, condition: 'SELLABLE', notes: '' })}>
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
          <Button type="submit" isLoading={saving}>
            <Save className="w-4 h-4 mr-2" />Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}