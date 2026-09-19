'use client'

import { useTheme } from 'next-themes'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { cn } from '@/lib/utils'

const COLORS = [
  '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
]

export interface ChartDataPoint {
  name: string
  [key: string]: string | number
}

interface LineChartProps {
  data: ChartDataPoint[]
  xKey: string
  yKeys: string[]
  labels?: string[]
  colors?: string[]
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  className?: string
}

export function LineChartComponent({
  data,
  xKey,
  yKeys,
  labels,
  colors = COLORS,
  height = 300,
  showGrid = true,
  showLegend = true,
  className,
}: LineChartProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const axisColor = isDark ? '#94a3b8' : '#94a3b8'
  const gridColor = isDark ? '#334155' : '#e2e8f0'
  const labelColor = isDark ? '#e2e8f0' : '#1e293b'

  if (!data.length) {
    return (
      <div className={cn('h-[300px] flex items-center justify-center bg-secondary-50 dark:bg-secondary-800 rounded-xl', className)}>
        <p className="text-secondary-500 dark:text-secondary-400">No data available</p>
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: showLegend ? 30 : 10, left: 0, bottom: 0 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />}
          <XAxis
            dataKey={xKey}
            stroke={axisColor}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            tick={{ fill: axisColor }}
          />
          <YAxis
            stroke={axisColor}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(1)}k` : value}
            tick={{ fill: axisColor }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1e293b' : 'white',
              border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              color: isDark ? '#e2e8f0' : '#1e293b',
            }}
            labelStyle={{ color: labelColor, fontWeight: 600 }}
            formatter={(value: number) => [`Rs. ${value.toLocaleString()}`, '']}
          />
          {showLegend && <Legend />}
          {yKeys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={labels?.[index] || key}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

interface BarChartProps {
  data: ChartDataPoint[]
  xKey: string
  yKeys: string[]
  labels?: string[]
  colors?: string[]
  height?: number
  stacked?: boolean
  showGrid?: boolean
  showLegend?: boolean
  className?: string
}

export function BarChartComponent({
  data,
  xKey,
  yKeys,
  labels,
  colors = COLORS,
  height = 300,
  stacked = false,
  showGrid = true,
  showLegend = true,
  className,
}: BarChartProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const axisColor = isDark ? '#94a3b8' : '#94a3b8'
  const gridColor = isDark ? '#334155' : '#e2e8f0'
  const labelColor = isDark ? '#e2e8f0' : '#1e293b'

  if (!data.length) {
    return (
      <div className={cn('h-[300px] flex items-center justify-center bg-secondary-50 dark:bg-secondary-800 rounded-xl', className)}>
        <p className="text-secondary-500 dark:text-secondary-400">No data available</p>
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: showLegend ? 30 : 10, left: 0, bottom: 0 }} layout={stacked ? 'vertical' : 'horizontal'}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />}
          <XAxis
            dataKey={xKey}
            stroke={axisColor}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            type="category"
            tick={{ fill: axisColor }}
          />
          <YAxis
            stroke={axisColor}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(1)}k` : value}
            tick={{ fill: axisColor }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1e293b' : 'white',
              border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              color: isDark ? '#e2e8f0' : '#1e293b',
            }}
            labelStyle={{ color: labelColor, fontWeight: 600 }}
            formatter={(value: number) => [`Rs. ${value.toLocaleString()}`, '']}
          />
          {showLegend && <Legend />}
          {yKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              name={labels?.[index] || key}
              fill={colors[index % colors.length]}
              radius={[4, 4, 0, 0]}
              stackId={stacked ? 'a' : undefined}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

interface AreaChartProps {
  data: ChartDataPoint[]
  xKey: string
  yKeys: string[]
  labels?: string[]
  colors?: string[]
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  className?: string
}

export function AreaChartComponent({
  data,
  xKey,
  yKeys,
  labels,
  colors = COLORS,
  height = 300,
  showGrid = true,
  showLegend = true,
  className,
}: AreaChartProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const axisColor = isDark ? '#94a3b8' : '#94a3b8'
  const gridColor = isDark ? '#334155' : '#e2e8f0'
  const labelColor = isDark ? '#e2e8f0' : '#1e293b'

  if (!data.length) {
    return (
      <div className={cn('h-[300px] flex items-center justify-center bg-secondary-50 dark:bg-secondary-800 rounded-xl', className)}>
        <p className="text-secondary-500 dark:text-secondary-400">No data available</p>
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: showLegend ? 30 : 10, left: 0, bottom: 0 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />}
          <XAxis
            dataKey={xKey}
            stroke={axisColor}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            tick={{ fill: axisColor }}
          />
          <YAxis
            stroke={axisColor}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(1)}k` : value}
            tick={{ fill: axisColor }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1e293b' : 'white',
              border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              color: isDark ? '#e2e8f0' : '#1e293b',
            }}
            labelStyle={{ color: labelColor, fontWeight: 600 }}
            formatter={(value: number) => [`Rs. ${value.toLocaleString()}`, '']}
          />
          {showLegend && <Legend />}
          {yKeys.map((key, index) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              name={labels?.[index] || key}
              stroke={colors[index % colors.length]}
              fill={colors[index % colors.length]}
              fillOpacity={0.3}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

interface PieChartProps {
  data: { name: string; value: number }[]
  colors?: string[]
  height?: number
  showLegend?: boolean
  className?: string
  innerRadius?: number
  outerRadius?: number
  label?: boolean
}

export function PieChartComponent({
  data,
  colors = COLORS,
  height = 300,
  showLegend = true,
  className,
  innerRadius = 60,
  outerRadius = 100,
  label = true,
}: PieChartProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const labelColor = isDark ? '#e2e8f0' : '#1e293b'

  if (!data.length || data.every(d => d.value === 0)) {
    return (
      <div className={cn('h-[300px] flex items-center justify-center bg-secondary-50 dark:bg-secondary-800 rounded-xl', className)}>
        <p className="text-secondary-500 dark:text-secondary-400">No data available</p>
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            label={label ? ({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%` : false}
            labelLine={label}
            fill={labelColor}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          {showLegend && <Legend />}
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1e293b' : 'white',
              border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              color: isDark ? '#e2e8f0' : '#1e293b',
            }}
            formatter={(value: number) => [`Rs. ${value.toLocaleString()}`, '']}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ChartCard({
  title,
  subtitle,
  children,
  action,
  className,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 shadow-card', className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">{title}</h3>
          {subtitle && <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="h-[300px]">
        {children}
      </div>
    </div>
  )
}
