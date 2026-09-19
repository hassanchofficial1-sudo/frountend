import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AdminUsersPage } from '@/components/users/AdminUsersPage'
import { apiGet } from '@/lib/server/api'

interface SessionUser {
  id: string
  username: string
  email: string
  name: string
  role: string
}

export default async function AdminUsersPageWrapper() {
  const session = (await apiGet<{ user: SessionUser }>('/api/auth/session'))?.data?.user ?? null

  if (!session) {
    redirect('/auth/login')
  }

  if (session.role !== 'SUPER_ADMIN') {
    redirect('/settings')
  }

  return (
    <DashboardLayout user={{ name: session.name || 'User', email: session.email || '', role: session.role as any }}>
      <AdminUsersPage />
    </DashboardLayout>
  )
}