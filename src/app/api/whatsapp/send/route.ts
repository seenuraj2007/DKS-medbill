import { NextRequest, NextResponse } from 'next/server'
import { whatsAppService } from '@/lib/whatsapp'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request as any)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { to, message, type, language = 'en' } = body

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      )
    }

    // Initialize WhatsApp service with credentials from environment
    if (process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN) {
      whatsAppService.initialize({
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
        accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
        businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
      })
    }

    if (!whatsAppService.isConfigured()) {
      return NextResponse.json(
        { error: 'WhatsApp service not configured. Please set up WhatsApp Business API credentials.' },
        { status: 503 }
      )
    }

    let result
    switch (type) {
      case 'low-stock':
        result = language === 'hi'
          ? await whatsAppService.sendLowStockAlertHindi(to, message.productName, message.currentStock, message.reorderPoint)
          : await whatsAppService.sendLowStockAlert(to, message.productName, message.currentStock, message.reorderPoint)
        break
      case 'out-of-stock':
        result = language === 'hi'
          ? await whatsAppService.sendOutOfStockAlertHindi(to, message.productName)
          : await whatsAppService.sendOutOfStockAlert(to, message.productName)
        break
      case 'stock-received':
        result = await whatsAppService.sendStockReceivedAlert(to, message.productName, message.quantity, message.location)
        break
      case 'purchase-order':
        result = await whatsAppService.sendPurchaseOrderAlert(to, message.orderNumber, message.supplierName, message.totalAmount)
        break
      case 'welcome':
        result = await whatsAppService.sendWelcomeMessage(to, message.businessName)
        break
      case 'daily-summary':
        result = await whatsAppService.sendDailySummary(to, message)
        break
      default:
        result = await whatsAppService.sendMessage({ to, body: message })
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: 'WhatsApp message sent successfully',
      })
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to send message' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('WhatsApp API error:', error)
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

    // Check if WhatsApp is configured
    const isConfigured = !!(process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN)

    return NextResponse.json({
      configured: isConfigured,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || null,
    })
  } catch (error) {
    console.error('WhatsApp config check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
