import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendEmail, generateTrialEndingEmail } from '@/lib/email'
import { isBefore } from 'date-fns'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
    }
    // Allow development without CRON_SECRET
  }

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const results = {
      checked: 0,
      remindersSent: 0,
      errors: [] as string[]
    }

    const { data: trialSubscriptions, error } = await supabase
      .from('subscriptions')
      .select(`
        id,
        organization_id,
        trial_end_date,
        organizations (name),
        users (email, full_name)
      `)
      .eq('status', 'trial')
      .not('trial_end_date', 'is', null)

    if (error) {
      throw error
    }

    results.checked = trialSubscriptions?.length || 0

    for (const sub of trialSubscriptions || []) {
      try {
        const owner = sub.users as unknown as Array<{ email: string; full_name: string }>
        const trialEnd = new Date(sub.trial_end_date!)
        const now = new Date()
        
        const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysRemaining <= 7 && daysRemaining > 0) {
          const upgradeUrl = `${process.env.APP_URL || 'http://localhost:3000'}/subscription`
          
          await sendEmail({
            to: owner[0]?.email,
            ...generateTrialEndingEmail(daysRemaining, upgradeUrl)
          })

          results.remindersSent++
          console.log(`Trial reminder sent to ${owner[0]?.email} (${daysRemaining} days left)`)
        }
        
        if (isBefore(trialEnd, now)) {
          await supabase
            .from('subscriptions')
            .update({ status: 'expired' })
            .eq('id', sub.id)
          
          console.log(`Trial expired for organization ${sub.organization_id}`)
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        results.errors.push(`Error processing subscription ${sub.id}: ${message}`)
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
