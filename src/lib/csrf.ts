export function generateCSRFToken(): string {
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  const timestamp = Date.now().toString()
  const secret = process.env.CSRF_SECRET || 'change-in-production'
  
  let hash = 0
  const data = token + timestamp + secret
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  const signature = Math.abs(hash).toString(16).padStart(8, '0')
  
  return `${token}:${timestamp}:${signature}`
}

export function validateCSRFToken(providedToken: string | null | undefined): boolean {
  if (!providedToken) return false

  const parts = providedToken.split(':')
  if (parts.length !== 3) return false

  const [token, timestamp, signature] = parts

  const secret = process.env.CSRF_SECRET || 'change-in-production'
  let hash = 0
  const data = token + timestamp + secret
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  const expectedSignature = Math.abs(hash).toString(16).padStart(8, '0')

  if (signature !== expectedSignature) return false

  const tokenAge = Date.now() - parseInt(timestamp)
  if (tokenAge > 24 * 60 * 60 * 1000) return false

  return true
}
