'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Users, UserPlus, Mail, Shield, MoreVertical, X, RefreshCw, Lock, ChevronRight } from 'lucide-react'
import { SubscriptionGate } from '@/components/SubscriptionGate'
import { useUpgradeToast } from '@/components/UpgradeNotification'
import Link from 'next/link'
import SidebarLayout from '@/components/SidebarLayout'

interface TeamMember {
  id: number
  email: string
  full_name: string | null
  role: string
  status: string
  created_at: string
}

export default function TeamPage() {
  const router = useRouter()
  const [team, setTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const { showLimitReached } = useUpgradeToast()

  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'editor'
  })

  useEffect(() => {
    fetchTeam()
  }, [])

  const fetchTeam = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/team', {
        credentials: 'include'
      })
      if (!res.ok) throw new Error('Failed to fetch team')

      const data = await res.json()
      setTeam(data.team || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError('')
    setSuccessMessage('')

    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
        credentials: 'include'
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 403 && data.limit !== undefined) {
          showLimitReached('team_members', data.current, data.limit)
          setError(`Team member limit reached. Please upgrade your plan to add more members.`)
          return
        }
        throw new Error(data.error || 'Failed to create user')
      }

      setSuccessMessage(`User created: ${createForm.email}`)
      setCreateForm({ email: '', password: '', full_name: '', role: 'editor' })
      setShowCreateForm(false)
      fetchTeam()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  const handleRemoveMember = async (memberId: number) => {
    if (!confirm('Remove this team member? They will lose access to all data.')) return

    try {
      const res = await fetch(`/api/team/${memberId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!res.ok) throw new Error('Failed to remove team member')

      setSuccessMessage('Team member removed')
      fetchTeam()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      owner: 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border border-purple-200',
      admin: 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200',
      editor: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200',
      viewer: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-200'
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[role] || colors.viewer}`}>
        {role?.charAt(0).toUpperCase() + role?.slice(1)}
      </span>
    )
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200',
      inactive: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 border border-gray-200',
      pending: 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-200'
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || colors.inactive}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Users className="w-8 h-8 text-indigo-300" />
            </div>
          </div>
          <p className="text-gray-600 font-medium">Loading team...</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarLayout>
      <SubscriptionGate>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 rounded-2xl flex items-center gap-3">
              <span className="font-medium">{error}</span>
              <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50/80 backdrop-blur-sm border border-green-200 text-green-700 rounded-2xl flex items-center gap-3">
              <span className="font-medium">{successMessage}</span>
              <button onClick={() => setSuccessMessage('')} className="ml-auto text-green-500 hover:text-green-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {showCreateForm && (
            <div className="mb-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Create New User</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                      placeholder="user@example.com"
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-gray-900 bg-gray-50/50 hover:bg-white hover:shadow-md cursor-text"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={createForm.password}
                      onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                      placeholder="At least 8 characters"
                      required
                      minLength={8}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-gray-900 bg-gray-50/50 hover:bg-white hover:shadow-md cursor-text"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Password must be at least 8 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={createForm.full_name}
                    onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-gray-900 bg-gray-50/50 hover:bg-white hover:shadow-md cursor-text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={createForm.role}
                      onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all appearance-none bg-gray-50/50 hover:bg-white cursor-pointer text-gray-900"
                    >
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>
                  <div className="mt-3 p-4 bg-gray-50 rounded-xl space-y-2 text-sm">
                    <p className="flex items-start gap-2">
                      <span className="font-semibold text-indigo-600">Admin:</span>
                      <span className="text-gray-600">Full access except organization deletion</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="font-semibold text-green-600">Editor:</span>
                      <span className="text-gray-600">Can create/edit products, sales, inventory</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="font-semibold text-gray-600">Viewer:</span>
                      <span className="text-gray-600">Read-only access</span>
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                  >
                    {creating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Creating...
                      </>
                    ) : (
                      'Create User'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Team Members</h2>
              <div className="flex items-center gap-3">
                <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                  {team.length} members
                </span>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl cursor-pointer"
                >
                  <UserPlus className="w-5 h-5" />
                  Add Member
                </button>
              </div>
            </div>

            {team.length === 0 ? (
              <div className="text-center py-16 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No team members yet</h3>
                <p className="text-gray-500 mb-6">Create your first team member to get started</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl cursor-pointer"
                >
                  <UserPlus className="w-5 h-5" />
                  Create First Member
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {team.map((member) => (
                  <div
                    key={member.id}
                    className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100 p-5 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
                    onClick={() => router.push(`/team/${member.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-indigo-200 transition-shadow">
                          <span className="text-white font-bold text-xl">
                            {member.full_name?.charAt(0) || member.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{member.full_name || member.email}</h3>
                          <p className="text-sm text-gray-500 flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5" />
                            {member.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getRoleBadge(member.role)}
                        {getStatusBadge(member.status)}
                        {member.role !== 'owner' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveMember(member.id)
                            }}
                            className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                            title="Remove member"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </SubscriptionGate>
    </SidebarLayout>
  )
}
