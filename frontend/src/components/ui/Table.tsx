'use client'

import React, { forwardRef, TableHTMLAttributes, ThHTMLAttributes, TdHTMLAttributes, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { Checkbox } from './Input'

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  striped?: boolean
  hoverable?: boolean
  compact?: boolean
}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, striped, hoverable, compact, children, ...props }, ref) => (
    <div className="overflow-x-auto">
      <table
        ref={ref}
        className={cn('w-full text-sm text-left', className)}
        {...props}
      >
        {children}
      </table>
    </div>
  )
)

Table.displayName = 'Table'

export const Thead = forwardRef<HTMLTableSectionElement, TableHTMLAttributes<HTMLTableSectionElement>>(
  ({ className, children, ...props }, ref) => (
    <thead ref={ref} className={cn('bg-secondary-50 dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700', className)} {...props}>
      {children}
    </thead>
  )
)

Thead.displayName = 'Thead'

export const Tbody = forwardRef<HTMLTableSectionElement, TableHTMLAttributes<HTMLTableSectionElement>>(
  ({ className, children, ...props }, ref) => (
    <tbody ref={ref} className={cn('divide-y divide-secondary-100 dark:divide-secondary-700', className)} {...props}>
      {children}
    </tbody>
  )
)

Tbody.displayName = 'Tbody'

export interface ThProps extends ThHTMLAttributes<HTMLTableCellElement> {
  width?: string
}

export const Th = forwardRef<HTMLTableCellElement, ThProps>(
  ({ className, width, children, ...props }, ref) => (
    <th
      ref={ref}
      style={{ width }}
      className={cn(
        'px-4 py-3 font-semibold text-secondary-600 dark:text-secondary-400 uppercase tracking-wider',
        'first:rounded-tl-lg last:rounded-tr-lg',
        className
      )}
      {...props}
    >
      {children}
    </th>
  )
)

Th.displayName = 'Th'

export interface TdProps extends TdHTMLAttributes<HTMLTableCellElement> {
  className?: string
}

export const Td = forwardRef<HTMLTableCellElement, TdProps>(
  ({ className, children, ...props }, ref) => (
    <td
      ref={ref}
      className={cn('px-4 py-3 text-secondary-900 dark:text-secondary-100', className)}
      {...props}
    >
      {children}
    </td>
  )
)

Td.displayName = 'Td'

export interface TrProps extends HTMLAttributes<HTMLTableRowElement> {
  clickable?: boolean
  selected?: boolean
}

export const Tr = forwardRef<HTMLTableRowElement, TrProps>(
  ({ className, clickable, selected, children, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'transition-colors duration-150',
        clickable && 'cursor-pointer hover:bg-secondary-50 dark:hover:bg-secondary-800',
        selected && 'bg-primary-50 dark:bg-primary-900/20',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  )
)

Tr.displayName = 'Tr'

export interface Column<T> {
  key: string
  header: string
  width?: string
  render?: (row: T, index: number) => React.ReactNode
  className?: string
  sortable?: boolean
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  onRowClick?: (row: T) => void
  onSelectionChange?: (selectedKeys: string[]) => void
  selectedKeys?: string[]
  loading?: boolean
  emptyMessage?: string
  striped?: boolean
  hoverable?: boolean
  compact?: boolean
  showCheckboxes?: boolean
  rowClassName?: (row: T, index: number) => string | undefined
  className?: string
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  onSelectionChange,
  selectedKeys = [],
  loading = false,
  emptyMessage = 'No data available',
  striped = true,
  hoverable = true,
  compact = false,
  showCheckboxes = false,
  rowClassName,
  className,
}: DataTableProps<T>) {
  const handleSelectAll = (checked: boolean) => {
    if (onSelectionChange) {
      onSelectionChange(checked ? data.map(keyExtractor) : [])
    }
  }

  const handleSelectRow = (key: string, checked: boolean) => {
    if (onSelectionChange) {
      const newSelection = checked
        ? [...selectedKeys, key]
        : selectedKeys.filter(k => k !== key)
      onSelectionChange(newSelection)
    }
  }

  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary-50 dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700">
            <tr>
              {showCheckboxes && <th className="px-4 py-3 w-12" />}
              {columns.map((col) => (
                <Th key={col.key} width={col.width} className={col.className}>
                  {col.header}
                </Th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100 dark:divide-secondary-700">
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                {showCheckboxes && <td className="px-4 py-3" />}
                {columns.map((col) => (
                  <Td key={col.key} className={col.className}>
                    <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded animate-pulse w-24" />
                  </Td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-secondary-500 dark:text-secondary-400">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full text-sm">
        <thead className="bg-secondary-50 dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700">
          <tr>
            {showCheckboxes && (
              <th className="px-4 py-3 w-12">
                <Checkbox
                  checked={selectedKeys.length === data.length && data.length > 0}
                  indeterminate={selectedKeys.length > 0 && selectedKeys.length < data.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  label=""
                />
              </th>
            )}
            {columns.map((col) => (
              <Th key={col.key} width={col.width} className={col.className}>
                {col.header}
              </Th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-secondary-100 dark:divide-secondary-700">
          {data.map((row, rowIndex) => {
            const key = keyExtractor(row)
            const isSelected = selectedKeys.includes(key)
            return (
              <Tr
                key={key}
                clickable={!!onRowClick}
                selected={isSelected}
                className={rowClassName?.(row, rowIndex)}
                onClick={() => onRowClick?.(row)}
              >
                {showCheckboxes && (
                  <Td className="px-4 py-3 w-12">
                    <Checkbox
                      checked={isSelected}
                      onChange={(e) => handleSelectRow(key, e.target.checked)}
                      label=""
                    />
                  </Td>
                )}
                {columns.map((col) => (
                  <Td key={col.key} className={col.className}>
                    {col.render ? col.render(row, rowIndex) : (row as Record<string, unknown>)[col.key] as React.ReactNode}
                  </Td>
                ))}
              </Tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showPageSize?: boolean
  pageSize?: number
  onPageSizeChange?: (size: number) => void
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showPageSize = false,
  pageSize = 20,
  onPageSizeChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const visiblePages = pages.filter(page => 
    page === 1 || 
    page === totalPages || 
    (page >= currentPage - 1 && page <= currentPage + 1)
  )

  return (
    <div className={cn('flex items-center justify-between px-4 py-3 border-t border-secondary-100 dark:border-secondary-800', className)}>
      <div className="text-sm text-secondary-500 dark:text-secondary-400">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center gap-2">
        {showPageSize && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange?.(parseInt(e.target.value))}
            className="px-3 py-1.5 text-sm border border-secondary-300 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100"
          >
            {[10, 20, 50, 100].map(size => (
              <option key={size} value={size}>{size} per page</option>
            ))}
          </select>
        )}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
          aria-label="Previous page"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {visiblePages.map((page, index) => (
          <React.Fragment key={page}>
            {index > 0 && visiblePages[index - 1] !== page - 1 && (
              <span className="px-2 text-secondary-400 dark:text-secondary-500">...</span>
            )}
            <button
              onClick={() => onPageChange(page)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                currentPage === page
                  ? 'bg-primary-600 text-white'
                  : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 hover:text-secondary-900 dark:hover:text-secondary-100'
              )}
            >
              {page}
            </button>
          </React.Fragment>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
          aria-label="Next page"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
