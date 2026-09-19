'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingBag,
  Boxes,
  Truck,
  RotateCcw,
  CreditCard,
  DollarSign,
  ShoppingCart,
  FileText,
  BarChart3,
  Settings,
  Building2,
  Zap,
  Receipt,
  Calculator,
  ClipboardList,
  AlertTriangle,
  Bell,
} from 'lucide-react'
import { UserRole } from '@/types'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTS', 'ORDER_MANAGER', 'STOCK_MANAGER'] },
  { name: 'Orders', href: '/orders', icon: Package, roles: ['SUPER_ADMIN', 'ADMIN', 'ORDER_MANAGER'] },
  { name: 'Customers', href: '/customers', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN', 'ORDER_MANAGER'] },
  { name: 'Products', href: '/products', icon: ShoppingBag, roles: ['SUPER_ADMIN', 'ADMIN', 'STOCK_MANAGER'] },
  { name: 'Inventory', href: '/inventory', icon: Boxes, roles: ['SUPER_ADMIN', 'ADMIN', 'STOCK_MANAGER'] },
  { name: 'Purchases', href: '/purchases', icon: ShoppingCart, roles: ['SUPER_ADMIN', 'ADMIN', 'STOCK_MANAGER'] },
  { name: 'Suppliers', href: '/suppliers', icon: Building2, roles: ['SUPER_ADMIN', 'ADMIN', 'STOCK_MANAGER'] },
  { name: 'Payments', href: '/payments', icon: CreditCard, roles: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTS', 'ORDER_MANAGER'] },
  { name: 'Shipments', href: '/shipments', icon: Truck, roles: ['SUPER_ADMIN', 'ADMIN', 'ORDER_MANAGER'] },
  { name: 'Couriers', href: '/couriers', icon: Truck, roles: ['SUPER_ADMIN', 'ADMIN', 'ORDER_MANAGER'] },
  { name: 'Returns', href: '/returns', icon: RotateCcw, roles: ['SUPER_ADMIN', 'ADMIN', 'ORDER_MANAGER', 'STOCK_MANAGER'] },
  { name: 'Expenses', href: '/expenses', icon: DollarSign, roles: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTS'] },
  { name: 'Marketing Ads', href: '/marketing', icon: BarChart3, roles: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTS'] },
  { name: 'Electricity', href: '/electricity', icon: Zap, roles: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTS'] },
  { name: 'Taxes', href: '/taxes', icon: Receipt, roles: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTS'] },
  { name: 'Notifications', href: '/notifications', icon: Bell, roles: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTS', 'ORDER_MANAGER', 'STOCK_MANAGER'] },
  { name: 'Reports', href: '/reports', icon: FileText, roles: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTS'] },
  { name: 'User Management', href: '/admin/users', icon: Users, roles: ['SUPER_ADMIN'] },
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['SUPER_ADMIN', 'ADMIN'] },
]

export function Sidebar({ userRole }: { userRole: UserRole }) {
  const pathname = usePathname()
  const filteredNav = navigation.filter(item => item.roles.includes(userRole))

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-secondary-900 border-r border-secondary-200 transform transition-transform duration-300 lg:translate-x-0">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between h-16 px-6 border-b border-secondary-200">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-secondary-900 dark:text-secondary-100">BizManage</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1" aria-label="Main navigation">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-secondary-600 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800 hover:text-secondary-900 dark:hover:text-secondary-100'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-primary-600 dark:text-primary-400')} aria-hidden="true" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-secondary-200">
          <div className="px-3 py-2.5 rounded-lg bg-secondary-50 dark:bg-secondary-800">
            <p className="text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Quick Actions</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Link href="/customers/new" className="flex items-center gap-2 px-3 py-2 text-sm text-secondary-600 dark:text-secondary-300 hover:text-secondary-900 dark:hover:text-secondary-100 hover:bg-white dark:hover:bg-secondary-700 rounded-lg transition-colors border border-secondary-200">
                <Users className="w-4 h-4" />
                <span>New Customer</span>
              </Link>
              <Link href="/products/new" className="flex items-center gap-2 px-3 py-2 text-sm text-secondary-600 dark:text-secondary-300 hover:text-secondary-900 dark:hover:text-secondary-100 hover:bg-white dark:hover:bg-secondary-700 rounded-lg transition-colors border border-secondary-200">
                <ShoppingBag className="w-4 h-4" />
                <span>Add Product</span>
              </Link>
              <Link href="/expenses/new" className="flex items-center gap-2 px-3 py-2 text-sm text-secondary-600 dark:text-secondary-300 hover:text-secondary-900 dark:hover:text-secondary-100 hover:bg-white dark:hover:bg-secondary-700 rounded-lg transition-colors border border-secondary-200">
                <DollarSign className="w-4 h-4" />
                <span>Add Expense</span>
              </Link>
              <Link href="/purchases/new" className="flex items-center gap-2 px-3 py-2 text-sm text-secondary-600 dark:text-secondary-300 hover:text-secondary-900 dark:hover:text-secondary-100 hover:bg-white dark:hover:bg-secondary-700 rounded-lg transition-colors border border-secondary-200">
                <ShoppingCart className="w-4 h-4" />
                <span>New Purchase</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}