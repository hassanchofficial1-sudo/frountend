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
import { Loader2, Search, Eye, Truck, MapPin, MoreVertical, Trash2, RefreshCw, Package } from 'lucide-react'
import { SHIPMENT_STATUS_OPTIONS } from '@/types'
import { toast } from '@/components/ui/Toast'
import { useToast } from '@/components/ui/Toast'

export default function ShipmentsPageWrapper() {
  return (
    <Suspense fallback={null}>
      <ShipmentsPage />
    </Suspense>
  )
}

function ShipmentsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()

  const [shipments, setShipments] = useState<any[]>([])
  const [couriers, setCouriers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedShipments, setSelectedShipments] = useState<string[]>([])
  const [viewShipment, setViewShipment] = useState<any>(null)
  const [syncLoading, setSyncLoading] = useState<string | null>(null)

  const [filters, setFilters] = useState({
    page: parseInt(searchParams.get('page') || '1'),
    limit: 20,
    sortBy: 'bookedAt',
    sortOrder: 'desc' as 'asc' | 'desc',
    query: searchParams.get('query') || '',
    status: searchParams.get('status') || '',
    courierId: searchParams.get('courierId') || '',
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
  })

  const fetchShipments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value))
      })

      const response = await fetch(`/api/shipments?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setShipments(data.data)
        setTotalPages(data.meta.totalPages)
        setTotal(data.meta.total)
      } else {
        addToast({ type: 'error', title: 'Failed to fetch shipments', message: data.error })
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to fetch shipments' })
    } finally {
      setLoading(false)
    }
  }

  const fetchCouriers = async () => {
    try {
      const response = await fetch('/api/couriers?limit=100')
      const data = await response.json()
      if (data.success) setCouriers(data.data)
    } catch (error) {
      console.error('Failed to fetch couriers')
    }
  }

  useEffect(() => {
    fetchShipments()
    fetchCouriers()
  }, [filters.page, filters.sortBy, filters.sortOrder])

  useEffect(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, String(value))
    })
    router.push(`/shipments?${params.toString()}`, { scroll: false })
  }, [filters.query, filters.status, filters.courierId, filters.from, filters.to])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handleSync = async (id: string) => {
    setSyncLoading(id)
    try {
      const response = await fetch(`/api/shipments/${id}/sync`, { method: 'POST' })
      const data = await response.json()
      if (data.success) {
        addToast({ type: 'success', title: 'Sync completed' })
        fetchShipments()
      } else {
        addToast({ type: 'error', title: 'Sync failed', message: data.error })
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to sync shipment' })
    } finally {
      setSyncLoading(null)
    }
  }

  const columns: Column<any>[] = [
    { key: 'trackingNumber', header: 'Tracking #', width: '160px', sortable: true, render: (row) => <span className="font-mono text-sm">{row.trackingNumber}</span> },
    { key: 'awbNumber', header: 'AWB', width: '140px', render: (row) => row.awbNumber || '-' },
    { key: 'order.internalOrderId', header: 'Order ID', width: '140px', render: (row) => row.order?.internalOrderId },
    { key: 'order.customer.name', header: 'Customer', width: '160px', render: (row) => row.order?.customer?.name },
    { key: 'courier.name', header: 'Courier', width: '140px', render: (row) => row.courier?.name },
    { key: 'status', header: 'Status', width: '150px', sortable: true, render: (row) => <StatusBadge status={row.status} type="shipment" /> },
    { key: 'codAmount', header: 'COD Amount', width: '130px', render: (row) => <span className="font-medium">{formatCurrency(row.codAmount)}</span> },
    { key: 'collectedAmount', header: 'Collected', width: '130px', render: (row) => <span className="text-success-600">{formatCurrency(row.collectedAmount)}</span> },
    { key: 'bookedAt', header: 'Booked', width: '130px', sortable: true, render: (row) => row.bookedAt ? formatDate(row.bookedAt, 'DD MMM YYYY') : '-' },
    { key: 'deliveredAt', header: 'Delivered', width: '130px', render: (row) => row.deliveredAt ? formatDate(row.deliveredAt, 'DD MMM YYYY') : '-' },
    { key: 'actions', header: 'Actions', width: '120px', render: (row) => (
      <Dropdown
        trigger={<Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>}
        items={[
          { label: 'View', value: 'view', icon: <Eye className="w-4 h-4" />, onClick: () => setViewShipment(row) },
          { label: 'Sync Status', value: 'sync', icon: <RefreshCw className="w-4 h-4" />, onClick: () => handleSync(row.id) },
        ]}
      />
    )},
  ]

  const handleSelectionChange = (keys: string[]) => setSelectedShipments(keys)

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Shipments</h1>
          <p className="text-secondary-500 dark:text-secondary-400 mt-1">Track all courier shipments and delivery status</p>
        </div>
      </div>

      <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 p-4 shadow-card mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <Input
            placeholder="Search shipments, tracking..."
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            className="lg:col-span-2"
          />
          <Select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            options={[{ value: '', label: 'All Status' }, ...SHIPMENT_STATUS_OPTIONS]}
            placeholder="All Status"
          />
          <Select
            value={filters.courierId}
            onChange={(e) => handleFilterChange('courierId', e.target.value)}
            options={[{ value: '', label: 'All Couriers' }, ...couriers.map(c => ({ value: c.id, label: c.name }))]}
            placeholder="All Couriers"
          />
          <div className="flex gap-2">
            <Input type="date" value={filters.from} onChange={(e) => handleFilterChange('from', e.target.value)} placeholder="From" className="w-full" />
            <Input type="date" value={filters.to} onChange={(e) => handleFilterChange('to', e.target.value)} placeholder="To" className="w-full" />
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={shipments}
        keyExtractor={(row) => row.id}
        onRowClick={(row) => setViewShipment(row)}
        selectedKeys={selectedShipments}
        onSelectionChange={handleSelectionChange}
        loading={loading}
        emptyMessage="No shipments found"
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

      {viewShipment && (
        <Modal
          isOpen={!!viewShipment}
          onClose={() => setViewShipment(null)}
          title={`Shipment ${viewShipment.trackingNumber}`}
          size="xl"
        >
          <ShipmentDetail shipment={viewShipment} onClose={() => setViewShipment(null)} />
        </Modal>
      )}
    </div>
  )
}

function ShipmentDetail({ shipment, onClose }: { shipment: any; onClose: () => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{shipment.trackingNumber}</h3>
              <p className="text-secondary-500 dark:text-secondary-400">AWB: {shipment.awbNumber || 'N/A'}</p>
            </div>
            <StatusBadge status={shipment.status} type="shipment" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-secondary-500 dark:text-secondary-400">Order</p><p className="font-medium">{shipment.order?.internalOrderId}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Courier</p><p className="font-medium">{shipment.courier?.name}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">COD Amount</p><p className="font-medium">{formatCurrency(shipment.codAmount)}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Collected</p><p className="font-medium text-success-600">{formatCurrency(shipment.collectedAmount)}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Booked</p><p className="font-medium">{shipment.bookedAt ? formatDate(shipment.bookedAt, 'DD MMM YYYY HH:mm') : '-'}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Picked Up</p><p className="font-medium">{shipment.pickedUpAt ? formatDate(shipment.pickedUpAt, 'DD MMM YYYY HH:mm') : '-'}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">In Transit</p><p className="font-medium">{shipment.inTransitAt ? formatDate(shipment.inTransitAt, 'DD MMM YYYY HH:mm') : '-'}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Out for Delivery</p><p className="font-medium">{shipment.outForDeliveryAt ? formatDate(shipment.outForDeliveryAt, 'DD MMM YYYY HH:mm') : '-'}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Delivered</p><p className="font-medium">{shipment.deliveredAt ? formatDate(shipment.deliveredAt, 'DD MMM YYYY HH:mm') : '-'}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Weight</p><p className="font-medium">{shipment.weight ? `${shipment.weight} kg` : '-'}</p></div>
            <div className="lg:col-span-2"><p className="text-secondary-500 dark:text-secondary-400">Delivery Address</p><p className="font-medium">{shipment.deliveryAddress}</p></div>
          </div>

          <div>
            <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-3">Tracking History</h4>
            <div className="space-y-3">
              {shipment.events?.map((event: any, index: number) => (
                <div key={event.id} className="flex items-start gap-4 p-4 bg-white rounded-lg border border-secondary-100">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${index === 0 ? 'bg-primary-100 text-primary-600' : 'bg-secondary-100 text-secondary-500'}`}>
                    {index === 0 ? <Package className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{event.status.replace(/_/g, ' ')}</p>
                    <p className="text-sm text-secondary-500 dark:text-secondary-400">{event.location || ''}</p>
                    <p className="text-sm text-secondary-500 dark:text-secondary-400">{event.description || ''}</p>
                    <p className="text-xs text-secondary-400 mt-1">{formatDate(event.timestamp, 'DD MMM YYYY HH:mm')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4">
            <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-3">Order Details</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-secondary-600 dark:text-secondary-400">Customer</span><span className="font-medium">{shipment.order?.customer?.name}</span></div>
              <div className="flex justify-between"><span className="text-secondary-600 dark:text-secondary-400">Phone</span><span className="font-medium">{shipment.order?.customer?.phone}</span></div>
              <div className="flex justify-between"><span className="text-secondary-600 dark:text-secondary-400">Order Total</span><span className="font-medium">{formatCurrency(shipment.order?.totalAmount)}</span></div>
              <div className="flex justify-between border-t border-secondary-200 pt-3"><span className="text-secondary-600 dark:text-secondary-400">COD Outstanding</span><span className={shipment.codAmount > shipment.collectedAmount ? 'font-bold text-danger-600' : 'font-bold text-success-600'}>{formatCurrency(shipment.codAmount - shipment.collectedAmount)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}