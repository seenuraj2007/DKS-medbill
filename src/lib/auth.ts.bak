import { NextRequest } from 'next/server'
import db from '@/lib/db'
 
export async function getUserFromRequest(req: NextRequest) {
  const userId = req.cookies.get('user_id')?.value
 
  if (!userId) {
    return null
  }
 
  try {
    const user = db.prepare('SELECT id, email, full_name, organization_id, role, status, created_at FROM users WHERE id = ?').get(userId) as any
 
    if (!user) {
      return null
    }
 
    return user
  } catch (error) {
    console.error('Error getting user from request:', error)
    return null
  }
}
