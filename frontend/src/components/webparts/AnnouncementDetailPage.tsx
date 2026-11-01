import { useState, useEffect } from "react"
import {
  ArrowLeft,
  FileText,
  Download,
  Calendar,
  FileSpreadsheet,
  FileImage,
  Loader2,
  AlertCircle,
  File,
} from "lucide-react"
import { useAnnouncementDetails } from "@/hooks/useAnnouncements"
import { apiClient } from "@/services/apiClient"
import { FileItem } from "@/types/api"
import { Button } from "@/components/ui/button"

interface AnnouncementDetailPageProps {
  announcementId: number
  onBack: () => void
}

const FALLBACK_NAME_MAP: Record<string, string> = {
  "grp-branch-managers": "All Branch Managers",
  "grp-finance": "Finance Department",
  "grp-management": "Management",
  "grp-operations": "Operations Team",
  "grp-portal-admins": "Portal Admins",
  "user-alex": "Alex Vorn",
  "user-david": "David Miller",
  "user-emily": "Emily Tan",
  "user-admin": "Portal Admin",
  "user-sarah": "Sarah Lin",
  "user-sreyneath": "Sreyneath Keo",
}

const SHORT_CODE_MAP: Record<string, string> = {
  "All Branch Managers": "ALL",
  "grp-branch-managers": "ALL",
  "Finance Department": "FD",
  "grp-finance": "FD",
  "Finance": "FD",
  "Management": "MGMT",
  "grp-management": "MGMT",
  "Operations Team": "OPS",
  "grp-operations": "OPS",
  "Operations": "OPS",
  "Portal Admins": "ADM",
  "grp-portal-admins": "ADM",
  "Portal Admin": "PA",
  "Sarah Lin": "SL",
  "user-sarah": "SL",
  "David Miller": "DM",
  "user-david": "DM",
  "Alex Vorn": "AV",
  "user-alex": "AV",
  "Emily Tan": "ET",
  "user-emily": "ET",
  "Sreyneath Keo": "SK",
  "user-sreyneath": "SK",
  "user-admin": "PA",
}

function getShortRecipient(target: string): string {
  if (SHORT_CODE_MAP[target]) return SHORT_CODE_MAP[target]
  const fullName = FALLBACK_NAME_MAP[target]
  if (fullName && SHORT_CODE_MAP[fullName]) return SHORT_CODE_MAP[fullName]

  const words = (fullName || target).trim().split(/\s+/)
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return (fullName || target).slice(0, 3).toUpperCase()
}

