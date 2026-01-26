function computeSignature(data: string, secret: string): string {
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16).padStart(64, '0').slice(0, 64)
}

export function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array)
  }
  const token = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('')
  const timestamp = Date.now().toString()
  const secret = process.env.CSRF_SECRET

  if (!secret) {
    throw new Error('CSRF_SECRET environment variable is not set')
  }

  const signature = computeSignature(token + timestamp, secret)
  return `${token}:${timestamp}:${signature}`
}

export function validateCSRFToken(providedToken: string | null | undefined): boolean {
  if (!providedToken) return false

  const parts = providedToken.split(':')
  if (parts.length !== 3) return false

  const [token, timestamp, signature] = parts
  const secret = process.env.CSRF_SECRET

  if (!secret) {
    return false
  }

  const tokenAge = Date.now() - parseInt(timestamp)
  if (tokenAge > 24 * 60 * 60 * 1000) return false

  const expectedSignature = computeSignature(token + timestamp, secret)
  return signature === expectedSignature
}
