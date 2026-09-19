'use client'

import { useState, useEffect } from 'react'
import { formatDate, getDateRange } from '@/lib/utils'
import { BackButton } from '@/components/ui/BackButton'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Loader2, FileText, BarChart3, TrendingUp, Calendar, ChevronDown, DollarSign, Package, Truck, RotateCcw, CreditCard, ShoppingCart, Building2, Zap, Receipt, Users, Plus } from 'lucide-react'
import { DATE_RANGE_OPTIONS } from '@/types'
import { toast } from '@/components/ui/Toast'
import { useToast } from '@/components/ui/Toast'

const REPORT_TYPES = [
  { value: 'sales', label: 'Sales Report', icon: DollarSign, description: 'Detailed sales with items, customers, payments' },
  { value: 'orders', label: 'Orders Report', icon: Package, description: 'All orders with status, source, payment details' },
  { value: 'inventory', label: 'Inventory Report', icon: Package, description: 'Current stock levels, valuation, low stock' },
  { value: 'expenses', label: 'Expenses Report', icon: CreditCard, description: 'All expenses including marketing, electricity, tax' },
  { value: 'profit-loss', label: 'Profit & Loss', icon: TrendingUp, description: 'Revenue, COGS, expenses, net profit/loss' },
  { value: 'cash-flow', label: 'Cash Flow', icon: DollarSign, description: 'Cash inflows, outflows, net cash position' },
  { value: 'cod', label: 'COD Report', icon: CreditCard, description: 'COD pending, collected, settled, outstanding' },
  { value: 'returns', label: 'Returns Report', icon: RotateCcw, description: 'Returned items, reasons, refunds, restocking' },
  { value: 'purchases', label: 'Purchases Report', icon: ShoppingCart, description: 'Supplier purchases, invoices, payments' },
  { value: 'suppliers', label: 'Suppliers Report', icon: Building2, description: 'Supplier performance, outstanding balances' },
  { value: 'delivery', label: 'Delivery Report', icon: Truck, description: 'Shipment status, courier performance, delivery times' },
  { value: 'customers', label: 'Customers Report', icon: Users, description: 'Customer orders, spending, payment history' },
]

export default function ReportsPage() {
  const { addToast } = useToast()
  const [selectedReport, setSelectedReport] = useState<typeof REPORT_TYPES[0] | null>(null)
  const [dateRange, setDateRange] = useState('this_month')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [generating, setGenerating] = useState<string | null>(null)

  const handleGenerate = async (type: string) => {
    setGenerating(type)
    try {
      let from: Date, to: Date
      
      if (dateRange === 'custom') {
        if (!customFrom || !customTo) {
          addToast({ type: 'error', title: 'Please select date range' })
          setGenerating(null)
          return
        }
        from = new Date(customFrom)
        to = new Date(customTo)
        to.setHours(23, 59, 59, 999)
      } else {
        const range = getDateRange(dateRange)
        from = range.from
        to = range.to
      }

      const params = new URLSearchParams({
        type,
        from: from.toISOString(),
        to: to.toISOString(),
        format: 'csv',
      })

      const response = await fetch(`/api/reports?${params.toString()}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        const reportType = REPORT_TYPES.find(r => r.value === type)
        a.download = `${type}-${formatDate(from, 'YYYY-MM-DD')}-to-${formatDate(to, 'YYYY-MM-DD')}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
        addToast({ type: 'success', title: 'Report downloaded', message: `${reportType?.label} generated successfully` })
      } else {
        const error = await response.json()
        addToast({ type: 'error', title: 'Failed to generate', message: error.error })
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to generate report' })
    } finally {
      setGenerating(null)
    }
  }

  const isCustomRange = dateRange === 'custom'

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Reports</h1>
          <p className="text-secondary-500 dark:text-secondary-400 mt-1">Generate and export business reports in CSV format</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Date Range</CardTitle>
            <div className="flex items-center gap-4">
              <Select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                options={DATE_RANGE_OPTIONS}
                className="w-48"
              />
              {isCustomRange && (
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    placeholder="From"
                    className="w-36"
                  />
                  <span className="text-secondary-500 dark:text-secondary-400">to</span>
                  <Input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    placeholder="To"
                    className="w-36"
                  />
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {REPORT_TYPES.map((report) => (
              <Card key={report.value} variant="bordered" className="h-full hover:shadow-card-hover transition-shadow cursor-pointer"
                onClick={() => handleGenerate(report.value)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary-100 text-primary-600">
                      <report.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-secondary-900 dark:text-secondary-100">{report.label}</h4>
                      <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1 line-clamp-2">{report.description}</p>
                    </div>
                    {generating === report.value && (
                      <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-6 text-center">
            <FileText className="w-12 h-12 mx-auto text-secondary-300 dark:text-secondary-600 mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">Scheduled Reports Coming Soon</h3>
            <p className="text-secondary-500 dark:text-secondary-400 mb-4">Automate report generation and email delivery on daily, weekly, or monthly schedules</p>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />Create Schedule
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}