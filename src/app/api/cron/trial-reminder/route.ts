import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { sendEmail, generateTrialEndingEmail } from '@/lib/email'
import { addDays, isBefore } from 'date-fns'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || 'your-cron-secret-here'
  
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const results = {
      checked: 0,
      remindersSent: 0,
      errors: [] as string[]
    }

    const trialSubscriptions = db.prepare(`
      SELECT s.id, s.organization_id, s.trial_end_date, o.name as org_name, u.email as owner_email, u.full_name as owner_name
      FROM subscriptions s
      JOIN organizations o ON s.organization_id = o.id
      JOIN users u ON o.owner_id = u.id
      WHERE s.status = 'trial' AND s.trial_end_date IS NOT NULL
    `).all() as any[]

    results.checked = trialSubscriptions.length

    for (const sub of trialSubscriptions) {
      try {
        const trialEnd = new Date(sub.trial_end_date)
        const now = new Date()
        
        const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysRemaining <= 7 && daysRemaining > 0) {
          const upgradeUrl = `${process.env.APP_URL || 'http://localhost:3000'}/subscription`
          
          const success = await sendEmail({
            to: sub.owner_email,
            ...generateTrialEndingEmail(daysRemaining, upgradeUrl)
          })

          if (success) {
            results.remindersSent++
            console.log(`Trial reminder sent to ${sub.owner_email} (${daysRemaining} days left)`)
          }
        }
        
        if (isBefore(trialEnd, now)) {
          db.prepare(`
            UPDATE subscriptions
            SET status = 'expired', updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(sub.id)
          
          console.log(`Trial expired for organization ${sub.organization_id}`)
        }
      } catch (err: any) {
        results.errors.push(`Error processing subscription ${sub.id}: ${err.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      ...results
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
