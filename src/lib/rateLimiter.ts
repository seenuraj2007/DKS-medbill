const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime?: number
}

export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000
): RateLimitResult {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    })
    return { success: true, remaining: limit - 1 }
  }

  if (record.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetTime: record.resetTime
    }
  }

  rateLimitMap.set(identifier, {
    count: record.count + 1,
    resetTime: record.resetTime
  })

  return { success: true, remaining: limit - record.count - 1 }
}

export function getClientIdentifier(req: any): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() ||
            req.headers.get('x-real-ip') ||
            '127.0.0.1'
  return `${ip}:${req.headers.get('user-agent') || 'unknown'}`
}

export function getRateLimitHeaders(
  result: RateLimitResult
): Record<string, string> {
  return {
    'X-RateLimit-Limit': '100',
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime || Date.now()).toISOString()
  }
}
