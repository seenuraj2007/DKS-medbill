import { Suspense } from 'react'
import AuthPage from './AuthPage'

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <AuthPage />
    </Suspense>
  )
}