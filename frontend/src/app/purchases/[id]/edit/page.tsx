'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, Plus, Trash2, Minus } from 'lucide-react'
import { BackButton } from '@/components/ui/BackButton'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Input'
import { purchaseSchema } from '@/lib/validations/schemas'
import { toast } from '@/components/ui/Toast'
import { useToast } from '@/components/ui/Toast'

type PurchaseForm = {
  invoiceNumber: string
  supplierId: string
  purchaseDate: string
  dueDate: string
  notes: string
  items: Array<{
    productId: string
    variantId: string
    quantity: number
    unitCost: number
  }>
}

export default function EditPurchasePage() {
  const router = useRouter()
  const params = useParams()
  const { addToast } = useToast()
  const purchaseId = params.id as string
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [variants, setVariants] = useState<Record<string, any[]>>({})

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<PurchaseForm>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      invoiceNumber: '',
      supplierId: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      notes: '',
      items: [{
        productId: '',
        variantId: '',
        quantity: 1,
        unitCost: 0,
      }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const watchedItems = watch('items')

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers?limit=100&isActive=true')
      const data = await response.json()
      if (data.success) setSuppliers(data.data)
    } catch (error) {
      console.error('Failed to fetch suppliers')
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=100&status=true')
      const data = await response.json()
      if (data.success) setProducts(data.data)
    } catch (error) {
      console.error('Failed to fetch products')
    }
  }

  const fetchVariants = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/variants?productId=${productId}&limit=100&isActive=true`)
      const data = await response.json()
      if (data.success) {
        setVariants(prev => ({ ...prev, [productId]: data.data }))
      }
    } catch (error) {
      console.error('Failed to fetch variants')
    }
  }

  const fetchPurchase = async () => {
    setLoading(true)
    try {
      const [purchaseRes, suppliersRes, productsRes] = await Promise.all([
        fetch(`/api/purchases/${purchaseId}`),
        fetch('/api/suppliers?limit=100&isActive=true'),
        fetch('/api/products?limit=100&status=true'),
      ])

      const [purchaseData, suppliersData, productsData] = await Promise.all([
        purchaseRes.json(),
        suppliersRes.json(),
        productsRes.json(),
      ])

      if (purchaseData.success) {
        const purchase = purchaseData.data
        reset({
          invoiceNumber: purchase.invoiceNumber,
          supplierId: purchase.supplierId,
          purchaseDate: purchase.purchaseDate?.split('T')[0] || '',
          dueDate: purchase.dueDate?.split('T')[0] || '',
          notes: purchase.notes || '',
          items: purchase.items?.map((item: any) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            unitCost: item.unitCost,
          })) || [],
        })

        if (purchase.items) {
          for (const item of purchase.items) {
            if (item.productId) {
              await fetchVariants(item.productId)
            }
          }
        }
      }

      if (suppliersData.success) setSuppliers(suppliersData.data)
      if (productsData.success) setProducts(productsData.data)
    } catch (error) {
      console.error('Failed to fetch purchase')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPurchase()
  }, [])

  useEffect(() => {
    watchedItems.forEach((item, index) => {
      if (item.productId && !variants[item.productId]) {
        fetchVariants(item.productId)
      }
    })
  }, [watchedItems])

  const onSubmit = async (data: PurchaseForm) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/purchases/${purchaseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          items: data.items.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: Number(item.quantity),
            unitCost: Number(item.unitCost),
          })),
          purchaseDate: new Date(data.purchaseDate).toISOString(),
          dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
        }),
      })

      const result = await response.json()

      if (result.success) {
        addToast({ type: 'success', title: 'Purchase updated', message: result.message })
        router.push(`/purchases`)
      } else {
        addToast({ type: 'error', title: 'Failed to update purchase', message: result.error })
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to update purchase' })
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
        <h1 className="text-2xl font-bold text-secondary-900">Edit Purchase</h1>
        <p className="text-secondary-500 dark:text-secondary-400 mt-1">Update purchase order details</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 shadow-card space-y-6">
          <h3 className="text-lg font-semibold text-secondary-900">Purchase Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Invoice Number"
              placeholder="INV-2024-001"
              error={errors.invoiceNumber?.message}
              {...register('invoiceNumber')}
              required
            />

            <Select
              label="Supplier"
              placeholder="Select supplier"
              error={errors.supplierId?.message}
              options={[{ value: '', label: 'Select supplier' }, ...suppliers.map(s => ({ value: s.id, label: s.name }))]}
              {...register('supplierId')}
              required
            />

            <Input
              label="Purchase Date"
              type="date"
              error={errors.purchaseDate?.message}
              {...register('purchaseDate')}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Due Date"
              type="date"
              error={errors.dueDate?.message}
              {...register('dueDate')}
            />

            <Textarea
              label="Notes"
              placeholder="Additional notes..."
              rows={3}
              error={errors.notes?.message}
              {...register('notes')}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900">Items</h3>
            <Button variant="outline" size="sm" type="button" onClick={() => append({ productId: '', variantId: '', quantity: 1, unitCost: 0 })}>
              <Plus className="w-4 h-4 mr-2" />Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end p-4 bg-secondary-50 dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700">
                <Select
                  label="Product"
                  placeholder="Select product"
                  error={errors.items?.[index]?.productId?.message}
                  options={[{ value: '', label: 'Select product' }, ...products.map(p => ({ value: p.id, label: p.name }))]}
                  {...register(`items.${index}.productId`)}
                  onChange={(e) => {
                    register(`items.${index}.productId`).onChange(e)
                    setValue(`items.${index}.variantId`, '')
                  }}
                />

                <Select
                  label="Variant"
                  placeholder="Select variant"
                  error={errors.items?.[index]?.variantId?.message}
                  options={[{ value: '', label: 'Select variant' }, ...(variants[watch(`items.${index}.productId`)] || []).map(v => ({ value: v.id, label: `${v.size} / ${v.color} (${v.sku})` }))]}
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
                  label="Unit Cost (PKR)"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  error={errors.items?.[index]?.unitCost?.message}
                  {...register(`items.${index}.unitCost`, { valueAsNumber: true })}
                />

                <div className="flex gap-2">
                  {fields.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => remove(index)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="w-4 h-4 text-danger-600" />
                  </Button>
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
                <div className="text-right">
                  <p className="text-sm text-secondary-500 dark:text-secondary-400">Estimated Total</p>
                  <p className="font-medium text-success-600">
                    {watchedItems.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitCost || 0), 0).toLocaleString()}
                  </p>
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