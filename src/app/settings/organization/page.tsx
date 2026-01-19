'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Building, Save, Loader2, AlertCircle, CheckCircle, Users, Calendar, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { SubscriptionGate } from '@/components/SubscriptionGate'

interface Organization {
  id: number
  name: string
  created_at: string
  updated_at: string
}

interface Owner {
  id: number
  email: string
  full_name: string | null
}

export default function OrganizationSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [org, setOrg] = useState<Organization | null>(null)
  const [owner, setOwner] = useState<Owner | null>(null)
  const [memberCount, setMemberCount] = useState(0)
  const [name, setName] = useState('')

  useEffect(() => {
    fetchOrganization()
  }, [])

  const fetchOrganization = async () => {
    try {
      const res = await fetch('/api/settings/organization')
      if (res.status === 401) {
        router.push('/auth')
        return
      }
      if (res.status === 403) {
        setError('Only owners can access organization settings')
        setLoading(false)
        return
      }
      const data = await res.json()
      setOrg(data.organization)
      setOwner(data.owner)
      setMemberCount(data.memberCount)
      setName(data.organization.name)
    } catch (err) {
      setError('Failed to load organization')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const res = await fetch('/api/settings/organization', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update organization')
      }

      setOrg(data.organization)
      setSuccess('Organization name updated successfully')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Building className="w-8 h-8 text-indigo-300" />
            </div>
          </div>
          <p className="text-gray-600 font-medium">Loading organization...</p>
        </div>
      </div>
    )
  }

  return (
    <SubscriptionGate>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white/90 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <Link href="/profile" className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <Building className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Organization Settings</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 rounded-2xl flex items-center gap-3 animate-pulse">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-red-600 font-bold">!</span>
            </div>
            <span className="font-medium">{error}</span>
            <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700 cursor-pointer">
              <span className="sr-only">Close</span>
              <span className="text-xl">&times;</span>
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50/80 backdrop-blur-sm border border-green-200 text-green-700 rounded-2xl flex items-center gap-3 animate-fade-in">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-medium">{success}</span>
            <button onClick={() => setSuccess('')} className="ml-auto text-green-500 hover:text-green-700 cursor-pointer">
              <span className="sr-only">Close</span>
              <span className="text-xl">&times;</span>
            </button>
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-6">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Building className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Organization Details</h2>
              <p className="text-sm text-gray-500">Update your organization information</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                Organization Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-gray-50/50 hover:bg-white hover:shadow-md focus:bg-white text-gray-900 cursor-text"
                placeholder="Your Company Name"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                This is how your organization will appear to team members
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving || name === org?.name}
                className="px-6 py-3.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 cursor-pointer"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Building className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Organization Information</h2>
              <p className="text-sm text-gray-500">Overview of your organization</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-gray-100 hover:bg-gray-50/50 px-4 rounded-lg transition-colors">
              <span className="text-gray-600 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                Team Members
              </span>
              <span className="font-semibold text-gray-900">{memberCount}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100 hover:bg-gray-50/50 px-4 rounded-lg transition-colors">
              <span className="text-gray-600 flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-green-600" />
                </div>
                Created
              </span>
              <span className="font-medium text-gray-900">
                {org?.created_at ? new Date(org.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : '-'}
              </span>
            </div>
            <div className="flex justify-between py-3 hover:bg-gray-50/50 px-4 rounded-lg transition-colors">
              <span className="text-gray-600">Organization ID</span>
              <span className="font-mono text-gray-900">#{org?.id}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-6">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Owner</h2>
              <p className="text-sm text-gray-500">Organization owner information</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-200">
              <span className="text-white font-bold text-lg">
                {owner?.full_name?.charAt(0) || owner?.email.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{owner?.full_name || 'Owner'}</h3>
              <p className="text-sm text-gray-500">{owner?.email}</p>
            </div>
            <span className="ml-auto px-4 py-1.5 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded-full text-xs font-semibold border border-purple-200">
              Owner
            </span>
          </div>

          <p className="mt-5 text-sm text-gray-500 leading-relaxed">
            The owner has full control over the organization, including billing, team management, and deletion.
            To transfer ownership, please contact support.
          </p>
        </div>
      </main>
    </div>
    </SubscriptionGate>
  )
}
