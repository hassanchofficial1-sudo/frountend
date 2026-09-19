'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils'
import { BackButton } from '@/components/ui/BackButton'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Input'
import { DataTable, Column, Pagination } from '@/components/ui/Table'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown'
import { Loader2, Search, Eye, Wifi, MoreVertical, Trash2, Settings, Key, Globe, Shield } from 'lucide-react'
import { toast } from '@/components/ui/Toast'
import { useToast } from '@/components/ui/Toast'

export default function CouriersPage() {
  const router = useRouter()
  const { addToast } = useToast()

  const [couriers, setCouriers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedCouriers, setSelectedCouriers] = useState<string[]>([])
  const [viewCourier, setViewCourier] = useState<any>(null)
  const [testLoading, setTestLoading] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc',
    query: '',
    isActive: '',
  })

  const fetchCouriers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value))
      })

      const response = await fetch(`/api/couriers?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setCouriers(data.data)
        setTotalPages(data.meta.totalPages)
        setTotal(data.meta.total)
      } else {
        addToast({ type: 'error', title: 'Failed to fetch couriers', message: data.error })
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to fetch couriers' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCouriers()
  }, [filters.page, filters.sortBy, filters.sortOrder, filters.query, filters.isActive])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handleTest = async (id: string) => {
    setTestLoading(id)
    try {
      const response = await fetch(`/api/couriers/${id}/test`, { method: 'POST' })
      const data = await response.json()
      if (data.success) {
        addToast({ type: 'success', title: data.data.connected ? 'Connection successful' : 'Connection failed' })
        fetchCouriers()
      } else {
        addToast({ type: 'error', title: 'Test failed', message: data.error })
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to test connection' })
    } finally {
      setTestLoading(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      const response = await fetch(`/api/couriers/${deleteConfirm}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        addToast({ type: 'success', title: 'Courier deleted' })
        fetchCouriers()
      } else {
        addToast({ type: 'error', title: 'Failed to delete', message: data.error })
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to delete courier' })
    }
    setDeleteConfirm(null)
  }

  const columns: Column<any>[] = [
    { key: 'name', header: 'Name', width: '180px', sortable: true },
    { key: 'code', header: 'Code', width: '100px', render: (row) => <span className="font-mono text-sm">{row.code}</span> },
    { key: 'isActive', header: 'Status', width: '100px', sortable: true, render: (row) => <Badge variant={row.isActive ? 'success' : 'secondary'}>{row.isActive ? 'Active' : 'Inactive'}</Badge> },
    { key: 'isConnected', header: 'API', width: '100px', render: (row) => <Badge variant={row.isConnected ? 'success' : 'secondary'}>{row.isConnected ? 'Connected' : 'Not Connected'}</Badge> },
    { key: 'supportsCOD', header: 'COD', width: '80px', render: (row) => <Badge variant={row.supportsCOD ? 'success' : 'secondary'}>{row.supportsCOD ? 'Yes' : 'No'}</Badge> },
    { key: 'supportsTracking', header: 'Tracking', width: '100px', render: (row) => <Badge variant={row.supportsTracking ? 'success' : 'secondary'}>{row.supportsTracking ? 'Yes' : 'No'}</Badge> },
    { key: 'lastSyncAt', header: 'Last Sync', width: '140px', render: (row) => row.lastSyncAt ? formatDate(row.lastSyncAt) : 'Never' },
    { key: 'actions', header: 'Actions', width: '140px', render: (row) => (
      <Dropdown
        trigger={<Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>}
        items={[
          { label: 'View', value: 'view', icon: <Eye className="w-4 h-4" />, onClick: () => setViewCourier(row) },
          { label: 'Test Connection', value: 'test', icon: <Wifi className="w-4 h-4" />, onClick: () => handleTest(row.id) },
          { label: 'Delete', value: 'delete', icon: <Trash2 className="w-4 h-4" />, danger: true, onClick: () => setDeleteConfirm(row.id) },
        ]}
      />
    )},
  ]

  const handleSelectionChange = (keys: string[]) => setSelectedCouriers(keys)

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Couriers</h1>
          <p className="text-secondary-500 dark:text-secondary-400 mt-1">Manage courier partners and API integrations</p>
        </div>
      </div>

      <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 p-4 shadow-card mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            placeholder="Search couriers..."
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
        </div>
      </div>

      <DataTable
        columns={columns}
        data={couriers}
        keyExtractor={(row) => row.id}
        onRowClick={(row) => setViewCourier(row)}
        selectedKeys={selectedCouriers}
        onSelectionChange={handleSelectionChange}
        loading={loading}
        emptyMessage="No couriers found"
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

      {viewCourier && (
        <Modal
          isOpen={!!viewCourier}
          onClose={() => setViewCourier(null)}
          title={`Courier: ${viewCourier.name}`}
          size="lg"
        >
          <CourierDetail courier={viewCourier} onClose={() => setViewCourier(null)} testLoading={testLoading} onTest={() => handleTest(viewCourier.id)} />
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Courier"
        message="Are you sure you want to delete this courier?"
        confirmText="Delete"
        variant="danger"
      />
    </div>
  )
}

function CourierDetail({ courier, onClose, testLoading, onTest }: { courier: any; onClose: () => void; testLoading: string | null; onTest: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{courier.name}</h3>
          <p className="text-secondary-500 dark:text-secondary-400">Code: {courier.code}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={courier.isActive ? 'success' : 'secondary'}>{courier.isActive ? 'Active' : 'Inactive'}</Badge>
          <Badge variant={courier.isConnected ? 'success' : 'secondary'}>{courier.isConnected ? 'Connected' : 'Not Connected'}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div><p className="text-secondary-500 dark:text-secondary-400">API URL</p><p className="font-medium font-mono text-sm">{courier.apiUrl || 'Not configured'}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">Supports COD</p><p className="font-medium">{courier.supportsCOD ? 'Yes' : 'No'}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">Supports Tracking</p><p className="font-medium">{courier.supportsTracking ? 'Yes' : 'No'}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">Client ID</p><p className="font-medium font-mono text-sm">{courier.clientId || 'Not configured'}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">Last Sync</p><p className="font-medium">{courier.lastSyncAt ? formatDate(courier.lastSyncAt) : 'Never'}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">Last Success</p><p className="font-medium">{courier.lastSuccessAt ? formatDate(courier.lastSuccessAt) : 'Never'}</p></div>
        {courier.lastFailureAt && (
          <div className="lg:col-span-2 text-danger-600">
            <p className="text-secondary-500 dark:text-secondary-400">Last Error</p>
            <p className="text-sm">{courier.lastError}</p>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4 border-t border-secondary-100">
        <Button variant="outline" onClick={onTest} isLoading={testLoading === courier.id} className="flex-1">
          <Wifi className="w-4 h-4 mr-2" />Test Connection
        </Button>
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