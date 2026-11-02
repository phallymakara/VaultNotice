import { useState, useEffect } from "react"
import {
  Loader2,
  AlertCircle,
  Download,
  X,
  Eye,
  Tag,
  FileText,
  Users,
} from "lucide-react"
import { useAnnouncementDetails } from "@/hooks/useAnnouncements"
import { apiClient } from "@/services/apiClient"
import { FileItem } from "@/types/api"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

interface AnnouncementDetailPageProps {
  announcementId: number
  onBack: () => void
}

const FALLBACK_NAME_MAP: Record<string, string> = {
  "grp-branch-managers": "Branch Managers",
  "grp-finance": "Finance Department",
  "grp-management": "Department Heads",
  "grp-operations": "Operations Team",
  "grp-portal-admins": "IT Administration",
  "grp-all-staff": "All Staff",
  "grp-hr": "Human Resources",
  "grp-it": "IT & Cybersecurity",
  "grp-compliance": "Compliance & Legal",
  "grp-credit": "Credit & Lending",
  "grp-audit": "Internal Audit",
  "grp-marketing": "Marketing & Communications",
  "All Branch Managers": "Branch Managers",
  "Finance Department": "Finance Department",
  "Management": "Department Heads",
  "Operations Team": "Operations Team",
  "All Staff": "All Staff",
  "user-alex": "Alex Vorn",
  "user-david": "David Miller",
  "user-emily": "Emily Tan",
  "user-sarah": "Sarah Lin",
  "user-sreyneath": "Sreyneath Keo",
  "user-sokha": "Sokha Chan",
  "user-dara": "Dara Pich",
  "user-bopha": "Bopha Meng",
  "user-vichea": "Vichea Chea",
  "user-kalyan": "Kalyan Roeun",
  "user-rithy": "Rithy Sen",
  "user-sovann": "Sovann Kong",
}

function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString)
    const day = d.getDate()
    const month = d.toLocaleDateString("en-US", { month: "short" })
    const year = d.getFullYear()
    return `${day} ${month} ${year}`
  } catch {
    return dateString
  }
}

function formatDateTime(dateString: string): string {
  try {
    const d = new Date(dateString)
    const day = d.getDate()
    const month = d.toLocaleDateString("en-US", { month: "short" })
    const year = d.getFullYear()
    const time = d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    return `${day} ${month} ${year}, ${time}`
  } catch {
    return dateString
  }
}

function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return "0 KB"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileTypeBadge(fileName: string) {
  const lower = fileName.toLowerCase()
  if (lower.endsWith(".pdf")) {
    return (
      <div className="w-6 h-6 rounded bg-[#ba1a1a] text-white text-[9px] font-bold flex items-center justify-center shrink-0 select-none">
        PDF
      </div>
    )
  }
  if (lower.endsWith(".xlsx") || lower.endsWith(".xls") || lower.endsWith(".csv")) {
    return (
      <div className="w-6 h-6 rounded bg-[#107c41] text-white text-[9px] font-bold flex items-center justify-center shrink-0 select-none">
        XLS
      </div>
    )
  }
  if (lower.endsWith(".docx") || lower.endsWith(".doc")) {
    return (
      <div className="w-6 h-6 rounded bg-[#0b57d0] text-white text-[9px] font-bold flex items-center justify-center shrink-0 select-none">
        W
      </div>
    )
  }
  return (
    <div className="w-6 h-6 rounded bg-[#5f6368] text-white text-[9px] font-bold flex items-center justify-center shrink-0 select-none">
      DOC
    </div>
  )
}

function getFileTypeLabel(fileName: string): string {
  const lower = fileName.toLowerCase()
  if (lower.endsWith(".pdf")) return "PDF Document"
  if (lower.endsWith(".xlsx") || lower.endsWith(".xls") || lower.endsWith(".csv")) return "Excel Spreadsheet"
  if (lower.endsWith(".docx") || lower.endsWith(".doc")) return "Word Document"
  return "Document"
}

