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
import { Loader2, Plus, Search, Eye, Edit, Building2, MoreVertical, Trash2, CreditCard, ShoppingCart } from 'lucide-react'
import { toast } from '@/components/ui/Toast'
import { useToast } from '@/components/ui/Toast'

export default function SuppliersPageWrapper() {
  return (
    <Suspense fallback={null}>
      <SuppliersPage />
    </Suspense>
  )
}

function SuppliersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()

  const [suppliers, setSuppliers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([])
  const [viewSupplier, setViewSupplier] = useState<any>(null)
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

  const fetchSuppliers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value))
      })

      const response = await fetch(`/api/suppliers?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setSuppliers(data.data)
        setTotalPages(data.meta.totalPages)
        setTotal(data.meta.total)
      } else {
        addToast({ type: 'error', title: 'Failed to fetch suppliers', message: data.error })
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to fetch suppliers' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuppliers()
  }, [filters.page, filters.sortBy, filters.sortOrder])

  useEffect(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, String(value))
    })
    router.push(`/suppliers?${params.toString()}`, { scroll: false })
  }, [filters.query, filters.isActive, filters.from, filters.to])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const columns: Column<any>[] = [
    { key: 'name', header: 'Supplier', width: '180px', sortable: true },
    { key: 'contactPerson', header: 'Contact', width: '150px', render: (row) => row.contactPerson || '-' },
    { key: 'phone', header: 'Phone', width: '140px', sortable: true },
    { key: 'email', header: 'Email', width: '200px', render: (row) => row.email || '-' },
    { key: 'city', header: 'City', width: '120px' },
    { key: '_count.purchases', header: 'Purchases', width: '100px', sortable: true, render: (row) => formatNumber(row._count?.purchases || 0) },
    { key: 'totalPurchases', header: 'Total Purchases', width: '150px', render: (row) => {
      const total = row.purchases?.reduce((sum: number, p: any) => sum + p.totalAmount, 0) || 0
      return <span className="font-medium">{formatCurrency(total)}</span>
    }},
    { key: 'totalBalance', header: 'Outstanding', width: '140px', render: (row) => {
      const balance = row.purchases?.reduce((sum: number, p: any) => sum + p.balanceAmount, 0) || 0
      return <span className={balance > 0 ? 'font-medium text-danger-600' : 'font-medium text-success-600'}>{formatCurrency(balance)}</span>
    }},
    { key: 'isActive', header: 'Status', width: '100px', sortable: true, render: (row) => <Badge variant={row.isActive ? 'success' : 'secondary'}>{row.isActive ? 'Active' : 'Inactive'}</Badge> },
    { key: 'actions', header: 'Actions', width: '120px', render: (row) => (
      <Dropdown
        trigger={<Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>}
        items={[
          { label: 'View', value: 'view', icon: <Eye className="w-4 h-4" />, onClick: () => setViewSupplier(row) },
          { label: 'Edit', value: 'edit', icon: <Edit className="w-4 h-4" />, onClick: () => router.push(`/suppliers/${row.id}/edit`) },
          { label: 'Purchases', value: 'purchases', icon: <ShoppingCart className="w-4 h-4" />, onClick: () => router.push(`/purchases?supplierId=${row.id}`) },
          { label: 'New Purchase', value: 'new', icon: <Plus className="w-4 h-4" />, onClick: () => router.push(`/purchases/new?supplierId=${row.id}`) },
          { label: 'Payments', value: 'payments', icon: <CreditCard className="w-4 h-4" />, onClick: () => router.push(`/payments?supplierId=${row.id}`) },
          { label: 'Delete', value: 'delete', icon: <Trash2 className="w-4 h-4" />, danger: true, onClick: () => setDeleteConfirm(row.id) },
        ]}
      />
    )},
  ]

  const handleSelectionChange = (keys: string[]) => setSelectedSuppliers(keys)

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      const response = await fetch(`/api/suppliers/${deleteConfirm}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        addToast({ type: 'success', title: 'Supplier deleted' })
        fetchSuppliers()
      } else {
        addToast({ type: 'error', title: 'Failed to delete', message: data.error })
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to delete supplier' })
    }
    setDeleteConfirm(null)
  }

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Suppliers</h1>
          <p className="text-secondary-500 dark:text-secondary-400 mt-1">Manage supplier database and purchase history</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => router.push('/suppliers/new')}>
            <Plus className="w-4 h-4 mr-2" />New Supplier
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 p-4 shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Input
            placeholder="Search suppliers..."
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
        data={suppliers}
        keyExtractor={(row) => row.id}
        onRowClick={(row) => setViewSupplier(row)}
        selectedKeys={selectedSuppliers}
        onSelectionChange={handleSelectionChange}
        loading={loading}
        emptyMessage="No suppliers found"
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

      {viewSupplier && (
        <Modal
          isOpen={!!viewSupplier}
          onClose={() => setViewSupplier(null)}
          title={`Supplier ${viewSupplier.name}`}
          size="xl"
        >
          <SupplierDetail supplier={viewSupplier} onClose={() => setViewSupplier(null)} />
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Supplier"
        message="Are you sure you want to delete this supplier? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  )
}

function SupplierDetail({ supplier, onClose }: { supplier: any; onClose: () => void }) {
  const totalPurchases = supplier.purchases?.reduce((sum: number, p: any) => sum + p.totalAmount, 0) || 0
  const totalPaid = supplier.purchases?.reduce((sum: number, p: any) => sum + p.paidAmount, 0) || 0
  const totalBalance = supplier.purchases?.reduce((sum: number, p: any) => sum + p.balanceAmount, 0) || 0
  const pendingCount = supplier.purchases?.filter((p: any) => p.status !== 'PAID').length || 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={supplier.isActive ? 'success' : 'secondary'}>{supplier.isActive ? 'Active' : 'Inactive'}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-secondary-500 dark:text-secondary-400">Contact Person</p><p className="font-medium">{supplier.contactPerson || '-'}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Phone</p><p className="font-medium">{supplier.phone}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Email</p><p className="font-medium">{supplier.email || '-'}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">City</p><p className="font-medium">{supplier.city || '-'}</p></div>
            <div className="lg:col-span-2"><p className="text-secondary-500 dark:text-secondary-400">Address</p><p className="font-medium">{supplier.address || '-'}</p></div>
            <div className="lg:col-span-2"><p className="text-secondary-500 dark:text-secondary-400">Payment Terms</p><p className="font-medium">{supplier.paymentTerms || '-'}</p></div>
          </div>

          <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4">
            <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-3">Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">{supplier._count?.purchases || 0}</p>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Total Purchases</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-600">{formatCurrency(totalPurchases)}</p>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Total Amount</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-danger-600">{formatCurrency(totalBalance)}</p>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Outstanding</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4">
            <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-3">Financial Status</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-secondary-600 dark:text-secondary-400">Total Purchases</span><span className="font-medium">{formatCurrency(totalPurchases)}</span></div>
              <div className="flex justify-between"><span className="text-secondary-600 dark:text-secondary-400">Total Paid</span><span className="font-medium text-success-600">{formatCurrency(totalPaid)}</span></div>
              <div className="flex justify-between border-t border-secondary-200 pt-3"><span className="text-secondary-600 dark:text-secondary-400">Outstanding</span><span className={totalBalance > 0 ? 'font-bold text-danger-600' : 'font-bold text-success-600'}>{formatCurrency(totalBalance)}</span></div>
              <div className="flex justify-between"><span className="text-secondary-600 dark:text-secondary-400">Pending Invoices</span><span className="font-medium">{pendingCount}</span></div>
            </div>
          </div>

          <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4">
            <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-3">Recent Purchases</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {supplier.purchases?.map((purchase: any) => (
                <div key={purchase.id} className="flex items-center justify-between p-3 bg-white dark:bg-secondary-800 rounded">
                  <div>
                    <p className="text-sm font-medium">{purchase.invoiceNumber}</p>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400">{formatDate(purchase.purchaseDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(purchase.totalAmount)}</p>
                    <StatusBadge status={purchase.status} type="payment" size="sm" />
                  </div>
                </div>
              ))}
              {(!supplier.purchases || supplier.purchases.length === 0) && (
                <p className="text-secondary-500 dark:text-secondary-400 text-center py-4">No purchases</p>
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
      <p className="text-secondary-600 dark:text-secondary-400 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>{cancelText}</Button>
        <Button variant={variant} onClick={onConfirm} isLoading={isLoading}>{confirmText}</Button>
      </div>
    </Modal>
  )
}