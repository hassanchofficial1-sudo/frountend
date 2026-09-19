'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils'
import { BackButton } from '@/components/ui/BackButton'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Input'
import { Table, DataTable, Column, Pagination } from '@/components/ui/Table'
import { Badge, StatusBadge, OrderSourceBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown'
import { Loader2, Search, Filter, Eye, RotateCcw, MoreVertical, Trash2 } from 'lucide-react'
import { ORDER_STATUS_OPTIONS, ORDER_SOURCE_OPTIONS, PAYMENT_STATUS_OPTIONS } from '@/types'
import { toast } from '@/components/ui/Toast'
import { useToast } from '@/components/ui/Toast'

const STATUS_COLORS: Record<string, string> = {
  NEW: '#3b82f6',
  CONFIRMED: '#8b5cf6',
  PACKED: '#f59e0b',
  DISPATCHED: '#f97316',
  IN_TRANSIT: '#06b6d4',
  OUT_FOR_DELIVERY: '#ec4899',
  DELIVERED: '#22c55e',
  RETURNED: '#ef4444',
  CANCELLED: '#64748b',
  ON_HOLD: '#64748b',
}

export default function OrdersPageWrapper() {
  return (
    <Suspense fallback={null}>
      <OrdersPage />
    </Suspense>
  )
}

function OrdersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()

  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [viewOrder, setViewOrder] = useState<any>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const [filters, setFilters] = useState({
    page: parseInt(searchParams.get('page') || '1'),
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc',
    query: searchParams.get('query') || '',
    status: searchParams.get('status') || '',
    source: searchParams.get('source') || '',
    paymentStatus: searchParams.get('paymentStatus') || '',
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
  })

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value))
      })

      const response = await fetch(`/api/orders?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setOrders(data.data)
        setTotalPages(data.meta.totalPages)
        setTotal(data.meta.total)
      } else {
        addToast({ type: 'error', title: 'Failed to fetch orders', message: data.error })
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to fetch orders' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [filters.page, filters.sortBy, filters.sortOrder])

  useEffect(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, String(value))
    })
    router.push(`/orders?${params.toString()}`, { scroll: false })
  }, [filters.query, filters.status, filters.source, filters.paymentStatus, filters.from, filters.to])

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

  const columns: Column<any>[] = [
    { key: 'internalOrderId', header: 'Order ID', width: '140px', sortable: true },
    { key: 'source', header: 'Source', width: '100px', sortable: true, render: (row) => <OrderSourceBadge source={row.source} /> },
    { key: 'status', header: 'Status', width: '130px', sortable: true, render: (row) => <StatusBadge status={row.status} type="order" /> },
    { key: 'customer', header: 'Customer', width: '180px', sortable: true, render: (row) => (
      <div>
        <p className="font-medium">{row.customer?.name || 'N/A'}</p>
        <p className="text-xs text-secondary-500 dark:text-secondary-400">{row.customer?.phone || ''}</p>
      </div>
    )},
    { key: 'totalAmount', header: 'Amount', width: '120px', sortable: true, render: (row) => <span className="font-medium">{formatCurrency(row.totalAmount)}</span> },
    { key: 'paymentStatus', header: 'Payment', width: '140px', sortable: true, render: (row) => <StatusBadge status={row.paymentStatus} type="payment" /> },
    { key: 'paymentType', header: 'Type', width: '100px', render: (row) => <Badge variant={row.paymentType === 'COD' ? 'warning' : row.paymentType === 'ADVANCE' ? 'info' : 'success'}>{row.paymentType}</Badge> },
    { key: 'courier', header: 'Courier', width: '120px', render: (row) => row.courier?.name || '-' },
    { key: 'trackingNumber', header: 'Tracking', width: '140px', render: (row) => row.trackingNumber ? <span className="font-mono text-sm">{row.trackingNumber}</span> : '-' },
    { key: 'orderDate', header: 'Date', width: '130px', sortable: true, render: (row) => formatDate(row.orderDate, 'DD MMM YYYY') },
    { key: 'actions', header: 'Actions', width: '100px', render: (row) => (
      <Dropdown
        trigger={<Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>}
        items={[
          { label: 'View', value: 'view', icon: <Eye className="w-4 h-4" />, onClick: () => setViewOrder(row) },
          { label: 'Return', value: 'return', icon: <RotateCcw className="w-4 h-4" />, onClick: () => router.push(`/returns/new?orderId=${row.id}`) },
          { label: 'Delete', value: 'delete', icon: <Trash2 className="w-4 h-4" />, danger: true, onClick: () => setDeleteConfirm(row.id) },
        ]}
      />
    )},
  ]

  const handleSelectionChange = (keys: string[]) => setSelectedOrders(keys)

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      const response = await fetch(`/api/orders/${deleteConfirm}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        addToast({ type: 'success', title: 'Order deleted' })
        fetchOrders()
      } else {
        addToast({ type: 'error', title: 'Failed to delete', message: data.error })
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to delete order' })
    }
    setDeleteConfirm(null)
  }

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Orders</h1>
          <p className="text-secondary-500 dark:text-secondary-400 mt-1">Manage all orders from Shopify, WhatsApp, and manual entry</p>
        </div>
      </div>

      <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 p-4 shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <Input
            placeholder="Search orders, customers, tracking..."
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            className="lg:col-span-2"
          />
          <Select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            options={[{ value: '', label: 'All Statuses' }, ...ORDER_STATUS_OPTIONS]}
            placeholder="All Statuses"
          />
          <Select
            value={filters.source}
            onChange={(e) => handleFilterChange('source', e.target.value)}
            options={[{ value: '', label: 'All Sources' }, ...ORDER_SOURCE_OPTIONS]}
            placeholder="All Sources"
          />
          <Select
            value={filters.paymentStatus}
            onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
            options={[{ value: '', label: 'All Payment Status' }, ...PAYMENT_STATUS_OPTIONS]}
            placeholder="All Payment Status"
          />
          <div className="flex gap-2">
            <Input type="date" value={filters.from} onChange={(e) => handleFilterChange('from', e.target.value)} placeholder="From" className="w-full" />
            <Input type="date" value={filters.to} onChange={(e) => handleFilterChange('to', e.target.value)} placeholder="To" className="w-full" />
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        keyExtractor={(row) => row.id}
        onRowClick={(row) => setViewOrder(row)}
        selectedKeys={selectedOrders}
        onSelectionChange={handleSelectionChange}
        loading={loading}
        emptyMessage="No orders found"
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

      {viewOrder && (
        <Modal
          isOpen={!!viewOrder}
          onClose={() => setViewOrder(null)}
          title={`Order ${viewOrder.internalOrderId}`}
          size="xl"
        >
          <OrderDetail order={viewOrder} onClose={() => setViewOrder(null)} />
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Order"
        message="Are you sure you want to delete this order? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  )
}

function OrderDetail({ order, onClose }: { order: any; onClose: () => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <OrderSourceBadge source={order.source} />
              <StatusBadge status={order.status} type="order" className="ml-2" />
            </div>
            <StatusBadge status={order.paymentStatus} type="payment" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-secondary-500 dark:text-secondary-400">Order Date</p><p className="font-medium">{formatDate(order.orderDate, 'DD MMM YYYY HH:mm')}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Customer</p><p className="font-medium">{order.customer?.name}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Phone</p><p className="font-medium">{order.customer?.phone}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Email</p><p className="font-medium">{order.customer?.email || '-'}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Payment Type</p><p className="font-medium">{order.paymentType}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Courier</p><p className="font-medium">{order.courier?.name || '-'}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Tracking</p><p className="font-medium font-mono text-sm">{order.trackingNumber || '-'}</p></div>
            <div className="lg:col-span-2"><p className="text-secondary-500 dark:text-secondary-400">Shipping Address</p><p className="font-medium">{order.shippingAddress}, {order.shippingCity} {order.shippingPostalCode || ''}</p></div>
          </div>

          <div>
            <h4 className="font-semibold text-secondary-900 mb-3">Items</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Product</th>
                    <th className="px-4 py-2 text-left">Variant</th>
                    <th className="px-4 py-2 text-right">Qty</th>
                    <th className="px-4 py-2 text-right">Unit Price</th>
                    <th className="px-4 py-2 text-right">Discount</th>
                    <th className="px-4 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100">
                  {order.items?.map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2">{item.product?.name}</td>
                      <td className="px-4 py-2">{item.variant?.size} / {item.variant?.color}</td>
                      <td className="px-4 py-2 text-right">{item.quantity}</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(item.discount)}</td>
                      <td className="px-4 py-2 text-right font-medium">{formatCurrency(item.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-secondary-100 dark:border-secondary-700 pt-4">
            <h4 className="font-semibold text-secondary-900 mb-3">Payment Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-secondary-500 dark:text-secondary-400">Subtotal</p><p className="font-medium">{formatCurrency(order.subtotal)}</p></div>
              <div><p className="text-secondary-500 dark:text-secondary-400">Discount</p><p className="font-medium text-danger-600">-{formatCurrency(order.discount)}</p></div>
              <div><p className="text-secondary-500 dark:text-secondary-400">Shipping</p><p className="font-medium">{formatCurrency(order.shippingFee)}</p></div>
              <div><p className="text-secondary-500 dark:text-secondary-400">Tax</p><p className="font-medium">{formatCurrency(order.taxAmount)}</p></div>
              <div><p className="text-secondary-500 dark:text-secondary-400">Advance Received</p><p className="font-medium text-success-600">{formatCurrency(order.advanceReceived)}</p></div>
              <div><p className="text-secondary-500 dark:text-secondary-400">COD Received</p><p className="font-medium text-success-600">{formatCurrency(order.codReceived)}</p></div>
              <div><p className="text-secondary-500 dark:text-secondary-400">Refunds</p><p className="font-medium text-danger-600">{formatCurrency(order.refundAmount)}</p></div>
              <div className="lg:col-span-2 border-t border-secondary-100 dark:border-secondary-700 pt-2"><p className="text-secondary-500 dark:text-secondary-400">Total Amount</p><p className="text-xl font-bold dark:text-secondary-100">{formatCurrency(order.totalAmount)}</p></div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-secondary-50 rounded-lg p-4">
            <h4 className="font-semibold text-secondary-900 mb-3">Payment History</h4>
            <div className="space-y-2">
              {order.payments?.map((payment: any) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-white dark:bg-secondary-800 rounded">
                  <div>
                    <p className="text-sm font-medium">{payment.type}</p>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400">{formatDate(payment.receivedAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(payment.amount)}</p>
                    <StatusBadge status={payment.status} type="payment" size="sm" />
                  </div>
                </div>
              ))}
              {(!order.payments || order.payments.length === 0) && (
                <p className="text-secondary-500 dark:text-secondary-400 text-center py-4">No payments recorded</p>
              )}
            </div>
          </div>

          {order.shipments && order.shipments.length > 0 && (
            <div className="bg-secondary-50 rounded-lg p-4">
              <h4 className="font-semibold text-secondary-900 mb-3">Shipment History</h4>
              <div className="space-y-2">
                {order.shipments.map((shipment: any) => (
                  <div key={shipment.id} className="flex items-center justify-between p-3 bg-white dark:bg-secondary-800 rounded">
                    <div>
                      <p className="text-sm font-medium">{shipment.courier?.name}</p>
                      <p className="text-xs text-secondary-500 dark:text-secondary-400 font-mono">{shipment.trackingNumber}</p>
                    </div>
                    <StatusBadge status={shipment.status} type="shipment" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {order.returns && order.returns.length > 0 && (
            <div className="bg-secondary-50 rounded-lg p-4">
              <h4 className="font-semibold text-secondary-900 mb-3">Returns</h4>
              <div className="space-y-2">
                {order.returns.map((ret: any) => (
                  <div key={ret.id} className="flex items-center justify-between p-3 bg-white dark:bg-secondary-800 rounded">
                    <div>
                      <p className="text-sm font-medium">{ret.returnNumber}</p>
                      <p className="text-xs text-secondary-500 dark:text-secondary-400">{formatDate(ret.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(ret.refundAmount)}</p>
                      <StatusBadge status={ret.refundStatus} type="payment" size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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