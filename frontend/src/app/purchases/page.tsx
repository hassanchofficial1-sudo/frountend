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
import { Loader2, Plus, Search, Eye, Edit, ShoppingCart, MoreVertical, Trash2 } from 'lucide-react'
import { PAYMENT_STATUS_OPTIONS } from '@/types'
import { toast } from '@/components/ui/Toast'
import { useToast } from '@/components/ui/Toast'

export default function PurchasesPageWrapper() {
  return (
    <Suspense fallback={null}>
      <PurchasesPage />
    </Suspense>
  )
}

function PurchasesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()

  const [purchases, setPurchases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedPurchases, setSelectedPurchases] = useState<string[]>([])
  const [viewPurchase, setViewPurchase] = useState<any>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const [filters, setFilters] = useState({
    page: parseInt(searchParams.get('page') || '1'),
    limit: 20,
    sortBy: 'purchaseDate',
    sortOrder: 'desc' as 'asc' | 'desc',
    query: searchParams.get('query') || '',
    status: searchParams.get('status') || '',
    supplierId: searchParams.get('supplierId') || '',
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
  })

  const [suppliers, setSuppliers] = useState<any[]>([])

  const fetchPurchases = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value))
      })

      const response = await fetch(`/api/purchases?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setPurchases(data.data)
        setTotalPages(data.meta.totalPages)
        setTotal(data.meta.total)
      } else {
        addToast({ type: 'error', title: 'Failed to fetch purchases', message: data.error })
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to fetch purchases' })
    } finally {
      setLoading(false)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers?limit=100')
      const data = await response.json()
      if (data.success) setSuppliers(data.data)
    } catch (error) {
      console.error('Failed to fetch suppliers')
    }
  }

  useEffect(() => {
    fetchPurchases()
    fetchSuppliers()
  }, [filters.page, filters.sortBy, filters.sortOrder])

  useEffect(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, String(value))
    })
    router.push(`/purchases?${params.toString()}`, { scroll: false })
  }, [filters.query, filters.status, filters.supplierId, filters.from, filters.to])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const columns: Column<any>[] = [
    { key: 'invoiceNumber', header: 'Invoice', width: '140px', sortable: true },
    { key: 'supplier.name', header: 'Supplier', width: '180px', sortable: true, render: (row) => row.supplier?.name },
    { key: 'purchaseDate', header: 'Date', width: '120px', sortable: true, render: (row) => formatDate(row.purchaseDate, 'DD MMM YYYY') },
    { key: 'status', header: 'Status', width: '130px', sortable: true, render: (row) => <StatusBadge status={row.status} type="payment" /> },
    { key: 'totalAmount', header: 'Total', width: '130px', sortable: true, render: (row) => <span className="font-medium">{formatCurrency(row.totalAmount)}</span> },
    { key: 'paidAmount', header: 'Paid', width: '120px', render: (row) => <span className="text-success-600">{formatCurrency(row.paidAmount)}</span> },
    { key: 'balanceAmount', header: 'Balance', width: '120px', render: (row) => <span className={row.balanceAmount > 0 ? 'text-danger-600 font-medium' : 'text-success-600'}>{formatCurrency(row.balanceAmount)}</span> },
    { key: 'items.length', header: 'Items', width: '80px', render: (row) => formatNumber(row.items?.length || 0) },
    { key: 'dueDate', header: 'Due Date', width: '120px', render: (row) => row.dueDate ? formatDate(row.dueDate, 'DD MMM YYYY') : '-' },
    { key: 'actions', header: 'Actions', width: '120px', render: (row) => (
      <Dropdown
        trigger={<Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>}
        items={[
          { label: 'View', value: 'view', icon: <Eye className="w-4 h-4" />, onClick: () => setViewPurchase(row) },
{ label: 'Edit', value: 'edit', icon: <Edit className="w-4 h-4" />, onClick: () => router.push(`/purchases/${row.id}/edit`) },
        ]}
      />
    )},
  ]

  const handleSelectionChange = (keys: string[]) => setSelectedPurchases(keys)

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      const response = await fetch(`/api/purchases/${deleteConfirm}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        addToast({ type: 'success', title: 'Purchase deleted' })
        fetchPurchases()
      } else {
        addToast({ type: 'error', title: 'Failed to delete', message: data.error })
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to delete purchase' })
    }
    setDeleteConfirm(null)
  }

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Purchases</h1>
          <p className="text-secondary-500 dark:text-secondary-400 mt-1">Manage purchase orders and supplier invoices</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => router.push('/purchases/new')}>
            <Plus className="w-4 h-4 mr-2" />New Purchase
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 p-4 shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <Input
            placeholder="Search purchases, suppliers..."
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            className="lg:col-span-2"
          />
          <Select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            options={[{ value: '', label: 'All Status' }, ...PAYMENT_STATUS_OPTIONS]}
            placeholder="All Status"
          />
          <Select
            value={filters.supplierId}
            onChange={(e) => handleFilterChange('supplierId', e.target.value)}
            options={[{ value: '', label: 'All Suppliers' }, ...suppliers.map(s => ({ value: s.id, label: s.name }))]}
            placeholder="All Suppliers"
          />
          <div className="flex gap-2">
            <Input type="date" value={filters.from} onChange={(e) => handleFilterChange('from', e.target.value)} placeholder="From" className="w-full" />
            <Input type="date" value={filters.to} onChange={(e) => handleFilterChange('to', e.target.value)} placeholder="To" className="w-full" />
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={purchases}
        keyExtractor={(row) => row.id}
        onRowClick={(row) => setViewPurchase(row)}
        selectedKeys={selectedPurchases}
        onSelectionChange={handleSelectionChange}
        loading={loading}
        emptyMessage="No purchases found"
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

      {viewPurchase && (
        <Modal
          isOpen={!!viewPurchase}
          onClose={() => setViewPurchase(null)}
          title={`Purchase ${viewPurchase.invoiceNumber}`}
          size="xl"
        >
          <PurchaseDetail purchase={viewPurchase} onClose={() => setViewPurchase(null)} />
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Purchase"
        message="Are you sure you want to delete this purchase? This will also restore inventory stock."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  )
}

