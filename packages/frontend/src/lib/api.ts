export function getApiBase() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  return apiUrl ? `${apiUrl}/api` : '/api'
}

interface RespuestaApi<T> {
  exito: boolean
  datos?: T
  error?: string
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  isFormData = false,
): Promise<T> {
    const url = `${getApiBase()}${endpoint}`

  const defaultHeaders: Record<string, string> = isFormData
    ? {}
    : { 'Content-Type': 'application/json' }

  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      ...defaultHeaders,
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

  postForm: <T>(endpoint: string, body: FormData) =>
    request<T>(endpoint, {
      method: 'POST',
      body,
      headers: {},
    }, true),

  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),

  downloadBlob: async (endpoint: string) => {
  const url = `${getApiBase()}${endpoint}`
    const res = await fetch(url, { credentials: 'include' })
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)
    return res.blob()
  },
}
