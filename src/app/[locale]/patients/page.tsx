'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, User, Phone, Mail, ChevronRight, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import SidebarLayout from '@/components/SidebarLayout'

interface Patient {
  id: string
  name: string
  phone: string | null
  email: string | null
  city: string | null
  createdAt: string
  prescriptions: {
    id: string
    prescriptionDate: string
    doctorName: string
  }[]
}

export default function PatientsPage() {
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const res = await fetch('/api/patients')
      if (!res.ok) throw new Error('Failed to fetch patients')
      const data = await res.json()
      setPatients(data.patients)
    } catch (error) {
      console.error('Error fetching patients:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.phone?.includes(searchQuery) ||
    patient.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <SidebarLayout>
      <div className="sm:max-w-7xl mx-auto pb-20 sm:pb-0">
        {/* Mobile Header */}
        <div className="sm:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-40 px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Patients</h1>
            <Link
              href="/patients/new"
              className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg"
            >
              <Plus className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden sm:block mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
              <p className="text-gray-500 mt-1">Manage patient records and prescriptions</p>
            </div>
            <Link
              href="/patients/new"
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add Patient
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-16 sm:mt-0 mb-6 px-4 sm:px-0">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients by name, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900"
            />
          </div>
        </div>

        {/* Patients List */}
        <div className="px-4 sm:px-0">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No patients found</h3>
              <p className="text-gray-500 mb-6">{searchQuery ? 'Try adjusting your search' : 'Start by adding your first patient'}</p>
              <Link
                href="/patients/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold"
              >
                <Plus className="w-5 h-5" />
                Add Patient
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPatients.map((patient) => (
                <Link
                  key={patient.id}
                  href={`/patients/${patient.id}`}
                  className="block bg-white rounded-2xl p-4 border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all active:scale-[0.99]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{patient.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        {patient.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" />
                            {patient.phone}
                          </span>
                        )}
                        {patient.city && (
                          <span className="hidden sm:inline">• {patient.city}</span>
                        )}
                      </div>
                      {patient.prescriptions.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                            {patient.prescriptions.length} Active Prescription{patient.prescriptions.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile FAB */}
      <div className="sm:hidden fixed bottom-6 right-6">
        <Link
          href="/patients/new"
          className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:scale-105 transition-all"
        >
          <Plus className="w-6 h-6" />
        </Link>
      </div>
    </SidebarLayout>
  )
}
