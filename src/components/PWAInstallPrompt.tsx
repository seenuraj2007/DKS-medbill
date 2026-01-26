'use client'

import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setShowPrompt(false)
    }

    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
  }

  if (!showPrompt || !deferredPrompt) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 sm:p-6 shadow-2xl z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4 flex-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
          </div>
          <div>
            <p className="font-semibold text-sm sm:text-base">Install DKS StockAlert App</p>
            <p className="text-xs sm:text-sm text-white/80">Get quick access from your home screen</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleDismiss}
            className="p-2 sm:p-2.5 hover:bg-white/20 rounded-lg transition-colors"
            title="Not now"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={handleInstall}
            className="bg-white text-indigo-600 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base whitespace-nowrap"
          >
            Install Now
          </button>
        </div>
      </div>
    </div>
  )
}
