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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Loader2, Plus, Search, Eye, Edit, Receipt, MoreVertical, Trash2, AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react'
import { TAX_STATUS_OPTIONS } from '@/types'
import { toast } from '@/components/ui/Toast'
import { useToast } from '@/components/ui/Toast'

export default function TaxesPageWrapper() {
  return (
    <Suspense fallback={null}>
      <TaxesPage />
    </Suspense>
  )
}

function TaxesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()

  const [taxes, setTaxes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedTaxes, setSelectedTaxes] = useState<string[]>([])
  const [viewTax, setViewTax] = useState<any>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const [filters, setFilters] = useState({
    page: parseInt(searchParams.get('page') || '1'),
    limit: 20,
    sortBy: 'dueDate',
    sortOrder: 'asc' as 'asc' | 'desc',
    query: searchParams.get('query') || '',
    status: searchParams.get('status') || '',
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
  })

  const fetchTaxes = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value))
      })

      const response = await fetch(`/api/taxes?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setTaxes(data.data)
        setTotalPages(data.meta.totalPages)
        setTotal(data.meta.total)
      } else {
        addToast({ type: 'error', title: 'Failed to fetch taxes', message: data.error })
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to fetch tax records' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTaxes()
  }, [filters.page, filters.sortBy, filters.sortOrder])

  useEffect(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, String(value))
    })
    router.push(`/taxes?${params.toString()}`, { scroll: false })
  }, [filters.query, filters.status, filters.from, filters.to])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const columns: Column<any>[] = [
    { key: 'taxType', header: 'Tax Type', width: '160px' },
    { key: 'period', header: 'Period', width: '120px' },
    { key: 'dueDate', header: 'Due Date', width: '120px', sortable: true, render: (row) => formatDate(row.dueDate, 'DD MMM YYYY') },
    { key: 'amount', header: 'Amount', width: '130px', sortable: true, render: (row) => <span className="font-medium">{formatCurrency(row.amount)}</span> },
    { key: 'status', header: 'Status', width: '120px', sortable: true, render: (row) => <Badge variant={row.status === 'PAID' ? 'success' : row.status === 'OVERDUE' ? 'danger' : 'warning'}>{row.status}</Badge> },
    { key: 'paidDate', header: 'Paid Date', width: '120px', render: (row) => row.paidDate ? formatDate(row.paidDate, 'DD MMM YYYY') : '-' },
    { key: 'reference', header: 'Reference', width: '150px', render: (row) => row.challanNo || row.reference || '-' },
    { key: 'actions', header: 'Actions', width: '100px', render: (row) => (
      <Dropdown
        trigger={<Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>}
        items={[
          { label: 'View', value: 'view', icon: <Eye className="w-4 h-4" />, onClick: () => setViewTax(row) },
          { label: 'Edit', value: 'edit', icon: <Edit className="w-4 h-4" />, onClick: () => router.push(`/taxes/${row.id}/edit`) },
          { label: 'Delete', value: 'delete', icon: <Trash2 className="w-4 h-4" />, danger: true, onClick: () => setDeleteConfirm(row.id) },
        ]}
      />
    )},
  ]

  const handleSelectionChange = (keys: string[]) => setSelectedTaxes(keys)

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      const response = await fetch(`/api/taxes/${deleteConfirm}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        addToast({ type: 'success', title: 'Tax record deleted' })
        fetchTaxes()
      } else {
        addToast({ type: 'error', title: 'Failed to delete', message: data.error })
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to delete tax record' })
    }
    setDeleteConfirm(null)
  }

  const totalAmount = taxes.reduce((sum, t) => sum + t.amount, 0)
  const paidAmount = taxes.filter(t => t.status === 'PAID').reduce((sum, t) => sum + t.amount, 0)
  const pendingAmount = taxes.filter(t => t.status === 'PENDING').reduce((sum, t) => sum + t.amount, 0)
  const overdueAmount = taxes.filter(t => t.status === 'OVERDUE').reduce((sum, t) => sum + t.amount, 0)
  const paidCount = taxes.filter(t => t.status === 'PAID').length
  const pendingCount = taxes.filter(t => t.status === 'PENDING').length
  const overdueCount = taxes.filter(t => t.status === 'OVERDUE').length

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Tax Records</h1>
          <p className="text-secondary-500 dark:text-secondary-400 mt-1">Manage tax obligations and payments</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => router.push('/taxes/new')}>
            <Plus className="w-4 h-4 mr-2" />Add Tax Record
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Total Tax</p>
                <p className="text-2xl font-bold text-secondary-900">{formatCurrency(totalAmount)}</p>
              </div>
              <Receipt className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Paid</p>
                <p className="text-2xl font-bold text-success-600">{formatCurrency(paidAmount)}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-success-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Pending</p>
                <p className="text-2xl font-bold text-warning-600">{formatCurrency(pendingAmount)}</p>
              </div>
              <Clock className="w-8 h-8 text-warning-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Overdue</p>
                <p className="text-2xl font-bold text-danger-600">{formatCurrency(overdueAmount)}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-danger-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card variant="bordered">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-success-600">{paidCount}</p>
            <p className="text-sm text-secondary-500 dark:text-secondary-400">Paid</p>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-warning-600">{pendingCount}</p>
            <p className="text-sm text-secondary-500 dark:text-secondary-400">Pending</p>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-danger-600">{overdueCount}</p>
            <p className="text-sm text-secondary-500 dark:text-secondary-400">Overdue</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 p-4 shadow-card mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Input
            placeholder="Search tax records..."
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            className="lg:col-span-2"
          />
          <Select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            options={[{ value: '', label: 'All Status' }, ...TAX_STATUS_OPTIONS]}
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
        data={taxes}
        keyExtractor={(row) => row.id}
        onRowClick={(row) => setViewTax(row)}
        selectedKeys={selectedTaxes}
        onSelectionChange={handleSelectionChange}
        loading={loading}
        emptyMessage="No tax records found"
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

      {viewTax && (
        <Modal
          isOpen={!!viewTax}
          onClose={() => setViewTax(null)}
          title={`Tax: ${viewTax.taxType} - ${viewTax.period}`}
          size="lg"
        >
          <TaxDetail tax={viewTax} onClose={() => setViewTax(null)} />
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Tax Record"
        message="Are you sure you want to delete this tax record?"
        confirmText="Delete"
        variant="danger"
      />
    </div>
  )
}

