'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils'
import { BackButton } from '@/components/ui/BackButton'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Input'
import { DataTable, Column, Pagination } from '@/components/ui/Table'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown'
import { Tabs, TabPanel } from '@/components/ui/Tabs'
import { Loader2, Search, Eye, Edit, CreditCard, DollarSign, ArrowUpRight, Clock, MoreVertical, Trash2, RefreshCw } from 'lucide-react'
import { PAYMENT_STATUS_OPTIONS, PAYMENT_TYPE_OPTIONS, PAYMENT_METHOD_OPTIONS } from '@/types'
import { toast } from '@/components/ui/Toast'
import { useToast } from '@/components/ui/Toast'

const PAYMENT_TABS = [
  { value: 'all', label: 'All Payments' },
  { value: 'advance', label: 'Advance' },
  { value: 'cod', label: 'COD' },
  { value: 'refunds', label: 'Refunds' },
]

export default function PaymentsPageWrapper() {
  return (
    <Suspense fallback={null}>
      <PaymentsPage />
    </Suspense>
  )
}

function PaymentsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()

  const [activeTab, setActiveTab] = useState('all')
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedPayments, setSelectedPayments] = useState<string[]>([])
  const [viewPayment, setViewPayment] = useState<any>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const [filters, setFilters] = useState({
    page: parseInt(searchParams.get('page') || '1'),
    limit: 20,
    sortBy: 'receivedAt',
    sortOrder: 'desc' as 'asc' | 'desc',
    query: searchParams.get('query') || '',
    type: searchParams.get('type') || '',
    status: searchParams.get('status') || '',
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
  })

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value))
      })

      if (activeTab !== 'all') {
        params.set('type', activeTab.toUpperCase())
      }

      const response = await fetch(`/api/payments?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setPayments(data.data)
        setTotalPages(data.meta.totalPages)
        setTotal(data.meta.total)
      } else {
        addToast({ type: 'error', title: 'Failed to fetch payments', message: data.error })
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to fetch payments' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [activeTab, filters.page, filters.sortBy, filters.sortOrder])

  useEffect(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, String(value))
    })
    router.push(`/payments?${params.toString()}`, { scroll: false })
  }, [filters.query, filters.type, filters.status, filters.from, filters.to])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const columns: Column<any>[] = [
    { key: 'order.internalOrderId', header: 'Order ID', width: '140px', render: (row) => row.order?.internalOrderId },
    { key: 'customer.name', header: 'Customer', width: '180px', render: (row) => row.customer?.name },
    { key: 'type', header: 'Type', width: '120px', render: (row) => (
      <Badge variant={
        row.type === 'ADVANCE' ? 'info' :
        row.type === 'COD' ? 'warning' :
        row.type === 'FULL_PAYMENT' ? 'success' : 'primary'
      }>{row.type}</Badge>
    )},
    { key: 'amount', header: 'Amount', width: '130px', sortable: true, render: (row) => <span className="font-medium">{formatCurrency(row.amount)}</span> },
    { key: 'method', header: 'Method', width: '140px', render: (row) => row.method },
    { key: 'status', header: 'Status', width: '150px', sortable: true, render: (row) => <StatusBadge status={row.status} type="payment" /> },
    { key: 'reference', header: 'Reference', width: '150px', render: (row) => row.reference || '-' },
    { key: 'receivedAt', header: 'Received', width: '140px', sortable: true, render: (row) => formatDate(row.receivedAt, 'DD MMM YYYY HH:mm') },
    { key: 'createdBy.name', header: 'Recorded By', width: '140px', render: (row) => row.createdBy?.name },
    { key: 'actions', header: 'Actions', width: '100px', render: (row) => (
      <Dropdown
        trigger={<Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>}
        items={[
          { label: 'View', value: 'view', icon: <Eye className="w-4 h-4" />, onClick: () => setViewPayment(row) },
          { label: 'Delete', value: 'delete', icon: <Trash2 className="w-4 h-4" />, danger: true, onClick: () => setDeleteConfirm(row.id) },
        ]}
      />
    )},
  ]

  const handleSelectionChange = (keys: string[]) => setSelectedPayments(keys)

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      const response = await fetch(`/api/payments/${deleteConfirm}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        addToast({ type: 'success', title: 'Payment deleted' })
        fetchPayments()
      } else {
        addToast({ type: 'error', title: 'Failed to delete', message: data.error })
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to delete payment' })
    }
    setDeleteConfirm(null)
  }

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0)
  const advanceTotal = payments.filter(p => p.type === 'ADVANCE').reduce((sum, p) => sum + p.amount, 0)
  const codTotal = payments.filter(p => p.type === 'COD').reduce((sum, p) => sum + p.amount, 0)
  const refundTotal = payments.filter(p => p.status === 'REFUNDED').reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Payments</h1>
          <p className="text-secondary-500 dark:text-secondary-400 mt-1">Track all payments including advances, COD, and refunds</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 p-4 shadow-card">
          <p className="text-sm text-secondary-500 dark:text-secondary-400">Total Received</p>
          <p className="text-2xl font-bold text-secondary-900">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 p-4 shadow-card">
          <p className="text-sm text-secondary-500 dark:text-secondary-400">Advance Payments</p>
          <p className="text-2xl font-bold text-primary-600">{formatCurrency(advanceTotal)}</p>
        </div>
        <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 p-4 shadow-card">
          <p className="text-sm text-secondary-500 dark:text-secondary-400">COD Collected</p>
          <p className="text-2xl font-bold text-success-600">{formatCurrency(codTotal)}</p>
        </div>
        <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 p-4 shadow-card">
          <p className="text-sm text-secondary-500 dark:text-secondary-400">Refunds</p>
          <p className="text-2xl font-bold text-danger-600">{formatCurrency(refundTotal)}</p>
        </div>
      </div>

      <Tabs tabs={PAYMENT_TABS} activeTab={activeTab} onChange={setActiveTab} variant="pills" className="mb-4" />

      <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 p-4 shadow-card mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Input
            placeholder="Search payments..."
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            className="lg:col-span-2"
          />
          <Select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            options={[{ value: '', label: 'All Types' }, ...PAYMENT_TYPE_OPTIONS]}
            placeholder="All Types"
          />
          <Select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            options={[{ value: '', label: 'All Status' }, ...PAYMENT_STATUS_OPTIONS]}
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
        data={payments}
        keyExtractor={(row) => row.id}
        onRowClick={(row) => setViewPayment(row)}
        selectedKeys={selectedPayments}
        onSelectionChange={handleSelectionChange}
        loading={loading}
        emptyMessage="No payments found"
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

      {viewPayment && (
        <Modal
          isOpen={!!viewPayment}
          onClose={() => setViewPayment(null)}
          title={`Payment Details`}
          size="lg"
        >
          <PaymentDetail payment={viewPayment} onClose={() => setViewPayment(null)} />
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Payment"
        message="Are you sure you want to delete this payment record?"
        confirmText="Delete"
        variant="danger"
      />
    </div>
  )
}

function PaymentDetail({ payment, onClose }: { payment: any; onClose: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Badge variant={
            payment.type === 'ADVANCE' ? 'info' :
            payment.type === 'COD' ? 'warning' :
            payment.type === 'FULL_PAYMENT' ? 'success' : 'primary'
          }>{payment.type}</Badge>
          <StatusBadge status={payment.status} type="payment" className="ml-2" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div><p className="text-secondary-500 dark:text-secondary-400">Order ID</p><p className="font-medium">{payment.order?.internalOrderId}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">Customer</p><p className="font-medium">{payment.customer?.name}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">Amount</p><p className="font-medium text-success-600 text-xl">{formatCurrency(payment.amount)}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">Method</p><p className="font-medium">{payment.method}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">Reference</p><p className="font-medium">{payment.reference || '-'}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">Received At</p><p className="font-medium">{formatDate(payment.receivedAt)}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">Recorded By</p><p className="font-medium">{payment.createdBy?.name}</p></div>
      </div>

      {payment.notes && (
        <div className="bg-secondary-50 rounded-lg p-4">
          <h4 className="font-semibold text-secondary-900 mb-2">Notes</h4>
          <p className="text-secondary-600">{payment.notes}</p>
        </div>
      )}
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