'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { X, Zap, AlertTriangle, Crown } from 'lucide-react'

export type NotificationType = 'limit_reached' | 'limit_warning' | 'trial_ending' | 'upgrade_required'

export interface Toast {
  id: string
  type: NotificationType
  title: string
  message: string
  planName?: string
  limitType?: 'products' | 'team_members' | 'locations'
  current?: number
  limit?: number
}

interface ToastContextValue {
  showUpgradeToast: (toast: Omit<Toast, 'id'>) => void
  showLimitReached: (limitType: 'products' | 'team_members' | 'locations', current: number, limit: number, planName?: string) => void
  showLimitWarning: (limitType: 'products' | 'team_members' | 'locations', current: number, limit: number, planName?: string) => void
  dismissToast: (id: string) => void
}

// Null-safe context value
const nullContextValue: ToastContextValue = {
  showUpgradeToast: () => {},
  showLimitReached: () => {},
  showLimitWarning: () => {},
  dismissToast: () => {},
}

const ToastContext = createContext<ToastContextValue>(nullContextValue)

export function useUpgradeToast() {
  const context = useContext(ToastContext)
  // Return the context (will be nullContextValue if provider not available)
  return context
}

function SimpleToast({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const notificationStyles = {
    limit_reached: {
      bg: 'bg-red-50 border-red-200',
      icon: AlertTriangle,
      iconColor: 'text-red-600',
      titleColor: 'text-red-800',
      messageColor: 'text-red-700',
      buttonBg: 'bg-red-600 hover:bg-red-700',
    },
    limit_warning: {
      bg: 'bg-yellow-50 border-yellow-200',
      icon: AlertTriangle,
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-800',
      messageColor: 'text-yellow-700',
      buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
    },
    trial_ending: {
      bg: 'bg-indigo-50 border-indigo-200',
      icon: Zap,
      iconColor: 'text-indigo-600',
      titleColor: 'text-indigo-800',
      messageColor: 'text-indigo-700',
      buttonBg: 'bg-indigo-600 hover:bg-indigo-700',
    },
    upgrade_required: {
      bg: 'bg-purple-50 border-purple-200',
      icon: Crown,
      iconColor: 'text-purple-600',
      titleColor: 'text-purple-800',
      messageColor: 'text-purple-700',
      buttonBg: 'bg-purple-600 hover:bg-purple-700',
    },
  }

  const styles = notificationStyles[toast.type]
  const Icon = styles.icon

  return (
    <div className="bg-white border rounded-lg shadow-lg p-4 mb-2 max-w-sm">
      <div className="flex justify-between items-start">
        <div className={`flex items-center gap-2 ${styles.titleColor}`}>
          <Icon className="w-5 h-5" />
          <h4 className="font-semibold">{toast.title}</h4>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
      <p className={`text-sm mt-1 ${styles.messageColor}`}>{toast.message}</p>
      {toast.planName && (
        <p className={`text-xs mt-2 ${styles.messageColor}`}>
          Current plan: {toast.planName}
        </p>
      )}
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showUpgradeToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`
    setToasts((prev) => [...prev, { ...toast, id }])
  }, [])

  const showLimitReached = useCallback((
    limitType: 'products' | 'team_members' | 'locations',
    current: number,
    limit: number,
    planName?: string
  ) => {
    const limitNames = {
      products: 'Products',
      team_members: 'Team Members',
      locations: 'Locations',
    }
    
    showUpgradeToast({
      type: 'limit_reached',
      title: `${limitNames[limitType]} Limit Reached`,
      message: `You've reached the maximum number of ${limitNames[limitType].toLowerCase()} for your plan. Upgrade to add more.`,
      limitType,
      current,
      limit,
      planName,
    })
  }, [showUpgradeToast])

  const showLimitWarning = useCallback((
    limitType: 'products' | 'team_members' | 'locations',
    current: number,
    limit: number,
    planName?: string
  ) => {
    const limitNames = {
      products: 'Products',
      team_members: 'Team Members',
      locations: 'Locations',
    }
    
    showUpgradeToast({
      type: 'limit_warning',
      title: `Approaching ${limitNames[limitType]} Limit`,
      message: `You're using ${Math.round((current / limit) * 100)}% of your ${limitNames[limitType].toLowerCase()} quota. Consider upgrading soon.`,
      limitType,
      current,
      limit,
      planName,
    })
  }, [showUpgradeToast])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showUpgradeToast, showLimitReached, showLimitWarning, dismissToast }}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50">
          {toasts.map((toast) => (
            <SimpleToast 
              key={toast.id} 
              toast={toast} 
              onClose={() => dismissToast(toast.id)} 
            />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  )
}
