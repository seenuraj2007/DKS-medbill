import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get unique suppliers from products (since Product has supplierName, supplierEmail, supplierPhone fields)
    const products = await prisma.product.findMany({
      where: { tenantId: user.tenantId },
      select: {
        supplierName: true,
        supplierEmail: true,
        supplierPhone: true
      },
      distinct: ['supplierName']
    })

    const suppliers = products
      .filter((p: any) => p.supplierName)
      .map((p: any) => ({
        id: p.supplierName?.toLowerCase().replace(/\s+/g, '-'),
        name: p.supplierName,
        email: p.supplierEmail,
        phone: p.supplierPhone,
        total_products: 0 // Would need another query to count
      }))

    return NextResponse.json({ suppliers }, {
      headers: {
        'Cache-Control': 'private, max-age=10, stale-while-revalidate=60'
      }
    })
  } catch (error) {
    console.error('Get suppliers error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For now, just return success - suppliers are stored in Product records
    // A proper Supplier model would need to be added to the schema
    return NextResponse.json({ 
      message: 'Supplier management requires schema update. Suppliers are currently stored as fields on Products.',
      supplier: null
    }, { status: 501 })
  } catch (error) {
    console.error('Create supplier error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
