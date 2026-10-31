import { useState } from "react"
import { 
  Folder, 
  FileText, 
  Download, 
  User, 
  Calendar, 
  Users, 
  ShieldCheck, 
  FileSpreadsheet, 
  FileImage, 
  Loader2,
  FileCheck2,
  AlertCircle
} from "lucide-react"
import { useAnnouncementDetails } from "@/hooks/useAnnouncements"
import { apiClient } from "@/services/apiClient"
import { FileItem } from "@/types/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"

interface AnnouncementFolderModalProps {
  announcementId: number | null
  isOpen: boolean
  onClose: () => void
}

export function AnnouncementFolderModal({
  announcementId,
  isOpen,
  onClose,
}: AnnouncementFolderModalProps) {
  const [downloadingFileId, setDownloadingFileId] = useState<number | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const { data: announcement, isLoading, isError, error } = useAnnouncementDetails(
    isOpen ? announcementId : null
  )

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileIcon = (fileName: string, isPdf: boolean) => {
    if (isPdf) return <FileText className="w-5 h-5 text-red-600" />
    const lower = fileName.toLowerCase()
    if (lower.endsWith(".xlsx") || lower.endsWith(".xls") || lower.endsWith(".csv")) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
    }
    if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
      return <FileImage className="w-5 h-5 text-purple-600" />
    }
    return <FileText className="w-5 h-5 text-blue-600" />
  }

  // Authenticated file download handler ensuring X-User-Id is passed
  const handleDownloadFile = async (file: FileItem) => {
    setDownloadingFileId(file.id)
    setDownloadError(null)

    try {
      const url = apiClient.getFileDownloadUrl(file.announcement_id, file.id)
      const res = await fetch(url, {
        headers: {
          "X-User-Id": apiClient.getCurrentUser(),
        },
      })

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("Access Denied: You do not have permission to download this file.")
        }
        throw new Error(`Download failed with status ${res.status}`)
      }

      const blob = await res.blob()
      const downloadLink = document.createElement("a")
      downloadLink.href = window.URL.createObjectURL(blob)
      downloadLink.download = file.file_name
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to download file"
      setDownloadError(msg)
    } finally {
      setDownloadingFileId(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-xs text-slate-500">Opening secure announcement folder...</p>
          </div>
        ) : isError || !announcement ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Unable to Open Folder</h3>
            <p className="text-xs text-red-600 max-w-md mx-auto">
              {error instanceof Error ? error.message : "You do not have permission to view this folder."}
            </p>
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Folder Header */}
            <DialogHeader className="border-b pb-4">
              <div className="flex items-center space-x-2 text-xs text-blue-600 font-semibold mb-1">
                <Folder className="w-4 h-4" />
                <span>ANNOUNCEMENT FOLDER</span>
                <span className="text-slate-300">•</span>
                <span className="font-mono text-slate-500">{announcement.folder_name}</span>
              </div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                {announcement.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Created on {new Date(announcement.created_at).toLocaleString()}
              </DialogDescription>
            </DialogHeader>

            {downloadError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{downloadError}</span>
              </div>
            )}

            {/* Folder Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <div className="flex items-center space-x-2 text-slate-700">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  <strong className="text-slate-900">Author:</strong> {announcement.author_name}
                </span>
              </div>

              <div className="flex items-center space-x-2 text-slate-700">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  <strong className="text-slate-900">Date Posted:</strong>{" "}
                  {new Date(announcement.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="sm:col-span-2 flex items-start space-x-2 text-slate-700 pt-1 border-t border-slate-200/60">
                <Users className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block mb-1">Shared With (Designated Recipients):</strong>
                  <div className="flex flex-wrap gap-1.5">
                    {announcement.target_summary.map((target, idx) => (
                      <span
                        key={idx}
                        className="bg-white border border-slate-200 text-slate-800 text-[11px] px-2 py-0.5 rounded font-medium shadow-2xs"
                      >
                        {target}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Announcement Message Body */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Announcement Message
              </h4>
              <div className="p-4 rounded-lg border border-slate-200 bg-white text-xs leading-relaxed whitespace-pre-wrap font-sans text-slate-800">
                {announcement.message_content}
              </div>
            </div>

            {/* Section 1: Generated Announcement PDF */}
            {announcement.files.filter((f) => f.is_generated_pdf).map((pdf) => (
              <div key={pdf.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-blue-600" /> Primary Document (Generated PDF)
                  </h4>
                  <Badge variant="success" className="text-[10px]">
                    <ShieldCheck className="w-3 h-3 mr-1" /> System Generated
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-blue-50/50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-lg bg-red-100 text-red-700">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{pdf.file_name}</div>
                      <div className="text-xs text-slate-500">
                        Official Executive Circular • {formatFileSize(pdf.file_size)}
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleDownloadFile(pdf)}
                    disabled={downloadingFileId === pdf.id}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 shrink-0"
                  >
                    {downloadingFileId === pdf.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    Download PDF
                  </Button>
                </div>
              </div>
            ))}

            {/* Section 2: Attached Documents */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Attached Documents ({announcement.files.filter((f) => !f.is_generated_pdf).length})
              </h4>

              {announcement.files.filter((f) => !f.is_generated_pdf).length === 0 ? (
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 text-center text-xs text-slate-500">
                  No additional document attachments uploaded for this announcement.
                </div>
              ) : (
                <div className="space-y-2">
                  {announcement.files
                    .filter((f) => !f.is_generated_pdf)
                    .map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors shadow-2xs"
                      >
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <div className="p-2 rounded bg-slate-100 shrink-0">
                            {getFileIcon(file.file_name, false)}
                          </div>
                          <div className="overflow-hidden">
                            <div className="font-semibold text-slate-900 text-xs truncate">
                              {file.file_name}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {formatFileSize(file.file_size)} • {file.mime_type}
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadFile(file)}
                          disabled={downloadingFileId === file.id}
                          className="h-8 text-xs gap-1.5 text-slate-700 shrink-0 ml-4"
                        >
                          {downloadingFileId === file.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5 text-slate-500" />
                          )}
                          Download
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
                Close Folder
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

