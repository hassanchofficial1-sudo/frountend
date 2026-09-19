'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { BackButton } from '@/components/ui/BackButton'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Input'
import { DataTable, Column, Pagination } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Loader2, Search, Filter, Eye, MoreVertical } from 'lucide-react'
import { toast } from '@/components/ui/Toast'
import { useToast } from '@/components/ui/Toast'

const MODULE_OPTIONS = [
  { value: '', label: 'All Modules' },
  { value: 'ORDER', label: 'Orders' },
  { value: 'CUSTOMER', label: 'Customers' },
  { value: 'PRODUCT', label: 'Products' },
  { value: 'INVENTORY', label: 'Inventory' },
  { value: 'PURCHASE', label: 'Purchases' },
  { value: 'PAYMENT', label: 'Payments' },
  { value: 'RETURN', label: 'Returns' },
  { value: 'EXPENSE', label: 'Expenses' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'ELECTRICITY', label: 'Electricity' },
  { value: 'TAX', label: 'Taxes' },
  { value: 'SETTINGS', label: 'Settings' },
  { value: 'INTEGRATION', label: 'Integrations' },
  { value: 'USER', label: 'Users' },
  { value: 'SHIPMENT', label: 'Shipments' },
  { value: 'COURIER', label: 'Couriers' },
  { value: 'AUTH', label: 'Auth' },
]

const ACTION_OPTIONS = [
  { value: '', label: 'All Actions' },
  { value: 'CREATE', label: 'Create' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'DELETE', label: 'Delete' },
  { value: 'SYNC', label: 'Sync' },
  { value: 'LOGIN', label: 'Login' },
  { value: 'LOGOUT', label: 'Logout' },
]

export default function AuditLogsPageWrapper() {
  return (
    <Suspense fallback={null}>
      <AuditLogsPage />
    </Suspense>
  )
}

