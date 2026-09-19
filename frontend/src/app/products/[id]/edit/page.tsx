'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
  status: boolean
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const productId = params.id as string

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
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
      status: true,
    },
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [productRes, categoriesRes] = await Promise.all([
        fetch(`/api/products/${productId}`),
        fetch('/api/categories?limit=100'),
      ])

      const [productData, categoriesData] = await Promise.all([
        productRes.json(),
        categoriesRes.json(),
      ])

      if (productData.success) {
        const product = productData.data
        reset({
          name: product.name,
          sku: product.sku,
          description: product.description || '',
          categoryId: product.categoryId || '',
          purchasePrice: product.purchasePrice,
          sellingPrice: product.sellingPrice,
          images: product.images?.join(', ') || '',
          tags: product.tags?.join(', ') || '',
          isFeatured: product.isFeatured,
          status: product.status,
        })
      }

      if (categoriesData.success) {
        setCategories(categoriesData.data)
      }
    } catch (error) {
      console.error('Failed to fetch product')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const onSubmit = async (data: ProductForm) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
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
        addToast({ type: 'success', title: 'Product updated', message: result.message })
        router.push(`/products`)
      } else {
        addToast({ type: 'error', title: 'Failed to update product', message: result.error })
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to update product' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <BackButton />
      <div>
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Edit Product</h1>
        <p className="text-secondary-500 dark:text-secondary-400 mt-1">Update product information</p>
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

            <Select
              label="Status"
              error={errors.status?.message}
              options={[
                { value: 'true', label: 'Active' },
                { value: 'false', label: 'Inactive' },
              ]}
              {...register('status', { setValueAs: (v) => v === 'true' })}
            />
          </div>

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
          <Button type="submit" isLoading={saving}>
            <Save className="w-4 h-4 mr-2" />Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}