export function AnnouncementDetailPage({
  announcementId,
  onBack,
}: AnnouncementDetailPageProps) {
  const { data: announcement, isLoading, isError, error } = useAnnouncementDetails(announcementId)

  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [downloadingFileId, setDownloadingFileId] = useState<number | null>(null)

  // Default selected file to generated PDF or first file
  useEffect(() => {
    if (announcement && announcement.files && announcement.files.length > 0) {
      const defaultPdf = announcement.files.find((f) => f.is_generated_pdf) || announcement.files[0]
      setSelectedFile(defaultPdf)
    }
  }, [announcement])

  // Fetch file blob URL when selected file changes
  useEffect(() => {
    if (!selectedFile) {
      setPreviewBlobUrl(null)
      return
    }

    let active = true
    let currentUrl: string | null = null
    setIsLoadingPreview(true)
    setPreviewError(null)

    const loadBlob = async () => {
      try {
        const downloadEndpoint = apiClient.getFileDownloadUrl(
          selectedFile.announcement_id,
          selectedFile.id
        )
        const response = await fetch(downloadEndpoint, {
          headers: {
            "X-User-Id": apiClient.getCurrentUser(),
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to load file preview (${response.status})`)
        }

        const blob = await response.blob()
        if (active) {
          currentUrl = URL.createObjectURL(blob)
          setPreviewBlobUrl(currentUrl)
        }
      } catch (err: unknown) {
        if (active) {
          const msg = err instanceof Error ? err.message : "Error loading file preview"
          setPreviewError(msg)
          setPreviewBlobUrl(null)
        }
      } finally {
        if (active) {
          setIsLoadingPreview(false)
        }
      }
    }

    loadBlob()

    return () => {
      active = false
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl)
      }
    }
  }, [selectedFile])

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileIcon = (fileName: string, isPdf: boolean) => {
    if (isPdf) return <FileText className="w-4 h-4 text-primary shrink-0" />
    const lower = fileName.toLowerCase()
    if (lower.endsWith(".xlsx") || lower.endsWith(".xls") || lower.endsWith(".csv")) {
      return <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
    }
    if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".webp")) {
      return <FileImage className="w-4 h-4 text-purple-600 shrink-0" />
    }
    return <File className="w-4 h-4 text-muted-foreground shrink-0" />
  }

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

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3 text-muted-foreground">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
        <p className="text-sm">Loading announcement details...</p>
      </div>
    )
  }

  if (isError || !announcement) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-foreground">Access Restricted</h3>
        <p className="text-xs text-muted-foreground">
          {error instanceof Error ? error.message : "You do not have permission to view this notice."}
        </p>
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Announcements
        </Button>
      </div>
    )
  }

  const dateObj = new Date(announcement.created_at)
  const formattedDate = dateObj.toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
  const formattedTime = dateObj.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })
  const noticeType = announcement.template_name || "Official Directive"

  const authorInitials = (announcement.author_name || "M")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const isPdf = selectedFile?.is_generated_pdf || selectedFile?.file_name.toLowerCase().endsWith(".pdf")
  const isImage =
    selectedFile?.file_name.toLowerCase().endsWith(".png") ||
    selectedFile?.file_name.toLowerCase().endsWith(".jpg") ||
    selectedFile?.file_name.toLowerCase().endsWith(".jpeg") ||
    selectedFile?.file_name.toLowerCase().endsWith(".webp")

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-5xl mx-auto">
      {/* Top Back Navigation */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-xs h-8 -ml-2 gap-1.5 hover:bg-muted cursor-pointer text-muted-foreground hover:text-foreground font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Announcements
        </Button>
      </div>

      {/* Modern Executive Header */}
      <div className="space-y-3.5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {announcement.title}
        </h1>

        {/* Polished Metadata Bar */}
        <div className="flex flex-wrap items-center gap-y-2.5 gap-x-4 text-xs text-muted-foreground">
          {/* Directive Type Pill */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/15">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {noticeType}
          </span>

          <span className="text-border hidden sm:inline">•</span>

          {/* Author with Avatar */}
          <div className="flex items-center gap-1.5 text-foreground">
            <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-[10px] shrink-0">
              {authorInitials}
            </div>
            <span className="font-medium">{announcement.author_name}</span>
          </div>

          <span className="text-border hidden sm:inline">•</span>

          {/* Date & Time */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
            <span className="text-muted-foreground/60">at</span>
            <span>{formattedTime}</span>
          </div>

          <span className="text-border hidden sm:inline">•</span>

          {/* Target Audience / Recipients */}
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Target:</span>
            <div className="flex items-center gap-1">
              {announcement.target_summary.map((t, idx) => (
                <span
                  key={idx}
                  title={FALLBACK_NAME_MAP[t] || t}
                  className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-muted text-foreground text-[10px] font-medium leading-none"
                >
                  {getShortRecipient(t)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Official Message Section */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-border/60 pb-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 text-foreground font-semibold">
            <FileText className="w-4 h-4 text-primary" />
            <span>Official Notice Message</span>
          </div>
          <span className="text-[11px] text-muted-foreground">Internal Memorandum</span>
        </div>
        <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground font-normal pt-1">
          {announcement.message_content}
        </div>
      </div>

      {/* Unified Document Workspace & Preview */}
      {announcement.files.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          {/* File Tabs & Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border bg-muted/40 px-3 py-2 gap-2">
            {/* Scrollable File Selector Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
              {announcement.files.map((file) => {
                const isSelected = selectedFile?.id === file.id
                return (
                  <button
                    key={file.id}
                    onClick={() => setSelectedFile(file)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? "bg-background text-foreground shadow-xs border border-border"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent"
                    }`}
                  >
                    {getFileIcon(file.file_name, file.is_generated_pdf)}
                    <span className="truncate max-w-[150px] sm:max-w-[200px]">{file.file_name}</span>
                    <span className="text-[10px] text-muted-foreground font-normal">
                      {formatFileSize(file.file_size)}
                    </span>
                    {file.is_generated_pdf && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                        Official
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Download Action Button */}
            {selectedFile && (
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadFile(selectedFile)}
                  disabled={downloadingFileId === selectedFile.id}
                  className="h-8 text-xs gap-1.5 cursor-pointer shadow-xs font-medium"
                >
                  {downloadingFileId === selectedFile.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  Download {selectedFile.file_name}
                </Button>
              </div>
            )}
          </div>

          {/* Active File Preview Pane */}
          <div className="p-3 bg-background">
            {isLoadingPreview ? (
              <div className="py-24 flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-xs">Preparing document preview...</p>
              </div>
            ) : previewError ? (
              <div className="py-20 text-center space-y-3">
                <AlertCircle className="w-7 h-7 text-destructive mx-auto" />
                <p className="text-xs text-muted-foreground">{previewError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5"
                  onClick={() => selectedFile && handleDownloadFile(selectedFile)}
                >
                  <Download className="w-3.5 h-3.5" /> Download File Directly
                </Button>
              </div>
            ) : previewBlobUrl && isPdf ? (
              <div className="w-full rounded-lg overflow-hidden border border-border shadow-xs">
                <iframe
                  src={`${previewBlobUrl}#toolbar=0`}
                  title={selectedFile?.file_name}
                  className="w-full h-[720px] rounded-lg border-0 bg-white"
                />
              </div>
            ) : previewBlobUrl && isImage ? (
              <div className="p-6 flex items-center justify-center min-h-[400px] max-h-[650px] bg-muted/20 rounded-lg border border-border">
                <img
                  src={previewBlobUrl}
                  alt={selectedFile?.file_name}
                  className="max-h-[600px] max-w-full rounded shadow-sm object-contain"
                />
              </div>
            ) : (
              <div className="py-20 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                  {selectedFile && getFileIcon(selectedFile.file_name, false)}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{selectedFile?.file_name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Preview is not available directly in browser for this file type ({selectedFile ? formatFileSize(selectedFile.file_size) : ""}).
                  </p>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  className="text-xs gap-1.5 font-medium"
                  onClick={() => selectedFile && handleDownloadFile(selectedFile)}
                >
                  <Download className="w-3.5 h-3.5" /> Download {selectedFile?.file_name}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
