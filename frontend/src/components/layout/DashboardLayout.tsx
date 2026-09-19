'use client'

import { useState } from 'react'
import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { BackButton } from '@/components/ui/BackButton'
import { UserRole } from '@/types'

interface DashboardLayoutProps {
  children: ReactNode
  user: {
    name: string
    email: string
    role: UserRole
    avatar?: string
  }
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950">
      <Sidebar userRole={user.role} />
      
      <div className="lg:pl-64">
        <Header 
          user={user} 
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <main className="p-4 lg:p-6" id="main-content">
          <div className="mb-4">
            <BackButton />
          </div>
          {children}
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  )
}