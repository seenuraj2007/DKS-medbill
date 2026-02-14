'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Package, CheckCircle, XCircle, Loader2 } from 'lucide-react'

function VerifyEmailContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams?.get('token')
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>(() => {
        // Set initial error state if no token
        return token ? 'loading' : 'error'
    })
    const [message, setMessage] = useState(() => {
        return token ? '' : 'No verification token provided'
    })

    useEffect(() => {
        if (!token) {
            return
        }

        const verifyEmail = async () => {
            try {
                const res = await fetch('/api/auth/verify-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                })

                const data = await res.json()

                if (res.ok) {
                    setStatus('success')
                    setMessage('Your email has been verified successfully!')
                    // Redirect to dashboard after 3 seconds
                    setTimeout(() => {
                        router.push('/dashboard')
                    }, 3000)
                } else {
                    setStatus('error')
                    setMessage(data.error || 'Verification failed')
                }
            } catch {
                setStatus('error')
                setMessage('An unexpected error occurred')
            }
        }

        verifyEmail()
    }, [token, router])

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-100 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-5 shadow-xl shadow-indigo-200">
                        <Package className="w-10 h-10 text-white" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Email Verification</h1>

                    {status === 'loading' && (
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                            <p className="text-gray-600">Verifying your email...</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <p className="text-green-600 font-medium">{message}</p>
                            <p className="text-gray-500 text-sm">Redirecting to dashboard...</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                <XCircle className="w-10 h-10 text-red-600" />
                            </div>
                            <p className="text-red-600 font-medium">{message}</p>
                            <button
                                onClick={() => router.push('/auth')}
                                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Back to Login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    )
}
