'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { DataTable, Column, Pagination } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Dropdown } from '@/components/ui/Dropdown'
import { Loader2, Plus, Edit, Key, MoreVertical } from 'lucide-react'
import { toast } from '@/components/ui/Toast'
import { useToast } from '@/components/ui/Toast'

export function AdminUsersPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const totalPages = Math.max(1, Math.ceil(total / limit))

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/users?page=${page}&limit=${limit}&sortBy=createdAt&sortOrder=desc`)
      const data = await response.json()
      if (data.success) {
        setUsers(data.data)
        setTotal(data.pagination?.total || data.total || 0)
      } else {
        addToast({ type: 'error', title: 'Failed to load users', message: data.error })
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to load users' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page, limit])

  const columns: Column<any>[] = [
    { key: 'name', header: 'Name', width: '200px', render: (row) => (
      <div>
        <p className="font-medium">{row.name}</p>
        <p className="text-xs text-secondary-500">@{row.username}</p>
      </div>
    )},
    { key: 'email', header: 'Email', width: '220px' },
    { key: 'role', header: 'Role', width: '150px', render: (row) => <Badge variant={row.role === 'SUPER_ADMIN' ? 'danger' : row.role === 'ADMIN' ? 'primary' : 'secondary'}>{row.role}</Badge> },
    { key: 'isActive', header: 'Status', width: '100px', render: (row) => <Badge variant={row.isActive ? 'success' : 'secondary'}>{row.isActive ? 'Active' : 'Inactive'}</Badge> },
    { key: 'lastLoginAt', header: 'Last Login', width: '150px', render: (row) => row.lastLoginAt ? formatDate(row.lastLoginAt) : 'Never' },
    { key: 'actions', header: 'Actions', width: '120px', render: (row) => (
      <Dropdown trigger={<Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>} items={[
        { label: 'Edit', value: 'edit', icon: <Edit className="w-4 h-4" />, onClick: () => router.push(`/settings/users/${row.id}/edit`) },
        { label: 'Reset Password', value: 'password', icon: <Key className="w-4 h-4" />, onClick: () => router.push(`/settings/users/${row.id}/password`) },
      ]} />
    )},
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">User Management</h1>
          <p className="text-secondary-500 dark:text-secondary-400 mt-1">Manage system users and access (SUPER_ADMIN only)</p>
        </div>
        <Button onClick={() => router.push('/settings/users/new')}>
          <Plus className="w-4 h-4 mr-2" />Add User
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={users}
            keyExtractor={(row) => row.id}
            loading={loading}
            emptyMessage="No users found"
            striped
            hoverable
          />
        </CardContent>
      </Card>

      {total > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
          showPageSize
          pageSize={limit}
          onPageSizeChange={(l) => { setLimit(l); setPage(1) }}
        />
      )}
    </div>
  )
}