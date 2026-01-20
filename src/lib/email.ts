import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
})

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"StockAlert" <noreply@stockalert.com>',
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
    subject: 'Reset your StockAlert password',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4F46E5; margin: 0;">StockAlert</h1>
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
          <p>StockAlert - Inventory Management System</p>
          <p>© ${new Date().getFullYear()} StockAlert. All rights reserved.</p>
        </div>
      </div>
    `,
  }
}

export function generateTrialEndingEmail(daysRemaining: number, upgradeUrl: string) {
  return {
    subject: `Your StockAlert trial ends in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4F46E5; margin: 0;">StockAlert</h1>
          <p style="color: #6B7280; margin-top: 8px;">Inventory Management System</p>
        </div>
        
        <div style="background: linear-gradient(to right, #4F46E5, #7C3AED); border-radius: 12px; padding: 30px; margin-bottom: 30px; color: white;">
          <h2 style="margin: 0 0 16px 0;">Trial Ending Soon!</h2>
          <p style="margin: 0; opacity: 0.9;">
            Your 30-day free trial ends in <strong>${daysRemaining} day${daysRemaining > 1 ? 's' : ''}</strong>.
            Upgrade now to continue accessing all features.
          </p>
        </div>
        
        <div style="background: #F9FAFB; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
          <h3 style="color: #111827; margin: 0 0 12px 0;">Don't lose access to:</h3>
          <ul style="color: #4B5563; margin: 0; padding-left: 20px; line-height: 1.8;">
            <li>Your product inventory and stock data</li>
            <li>Team collaboration features</li>
            <li>Purchase orders and transfers</li>
            <li>Alerts and reporting</li>
          </ul>
          
          <a href="${upgradeUrl}" style="display: inline-block; background: linear-gradient(to right, #4F46E5, #7C3AED); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; margin-top: 20px;">
            Upgrade Now
          </a>
        </div>
        
        <div style="text-align: center; color: #9CA3AF; font-size: 12px;">
          <p>StockAlert - Inventory Management System</p>
          <p>© ${new Date().getFullYear()} StockAlert. All rights reserved.</p>
        </div>
      </div>
    `,
  }
}

export function generateWelcomeEmail(userName: string, dashboardUrl: string) {
  return {
    subject: 'Welcome to StockAlert!',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4F46E5; margin: 0;">StockAlert</h1>
          <p style="color: #6B7280; margin-top: 8px;">Inventory Management System</p>
        </div>
        
        <div style="background: #F9FAFB; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
          <h2 style="color: #111827; margin: 0 0 16px 0;">Welcome, ${userName}!</h2>
          <p style="color: #4B5563; line-height: 1.6; margin: 0 0 20px 0;">
            Thank you for joining StockAlert. You're now ready to start managing your inventory efficiently.
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
          <p>StockAlert - Inventory Management System</p>
          <p>© ${new Date().getFullYear()} StockAlert. All rights reserved.</p>
        </div>
      </div>
    `,
  }
}

export function generateSubscriptionChangedEmail(
  oldPlan: string,
  newPlan: string,
  isUpgrade: boolean
) {
  const title = isUpgrade ? 'Plan Upgraded!' : 'Plan Changed'
  const color = isUpgrade ? '#22C55E' : '#4F46E5'
  
  return {
    subject: `StockAlert - ${title}: ${oldPlan} → ${newPlan}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4F46E5; margin: 0;">StockAlert</h1>
          <p style="color: #6B7280; margin-top: 8px;">Inventory Management System</p>
        </div>
        
        <div style="background: ${color}15; border-radius: 12px; padding: 30px; margin-bottom: 30px; border-left: 4px solid ${color};">
          <h2 style="color: #111827; margin: 0 0 16px 0;">${title}</h2>
          <p style="color: #4B5563; line-height: 1.6; margin: 0;">
            Your subscription has been changed from <strong>${oldPlan}</strong> to <strong>${newPlan}</strong>.
          </p>
        </div>
        
        <div style="background: #F9FAFB; border-radius: 12px; padding: 20px;">
          <p style="color: #4B5563; margin: 0;">
            ${isUpgrade 
              ? 'You now have access to all the features of the new plan. Enjoy!' 
              : 'Your new plan limits are now in effect. If you have any questions, please contact support.'}
          </p>
        </div>
        
        <div style="text-align: center; color: #9CA3AF; font-size: 12px; margin-top: 30px;">
          <p>StockAlert - Inventory Management System</p>
          <p>© ${new Date().getFullYear()} StockAlert. All rights reserved.</p>
        </div>
      </div>
    `,
  }
}
