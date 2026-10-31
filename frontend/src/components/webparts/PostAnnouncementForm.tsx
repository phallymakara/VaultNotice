import { useState, useRef } from "react"
import { 
  Send, 
  Paperclip, 
  X, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  FileCheck,
  ShieldAlert,
  Loader2,
  Sparkles
} from "lucide-react"
import { useTemplates } from "@/hooks/useTemplates"
import { usePostAnnouncement } from "@/hooks/useAnnouncements"
import { RecipientTarget } from "@/types/api"
import { PeopleGroupPicker } from "./PeopleGroupPicker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"

export function PostAnnouncementForm() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [recipients, setRecipients] = useState<RecipientTarget[]>([])
  const [attachments, setAttachments] = useState<File[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: templates, isLoading: isLoadingTemplates } = useTemplates()
  const postMutation = usePostAnnouncement()

  // Handle template selection auto-fill
  const handleTemplateChange = (templateIdStr: string) => {
    setSelectedTemplateId(templateIdStr)
    setErrorMessage(null)

    if (!templateIdStr || templateIdStr === "blank") {
      setTitle("")
      setMessage("")
      return
    }

    const tId = parseInt(templateIdStr, 10)
    const t = templates?.find((item) => item.id === tId)
    if (t) {
      setTitle(t.title_template)
      setMessage(t.content_template)
    }
  }

  // Handle file additions
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setAttachments((prev) => [...prev, ...newFiles])
    }
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleRemoveFile = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Pre-submit validation
  const handleInitiateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!title.trim()) {
      setErrorMessage("Please enter an announcement title.")
      return
    }
    if (!message.trim()) {
      setErrorMessage("Please enter the announcement message content.")
      return
    }
    if (recipients.length === 0) {
      setErrorMessage("Please select at least one recipient user or group.")
      return
    }

    // Open confirmation modal
    setIsConfirmOpen(true)
  }

  // Execute post submission
  const handleConfirmSubmit = async () => {
    setIsConfirmOpen(false)
    setErrorMessage(null)

    const formData = new FormData()
    formData.append("title", title.trim())
    formData.append("message_content", message.trim())
    formData.append("recipients", JSON.stringify(recipients))
    if (selectedTemplateId && selectedTemplateId !== "blank") {
      formData.append("template_id", selectedTemplateId)
    }

    attachments.forEach((file) => {
      formData.append("files", file)
    })

    try {
      const result = await postMutation.mutateAsync(formData)
      setSuccessMessage(
        `Announcement posted successfully! Dedicated folder "${result.folder_name}" created with Read access for designated recipients.`
      )
      // Reset form
      setTitle("")
      setMessage("")
      setSelectedTemplateId("")
      setRecipients([])
      setAttachments([])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to post announcement"
      setErrorMessage(msg)
    }
  }

  return (
    <Card className="border-slate-200 shadow-sm bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">Post Management Announcement</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Author executive directives and publish to targeted Microsoft 365 users and security groups.
              </CardDescription>
            </div>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" /> Executive Composer
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleInitiateSubmit} className="space-y-4">
          {/* Status Banners */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800 flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Row 1: Template Selection */}
          <div className="space-y-1.5">
            <label htmlFor="template-select" className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Announcement Template</span>
              <span className="text-slate-400 font-normal">Pre-populates subject and message</span>
            </label>
            <select
              id="template-select"
              value={selectedTemplateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              disabled={postMutation.isPending || isLoadingTemplates}
              className="w-full h-9 px-3 text-xs rounded-md border border-input bg-background shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">-- Choose a template or start from scratch --</option>
              <option value="blank">Blank Announcement (No template)</option>
              {templates?.map((t) => (
                <option key={t.id} value={t.id.toString()}>
                  [{t.category}] {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Row 2: Title */}
          <div className="space-y-1.5">
            <label htmlFor="announcement-title" className="text-xs font-semibold text-slate-700">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              id="announcement-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={postMutation.isPending}
              placeholder="e.g. Q4 Executive Branch Operations Directive"
              className="h-9 text-xs"
            />
          </div>

          {/* Row 3: Recipient People & Group Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Target Recipients (Users & Groups) <span className="text-red-500">*</span></span>
              <span className="text-slate-400 font-normal">Permissions granted exclusively to selected targets</span>
            </label>
            <PeopleGroupPicker
              selectedRecipients={recipients}
              onChange={setRecipients}
              disabled={postMutation.isPending}
            />
          </div>

          {/* Row 4: Message Content (Rich/Markdown) */}
          <div className="space-y-1.5">
            <label htmlFor="message-content" className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Announcement Message <span className="text-red-500">*</span></span>
              <span className="text-slate-400 font-normal">Supports markdown headers, bullets and bold text</span>
            </label>
            <Textarea
              id="message-content"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={postMutation.isPending}
              rows={6}
              placeholder="Write the executive announcement message details here..."
              className="text-xs font-mono"
            />
          </div>

          {/* Row 5: Multi-Document Attachment Control */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Attach Confidential Documents</span>
              <span className="text-slate-400 font-normal">Stored in the folder, not sent over email</span>
            </label>

            {/* Dropzone / Upload Trigger */}
            <div className="border border-dashed border-slate-300 rounded-lg p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <Paperclip className="w-4 h-4 text-slate-400" />
                <span>Upload circulars, policies, spreadsheets, or forms (PDF, DOCX, XLSX, PNG)</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={postMutation.isPending}
                className="h-7 text-xs bg-white"
              >
                Browse Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.docx,.xlsx,.doc,.xls,.png,.jpg,.jpeg"
              />
            </div>

            {/* Attached Files List */}
            {attachments.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {attachments.map((file, idx) => (
                  <div
                    key={`${file.name}-${idx}`}
                    className="flex items-center justify-between px-3 py-1.5 rounded-md bg-white border border-slate-200 text-xs shadow-2xs"
                  >
                    <div className="flex items-center space-x-2 overflow-hidden">
                      <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-medium text-slate-800 truncate">{file.name}</span>
                      <span className="text-slate-400 text-[11px] shrink-0">({formatFileSize(file.size)})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      disabled={postMutation.isPending}
                      className="text-slate-400 hover:text-red-600 p-1 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span className="sr-only">Remove file</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end">
            <Button
              type="submit"
              disabled={postMutation.isPending}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-5 shadow-sm"
            >
              {postMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Processing & Securing Folder...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Post Announcement
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>

      {/* Pre-submission Confirmation Modal */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mb-2">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <DialogTitle className="text-base font-bold text-slate-900">Confirm Announcement Publication</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Please review the publication summary before dispatching notifications.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
              <div>
                <span className="font-semibold text-slate-500 block">Title:</span>
                <span className="font-bold text-slate-900 text-sm">{title}</span>
              </div>

              <div>
                <span className="font-semibold text-slate-500 block">Designated Recipients:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {recipients.map((r) => (
                    <span
                      key={r.id}
                      className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[11px] font-medium text-slate-800"
                    >
                      {r.name} ({r.type})
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-1 border-t border-slate-200/60 text-slate-600">
                <span>Attachments Included:</span>
                <span className="font-bold text-slate-900">{attachments.length} document(s)</span>
              </div>
            </div>

            <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
              <strong>Security Protocol:</strong> A dedicated folder will be generated. The announcement will be converted to PDF and saved alongside all attachments. Non-selected staff will have <strong>No Access</strong> to this folder or its files.
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsConfirmOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5"
            >
              <FileCheck className="w-3.5 h-3.5" /> Confirm & Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
