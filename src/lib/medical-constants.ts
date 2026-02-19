// Medical-specific units for pharmaceutical products
export const MEDICAL_UNIT_OPTIONS = [
  // Tablets/Capsules
  { value: 'tablet', label: 'Tablet' },
  { value: 'capsule', label: 'Capsule' },
  { value: 'strip', label: 'Strip' },
  { value: 'box', label: 'Box' },
  
  // Liquids
  { value: 'bottle', label: 'Bottle' },
  { value: 'syrup', label: 'Syrup (100ml)' },
  { value: 'suspension', label: 'Suspension' },
  { value: 'drop', label: 'Drop' },
  
  // Injectables
  { value: 'vial', label: 'Vial' },
  { value: 'ampoule', label: 'Ampoule' },
  { value: 'prefilled_syringe', label: 'Prefilled Syringe' },
  
  // Topicals
  { value: 'tube', label: 'Tube (Ointment/Gel)' },
  { value: 'cream', label: 'Cream/Jar' },
  { value: 'lotion', label: 'Lotion' },
  
  // Others
  { value: 'sachet', label: 'Sachet' },
  { value: 'inhaler', label: 'Inhaler' },
  { value: 'patch', label: 'Patch' },
  { value: 'suppository', label: 'Suppository' },
  { value: 'unit', label: 'Unit (General)' },
]

// Drug schedules for India
export const DRUG_SCHEDULE_OPTIONS = [
  { value: 'OTC', label: 'OTC - Over the Counter', color: 'text-green-600', bgColor: 'bg-green-100' },
  { value: 'SCHEDULE_H', label: 'Schedule H - Prescription Required', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  { value: 'SCHEDULE_H1', label: 'Schedule H1 - Narcotics (Strict Control)', color: 'text-red-600', bgColor: 'bg-red-100' },
  { value: 'SCHEDULE_X', label: 'Schedule X - High Risk', color: 'text-red-600', bgColor: 'bg-red-100' },
  { value: 'SCHEDULE_G', label: 'Schedule G - Ayurvedic/Unani', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { value: 'SCHEDULE_C', label: 'Schedule C - Biological', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  { value: 'SCHEDULE_J', label: 'Schedule J - Diabetes', color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  { value: 'SCHEDULE_K', label: 'Schedule K - Statins', color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
]

// Storage temperature options
export const STORAGE_TEMP_OPTIONS = [
  { value: 'ROOM_TEMP', label: 'Room Temperature (15-25°C)', icon: '🌡️' },
  { value: 'COOL', label: 'Cool (8-15°C)', icon: '❄️' },
  { value: 'REFRIGERATED', label: 'Refrigerated (2-8°C)', icon: '🧊' },
  { value: 'FROZEN', label: 'Frozen (-15 to -25°C)', icon: '🧊' },
  { value: 'PROTECTED', label: 'Protect from Light/Heat', icon: '☀️' },
]

// Common medicine HSN codes for GST
export const MEDICINE_HSN_CODES = [
  { code: '3004', description: 'Medicaments', gstRate: 12 },
  { code: '3003', description: 'Ayurvedic Medicines', gstRate: 12 },
  { code: '3005', description: 'Surgical Dressings', gstRate: 12 },
  { code: '9018', description: 'Medical Instruments', gstRate: 12 },
  { code: '3006', description: 'Contraceptives', gstRate: 0 },
]

// Medicine categories for dropdown
export const MEDICINE_CATEGORIES = [
  'Analgesics',
  'Antibiotics',
  'Antihistamines',
  'Antipyretics',
  'Antiseptics',
  'Cardiovascular',
  'Diabetes',
  'Gastrointestinal',
  'Nutritional Supplements',
  'Pain Relief',
  'Respiratory',
  'Skin Care',
  'Vitamins',
  'Women Health',
  'Children Care',
  'First Aid',
  'General Medicines',
]
