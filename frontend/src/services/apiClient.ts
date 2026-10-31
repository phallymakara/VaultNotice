import {
  AnnouncementDetail,
  AnnouncementSummary,
  AuditLogItem,
  DirectorySearchItem,
  HealthResponse,
  NotificationItem,
  TemplateItem,
  UserResponse,
} from "@/types/api"

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

  getBaseUrl(): string {
    return API_BASE_URL
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
        // Not a JSON response
      }
      const message = errorBody.message || `Request failed with status ${response.status}`
      throw new Error(message)
    }

    return response.json()
  }

  async getHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>("/health")
  }

  async getCurrentUserProfile(): Promise<UserResponse> {
    return this.request<UserResponse>("/directory/users/current")
  }

  async searchDirectory(query: string = ""): Promise<DirectorySearchItem[]> {
    return this.request<DirectorySearchItem[]>(`/directory/search?q=${encodeURIComponent(query)}`)
  }

  async getTemplates(): Promise<TemplateItem[]> {
    return this.request<TemplateItem[]>("/templates")
  }

  async getAnnouncements(limit: number = 50, offset: number = 0): Promise<AnnouncementSummary[]> {
    return this.request<AnnouncementSummary[]>(`/announcements?limit=${limit}&offset=${offset}`)
  }

  async getAnnouncementDetails(id: number): Promise<AnnouncementDetail> {
    return this.request<AnnouncementDetail>(`/announcements/${id}`)
  }

  async postAnnouncement(formData: FormData): Promise<AnnouncementDetail> {
    return this.request<AnnouncementDetail>("/announcements", {
      method: "POST",
      body: formData,
    })
  }

  async getMyNotifications(): Promise<NotificationItem[]> {
    return this.request<NotificationItem[]>("/notifications/my")
  }

  async getAuditLogs(limit: number = 50, offset: number = 0): Promise<AuditLogItem[]> {
    return this.request<AuditLogItem[]>(`/audit/logs?limit=${limit}&offset=${offset}`)
  }

  getFileDownloadUrl(announcementId: number, fileId: number): string {
    return `${API_BASE_URL}/announcements/${announcementId}/files/${fileId}/download`
  }
}

export const apiClient = new ApiClient()
