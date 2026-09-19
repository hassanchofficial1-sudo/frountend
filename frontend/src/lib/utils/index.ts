import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'PKR', symbol = 'Rs.'): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount).replace(currency, symbol)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-PK').format(num)
}

export function formatDate(date: Date | string, format = 'DD/MM/YYYY'): string {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')

  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`
    case 'DD MMM YYYY':
      return `${day} ${d.toLocaleString('en-PK', { month: 'short' })} ${year}`
    case 'DD MMM YYYY HH:mm':
      return `${day} ${d.toLocaleString('en-PK', { month: 'short' })} ${year} ${hours}:${minutes}`
    default:
      return `${day}/${month}/${year}`
  }
}

export function formatDateTime(date: Date | string): string {
  return formatDate(date, 'DD MMM YYYY HH:mm')
}

export function getDateRange(period: string): { from: Date; to: Date } {
  const now = new Date()
  const to = new Date(now.setHours(23, 59, 59, 999))
  let from: Date

  switch (period) {
    case 'today':
      from = new Date(now.setHours(0, 0, 0, 0))
      break
    case 'yesterday':
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      from = new Date(yesterday.setHours(0, 0, 0, 0))
      to.setTime(yesterday.setHours(23, 59, 59, 999))
      break
    case 'this_week':
      from = new Date(now)
      from.setDate(now.getDate() - now.getDay())
      from.setHours(0, 0, 0, 0)
      break
    case 'last_week':
      const lastWeekEnd = new Date(now)
      lastWeekEnd.setDate(now.getDate() - now.getDay() - 1)
      to.setTime(lastWeekEnd.setHours(23, 59, 59, 999))
      from = new Date(lastWeekEnd)
      from.setDate(lastWeekEnd.getDate() - 6)
      from.setHours(0, 0, 0, 0)
      break
    case 'this_month':
      from = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case 'last_month':
      from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      to.setTime(new Date(now.getFullYear(), now.getMonth(), 0).setHours(23, 59, 59, 999))
      break
    case 'this_year':
      from = new Date(now.getFullYear(), 0, 1)
      break
    default:
      from = new Date(now.setHours(0, 0, 0, 0))
  }

  return { from, to }
}

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 10000) / 100
}

export function calculateProfitLoss(revenue: number, expenses: number): number {
  return revenue - expenses
}

export function generateOrderNumber(prefix = 'ORD'): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `${prefix}-${year}${month}${day}-${random}`
}

export function generateReturnNumber(): string {
  return generateOrderNumber('RET')
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  return fn().catch(err => {
    if (retries <= 0) throw err
    return sleep(delay).then(() => retry(fn, retries - 1, delay * 2))
  })
}

export function parseJsonSafe<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj }
  keys.forEach(key => delete result[key])
  return result
}

export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach(key => {
    if (key in obj) result[key] = obj[key]
  })
  return result
}