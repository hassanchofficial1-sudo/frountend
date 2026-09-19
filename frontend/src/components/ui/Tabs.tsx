'use client'

import { useState, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface TabItem {
  value: string
  label: string
  icon?: ReactNode
  disabled?: boolean
  badge?: string | number
}

export interface TabsProps {
  tabs: TabItem[]
  activeTab: string
  onChange: (value: string) => void
  variant?: 'line' | 'pills' | 'enclosed'
  className?: string
  fullWidth?: boolean
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = 'line',
  className,
  fullWidth = false,
}: TabsProps) {
  const variants = {
    line: 'border-b border-secondary-200 dark:border-secondary-700',
    pills: 'gap-1 bg-secondary-100 dark:bg-secondary-800 p-1 rounded-lg',
    enclosed: 'border border-secondary-200 dark:border-secondary-700 rounded-lg',
  }

  return (
    <div className={cn('flex', variants[variant], className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => !tab.disabled && onChange(tab.value)}
          disabled={tab.disabled}
          className={cn(
            'relative flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-900',
            tab.disabled && 'opacity-50 cursor-not-allowed',
            fullWidth && 'flex-1',
            variant === 'line' && `
              border-b-2 -mb-px
              ${activeTab === tab.value
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-secondary-500 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-200 hover:border-secondary-300 dark:hover:border-secondary-600'
              }
            `,
            variant === 'pills' && `
              rounded-md
              ${activeTab === tab.value
                ? 'bg-white dark:bg-secondary-700 text-primary-600 shadow-sm'
                : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100'
              }
            `,
            variant === 'enclosed' && `
              border-r last:border-r-0
              ${activeTab === tab.value
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-800'
              }
            `,
          )}
        >
          {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
          {tab.label}
          {tab.badge && (
            <span className={cn(
              'ml-1.5 px-1.5 py-0.5 text-xs font-medium rounded-full',
              variant === 'pills' && activeTab === tab.value
                ? 'bg-primary-100 dark:bg-primary-800/50 text-primary-700 dark:text-primary-300'
                : 'bg-secondary-200 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300'
            )}>
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

export interface TabPanelProps {
  value: string
  activeTab: string
  children: ReactNode
  className?: string
}

export function TabPanel({ value, activeTab, children, className }: TabPanelProps) {
  if (activeTab !== value) return null
  return <div className={cn('mt-4', className)}>{children}</div>
}
