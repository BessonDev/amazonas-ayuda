const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api`

interface RespuestaApi<T> {
  exito: boolean
  datos?: T
  error?: string
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${endpoint}`

  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  let data = await res.json()

  if (!res.ok) {
    const errorMsg =
      data.message || data.error || `Error ${res.status}: ${res.statusText}`
    throw new Error(errorMsg)
  }

  // Unwrap RespuestaApi envelope if present
  if (data && typeof data === 'object' && 'exito' in data) {
    if (!data.exito) throw new Error(data.error || 'Error desconocido')
    data = data.datos as T
  }

  return data as T
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),

  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
}
