'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Package, AlertCircle, Mail, Lock, User, ArrowRight, ChevronRight } from 'lucide-react'

const getCSRFToken = (): string => {
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/csrf-token=([^;]+)/)
    return match ? match[1] : ''
  }
  return ''
}

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams?.get('returnTo') || '/dashboard'
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        if (res.ok) {
          router.push(returnTo)
        }
      } catch {
        // Silently handle error
      }
    }
    checkAuth()
  }, [router, returnTo])

  const validatePassword = (pwd: string): string => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters'
    }
    if (pwd.length > 100) {
      return 'Password too long'
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Password must contain at least one uppercase letter'
    }
    if (!/[a-z]/.test(pwd)) {
      return 'Password must contain at least one lowercase letter'
    }
    if (!/[0-9]/.test(pwd)) {
      return 'Password must contain at least one number'
    }
    return ''
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setPasswordError('')
    setLoading(true)

    if (!email || !password) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    const pwdError = validatePassword(password)
    if (pwdError) {
      setError(pwdError)
      setLoading(false)
      return
    }

    if (!isLogin && !fullName.trim()) {
      setError('Full name is required')
      setLoading(false)
      return
    }

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup'
      const body = isLogin ? { email, password } : { email, password, full_name: fullName }
      const csrfToken = getCSRFToken()

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'X-CSRF-Token': csrfToken })
        },
        credentials: 'include',
        body: JSON.stringify(body)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      // For signup, redirect to login page instead of dashboard
      if (!isLogin) {
        // Show success message and switch to login
        setIsLogin(true)
        setError('')
        setPassword('')
        setFullName('')
        setEmail(email) // Pre-fill email
        alert('Account created successfully! Please sign in with your credentials.')
        return
      }

      router.push(returnTo)
      router.refresh()
    } catch (err: unknown) {
      const errorObj = err as { details?: Array<{ field: string; message: string }>; message?: string }
      if (errorObj.details) {
        const messages = errorObj.details.map(d => d.message).join(', ')
        setError(messages)
      } else {
        const message = errorObj.message || 'Authentication failed'
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    window.location.href = '/api/auth/oauth/google'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-5 shadow-xl shadow-indigo-200">
              <Package className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">DKS StockAlert</h1>
            <p className="text-gray-500 mt-2">{isLogin ? 'Welcome back! Sign in to continue.' : 'Start managing your inventory today.'}</p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-4 rounded-2xl">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-3.5 px-4 rounded-xl font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm mb-4"
          >
            {googleLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-gray-50/50 hover:bg-white hover:shadow-md cursor-text text-gray-900"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-gray-50/50 hover:bg-white hover:shadow-md cursor-text text-gray-900"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (!isLogin) {
                      const error = validatePassword(e.target.value)
                      setPasswordError(error)
                    }
                  }}
                  onBlur={() => {
                    if (!isLogin) {
                      const error = validatePassword(password)
                      setPasswordError(error)
                    }
                  }}
                  className={`w-full pl-12 pr-4 py-3.5 border rounded-xl focus:ring-4 outline-none transition-all bg-gray-50/50 hover:bg-white hover:shadow-md cursor-text text-gray-900 ${passwordError ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/10'
                    }`}
                  placeholder="••••••••"
                  required
                />
              </div>
              {!isLogin && password && (
                <div className="mt-2 space-y-1">
                  <p className={`text-xs flex items-center gap-1.5 ${password.length >= 8 ? 'text-emerald-600' : 'text-red-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${password.length >= 8 ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    At least 8 characters
                  </p>
                  <p className={`text-xs flex items-center gap-1.5 ${/[A-Z]/.test(password) ? 'text-emerald-600' : 'text-red-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(password) ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    One uppercase letter
                  </p>
                  <p className={`text-xs flex items-center gap-1.5 ${/[a-z]/.test(password) ? 'text-emerald-600' : 'text-red-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${/[a-z]/.test(password) ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    One lowercase letter
                  </p>
                  <p className={`text-xs flex items-center gap-1.5 ${/[0-9]/.test(password) ? 'text-emerald-600' : 'text-red-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(password) ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    One number
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white py-4 px-4 rounded-xl font-semibold hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-4">
            {isLogin && (
              <Link
                href="/auth/forgot-password"
                className="block text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors cursor-pointer hover:underline"
              >
                Forgot your password?
              </Link>
            )}
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
                setPasswordError('')
                setPassword('')
                setFullName('')
              }}
              className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
