// Email service - can be disabled by setting DISABLE_EMAIL=true in .env
// When disabled, emails are logged to console but not sent

const EMAIL_ENABLED = process.env.DISABLE_EMAIL !== 'true'

import nodemailer from 'nodemailer'

const transporter = EMAIL_ENABLED ? nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
}) : null

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export function isEmailEnabled(): boolean {
  return EMAIL_ENABLED
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!EMAIL_ENABLED) {
    console.log('[EMAIL DISABLED] Would have sent:', {
      to: options.to,
      subject: options.subject,
    })
    return true // Return true so app continues working
  }

  try {
    if (!transporter) {
      console.log('[EMAIL] No transporter available')
      return false
    }
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"DKS StockAlert" <noreply@dksstockalert.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    })
    return true
  } catch (error) {
    console.error('Email sending failed:', error)
    return false
  }
}

export function generatePasswordResetEmail(resetUrl: string, expiresIn: string) {
  return {
    subject: 'Reset your DKS StockAlert password',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4F46E5; margin: 0;">DKS StockAlert</h1>
          <p style="color: #6B7280; margin-top: 8px;">Inventory Management System</p>
        </div>
        
        <div style="background: #F9FAFB; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
          <h2 style="color: #111827; margin: 0 0 16px 0;">Password Reset Request</h2>
          <p style="color: #4B5563; line-height: 1.6; margin: 0 0 20px 0;">
            We received a request to reset your password. Click the button below to create a new password.
          </p>
          
          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(to right, #4F46E5, #7C3AED); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;">
            Reset Password
          </a>
          
          <p style="color: #6B7280; font-size: 14px; margin-top: 20px;">
            This link expires in ${expiresIn}. If you didn't request this, please ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; color: #9CA3AF; font-size: 12px;">
          <p>DKS StockAlert - Inventory Management System</p>
          <p>© ${new Date().getFullYear()} DKS StockAlert. All rights reserved.</p>
        </div>
      </div>
    `,
  }
}

export function generateWelcomeEmail(userName: string, dashboardUrl: string) {
  return {
    subject: 'Welcome to DKS StockAlert!',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4F46E5; margin: 0;">DKS StockAlert</h1>
          <p style="color: #6B7280; margin-top: 8px;">Inventory Management System</p>
        </div>
        
        <div style="background: #F9FAFB; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
          <h2 style="color: #111827; margin: 0 0 16px 0;">Welcome, ${userName}!</h2>
          <p style="color: #4B5563; line-height: 1.6; margin: 0 0 20px 0;">
            Thank you for joining DKS StockAlert. You're now ready to start managing your inventory efficiently.
          </p>
          
          <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(to right, #4F46E5, #7C3AED); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;">
            Go to Dashboard
          </a>
        </div>
        
        <div style="background: #F0FDF4; border-radius: 12px; padding: 20px; margin-bottom: 30px; border-left: 4px solid #22C55E;">
          <h3 style="color: #166534; margin: 0 0 8px 0;">💡 Quick Tips</h3>
          <ul style="color: #15803D; margin: 0; padding-left: 20px; line-height: 1.8;">
            <li>Add your products and set reorder points</li>
            <li>Create locations for multi-warehouse tracking</li>
            <li>Invite team members to collaborate</li>
            <li>Set up alerts for low stock notifications</li>
          </ul>
        </div>
        
        <div style="text-align: center; color: #9CA3AF; font-size: 12px;">
          <p>DKS StockAlert - Inventory Management System</p>
          <p>© ${new Date().getFullYear()} DKS StockAlert. All rights reserved.</p>
        </div>
      </div>
    `,
  }
}

export function generateLowStockAlertEmail(
  productName: string,
  currentStock: number,
  reorderPoint: number,
  businessName: string
) {
  return {
    subject: `🚨 Low Stock Alert: ${productName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4F46E5; margin: 0;">DKS StockAlert</h1>
          <p style="color: #6B7280; margin-top: 8px;">${businessName}</p>
        </div>
        
        <div style="background: linear-gradient(to right, #F97316, #EF4444); border-radius: 12px; padding: 30px; margin-bottom: 30px; color: white;">
          <h2 style="margin: 0 0 16px 0;">⚠️ Low Stock Alert</h2>
          <p style="margin: 0; opacity: 0.9;">
            Product ${productName} is running low!
          </p>
        </div>
        
        <div style="background: #F9FAFB; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
          <h3 style="color: #111827; margin: 0 0 16px 0;">Stock Details</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
            <div>
              <p style="color: #6B7280; font-size: 14px; margin: 0 0 4px 0;">Product</p>
              <p style="color: #111827; font-weight: 600; margin: 0;">${productName}</p>
            </div>
            <div>
              <p style="color: #6B7280; font-size: 14px; margin: 0 0 4px 0;">Current Stock</p>
              <p style="color: #EF4444; font-weight: 600; margin: 0;">${currentStock} units</p>
            </div>
            <div>
              <p style="color: #6B7280; font-size: 14px; margin: 0 0 4px 0;">Reorder Point</p>
              <p style="color: #111827; font-weight: 600; margin: 0;">${reorderPoint} units</p>
            </div>
            <div>
              <p style="color: #6B7280; font-size: 14px; margin: 0 0 4px 0;">Status</p>
              <p style="color: #F97316; font-weight: 600; margin: 0;">Low Stock</p>
            </div>
          </div>
          
          <p style="color: #4B5563; margin-top: 20px;">
            Please restock ${productName} soon to avoid running out.
          </p>
        </div>
        
        <div style="text-align: center; color: #9CA3AF; font-size: 12px;">
          <p>DKS StockAlert - Inventory Management System</p>
          <p>© ${new Date().getFullYear()} DKS StockAlert. All rights reserved.</p>
        </div>
      </div>
    `,
  }
}

export function generateOutOfStockAlertEmail(
  productName: string,
  businessName: string
) {
  return {
    subject: `🔴 OUT OF STOCK: ${productName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4F46E5; margin: 0;">DKS StockAlert</h1>
          <p style="color: #6B7280; margin-top: 8px;">${businessName}</p>
        </div>
        
        <div style="background: linear-gradient(to right, #DC2626, #991B1B); border-radius: 12px; padding: 30px; margin-bottom: 30px; color: white;">
          <h2 style="margin: 0 0 16px 0;">🔴 OUT OF STOCK</h2>
          <p style="margin: 0; opacity: 0.9;">
            ${productName} is completely out of stock!
          </p>
        </div>
        
        <div style="background: #F9FAFB; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
          <h3 style="color: #111827; margin: 0 0 16px 0;">Stock Details</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div>
              <p style="color: #6B7280; font-size: 14px; margin: 0 0 4px 0;">Product</p>
              <p style="color: #111827; font-weight: 600; margin: 0;">${productName}</p>
            </div>
            <div>
              <p style="color: #6B7280; font-size: 14px; margin: 0 0 4px 0;">Current Stock</p>
              <p style="color: #DC2626; font-weight: 600; margin: 0;">0 units</p>
            </div>
          </div>
          
          <p style="color: #4B5563; margin-top: 20px;">
            This product cannot be sold until restocked. Please restock immediately!
          </p>
        </div>
        
        <div style="text-align: center; color: #9CA3AF; font-size: 12px;">
          <p>DKS StockAlert - Inventory Management System</p>
          <p>© ${new Date().getFullYear()} DKS StockAlert. All rights reserved.</p>
        </div>
      </div>
    `,
  }
}

export function generatePurchaseOrderUpdateEmail(
  orderNumber: string,
  supplierName: string,
  status: string,
  estimatedDelivery?: string
) {
  const statusColors: Record<string, string> = {
    pending: '#F59E0B',
    approved: '#3B82F6',
    shipped: '#8B5CF6',
    delivered: '#10B981',
  }
  
  const color = statusColors[status] || '#6B7280'
  
  return {
    subject: `📦 Purchase Order ${orderNumber}: ${status}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4F46E5; margin: 0;">DKS StockAlert</h1>
          <p style="color: #6B7280; margin-top: 8px;">Inventory Management System</p>
        </div>
        
        <div style="background: ${color}15; border-radius: 12px; padding: 30px; margin-bottom: 30px; border-left: 4px solid ${color};">
          <h2 style="color: #111827; margin: 0 0 16px 0;">Purchase Order Updated</h2>
          <p style="color: #4B5563; margin: 0;">
            Order#${orderNumber} status has changed to: <strong style="color: ${color};">${status.toUpperCase()}</strong>
          </p>
        </div>
        
        <div style="background: #F9FAFB; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
          <h3 style="color: #111827; margin: 0 0 16px 0;">Order Details</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
            <div>
              <p style="color: #6B7280; font-size: 14px; margin: 0 0 4px 0;">Order Number</p>
              <p style="color: #111827; font-weight: 600; margin: 0;">${orderNumber}</p>
            </div>
            <div>
              <p style="color: #6B7280; font-size: 14px; margin: 0 0 4px 0;">Supplier</p>
              <p style="color: #111827; font-weight: 600; margin: 0;">${supplierName}</p>
            </div>
            <div>
              <p style="color: #6B7280; font-size: 14px; margin: 0 0 4px 0;">Status</p>
              <p style="color: ${color}; font-weight: 600; margin: 0; text-transform: uppercase;">${status}</p>
            </div>
            ${estimatedDelivery ? `
            <div>
              <p style="color: #6B7280; font-size: 14px; margin: 0 0 4px 0;">Estimated Delivery</p>
              <p style="color: #111827; font-weight: 600; margin: 0;">${estimatedDelivery}</p>
            </div>
            ` : ''}
          </div>
        </div>
        
        <div style="text-align: center; color: #9CA3AF; font-size: 12px;">
          <p>DKS StockAlert - Inventory Management System</p>
          <p>© ${new Date().getFullYear()} DKS StockAlert. All rights reserved.</p>
        </div>
      </div>
    `,
  }
}

export function generateDailySummaryEmail(
  businessName: string,
  totalProducts: number,
  stockValue: number,
  lowStockCount: number,
  outOfStockCount: number
) {
  return {
    subject: `📊 Daily Inventory Summary - ${new Date().toLocaleDateString()}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4F46E5; margin: 0;">DKS StockAlert</h1>
          <p style="color: #6B7280; margin-top: 8px;">${businessName}</p>
        </div>
        
        <div style="background: linear-gradient(to right, #4F46E5, #7C3AED); border-radius: 12px; padding: 30px; margin-bottom: 30px; color: white;">
          <h2 style="margin: 0 0 16px 0;">📊 Daily Inventory Summary</h2>
          <p style="margin: 0; opacity: 0.9;">
            Your inventory overview as of ${new Date().toLocaleDateString()}
          </p>
        </div>
        
        <div style="background: #F9FAFB; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
          <h3 style="color: #111827; margin: 0 0 20px 0;">Overview</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div>
              <p style="color: #6B7280; font-size: 14px; margin: 0 0 4px 0;">Total Products</p>
              <p style="color: #111827; font-weight: 600; font-size: 24px; margin: 0;">${totalProducts}</p>
            </div>
            <div>
              <p style="color: #6B7280; font-size: 14px; margin: 0 0 4px 0;">Stock Value</p>
              <p style="color: #10B981; font-weight: 600; font-size: 24px; margin: 0;">₹${stockValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div style="background: ${lowStockCount > 0 || outOfStockCount > 0 ? '#FEF2F2' : '#F0FDF4'}; border-radius: 12px; padding: 20px; margin-bottom: 30px; border-left: 4px solid ${lowStockCount > 0 || outOfStockCount > 0 ? '#EF4444' : '#22C55E'};">
          <h3 style="color: #111827; margin: 0 0 12px 0;">📋 Alerts</h3>
          ${lowStockCount > 0 ? `
          <p style="color: #DC2626; margin: 0 0 4px 0;">
            • ${lowStockCount} ${lowStockCount === 1 ? 'product' : 'products'} low on stock
          </p>
          ` : ''}
          ${outOfStockCount > 0 ? `
          <p style="color: #DC2626; margin: 0 0 4px 0;">
            • ${outOfStockCount} ${outOfStockCount === 1 ? 'product' : 'products'} out of stock
          </p>
          ` : ''}
          ${lowStockCount === 0 && outOfStockCount === 0 ? `
          <p style="color: #166534; margin: 0;">✅ All products are in stock!</p>
          ` : ''}
        </div>
        
        <div style="text-align: center; color: #9CA3AF; font-size: 12px;">
          <p>DKS StockAlert - Inventory Management System</p>
          <p>© ${new Date().getFullYear()} DKS StockAlert. All rights reserved.</p>
        </div>
      </div>
    `,
  }
}

export function generateTrialEndingEmail(daysRemaining: number, upgradeUrl: string) {
  return {
    subject: `Your DKS StockAlert trial ends in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4F46E5; margin: 0;">DKS StockAlert</h1>
          <p style="color: #6B7280; margin-top: 8px;">Inventory Management System</p>
        </div>
        
        <div style="background: linear-gradient(to right, #4F46E5, #7C3AED); border-radius: 12px; padding: 30px; margin-bottom: 30px; color: white;">
          <h2 style="margin: 0 0 16px 0;">Trial Ending Soon!</h2>
          <p style="margin: 0; opacity: 0.9;">
            Your 30-day free trial ends in <strong>${daysRemaining} day${daysRemaining > 1 ? 's' : ''}</strong>.
            Upgrade now to continue accessing all features.
          </p>
        </div>
        
        <a href="${upgradeUrl}" style="display: inline-block; background: linear-gradient(to right, #4F46E5, #7C3AED); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;">
          Upgrade Now
        </a>
        
        <div style="text-align: center; color: #9CA3AF; font-size: 12px; margin-top: 30px;">
          <p>DKS StockAlert - Inventory Management System</p>
          <p>© ${new Date().getFullYear()} DKS StockAlert. All rights reserved.</p>
        </div>
      </div>
    `,
  }
}

