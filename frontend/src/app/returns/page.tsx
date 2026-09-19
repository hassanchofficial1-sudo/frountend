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
import { Loader2, Plus, Search, Eye, Edit, RotateCcw, MoreVertical, Trash2, CreditCard, Truck } from 'lucide-react'
import { RETURN_REASON_OPTIONS } from '@/types'
import { toast } from '@/components/ui/Toast'
import { useToast } from '@/components/ui/Toast'

export default function ReturnsPageWrapper() {
  return (
    <Suspense fallback={null}>
      <ReturnsPage />
    </Suspense>
  )
}

function ReturnsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()

  const [returns, setReturns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedReturns, setSelectedReturns] = useState<string[]>([])
  const [viewReturn, setViewReturn] = useState<any>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const [filters, setFilters] = useState({
    page: parseInt(searchParams.get('page') || '1'),
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc',
    query: searchParams.get('query') || '',
    status: searchParams.get('status') || '',
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
  })

  const fetchReturns = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value))
      })

      const response = await fetch(`/api/returns?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setReturns(data.data)
        setTotalPages(data.meta.totalPages)
        setTotal(data.meta.total)
      } else {
        addToast({ type: 'error', title: 'Failed to fetch returns', message: data.error })
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to fetch returns' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReturns()
  }, [filters.page, filters.sortBy, filters.sortOrder])

  useEffect(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, String(value))
    })
    router.push(`/returns?${params.toString()}`, { scroll: false })
  }, [filters.query, filters.status, filters.from, filters.to])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const columns: Column<any>[] = [
    { key: 'returnNumber', header: 'Return #', width: '140px', sortable: true },
    { key: 'order.internalOrderId', header: 'Order ID', width: '140px', sortable: true, render: (row) => row.order?.internalOrderId },
    { key: 'customer.name', header: 'Customer', width: '180px', render: (row) => row.customer?.name },
    { key: 'reason', header: 'Reason', width: '160px', render: (row) => {
      const reason = RETURN_REASON_OPTIONS.find(r => r.value === row.reason)
      return reason?.label || row.reason
    }},
    { key: 'items', header: 'Items', width: '80px', render: (row) => row.items?.length || 0 },
    { key: 'refundAmount', header: 'Refund', width: '130px', sortable: true, render: (row) => <span className="font-medium">{formatCurrency(row.refundAmount)}</span> },
    { key: 'refundStatus', header: 'Refund Status', width: '140px', sortable: true, render: (row) => <StatusBadge status={row.refundStatus} type="payment" /> },
    { key: 'courier.name', header: 'Courier', width: '120px', render: (row) => row.courier?.name || '-' },
    { key: 'trackingNumber', header: 'Tracking', width: '140px', render: (row) => row.trackingNumber || '-' },
    { key: 'createdAt', header: 'Date', width: '130px', sortable: true, render: (row) => formatDate(row.createdAt, 'DD MMM YYYY') },
    { key: 'actions', header: 'Actions', width: '120px', render: (row) => (
      <Dropdown
        trigger={<Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>}
        items={[
          { label: 'View', value: 'view', icon: <Eye className="w-4 h-4" />, onClick: () => setViewReturn(row) },
          { label: 'Edit', value: 'edit', icon: <Edit className="w-4 h-4" />, onClick: () => router.push(`/returns/${row.id}/edit`) },
          { label: 'Delete', value: 'delete', icon: <Trash2 className="w-4 h-4" />, danger: true, onClick: () => setDeleteConfirm(row.id) },
        ]}
      />
    )},
  ]

  const handleSelectionChange = (keys: string[]) => setSelectedReturns(keys)

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      const response = await fetch(`/api/returns/${deleteConfirm}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        addToast({ type: 'success', title: 'Return deleted' })
        fetchReturns()
      } else {
        addToast({ type: 'error', title: 'Failed to delete', message: data.error })
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to delete return' })
    }
    setDeleteConfirm(null)
  }

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Returns</h1>
          <p className="text-secondary-500 dark:text-secondary-400 mt-1">Manage product returns and refunds</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => router.push('/returns/new')}>
            <Plus className="w-4 h-4 mr-2" />New Return
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 p-4 shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Input
            placeholder="Search returns..."
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            className="lg:col-span-2"
          />
          <Select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            options={[{ value: '', label: 'All Status' }, { value: 'RETURNED', label: 'Returned' }]}
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
        data={returns}
        keyExtractor={(row) => row.id}
        onRowClick={(row) => setViewReturn(row)}
        selectedKeys={selectedReturns}
        onSelectionChange={handleSelectionChange}
        loading={loading}
        emptyMessage="No returns found"
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

      {viewReturn && (
        <Modal
          isOpen={!!viewReturn}
          onClose={() => setViewReturn(null)}
          title={`Return ${viewReturn.returnNumber}`}
          size="xl"
        >
          <ReturnDetail returnData={viewReturn} onClose={() => setViewReturn(null)} />
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Return"
        message="Are you sure you want to delete this return record?"
        confirmText="Delete"
        variant="danger"
      />
    </div>
  )
}

