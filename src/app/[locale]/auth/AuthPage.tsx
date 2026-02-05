'use client'

import { useState, useEffect } from 'react'
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

  useEffect(() => {
    checkAuth()
  }, [])

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

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (res.ok) {
        router.push(returnTo)
      }
    } catch (err) {
    }
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

          <form onSubmit={handleAuth} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                  className={`w-full pl-12 pr-4 py-3.5 border rounded-xl focus:ring-4 outline-none transition-all bg-gray-50/50 hover:bg-white hover:shadow-md cursor-text text-gray-900 ${
                    passwordError ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/10'
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
              <a
                href="/auth/forgot-password"
                className="block text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors cursor-pointer hover:underline"
              >
                Forgot your password?
              </a>
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