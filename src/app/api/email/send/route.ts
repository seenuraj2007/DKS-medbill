import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, getCurrentTenantId } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { 
  sendEmail, 
  generateLowStockAlertEmail,
  generateOutOfStockAlertEmail,
  generatePurchaseOrderUpdateEmail,
  generateDailySummaryEmail,
  isEmailEnabled
} from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request as any)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = await getCurrentTenantId(request as any)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, data, to } = body

    if (!type || !to) {
      return NextResponse.json(
        { error: 'Type and recipient email are required' },
        { status: 400 }
      )
    }

    // Get tenant name
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    })

    const businessName = tenant?.name || 'Your Business'

    let emailContent
    switch (type) {
      case 'low-stock':
        emailContent = generateLowStockAlertEmail(
          data.productName,
          data.currentStock,
          data.reorderPoint,
          businessName
        )
        break
      case 'out-of-stock':
        emailContent = generateOutOfStockAlertEmail(data.productName, businessName)
        break
      case 'purchase-order':
        emailContent = generatePurchaseOrderUpdateEmail(
          data.orderNumber,
          data.supplierName,
          data.status,
          data.estimatedDelivery
        )
        break
      case 'daily-summary':
        emailContent = generateDailySummaryEmail(
          businessName,
          data.totalProducts,
          data.stockValue,
          data.lowStockCount,
          data.outOfStockCount
        )
        break
      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        )
    }

    // Check if email is enabled
    if (!isEmailEnabled()) {
      console.log('[EMAIL DISABLED] Would have sent email:', {
        type,
        to,
        subject: emailContent.subject,
      })
      
      return NextResponse.json({
        success: true,
        message: 'Email service is currently disabled. Email logged to console only.',
        disabled: true,
      })
    }

    // Send email
    const success = await sendEmail({
      to,
      subject: emailContent.subject,
      html: emailContent.html,
    })

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Email sent successfully',
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request as any)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if email service is configured and enabled
    const isConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
    const emailEnabled = isEmailEnabled()

    return NextResponse.json({
      configured: isConfigured,
      enabled: emailEnabled,
      host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
      from: process.env.SMTP_FROM || 'noreply@dksstockalert.com',
    })
  } catch (error) {
    console.error('Email config check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
