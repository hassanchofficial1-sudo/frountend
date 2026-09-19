'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { BackButton } from '@/components/ui/BackButton'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Input'
import { DataTable, Column, Pagination } from '@/components/ui/Table'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown'
import { Loader2, Plus, Search, Eye, Edit, Boxes, MoreVertical, Trash2, Tag } from 'lucide-react'
import { toast } from '@/components/ui/Toast'
import { useToast } from '@/components/ui/Toast'

export default function ProductsPageWrapper() {
  return (
    <Suspense fallback={null}>
      <ProductsPage />
    </Suspense>
  )
}

function ProductsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()

  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [viewProduct, setViewProduct] = useState<any>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const [filters, setFilters] = useState({
    page: parseInt(searchParams.get('page') || '1'),
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc',
    query: searchParams.get('query') || '',
    categoryId: searchParams.get('categoryId') || '',
    status: searchParams.get('status') || '',
  })

  const [categories, setCategories] = useState<any[]>([])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value))
      })

      const response = await fetch(`/api/products?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setProducts(data.data)
        setTotalPages(data.meta.totalPages)
        setTotal(data.meta.total)
      } else {
        addToast({ type: 'error', title: 'Failed to fetch products', message: data.error })
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to fetch products' })
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      if (data.success) setCategories(data.data)
    } catch (error) {
      console.error('Failed to fetch categories')
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [filters.page, filters.sortBy, filters.sortOrder])

  useEffect(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, String(value))
    })
    router.push(`/products?${params.toString()}`, { scroll: false })
  }, [filters.query, filters.categoryId, filters.status])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const columns: Column<any>[] = [
    { key: 'name', header: 'Product', width: '200px', sortable: true },
    { key: 'sku', header: 'SKU', width: '120px', sortable: true },
    { key: 'category', header: 'Category', width: '140px', render: (row) => row.category?.name || '-' },
    { key: 'variants', header: 'Variants', width: '100px', render: (row) => formatNumber(row._count?.variants || 0) },
    { key: 'sellingPrice', header: 'Selling Price', width: '140px', sortable: true, render: (row) => <span className="font-medium">{formatCurrency(row.sellingPrice)}</span> },
    { key: 'purchasePrice', header: 'Purchase Price', width: '140px', sortable: true, render: (row) => formatCurrency(row.purchasePrice) },
    { key: 'status', header: 'Status', width: '100px', sortable: true, render: (row) => <Badge variant={row.status ? 'success' : 'secondary'}>{row.status ? 'Active' : 'Inactive'}</Badge> },
    { key: 'isFeatured', header: 'Featured', width: '90px', render: (row) => <Badge variant={row.isFeatured ? 'primary' : 'default'}>{row.isFeatured ? 'Yes' : 'No'}</Badge> },
    { key: 'actions', header: 'Actions', width: '100px', render: (row) => (
      <Dropdown
        trigger={<Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>}
        items={[
          { label: 'View', value: 'view', icon: <Eye className="w-4 h-4" />, onClick: () => setViewProduct(row) },
          { label: 'Edit', value: 'edit', icon: <Edit className="w-4 h-4" />, onClick: () => router.push(`/products/${row.id}/edit`) },
          { label: 'Variants', value: 'variants', icon: <Boxes className="w-4 h-4" />, onClick: () => router.push(`/products/${row.id}/variants`) },
          { label: 'Delete', value: 'delete', icon: <Trash2 className="w-4 h-4" />, danger: true, onClick: () => setDeleteConfirm(row.id) },
        ]}
      />
    )},
  ]

  const handleSelectionChange = (keys: string[]) => setSelectedProducts(keys)

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      const response = await fetch(`/api/products/${deleteConfirm}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        addToast({ type: 'success', title: 'Product deleted' })
        fetchProducts()
      } else {
        addToast({ type: 'error', title: 'Failed to delete', message: data.error })
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to delete product' })
    }
    setDeleteConfirm(null)
  }

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Products</h1>
          <p className="text-secondary-500 dark:text-secondary-400 mt-1">Manage clothing products and variants</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => router.push('/products/new')}>
            <Plus className="w-4 h-4 mr-2" />New Product
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 p-4 shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            placeholder="Search products..."
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            className="lg:col-span-2"
          />
          <Select
            value={filters.categoryId}
            onChange={(e) => handleFilterChange('categoryId', e.target.value)}
            options={[{ value: '', label: 'All Categories' }, ...categories.map(c => ({ value: c.id, label: c.name }))]}
            placeholder="All Categories"
          />
          <Select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            options={[{ value: '', label: 'All' }, { value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }]}
            placeholder="All Status"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={products}
        keyExtractor={(row) => row.id}
        onRowClick={(row) => setViewProduct(row)}
        selectedKeys={selectedProducts}
        onSelectionChange={handleSelectionChange}
        loading={loading}
        emptyMessage="No products found"
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

      {viewProduct && (
        <Modal
          isOpen={!!viewProduct}
          onClose={() => setViewProduct(null)}
          title={`Product ${viewProduct.name}`}
          size="xl"
        >
          <ProductDetail product={viewProduct} onClose={() => setViewProduct(null)} />
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  )
}

