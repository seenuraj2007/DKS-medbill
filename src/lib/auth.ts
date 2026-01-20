import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { UserRole } from './permissions'

export interface User {
  id: string
  email: string
  full_name: string | null
  organization_id: string | null
  role: UserRole | null
  status: string | null
  created_at: string
  updated_at: string
}

export async function getUserFromRequest(req: NextRequest): Promise<User | null> {
  try {
    const accessToken = req.cookies.get('sb-access-token')?.value

    if (!accessToken) {
      return null
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      return null
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, organization_id, role, status, created_at, updated_at')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return null
    }

    return userData
  } catch (error) {
    console.error('Error getting user from request:', error)
    return null
  }
}

export async function requireAuth(req: NextRequest): Promise<User> {
  const user = await getUserFromRequest(req)
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}
