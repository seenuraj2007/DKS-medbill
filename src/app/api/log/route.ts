import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { level, message, data, userId, path, timestamp } = body

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Log to console instead of database (error_logs table not in schema)
    const logEntry = {
      level: level || 'info',
      message,
      data: data || null,
      userId: userId || null,
      path: path || null,
      timestamp: timestamp || new Date().toISOString(),
      userAgent: req.headers.get('user-agent'),
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
    }

    console.log('[CLIENT LOG]', logEntry)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to log error:', error)
    // Still return success so the app doesn't break
    return NextResponse.json({ success: true })
  }
}