function TaxDetail({ tax, onClose }: { tax: any; onClose: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Badge variant={
            tax.status === 'PAID' ? 'success' :
            tax.status === 'OVERDUE' ? 'danger' : 'warning'
          }>{tax.status}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div><p className="text-secondary-500 dark:text-secondary-400">Tax Type</p><p className="font-medium">{tax.taxType}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">Period</p><p className="font-medium">{tax.period}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">Due Date</p><p className="font-medium">{formatDate(tax.dueDate)}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">Amount</p><p className="font-medium text-success-600 text-xl">{formatCurrency(tax.amount)}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">Status</p><p className="font-medium"><Badge variant={tax.status === 'PAID' ? 'success' : tax.status === 'OVERDUE' ? 'danger' : 'warning'}>{tax.status}</Badge></p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">Paid Date</p><p className="font-medium">{tax.paidDate ? formatDate(tax.paidDate) : '-'}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">Reference</p><p className="font-medium">{tax.reference || '-'}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">Challan No</p><p className="font-medium">{tax.challanNo || '-'}</p></div>
      </div>

      {tax.notes && (
        <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4">
          <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-2">Notes</h4>
          <p className="text-secondary-600 dark:text-secondary-400">{tax.notes}</p>
        </div>
      )}

      {tax.attachmentUrl && (
        <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4">
          <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-2">Attachment</h4>
          <a href={tax.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline flex items-center gap-2">
            <FileText className="w-4 h-4" />
            View Attachment
          </a>
        </div>
      )}
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