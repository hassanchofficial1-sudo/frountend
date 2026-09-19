'use client'

import { cn } from '@/lib/utils'
import { formatCurrency, formatNumber } from '@/lib/utils'
import {
  Package,
  ShoppingBag,
  MessageCircle,
  Plus,
  CheckCircle,
  RotateCcw,
  XCircle,
  Clock,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Boxes,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Zap,
  Receipt,
  BarChart3,
} from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  trend?: 'up' | 'down' | 'neutral'
  loading?: boolean
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  changeLabel, 
  icon, 
  iconBg, 
  iconColor, 
  trend = 'neutral',
  loading = false
}: MetricCardProps) {
  return (
    <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 shadow-card hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            {loading ? (
              <div className="h-8 w-32 bg-secondary-200 dark:bg-secondary-700 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">{value}</p>
            )}
            {change !== undefined && change !== null && !loading && (
              <span className={cn(
                'flex items-center gap-1 text-sm font-medium',
                trend === 'up' ? 'text-success-600 dark:text-success-400' : trend === 'down' ? 'text-danger-600 dark:text-danger-400' : 'text-secondary-500 dark:text-secondary-400'
              )}>
                {trend === 'up' && <TrendingUp className="w-4 h-4" />}
                {trend === 'down' && <TrendingDown className="w-4 h-4" />}
                {trend === 'neutral' && <span>→</span>}
                <span>{change >= 0 ? '+' : ''}{change}%</span>
                {changeLabel && <span className="text-secondary-500 dark:text-secondary-400 font-normal">{changeLabel}</span>}
              </span>
            )}
          </div>
        </div>
        <div className={cn('p-3 rounded-xl', iconBg)}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export function DashboardMetrics({ metrics, loading = false }: { metrics: any; loading?: boolean }) {
  const cards: MetricCardProps[] = [
    {
      title: 'Total Orders',
      value: metrics.orders?.total || 0,
      icon: <Package className="w-6 h-6" />,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Shopify Orders',
      value: metrics.orders?.shopify || 0,
      icon: <ShoppingBag className="w-6 h-6" />,
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: 'WhatsApp Orders',
      value: metrics.orders?.whatsapp || 0,
      icon: <MessageCircle className="w-6 h-6" />,
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Manual Orders',
      value: metrics.orders?.manual || 0,
      icon: <Plus className="w-6 h-6" />,
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
    {
      title: 'New Orders',
      value: metrics.orders?.new || 0,
      icon: <Clock className="w-6 h-6" />,
      iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      title: 'Delivered',
      value: metrics.orders?.delivered || 0,
      change: metrics.orders?.deliveredChange,
      changeLabel: 'vs last period',
      trend: metrics.orders?.deliveredChange >= 0 ? 'up' : 'down',
      icon: <CheckCircle className="w-6 h-6" />,
      iconBg: 'bg-success-100 dark:bg-success-900/30',
      iconColor: 'text-success-600 dark:text-success-400',
    },
    {
      title: 'Returns',
      value: metrics.orders?.returned || 0,
      change: metrics.orders?.returnedChange,
      trend: metrics.orders?.returnedChange <= 0 ? 'up' : 'down',
      icon: <RotateCcw className="w-6 h-6" />,
      iconBg: 'bg-danger-100 dark:bg-danger-900/30',
      iconColor: 'text-danger-600 dark:text-danger-400',
    },
    {
      title: 'Cancelled',
      value: metrics.orders?.cancelled || 0,
      icon: <XCircle className="w-6 h-6" />,
      iconBg: 'bg-secondary-100 dark:bg-secondary-800',
      iconColor: 'text-secondary-600 dark:text-secondary-400',
    },
    {
      title: 'Total Sales',
      value: formatCurrency(metrics.payments?.totalSales || 0),
      change: metrics.payments?.salesChange,
      changeLabel: 'vs last period',
      trend: metrics.payments?.salesChange >= 0 ? 'up' : 'down',
      icon: <DollarSign className="w-6 h-6" />,
      iconBg: 'bg-success-100 dark:bg-success-900/30',
      iconColor: 'text-success-600 dark:text-success-400',
    },
    {
      title: 'Advance Received',
      value: formatCurrency(metrics.payments?.advanceReceived || 0),
      icon: <ArrowUpRight className="w-6 h-6" />,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'COD Received',
      value: formatCurrency(metrics.payments?.codReceived || 0),
      icon: <CreditCard className="w-6 h-6" />,
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'COD Pending',
      value: formatCurrency(metrics.payments?.codPending || 0),
      change: metrics.payments?.codPendingChange,
      trend: metrics.payments?.codPendingChange <= 0 ? 'up' : 'down',
      icon: <Clock className="w-6 h-6" />,
      iconBg: 'bg-warning-100 dark:bg-warning-900/30',
      iconColor: 'text-warning-600 dark:text-warning-400',
    },
    {
      title: 'Refunds',
      value: formatCurrency(metrics.payments?.refunds || 0),
      icon: <ArrowDownRight className="w-6 h-6" />,
      iconBg: 'bg-danger-100 dark:bg-danger-900/30',
      iconColor: 'text-danger-600 dark:text-danger-400',
    },
    {
      title: 'Total Products',
      value: formatNumber(metrics.inventory?.totalProducts || 0),
      icon: <ShoppingBag className="w-6 h-6" />,
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Total Units',
      value: formatNumber(metrics.inventory?.totalUnits || 0),
      icon: <Boxes className="w-6 h-6" />,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Low Stock',
      value: metrics.inventory?.lowStock || 0,
      change: metrics.inventory?.lowStockChange,
      trend: metrics.inventory?.lowStockChange <= 0 ? 'up' : 'down',
      icon: <AlertTriangle className="w-6 h-6" />,
      iconBg: 'bg-warning-100 dark:bg-warning-900/30',
      iconColor: 'text-warning-600 dark:text-warning-400',
    },
    {
      title: 'Inventory Value',
      value: formatCurrency(metrics.inventory?.inventoryValue || 0),
      icon: <DollarSign className="w-6 h-6" />,
      iconBg: 'bg-success-100 dark:bg-success-900/30',
      iconColor: 'text-success-600 dark:text-success-400',
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(metrics.expenses?.total || 0),
      change: metrics.expenses?.totalChange,
      trend: metrics.expenses?.totalChange <= 0 ? 'up' : 'down',
      icon: <DollarSign className="w-6 h-6" />,
      iconBg: 'bg-danger-100 dark:bg-danger-900/30',
      iconColor: 'text-danger-600 dark:text-danger-400',
    },
    {
      title: 'Facebook Ads',
      value: formatCurrency(metrics.expenses?.facebookAds || 0),
      icon: <BarChart3 className="w-6 h-6" />,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Electricity',
      value: formatCurrency(metrics.expenses?.electricity || 0),
      icon: <Zap className="w-6 h-6" />,
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      title: 'Tax',
      value: formatCurrency(metrics.expenses?.tax || 0),
      icon: <Receipt className="w-6 h-6" />,
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Net Profit/Loss',
      value: formatCurrency(metrics.financial?.netProfitLoss || 0),
      change: metrics.financial?.profitChange,
      changeLabel: 'vs last period',
      trend: metrics.financial?.netProfitLoss >= 0 ? 'up' : 'down',
      icon: metrics.financial?.netProfitLoss >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />,
      iconBg: metrics.financial?.netProfitLoss >= 0 ? 'bg-success-100 dark:bg-success-900/30' : 'bg-danger-100 dark:bg-danger-900/30',
      iconColor: metrics.financial?.netProfitLoss >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
      {cards.map((card, index) => (
        <MetricCard key={index} {...card} loading={loading} />
      ))}
    </div>
  )
}

export function StatusBreakdownCard({ 
  title, 
  items, 
  total,
  icon,
  iconBg,
}: { 
  title: string
  items: { label: string; value: number; color: string }[]
  total: number
  icon: React.ReactNode
  iconBg: string
}) {
  return (
    <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={cn('p-2 rounded-lg', iconBg)}>
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">{title}</h3>
        </div>
        <span className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">{total}</span>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-secondary-600 dark:text-secondary-400">{item.label}</span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-secondary-900 dark:text-secondary-100">{item.value}</span>
              <div className="flex-1 max-w-[100px] h-2 bg-secondary-100 dark:bg-secondary-800 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${total > 0 ? (item.value / total) * 100 : 0}%`,
                    backgroundColor: item.color 
                  }} 
                />
              </div>
              <span className="text-sm text-secondary-500 dark:text-secondary-400 w-10 text-right">
                {total > 0 ? `${((item.value / total) * 100).toFixed(1)}%` : '0%'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