function AuditLogsPage() {
  const searchParams = useSearchParams()
  const { addToast } = useToast()

  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [viewLog, setViewLog] = useState<any>(null)

  const [filters, setFilters] = useState({
    page: parseInt(searchParams.get('page') || '1'),
    limit: 50,
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc',
    query: searchParams.get('query') || '',
    userId: searchParams.get('userId') || '',
    module: searchParams.get('module') || '',
    action: searchParams.get('action') || '',
    recordId: searchParams.get('recordId') || '',
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
  })

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value))
      })

      const response = await fetch(`/api/audit-logs?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setLogs(data.data)
        setTotalPages(data.meta.totalPages)
        setTotal(data.meta.total)
      } else {
        addToast({ type: 'error', title: 'Failed to fetch audit logs', message: data.error })
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to fetch audit logs' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [filters.page, filters.sortBy, filters.sortOrder])

  useEffect(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, String(value))
    })
    window.history.replaceState(null, '', `/audit-logs?${params.toString()}`)
  }, [filters.query, filters.userId, filters.module, filters.action, filters.recordId, filters.from, filters.to])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const columns: Column<any>[] = [
    { key: 'createdAt', header: 'Timestamp', width: '180px', sortable: true, render: (row) => formatDate(row.createdAt, 'DD MMM YYYY HH:mm:ss') },
    { key: 'user.name', header: 'User', width: '160px', render: (row) => row.user?.name || 'System' },
    { key: 'user.role', header: 'Role', width: '120px', render: (row) => row.user?.role ? <Badge variant={row.user.role === 'SUPER_ADMIN' ? 'danger' : row.user.role === 'ADMIN' ? 'primary' : 'secondary'}>{row.user.role}</Badge> : '-' },
    { key: 'action', header: 'Action', width: '120px', sortable: true, render: (row) => <Badge variant={
      row.action === 'CREATE' ? 'success' :
      row.action === 'UPDATE' ? 'primary' :
      row.action === 'DELETE' ? 'danger' :
      row.action === 'SYNC' ? 'warning' : 'default'
    }>{row.action}</Badge> },
    { key: 'module', header: 'Module', width: '140px', sortable: true, render: (row) => <Badge variant="secondary">{row.module}</Badge> },
    { key: 'recordId', header: 'Record ID', width: '140px', render: (row) => row.recordId ? <span className="font-mono text-xs">{row.recordId}</span> : '-' },
    { key: 'ipAddress', header: 'IP', width: '140px', render: (row) => row.ipAddress || '-' },
    { key: 'details', header: 'Details', width: '100px', render: (row) => (
      <div className="flex items-center gap-2">
        {row.oldValue && <Badge variant="danger">Old</Badge>}
        {row.newValue && <Badge variant="success">New</Badge>}
      </div>
    )},
  ]

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Audit Logs</h1>
          <p className="text-secondary-500 dark:text-secondary-400 mt-1">Track all system changes and user actions</p>
        </div>
      </div>

      <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 p-4 shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <Input
            placeholder="Search actions, modules, users..."
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            className="lg:col-span-2"
          />
          <Select
            value={filters.module}
            onChange={(e) => handleFilterChange('module', e.target.value)}
            options={MODULE_OPTIONS}
            placeholder="All Modules"
          />
          <Select
            value={filters.action}
            onChange={(e) => handleFilterChange('action', e.target.value)}
            options={ACTION_OPTIONS}
            placeholder="All Actions"
          />
          <div className="flex gap-2">
            <Input type="date" value={filters.from} onChange={(e) => handleFilterChange('from', e.target.value)} placeholder="From" className="w-full" />
            <Input type="date" value={filters.to} onChange={(e) => handleFilterChange('to', e.target.value)} placeholder="To" className="w-full" />
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        keyExtractor={(row) => row.id}
        onRowClick={(row) => setViewLog(row)}
        loading={loading}
        emptyMessage="No audit logs found"
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

      {viewLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setViewLog(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-secondary-200">
              <h2 className="text-xl font-semibold">Audit Log Details</h2>
              <button onClick={() => setViewLog(null)} className="p-2 text-secondary-400 hover:text-secondary-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-secondary-500 dark:text-secondary-400">Action</p><p className="font-medium"><Badge variant={
                    viewLog.action === 'CREATE' ? 'success' :
                    viewLog.action === 'UPDATE' ? 'primary' :
                    viewLog.action === 'DELETE' ? 'danger' :
                    viewLog.action === 'SYNC' ? 'warning' : 'default'
                  }>{viewLog.action}</Badge></p></div>
                  <div><p className="text-secondary-500 dark:text-secondary-400">Module</p><p className="font-medium"><Badge variant="secondary">{viewLog.module}</Badge></p></div>
                  <div><p className="text-secondary-500 dark:text-secondary-400">User</p><p className="font-medium">{viewLog.user?.name || 'System'}</p></div>
                  <div><p className="text-secondary-500 dark:text-secondary-400">Role</p><p className="font-medium">{viewLog.user?.role || '-'}</p></div>
                  <div><p className="text-secondary-500 dark:text-secondary-400">Timestamp</p><p className="font-medium">{formatDate(viewLog.createdAt, 'DD MMM YYYY HH:mm:ss')}</p></div>
                  <div><p className="text-secondary-500 dark:text-secondary-400">IP Address</p><p className="font-mono text-sm">{viewLog.ipAddress || '-'}</p></div>
                  <div><p className="text-secondary-500 dark:text-secondary-400">Record ID</p><p className="font-mono text-sm">{viewLog.recordId || '-'}</p></div>
                  <div><p className="text-secondary-500 dark:text-secondary-400">User Agent</p><p className="font-mono text-xs truncate">{viewLog.userAgent || '-'}</p></div>
                </div>

                {viewLog.oldValue && (
                  <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
                    <h4 className="font-semibold text-danger-800 mb-2">Previous Values</h4>
                    <pre className="text-sm text-danger-700 overflow-x-auto">{JSON.stringify(viewLog.oldValue, null, 2)}</pre>
                  </div>
                )}

                {viewLog.newValue && (
                  <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                    <h4 className="font-semibold text-success-800 mb-2">New Values</h4>
                    <pre className="text-sm text-success-700 overflow-x-auto">{JSON.stringify(viewLog.newValue, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}