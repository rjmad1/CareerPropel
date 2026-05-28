/**
 * API Client
 * Fetch wrapper with error handling and token refresh logic.
 * Authentication is handled by NextAuth session cookies — no manual token management needed.
 */

export interface APIErrorResponse {
  code: string
  message: string
  details?: Record<string, unknown>
}

export class APIError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'APIError'
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>
}

export class APIClient {
  private baseURL: string

  constructor(baseURL = '/api') {
    this.baseURL = baseURL
  }

  private buildURL(path: string, params?: Record<string, string | number | boolean>): string {
    let url = `${this.baseURL}${path}`
    if (params) {
      const queryString = Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&')
      if (queryString) url += `?${queryString}`
    }
    return url
  }

  private getHeaders(body?: RequestInit['body']): Headers {
    const headers = new Headers()

    // Do NOT set Content-Type for FormData — the browser sets it automatically
    // with the correct multipart boundary. Setting it manually breaks uploads.
    if (!(body instanceof FormData)) {
      headers.set('Content-Type', 'application/json')
    }

    return headers
  }

  async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    path: string,
    options?: RequestOptions
  ): Promise<T> {
    const { params, body, headers: extraHeaders, ...fetchOptions } = options || {}

    const url = this.buildURL(path, params)
    const headers = this.getHeaders(body)

    if (extraHeaders) {
      const extra = new Headers(extraHeaders as HeadersInit)
      extra.forEach((value, key) => headers.set(key, value))
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body,
        credentials: 'include',
        ...fetchOptions,
      })

      if (response.status === 401) {
        // Session expired — hard redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`
        }
        throw new APIError(401, 'UNAUTHORIZED', 'Session expired. Redirecting to login.')
      }

      return this.handleResponse<T>(response)
    } catch (error) {
      if (error instanceof APIError) throw error
      throw new APIError(0, 'NETWORK_ERROR', 'Network request failed', {
        originalError: String(error),
      })
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type')
    let data: unknown

    if (contentType?.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    if (!response.ok) {
      const errorData =
        typeof data === 'object' && data !== null ? (data as APIErrorResponse) : null
      throw new APIError(
        response.status,
        errorData?.code || `HTTP_${response.status}`,
        errorData?.message || response.statusText,
        errorData?.details
      )
    }

    return data as T
  }

  // Job endpoints
  async getJobs(filters?: Record<string, string | number | boolean>): Promise<unknown[]> {
    return this.request('GET', '/jobs', { params: filters })
  }

  async getJobById(id: string): Promise<unknown> {
    return this.request('GET', `/jobs/${id}`)
  }

  async createJob(job: Record<string, unknown>): Promise<unknown> {
    return this.request('POST', '/jobs', { body: JSON.stringify(job) })
  }

  async updateJob(id: string, updates: Record<string, unknown>): Promise<unknown> {
    return this.request('PUT', `/jobs/${id}`, { body: JSON.stringify(updates) })
  }

  async deleteJob(id: string): Promise<void> {
    return this.request('DELETE', `/jobs/${id}`)
  }

  async moveJob(id: string, stage: string): Promise<unknown> {
    return this.request('POST', `/jobs/${id}/move`, { body: JSON.stringify({ stage }) })
  }

  // Agent endpoints
  async getAgents(): Promise<unknown[]> {
    return this.request('GET', '/agents')
  }

  async getAgentLogs(agentId: string): Promise<string[]> {
    return this.request('GET', `/agents/${agentId}/logs`)
  }

  async pauseAgent(agentId: string): Promise<unknown> {
    return this.request('POST', `/agents/${agentId}/pause`)
  }

  // User endpoints
  async getUserProfile(): Promise<unknown> {
    return this.request('GET', '/profile')
  }

  async updateProfile(updates: Record<string, unknown>): Promise<unknown> {
    return this.request('PUT', '/profile', { body: JSON.stringify(updates) })
  }

  // Document endpoints — FormData body intentionally has no Content-Type override
  async uploadDocument(file: File, jobId?: string): Promise<unknown> {
    const formData = new FormData()
    formData.append('file', file)
    if (jobId) formData.append('jobId', jobId)
    return this.request('POST', '/documents', { body: formData })
  }

  async getDocuments(): Promise<unknown[]> {
    return this.request('GET', '/documents')
  }
}

export const apiClient = new APIClient()
