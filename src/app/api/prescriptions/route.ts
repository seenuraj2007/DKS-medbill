import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/prescriptions - List all prescriptions
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const patientId = searchParams.get('patientId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')

    const where: any = {
      tenantId: user.tenantId
    }

    if (patientId) {
      where.patientId = patientId
    }

    if (status) {
      where.status = status
    }

    const [prescriptions, total] = await Promise.all([
      prisma.prescription.findMany({
        where,
        include: {
          patient: {
            select: { id: true, name: true, phone: true }
          },
          prescriptionItems: true
        },
        orderBy: { prescriptionDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.prescription.count({ where })
    ])

    return NextResponse.json({ 
      prescriptions, 
      pagination: { 
        page, 
        limit, 
        total, 
        totalPages: Math.ceil(total / limit) 
      } 
    })
  } catch (error) {
    console.error('Get prescriptions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/prescriptions - Create new prescription
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      patient_id,
      doctor_name,
      doctor_phone,
      doctor_reg_number,
      clinic_name,
      clinic_address,
      prescription_date,
      expiry_date,
      notes,
      items
    } = body

    if (!patient_id || !doctor_name) {
      return NextResponse.json({ 
        error: 'Patient and doctor name are required' 
      }, { status: 400 })
    }

    const prescription = await prisma.prescription.create({
      data: {
        tenantId: user.tenantId,
        patientId: patient_id,
        doctorName: doctor_name,
        doctorPhone: doctor_phone || null,
        doctorRegNumber: doctor_reg_number || null,
        clinicName: clinic_name || null,
        clinicAddress: clinic_address || null,
        prescriptionDate: prescription_date ? new Date(prescription_date) : new Date(),
        expiryDate: expiry_date ? new Date(expiry_date) : null,
        notes: notes || null,
        status: 'ACTIVE',
        prescriptionItems: {
          create: items?.map((item: any) => ({
            medicineName: item.medicine_name,
            dosage: item.dosage || null,
            frequency: item.frequency || null,
            duration: item.duration || null,
            quantity: item.quantity || 0,
            productId: item.product_id || null
          })) || []
        }
      },
      include: {
        patient: true,
        prescriptionItems: true
      }
    })

    return NextResponse.json({ prescription }, { status: 201 })
  } catch (error) {
    console.error('Create prescription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
