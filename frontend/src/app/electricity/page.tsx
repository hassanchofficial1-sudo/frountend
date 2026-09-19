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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Loader2, Plus, Search, Eye, Edit, Zap, MoreVertical, Trash2, TrendingUp, Calculator, Gauge, FileText } from 'lucide-react'
import { toast } from '@/components/ui/Toast'
import { useToast } from '@/components/ui/Toast'

export default function ElectricityPageWrapper() {
  return (
    <Suspense fallback={null}>
      <ElectricityPage />
    </Suspense>
  )
}

function ElectricityPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()

  const [bills, setBills] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedBills, setSelectedBills] = useState<string[]>([])
  const [viewBill, setViewBill] = useState<any>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const [filters, setFilters] = useState({
    page: parseInt(searchParams.get('page') || '1'),
    limit: 20,
    sortBy: 'billDate',
    sortOrder: 'desc' as 'asc' | 'desc',
    query: searchParams.get('query') || '',
    status: searchParams.get('status') || '',
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
  })

  const fetchBills = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value))
      })

      const response = await fetch(`/api/electricity?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setBills(data.data)
        setTotalPages(data.meta.totalPages)
        setTotal(data.meta.total)
      } else {
        addToast({ type: 'error', title: 'Failed to fetch bills', message: data.error })
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to fetch electricity bills' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBills()
  }, [filters.page, filters.sortBy, filters.sortOrder])

  useEffect(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, String(value))
    })
    router.push(`/electricity?${params.toString()}`, { scroll: false })
  }, [filters.query, filters.status, filters.from, filters.to])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const columns: Column<any>[] = [
    { key: 'meterNumber', header: 'Meter #', width: '120px' },
    { key: 'billDate', header: 'Bill Date', width: '120px', sortable: true, render: (row) => formatDate(row.billDate, 'DD MMM YYYY') },
    { key: 'previousReading', header: 'Prev Reading', width: '130px', render: (row) => formatNumber(row.previousReading) },
    { key: 'currentReading', header: 'Curr Reading', width: '130px', render: (row) => formatNumber(row.currentReading) },
    { key: 'unitsConsumed', header: 'Units', width: '100px', sortable: true, render: (row) => formatNumber(row.unitsConsumed) },
    { key: 'billAmount', header: 'Amount', width: '130px', sortable: true, render: (row) => <span className="font-medium">{formatCurrency(row.billAmount)}</span> },
    { key: 'status', header: 'Status', width: '120px', sortable: true, render: (row) => <Badge variant={row.status === 'PAID' ? 'success' : row.status === 'OVERDUE' ? 'danger' : 'warning'}>{row.status}</Badge> },
    { key: 'dueDate', header: 'Due Date', width: '120px', render: (row) => row.dueDate ? formatDate(row.dueDate, 'DD MMM YYYY') : '-' },
    { key: 'paidDate', header: 'Paid Date', width: '120px', render: (row) => row.paidDate ? formatDate(row.paidDate, 'DD MMM YYYY') : '-' },
    { key: 'actions', header: 'Actions', width: '100px', render: (row) => (
      <Dropdown
        trigger={<Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>}
        items={[
          { label: 'View', value: 'view', icon: <Eye className="w-4 h-4" />, onClick: () => setViewBill(row) },
          { label: 'Edit', value: 'edit', icon: <Edit className="w-4 h-4" />, onClick: () => router.push(`/electricity/${row.id}/edit`) },
          { label: 'Delete', value: 'delete', icon: <Trash2 className="w-4 h-4" />, danger: true, onClick: () => setDeleteConfirm(row.id) },
        ]}
      />
    )},
  ]

  const handleSelectionChange = (keys: string[]) => setSelectedBills(keys)

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      const response = await fetch(`/api/electricity/${deleteConfirm}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        addToast({ type: 'success', title: 'Bill deleted' })
        fetchBills()
      } else {
        addToast({ type: 'error', title: 'Failed to delete', message: data.error })
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to delete bill' })
    }
    setDeleteConfirm(null)
  }

  const totalAmount = bills.reduce((sum, b) => sum + b.billAmount, 0)
  const totalUnits = bills.reduce((sum, b) => sum + b.unitsConsumed, 0)
  const paidBills = bills.filter(b => b.status === 'PAID').length
  const pendingBills = bills.filter(b => b.status === 'PENDING').length
  const overdueBills = bills.filter(b => b.status === 'OVERDUE').length
  const avgUnits = bills.length > 0 ? Math.round(totalUnits / bills.length) : 0
  const avgCostPerUnit = totalUnits > 0 ? totalAmount / totalUnits : 0

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Electricity Bills</h1>
          <p className="text-secondary-500 dark:text-secondary-400 mt-1">Track electricity consumption and bills for your shop</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => router.push('/electricity/new')}>
            <Plus className="w-4 h-4 mr-2" />Add Bill
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Total Amount</p>
                <p className="text-2xl font-bold text-secondary-900">{formatCurrency(totalAmount)}</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Total Units</p>
                <p className="text-2xl font-bold text-secondary-900">{formatNumber(totalUnits)}</p>
              </div>
              <Gauge className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Avg Cost/Unit</p>
                <p className="text-2xl font-bold text-secondary-900">{formatCurrency(avgCostPerUnit)}</p>
              </div>
              <Calculator className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Avg Units/Month</p>
                <p className="text-2xl font-bold text-secondary-900">{formatNumber(avgUnits)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card variant="bordered">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-success-600">{paidBills}</p>
            <p className="text-sm text-secondary-500 dark:text-secondary-400">Paid</p>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-warning-600">{pendingBills}</p>
            <p className="text-sm text-secondary-500 dark:text-secondary-400">Pending</p>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-danger-600">{overdueBills}</p>
            <p className="text-sm text-secondary-500 dark:text-secondary-400">Overdue</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 p-4 shadow-card mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Input
            placeholder="Search bills..."
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            className="lg:col-span-2"
          />
          <Select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            options={[{ value: '', label: 'All Status' }, { value: 'PENDING', label: 'Pending' }, { value: 'PAID', label: 'Paid' }, { value: 'OVERDUE', label: 'Overdue' }]}
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
        data={bills}
        keyExtractor={(row) => row.id}
        onRowClick={(row) => setViewBill(row)}
        selectedKeys={selectedBills}
        onSelectionChange={handleSelectionChange}
        loading={loading}
        emptyMessage="No electricity bills found"
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

      {viewBill && (
        <Modal
          isOpen={!!viewBill}
          onClose={() => setViewBill(null)}
          title={`Electricity Bill: ${viewBill.meterNumber}`}
          size="lg"
        >
          <BillDetail bill={viewBill} onClose={() => setViewBill(null)} />
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Bill"
        message="Are you sure you want to delete this electricity bill?"
        confirmText="Delete"
        variant="danger"
      />
    </div>
  )
}

function BillDetail({ bill, onClose }: { bill: any; onClose: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Badge variant={
            bill.status === 'PAID' ? 'success' :
            bill.status === 'OVERDUE' ? 'danger' : 'warning'
          }>{bill.status}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div><p className="text-secondary-500 dark:text-secondary-400">Meter Number</p><p className="font-medium">{bill.meterNumber}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">Bill Date</p><p className="font-medium">{formatDate(bill.billDate)}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">Previous Reading</p><p className="font-medium">{formatNumber(bill.previousReading)}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">Current Reading</p><p className="font-medium">{formatNumber(bill.currentReading)}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">Units Consumed</p><p className="font-medium text-blue-600">{formatNumber(bill.unitsConsumed)}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">Bill Amount</p><p className="font-medium text-success-600 text-xl">{formatCurrency(bill.billAmount)}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">Status</p><p className="font-medium"><Badge variant={bill.status === 'PAID' ? 'success' : bill.status === 'OVERDUE' ? 'danger' : 'warning'}>{bill.status}</Badge></p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">Due Date</p><p className="font-medium">{bill.dueDate ? formatDate(bill.dueDate) : '-'}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">Paid Date</p><p className="font-medium">{bill.paidDate ? formatDate(bill.paidDate) : '-'}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">Payment Method</p><p className="font-medium">{bill.paymentMethod || '-'}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">Reference</p><p className="font-medium">{bill.paymentReference || '-'}</p></div>
      </div>

      {bill.notes && (
        <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4">
          <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-2">Notes</h4>
          <p className="text-secondary-600 dark:text-secondary-400">{bill.notes}</p>
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