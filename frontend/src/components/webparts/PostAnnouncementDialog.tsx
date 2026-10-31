import { useState, useRef } from "react"
import { 
  X, 
  FileText, 
  AlertCircle, 
  UploadCloud,
  Loader2,
  Plus
} from "lucide-react"
import { useTemplates } from "@/hooks/useTemplates"
import { usePostAnnouncement } from "@/hooks/useAnnouncements"
import { RecipientTarget } from "@/types/api"
import { PeopleGroupPicker } from "./PeopleGroupPicker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PostAnnouncementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PostAnnouncementDialog({
  open,
  onOpenChange,
}: PostAnnouncementDialogProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("blank")
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [recipients, setRecipients] = useState<RecipientTarget[]>([])
  const [attachments, setAttachments] = useState<File[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

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
      await postMutation.mutateAsync(formData)
      // Reset form and close dialog
      setTitle("")
      setMessage("")
      setSelectedTemplateId("blank")
      setRecipients([])
      setAttachments([])
      onOpenChange(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to post announcement"
      setErrorMessage(msg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Create Announcement</DialogTitle>
          <DialogDescription>
            Compose and publish an official announcement. Notices and attached files are accessible only to your selected recipients.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {errorMessage && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-xs text-destructive flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Template Selection */}
          <div className="space-y-1.5">
            <Label htmlFor="template-select" className="text-xs">
              Template
            </Label>
            <Select
              value={selectedTemplateId}
              onValueChange={handleTemplateChange}
              disabled={postMutation.isPending || isLoadingTemplates}
            >
              <SelectTrigger id="template-select" className="h-9 text-xs">
                <SelectValue placeholder="Choose a template or start blank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blank">Blank Announcement (No template)</SelectItem>
                {templates?.map((t) => (
                  <SelectItem key={t.id} value={t.id.toString()}>
                    [{t.category}] {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="announcement-title" className="text-xs">
              Subject / Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="announcement-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={postMutation.isPending}
              placeholder="e.g. Q4 Executive Branch Operations Directive"
              className="h-9 text-xs"
            />
          </div>

          {/* Recipient People & Group Picker */}
          <div className="space-y-1.5">
            <Label className="text-xs">
              Target Audience <span className="text-destructive">*</span>
            </Label>
            <PeopleGroupPicker
              selectedRecipients={recipients}
              onChange={setRecipients}
              disabled={postMutation.isPending}
            />
          </div>

          {/* Message Content */}
          <div className="space-y-1.5">
            <Label htmlFor="message-content" className="text-xs">
              Message Content <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="message-content"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={postMutation.isPending}
              rows={5}
              placeholder="Write the announcement message and details here..."
              className="text-xs font-sans leading-relaxed resize-y"
            />
          </div>

          {/* Attachments Dropzone */}
          <div className="space-y-2">
            <Label className="text-xs">
              Attached Documents
            </Label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-border rounded-lg p-5 text-center hover:bg-muted/40 transition-colors cursor-pointer flex flex-col items-center justify-center gap-1.5"
            >
              <UploadCloud className="w-5 h-5 text-muted-foreground" />
              <p className="text-xs font-medium text-foreground">
                Click to browse files or drag and drop
              </p>
              <p className="text-[11px] text-muted-foreground">
                Supported formats: PDF, Word, Excel, Images (Max 25MB each)
              </p>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {attachments.map((file, idx) => (
                  <div
                    key={`${file.name}-${idx}`}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/50 border border-border text-xs"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate font-medium">{file.name}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveFile(idx)}
                    >
                      <X className="w-3.5 h-3.5" />
                      <span className="sr-only">Remove file</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={postMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={postMutation.isPending}
              className="gap-1.5"
            >
              {postMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Publishing...
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" /> Publish Announcement
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
