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
import { userSchema } from '@/lib/validations/schemas'
import { USER_ROLE_OPTIONS } from '@/types'
import { toast } from '@/components/ui/Toast'
import { useToast } from '@/components/ui/Toast'

type UserForm = {
  name: string
  email: string
  password: string
  role: string
  phone: string
  isActive: boolean
}

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const userId = params.id as string

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<UserForm>({
    resolver: zodResolver(userSchema.partial()),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'ORDER_MANAGER',
      phone: '',
      isActive: true,
    },
  })

  useEffect(() => {
    fetchUser()
  }, [userId])

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`)
      const data = await response.json()
      if (data.success) {
        reset({
          name: data.data.name,
          email: data.data.email,
          password: '',
          role: data.data.role,
          phone: data.data.phone || '',
          isActive: data.data.isActive,
        })
      } else {
        addToast({ type: 'error', title: 'Failed to fetch user', message: data.error })
        router.push('/settings?tab=users')
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to fetch user' })
      router.push('/settings?tab=users')
    } finally {
      setFetching(false)
    }
  }

  const onSubmit = async (data: UserForm) => {
    setLoading(true)
    try {
      const { password: _password, ...submitData } = data
      const payload = _password ? data : submitData

      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.success) {
        addToast({ type: 'success', title: 'User updated', message: result.message })
        router.push('/settings?tab=users')
      } else {
        addToast({ type: 'error', title: 'Failed to update user', message: result.error })
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to update user' })
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-secondary-200 rounded w-1/4" />
          <div className="h-4 bg-secondary-200 rounded w-1/2" />
          <div className="h-4 bg-secondary-200 rounded w-1/2" />
          <div className="h-4 bg-secondary-200 rounded w-1/2" />
          <div className="h-4 bg-secondary-200 rounded w-1/2" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <BackButton />
      <div>
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Edit User</h1>
        <p className="text-secondary-500 dark:text-secondary-400 mt-1">Update user account details</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 shadow-card space-y-6">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">User Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Name"
              placeholder="Full name"
              error={errors.name?.message}
              {...register('name')}
              required
            />

            <Input
              label="Email"
              type="email"
              placeholder="user@company.com"
              error={errors.email?.message}
              {...register('email')}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Password (leave blank to keep current)"
              type="password"
              placeholder="Minimum 8 characters"
              error={errors.password?.message}
              {...register('password')}
            />

            <Select
              label="Role"
              placeholder="Select role"
              error={errors.role?.message}
              options={USER_ROLE_OPTIONS}
              {...register('role')}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone"
              placeholder="+92 3XX XXXXXXX"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                {...register('isActive')}
                className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="isActive" className="text-sm text-secondary-700 cursor-pointer">
                Active
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.push('/settings?tab=users')}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            <Save className="w-4 h-4 mr-2" />Update User
          </Button>
        </div>
      </form>
    </div>
  )
}