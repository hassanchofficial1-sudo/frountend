'use client'

import { useState, useEffect } from 'react'
import { formatDate } from '@/lib/utils'
import { BackButton } from '@/components/ui/BackButton'
import { Button } from '@/components/ui/Button'
import { DataTable, Column, Pagination } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Loader2, Bell, Check, CheckCheck, Trash2, Eye, MoreVertical } from 'lucide-react'
import { toast } from '@/components/ui/Toast'
import { useToast } from '@/components/ui/Toast'
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown'

export default function NotificationsPage() {
  const { addToast } = useToast()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc',
    isRead: '',
  })

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value))
      })

      const response = await fetch(`/api/notifications?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setNotifications(data.data)
        setTotalPages(data.meta.totalPages)
        setTotal(data.meta.total)
      }
    } catch (error) {
      console.error('Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications?isRead=false&limit=1')
      const data = await response.json()
      if (data.success) setUnreadCount(data.meta.total)
    } catch (error) {
      console.error('Failed to fetch unread count')
    }
  }

  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()
  }, [filters.page, filters.sortBy, filters.sortOrder, filters.isRead])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handleSort = (key: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: key,
      sortOrder: prev.sortBy === key && prev.sortOrder === 'desc' ? 'asc' : 'desc',
    }))
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      })
      const data = await response.json()
      if (data.success) {
        fetchNotifications()
        fetchUnreadCount()
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to mark as read' })
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', { method: 'POST' })
      const data = await response.json()
      if (data.success) {
        addToast({ type: 'success', title: 'All marked as read' })
        fetchNotifications()
        fetchUnreadCount()
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to mark all as read' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this notification?')) return
    try {
      const response = await fetch(`/api/notifications/${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        addToast({ type: 'success', title: 'Notification deleted' })
        fetchNotifications()
        fetchUnreadCount()
      } else {
        addToast({ type: 'error', title: 'Failed to delete', message: data.error })
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to delete notification' })
    }
  }

  const columns: Column<any>[] = [
    { key: 'type', header: 'Type', width: '120px', sortable: true, render: (row) => (
      <Badge variant={row.type === 'ORDER' ? 'primary' : row.type === 'STOCK' ? 'warning' : row.type === 'PAYMENT' ? 'success' : row.type === 'SYSTEM' ? 'secondary' : 'info'}>
        {row.type}
      </Badge>
    )},
    { key: 'title', header: 'Title', width: '200px', sortable: true },
    { key: 'message', header: 'Message', width: '300px', render: (row) => (
      <p className="text-secondary-600 dark:text-secondary-400 line-clamp-1">{row.message}</p>
    )},
    { key: 'isRead', header: 'Status', width: '100px', sortable: true, render: (row) => (
      <Badge variant={row.isRead ? 'success' : 'warning'}>
        {row.isRead ? (
          <> <CheckCheck className="w-3 h-3 inline mr-1" /> Read </>
        ) : (
          <> <Bell className="w-3 h-3 inline mr-1" /> Unread </>
        )}
      </Badge>
    )},
    { key: 'createdAt', header: 'Date', width: '150px', sortable: true, render: (row) => formatDate(row.createdAt, 'DD MMM YYYY HH:mm') },
    { key: 'actions', header: 'Actions', width: '120px', render: (row) => (
      <Dropdown
        trigger={<Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>}
        items={[
          !row.isRead ? { label: 'Mark as Read', value: 'read', icon: <Check className="w-4 h-4" />, onClick: () => handleMarkAsRead(row.id) } : null,
          { label: 'Delete', value: 'delete', icon: <Trash2 className="w-4 h-4" />, danger: true, onClick: () => handleDelete(row.id) },
        ].filter(Boolean) as DropdownItem[]}
      />
    )},
  ]

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Notifications</h1>
          <p className="text-secondary-500 dark:text-secondary-400 mt-1">View and manage your notifications</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <Check className="w-4 h-4 mr-2" />Mark All as Read ({unreadCount})
            </Button>
          )}
          <div className="relative">
            <select
              value={filters.isRead}
              onChange={(e) => handleFilterChange('isRead', e.target.value)}
              className="appearance-none px-4 py-2.5 pr-10 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-600 rounded-lg text-sm text-secondary-900 dark:text-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
            >
              <option value="">All</option>
              <option value="false">Unread</option>
              <option value="true">Read</option>
            </select>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={notifications}
        keyExtractor={(row) => row.id}
        onRowClick={(row) => !row.isRead && handleMarkAsRead(row.id)}
        loading={loading}
        emptyMessage="No notifications"
        striped
        hoverable
        rowClassName={(row) => row.isRead ? '' : 'bg-primary-50/50'}
      />

      {total > 0 && (
        <Pagination
          currentPage={filters.page}
          totalPages={totalPages}
          onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
          showPageSize
          pageSize={filters.limit}
          onPageSizeChange={(limit) => setFilters(prev => ({ ...prev, limit, page: 1 }))}
        />
      )}
    </div>
  )
}