function ReturnDetail({ returnData, onClose }: { returnData: any; onClose: () => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{returnData.returnNumber}</h3>
              <p className="text-secondary-500 dark:text-secondary-400">Order: {returnData.order?.internalOrderId}</p>
            </div>
            <Badge variant="danger">Returned</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-secondary-500 dark:text-secondary-400">Date</p><p className="font-medium">{formatDate(returnData.createdAt, 'DD MMM YYYY HH:mm')}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Customer</p><p className="font-medium">{returnData.customer?.name}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Phone</p><p className="font-medium">{returnData.customer?.phone}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Reason</p><p className="font-medium">{RETURN_REASON_OPTIONS.find(r => r.value === returnData.reason)?.label || returnData.reason}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Courier</p><p className="font-medium">{returnData.courier?.name || '-'}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Tracking</p><p className="font-mono text-sm">{returnData.trackingNumber || '-'}</p></div>
            <div className="lg:col-span-2"><p className="text-secondary-500 dark:text-secondary-400">Notes</p><p className="font-medium">{returnData.notes || '-'}</p></div>
          </div>

          <div>
            <h4 className="font-semibold text-secondary-900 mb-3">Returned Items</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Product</th>
                    <th className="px-4 py-2 text-left">Variant</th>
                    <th className="px-4 py-2 text-right">Qty</th>
                    <th className="px-4 py-2 text-right">Unit Price</th>
                    <th className="px-4 py-2 text-right">Total</th>
                    <th className="px-4 py-2 text-center">Condition</th>
                    <th className="px-4 py-2 text-center">Restocked</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100">
                  {returnData.items?.map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2">{item.product?.name}</td>
                      <td className="px-4 py-2">{item.variant?.size} / {item.variant?.color}</td>
                      <td className="px-4 py-2 text-right">{item.quantity}</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-4 py-2 text-right font-medium">{formatCurrency(item.totalPrice)}</td>
                      <td className="px-4 py-2 text-center">
                        <Badge variant={item.condition === 'SELLABLE' ? 'success' : 'danger'}>
                          {item.condition}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <Badge variant={item.restocked ? 'success' : 'secondary'}>
                          {item.restocked ? 'Yes' : 'No'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-secondary-50 rounded-lg p-4">
            <h4 className="font-semibold text-secondary-900 mb-3">Refund Details</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-secondary-600 dark:text-secondary-400">Refund Amount</span><span className="font-medium">{formatCurrency(returnData.refundAmount)}</span></div>
              <div className="flex justify-between"><span className="text-secondary-600 dark:text-secondary-400">Refund Status</span><span><StatusBadge status={returnData.refundStatus} type="payment" /></span></div>
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