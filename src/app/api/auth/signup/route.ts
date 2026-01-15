import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import bcrypt from 'bcryptjs'
import { addDays } from 'date-fns'

export async function POST(req: NextRequest) {
  try {
    const { email, password, full_name } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const orgName = full_name ? `${full_name}'s Organization` : 'My Organization'

    db.prepare('BEGIN TRANSACTION').run()

    const orgResult = db.prepare(
      'INSERT INTO organizations (name, owner_id) VALUES (?, ?)'
    ).run(orgName, 0)

    const orgId = orgResult.lastInsertRowid

    const userResult = db.prepare(
      'INSERT INTO users (email, password, full_name, organization_id, role, status) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(email, hashedPassword, full_name || null, orgId, 'owner', 'active')

    db.prepare(
      'UPDATE organizations SET owner_id = ? WHERE id = ?'
    ).run(userResult.lastInsertRowid, orgId)

    const freePlan = db.prepare("SELECT id FROM subscription_plans WHERE name = 'free'").get() as { id: number } | undefined
    if (!freePlan) {
      db.prepare('ROLLBACK').run()
      return NextResponse.json({ error: 'Free plan not found' }, { status: 500 })
    }

    const trialEndDate = addDays(new Date(), 30).toISOString()
    db.prepare(`
      INSERT INTO subscriptions (organization_id, plan_id, status, trial_end_date)
      VALUES (?, ?, 'trial', ?)
    `).run(orgId, freePlan.id, trialEndDate)

    db.prepare('COMMIT').run()

    const user = db.prepare(`
      SELECT id, email, full_name, organization_id, role, status, created_at
      FROM users WHERE id = ?
    `).get(userResult.lastInsertRowid)

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
