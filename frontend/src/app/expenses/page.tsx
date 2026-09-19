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
import { Loader2, Plus, Search, Eye, Edit, DollarSign, Zap, Receipt, BarChart3, MoreVertical, Trash2, CreditCard } from 'lucide-react'
import { EXPENSE_CATEGORY_OPTIONS } from '@/types'
import { toast } from '@/components/ui/Toast'
import { useToast } from '@/components/ui/Toast'

const EXPENSE_TABS = [
  { value: 'all', label: 'All Expenses' },
  { value: 'general', label: 'General' },
  { value: 'marketing', label: 'Marketing Ads' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'tax', label: 'Tax Records' },
]

export default function ExpensesPageWrapper() {
  return (
    <Suspense fallback={null}>
      <ExpensesPage />
    </Suspense>
  )
}

function ExpensesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()

  const [activeTab, setActiveTab] = useState('all')
  const [expenses, setExpenses] = useState<any[]>([])
  const [marketingExpenses, setMarketingExpenses] = useState<any[]>([])
  const [electricityBills, setElectricityBills] = useState<any[]>([])
  const [taxRecords, setTaxRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [viewExpense, setViewExpense] = useState<any>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; type: string } | null>(null)

  const [filters, setFilters] = useState({
    page: parseInt(searchParams.get('page') || '1'),
    limit: 20,
    sortBy: 'date',
    sortOrder: 'desc' as 'asc' | 'desc',
    query: searchParams.get('query') || '',
    category: searchParams.get('category') || '',
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value))
      })

      const [expensesRes, marketingRes, electricityRes, taxRes] = await Promise.all([
        fetch(`/api/expenses?${params.toString()}`),
        fetch(`/api/marketing?${params.toString()}`),
        fetch(`/api/electricity?${params.toString()}`),
        fetch(`/api/taxes?${params.toString()}`),
      ])

      const [expensesData, marketingData, electricityData, taxData] = await Promise.all([
        expensesRes.json(),
        marketingRes.json(),
        electricityRes.json(),
        taxRes.json(),
      ])

      if (expensesData.success) {
        setExpenses(expensesData.data)
        setTotalPages(expensesData.meta.totalPages)
        setTotal(expensesData.meta.total)
      }
      if (marketingData.success) setMarketingExpenses(marketingData.data)
      if (electricityData.success) setElectricityBills(electricityData.data)
      if (taxData.success) setTaxRecords(taxData.data)
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to fetch expenses' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [activeTab, filters.page, filters.sortBy, filters.sortOrder])

  useEffect(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, String(value))
    })
    router.push(`/expenses?${params.toString()}`, { scroll: false })
  }, [filters.query, filters.category, filters.from, filters.to])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const getCurrentData = () => {
    switch (activeTab) {
      case 'marketing': return marketingExpenses
      case 'electricity': return electricityBills
      case 'tax': return taxRecords
      default: return expenses
    }
  }

  const getCurrentColumns = (): Column<any>[] => {
    switch (activeTab) {
      case 'marketing':
        return [
          { key: 'date', header: 'Date', width: '120px', sortable: true, render: (row) => formatDate(row.date, 'DD MMM YYYY') },
          { key: 'platform', header: 'Platform', width: '120px', render: (row) => <Badge variant={row.platform === 'FACEBOOK' ? 'primary' : row.platform === 'INSTAGRAM' ? 'danger' : row.platform === 'GOOGLE' ? 'success' : 'secondary'}>{row.platform}</Badge> },
          { key: 'campaignName', header: 'Campaign', width: '200px', render: (row) => row.campaignName || '-' },
          { key: 'amount', header: 'Amount', width: '130px', sortable: true, render: (row) => <span className="font-medium">{formatCurrency(row.amount)}</span> },
          { key: 'impressions', header: 'Impressions', width: '120px', render: (row) => formatNumber(row.impressions || 0) },
          { key: 'clicks', header: 'Clicks', width: '100px', render: (row) => formatNumber(row.clicks || 0) },
          { key: 'conversions', header: 'Conversions', width: '120px', render: (row) => formatNumber(row.conversions || 0) },
          { key: 'roas', header: 'ROAS', width: '100px', render: (row) => row.roas ? `${row.roas.toFixed(2)}x` : '-' },
          { key: 'actions', header: 'Actions', width: '100px', render: (row) => (
            <Dropdown trigger={<Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>} items={[
              { label: 'View', value: 'view', icon: <Eye className="w-4 h-4" />, onClick: () => setViewExpense({ ...row, type: 'marketing' }) },
              { label: 'Edit', value: 'edit', icon: <Edit className="w-4 h-4" />, onClick: () => router.push(`/marketing/${row.id}/edit`) },
              { label: 'Delete', value: 'delete', icon: <Trash2 className="w-4 h-4" />, danger: true, onClick: () => setDeleteConfirm({ id: row.id, type: 'marketing' }) },
            ]} />
          )},
        ]
      case 'electricity':
        return [
          { key: 'billDate', header: 'Bill Date', width: '120px', sortable: true, render: (row) => formatDate(row.billDate, 'DD MMM YYYY') },
          { key: 'meterNumber', header: 'Meter', width: '120px' },
          { key: 'previousReading', header: 'Prev Reading', width: '130px', render: (row) => formatNumber(row.previousReading) },
          { key: 'currentReading', header: 'Curr Reading', width: '130px', render: (row) => formatNumber(row.currentReading) },
          { key: 'unitsConsumed', header: 'Units', width: '100px', render: (row) => formatNumber(row.unitsConsumed) },
          { key: 'billAmount', header: 'Amount', width: '130px', sortable: true, render: (row) => <span className="font-medium">{formatCurrency(row.billAmount)}</span> },
          { key: 'status', header: 'Status', width: '120px', sortable: true, render: (row) => <Badge variant={row.status === 'PAID' ? 'success' : row.status === 'OVERDUE' ? 'danger' : 'warning'}>{row.status}</Badge> },
          { key: 'dueDate', header: 'Due Date', width: '120px', render: (row) => row.dueDate ? formatDate(row.dueDate, 'DD MMM YYYY') : '-' },
          { key: 'actions', header: 'Actions', width: '100px', render: (row) => (
            <Dropdown trigger={<Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>} items={[
              { label: 'View', value: 'view', icon: <Eye className="w-4 h-4" />, onClick: () => setViewExpense({ ...row, type: 'electricity' }) },
              { label: 'Edit', value: 'edit', icon: <Edit className="w-4 h-4" />, onClick: () => router.push(`/electricity/${row.id}/edit`) },
              { label: 'Delete', value: 'delete', icon: <Trash2 className="w-4 h-4" />, danger: true, onClick: () => setDeleteConfirm({ id: row.id, type: 'electricity' }) },
            ]} />
          )},
        ]
      case 'tax':
        return [
          { key: 'dueDate', header: 'Due Date', width: '120px', sortable: true, render: (row) => formatDate(row.dueDate, 'DD MMM YYYY') },
          { key: 'taxType', header: 'Tax Type', width: '140px' },
          { key: 'period', header: 'Period', width: '120px' },
          { key: 'amount', header: 'Amount', width: '130px', sortable: true, render: (row) => <span className="font-medium">{formatCurrency(row.amount)}</span> },
          { key: 'status', header: 'Status', width: '120px', sortable: true, render: (row) => <Badge variant={row.status === 'PAID' ? 'success' : row.status === 'OVERDUE' ? 'danger' : 'warning'}>{row.status}</Badge> },
          { key: 'paidDate', header: 'Paid Date', width: '120px', render: (row) => row.paidDate ? formatDate(row.paidDate, 'DD MMM YYYY') : '-' },
          { key: 'reference', header: 'Reference', width: '150px', render: (row) => row.challanNo || row.reference || '-' },
          { key: 'actions', header: 'Actions', width: '100px', render: (row) => (
            <Dropdown trigger={<Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>} items={[
              { label: 'View', value: 'view', icon: <Eye className="w-4 h-4" />, onClick: () => setViewExpense({ ...row, type: 'tax' }) },
              { label: 'Edit', value: 'edit', icon: <Edit className="w-4 h-4" />, onClick: () => router.push(`/taxes/${row.id}/edit`) },
              { label: 'Delete', value: 'delete', icon: <Trash2 className="w-4 h-4" />, danger: true, onClick: () => setDeleteConfirm({ id: row.id, type: 'tax' }) },
            ]} />
          )},
        ]
      default:
        return [
          { key: 'date', header: 'Date', width: '120px', sortable: true, render: (row) => formatDate(row.date, 'DD MMM YYYY') },
          { key: 'category', header: 'Category', width: '160px', sortable: true, render: (row) => (
            <Badge variant={
              row.category.includes('ADS') ? 'primary' :
              row.category === 'ELECTRICITY' ? 'warning' :
              row.category === 'TAX' ? 'danger' :
              row.category === 'COURIER' ? 'info' :
              row.category === 'PACKAGING' ? 'secondary' : 'default'
            }>{row.category.replace(/_/g, ' ')}</Badge>
          )},
          { key: 'description', header: 'Description', width: '250px', render: (row) => row.description },
          { key: 'amount', header: 'Amount', width: '130px', sortable: true, render: (row) => <span className="font-medium">{formatCurrency(row.amount)}</span> },
          { key: 'paymentMethod', header: 'Method', width: '120px', render: (row) => row.paymentMethod },
          { key: 'reference', header: 'Reference', width: '140px', render: (row) => row.reference || '-' },
          { key: 'createdBy', header: 'Created By', width: '140px', render: (row) => row.createdBy?.name || '-' },
          { key: 'actions', header: 'Actions', width: '100px', render: (row) => (
            <Dropdown trigger={<Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>} items={[
              { label: 'View', value: 'view', icon: <Eye className="w-4 h-4" />, onClick: () => setViewExpense({ ...row, type: 'general' }) },
              { label: 'Edit', value: 'edit', icon: <Edit className="w-4 h-4" />, onClick: () => router.push(`/expenses/${row.id}/edit`) },
              { label: 'Delete', value: 'delete', icon: <Trash2 className="w-4 h-4" />, danger: true, onClick: () => setDeleteConfirm({ id: row.id, type: 'general' }) },
            ]} />
          )},
        ]
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      const endpoint = deleteConfirm.type === 'general' ? '/api/expenses' :
                       deleteConfirm.type === 'marketing' ? '/api/marketing' :
                       deleteConfirm.type === 'electricity' ? '/api/electricity' : '/api/taxes'
      
      const response = await fetch(`${endpoint}/${deleteConfirm.id}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        addToast({ type: 'success', title: 'Expense deleted' })
        fetchData()
      } else {
        addToast({ type: 'error', title: 'Failed to delete', message: data.error })
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to delete expense' })
    }
    setDeleteConfirm(null)
  }

  const totalAmount = getCurrentData().reduce((sum: number, item: any) => sum + (item.amount || item.billAmount || 0), 0)

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Expenses</h1>
          <p className="text-secondary-500 dark:text-secondary-400 mt-1">Track all business expenses including marketing, electricity, and taxes</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => router.push('/expenses/new')}>
            <Plus className="w-4 h-4 mr-2" />New Expense
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 p-4 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <Tabs tabs={EXPENSE_TABS} activeTab={activeTab} onChange={setActiveTab} variant="pills" />
          <div className="text-lg font-semibold text-secondary-900">
            Total: {formatCurrency(totalAmount)}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            placeholder="Search expenses..."
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            className="lg:col-span-2"
          />
          {activeTab === 'all' && (
            <Select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              options={[{ value: '', label: 'All Categories' }, ...EXPENSE_CATEGORY_OPTIONS]}
              placeholder="All Categories"
            />
          )}
          <div className="flex gap-2">
            <Input type="date" value={filters.from} onChange={(e) => handleFilterChange('from', e.target.value)} placeholder="From" className="w-full" />
            <Input type="date" value={filters.to} onChange={(e) => handleFilterChange('to', e.target.value)} placeholder="To" className="w-full" />
          </div>
        </div>
      </div>

      <DataTable
        columns={getCurrentColumns()}
        data={getCurrentData()}
        keyExtractor={(row) => row.id}
        onRowClick={(row) => setViewExpense({ ...row, type: activeTab === 'all' ? 'general' : activeTab })}
        selectedKeys={selectedItems}
        onSelectionChange={setSelectedItems}
        loading={loading}
        emptyMessage={`No ${activeTab === 'all' ? 'expenses' : activeTab} found`}
        showCheckboxes
        striped
        hoverable
      />

      {total > 0 && activeTab === 'all' && (
        <Pagination
          currentPage={filters.page}
          totalPages={totalPages}
          onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
          showPageSize
          pageSize={filters.limit}
          onPageSizeChange={(limit) => setFilters(prev => ({ ...prev, limit, page: 1 }))}
        />
      )}

      {viewExpense && (
        <Modal
          isOpen={!!viewExpense}
          onClose={() => setViewExpense(null)}
          title={`Expense Details`}
          size="lg"
        >
          <ExpenseDetail expense={viewExpense} onClose={() => setViewExpense(null)} />
        </Modal>
      )}

      {deleteConfirm && (
        <ConfirmDialog
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={handleDelete}
          title="Delete Expense"
          message="Are you sure you want to delete this expense record?"
          confirmText="Delete"
          variant="danger"
        />
      )}
    </div>
  )
}

function ExpenseDetail({ expense, onClose }: { expense: any; onClose: () => void }) {
  const isMarketing = expense.type === 'marketing'
  const isElectricity = expense.type === 'electricity'
  const isTax = expense.type === 'tax'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Badge variant={
            expense.category?.includes('ADS') ? 'primary' :
            expense.platform === 'FACEBOOK' ? 'primary' :
            expense.platform === 'INSTAGRAM' ? 'danger' :
            expense.platform === 'GOOGLE' ? 'success' :
            expense.category === 'ELECTRICITY' ? 'warning' :
            expense.category === 'TAX' ? 'danger' : 'default'
          }>
            {isMarketing ? expense.platform : isElectricity ? 'Electricity' : isTax ? 'Tax' : expense.category?.replace(/_/g, ' ')}
          </Badge>
        </div>
        {isMarketing && <Badge variant={expense.platform === 'FACEBOOK' ? 'primary' : expense.platform === 'INSTAGRAM' ? 'danger' : 'success'}>{expense.platform}</Badge>}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        {isMarketing && (
          <>
            <div><p className="text-secondary-500 dark:text-secondary-400">Date</p><p className="font-medium">{formatDate(expense.date)}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Campaign</p><p className="font-medium">{expense.campaignName || '-'}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Ad Set</p><p className="font-medium">{expense.adSetName || '-'}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Ad Name</p><p className="font-medium">{expense.adName || '-'}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Amount</p><p className="font-medium text-success-600">{formatCurrency(expense.amount)}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Impressions</p><p className="font-medium">{formatNumber(expense.impressions || 0)}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Clicks</p><p className="font-medium">{formatNumber(expense.clicks || 0)}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Conversions</p><p className="font-medium">{formatNumber(expense.conversions || 0)}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">CTR</p><p className="font-medium">{(expense.impressions && expense.clicks ? ((expense.clicks / expense.impressions) * 100).toFixed(2) : 0)}%</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">CPC</p><p className="font-medium">{expense.cpc ? formatCurrency(expense.cpc) : '-'}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">CPM</p><p className="font-medium">{expense.cpm ? formatCurrency(expense.cpm) : '-'}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">ROAS</p><p className="font-medium">{expense.roas ? `${expense.roas.toFixed(2)}x` : '-'}</p></div>
          </>
        )}

        {isElectricity && (
          <>
            <div><p className="text-secondary-500 dark:text-secondary-400">Bill Date</p><p className="font-medium">{formatDate(expense.billDate)}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Meter Number</p><p className="font-medium">{expense.meterNumber}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Previous Reading</p><p className="font-medium">{formatNumber(expense.previousReading)}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Current Reading</p><p className="font-medium">{formatNumber(expense.currentReading)}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Units Consumed</p><p className="font-medium">{formatNumber(expense.unitsConsumed)}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Bill Amount</p><p className="font-medium text-success-600">{formatCurrency(expense.billAmount)}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Status</p><p className="font-medium"><Badge variant={expense.status === 'PAID' ? 'success' : expense.status === 'OVERDUE' ? 'danger' : 'warning'}>{expense.status}</Badge></p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Due Date</p><p className="font-medium">{expense.dueDate ? formatDate(expense.dueDate) : '-'}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Paid Date</p><p className="font-medium">{expense.paidDate ? formatDate(expense.paidDate) : '-'}</p></div>
          </>
        )}

        {isTax && (
          <>
            <div><p className="text-secondary-500 dark:text-secondary-400">Tax Type</p><p className="font-medium">{expense.taxType}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Period</p><p className="font-medium">{expense.period}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Due Date</p><p className="font-medium">{formatDate(expense.dueDate)}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Amount</p><p className="font-medium text-success-600">{formatCurrency(expense.amount)}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Status</p><p className="font-medium"><Badge variant={expense.status === 'PAID' ? 'success' : expense.status === 'OVERDUE' ? 'danger' : 'warning'}>{expense.status}</Badge></p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Paid Date</p><p className="font-medium">{expense.paidDate ? formatDate(expense.paidDate) : '-'}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Reference</p><p className="font-medium">{expense.challanNo || expense.reference || '-'}</p></div>
          </>
        )}

        {!isMarketing && !isElectricity && !isTax && (
          <>
            <div><p className="text-secondary-500 dark:text-secondary-400">Date</p><p className="font-medium">{formatDate(expense.date)}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Category</p><p className="font-medium">{expense.category?.replace(/_/g, ' ')}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Description</p><p className="font-medium">{expense.description}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Amount</p><p className="font-medium text-success-600">{formatCurrency(expense.amount)}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Payment Method</p><p className="font-medium">{expense.paymentMethod}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Reference</p><p className="font-medium">{expense.reference || '-'}</p></div>
            <div><p className="text-secondary-500 dark:text-secondary-400">Created By</p><p className="font-medium">{expense.createdBy?.name || '-'}</p></div>
          </>
        )}
      </div>

      {expense.notes && (
        <div className="bg-secondary-50 rounded-lg p-4">
          <h4 className="font-semibold text-secondary-900 mb-2">Notes</h4>
          <p className="text-secondary-600 dark:text-secondary-400">{expense.notes}</p>
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

function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-PK').format(num)
}