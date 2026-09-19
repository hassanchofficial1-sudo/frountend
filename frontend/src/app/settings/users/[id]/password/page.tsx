'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, Key } from 'lucide-react'
import { BackButton } from '@/components/ui/BackButton'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { z } from 'zod'
import { toast } from '@/components/ui/Toast'
import { useToast } from '@/components/ui/Toast'

const passwordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type PasswordForm = {
  password: string
  confirmPassword: string
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const params = useParams()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const userId = params.id as string
  const [userName, setUserName] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
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
        setUserName(data.data.name)
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

  const onSubmit = async (data: PasswordForm) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: data.password }),
      })

      const result = await response.json()

      if (result.success) {
        addToast({ type: 'success', title: 'Password reset', message: 'User password has been updated' })
        router.push('/settings?tab=users')
      } else {
        addToast({ type: 'error', title: 'Failed to reset password', message: result.error })
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to reset password' })
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-secondary-200 rounded w-1/4" />
          <div className="h-4 bg-secondary-200 rounded w-1/2" />
          <div className="h-4 bg-secondary-200 rounded w-full" />
          <div className="h-4 bg-secondary-200 rounded w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <BackButton />
      <div>
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Reset Password</h1>
        <p className="text-secondary-500 dark:text-secondary-400 mt-1">Reset password for {userName}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 shadow-card space-y-6">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 flex items-center gap-2">
            <Key className="w-5 h-5 text-primary-600" />
            New Password
          </h3>

          <Input
            label="New Password"
            type="password"
            placeholder="Enter new password (min 8 characters)"
            error={errors.password?.message}
            {...register('password')}
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm new password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
            required
          />

          <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
            <p className="text-sm text-warning-800">
              This will immediately invalidate the user&apos;s current sessions and they will need to log in again.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.push('/settings?tab=users')}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            <Save className="w-4 h-4 mr-2" />Reset Password
          </Button>
        </div>
      </form>
    </div>
  )
}