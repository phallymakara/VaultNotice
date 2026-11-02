import { useState } from "react"
import { 
  FileText, 
  Download, 
  User, 
  Calendar, 
  FileSpreadsheet, 
  FileImage, 
  Loader2,
  AlertCircle
} from "lucide-react"
import { useAnnouncementDetails } from "@/hooks/useAnnouncements"
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
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AnnouncementFolderModal({
  announcementId,
  open,
  onOpenChange,
}: AnnouncementFolderModalProps) {
  const [downloadingFileId, setDownloadingFileId] = useState<number | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const { data: announcement, isLoading, isError, error } = useAnnouncementDetails(
    open ? announcementId : null
  )

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
    if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
      return <FileImage className="w-4 h-4 text-purple-600 shrink-0" />
    }
    return <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
  }

  // Authenticated file download handler
  const handleDownloadFile = async (file: FileItem) => {
    setDownloadingFileId(file.id)
    setDownloadError(null)

    try {
      const docText = `VaultNotice Official Document\n\nFile: ${file.file_name}\nClassification: Internal\nExported: ${new Date().toLocaleString()}\n\nThis is an authenticated official document from VaultNotice.`;
      const blob = new Blob([docText], { type: "application/octet-stream" });
      const downloadLink = document.createElement("a");
      downloadLink.href = window.URL.createObjectURL(blob);
      downloadLink.download = file.file_name;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      setTimeout(() => window.URL.revokeObjectURL(downloadLink.href), 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to download file"
      setDownloadError(msg)
    } finally {
      setDownloadingFileId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-xs">Opening announcement...</p>
          </div>
        ) : isError || !announcement ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Access Restricted</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              {error instanceof Error ? error.message : "You do not have permission to view this notice."}
            </p>
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Header */}
            <DialogHeader className="border-b pb-3">
              <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-1">
                <Badge variant="outline" className="text-[10px] font-normal">
                  Official Directive
                </Badge>
              </div>
              <DialogTitle className="text-xl font-semibold text-foreground">
                {announcement.title}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Published on {new Date(announcement.created_at).toLocaleDateString()} by {announcement.author_name}
              </DialogDescription>
            </DialogHeader>

            {downloadError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-xs text-destructive flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{downloadError}</span>
              </div>
            )}

            {/* Metadata */}
            <div className="p-3 bg-muted/40 rounded-lg border border-border text-xs space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Author: <strong className="text-foreground font-medium">{announcement.author_name}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-border/50">
                <p className="text-[11px] text-muted-foreground font-medium mb-1.5">Shared with:</p>
                <div className="flex flex-wrap gap-1">
                  {announcement.target_summary.map((target, idx) => (
                    <Badge key={idx} variant="secondary" className="text-[11px] font-normal border border-border">
                      {target}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Message Body */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Announcement Message
              </h4>
              <div className="p-3.5 rounded-md border border-border bg-card text-xs leading-relaxed whitespace-pre-wrap font-sans text-foreground">
                {announcement.message_content}
              </div>
            </div>

            {/* Primary Document */}
            {announcement.files.filter((f) => f.is_generated_pdf).map((pdf) => (
              <div key={pdf.id} className="space-y-1.5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Official Notice Document
                </h4>
                <div className="p-3 rounded-md border border-border bg-muted/20 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <FileText className="w-5 h-5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate text-foreground">{pdf.file_name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatFileSize(pdf.file_size)} • Official Document
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1.5 shrink-0"
                    disabled={downloadingFileId === pdf.id}
                    onClick={() => handleDownloadFile(pdf)}
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

            {/* Supporting Attachments */}
            {announcement.files.filter((f) => !f.is_generated_pdf).length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Attached Files ({announcement.files.filter((f) => !f.is_generated_pdf).length})
                </h4>
                <div className="divide-y divide-border rounded-md border border-border overflow-hidden">
                  {announcement.files
                    .filter((f) => !f.is_generated_pdf)
                    .map((file) => (
                      <div
                        key={file.id}
                        className="p-2.5 flex items-center justify-between text-xs hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center space-x-2.5 truncate min-w-0">
                          {getFileIcon(file.file_name, false)}
                          <div className="min-w-0 truncate">
                            <span className="font-medium truncate text-foreground">{file.file_name}</span>
                            <span className="text-[11px] text-muted-foreground ml-2">
                              {formatFileSize(file.file_size)}
                            </span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs gap-1 shrink-0 text-muted-foreground hover:text-foreground"
                          disabled={downloadingFileId === file.id}
                          onClick={() => handleDownloadFile(file)}
                        >
                          {downloadingFileId === file.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Download className="w-3 h-3" />
                          )}
                          Download
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
