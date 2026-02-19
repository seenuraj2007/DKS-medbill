'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, FileText, User, Calendar, ChevronRight, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import SidebarLayout from '@/components/SidebarLayout'

interface Prescription {
  id: string
  doctorName: string
  doctorPhone: string | null
  clinicName: string | null
  prescriptionDate: string
  expiryDate: string | null
  status: string
  createdAt: string
  patient: {
    id: string
    name: string
    phone: string | null
  }
  prescriptionItems: {
    id: string
    medicineName: string
    quantity: number
  }[]
}

export default function PrescriptionsPage() {
  const router = useRouter()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchPrescriptions()
  }, [])

  const fetchPrescriptions = async () => {
    try {
      const res = await fetch('/api/prescriptions')
      if (!res.ok) throw new Error('Failed to fetch prescriptions')
      const data = await res.json()
      setPrescriptions(data.prescriptions)
    } catch (error) {
      console.error('Error fetching prescriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prescription.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prescription.prescriptionItems.some(item => 
      item.medicineName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
  }

  return (
    <SidebarLayout>
      <div className="sm:max-w-7xl mx-auto pb-20 sm:pb-0">
        {/* Mobile Header */}
        <div className="sm:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-40 px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Prescriptions</h1>
            <Link
              href="/prescriptions/new"
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
              <h1 className="text-3xl font-bold text-gray-900">Prescriptions</h1>
              <p className="text-gray-500 mt-1">Manage patient prescriptions</p>
            </div>
            <Link
              href="/prescriptions/new"
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add Prescription
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-16 sm:mt-0 mb-6 px-4 sm:px-0">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient, doctor, or medicine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900"
            />
          </div>
        </div>

        {/* Prescriptions List */}
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
          ) : filteredPrescriptions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No prescriptions found</h3>
              <p className="text-gray-500 mb-6">{searchQuery ? 'Try adjusting your search' : 'Start by adding your first prescription'}</p>
              <Link
                href="/prescriptions/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold"
              >
                <Plus className="w-5 h-5" />
                Add Prescription
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPrescriptions.map((prescription) => {
                const expired = isExpired(prescription.expiryDate)
                return (
                  <Link
                    key={prescription.id}
                    href={`/prescriptions/${prescription.id}`}
                    className="block bg-white rounded-2xl p-4 border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all active:scale-[0.99]"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900 truncate">
                              {prescription.patient.name}
                            </h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                              <User className="w-3.5 h-3.5" />
                              Dr. {prescription.doctorName}
                              {prescription.clinicName && (
                                <span className="hidden sm:inline"> • {prescription.clinicName}</span>
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {prescription.status === 'ACTIVE' && !expired ? (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                Active
                              </span>
                            ) : expired ? (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                                Expired
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                                {prescription.status}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(prescription.prescriptionDate).toLocaleDateString('en-IN')}
                          </span>
                          {prescription.expiryDate && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              Exp: {new Date(prescription.expiryDate).toLocaleDateString('en-IN')}
                            </span>
                          )}
                        </div>

                        {prescription.prescriptionItems.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {prescription.prescriptionItems.slice(0, 3).map((item, idx) => (
                              <span 
                                key={idx}
                                className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg"
                              >
                                {item.medicineName}
                              </span>
                            ))}
                            {prescription.prescriptionItems.length > 3 && (
                              <span className="text-xs text-gray-500 px-2 py-1">
                                +{prescription.prescriptionItems.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0 mt-2" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile FAB */}
      <div className="sm:hidden fixed bottom-6 right-6">
        <Link
          href="/prescriptions/new"
          className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:scale-105 transition-all"
        >
          <Plus className="w-6 h-6" />
        </Link>
      </div>
    </SidebarLayout>
  )
}
