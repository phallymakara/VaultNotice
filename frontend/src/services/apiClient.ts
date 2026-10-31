import { HealthResponse } from "@/types/api"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not configured in the environment.")
}

class ApiClient {
  private currentUserId: string = "user-sarah"

  setCurrentUser(userId: string) {
    this.currentUserId = userId
  }

  getCurrentUser(): string {
    return this.currentUserId
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`
    
    const headers: Record<string, string> = {
      "X-User-Id": this.currentUserId,
      ...(options.headers as Record<string, string>),
    }

    if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json"
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      let errorBody: { message?: string; error_code?: string } = {}
      try {
        errorBody = await response.json()
      } catch {
        // Response was not JSON
      }
      const message = errorBody.message || `Request failed with status ${response.status}`
      throw new Error(message)
    }

    return response.json()
  }

  async getHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>("/health")
  }
}

export const apiClient = new ApiClient()
