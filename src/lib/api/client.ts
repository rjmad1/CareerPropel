/**
 * API Client
 * Fetch wrapper with interceptors, error handling, and token refresh logic.
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
  private token: string | null = null

  constructor(baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api') {
    this.baseURL = baseURL
    this.loadToken()
  }

  private loadToken(): void {
    // In production, token would be in HTTP-only cookie
    // For development, we can store in sessionStorage
    if (typeof window !== 'undefined') {
      this.token = sessionStorage.getItem('authToken')
    }
  }

  setToken(token: string | null): void {
    this.token = token
    if (token) {
      sessionStorage.setItem('authToken', token)
    } else {
      sessionStorage.removeItem('authToken')
    }
  }

  private buildURL(path: string, params?: Record<string, string | number | boolean>): string {
    let url = `${this.baseURL}${path}`
    if (params) {
      const queryString = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&')
      if (queryString) url += `?${queryString}`
    }
    return url
  }

  private getHeaders(): Headers {
    const headers = new Headers({
      'Content-Type': 'application/json',
    })

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`)
    }

    return headers
  }

  async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    path: string,
    options?: RequestOptions
  ): Promise<T> {
    const { params, ...fetchOptions } = options || {}

    const url = this.buildURL(path, params)
    const headers = this.getHeaders()

    try {
      const response = await fetch(url, {
        method,
        headers,
        ...fetchOptions,
      })

      // Handle 401 Unauthorized - refresh token and retry
      if (response.status === 401) {
        await this.refreshToken()
        // Retry request with new token
        const retryHeaders = this.getHeaders()
        const retryResponse = await fetch(url, {
          method,
          headers: retryHeaders,
          ...fetchOptions,
        })
        return this.handleResponse<T>(retryResponse)
      }

      return this.handleResponse<T>(response)
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
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
      const errorData = typeof data === 'object' && data !== null ? (data as APIErrorResponse) : null
      throw new APIError(
        response.status,
        errorData?.code || `HTTP_${response.status}`,
        errorData?.message || response.statusText,
        errorData?.details
      )
    }

    return data as T
  }

  private async refreshToken(): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        throw new APIError(response.status, 'REFRESH_FAILED', 'Token refresh failed')
      }

      const data = (await response.json()) as { token: string }
      this.setToken(data.token)
    } catch (error) {
      this.setToken(null)
      throw error
    }
  }

  // Job endpoints
  async getJobs(filters?: Record<string, unknown>): Promise<any[]> {
    return this.request('GET', '/jobs', {
      params: filters as Record<string, string | number | boolean>,
    })
  }

  async getJobById(id: string): Promise<any> {
    return this.request('GET', `/jobs/${id}`)
  }

  async createJob(job: any): Promise<any> {
    return this.request('POST', '/jobs', {
      body: JSON.stringify(job),
    })
  }

  async updateJob(id: string, updates: any): Promise<any> {
    return this.request('PUT', `/jobs/${id}`, {
      body: JSON.stringify(updates),
    })
  }

  async deleteJob(id: string): Promise<void> {
    return this.request('DELETE', `/jobs/${id}`)
  }

  async moveJob(id: string, stage: string): Promise<any> {
    return this.request('POST', `/jobs/${id}/move`, {
      body: JSON.stringify({ stage }),
    })
  }

  // Agent endpoints
  async getAgents(): Promise<any[]> {
    return this.request('GET', '/agents')
  }

  async getAgentLogs(agentId: string): Promise<string[]> {
    return this.request('GET', `/agents/${agentId}/logs`)
  }

  async pauseAgent(agentId: string): Promise<any> {
    return this.request('POST', `/agents/${agentId}/pause`)
  }

  // User endpoints
  async getUserProfile(): Promise<any> {
    return this.request('GET', '/users/profile')
  }

  async updateProfile(updates: any): Promise<any> {
    return this.request('PUT', '/users/profile', {
      body: JSON.stringify(updates),
    })
  }

  // Document endpoints
  async uploadDocument(file: File, jobId?: string): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    if (jobId) formData.append('jobId', jobId)

    return this.request('POST', '/documents', {
      body: formData,
    })
  }

  async getDocuments(): Promise<any[]> {
    return this.request('GET', '/documents')
  }
}

// Singleton instance
export const apiClient = new APIClient()
