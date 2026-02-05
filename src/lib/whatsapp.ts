import { logger } from './logger'

interface WhatsAppMessage {
  to: string
  body: string
  templateName?: string
  languageCode?: string
}

interface WhatsAppConfig {
  phoneNumberId: string
  accessToken: string
  businessAccountId?: string
}

class WhatsAppService {
  private config: WhatsAppConfig | null = null
  private apiUrl = 'https://graph.facebook.com/v18.0'

  initialize(config: WhatsAppConfig) {
    this.config = config
    logger.info('WhatsApp service initialized', { phoneNumberId: config.phoneNumberId })
  }

  isConfigured(): boolean {
    return this.config !== null && !!this.config.phoneNumberId && !!this.config.accessToken
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.config?.accessToken}`,
      'Content-Type': 'application/json',
    }
  }

  async sendMessage(message: WhatsAppMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured()) {
      logger.error('WhatsApp service not configured')
      return { success: false, error: 'WhatsApp service not configured' }
    }

    try {
      const formattedPhone = this.formatPhoneNumber(message.to)
      
      const payload = message.templateName
        ? this.buildTemplateMessage(formattedPhone, message)
        : this.buildTextMessage(formattedPhone, message)

      const response = await fetch(`${this.apiUrl}/${this.config!.phoneNumberId}/messages`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        logger.error('WhatsApp API error', { error: data, phone: formattedPhone })
        return { success: false, error: data.error?.message || 'Failed to send message' }
      }

      logger.info('WhatsApp message sent successfully', { 
        messageId: data.messages?.[0]?.id,
        phone: formattedPhone 
      })

      return { 
        success: true, 
        messageId: data.messages?.[0]?.id 
      }
    } catch (error) {
      logger.error('Failed to send WhatsApp message', { error, phone: message.to })
      return { success: false, error: 'Network error' }
    }
  }

  private formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '')
    
    // Ensure it starts with country code
    if (cleaned.startsWith('0')) {
      cleaned = '91' + cleaned.substring(1)
    } else if (!cleaned.startsWith('91')) {
      cleaned = '91' + cleaned
    }
    
    return cleaned
  }

  private buildTextMessage(to: string, message: WhatsAppMessage) {
    return {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'text',
      text: {
        preview_url: false,
        body: message.body,
      },
    }
  }

  private buildTemplateMessage(to: string, message: WhatsAppMessage) {
    return {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'template',
      template: {
        name: message.templateName,
        language: {
          code: message.languageCode || 'en',
        },
      },
    }
  }

  // Pre-built message templates for inventory alerts
  async sendLowStockAlert(phone: string, productName: string, currentStock: number, reorderPoint: number) {
    const message: WhatsAppMessage = {
      to: phone,
      body: `🚨 *Low Stock Alert*\n\n📦 Product: ${productName}\n📊 Current Stock: ${currentStock} units\n⚠️ Reorder Point: ${reorderPoint} units\n\nPlease restock soon to avoid stockouts!\n\n_DKS StockAlert_`,
    }
    return this.sendMessage(message)
  }

  async sendOutOfStockAlert(phone: string, productName: string) {
    const message: WhatsAppMessage = {
      to: phone,
      body: `⛔ *Out of Stock Alert*\n\n📦 Product: ${productName}\n📊 Current Stock: 0 units\n\n⚠️ This product is completely out of stock! Please restock immediately to avoid losing sales.\n\n_DKS StockAlert_`,
    }
    return this.sendMessage(message)
  }

  async sendStockReceivedAlert(phone: string, productName: string, quantity: number, location: string) {
    const message: WhatsAppMessage = {
      to: phone,
      body: `📥 *Stock Received*\n\n📦 Product: ${productName}\n📊 Quantity: +${quantity} units\n📍 Location: ${location}\n\nStock has been successfully updated!\n\n_DKS StockAlert_`,
    }
    return this.sendMessage(message)
  }

  async sendPurchaseOrderAlert(phone: string, orderNumber: string, supplierName: string, totalAmount: number) {
    const message: WhatsAppMessage = {
      to: phone,
      body: `📋 *Purchase Order Created*\n\n📝 Order #: ${orderNumber}\n🏪 Supplier: ${supplierName}\n💰 Total: ₹${totalAmount.toLocaleString('en-IN')}\n\nYour purchase order has been created successfully!\n\n_DKS StockAlert_`,
    }
    return this.sendMessage(message)
  }

  async sendDailySummary(phone: string, summary: {
    lowStockCount: number
    outOfStockCount: number
    totalProducts: number
    totalStockValue: number
  }) {
    const message: WhatsAppMessage = {
      to: phone,
      body: `📊 *Daily Inventory Summary*\n\n📦 Total Products: ${summary.totalProducts}\n💰 Stock Value: ₹${summary.totalStockValue.toLocaleString('en-IN')}\n\n⚠️ Alerts:\n• ${summary.lowStockCount} products low on stock\n• ${summary.outOfStockCount} products out of stock\n\nView details: https://dksstockalert.com/dashboard\n\n_DKS StockAlert_`,
    }
    return this.sendMessage(message)
  }

  async sendWelcomeMessage(phone: string, businessName: string) {
    const message: WhatsAppMessage = {
      to: phone,
      body: `🎉 *Welcome to DKS StockAlert!*\n\nNamaste ${businessName}! 👋\n\nYour inventory management is now supercharged with WhatsApp alerts. You'll receive:\n\n✅ Low stock alerts\n✅ Out of stock warnings\n✅ Purchase order updates\n✅ Daily summaries\n\n*It's 100% FREE forever!* 🚀\n\n_DKS StockAlert - Built for Indian Businesses_`,
    }
    return this.sendMessage(message)
  }

  // Hindi language variants
  async sendLowStockAlertHindi(phone: string, productName: string, currentStock: number, reorderPoint: number) {
    const message: WhatsAppMessage = {
      to: phone,
      body: `🚨 *स्टॉक कम होने की चेतावनी*\n\n📦 उत्पाद: ${productName}\n📊 वर्तमान स्टॉक: ${currentStock} यूनिट\n⚠️ रीऑर्डर बिंदु: ${reorderPoint} यूनिट\n\nकृपया जल्दी स्टॉक भरें!\n\n_DKS StockAlert_`,
    }
    return this.sendMessage(message)
  }

  async sendOutOfStockAlertHindi(phone: string, productName: string) {
    const message: WhatsAppMessage = {
      to: phone,
      body: `⛔ *स्टॉक खत्म हो गया*\n\n📦 उत्पाद: ${productName}\n📊 वर्तमान स्टॉक: 0 यूनिट\n\n⚠️ यह उत्पाद पूरी तरह से खत्म हो गया है! कृपया तुरंत स्टॉक भरें।\n\n_DKS StockAlert_`,
    }
    return this.sendMessage(message)
  }
}

export const whatsAppService = new WhatsAppService()
