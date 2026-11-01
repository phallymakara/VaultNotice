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

export interface UserResponse {
  id: string
  name: string
  email: string
  role: string
  department: string
  groups: string[]
  can_post_announcement: boolean
  created_at: string
}

export interface RecipientTarget {
  type: "USER" | "GROUP"
  id: string
  name: string
}

export interface DirectorySearchItem {
  id: string
  name: string
  email: string | null
  type: "USER" | "GROUP"
  details: string
}

export interface TemplateItem {
  id: number
  name: string
  category: string
  title_template: string
  content_template: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AnnouncementSummary {
  id: number
  title: string
  folder_name: string
  author_id: string
  author_name: string
  created_at: string
  status: string
  confidentiality_level?: string
  expires_at?: string | null
  acknowledged?: boolean
  acknowledgement_count?: number
  target_summary: string[]
  attachment_count: number
}

export interface FileItem {
  id: number
  announcement_id: number
  file_name: string
  file_size: number
  mime_type: string
  is_generated_pdf: boolean
  download_url: string
}

export interface AnnouncementPermissionItem {
  id: number
  recipient_type: string
  recipient_id: string
  recipient_name: string
  access_level: string
}

export interface AnnouncementDetail {
  id: number
  title: string
  folder_name: string
  message_content: string
  author_id: string
  author_name: string
  template_name?: string | null
  created_at: string
  status: string
  confidentiality_level?: string
  expires_at?: string | null
  acknowledged?: boolean
  acknowledged_at?: string | null
  acknowledgement_count?: number
  target_summary: string[]
  permissions: AnnouncementPermissionItem[]
  files: FileItem[]
}

export interface AcknowledgementResponse {
  announcement_id: number
  acknowledged: boolean
  acknowledged_at: string | null
  acknowledgement_count: number
}

export interface NotificationItem {
  id: number
  announcement_id: number
  announcement_title: string
  author_name: string
  channel: string
  status: string
  sent_at: string
  open_url: string
}

export interface AuditLogItem {
  id: number
  announcement_id: number
  title: string
  author_name: string
  recipients_summary: string[]
  file_count: number
  timestamp: string
  status: string
  error_message?: string | null
}
