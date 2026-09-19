'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// --- Module-level singleton store ---
type Listener = () => void

let globalToasts: Toast[] = []
let listeners: Listener[] = []

function subscribe(listener: Listener) {
  listeners = [...listeners, listener]
  return () => {
    listeners = listeners.filter(l => l !== listener)
  }
}

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

function addToastToStore(toast: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).slice(2, 9)
  const newToast = { ...toast, id }
  globalToasts = [...globalToasts, newToast]
  emitChange()

  if (toast.duration !== 0) {
    setTimeout(() => {
      globalToasts = globalToasts.filter(t => t.id !== id)
      emitChange()
    }, toast.duration || 5000)
  }
}

function removeToastFromStore(id: string) {
  globalToasts = globalToasts.filter(t => t.id !== id)
  emitChange()
}

function getSnapshot(): Toast[] {
  return globalToasts
}

// --- Imperative toast API (works anywhere, no context needed) ---
export const toast = {
  success: (title: string, message?: string, options?: Partial<Toast>) =>
    addToastToStore({ type: 'success', title, message, ...options }),
  error: (title: string, message?: string, options?: Partial<Toast>) =>
    addToastToStore({ type: 'error', title, message, ...options }),
  warning: (title: string, message?: string, options?: Partial<Toast>) =>
    addToastToStore({ type: 'warning', title, message, ...options }),
  info: (title: string, message?: string, options?: Partial<Toast>) =>
    addToastToStore({ type: 'info', title, message, ...options }),
}

// --- Context API (for components that prefer useToast) ---
interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>(getSnapshot)

  useEffect(() => {
    return subscribe(() => {
      setToasts(getSnapshot())
    })
  }, [])

  const addToast = useCallback((t: Omit<Toast, 'id'>) => {
    addToastToStore(t)
  }, [])

  const removeToast = useCallback((id: string) => {
    removeToastFromStore(id)
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  if (toasts.length === 0) return null

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }

  const colors = {
    success: 'bg-success-50 dark:bg-success-900/40 border-success-200 dark:border-success-800 text-success-800 dark:text-success-200',
    error: 'bg-danger-50 dark:bg-danger-900/40 border-danger-200 dark:border-danger-800 text-danger-800 dark:text-danger-200',
    warning: 'bg-warning-50 dark:bg-warning-900/40 border-warning-200 dark:border-warning-800 text-warning-800 dark:text-warning-200',
    info: 'bg-primary-50 dark:bg-primary-900/40 border-primary-200 dark:border-primary-800 text-primary-800 dark:text-primary-200',
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[350px] max-w-full">
      {toasts.map((t) => {
        const Icon = icons[t.type]
        return (
          <div
            key={t.id}
            className={cn(
              'flex items-start gap-3 p-4 rounded-xl border shadow-lg animate-slide-in',
              colors[t.type]
            )}
            role="alert"
          >
            <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium">{t.title}</p>
              {t.message && (
                <p className="mt-0.5 text-sm opacity-90">{t.message}</p>
              )}
              {t.action && (
                <button
                  onClick={t.action.onClick}
                  className="mt-2 text-sm font-medium underline hover:no-underline"
                >
                  {t.action.label}
                </button>
              )}
            </div>
            <button
              onClick={() => onRemove(t.id)}
              className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
      <style jsx global>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  )
}
