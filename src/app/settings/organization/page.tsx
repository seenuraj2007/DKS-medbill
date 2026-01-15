'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Building, Save, Loader2, AlertCircle, CheckCircle, Users, Calendar, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <Link href="/profile" className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Organization Settings</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Organization Details</h2>

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Organization Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900"
                placeholder="Your Company Name"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                This is how your organization will appear to team members
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving || name === org?.name}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Organization Information</h2>

          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Team Members
              </span>
              <span className="font-medium text-gray-900">{memberCount}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
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
            <div className="flex justify-between py-3">
              <span className="text-gray-500">Organization ID</span>
              <span className="font-medium text-gray-900">#{org?.id}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Owner</h2>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {owner?.full_name?.charAt(0) || owner?.email.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{owner?.full_name || 'Owner'}</h3>
              <p className="text-sm text-gray-500">{owner?.email}</p>
            </div>
            <span className="ml-auto px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
              Owner
            </span>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            The owner has full control over the organization, including billing, team management, and deletion.
            To transfer ownership, please contact support.
          </p>
        </div>
      </main>
    </div>
  )
}
