import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DashboardMetrics, StatusBreakdownCard } from '@/components/dashboard/MetricCards'
import { DateRangeSelector } from '@/components/dashboard/DateRangeSelector'
import { ChartCard } from '@/components/charts/Charts'
import { LineChartComponent, BarChartComponent, PieChartComponent } from '@/components/charts/Charts'
import { formatCurrency, cn } from '@/lib/utils'
import { RefreshCw, Package, CreditCard } from 'lucide-react'
import { apiGet } from '@/lib/server/api'
import type { DashboardMetrics } from '@/types'

interface DashboardCharts {
  dailySales: { name: string; sales: number }[]
  monthlySales: { name: string; revenue: number }[]
  ordersOverTime: { name: string; orders: number }[]
  deliveredVsReturned: { name: string; value: number }[]
  sourceBreakdown: { name: string; value: number }[]
  advanceVsCod: { name: string; value: number }[]
  expenseBreakdown: { name: string; value: number }[]
  inventoryMovement: { name: string; purchases: number; sales: number; returns: number }[]
}

interface DashboardResponse {
  user: { id: string; username: string; email: string; name: string; role: string }
  metrics: DashboardMetrics
  charts: DashboardCharts
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ dateRange?: string }>
}) {
  const params = await searchParams
  const dateRange = params.dateRange || 'this_month'

  const envelope = await apiGet<DashboardResponse>(
    `/api/dashboard?dateRange=${encodeURIComponent(dateRange)}`
  )
  const session = envelope?.data?.user ?? null
  const metrics = envelope?.data?.metrics ?? null
  const charts = envelope?.data?.charts ?? null

  if (!metrics || !charts) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-800 px-4">
        <div className="text-center space-y-4">
          <Package className="w-12 h-12 text-primary-600 mx-auto" />
          <h1 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100">
            Dashboard unavailable
          </h1>
          <p className="text-secondary-500 dark:text-secondary-400">
            Please make sure the backend server is running, then refresh the page.
          </p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout user={{ name: session?.name || 'User', email: session?.email || '', role: session?.role || 'ORDER_MANAGER' }}>
      <div className="space-y-6">
        {/* Header with Date Range */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
            <p className="text-secondary-500 dark:text-secondary-400 mt-1">Overview of your business performance</p>
          </div>
          <div className="flex items-center gap-3">
            <DateRangeSelector value={dateRange} />
          <button className="btn btn-secondary flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <DashboardMetrics metrics={metrics} loading={false} />

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Daily Sales" subtitle="Revenue trend over time">
            <LineChartComponent
              data={charts.dailySales}
              xKey="name"
              yKeys={['sales']}
              labels={['Sales (PKR)']}
              colors={['#0ea5e9']}
            />
          </ChartCard>

          <ChartCard title="Monthly Sales" subtitle="Monthly revenue comparison">
            <BarChartComponent
              data={charts.monthlySales}
              xKey="name"
              yKeys={['revenue']}
              labels={['Revenue (PKR)']}
              colors={['#22c55e']}
            />
          </ChartCard>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Orders Over Time" subtitle="Order volume trend">
            <LineChartComponent
              data={charts.ordersOverTime}
              xKey="name"
              yKeys={['orders']}
              labels={['Orders']}
              colors={['#8b5cf6']}
            />
          </ChartCard>

          <ChartCard title="Delivered vs Returned" subtitle="Order fulfillment status">
            <PieChartComponent
              data={charts.deliveredVsReturned}
              colors={['#22c55e', '#ef4444']}
            />
          </ChartCard>
        </div>

        {/* Charts Row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard title="Order Sources" subtitle="Where orders come from">
            <PieChartComponent
              data={charts.sourceBreakdown}
              colors={['#0ea5e9', '#22c55e', '#f59e0b']}
            />
          </ChartCard>

          <ChartCard title="Advance vs COD" subtitle="Payment collection breakdown">
            <PieChartComponent
              data={charts.advanceVsCod}
              colors={['#3b82f6', '#f59e0b']}
            />
          </ChartCard>

          <ChartCard title="Expense Breakdown" subtitle="Where money goes">
            <PieChartComponent
              data={charts.expenseBreakdown}
            />
          </ChartCard>
        </div>

        {/* Status Breakdown Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatusBreakdownCard
            title="Order Status Breakdown"
            icon={<Package className="w-5 h-5" />}
            iconBg="bg-blue-100"
            total={metrics.orders.total}
            items={[
              { label: 'New', value: metrics.orders.new, color: '#3b82f6' },
              { label: 'Confirmed', value: metrics.orders.confirmed, color: '#8b5cf6' },
              { label: 'Packed', value: metrics.orders.packed, color: '#f59e0b' },
              { label: 'Dispatched', value: metrics.orders.dispatched, color: '#f97316' },
              { label: 'In Transit', value: metrics.orders.inTransit, color: '#06b6d4' },
              { label: 'Out for Delivery', value: metrics.orders.outForDelivery, color: '#ec4899' },
              { label: 'Delivered', value: metrics.orders.delivered, color: '#22c55e' },
              { label: 'Returned', value: metrics.orders.returned, color: '#ef4444' },
              { label: 'Cancelled', value: metrics.orders.cancelled, color: '#64748b' },
            ]}
          />

          <StatusBreakdownCard
            title="Payment Status Breakdown"
            icon={<CreditCard className="w-5 h-5" />}
            iconBg="bg-green-100"
            total={metrics.orders.total}
            items={[
              { label: 'Unpaid', value: 0, color: '#ef4444' }, // Would need calculation
              { label: 'Partial', value: 0, color: '#f59e0b' },
              { label: 'Advance Received', value: 0, color: '#3b82f6' },
              { label: 'COD Pending', value: 0, color: '#f97316' },
              { label: 'Paid', value: metrics.orders.delivered, color: '#22c55e' },
              { label: 'Refunded', value: metrics.orders.returned, color: '#ef4444' },
            ]}
          />
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 shadow-card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Financial Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-secondary-600 dark:text-secondary-400">Total Revenue</span>
                <span className="font-semibold text-secondary-900">{formatCurrency(metrics.financial.totalRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600 dark:text-secondary-400">Money Received</span>
                <span className="font-semibold text-success-600">{formatCurrency(metrics.payments.advanceReceived + metrics.payments.codReceived)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600 dark:text-secondary-400">COD Pending</span>
                <span className="font-semibold text-warning-600">{formatCurrency(metrics.payments.codPending)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600 dark:text-secondary-400">Outstanding</span>
                <span className="font-semibold text-danger-600">{formatCurrency(metrics.payments.totalOutstanding)}</span>
              </div>
              <div className="border-t border-secondary-100 dark:border-secondary-700 pt-3 flex justify-between">
                <span className="text-secondary-600 dark:text-secondary-400">Total Expenses</span>
                <span className="font-semibold text-secondary-900">{formatCurrency(metrics.expenses.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600 dark:text-secondary-400">Purchases</span>
                <span className="font-semibold text-secondary-900">{formatCurrency(metrics.financial.totalPurchases)}</span>
              </div>
              <div className="border-t border-secondary-100 dark:border-secondary-700 pt-3 flex justify-between text-lg">
                <span className="font-medium text-secondary-900">Net Profit/Loss</span>
                <span className={cn('font-bold', metrics.financial.netProfitLoss >= 0 ? 'text-success-600' : 'text-danger-600')}>
                  {formatCurrency(metrics.financial.netProfitLoss)}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 shadow-card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Expense Breakdown</h3>
            <div className="space-y-3">
              {[
                { label: 'Facebook/Instagram Ads', value: metrics.expenses.facebookAds, color: '#3b82f6' },
                { label: 'Tax', value: metrics.expenses.tax, color: '#8b5cf6' },
                { label: 'Electricity', value: metrics.expenses.electricity, color: '#f59e0b' },
                { label: 'Courier', value: metrics.expenses.courier, color: '#ef4444' },
                { label: 'Packaging', value: metrics.expenses.packaging, color: '#06b6d4' },
                { label: 'Other', value: metrics.expenses.other, color: '#64748b' },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-secondary-600 dark:text-secondary-400">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-secondary-900 w-24 text-right">
                      {formatCurrency(item.value)}
                    </span>
                    <div className="flex-1 max-w-[200px] h-2 bg-secondary-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${metrics.expenses.total > 0 ? (item.value / metrics.expenses.total) * 100 : 0}%`,
                          backgroundColor: item.color 
                        }} 
                      />
                    </div>
                    <span className="text-sm text-secondary-500 dark:text-secondary-400 w-10 text-right">
                      {metrics.expenses.total > 0 ? `${((item.value / metrics.expenses.total) * 100).toFixed(1)}%` : '0%'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}