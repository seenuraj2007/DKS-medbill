import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Common Indian medicines database (seed data)
const MEDICINE_DATABASE = [
  { name: 'Paracetamol 500mg', composition: 'Paracetamol IP 500mg', manufacturer: 'Various', mrp: 25, hsnCode: '3004', drugSchedule: 'OTC', category: 'Analgesics', unit: 'strip' },
  { name: 'Paracetamol 650mg', composition: 'Paracetamol IP 650mg', manufacturer: 'Various', mrp: 35, hsnCode: '3004', drugSchedule: 'OTC', category: 'Analgesics', unit: 'strip' },
  { name: 'Crocin 500mg', composition: 'Paracetamol IP 500mg', manufacturer: 'GSK', mrp: 30, hsnCode: '3004', drugSchedule: 'OTC', category: 'Analgesics', unit: 'strip' },
  { name: 'Calpol 500mg', composition: 'Paracetamol IP 500mg', manufacturer: 'Pfizer', mrp: 28, hsnCode: '3004', drugSchedule: 'OTC', category: 'Analgesics', unit: 'strip' },
  { name: 'Dolo 500mg', composition: 'Paracetamol IP 500mg', manufacturer: 'Micro Labs', mrp: 25, hsnCode: '3004', drugSchedule: 'OTC', category: 'Analgesics', unit: 'strip' },
  { name: 'Combiflam', composition: 'Paracetamol 500mg + Ibuprofen 400mg', manufacturer: 'GSK', mrp: 45, hsnCode: '3004', drugSchedule: 'OTC', category: 'Analgesics', unit: 'strip' },
  { name: 'Ibugesic 400mg', composition: 'Ibuprofen IP 400mg', manufacturer: 'Cipla', mrp: 35, hsnCode: '3004', drugSchedule: 'OTC', category: 'Analgesics', unit: 'strip' },
  { name: 'Brufen 400mg', composition: 'Ibuprofen IP 400mg', manufacturer: 'Abbott', mrp: 40, hsnCode: '3004', drugSchedule: 'OTC', category: 'Analgesics', unit: 'strip' },
  { name: 'Aspirin 75mg', composition: 'Aspirin IP 75mg', manufacturer: 'Various', mrp: 20, hsnCode: '3004', drugSchedule: 'OTC', category: 'Analgesics', unit: 'strip' },
  { name: 'Disprin', composition: 'Aspirin IP 500mg', manufacturer: 'Reckitt', mrp: 25, hsnCode: '3004', drugSchedule: 'OTC', category: 'Analgesics', unit: 'strip' },
  { name: 'Amoxicillin 500mg', composition: 'Amoxicillin Trihydrate IP 500mg', manufacturer: 'Various', mrp: 85, hsnCode: '3004', drugSchedule: 'SCHEDULE_H', category: 'Antibiotics', unit: 'strip' },
  { name: 'Azithromycin 500mg', composition: 'Azithromycin Dihydrate IP 500mg', manufacturer: 'Various', mrp: 120, hsnCode: '3004', drugSchedule: 'SCHEDULE_H', category: 'Antibiotics', unit: 'strip' },
  { name: 'Zithromax 500mg', composition: 'Azithromycin Dihydrate IP 500mg', manufacturer: 'Pfizer', mrp: 180, hsnCode: '3004', drugSchedule: 'SCHEDULE_H', category: 'Antibiotics', unit: 'strip' },
  { name: 'Ciprofloxacin 500mg', composition: 'Ciprofloxacin Hydrochloride IP 500mg', manufacturer: 'Various', mrp: 65, hsnCode: '3004', drugSchedule: 'SCHEDULE_H', category: 'Antibiotics', unit: 'strip' },
  { name: 'Ciprobid 500mg', composition: 'Ciprofloxacin Hydrochloride IP 500mg', manufacturer: 'Zydus', mrp: 75, hsnCode: '3004', drugSchedule: 'SCHEDULE_H', category: 'Antibiotics', unit: 'strip' },
  { name: 'Metronidazole 400mg', composition: 'Metronidazole IP 400mg', manufacturer: 'Various', mrp: 40, hsnCode: '3004', drugSchedule: 'SCHEDULE_H', category: 'Antibiotics', unit: 'strip' },
  { name: 'Flagyl 400mg', composition: 'Metronidazole IP 400mg', manufacturer: 'Abbott', mrp: 55, hsnCode: '3004', drugSchedule: 'SCHEDULE_H', category: 'Antibiotics', unit: 'strip' },
  { name: 'Cetirizine 10mg', composition: 'Cetirizine Hydrochloride IP 10mg', manufacturer: 'Various', mrp: 25, hsnCode: '3004', drugSchedule: 'OTC', category: 'Antihistamines', unit: 'strip' },
  { name: 'Cetrizine 10mg', composition: 'Cetirizine Hydrochloride IP 10mg', manufacturer: 'Various', mrp: 20, hsnCode: '3004', drugSchedule: 'OTC', category: 'Antihistamines', unit: 'strip' },
  { name: 'Allegra 120mg', composition: 'Fexofenadine Hydrochloride IP 120mg', manufacturer: 'Sanofi', mrp: 65, hsnCode: '3004', drugSchedule: 'OTC', category: 'Antihistamines', unit: 'strip' },
  { name: 'Levocetirizine 5mg', composition: 'Levocetirizine Dihydrochloride IP 5mg', manufacturer: 'Various', mrp: 50, hsnCode: '3004', drugSchedule: 'OTC', category: 'Antihistamines', unit: 'strip' },
  { name: 'Montair LC', composition: 'Montelukast 10mg + Levocetirizine 5mg', manufacturer: 'Cipla', mrp: 120, hsnCode: '3004', drugSchedule: 'OTC', category: 'Antihistamines', unit: 'strip' },
  { name: 'Ondansetron 4mg', composition: 'Ondansetron Hydrochloride IP 4mg', manufacturer: 'Various', mrp: 30, hsnCode: '3004', drugSchedule: 'SCHEDULE_H', category: 'Gastrointestinal', unit: 'strip' },
  { name: 'Emeset 4mg', composition: 'Ondansetron Hydrochloride IP 4mg', manufacturer: 'Cipla', mrp: 45, hsnCode: '3004', drugSchedule: 'SCHEDULE_H', category: 'Gastrointestinal', unit: 'strip' },
  { name: 'Omeprazole 20mg', composition: 'Omeprazole IP 20mg', manufacturer: 'Various', mrp: 30, hsnCode: '3004', drugSchedule: 'OTC', category: 'Gastrointestinal', unit: 'strip' },
  { name: 'Omez 20mg', composition: 'Omeprazole IP 20mg', manufacturer: 'Dr. Reddy\'s', mrp: 40, hsnCode: '3004', drugSchedule: 'OTC', category: 'Gastrointestinal', unit: 'strip' },
  { name: 'Pantoprazole 40mg', composition: 'Pantoprazole Sodium IP 40mg', manufacturer: 'Various', mrp: 55, hsnCode: '3004', drugSchedule: 'OTC', category: 'Gastrointestinal', unit: 'strip' },
  { name: 'Pan 40mg', composition: 'Pantoprazole Sodium IP 40mg', manufacturer: 'Alkem', mrp: 75, hsnCode: '3004', drugSchedule: 'OTC', category: 'Gastrointestinal', unit: 'strip' },
  { name: 'Rabeprazole 20mg', composition: 'Rabeprazole Sodium IP 20mg', manufacturer: 'Various', mrp: 60, hsnCode: '3004', drugSchedule: 'OTC', category: 'Gastrointestinal', unit: 'strip' },
  { name: 'Rabepraz 20mg', composition: 'Rabeprazole Sodium IP 20mg', manufacturer: 'Lupin', mrp: 80, hsnCode: '3004', drugSchedule: 'OTC', category: 'Gastrointestinal', unit: 'strip' },
  { name: 'Metformin 500mg', composition: 'Metformin Hydrochloride IP 500mg', manufacturer: 'Various', mrp: 30, hsnCode: '3004', drugSchedule: 'SCHEDULE_J', category: 'Diabetes', unit: 'strip' },
  { name: 'Glycomet 500mg', composition: 'Metformin Hydrochloride IP 500mg', manufacturer: 'USV', mrp: 45, hsnCode: '3004', drugSchedule: 'SCHEDULE_J', category: 'Diabetes', unit: 'strip' },
  { name: 'Gluconorm 500mg', composition: 'Metformin Hydrochloride IP 500mg', manufacturer: 'Lupin', mrp: 50, hsnCode: '3004', drugSchedule: 'SCHEDULE_J', category: 'Diabetes', unit: 'strip' },
  { name: 'Glimepiride 1mg', composition: 'Glimepiride IP 1mg', manufacturer: 'Various', mrp: 35, hsnCode: '3004', drugSchedule: 'SCHEDULE_J', category: 'Diabetes', unit: 'strip' },
  { name: 'Glivec 1mg', composition: 'Glimepiride IP 1mg', manufacturer: 'Cipla', mrp: 55, hsnCode: '3004', drugSchedule: 'SCHEDULE_J', category: 'Diabetes', unit: 'strip' },
  { name: 'Glipizide 5mg', composition: 'Glipizide IP 5mg', manufacturer: 'Various', mrp: 30, hsnCode: '3004', drugSchedule: 'SCHEDULE_J', category: 'Diabetes', unit: 'strip' },
  { name: 'Telmisartan 40mg', composition: 'Telmisartan IP 40mg', manufacturer: 'Various', mrp: 50, hsnCode: '3004', drugSchedule: 'OTC', category: 'Cardiovascular', unit: 'strip' },
  { name: 'Telma 40mg', composition: 'Telmisartan IP 40mg', manufacturer: 'Glenmark', mrp: 70, hsnCode: '3004', drugSchedule: 'OTC', category: 'Cardiovascular', unit: 'strip' },
  { name: 'Losartan 50mg', composition: 'Losartan Potassium IP 50mg', manufacturer: 'Various', mrp: 40, hsnCode: '3004', drugSchedule: 'OTC', category: 'Cardiovascular', unit: 'strip' },
  { name: 'Losar 50mg', composition: 'Losartan Potassium IP 50mg', manufacturer: 'Lupin', mrp: 55, hsnCode: '3004', drugSchedule: 'OTC', category: 'Cardiovascular', unit: 'strip' },
  { name: 'Amlodipine 5mg', composition: 'Amlodipine Besylate IP 5mg', manufacturer: 'Various', mrp: 25, hsnCode: '3004', drugSchedule: 'OTC', category: 'Cardiovascular', unit: 'strip' },
  { name: 'Amlodipine 10mg', composition: 'Amlodipine Besylate IP 10mg', manufacturer: 'Various', mrp: 35, hsnCode: '3004', drugSchedule: 'OTC', category: 'Cardiovascular', unit: 'strip' },
  { name: 'Amlong 5mg', composition: 'Amlodipine Besylate IP 5mg', manufacturer: 'Micro Labs', mrp: 40, hsnCode: '3004', drugSchedule: 'OTC', category: 'Cardiovascular', unit: 'strip' },
  { name: 'Atorvastatin 10mg', composition: 'Atorvastatin Calcium IP 10mg', manufacturer: 'Various', mrp: 60, hsnCode: '3004', drugSchedule: 'OTC', category: 'Cardiovascular', unit: 'strip' },
  { name: 'Atorvastatin 20mg', composition: 'Atorvastatin Calcium IP 20mg', manufacturer: 'Various', mrp: 90, hsnCode: '3004', drugSchedule: 'OTC', category: 'Cardiovascular', unit: 'strip' },
  { name: 'Rosuvastatin 10mg', composition: 'Rosuvastatin Calcium IP 10mg', manufacturer: 'Various', mrp: 80, hsnCode: '3004', drugSchedule: 'OTC', category: 'Cardiovascular', unit: 'strip' },
  { name: 'Rosuvastatin 20mg', composition: 'Rosuvastatin Calcium IP 20mg', manufacturer: 'Various', mrp: 120, hsnCode: '3004', drugSchedule: 'OTC', category: 'Cardiovascular', unit: 'strip' },
  { name: 'Corex', composition: 'Codeine Phosphate 10mg + Chlorpheniramine 4mg', manufacturer: 'Pfizer', mrp: 55, hsnCode: '3004', drugSchedule: 'SCHEDULE_H1', category: 'Cough Syrup', unit: 'bottle' },
  { name: 'Ascoril LS', composition: 'Ambroxol 30mg + Levosalbutamol 1mg + Guaifenesin 50mg', manufacturer: 'Glenmark', mrp: 125, hsnCode: '3004', drugSchedule: 'OTC', category: 'Cough Syrup', unit: 'bottle' },
  { name: 'Ascoril Plus', composition: 'Phenylephrine 5mg + Chlorpheniramine 2mg + Dextromethorphan 10mg', manufacturer: 'Glenmark', mrp: 145, hsnCode: '3004', drugSchedule: 'OTC', category: 'Cough Syrup', unit: 'bottle' },
  { name: 'Benadryl', composition: 'Diphenhydramine 14mg + Ammonium Chloride 138mg + Sodium Citrate 57mg', manufacturer: 'Johnson & Johnson', mrp: 55, hsnCode: '3004', drugSchedule: 'OTC', category: 'Cough Syrup', unit: 'bottle' },
  { name: 'Cheston Plus', composition: 'Phenylephrine 5mg + Chlorpheniramine 2mg + Paracetamol 500mg', manufacturer: 'Cipla', mrp: 65, hsnCode: '3004', drugSchedule: 'OTC', category: 'Cough Syrup', unit: 'bottle' },
  { name: 'Tryptomer 10mg', composition: 'Amitriptyline Hydrochloride IP 10mg', manufacturer: 'Sun Pharma', mrp: 45, hsnCode: '3004', drugSchedule: 'SCHEDULE_H', category: 'General Medicines', unit: 'strip' },
  { name: 'Nexpro 20mg', composition: 'Esomeprazole Magnesium IP 20mg', manufacturer: 'Sun Pharma', mrp: 75, hsnCode: '3004', drugSchedule: 'OTC', category: 'Gastrointestinal', unit: 'strip' },
  { name: 'Montecate LC', composition: 'Montelukast 10mg + Levocetirizine 5mg', manufacturer: 'Macleods', mrp: 95, hsnCode: '3004', drugSchedule: 'OTC', category: 'Antihistamines', unit: 'strip' },
  { name: 'Zenflox 500mg', composition: 'Ofloxacin IP 500mg', manufacturer: 'FDC', mrp: 55, hsnCode: '3004', drugSchedule: 'SCHEDULE_H', category: 'Antibiotics', unit: 'strip' },
  { name: 'Oflox 500mg', composition: 'Ofloxacin IP 500mg', manufacturer: 'Cipla', mrp: 60, hsnCode: '3004', drugSchedule: 'SCHEDULE_H', category: 'Antibiotics', unit: 'strip' },
  { name: 'Augmentin 625mg', composition: 'Amoxicillin 500mg + Clavulanic Acid 125mg', manufacturer: 'GSK', mrp: 295, hsnCode: '3004', drugSchedule: 'SCHEDULE_H', category: 'Antibiotics', unit: 'strip' },
  { name: 'Moxikind CV 625mg', composition: 'Amoxicillin 500mg + Clavulanic Acid 125mg', manufacturer: 'Macleods', mrp: 180, hsnCode: '3004', drugSchedule: 'SCHEDULE_H', category: 'Antibiotics', unit: 'strip' },
]