function ProductDetail({ product, onClose }: { product: any; onClose: () => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={product.status ? 'success' : 'secondary'}>{product.status ? 'Active' : 'Inactive'}</Badge>
            {product.isFeatured && <Badge variant="primary">Featured</Badge>}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-secondary-500 dark:text-secondary-400">SKU</p><p className="font-medium">{product.sku}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Category</p><p className="font-medium">{product.category?.name || '-'}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Selling Price</p><p className="font-medium text-success-600">{formatCurrency(product.sellingPrice)}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Purchase Price</p><p className="font-medium">{formatCurrency(product.purchasePrice)}</p></div>
            <div className="lg:col-span-2"><p className="text-secondary-500 dark:text-secondary-400">Description</p><p className="font-medium">{product.description || '-'}</p></div>
          </div>

          {product.images && product.images.length > 0 && (
            <div>
              <h4 className="font-semibold text-secondary-900 mb-3">Images</h4>
              <div className="grid grid-cols-3 gap-2">
                {product.images.slice(0, 6).map((img: string, i: number) => (
                  <img key={i} src={img} alt={`${product.name} ${i + 1}`} className="w-full h-32 object-cover rounded-lg" />
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="font-semibold text-secondary-900 mb-3">Variants ({product.variants?.length || 0})</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-4 py-2 text-left">SKU</th>
                    <th className="px-4 py-2 text-left">Size</th>
                    <th className="px-4 py-2 text-left">Color</th>
                    <th className="px-4 py-2 text-right">Stock</th>
                    <th className="px-4 py-2 text-right">Min Level</th>
                    <th className="px-4 py-2 text-right">Purchase</th>
                    <th className="px-4 py-2 text-right">Selling</th>
                    <th className="px-4 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100">
                  {product.variants?.map((v: any) => (
                    <tr key={v.id}>
                      <td className="px-4 py-2 font-mono text-sm">{v.sku}</td>
                      <td className="px-4 py-2">{v.size}</td>
                      <td className="px-4 py-2">{v.color}</td>
                      <td className="px-4 py-2 text-right">
                        <span className={v.stockQuantity === 0 ? 'text-danger-600' : v.stockQuantity <= v.minStockLevel ? 'text-warning-600' : ''}>
                          {formatNumber(v.stockQuantity)}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right">{v.minStockLevel}</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(v.purchasePrice)}</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(v.sellingPrice)}</td>
                      <td className="px-4 py-2 text-center">
                        <Badge variant={v.isActive ? 'success' : 'secondary'}>
                          {v.isActive ? 'Active' : 'Inactive'}
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
            <h4 className="font-semibold text-secondary-900 mb-3">Quick Stats</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-secondary-600 dark:text-secondary-400">Total Variants</span>
                <span className="font-medium">{product._count?.variants || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary-600 dark:text-secondary-400">Total Stock</span>
                <span className="font-medium">{formatNumber(product.variants?.reduce((sum: number, v: any) => sum + v.stockQuantity, 0) || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary-600 dark:text-secondary-400">Inventory Value</span>
                <span className="font-medium text-success-600">{formatCurrency(product.variants?.reduce((sum: number, v: any) => sum + v.stockQuantity * v.purchasePrice, 0) || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary-600 dark:text-secondary-400">Potential Revenue</span>
                <span className="font-medium text-primary-600">{formatCurrency(product.variants?.reduce((sum: number, v: any) => sum + v.stockQuantity * v.sellingPrice, 0) || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary-600 dark:text-secondary-400">Times Ordered</span>
                <span className="font-medium">{product._count?.orderItems || 0}</span>
              </div>
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