import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get public receipt by invoice ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get invoice with minimal info (privacy)
    const invoice = await prisma.invoice.findFirst({
      where: { 
        id,
        // Check if invoice is not older than 1 year
        createdAt: {
          gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        items: {
          select: {
            description: true,
            quantity: true,
            unitPrice: true,
            totalAmount: true
          }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Receipt not found or expired' },
        { status: 404 }
      )
    }

    // Track the scan
    const ipAddress = req.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'
    const referrer = req.headers.get('referer') || null

    try {
      // Use any to bypass type checking until migration
      await (prisma as any).receiptScan.create({
        data: {
          invoiceId: invoice.id,
          tenantId: invoice.tenantId,
          ipAddress: ipAddress.split(',')[0].trim(), // Get first IP if multiple
          userAgent: userAgent.substring(0, 500), // Limit length
          referrer: referrer?.substring(0, 500) || null
        }
      })
    } catch (scanError) {
      // Don't fail if tracking fails
      console.error('Failed to track receipt scan:', scanError)
    }

    // Extract payment method from notes (format: "Payment: method" or "notes | Payment: method")
    const paymentMethod = invoice.notes?.includes('Payment:') 
      ? invoice.notes.split('Payment:')[1]?.trim() 
      : null

    // Return minimal receipt data (privacy-focused)
    const receiptData = {
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      items: invoice.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalAmount: Number(item.totalAmount)
      })),
      subtotal: Number(invoice.subtotal),
      totalAmount: Number(invoice.totalAmount),
      paymentMethod: paymentMethod,
      expiresAt: new Date(invoice.createdAt.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString()
    }

    return NextResponse.json({ receipt: receiptData })
  } catch (error) {
    console.error('Get receipt error:', error)
    return NextResponse.json(
      { error: 'Failed to load receipt' },
      { status: 500 }
    )
  }
}

// GET - Get scan statistics (for admin)
export async function GET_STATS(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const invoiceId = searchParams.get('invoiceId')
    
    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 })
    }

    // Use any to bypass type checking until migration
    const scanCount = await (prisma as any).receiptScan.count({
      where: { invoiceId }
    })

    return NextResponse.json({ scanCount })
  } catch (error) {
    console.error('Get scan stats error:', error)
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 })
  }
}
