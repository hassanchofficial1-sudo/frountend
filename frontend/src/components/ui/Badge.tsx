'use client'

import { cn } from '@/lib/utils'

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'secondary'
  size?: 'sm' | 'md'
  className?: string
  dot?: boolean
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
  dot = false,
}: BadgeProps) {
  const variants = {
    default: 'bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300',
    success: 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300',
    warning: 'bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-300',
    danger: 'bg-danger-100 dark:bg-danger-900/30 text-danger-700 dark:text-danger-300',
    info: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
    primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
    secondary: 'bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}

export function StatusBadge({ status, type, size, className }: { status: string; type: 'order' | 'payment' | 'shipment' | 'cod' | 'tax' | 'electricity'; size?: 'sm' | 'md'; className?: string }) {
  const getVariant = () => {
    switch (type) {
      case 'order':
        switch (status) {
          case 'DELIVERED': return 'success'
          case 'RETURNED': return 'danger'
          case 'CANCELLED': return 'secondary'
          case 'NEW': return 'info'
          case 'CONFIRMED': return 'primary'
          case 'PACKED':
          case 'DISPATCHED':
          case 'IN_TRANSIT':
          case 'OUT_FOR_DELIVERY': return 'warning'
          case 'ON_HOLD': return 'secondary'
          default: return 'default'
        }
      case 'payment':
        switch (status) {
          case 'PAID': return 'success'
          case 'REFUNDED': return 'danger'
          case 'PARTIALLY_REFUNDED': return 'warning'
          case 'ADVANCE_RECEIVED': return 'info'
          case 'COD_PENDING': return 'warning'
          case 'UNPAID': return 'danger'
          case 'PARTIAL': return 'warning'
          default: return 'default'
        }
      case 'shipment':
        switch (status) {
          case 'DELIVERED': return 'success'
          case 'RETURNED': return 'danger'
          case 'CANCELLED':
          case 'FAILED': return 'secondary'
          case 'BOOKED': return 'info'
          case 'PICKED_UP':
          case 'IN_TRANSIT':
          case 'OUT_FOR_DELIVERY': return 'warning'
          default: return 'default'
        }
      case 'cod':
        switch (status) {
          case 'SETTLED': return 'success'
          case 'COLLECTED': return 'info'
          case 'PARTIAL': return 'warning'
          case 'FAILED': return 'danger'
          case 'PENDING': return 'warning'
          default: return 'default'
        }
      case 'tax':
        switch (status) {
          case 'PAID': return 'success'
          case 'OVERDUE': return 'danger'
          case 'PENDING': return 'warning'
          default: return 'default'
        }
      case 'electricity':
        switch (status) {
          case 'PAID': return 'success'
          case 'OVERDUE': return 'danger'
          case 'PENDING': return 'warning'
          default: return 'default'
        }
      default:
        return 'default'
    }
  }

  const formatStatus = (status: string) => 
    status.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')

  return <Badge variant={getVariant()} size={size} className={className}>{formatStatus(status)}</Badge>
}

export function OrderSourceBadge({ source }: { source: string }) {
  const variants: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
    SHOPIFY: 'primary',
    WHATSAPP: 'success',
    MANUAL: 'warning',
  }

  return <Badge variant={variants[source] || 'default'}>{source}</Badge>
}

export function PaymentTypeBadge({ type }: { type: string }) {
  const variants: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
    ADVANCE: 'info',
    COD: 'warning',
    FULL_PAYMENT: 'success',
    PARTIAL: 'primary',
  }

  return <Badge variant={variants[type] || 'default'}>
    {type === 'FULL_PAYMENT' ? 'Full Payment' : type}
  </Badge>
}