function PurchaseDetail({ purchase, onClose }: { purchase: any; onClose: () => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{purchase.invoiceNumber}</h3>
              <p className="text-secondary-500 dark:text-secondary-400">{purchase.supplier?.name}</p>
            </div>
            <StatusBadge status={purchase.status} type="payment" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-secondary-500 dark:text-secondary-400">Date</p><p className="font-medium">{formatDate(purchase.purchaseDate, 'DD MMM YYYY')}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Due Date</p><p className="font-medium">{purchase.dueDate ? formatDate(purchase.dueDate, 'DD MMM YYYY') : '-'}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Supplier</p><p className="font-medium">{purchase.supplier?.name}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Contact</p><p className="font-medium">{purchase.supplier?.contactPerson || '-'}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Phone</p><p className="font-medium">{purchase.supplier?.phone}</p></div>
            <div className="lg:col-span-2"><p className="text-secondary-500 dark:text-secondary-400">Notes</p><p className="font-medium">{purchase.notes || '-'}</p></div>
          </div>

          <div>
            <h4 className="font-semibold text-secondary-900 mb-3">Items</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Product</th>
                    <th className="px-4 py-2 text-left">Variant</th>
                    <th className="px-4 py-2 text-right">Ordered</th>
                    <th className="px-4 py-2 text-right">Received</th>
                    <th className="px-4 py-2 text-right">Unit Cost</th>
                    <th className="px-4 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100">
                  {purchase.items?.map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2">{item.product?.name}</td>
                      <td className="px-4 py-2">{item.variant?.size} / {item.variant?.color}</td>
                      <td className="px-4 py-2 text-right">{formatNumber(item.quantity)}</td>
                      <td className="px-4 py-2 text-right">{formatNumber(item.receivedQty)}</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(item.unitCost)}</td>
                      <td className="px-4 py-2 text-right font-medium">{formatCurrency(item.totalCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-secondary-50 rounded-lg p-4">
            <h4 className="font-semibold text-secondary-900 mb-3">Financial Summary</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-secondary-600 dark:text-secondary-400">Subtotal</span><span className="font-medium">{formatCurrency(purchase.totalAmount)}</span></div>
              <div className="flex justify-between"><span className="text-secondary-600 dark:text-secondary-400">Paid</span><span className="font-medium text-success-600">{formatCurrency(purchase.paidAmount)}</span></div>
              <div className="flex justify-between border-t border-secondary-200 dark:border-secondary-700 pt-3"><span className="text-secondary-600 dark:text-secondary-400">Balance</span><span className={purchase.balanceAmount > 0 ? 'font-bold text-danger-600' : 'font-bold text-success-600'}>{formatCurrency(purchase.balanceAmount)}</span></div>
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