function getCSRFToken(req?: Request): string {
  if (typeof window !== 'undefined') {
    const match = document.cookie.match(/csrf-token=([^;]+)/)
    return match ? match[1] : ''
  }
  return req?.headers.get('x-csrf-token') || ''
}

export interface FetchOptions extends RequestInit {
  credentials?: 'include'
}

export async function fetchWithAuth(url: string, options: FetchOptions = {}): Promise<Response> {
  const isStateChanging = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method || 'GET')
  
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(isStateChanging && { 'X-CSRF-Token': getCSRFToken() })
    },
  })
  return response
}

export async function get(url: string): Promise<Response> {
  return fetchWithAuth(url, { method: 'GET' })
}

export async function post(url: string, body: any): Promise<Response> {
  return fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function put(url: string, body: any): Promise<Response> {
  return fetchWithAuth(url, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export async function del(url: string): Promise<Response> {
  return fetchWithAuth(url, { method: 'DELETE' })
}

export async function patch(url: string, body: any): Promise<Response> {
  return fetchWithAuth(url, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export { getCSRFToken }
