'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save } from 'lucide-react'
import { BackButton } from '@/components/ui/BackButton'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Input'
import { Select } from '@/components/ui/Input'
import { productSchema } from '@/lib/validations/schemas'
import { toast } from '@/components/ui/Toast'
import { useToast } from '@/components/ui/Toast'

type ProductForm = {
  name: string
  sku: string
  description: string
  categoryId: string
  purchasePrice: number
  sellingPrice: number
  images: string
  tags: string
  isFeatured: boolean
}

export default function NewProductPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      description: '',
      categoryId: '',
      purchasePrice: 0,
      sellingPrice: 0,
      images: '',
      tags: '',
      isFeatured: false,
    },
  })

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?limit=100')
      const data = await response.json()
      if (data.success) setCategories(data.data)
    } catch (error) {
      console.error('Failed to fetch categories')
    }
  }

  const onSubmit = async (data: ProductForm) => {
    setLoading(true)
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          images: data.images ? data.images.split(',').map(s => s.trim()) : [],
          tags: data.tags ? data.tags.split(',').map(s => s.trim()) : [],
          purchasePrice: Number(data.purchasePrice),
          sellingPrice: Number(data.sellingPrice),
        }),
      })

      const result = await response.json()

      if (result.success) {
        addToast({ type: 'success', title: 'Product created', message: result.message })
        router.push(`/products`)
      } else {
        addToast({ type: 'error', title: 'Failed to create product', message: result.error })
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to create product' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <BackButton />
      <div>
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">New Product</h1>
        <p className="text-secondary-500 dark:text-secondary-400 mt-1">Create a new clothing product</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 shadow-card space-y-6">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">Basic Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Product Name"
              placeholder="e.g., Classic Cotton T-Shirt"
              error={errors.name?.message}
              {...register('name')}
              required
            />

            <Input
              label="SKU"
              placeholder="e.g., TS-CLASSIC-001"
              error={errors.sku?.message}
              {...register('sku')}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Category"
              placeholder="Select category"
              error={errors.categoryId?.message}
              options={[{ value: '', label: 'Select category' }, ...categories.map(c => ({ value: c.id, label: c.name }))]}
              {...register('categoryId')}
            />

            <Input
              label="Purchase Price (PKR)"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              error={errors.purchasePrice?.message}
              {...register('purchasePrice', { valueAsNumber: true })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Selling Price (PKR)"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              error={errors.sellingPrice?.message}
              {...register('sellingPrice', { valueAsNumber: true })}
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isFeatured"
                {...register('isFeatured')}
                className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="isFeatured" className="text-sm text-secondary-700 cursor-pointer">
                Featured Product
              </label>
            </div>
          </div>

          <Textarea
            label="Description"
            placeholder="Product description..."
            rows={4}
            error={errors.description?.message}
            {...register('description')}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Images (comma-separated URLs)"
              placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
              error={errors.images?.message}
              {...register('images')}
            />

            <Input
              label="Tags (comma-separated)"
              placeholder="cotton, summer, casual, t-shirt"
              error={errors.tags?.message}
              {...register('tags')}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            <Save className="w-4 h-4 mr-2" />Create Product
          </Button>
        </div>
      </form>
    </div>
  )
}