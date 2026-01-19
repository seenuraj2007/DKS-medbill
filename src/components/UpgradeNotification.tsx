'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Zap, AlertTriangle, Crown } from 'lucide-react'

export type NotificationType = 'limit_reached' | 'limit_warning' | 'trial_ending' | 'upgrade_required'

export interface UpgradeNotificationProps {
  type: NotificationType
  title: string
  message: string
  planName?: string
  limitType?: 'products' | 'team_members' | 'locations'
  current?: number
  limit?: number
  onClose?: () => void
  autoClose?: boolean
  autoCloseDelay?: number
}

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

export function UpgradeNotification({
  type,
  title,
  message,
  planName,
  limitType,
  current,
  limit,
  onClose,
  autoClose = false,
  autoCloseDelay = 10000,
}: UpgradeNotificationProps) {
  const [visible, setVisible] = useState(true)
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    // Entry animation
    const timer = setTimeout(() => setIsAnimating(false), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose()
      }, autoCloseDelay)
      return () => clearTimeout(timer)
    }
  }, [autoClose, autoCloseDelay])

  const handleClose = () => {
    setVisible(false)
    setTimeout(() => {
      onClose?.()
    }, 300)
  }

  if (!visible) return null

  const styles = notificationStyles[type]
  const Icon = styles.icon

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 max-w-md w-full mx-4 transform transition-all duration-300 ease-out ${
        isAnimating ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'
      }`}
    >
      <div className={`${styles.bg} border rounded-xl shadow-lg p-4`}>
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 p-2 rounded-lg bg-white/50`}>
            <Icon className={`w-5 h-5 ${styles.iconColor}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className={`font-semibold ${styles.titleColor}`}>{title}</h3>
              <button
                onClick={handleClose}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            
            <p className={`text-sm mt-1 ${styles.messageColor}`}>{message}</p>
            
            {(current !== undefined && limit !== undefined) && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={styles.messageColor}>
                    {current} / {limit} {limitType?.replace('_', ' ')}
                  </span>
                  <span className={styles.messageColor}>
                    {Math.round((current / limit) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 bg-black/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${type === 'limit_reached' ? 'bg-red-500' : type === 'limit_warning' ? 'bg-yellow-500' : 'bg-indigo-500'} rounded-full transition-all`}
                    style={{ width: `${Math.min(100, (current / limit) * 100)}%` }}
                  />
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2 mt-3">
              <Link
                href="/subscription"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white rounded-lg ${styles.buttonBg} transition-colors`}
              >
                <Zap className="w-3.5 h-3.5" />
                Upgrade Now
              </Link>
              {planName && (
                <span className={`text-xs ${styles.messageColor}`}>
                  Current: {planName}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Toast container for multiple notifications
interface Toast {
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

import { createContext, useContext, useCallback } from 'react'

const ToastContext = createContext<ToastContextValue | null>(null)

export function useUpgradeToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useUpgradeToast must be used within a ToastProvider')
  }
  return context
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
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            style={{ transform: `translateY(-${index * 8}px)` }}
          >
            <UpgradeNotification
              type={toast.type}
              title={toast.title}
              message={toast.message}
              planName={toast.planName}
              limitType={toast.limitType}
              current={toast.current}
              limit={toast.limit}
              onClose={() => dismissToast(toast.id)}
              autoClose
              autoCloseDelay={8000}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