// GET /api/medicines/lookup - Search medicines
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')?.toLowerCase() || ''
    const limit = parseInt(searchParams.get('limit') || '20')

    if (search.length < 2) {
      return NextResponse.json({ medicines: [] })
    }

    // Search in local database
    const localResults = MEDICINE_DATABASE
      .filter(med => 
        med.name.toLowerCase().includes(search) ||
        med.composition.toLowerCase().includes(search) ||
        med.category.toLowerCase().includes(search)
      )
      .slice(0, limit)
      .map(med => ({
        ...med,
        requiresPrescription: ['SCHEDULE_H', 'SCHEDULE_H1', 'SCHEDULE_X'].includes(med.drugSchedule),
        source: 'medicine-database'
      }))

    // Also search in user's products
    const user = await getUserFromRequest(req)
    let productResults: any[] = []
    
    if (user?.tenantId) {
      const products = await prisma.product.findMany({
        where: {
          tenantId: user.tenantId,
          isActive: true,
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { composition: { contains: search, mode: 'insensitive' } },
            { barcode: { contains: search } }
          ]
        },
        take: limit,
        select: {
          id: true,
          name: true,
          composition: true,
          manufacturer: true,
          maxRetailPrice: true,
          hsnCode: true,
          drugSchedule: true,
          category: true,
          unit: true,
          sellingPrice: true,
          requiresPrescription: true
        }
      })

      productResults = products.map(p => ({
        id: p.id,
        name: p.name,
        composition: p.composition,
        manufacturer: p.manufacturer,
        mrp: p.maxRetailPrice ? Number(p.maxRetailPrice) : Number(p.sellingPrice),
        hsnCode: p.hsnCode,
        drugSchedule: p.drugSchedule,
        category: p.category,
        unit: p.unit,
        requiresPrescription: p.requiresPrescription,
        source: 'local'
      }))
    }

    // Combine results, prioritizing local products
    const combinedResults = [...productResults, ...localResults]
      .slice(0, limit)

    return NextResponse.json({ medicines: combinedResults })
  } catch (error) {
    console.error('Medicine lookup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
