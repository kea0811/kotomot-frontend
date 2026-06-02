import { supabase } from '@/lib/supabase'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

/**
 * Authenticated fetch wrapper that automatically adds the Bearer token
 * from the current Supabase session to all requests.
 */
async function authenticatedFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const headers = new Headers(options.headers)

  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`)
  }

  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json')
  }

  const url = `${API_BASE_URL}${path}`

  const response = await fetch(url, {
    ...options,
    headers,
  })

  // Handle 401 Unauthorized
  // (skip the redirect under the dev-only preview bypass so UI pages
  //  stay rendered with empty states for screenshots)
  const previewBypass =
    import.meta.env.DEV && import.meta.env.VITE_PREVIEW === '1'
  if (response.status === 401 && !previewBypass) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  return response
}

/**
 * Parse an API response, throwing on non-ok status.
 * Also handles already-parsed data (pass-through) for compatibility
 * with code that chains apiClient.get() + handleApiResponse().
 */
export async function handleApiResponse(response: Response | any): Promise<any> {
  // If already parsed (not a Response object), pass through
  if (!(response instanceof Response)) {
    return response
  }
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`)
  }
  return data
}

/**
 * API client with methods matching the interface used throughout the app
 */
export const apiClient = {
  async get(url: string, options?: RequestInit): Promise<any> {
    const response = await authenticatedFetch(url, options)
    return handleApiResponse(response)
  },

  async post(url: string, data?: unknown, options?: RequestInit): Promise<any> {
    const response = await authenticatedFetch(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
    return handleApiResponse(response)
  },

  async put(url: string, data?: unknown, options?: RequestInit): Promise<any> {
    const response = await authenticatedFetch(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
    return handleApiResponse(response)
  },

  async patch(url: string, data?: unknown, options?: RequestInit): Promise<any> {
    const response = await authenticatedFetch(url, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
    return handleApiResponse(response)
  },

  async delete(url: string, options?: RequestInit): Promise<any> {
    const response = await authenticatedFetch(url, {
      method: 'DELETE',
      ...options,
    })
    return handleApiResponse(response)
  },
}

export { authenticatedFetch }
export default apiClient
