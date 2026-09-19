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
import { productVariantSchema } from '@/lib/validations/schemas'
import { toast } from '@/components/ui/Toast'
import { useToast } from '@/components/ui/Toast'

type VariantForm = {
  size: string
  color: string
  sku: string
  barcode: string
  purchasePrice: number
  sellingPrice: number
  stockQuantity: number
  minStockLevel: number
  weight: number
  dimensions: string
  isActive: boolean
}

export default function NewVariantPage() {
  const router = useRouter()
  const params = useParams()
  const { addToast } = useToast()
  const productId = params.id as string
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VariantForm>({
    resolver: zodResolver(productVariantSchema),
    defaultValues: {
      size: '',
      color: '',
      sku: '',
      barcode: '',
      purchasePrice: 0,
      sellingPrice: 0,
      stockQuantity: 0,
      minStockLevel: 10,
      weight: 0,
      dimensions: '',
      isActive: true,
    },
  })

  const onSubmit = async (data: VariantForm) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/products/${productId}/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          purchasePrice: Number(data.purchasePrice),
          sellingPrice: Number(data.sellingPrice),
          stockQuantity: Number(data.stockQuantity),
          minStockLevel: Number(data.minStockLevel),
          weight: Number(data.weight) || null,
        }),
      })

      const result = await response.json()

      if (result.success) {
        addToast({ type: 'success', title: 'Variant created', message: result.message })
        router.push(`/products/${productId}/variants`)
      } else {
        addToast({ type: 'error', title: 'Failed to create variant', message: result.error })
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to create variant' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <BackButton />
      <div>
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">New Variant</h1>
        <p className="text-secondary-500 dark:text-secondary-400 mt-1">Create a new size/color variant</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 shadow-card space-y-6">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">Variant Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Size"
              placeholder="e.g., S, M, L, XL"
              error={errors.size?.message}
              {...register('size')}
              required
            />

            <Input
              label="Color"
              placeholder="e.g., Black, White, Navy"
              error={errors.color?.message}
              {...register('color')}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="SKU"
              placeholder="Auto-generated or custom"
              error={errors.sku?.message}
              {...register('sku')}
            />

            <Input
              label="Barcode"
              placeholder="Optional barcode/EAN"
              {...register('barcode')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Purchase Price (PKR)"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              error={errors.purchasePrice?.message}
              {...register('purchasePrice', { valueAsNumber: true })}
              required
            />

            <Input
              label="Selling Price (PKR)"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              error={errors.sellingPrice?.message}
              {...register('sellingPrice', { valueAsNumber: true })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Initial Stock Quantity"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              error={errors.stockQuantity?.message}
              {...register('stockQuantity', { valueAsNumber: true })}
            />

            <Input
              label="Minimum Stock Level"
              type="number"
              min="0"
              step="1"
              placeholder="10"
              error={errors.minStockLevel?.message}
              {...register('minStockLevel', { valueAsNumber: true })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Weight (kg)"
              type="number"
              step="0.001"
              min="0"
              placeholder="0.000"
              {...register('weight', { valueAsNumber: true })}
            />

            <Input
              label="Dimensions (e.g., 30x20x5 cm)"
              placeholder="30x20x5 cm"
              {...register('dimensions')}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              {...register('isActive')}
              className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
              checked={true}
            />
            <label htmlFor="isActive" className="text-sm text-secondary-700 cursor-pointer">
              Active
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            <Save className="w-4 h-4 mr-2" />Create Variant
          </Button>
        </div>
      </form>
    </div>
  )
}