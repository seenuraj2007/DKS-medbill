'use client'

import { ReactNode } from 'react'
import { ToastProvider, useUpgradeToast } from '@/components/UpgradeNotification'

export { useUpgradeToast }

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  )
}
