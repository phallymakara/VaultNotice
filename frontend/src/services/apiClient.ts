import {
  AcknowledgementResponse,
  AnnouncementDetail,
  AnnouncementSummary,
  AuditLogItem,
  DirectorySearchItem,
  HealthResponse,
  NotificationItem,
  TemplateItem,
  UserResponse,
  UserPersona,
} from "@/types/api"
import { DEFAULT_PERSONAS } from "@/constants/personas"

// Default mock templates
const DEFAULT_MOCK_TEMPLATES: TemplateItem[] = [
  {
    id: 1,
    name: "Holiday notice",
    category: "General",
    title_template: "Holiday Schedule Q4",
    content_template:
      "Dear colleagues,\n\nPlease find attached the public holiday schedule for October to December 2026 and the branch opening arrangements.",
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  {
    id: 2,
    name: "Company Policy Update",
    category: "Governance",
    title_template: "Updated Operational Policy Guidelines",
    content_template:
      "To all staff,\n\nPlease review the updated bank-wide policies effective next month.",
    is_active: true,
    created_at: "2026-10-05T08:00:00Z",
    updated_at: "2026-10-05T08:00:00Z",
  },
  {
    id: 3,
    name: "General Executive Circular",
    category: "Operations",
    title_template: "Executive Operations Circular",
    content_template:
      "Official circular regarding departmental coordination and reporting deadlines.",
    is_active: true,
    created_at: "2026-10-10T08:00:00Z",
    updated_at: "2026-10-10T08:00:00Z",
  },
  {
    id: 4,
    name: "Quarterly Townhall Agenda",
    category: "Events",
    title_template: "Q4 Townhall Meeting & Strategy Briefing",
    content_template:
      "All staff are invited to attend our Q4 Townhall session covering annual performance milestones.",
    is_active: true,
    created_at: "2026-10-15T08:00:00Z",
    updated_at: "2026-10-15T08:00:00Z",
  },
  {
    id: 5,
    name: "Blank Announcement",
    category: "Custom",
    title_template: "",
    content_template: "",
    is_active: true,
    created_at: "2026-10-20T08:00:00Z",
    updated_at: "2026-10-20T08:00:00Z",
  },
]

// Default mock announcements
const DEFAULT_MOCK_ANNOUNCEMENTS: AnnouncementDetail[] = [
  {
    id: 1,
    title: "Finance Internal Audit 1ab32a",
    folder_name: "2026-11-02 Finance Internal Audit 1ab32a",
    folder_url: "/announcements/1",
    message_content:
      "Dear Finance & Accounting Team,\n\nPlease review the attached official Q4 Finance Internal Audit findings and documentation requirements. All designated branch accountants, audit coordinators, and operational department leads must complete the prescribed reconciliation checklists before the November 15, 2026 deadline.\n\nFor technical audit compliance guidance or questions regarding asset schedules, contact the Internal Audit Division directly.",
    author_id: "user-sarah",
    author_name: "Sarah Lin",
    author_role: "Management",
    author_department: "Executive Office",
    template_name: "Internal Audit Notice",
    created_at: "2026-11-02T10:00:00Z",
    status: "Active",
    confidentiality_level: "Internal",
    acknowledgement_count: 48,
    acknowledged: false,
    target_summary: ["Finance Department", "All Staff"],
    selected_recipients: [
      { id: "grp-finance", name: "Finance Department", type: "GROUP" },
      { id: "grp-all-staff", name: "All Staff", type: "GROUP" },
    ],
    permissions: [],
    files: [
      {
        id: 101,
        announcement_id: 1,
        file_name: "Holiday Calendar Q4 2026.pdf",
        file_size: 1258291,
        mime_type: "application/pdf",
        is_generated_pdf: true,
        download_url: "#",
        uploaded_by: "Sarah Lin",
        last_modified: "2026-11-02T10:00:00Z",
      },
      {
        id: 102,
        announcement_id: 1,
        file_name: "Branch Opening Hours.xlsx",
        file_size: 46080,
        mime_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        is_generated_pdf: false,
        download_url: "#",
        uploaded_by: "Sarah Lin",
        last_modified: "2026-11-02T10:00:00Z",
      },
    ],
  },
  {
    id: 2,
    title: "Confidential Branch Memo fd55c8",
    folder_name: "2026-11-02 Confidential Branch Memo fd55c8",
    folder_url: "/announcements/2",
    message_content:
      "To All Branch Managers & Supervisors,\n\nThis confidential memorandum outlines the updated cash vault access protocols, multi-signature approval rules, and keyholder rotation schedules effective immediately across all regional branch locations.\n\nPlease confirm team receipt and ensure compliance logs are maintained at your branch location.",
    author_id: "user-sarah",
    author_name: "Sarah Lin",
    author_role: "Management",
    author_department: "Executive Office",
    template_name: "Executive Memorandum",
    created_at: "2026-11-02T09:30:00Z",
    status: "Active",
    confidentiality_level: "Confidential",
    acknowledgement_count: 64,
    acknowledged: false,
    target_summary: ["All Staff"],
    selected_recipients: [
      { id: "grp-all-staff", name: "All Staff", type: "GROUP" },
    ],
    permissions: [],
    files: [
      {
        id: 201,
        announcement_id: 2,
        file_name: "Branch_Operations_Protocol_2026.pdf",
        file_size: 921600,
        mime_type: "application/pdf",
        is_generated_pdf: true,
        download_url: "#",
        uploaded_by: "Sarah Lin",
        last_modified: "2026-11-02T09:30:00Z",
      },
    ],
  },
  {
    id: 3,
    title: "Q4 Executive Branch Directive",
    folder_name: "2026-11-02 Q4 Executive Branch Directive",
    folder_url: "/announcements/3",
    message_content:
      "Dear Branch Managers,\n\nPlease review the attached official Q4 strategic objectives and resource allocation models. Coordinate with your assistant managers to align performance benchmarks accordingly.\n\nManagement Office",
    author_id: "user-sarah",
    author_name: "Sarah Lin",
    author_role: "Management",
    author_department: "Executive Office",
    template_name: "Official Directive",
    created_at: "2026-11-02T08:15:00Z",
    status: "Active",
    confidentiality_level: "Official Directive",
    acknowledgement_count: 32,
    acknowledged: false,
    target_summary: ["All Branch Managers"],
    selected_recipients: [
      { id: "grp-branch-managers", name: "All Branch Managers", type: "GROUP" },
    ],
    permissions: [],
    files: [
      {
        id: 301,
        announcement_id: 3,
        file_name: "Executive_Directive_Q4_2026.pdf",
        file_size: 2457600,
        mime_type: "application/pdf",
        is_generated_pdf: true,
        download_url: "#",
        uploaded_by: "Sarah Lin",
        last_modified: "2026-11-02T08:15:00Z",
      },
      {
        id: 302,
        announcement_id: 3,
        file_name: "Q4_Regional_Budget.xlsx",
        file_size: 114688,
        mime_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        is_generated_pdf: false,
        download_url: "#",
        uploaded_by: "Sarah Lin",
        last_modified: "2026-11-02T08:15:00Z",
      },
    ],
  },
  {
    id: 4,
    title: "Information Security & Cybersecurity Directive",
    folder_name: "2026-10-28 Information Security & Cybersecurity Directive",
    folder_url: "/announcements/4",
    message_content:
      "Mandatory cybersecurity update for all personnel. Please review the updated Multi-Factor Authentication protocols and email phishing reporting procedures.",
    author_id: "user-sarah",
    author_name: "Sarah Lin",
    author_role: "Management",
    author_department: "Executive Office",
    template_name: "Security Directive",
    created_at: "2026-10-28T14:20:00Z",
    status: "Active",
    confidentiality_level: "Restricted",
    acknowledgement_count: 118,
    acknowledged: false,
    target_summary: ["IT & Cybersecurity", "All Staff"],
    selected_recipients: [
      { id: "grp-it", name: "IT & Cybersecurity", type: "GROUP" },
      { id: "grp-all-staff", name: "All Staff", type: "GROUP" },
    ],
    permissions: [],
    files: [
      {
        id: 401,
        announcement_id: 4,
        file_name: "Cybersecurity_Policy_v4.pdf",
        file_size: 1572864,
        mime_type: "application/pdf",
        is_generated_pdf: true,
        download_url: "#",
        uploaded_by: "Sarah Lin",
        last_modified: "2026-10-28T14:20:00Z",
      },
    ],
  },
  {
    id: 5,
    title: "Credit Risk Management Guidelines v3.2",
    folder_name: "2026-10-25 Credit Risk Management Guidelines v3.2",
    folder_url: "/announcements/5",
    message_content:
      "Updated collateral valuation ratios and risk-weighted exposure guidelines for SME commercial credit underwriting. Effective November 1, 2026.",
    author_id: "user-sarah",
    author_name: "Sarah Lin",
    author_role: "Management",
    author_department: "Executive Office",
    template_name: "Policy Update",
    created_at: "2026-10-25T11:00:00Z",
    status: "Active",
    confidentiality_level: "Internal",
    acknowledgement_count: 24,
    acknowledged: false,
    target_summary: ["Credit & Lending"],
    selected_recipients: [
      { id: "grp-credit", name: "Credit & Lending", type: "GROUP" },
    ],
    permissions: [],
    files: [
      {
        id: 501,
        announcement_id: 5,
        file_name: "Credit_Underwriting_Matrix.pdf",
        file_size: 2097152,
        mime_type: "application/pdf",
        is_generated_pdf: true,
        download_url: "#",
        uploaded_by: "Sarah Lin",
        last_modified: "2026-10-25T11:00:00Z",
      },
      {
        id: 502,
        announcement_id: 5,
        file_name: "SME_Collateral_Schedule.xlsx",
        file_size: 81920,
        mime_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        is_generated_pdf: false,
        download_url: "#",
        uploaded_by: "Sarah Lin",
        last_modified: "2026-10-25T11:00:00Z",
      },
    ],
  },
]

const STORAGE_KEY = "vaultnotice_mock_announcements"

export function isAnnouncementVisibleToUser(
  announcement: AnnouncementDetail,
  userId: string,
  persona?: UserPersona
): boolean {
  const user =
    persona ||
    DEFAULT_PERSONAS.find((p) => p.id === userId) || {
      id: userId,
      name: "",
      role: "Staff",
      department: "",
      groups: [],
      can_post_announcement: false,
    }

  // 1. Management or the announcement author can always see the announcement
  if (
    user.can_post_announcement ||
    user.role?.toLowerCase() === "management" ||
    announcement.author_id === user.id
  ) {
    return true
  }

  const selectedRecipients = announcement.selected_recipients || []
  const targetSummaries = (announcement.target_summary || []).map((t) => t.toLowerCase())

  // 2. Check "All Staff" broadcast
  const isAllStaff =
    selectedRecipients.some(
      (r) =>
        r.id === "grp-all-staff" ||
        r.name?.toLowerCase() === "all staff"
    ) ||
    targetSummaries.some((t) => t === "all staff" || t === "grp-all-staff")
  if (isAllStaff) {
    return true
  }

  // 3. Check direct individual user recipient (by ID or exact Name)
  const isDirectUser =
    selectedRecipients.some((r) => {
      if (r.type === "USER" || r.id?.startsWith("user-")) {
        return (
          r.id === user.id ||
          (r.name && r.name.toLowerCase() === user.name.toLowerCase())
        )
      }
      return r.id === user.id
    }) ||
    targetSummaries.some(
      (t) =>
        t === user.id.toLowerCase() ||
        t === user.name.toLowerCase()
    )
  if (isDirectUser) {
    return true
  }

  // 4. Check group / department match
  const userGroups = (user.groups || []).map((g) => g.toLowerCase())
  const userDept = (user.department || "").toLowerCase()
  const userRole = (user.role || "").toLowerCase()

  for (const r of selectedRecipients) {
    if (r.type === "GROUP" || r.id?.startsWith("grp-")) {
      const gId = (r.id || "").toLowerCase()
      const gName = (r.name || "").toLowerCase()

      // Exact group name in user groups
      if (userGroups.includes(gName)) return true

      // Mapping group IDs to departments & roles
      if (gId === "grp-finance" && (userDept.includes("finance") || userGroups.includes("finance department"))) return true
      if (gId === "grp-operations" && (userDept.includes("operation") || userDept.includes("customer service") || userGroups.includes("operations team"))) return true
      if (gId === "grp-hr" && (userDept.includes("human resources") || userGroups.includes("human resources department"))) return true
      if (gId === "grp-it" && (userDept.includes("it") || userGroups.includes("it & cybersecurity"))) return true
      if (gId === "grp-compliance" && (userDept.includes("compliance") || userGroups.includes("compliance & legal"))) return true
      if (gId === "grp-credit" && (userDept.includes("credit") || userGroups.includes("credit & lending"))) return true
      if (gId === "grp-audit" && (userDept.includes("audit") || userGroups.includes("internal audit"))) return true
      if (gId === "grp-marketing" && (userDept.includes("marketing") || userGroups.includes("marketing & communications"))) return true
      if (gId === "grp-branch-managers" && (userRole.includes("branch manager") || userGroups.includes("all branch managers"))) return true
      if (gId === "grp-management" && (userRole.includes("management") || userGroups.includes("management"))) return true
    }
  }

  // 5. Also check target_summary strings against department / role / groups
  for (const t of targetSummaries) {
    if (userGroups.includes(t)) return true
    if (t.includes("finance") && userDept.includes("finance")) return true
    if (t.includes("operation") && (userDept.includes("operation") || userDept.includes("customer service"))) return true
    if (t.includes("human resources") && userDept.includes("human resources")) return true
    if (t.includes("it") && (userDept.includes("it") || userDept.includes("technology"))) return true
    if (t.includes("cybersecurity") && userDept.includes("it")) return true
    if (t.includes("compliance") && userDept.includes("compliance")) return true
    if (t.includes("credit") && userDept.includes("credit")) return true
    if (t.includes("audit") && userDept.includes("audit")) return true
    if (t.includes("marketing") && userDept.includes("marketing")) return true
    if (t.includes("branch manager") && userRole.includes("branch manager")) return true
  }

  return false
}

class ApiClient {
  private currentUserId: string = "user-sarah"
  private announcements: AnnouncementDetail[] = []

  constructor() {
    this.initMockStore()
  }

  private initMockStore() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        this.announcements = JSON.parse(stored)
      } else {
        this.announcements = [...DEFAULT_MOCK_ANNOUNCEMENTS]
        this.saveToStorage()
      }
    } catch {
      this.announcements = [...DEFAULT_MOCK_ANNOUNCEMENTS]
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.announcements))
    } catch {
      // storage unavailable
    }
  }

  setCurrentUser(userId: string) {
    this.currentUserId = userId
  }

  getCurrentUser(): string {
    return this.currentUserId
  }

  getBaseUrl(): string {
    return ""
  }

  async getHealth(): Promise<HealthResponse> {
    return {
      status: "healthy",
      project: "VaultNotice (Mock Mode)",
      database: "mock",
      storage: "mock",
    }
  }

  async getCurrentUserProfile(): Promise<UserResponse> {
    return {
      id: this.currentUserId,
      name: "Sarah Lin",
      email: "sarah.lin@company.com",
      role: "Management",
      department: "Executive Office",
      groups: ["Management", "Executive Board", "All Staff"],
      can_post_announcement: true,
      created_at: "2026-01-01T00:00:00Z",
    }
  }

  async searchDirectory(query: string = ""): Promise<DirectorySearchItem[]> {
    const allItems: DirectorySearchItem[] = [
      { id: "grp-all-staff", name: "All Staff", email: null, type: "GROUP", details: "Organization Wide" },
      { id: "grp-branch-managers", name: "All Branch Managers", email: null, type: "GROUP", details: "Branch Network" },
      { id: "grp-management", name: "Management", email: null, type: "GROUP", details: "Executive Leadership" },
      { id: "grp-finance", name: "Finance Department", email: null, type: "GROUP", details: "Finance & Accounting" },
      { id: "grp-operations", name: "Operations Team", email: null, type: "GROUP", details: "Frontline Operations" },
      { id: "grp-hr", name: "Human Resources Department", email: null, type: "GROUP", details: "People & Talent" },
      { id: "grp-it", name: "IT & Cybersecurity", email: null, type: "GROUP", details: "Technology & Security" },
      { id: "grp-compliance", name: "Compliance & Legal", email: null, type: "GROUP", details: "Governance & AML" },
      { id: "grp-credit", name: "Credit & Lending", email: null, type: "GROUP", details: "Credit & Risk" },
      { id: "grp-audit", name: "Internal Audit", email: null, type: "GROUP", details: "Audit & Assurance" },
      { id: "grp-marketing", name: "Marketing & Communications", email: null, type: "GROUP", details: "Brand & PR" },
      { id: "user-sarah", name: "Sarah Lin", email: "sarah.lin@company.com", type: "USER", details: "Management • Executive Office" },
      { id: "user-david", name: "David Miller", email: "david.miller@company.com", type: "USER", details: "Branch Manager • Battambang" },
      { id: "user-sreyneath", name: "Sreyneath Keo", email: "sreyneath.keo@company.com", type: "USER", details: "Branch Manager • Siem Reap" },
      { id: "user-emily", name: "Emily Tan", email: "emily.tan@company.com", type: "USER", details: "Staff • Finance & Accounting" },
      { id: "user-alex", name: "Alex Vorn", email: "alex.vorn@company.com", type: "USER", details: "Staff • Customer Service" },
      { id: "user-sokha", name: "Sokha Chan", email: "sokha.chan@company.com", type: "USER", details: "Staff • Human Resources" },
      { id: "user-dara", name: "Dara Pich", email: "dara.pich@company.com", type: "USER", details: "Staff • Credit & Lending" },
      { id: "user-bopha", name: "Bopha Meng", email: "bopha.meng@company.com", type: "USER", details: "Staff • Compliance & Legal" },
      { id: "user-vichea", name: "Vichea Chea", email: "vichea.chea@company.com", type: "USER", details: "Staff • IT Infrastructure" },
      { id: "user-kalyan", name: "Kalyan Roeun", email: "kalyan.roeun@company.com", type: "USER", details: "Staff • Marketing & PR" },
      { id: "user-rithy", name: "Rithy Sen", email: "rithy.sen@company.com", type: "USER", details: "Staff • Internal Audit" },
      { id: "user-sovann", name: "Sovann Kong", email: "sovann.kong@company.com", type: "USER", details: "Staff • Operations Team" },
    ]

    if (!query.trim()) return allItems
    const q = query.toLowerCase()
    return allItems.filter(
      (item) => item.name.toLowerCase().includes(q) || item.details.toLowerCase().includes(q)
    )
  }

  async getTemplates(): Promise<TemplateItem[]> {
    return DEFAULT_MOCK_TEMPLATES
  }

  async getAnnouncements(
    limit: number = 50,
    offset: number = 0,
    persona?: UserPersona
  ): Promise<AnnouncementSummary[]> {
    const user =
      persona ||
      DEFAULT_PERSONAS.find((p) => p.id === this.currentUserId) ||
      DEFAULT_PERSONAS[0]

    const visibleList = this.announcements.filter((a) =>
      isAnnouncementVisibleToUser(a, user.id, user)
    )

    const list = visibleList.slice(offset, offset + limit)
    return list.map((a) => ({
      id: a.id,
      title: a.title,
      folder_name: a.folder_name,
      author_id: a.author_id,
      author_name: a.author_name,
      created_at: a.created_at,
      status: a.status,
      confidentiality_level: a.confidentiality_level,
      expires_at: a.expires_at,
      acknowledged: a.acknowledged,
      acknowledgement_count: a.acknowledgement_count,
      target_summary: a.target_summary,
      attachment_count: a.files ? a.files.length : 0,
    }))
  }

  async getAnnouncementDetails(id: number): Promise<AnnouncementDetail> {
    const match = this.announcements.find((a) => a.id === Number(id))
    if (match) return match

    // If ID is not in initial list, generate a clean fallback so detail view always renders perfectly
    const fallback: AnnouncementDetail = {
      id: Number(id),
      title: `Finance Internal Audit 1ab32a`,
      folder_name: `2026-11-02 Finance Internal Audit 1ab32a`,
      folder_url: `/announcements/${id}`,
      message_content:
        "Dear Finance & Accounting Team,\n\nPlease review the attached official Q4 Finance Internal Audit findings and documentation requirements. All designated branch accountants, audit coordinators, and operational department leads must complete the prescribed reconciliation checklists before the November 15, 2026 deadline.\n\nFor technical audit compliance guidance or questions regarding asset schedules, contact the Internal Audit Division directly.",
      author_id: "user-sarah",
      author_name: "Sarah Lin",
      author_role: "Management",
      author_department: "Executive Office",
      template_name: "Internal Audit Notice",
      created_at: "2026-11-02T10:00:00Z",
      status: "Active",
      confidentiality_level: "Internal",
      acknowledgement_count: 48,
      acknowledged: false,
      target_summary: ["Finance Department", "All Staff"],
      selected_recipients: [
        { id: "grp-finance", name: "Finance Department", type: "GROUP" },
        { id: "grp-all-staff", name: "All Staff", type: "GROUP" },
      ],
      permissions: [],
      files: [
        {
          id: 101,
          announcement_id: Number(id),
          file_name: "Holiday Calendar Q4 2026.pdf",
          file_size: 1258291,
          mime_type: "application/pdf",
          is_generated_pdf: true,
          download_url: "#",
          uploaded_by: "Sarah Lin",
          last_modified: "2026-11-02T10:00:00Z",
        },
        {
          id: 102,
          announcement_id: Number(id),
          file_name: "Branch Opening Hours.xlsx",
          file_size: 46080,
          mime_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          is_generated_pdf: false,
          download_url: "#",
          uploaded_by: "Sarah Lin",
          last_modified: "2026-11-02T10:00:00Z",
        },
      ],
    }
    return fallback
  }

  async acknowledgeAnnouncement(id: number): Promise<AcknowledgementResponse> {
    const match = this.announcements.find((a) => a.id === Number(id))
    let count = 48
    if (match) {
      match.acknowledged = true
      match.acknowledgement_count = (match.acknowledgement_count || 48) + 1
      count = match.acknowledgement_count
      this.saveToStorage()
    }
    return {
      announcement_id: Number(id),
      acknowledged: true,
      acknowledged_at: new Date().toISOString(),
      acknowledgement_count: count,
    }
  }

  async postAnnouncement(formData: FormData): Promise<AnnouncementDetail> {
    // Simulate realistic loading for announcement creation
    await new Promise((resolve) => setTimeout(resolve, 800))

    const title = (formData.get("title") as string) || "New Announcement"
    const content = (formData.get("message_content") as string) || ""
    const recipientsRaw = formData.get("recipients") as string
    let parsedRecipients: { id: string; name: string; type: "GROUP" | "USER" }[] = []
    try {
      parsedRecipients = JSON.parse(recipientsRaw || "[]")
    } catch {
      parsedRecipients = [{ id: "grp-all-staff", name: "All Staff", type: "GROUP" }]
    }

    const filesRaw = formData.getAll("files")
    const newId = Date.now()
    const newFiles = filesRaw.map((f, i) => {
      const fileObj = f as File
      const name = fileObj.name || `Document_${i + 1}.pdf`
      const size = fileObj.size || 102400
      const isPdf = name.toLowerCase().endsWith(".pdf")
      return {
        id: Date.now() + i + 1,
        announcement_id: newId,
        file_name: name,
        file_size: size,
        mime_type: isPdf ? "application/pdf" : "application/octet-stream",
        is_generated_pdf: isPdf,
        download_url: "#",
        uploaded_by: "Sarah Lin",
        last_modified: new Date().toISOString(),
      }
    })

    const folderDate = new Date().toISOString().slice(0, 10)
    const newAnnouncement: AnnouncementDetail = {
      id: newId,
      title,
      folder_name: `${folderDate} ${title}`,
      folder_url: `/announcements/${newId}`,
      message_content: content,
      author_id: this.currentUserId,
      author_name: "Sarah Lin",
      author_role: "Management",
      author_department: "Executive Office",
      template_name: "Official Directive",
      created_at: new Date().toISOString(),
      status: "Active",
      confidentiality_level: "Internal",
      acknowledgement_count: 1,
      acknowledged: false,
      target_summary: parsedRecipients.map((r) => r.name),
      selected_recipients: parsedRecipients,
      permissions: [],
      files:
        newFiles.length > 0
          ? newFiles
          : [
              {
                id: Date.now() + 10,
                announcement_id: newId,
                file_name: "Holiday Calendar Q4 2026.pdf",
                file_size: 1258291,
                mime_type: "application/pdf",
                is_generated_pdf: true,
                download_url: "#",
                uploaded_by: "Sarah Lin",
                last_modified: new Date().toISOString(),
              },
            ],
    }

    this.announcements.unshift(newAnnouncement)
    this.saveToStorage()
    return newAnnouncement
  }

  async getMyNotifications(): Promise<NotificationItem[]> {
    return [
      {
        id: 1,
        announcement_id: 1,
        announcement_title: "Finance Internal Audit 1ab32a",
        author_name: "Sarah Lin",
        channel: "EMAIL & TEAMS",
        status: "DELIVERED",
        sent_at: new Date().toISOString(),
        open_url: "/announcements/1",
      },
      {
        id: 2,
        announcement_id: 2,
        announcement_title: "Confidential Branch Memo fd55c8",
        author_name: "Sarah Lin",
        channel: "EMAIL",
        status: "DELIVERED",
        sent_at: new Date(Date.now() - 3600000).toISOString(),
        open_url: "/announcements/2",
      },
    ]
  }

  async getAuditLogs(limit: number = 50, offset: number = 0): Promise<AuditLogItem[]> {
    const logs: AuditLogItem[] = [
      {
        id: 1,
        announcement_id: 1,
        title: "Finance Internal Audit 1ab32a",
        author_name: "Sarah Lin",
        recipients_summary: ["Finance Department", "All Staff"],
        file_count: 2,
        timestamp: new Date().toISOString(),
        status: "SUCCESS",
      },
      {
        id: 2,
        announcement_id: 2,
        title: "Confidential Branch Memo fd55c8",
        author_name: "Sarah Lin",
        recipients_summary: ["All Staff"],
        file_count: 1,
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        status: "SUCCESS",
      },
    ]
    return logs.slice(offset, offset + limit)
  }

  getFileDownloadUrl(announcementId: number, fileId: number): string {
    return `#announcement-${announcementId}-file-${fileId}`
  }
}

export const apiClient = new ApiClient()
