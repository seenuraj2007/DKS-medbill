'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Save, FileText, User, Plus, Trash2, Calendar, Stethoscope, Building2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import SidebarLayout from '@/components/SidebarLayout'

interface Patient {
  id: string
  name: string
  phone: string | null
  email: string | null
}

interface PrescriptionItem {
  medicine_name: string
  dosage: string
  frequency: string
  duration: string
  quantity: number
  product_id: string | null
}

export default function NewPrescriptionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedPatientId = searchParams.get('patientId')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showPatientSearch, setShowPatientSearch] = useState(!preselectedPatientId)

  const [formData, setFormData] = useState({
    patient_id: preselectedPatientId || '',
    doctor_name: '',
    doctor_phone: '',
    doctor_reg_number: '',
    clinic_name: '',
    clinic_address: '',
    prescription_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    notes: ''
  })

  const [items, setItems] = useState<PrescriptionItem[]>([
    { medicine_name: '', dosage: '', frequency: '', duration: '', quantity: 0, product_id: null }
  ])

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const res = await fetch('/api/patients?limit=100')
      if (!res.ok) throw new Error('Failed to fetch patients')
      const data = await res.json()
      setPatients(data.patients)
    } catch (error) {
      console.error('Error fetching patients:', error)
    }
  }

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.phone?.includes(searchQuery)
  )

  const selectedPatient = patients.find(p => p.id === formData.patient_id)

  const addItem = () => {
    setItems([...items, { medicine_name: '', dosage: '', frequency: '', duration: '', quantity: 0, product_id: null }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof PrescriptionItem, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.patient_id) {
      setError('Please select a patient')
      setLoading(false)
      return
    }

    if (!formData.doctor_name) {
      setError('Doctor name is required')
      setLoading(false)
      return
    }

    // Filter out empty items
    const validItems = items.filter(item => item.medicine_name.trim())
    
    if (validItems.length === 0) {
      setError('Please add at least one medicine')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items: validItems
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create prescription')
      }

      router.push('/prescriptions')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SidebarLayout>
      <div className="sm:max-w-3xl mx-auto px-4 sm:px-0 pb-20">
        {/* Mobile Header */}
        <div className="sm:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-40 px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/prescriptions" className="p-2 -ml-2">
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </Link>
            <h1 className="text-lg font-bold text-gray-900">Add Prescription</h1>
            <div className="w-10" />
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden sm:block mb-8">
          <Link
            href="/prescriptions"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Prescriptions
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Add New Prescription</h1>
          <p className="text-gray-500 mt-1">Create a prescription for a patient</p>
        </div>

        <div className="mt-16 sm:mt-0 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                Patient
              </h3>
              
              {showPatientSearch ? (
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search patient by name or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl">
                    {filteredPatients.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No patients found. <Link href="/patients/new" className="text-indigo-600 font-medium">Add new patient</Link>
                      </div>
                    ) : (
                      filteredPatients.map((patient) => (
                        <button
                          key={patient.id}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, patient_id: patient.id })
                            setShowPatientSearch(false)
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0 flex items-center gap-3"
                        >
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{patient.name}</p>
                            {patient.phone && (
                              <p className="text-sm text-gray-500">{patient.phone}</p>
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ) : selectedPatient ? (
                <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{selectedPatient.name}</p>
                    {selectedPatient.phone && (
                      <p className="text-sm text-gray-600">{selectedPatient.phone}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPatientSearch(true)}
                    className="text-sm text-indigo-600 font-medium hover:text-indigo-700"
                  >
                    Change
                  </button>
                </div>
              ) : null}
            </div>

            {/* Doctor Information */}
            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-green-600" />
                Doctor Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Doctor Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.doctor_name}
                    onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                    placeholder="Dr. Name"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.doctor_phone}
                    onChange={(e) => setFormData({ ...formData, doctor_phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    value={formData.doctor_reg_number}
                    onChange={(e) => setFormData({ ...formData, doctor_reg_number: e.target.value })}
                    placeholder="MCI-12345"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Clinic Name
                  </label>
                  <input
                    type="text"
                    value={formData.clinic_name}
                    onChange={(e) => setFormData({ ...formData, clinic_name: e.target.value })}
                    placeholder="Clinic/Hospital name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Clinic Address
                  </label>
                  <input
                    type="text"
                    value={formData.clinic_address}
                    onChange={(e) => setFormData({ ...formData, clinic_address: e.target.value })}
                    placeholder="Clinic address"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Prescription Details */}
            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                Prescription Details
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prescription Date
                  </label>
                  <input
                    type="date"
                    value={formData.prescription_date}
                    onChange={(e) => setFormData({ ...formData, prescription_date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date (if applicable)
                  </label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Medicines */}
            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Medicines
              </h3>
              
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-600">Medicine #{index + 1}</span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          placeholder="Medicine name"
                          value={item.medicine_name}
                          onChange={(e) => updateItem(index, 'medicine_name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      
                      <input
                        type="text"
                        placeholder="Dosage (e.g., 1-0-1)"
                        value={item.dosage}
                        onChange={(e) => updateItem(index, 'dosage', e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      
                      <input
                        type="text"
                        placeholder="Frequency"
                        value={item.frequency}
                        onChange={(e) => updateItem(index, 'frequency', e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      
                      <input
                        type="text"
                        placeholder="Duration (e.g., 5 days)"
                        value={item.duration}
                        onChange={(e) => updateItem(index, 'duration', e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      
                      <input
                        type="number"
                        placeholder="Quantity"
                        value={item.quantity || ''}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addItem}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-medium hover:border-indigo-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Medicine
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="pt-6 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any special instructions or notes..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* Submit Buttons */}
            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
              <Link
                href="/prescriptions"
                className="w-full sm:w-auto px-6 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Prescription
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </SidebarLayout>
  )
}
