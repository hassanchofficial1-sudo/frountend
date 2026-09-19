'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils'
import { BackButton } from '@/components/ui/BackButton'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Input'
import { DataTable, Column, Pagination } from '@/components/ui/Table'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown'
import { Loader2, Plus, Search, Eye, Users, CreditCard, RotateCcw, MoreVertical, Trash2 } from 'lucide-react'
import { toast } from '@/components/ui/Toast'
import { useToast } from '@/components/ui/Toast'

export default function CustomersPageWrapper() {
  return (
    <Suspense fallback={null}>
      <CustomersPage />
    </Suspense>
  )
}

function CustomersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()

  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const [viewCustomer, setViewCustomer] = useState<any>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const [filters, setFilters] = useState({
    page: parseInt(searchParams.get('page') || '1'),
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc',
    query: searchParams.get('query') || '',
    isActive: searchParams.get('isActive') || '',
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
  })

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value))
      })

      const response = await fetch(`/api/customers?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setCustomers(data.data)
        setTotalPages(data.meta.totalPages)
        setTotal(data.meta.total)
      } else {
        addToast({ type: 'error', title: 'Failed to fetch customers', message: data.error })
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to fetch customers' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [filters.page, filters.sortBy, filters.sortOrder])

  useEffect(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, String(value))
    })
    router.push(`/customers?${params.toString()}`, { scroll: false })
  }, [filters.query, filters.isActive, filters.from, filters.to])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const columns: Column<any>[] = [
    { key: 'name', header: 'Name', width: '180px', sortable: true },
    { key: 'phone', header: 'Phone', width: '140px', sortable: true },
    { key: 'email', header: 'Email', width: '200px', sortable: true, render: (row) => row.email || '-' },
    { key: 'city', header: 'City', width: '120px', sortable: true },
    { key: '_count.orders', header: 'Orders', width: '80px', sortable: true, render: (row) => formatNumber(row._count?.orders || 0) },
    { key: 'totalSpent', header: 'Total Spent', width: '140px', sortable: true, render: (row) => <span className="font-medium">{formatCurrency(row.totalSpent || 0)}</span> },
    { key: 'lastOrderAt', header: 'Last Order', width: '130px', sortable: true, render: (row) => row.lastOrderAt ? formatDate(row.lastOrderAt, 'DD MMM YYYY') : '-' },
    { key: 'isActive', header: 'Status', width: '100px', sortable: true, render: (row) => <Badge variant={row.isActive ? 'success' : 'secondary'}>{row.isActive ? 'Active' : 'Inactive'}</Badge> },
    { key: 'actions', header: 'Actions', width: '100px', render: (row) => (
      <Dropdown
        trigger={<Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>}
        items={[
          { label: 'View', value: 'view', icon: <Eye className="w-4 h-4" />, onClick: () => setViewCustomer(row) },
          { label: 'Orders', value: 'orders', icon: <CreditCard className="w-4 h-4" />, onClick: () => router.push(`/orders?customerId=${row.id}`) },
          { label: 'Payments', value: 'payments', icon: <CreditCard className="w-4 h-4" />, onClick: () => router.push(`/payments?customerId=${row.id}`) },
          { label: 'Returns', value: 'returns', icon: <RotateCcw className="w-4 h-4" />, onClick: () => router.push(`/returns?customerId=${row.id}`) },
          { label: 'Delete', value: 'delete', icon: <Trash2 className="w-4 h-4" />, danger: true, onClick: () => setDeleteConfirm(row.id) },
        ]}
      />
    )},
  ]

  const handleSelectionChange = (keys: string[]) => setSelectedCustomers(keys)

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      const response = await fetch(`/api/customers/${deleteConfirm}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        addToast({ type: 'success', title: 'Customer deleted' })
        fetchCustomers()
      } else {
        addToast({ type: 'error', title: 'Failed to delete', message: data.error })
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to delete customer' })
    }
    setDeleteConfirm(null)
  }

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Customers</h1>
          <p className="text-secondary-500 dark:text-secondary-400 mt-1">Manage customer database and order history</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => router.push('/customers/new')}>
            <Plus className="w-4 h-4 mr-2" />New Customer
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 p-4 shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Input
            placeholder="Search customers..."
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            className="lg:col-span-2"
          />
          <Select
            value={filters.isActive}
            onChange={(e) => handleFilterChange('isActive', e.target.value)}
            options={[{ value: '', label: 'All' }, { value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }]}
            placeholder="All Status"
          />
          <div className="flex gap-2">
            <Input type="date" value={filters.from} onChange={(e) => handleFilterChange('from', e.target.value)} placeholder="From" className="w-full" />
            <Input type="date" value={filters.to} onChange={(e) => handleFilterChange('to', e.target.value)} placeholder="To" className="w-full" />
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        keyExtractor={(row) => row.id}
        onRowClick={(row) => setViewCustomer(row)}
        selectedKeys={selectedCustomers}
        onSelectionChange={handleSelectionChange}
        loading={loading}
        emptyMessage="No customers found"
        showCheckboxes
        striped
        hoverable
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

      {viewCustomer && (
        <Modal
          isOpen={!!viewCustomer}
          onClose={() => setViewCustomer(null)}
          title={`Customer ${viewCustomer.name}`}
          size="xl"
        >
          <CustomerDetail customer={viewCustomer} onClose={() => setViewCustomer(null)} />
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  )
}

function CustomerDetail({ customer, onClose }: { customer: any; onClose: () => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={customer.isActive ? 'success' : 'secondary'}>{customer.isActive ? 'Active' : 'Inactive'}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-secondary-500 dark:text-secondary-400">Phone</p><p className="font-medium">{customer.phone}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Email</p><p className="font-medium">{customer.email || '-'}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">City</p><p className="font-medium">{customer.city || '-'}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">State</p><p className="font-medium">{customer.state || '-'}</p></div>
            <div className="lg:col-span-2"><p className="text-secondary-500 dark:text-secondary-400">Address</p><p className="font-medium">{customer.address || '-'}</p></div>
          </div>

          <div className="bg-secondary-50 rounded-lg p-4">
            <h4 className="font-semibold text-secondary-900 mb-3">Statistics</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-secondary-900">{customer._count?.orders || 0}</p>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Total Orders</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-success-600">{formatCurrency(customer.totalSpent || 0)}</p>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Total Spent</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-600">{customer._count?.payments || 0}</p>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Payments</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-secondary-50 rounded-lg p-4">
            <h4 className="font-semibold text-secondary-900 mb-3">Recent Orders</h4>
            <div className="space-y-2">
              {customer.orders?.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-white dark:bg-secondary-800 rounded">
                  <div>
                    <p className="text-sm font-medium">{order.internalOrderId}</p>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400">{formatDate(order.orderDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(order.totalAmount)}</p>
                    <StatusBadge status={order.status} type="order" size="sm" />
                  </div>
                </div>
              ))}
              {(!customer.orders || customer.orders.length === 0) && (
                <p className="text-secondary-500 dark:text-secondary-400 text-center py-4">No orders</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText = 'Cancel', variant, isLoading }: any) {
  if (!isOpen) return null
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-secondary-600 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>{cancelText}</Button>
        <Button variant={variant} onClick={onConfirm} isLoading={isLoading}>{confirmText}</Button>
      </div>
    </Modal>
  )
}