export interface HealthResponse {
  status: "healthy" | "degraded"
  project: string
  database: string
  storage: string
}

export type UserRole = "Management" | "Branch Manager" | "Staff" | "Portal Admin"

export interface UserPersona {
  id: string
  name: string
  email: string
  role: UserRole
  department: string
  groups: string[]
  can_post_announcement: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error_code?: string
  details?: unknown
}
