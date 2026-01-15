import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userData = db.prepare(`
      SELECT id, email, full_name, role, status, organization_id, created_at
      FROM users
      WHERE id = ?
    `).get(user.id) as any

    const org = db.prepare(`
      SELECT id, name FROM organizations WHERE id = ?
    `).get(user.organization_id)

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role,
        status: userData.status,
        organization_id: userData.organization_id,
        created_at: userData.created_at,
        organization: org
      }
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { full_name, current_password, new_password } = body

    if (full_name !== undefined) {
      db.prepare('UPDATE users SET full_name = ? WHERE id = ?').run(full_name || null, user.id)
    }

    if (current_password && new_password) {
      const userData = db.prepare('SELECT password FROM users WHERE id = ?').get(user.id) as any
      
      const bcrypt = await import('bcryptjs')
      const validPassword = await bcrypt.compare(current_password, userData.password)
      
      if (!validPassword) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      }

      if (new_password.length < 8) {
        return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 })
      }

      const hashedPassword = await bcrypt.hash(new_password, 10)
      db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, user.id)
    }

    const updatedUser = db.prepare(`
      SELECT id, email, full_name, role, status, organization_id, created_at
      FROM users
      WHERE id = ?
    `).get(user.id)

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
