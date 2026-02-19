'use client'

import { useState, useEffect } from 'react'
import { Search, User, Phone, X, Plus, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface Patient {
  id: string
  name: string
  phone: string | null
  email: string | null
}

interface Prescription {
  id: string
  doctorName: string
  prescriptionDate: string
  expiryDate: string | null
  status: string
  prescriptionItems: {
    id: string
    medicineName: string
    quantity: number
  }[]
}

interface PatientSelectorProps {
  selectedPatient: Patient | null
  selectedPrescription: Prescription | null
  onSelectPatient: (patient: Patient | null) => void
  onSelectPrescription: (prescription: Prescription | null) => void
}

export default function PatientSelector({
  selectedPatient,
  selectedPrescription,
  onSelectPatient,
  onSelectPrescription
}: PatientSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen && !selectedPatient) {
      fetchData()
    }
  }, [isOpen])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [patientsRes, prescriptionsRes] = await Promise.all([
        fetch('/api/patients?limit=50'),
        selectedPatient ? fetch(`/api/prescriptions?patientId=${selectedPatient.id}&status=ACTIVE`) : Promise.resolve({ ok: true, json: () => ({ prescriptions: [] }) })
      ])

      const patientsData = await patientsRes.json()
      const prescriptionsData = await prescriptionsRes.json()

      setPatients(patientsData.patients || [])
      setPrescriptions(prescriptionsData.prescriptions || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.phone?.includes(searchQuery)
  )

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
  }

  const activePrescriptions = prescriptions.filter(p => 
    p.status === 'ACTIVE' && !isExpired(p.expiryDate)
  )

  return (
    <div className="space-y-3">
      {/* Current Selection */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            {selectedPatient ? (
              <>
                <p className="font-medium text-gray-900">{selectedPatient.name}</p>
                {selectedPatient.phone && (
                  <p className="text-sm text-gray-500">{selectedPatient.phone}</p>
                )}
              </>
            ) : (
              <p className="text-gray-500">Walk-in Customer</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="text-sm text-indigo-600 font-medium hover:text-indigo-700"
        >
          {selectedPatient ? 'Change' : 'Select'}
        </button>
      </div>

      {/* Prescription Selection (if patient selected) */}
      {selectedPatient && activePrescriptions.length > 0 && (
        <div className="p-3 bg-green-50 rounded-xl border border-green-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-green-800">Active Prescriptions</p>
            <Link 
              href={`/prescriptions/new?patientId=${selectedPatient.id}`}
              className="text-xs text-green-700 hover:text-green-900 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              New
            </Link>
          </div>
          <div className="space-y-2">
            {activePrescriptions.slice(0, 3).map((prescription) => (
              <button
                key={prescription.id}
                type="button"
                onClick={() => onSelectPrescription(
                  selectedPrescription?.id === prescription.id ? null : prescription
                )}
                className={`w-full p-2 rounded-lg text-left transition-all ${
                  selectedPrescription?.id === prescription.id
                    ? 'bg-green-500 text-white'
                    : 'bg-white border border-green-200 hover:bg-green-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${
                      selectedPrescription?.id === prescription.id ? 'text-white' : 'text-gray-900'
                    }`}>
                      Dr. {prescription.doctorName}
                    </p>
                    <p className={`text-xs ${
                      selectedPrescription?.id === prescription.id ? 'text-green-100' : 'text-gray-500'
                    }`}>
                      {prescription.prescriptionItems.length} medicines • {' '}
                      {new Date(prescription.prescriptionDate).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  {selectedPrescription?.id === prescription.id && (
                    <span className="text-white text-xs">Selected</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Patient Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-semibold text-gray-900">Select Patient</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Patient List */}
            <div className="overflow-y-auto max-h-96 p-2">
              {/* Walk-in Option */}
              <button
                onClick={() => {
                  onSelectPatient(null)
                  onSelectPrescription(null)
                  setIsOpen(false)
                }}
                className={`w-full p-4 rounded-xl text-left flex items-center gap-3 transition-all ${
                  !selectedPatient
                    ? 'bg-indigo-50 border-2 border-indigo-500'
                    : 'hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Walk-in Customer</p>
                  <p className="text-sm text-gray-500">No patient record</p>
                </div>
                {!selectedPatient && (
                  <span className="text-xs bg-indigo-500 text-white px-2 py-1 rounded-full">Selected</span>
                )}
              </button>

              {loading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : filteredPatients.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No patients found
                </div>
              ) : (
                filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => {
                      onSelectPatient(patient)
                      onSelectPrescription(null)
                      setIsOpen(false)
                    }}
                    className={`w-full p-4 rounded-xl text-left flex items-center gap-3 transition-all ${
                      selectedPatient?.id === patient.id
                        ? 'bg-indigo-50 border-2 border-indigo-500'
                        : 'hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{patient.name}</p>
                      {patient.phone && (
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {patient.phone}
                        </p>
                      )}
                    </div>
                    {selectedPatient?.id === patient.id && (
                      <span className="text-xs bg-indigo-500 text-white px-2 py-1 rounded-full">Selected</span>
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100">
              <Link
                href="/patients/new"
                onClick={() => setIsOpen(false)}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-medium hover:border-indigo-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add New Patient
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
