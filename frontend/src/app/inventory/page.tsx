'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils'
import { BackButton } from '@/components/ui/BackButton'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Input'
import { DataTable, Column, Pagination } from '@/components/ui/Table'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown'
import { Loader2, Plus, Search, Edit, AlertTriangle, MoreVertical, Trash2, ArrowUpDown, Package } from 'lucide-react'
import { toast } from '@/components/ui/Toast'
import { useToast } from '@/components/ui/Toast'

export default function InventoryPageWrapper() {
  return (
    <Suspense fallback={null}>
      <InventoryPage />
    </Suspense>
  )
}

function InventoryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()

  const [variants, setVariants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedVariants, setSelectedVariants] = useState<string[]>([])
  const [viewVariant, setViewVariant] = useState<any>(null)
  const [adjustModal, setAdjustModal] = useState<{ variant: any; type: 'increase' | 'decrease' } | null>(null)

  const [filters, setFilters] = useState({
    page: parseInt(searchParams.get('page') || '1'),
    limit: 20,
    sortBy: 'stockQuantity',
    sortOrder: 'asc' as 'asc' | 'desc',
    query: searchParams.get('query') || '',
    status: searchParams.get('status') || '',
  })

  const fetchVariants = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value))
      })

      const response = await fetch(`/api/inventory?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setVariants(data.data)
        setTotalPages(data.meta.totalPages)
        setTotal(data.meta.total)
      } else {
        addToast({ type: 'error', title: 'Failed to fetch inventory', message: data.error })
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to fetch inventory' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVariants()
  }, [filters.page, filters.sortBy, filters.sortOrder])

  useEffect(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, String(value))
    })
    router.push(`/inventory?${params.toString()}`, { scroll: false })
  }, [filters.query, filters.status])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const getStockStatus = (v: any) => {
    if (v.stockQuantity === 0) return 'out'
    if (v.stockQuantity <= v.minStockLevel) return 'low'
    return 'ok'
  }

  const columns: Column<any>[] = [
    { key: 'product.name', header: 'Product', width: '180px', sortable: true, render: (row) => row.product?.name },
    { key: 'sku', header: 'SKU', width: '120px', sortable: true },
    { key: 'size', header: 'Size', width: '80px' },
    { key: 'color', header: 'Color', width: '100px' },
    { key: 'stockQuantity', header: 'Current Stock', width: '130px', sortable: true, render: (row) => {
      const status = getStockStatus(row)
      return (
        <span className={status === 'out' ? 'text-danger-600 font-bold' : status === 'low' ? 'text-warning-600 font-bold' : 'font-medium'}>
          {formatNumber(row.stockQuantity)}
        </span>
      )
    }},
    { key: 'minStockLevel', header: 'Min Level', width: '100px', render: (row) => formatNumber(row.minStockLevel) },
    { key: 'status', header: 'Stock Status', width: '130px', render: (row) => {
      const status = getStockStatus(row)
      return (
        <Badge variant={status === 'out' ? 'danger' : status === 'low' ? 'warning' : 'success'}>
          {status === 'out' ? 'Out of Stock' : status === 'low' ? 'Low Stock' : 'In Stock'}
        </Badge>
      )
    }},
    { key: 'purchasePrice', header: 'Purchase Price', width: '140px', render: (row) => formatCurrency(row.purchasePrice) },
    { key: 'sellingPrice', header: 'Selling Price', width: '140px', render: (row) => formatCurrency(row.sellingPrice) },
    { key: 'inventoryValue', header: 'Inventory Value', width: '150px', render: (row) => <span className="font-medium text-success-600">{formatCurrency(row.stockQuantity * row.purchasePrice)}</span> },
    { key: 'potentialRevenue', header: 'Potential Revenue', width: '150px', render: (row) => formatCurrency(row.stockQuantity * row.sellingPrice) },
    { key: 'actions', header: 'Actions', width: '120px', render: (row) => (
      <Dropdown
        trigger={<Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>}
        items={[
          { label: 'Adjust Stock (+)', value: 'increase', icon: <ArrowUpDown className="w-4 h-4" />, onClick: () => setAdjustModal({ variant: row, type: 'increase' }) },
          { label: 'Adjust Stock (-)', value: 'decrease', icon: <ArrowUpDown className="w-4 h-4" />, onClick: () => setAdjustModal({ variant: row, type: 'decrease' }) },
          { label: 'Edit Variant', value: 'edit', icon: <Edit className="w-4 h-4" />, onClick: () => router.push(`/products/${row.productId}/variants/${row.id}/edit`) },
        ]}
      />
    )},
  ]

  const handleSelectionChange = (keys: string[]) => setSelectedVariants(keys)

  const handleAdjust = async (quantity: number) => {
    if (!adjustModal) return
    try {
      const response = await fetch('/api/inventory/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: adjustModal.variant.productId,
          variantId: adjustModal.variant.id,
          type: 'ADJUSTMENT',
          quantity: adjustModal.type === 'increase' ? quantity : -quantity,
          referenceType: 'MANUAL_ADJUSTMENT',
          notes: `Manual ${adjustModal.type} adjustment`,
        }),
      })
      const data = await response.json()
      if (data.success) {
        addToast({ type: 'success', title: 'Stock adjusted successfully' })
        fetchVariants()
      } else {
        addToast({ type: 'error', title: 'Failed to adjust stock', message: data.error })
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to adjust stock' })
    }
    setAdjustModal(null)
  }

  const lowStockCount = variants.filter(v => getStockStatus(v) === 'low').length
  const outOfStockCount = variants.filter(v => getStockStatus(v) === 'out').length

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Inventory</h1>
          <p className="text-secondary-500 dark:text-secondary-400 mt-1">Track stock levels, low stock alerts, and inventory value</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-warning-600"><AlertTriangle className="w-4 h-4" />Low: {lowStockCount}</span>
            <span className="flex items-center gap-1 text-danger-600"><Package className="w-4 h-4" />Out: {outOfStockCount}</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 p-4 shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            placeholder="Search products, SKU..."
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            className="lg:col-span-2"
          />
          <Select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            options={[{ value: '', label: 'All' }, { value: 'low', label: 'Low Stock' }, { value: 'out', label: 'Out of Stock' }, { value: 'ok', label: 'In Stock' }]}
            placeholder="Stock Status"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={variants}
        keyExtractor={(row) => row.id}
        onRowClick={(row) => setViewVariant(row)}
        selectedKeys={selectedVariants}
        onSelectionChange={handleSelectionChange}
        loading={loading}
        emptyMessage="No inventory items found"
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

      {adjustModal && (
        <AdjustStockModal
          variant={adjustModal.variant}
          type={adjustModal.type}
          onClose={() => setAdjustModal(null)}
          onConfirm={handleAdjust}
        />
      )}

      {viewVariant && (
        <Modal
          isOpen={!!viewVariant}
          onClose={() => setViewVariant(null)}
          title={`Inventory: ${viewVariant.product?.name} - ${viewVariant.size}/${viewVariant.color}`}
          size="lg"
        >
          <InventoryDetail variant={viewVariant} onClose={() => setViewVariant(null)} />
        </Modal>
      )}
    </div>
  )
}

function InventoryDetail({ variant, onClose }: { variant: any; onClose: () => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div><p className="text-secondary-500 dark:text-secondary-400">Product</p><p className="font-medium">{variant.product?.name}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">SKU</p><p className="font-medium font-mono">{variant.sku}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">Size / Color</p><p className="font-medium">{variant.size} / {variant.color}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">Current Stock</p><p className="text-2xl font-bold text-secondary-900">{formatNumber(variant.stockQuantity)}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">Min Stock Level</p><p className="font-medium">{formatNumber(variant.minStockLevel)}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">Status</p><p className="font-medium">{variant.isActive ? 'Active' : 'Inactive'}</p></div>
      </div>

      <div className="bg-secondary-50 rounded-lg p-4">
        <h4 className="font-semibold text-secondary-900 mb-3">Valuation</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-secondary-900">{formatCurrency(variant.stockQuantity * variant.purchasePrice)}</p>
            <p className="text-sm text-secondary-500 dark:text-secondary-400">Inventory Value (Cost)</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-success-600">{formatCurrency(variant.stockQuantity * variant.sellingPrice)}</p>
            <p className="text-sm text-secondary-500 dark:text-secondary-400">Potential Revenue</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary-600">{formatCurrency(variant.stockQuantity * (variant.sellingPrice - variant.purchasePrice))}</p>
            <p className="text-sm text-secondary-500 dark:text-secondary-400">Potential Gross Profit</p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-secondary-900 mb-3">Recent Movements</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {variant.inventoryMovements?.slice(0, 10).map((movement: any) => (
            <div key={movement.id} className="flex items-center justify-between p-3 bg-white dark:bg-secondary-800 rounded">
              <div className="flex items-center gap-3">
                <Badge variant={
                  movement.type === 'PURCHASE' ? 'success' :
                  movement.type === 'SALE' ? 'danger' :
                  movement.type === 'RETURN' ? 'info' :
                  movement.type === 'DAMAGE' ? 'warning' :
                  movement.type === 'ADJUSTMENT' ? 'primary' : 'secondary'
                }>{movement.type}</Badge>
                <div>
                  <p className="text-sm font-medium">{movement.type === 'SALE' || movement.type === 'DAMAGE' ? '-' : '+'}{formatNumber(Math.abs(movement.quantity))}</p>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400">{formatDate(movement.createdAt, 'DD MMM HH:mm')}</p>
                </div>
              </div>
              <div className="text-right text-sm">
                <p className="font-medium">{formatCurrency(movement.unitCost || 0)}</p>
                <p className="text-secondary-500 dark:text-secondary-400">{movement.referenceType}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AdjustStockModal({ variant, type, onClose, onConfirm }: { variant: any; type: 'increase' | 'decrease'; onClose: () => void; onConfirm: (qty: number) => void }) {
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (quantity <= 0) return
    setLoading(true)
    await onConfirm(quantity)
    setLoading(false)
  }

  return (
    <Modal isOpen={true} onClose={onClose} title={`Adjust Stock (${type === 'increase' ? '+' : '-'})`} size="sm">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Current Stock: {formatNumber(variant.stockQuantity)}
          </label>
          <Input
            type="number"
            label="Quantity"
            placeholder="Enter quantity"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            min={1}
            max={type === 'decrease' ? variant.stockQuantity : 999999}
          />
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant={type === 'increase' ? 'primary' : 'warning'} type="submit" isLoading={loading}>
            {type === 'increase' ? 'Increase' : 'Decrease'} Stock
          </Button>
        </div>
      </form>
    </Modal>
  )
}