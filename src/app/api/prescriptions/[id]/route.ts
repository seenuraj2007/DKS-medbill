import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/prescriptions/[id] - Get single prescription
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const prescription = await prisma.prescription.findFirst({
      where: {
        id,
        tenantId: user.tenantId
      },
      include: {
        patient: true,
        prescriptionItems: true,
        invoices: {
          select: { id: true, invoiceNumber: true, invoiceDate: true, totalAmount: true }
        }
      }
    })

    if (!prescription) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 })
    }

    return NextResponse.json({ prescription })
  } catch (error) {
    console.error('Get prescription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/prescriptions/[id] - Update prescription
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const {
      doctor_name,
      doctor_phone,
      doctor_reg_number,
      clinic_name,
      clinic_address,
      prescription_date,
      expiry_date,
      notes,
      status
    } = body

    const prescription = await prisma.prescription.updateMany({
      where: {
        id,
        tenantId: user.tenantId
      },
      data: {
        doctorName: doctor_name,
        doctorPhone: doctor_phone || null,
        doctorRegNumber: doctor_reg_number || null,
        clinicName: clinic_name || null,
        clinicAddress: clinic_address || null,
        prescriptionDate: prescription_date ? new Date(prescription_date) : undefined,
        expiryDate: expiry_date ? new Date(expiry_date) : null,
        notes: notes || null,
        status: status || undefined
      }
    })

    if (prescription.count === 0) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update prescription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/prescriptions/[id] - Delete prescription
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Delete prescription items first
    await prisma.prescriptionItem.deleteMany({
      where: { prescriptionId: id }
    })

    const prescription = await prisma.prescription.deleteMany({
      where: {
        id,
        tenantId: user.tenantId
      }
    })

    if (prescription.count === 0) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete prescription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
