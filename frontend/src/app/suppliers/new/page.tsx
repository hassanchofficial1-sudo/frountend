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
import { supplierSchema } from '@/lib/validations/schemas'
import { toast } from '@/components/ui/Toast'
import { useToast } from '@/components/ui/Toast'

type SupplierForm = {
  name: string
  contactPerson: string
  phone: string
  email: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
  taxNumber: string
  paymentTerms: string
  notes: string
}

export default function NewSupplierPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SupplierForm>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Pakistan',
      taxNumber: '',
      paymentTerms: '',
      notes: '',
    },
  })

  const onSubmit = async (data: SupplierForm) => {
    setLoading(true)
    try {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        addToast({ type: 'success', title: 'Supplier created', message: result.message })
        router.push(`/suppliers`)
      } else {
        addToast({ type: 'error', title: 'Failed to create supplier', message: result.error })
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to create supplier' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <BackButton />
      <div>
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">New Supplier</h1>
        <p className="text-secondary-500 dark:text-secondary-400 mt-1">Add a new supplier to the system</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 shadow-card space-y-6">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">Supplier Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Supplier Name"
              placeholder="e.g., ABC Textiles"
              error={errors.name?.message}
              {...register('name')}
              required
            />

            <Input
              label="Contact Person"
              placeholder="e.g., John Smith"
              error={errors.contactPerson?.message}
              {...register('contactPerson')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone"
              placeholder="+92 3XX XXXXXXX"
              error={errors.phone?.message}
              {...register('phone')}
              required
            />

            <Input
              label="Email"
              type="email"
              placeholder="supplier@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="City"
              placeholder="e.g., Karachi"
              error={errors.city?.message}
              {...register('city')}
            />

            <Input
              label="State/Province"
              placeholder="e.g., Sindh"
              error={errors.state?.message}
              {...register('state')}
            />

            <Input
              label="Postal Code"
              placeholder="e.g., 75500"
              error={errors.postalCode?.message}
              {...register('postalCode')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Country"
              placeholder="Pakistan"
              error={errors.country?.message}
              {...register('country')}
            />

            <Input
              label="Tax Number"
              placeholder="NTN/STRN"
              error={errors.taxNumber?.message}
              {...register('taxNumber')}
            />
          </div>

          <Textarea
            label="Address"
            placeholder="Full address..."
            rows={3}
            error={errors.address?.message}
            {...register('address')}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Payment Terms"
              placeholder="e.g., Net 30, COD"
              error={errors.paymentTerms?.message}
              {...register('paymentTerms')}
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
          <Button type="submit" isLoading={loading}>
            <Save className="w-4 h-4 mr-2" />Create Supplier
          </Button>
        </div>
      </form>
    </div>
  )
}