export function AnnouncementDetailPage({
  announcementId,
  onBack,
}: AnnouncementDetailPageProps) {
  const { data: announcement, isLoading, isError, error } = useAnnouncementDetails(announcementId)

  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false)
  const [downloadingFileId, setDownloadingFileId] = useState<number | null>(null)

  // Fetch blob preview for selected file
  useEffect(() => {
    let currentUrl: string | null = null
    let isCancelled = false

    const fetchPreview = async () => {
      if (!selectedFile) {
        setPreviewBlobUrl(null)
        return
      }

      setIsLoadingPreview(true)
      try {
        const url = apiClient.getFileDownloadUrl(selectedFile.announcement_id, selectedFile.id)
        const res = await fetch(url, {
          headers: {
            "X-User-Id": apiClient.getCurrentUser(),
          },
        })

        if (!res.ok) throw new Error("Failed to load file preview.")

        const blob = await res.blob()
        if (!isCancelled) {
          const blobUrl = URL.createObjectURL(blob)
          currentUrl = blobUrl
          setPreviewBlobUrl(blobUrl)
        }
      } catch {
        if (!isCancelled) {
          setPreviewBlobUrl(null)
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingPreview(false)
        }
      }
    }

    fetchPreview()

    return () => {
      isCancelled = true
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl)
      }
    }
  }, [selectedFile])

  const handleDownloadFile = async (file: FileItem) => {
    setDownloadingFileId(file.id)
    try {
      const url = apiClient.getFileDownloadUrl(file.announcement_id, file.id)
      const res = await fetch(url, {
        headers: {
          "X-User-Id": apiClient.getCurrentUser(),
        },
      })
      if (!res.ok) throw new Error("Download failed")
      const blob = await res.blob()
      const downloadLink = document.createElement("a")
      downloadLink.href = window.URL.createObjectURL(blob)
      downloadLink.download = file.file_name
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    } catch {
      alert("Failed to download file. Please try again.")
    } finally {
      setDownloadingFileId(null)
    }
  }

  const handleOpenFile = (file: FileItem) => {
    const lower = file.file_name.toLowerCase()
    if (lower.endsWith(".pdf") || file.is_generated_pdf) {
      setSelectedFile(file)
    } else {
      handleDownloadFile(file)
    }
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto py-8">
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400 space-y-2">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#005fb8]" />
          <p>Loading announcement folder...</p>
        </div>
      </div>
    )
  }

  if (isError || !announcement) {
    return (
      <div className="w-full max-w-6xl mx-auto py-8">
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-base font-semibold text-slate-800">Folder Unavailable</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {error instanceof Error ? error.message : "You do not have permission to view this notice folder."}
          </p>
          <Button variant="outline" size="sm" onClick={onBack} className="text-xs">
            Return to Announcements
          </Button>
        </div>
      </div>
    )
  }

  const folderTitle = announcement.folder_name
    ? announcement.folder_name.replace(" - ", " ").trim()
    : announcement.created_at
    ? `${announcement.created_at.slice(0, 10)} ${announcement.title}`
    : announcement.title

  const postedDate = announcement.created_at || new Date().toISOString()
  const formattedDateTime = formatDateTime(postedDate)

  const rawTargets = announcement.selected_recipients && announcement.selected_recipients.length > 0
    ? announcement.selected_recipients.map((r) => r.name)
    : announcement.target_summary && announcement.target_summary.length > 0
    ? announcement.target_summary.map((t) => FALLBACK_NAME_MAP[t] || t)
    : ["All Staff"]

  // Clean deduplicated recipients
  const recipients = Array.from(new Set(rawTargets))

  // Mock Announcement Type
  const mockType = (() => {
    if (announcement.template_name) return announcement.template_name
    const titleLower = announcement.title.toLowerCase()
    if (titleLower.includes("audit")) return "Internal Audit Notice"
    if (titleLower.includes("memo")) return "Executive Memorandum"
    if (titleLower.includes("directive")) return "Official Directive"
    if (titleLower.includes("policy")) return "Policy Update"
    if (titleLower.includes("holiday")) return "General Staff Notice"
    return announcement.confidentiality_level
      ? `${announcement.confidentiality_level} Directive`
      : "Official Directive"
  })()

  // Mock Viewed Statistics & Readers
  const mockViewedCount = announcement.acknowledgement_count && announcement.acknowledgement_count > 0
    ? announcement.acknowledgement_count
    : 48
  const mockTotalTarget = 52
  const mockViewPercent = Math.min(100, Math.round((mockViewedCount / mockTotalTarget) * 100))
  const mockViewersSample = ["Emily Tan", "Alex Vorn", "Sokha Chan", "Dara Pich", "Bopha Meng", "David Miller"]

  // Mock Announcement Message Content
  const mockMessage = (() => {
    if (announcement.message_content && announcement.message_content.trim().length > 15) {
      return announcement.message_content
    }
    const titleLower = announcement.title.toLowerCase()
    if (titleLower.includes("audit")) {
      return (
        "Dear Finance & Accounting Team,\n\n" +
        "Please review the attached official Q4 Finance Internal Audit findings and documentation requirements. " +
        "All designated branch accountants, audit coordinators, and operational department leads must complete the " +
        "prescribed reconciliation checklists before the November 15, 2026 deadline.\n\n" +
        "For technical audit compliance guidance or questions regarding asset schedules, contact the Internal Audit Division directly."
      )
    }
    if (titleLower.includes("memo")) {
      return (
        "To All Branch Managers & Supervisors,\n\n" +
        "This confidential memorandum outlines the updated vault access protocol, dual-custody keyholder rotation rules, " +
        "and weekend cash management procedures effective immediately across all regional branches.\n\n" +
        "Please confirm team receipt and ensure compliance logs are maintained at your branch location."
      )
    }
    return (
      "Dear Colleagues,\n\n" +
      "Please review the attached official documentation and instructions regarding upcoming bank-wide operational arrangements. " +
      "Branch managers and team leads are requested to coordinate staff coverage rosters accordingly.\n\n" +
      "Thank you for your cooperation and dedication to operational excellence."
    )
  })()

  return (
    <div className="w-full max-w-6xl mx-auto py-2 sm:py-4 animate-fade-in">
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7 shadow-none space-y-4 sm:space-y-5">
        {/* Breadcrumb Navigation matching Screenshot */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-normal select-none">
          <button
            type="button"
            onClick={onBack}
            className="hover:text-slate-900 hover:underline cursor-pointer transition-colors"
          >
            Web Portal
          </button>
          <span>&gt;</span>
          <button
            type="button"
            onClick={onBack}
            className="hover:text-slate-900 hover:underline cursor-pointer transition-colors"
          >
            Announcements
          </button>
          <span>&gt;</span>
        </div>

        {/* Title */}
        <div className="pt-0.5">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {folderTitle}
          </h1>
        </div>

        {/* Grey Metadata Bar matching Screenshot */}
        <div className="bg-[#f5f6f8] rounded-xl px-4 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: Shared with, Type, Viewed */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Shared with */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-800 shrink-0">Shared with:</span>
              {recipients.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#e3edfc] text-[#0b57d0]"
                >
                  <span className="w-4 h-4 rounded-full bg-[#0b57d0] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    G
                  </span>
                  <span>{item}</span>
                </span>
              ))}
            </div>

            <span className="hidden sm:inline text-slate-300">|</span>

            {/* Type */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-800 shrink-0">Type:</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e8f1fc] text-[#004e9a] border border-[#cbe1fb]">
                <Tag className="w-3 h-3 text-[#005fb8]" />
                <span>{mockType}</span>
              </span>
            </div>

            <span className="hidden sm:inline text-slate-300">|</span>

            {/* Viewed */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-800 shrink-0">Viewed:</span>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-medium bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                <Eye className="w-3.5 h-3.5 text-[#005fb8]" />
                <span>{mockViewedCount} viewed ({mockViewPercent}%)</span>
              </span>
            </div>
          </div>

          {/* Right: Posted by */}
          <div className="text-xs text-slate-500 font-normal shrink-0">
            Posted by [{announcement.author_name ? `${announcement.author_name} · Management Office` : "Management Office"}] · {formattedDateTime}
          </div>
        </div>

        {/* Announcement Message Section */}
        <div className="rounded-xl border border-slate-200 bg-[#fbfbfa] p-4 sm:p-5 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#002d62]" />
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Message
              </h2>
            </div>
            <span className="text-[11px] font-medium text-slate-400">
              Official Communication
            </span>
          </div>

          <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-sans">
            {mockMessage}
          </div>

          {/* Recent Viewers Row */}
          <div className="pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-xs text-slate-500 flex-wrap">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Viewed by:</span>
            </span>
            <span>
              {mockViewersSample.join(", ")}
              <span className="text-slate-400"> +{Math.max(0, mockViewedCount - mockViewersSample.length)} others</span>
            </span>
          </div>
        </div>

        {/* Files Table matching Screenshot */}
        <div className="w-full rounded-lg border border-slate-200 overflow-hidden mt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8f9fa] border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <th className="py-3 pl-4 pr-3 font-semibold">Name</th>
                  <th className="py-3 px-3 font-semibold w-40">Type</th>
                  <th className="py-3 px-3 font-semibold w-36">Modified</th>
                  <th className="py-3 px-3 font-semibold w-48">Modified by</th>
                  <th className="py-3 pl-3 pr-4 font-semibold text-right w-24">Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {announcement.files.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No documents available in this folder.
                    </td>
                  </tr>
                ) : (
                  announcement.files.map((file) => {
                    const isDownloading = downloadingFileId === file.id
                    return (
                      <tr
                        key={file.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => handleOpenFile(file)}
                      >
                        {/* Name with Badge */}
                        <td className="py-3.5 pl-4 pr-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {getFileTypeBadge(file.file_name)}
                            <span className="text-xs sm:text-sm font-medium text-slate-800 group-hover:text-[#005fb8] transition-colors truncate">
                              {file.file_name}
                            </span>
                            {isDownloading && (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#005fb8] shrink-0" />
                            )}
                          </div>
                        </td>

                        {/* File Type */}
                        <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                          {getFileTypeLabel(file.file_name)}
                        </td>

                        {/* Modified */}
                        <td className="py-3.5 px-3 text-slate-700 whitespace-nowrap">
                          {formatDate(file.last_modified || announcement.created_at)}
                        </td>

                        {/* Modified by */}
                        <td className="py-3.5 px-3 text-slate-700 whitespace-nowrap">
                          {file.uploaded_by || "Announcement service"}
                        </td>

                        {/* Size */}
                        <td className="py-3.5 pl-3 pr-4 text-slate-700 text-right whitespace-nowrap">
                          {formatFileSize(file.file_size)}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* PDF / Document Preview Dialog */}
      {selectedFile && (
        <Dialog open={Boolean(selectedFile)} onOpenChange={(open) => !open && setSelectedFile(null)}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden border border-slate-200 rounded-xl bg-white shadow-none">
            <DialogTitle className="sr-only">Document Preview</DialogTitle>
            <div className="bg-[#002d62] px-5 py-3.5 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 min-w-0">
                {getFileTypeBadge(selectedFile.file_name)}
                <span className="text-sm font-semibold truncate text-white">
                  {selectedFile.file_name}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Button
                  size="sm"
                  onClick={() => handleDownloadFile(selectedFile)}
                  className="bg-[#005fb8] hover:bg-[#004ea3] text-white text-xs h-8 px-3 gap-1.5 cursor-pointer shadow-none"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </Button>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-white/80 hover:text-white p-1 rounded cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="h-[75vh] w-full bg-slate-100 flex items-center justify-center">
              {isLoadingPreview ? (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin text-[#005fb8]" />
                  <span>Loading preview...</span>
                </div>
              ) : previewBlobUrl ? (
                <iframe
                  src={previewBlobUrl}
                  className="w-full h-full border-none"
                  title={selectedFile.file_name}
                />
              ) : (
                <div className="text-xs text-slate-500">Preview not available</div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
