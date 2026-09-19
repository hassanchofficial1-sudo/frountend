'use client'

import { Calendar, ChevronDown } from 'lucide-react'
import { DATE_RANGE_OPTIONS } from '@/types'

interface DateRangeSelectorProps {
  value: string
}

export function DateRangeSelector({ value }: DateRangeSelectorProps) {
  return (
    <div className="relative">
      <select
        defaultValue={value}
        onChange={(e) => { window.location.href = `/dashboard?dateRange=${e.target.value}` }}
        className="appearance-none px-4 py-2.5 pr-10 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-600 rounded-lg text-sm text-secondary-900 dark:text-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
      >
        {DATE_RANGE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 pointer-events-none" />
      <ChevronDown className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 pointer-events-none" />
    </div>
  )
}
