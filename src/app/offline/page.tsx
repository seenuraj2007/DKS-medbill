'use client'
import { WifiOff, RefreshCw } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl mb-8 shadow-xl shadow-red-100/50">
          <WifiOff className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          You&apos;re Offline
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          It looks like you&apos;ve lost your internet connection. Please check your network settings and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all hover:-translate-y-0.5 shadow-xl shadow-purple-200"
        >
          <RefreshCw className="w-5 h-5" />
          Try Again
        </button>
        <p className="text-sm text-gray-500 mt-8">
          Some features may not be available while offline. Your data will sync automatically once you&apos;re back online.
        </p>
      </div>
    </div>
  )
}
