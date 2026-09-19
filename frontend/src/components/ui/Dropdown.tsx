'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

export interface DropdownItem {
  label: string
  value: string
  icon?: ReactNode
  disabled?: boolean
  danger?: boolean
  onClick?: () => void
}

export interface DropdownProps {
  trigger: ReactNode
  items: DropdownItem[]
  onSelect?: (value: string, item: DropdownItem) => void
  align?: 'left' | 'right'
  className?: string
}

export function Dropdown({ trigger, items, onSelect, align = 'right', className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return
    item.onClick?.()
    onSelect?.(item.value, item)
    setIsOpen(false)
  }

  return (
    <div ref={dropdownRef} className={cn('relative inline-block', className)}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-1.5 min-w-[180px] bg-white dark:bg-secondary-900 rounded-lg border border-secondary-200 dark:border-secondary-700',
            'shadow-lg py-1 animate-fade-in',
            align === 'right' ? 'right-0' : 'left-0'
          )}
          role="menu"
        >
          {items.map((item, index) => (
            <button
              key={item.value}
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
              className={cn(
                'w-full px-4 py-2.5 text-sm text-left flex items-center gap-2',
                'hover:bg-secondary-50 dark:hover:bg-secondary-800 focus:outline-none focus:bg-secondary-50 dark:focus:bg-secondary-800',
                item.danger && 'text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20',
                item.disabled && 'opacity-50 cursor-not-allowed'
              )}
              role="menuitem"
            >
              {item.icon && <span className="w-5 h-5 flex-shrink-0">{item.icon}</span>}
              <span className="flex-1">{item.label}</span>
              {item.icon && (
                <Check className="w-4 h-4 text-primary-600" />
              )}
            </button>
          ))}
        </div>
      )}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.15s ease-out; }
      `}</style>
    </div>
  )
}

export interface SelectDropdownProps {
  value: string
  placeholder: string
  items: DropdownItem[]
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  label?: string
  error?: string
}

export function SelectDropdown({
  value,
  placeholder,
  items,
  onChange,
  disabled,
  className,
  label,
  error,
}: SelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedItem = items.find(item => item.value === value)

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      {label && (
        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-secondary-800 text-left',
          'transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          disabled
            ? 'bg-secondary-50 dark:bg-secondary-800/50 text-secondary-500 cursor-not-allowed'
            : error
            ? 'border-danger-500 focus:ring-danger-500'
            : 'border-secondary-300 dark:border-secondary-600 hover:border-secondary-400 dark:hover:border-secondary-500 text-secondary-900 dark:text-secondary-100'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center justify-between">
          <span className={cn('truncate', !selectedItem && 'text-secondary-400 dark:text-secondary-500')}>
            {selectedItem?.label || placeholder}
          </span>
          <ChevronDown className={cn('w-4 h-4 text-secondary-400 flex-shrink-0 ml-2', isOpen && 'rotate-180')} />
        </div>
      </button>
      
      {isOpen && (
        <div
          className="absolute z-50 mt-1.5 w-full bg-white dark:bg-secondary-900 rounded-lg border border-secondary-200 dark:border-secondary-700 shadow-lg py-1 animate-fade-in max-h-60 overflow-auto"
          role="listbox"
        >
          {items.map((item) => (
            <button
              key={item.value}
              onClick={() => {
                onChange(item.value)
                setIsOpen(false)
              }}
              disabled={item.disabled}
              role="option"
              aria-selected={item.value === value}
              className={cn(
                'w-full px-4 py-2.5 text-sm text-left flex items-center gap-2',
                'hover:bg-secondary-50 dark:hover:bg-secondary-800 focus:outline-none focus:bg-secondary-50 dark:focus:bg-secondary-800',
                item.value === value && 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300',
                item.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {item.icon && <span className="w-5 h-5 flex-shrink-0">{item.icon}</span>}
              <span className="flex-1 truncate">{item.label}</span>
              {item.value === value && <Check className="w-4 h-4 text-primary-600 flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
      {error && <p className="mt-1.5 text-sm text-danger-600">{error}</p>}
    </div>
  )
}
