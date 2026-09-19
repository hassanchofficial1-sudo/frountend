'use client'

import { useState, useEffect, ReactNode } from 'react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown'
import { formatDate } from '@/lib/utils'
import {
  Menu,
  Bell,
  Search,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Sun,
  Moon,
  X,
  Check,
  ExternalLink,
  ShoppingCart,
  Package,
  RotateCcw,
  AlertTriangle,
  CreditCard,
  CheckCircle,
  Zap,
  Receipt,
  Truck,
  RefreshCw,
  AlertCircle,
  DollarSign,
} from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  data?: Record<string, any>
  isRead: boolean
  createdAt: string
}

export function Header({ 
  user, 
  onMenuClick, 
  children 
}: { 
  user: { name: string; email: string; role: string; avatar?: string }
  onMenuClick?: () => void
  children?: ReactNode
}) {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [loadingNotifications, setLoadingNotifications] = useState(true)
  const { addToast } = useToast()

  const handleLogout = () => {
    addToast({
      type: 'info',
      title: 'Logging out...',
      message: 'Redirecting to login page',
    })
    window.location.href = '/auth/logout'
  }

  const userMenuItems: DropdownItem[] = [
    { label: 'Profile', value: 'profile', icon: <User className="w-4 h-4" />, onClick: () => window.location.href = '/settings' },
    { label: 'Settings', value: 'settings', icon: <Settings className="w-4 h-4" />, onClick: () => window.location.href = '/settings' },
    { label: 'Logout', value: 'logout', icon: <LogOut className="w-4 h-4" />, danger: true, onClick: handleLogout },
  ]

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications?limit=20&sortBy=createdAt&sortOrder=desc')
      const data = await response.json()
      if (data.success) {
        setNotifications(data.data)
        setUnreadCount(data.data.filter((n: Notification) => !n.isRead).length)
      }
    } catch (error) {
      console.error('Failed to fetch notifications')
    } finally {
      setLoadingNotifications(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications?limit=1&sortBy=createdAt&sortOrder=desc')
      const data = await response.json()
      if (data.success) {
        const unread = data.data.filter((n: Notification) => !n.isRead).length
        setUnreadCount(unread)
      }
    } catch (error) {
      console.error('Failed to fetch unread count')
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      })
      const data = await response.json()
      if (data.success) {
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to mark as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()
      if (data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Failed to mark all as read')
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'NEW_ORDER': return <ShoppingCart className="w-4 h-4 text-primary-600" />
      case 'ORDER_DELIVERED': return <Package className="w-4 h-4 text-success-600" />
      case 'ORDER_RETURNED': return <RotateCcw className="w-4 h-4 text-danger-600" />
      case 'LOW_STOCK': return <AlertTriangle className="w-4 h-4 text-warning-600" />
      case 'OUT_OF_STOCK': return <Package className="w-4 h-4 text-danger-600" />
      case 'PENDING_COD': return <CreditCard className="w-4 h-4 text-warning-600" />
      case 'COD_SETTLED': return <CheckCircle className="w-4 h-4 text-success-600" />
      case 'ELECTRICITY_OVERDUE': return <Zap className="w-4 h-4 text-danger-600" />
      case 'TAX_OVERDUE': return <Receipt className="w-4 h-4 text-danger-600" />
      case 'COURIER_API_FAILURE': return <Truck className="w-4 h-4 text-danger-600" />
      case 'SHOPIFY_SYNC_FAILURE': return <RefreshCw className="w-4 h-4 text-danger-600" />
      case 'INTEGRATION_ERROR': return <AlertCircle className="w-4 h-4 text-danger-600" />
      case 'PAYMENT_RECEIVED': return <DollarSign className="w-4 h-4 text-success-600" />
      case 'PURCHASE_CONFIRMED': return <ShoppingCart className="w-4 h-4 text-primary-600" />
      case 'RETURN_PROCESSED': return <RotateCcw className="w-4 h-4 text-info-600" />
      default: return <Bell className="w-4 h-4 text-secondary-600" />
    }
  }

  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return formatDate(dateString, 'DD MMM YYYY')
  }

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-secondary-900 border-b border-secondary-200">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-4 lg:hidden">
          <Button variant="ghost" size="icon" onClick={onMenuClick} aria-label="Open menu">
            <Menu className="w-6 h-6" />
          </Button>
        </div>

        <div className="hidden lg:flex lg:items-center lg:gap-4 flex-1">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input
              type="search"
              placeholder="Search orders, customers, products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  window.location.href = `/orders?query=${encodeURIComponent(searchQuery)}`
                }
              }}
              className="w-full pl-10 pr-4 py-2 text-sm bg-secondary-50 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white dark:focus:bg-secondary-800 dark:text-secondary-100 dark:placeholder:text-secondary-400"
              aria-label="Global search"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative" 
              aria-label="Notifications"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>

            {notificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 lg:w-96 bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-secondary-200 dark:border-secondary-700">
                  <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleMarkAllAsRead}
                        disabled={loadingNotifications}
                      >
                        <Check className="w-3 h-3 mr-1" />Mark all read
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => setNotificationsOpen(false)} aria-label="Close">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="max-h-[500px] overflow-y-auto">
                  {loadingNotifications ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-secondary-500">
                      <Bell className="w-12 h-12 mx-auto mb-3 text-secondary-300 dark:text-secondary-600" />
                      <p>No notifications</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-secondary-100 dark:divide-secondary-800">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors ${!notification.isRead ? 'bg-primary-50 dark:bg-primary-900/30' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-secondary-100 dark:bg-secondary-800 flex-shrink-0">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className={`font-medium text-secondary-900 dark:text-secondary-100 ${!notification.isRead ? 'font-semibold' : ''}`}>
                                  {notification.title}
                                </h4>
                                {!notification.isRead && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-secondary-400 hover:text-primary-600 p-1"
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    aria-label="Mark as read"
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                              <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1 line-clamp-2">{notification.message}</p>
                              <p className="text-xs text-secondary-400 dark:text-secondary-500 mt-1">{formatNotificationTime(notification.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-secondary-200 dark:border-secondary-700">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.location.href = '/notifications'}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />View All Notifications
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            aria-label={mounted && resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          >
            {mounted && resolvedTheme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>

          <Dropdown
            trigger={
              <Button variant="ghost" className="gap-2 lg:px-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-700 dark:text-primary-300" />
                </div>
                <span className="hidden lg:block text-sm font-medium text-secondary-700 dark:text-secondary-200">{user.name}</span>
                <ChevronDown className="w-4 h-4 text-secondary-400 lg:hidden" />
              </Button>
            }
            items={userMenuItems}
            align="right"
          />
        </div>
      </div>
    </header>
  )
}