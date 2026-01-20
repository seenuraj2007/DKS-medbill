'use client'

import { ToastProvider } from '@/components/UpgradeNotification'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  )
}
