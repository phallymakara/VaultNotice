import { useState, useRef, useEffect } from "react"
import {
  Megaphone,
  ChevronDown,
  X,
  Plus,
  Link2,
  Code,
  List,
  ListOrdered,
  AlignLeft,
  MoreHorizontal,
  Loader2,
  Check,
  Users,
  User,
} from "lucide-react"
import { usePostAnnouncement } from "@/hooks/useAnnouncements"
import { useTemplates } from "@/hooks/useTemplates"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface RecipientItem {
  id: string
  name: string
  type: "GROUP" | "USER"
  department?: string
  role?: string
}

interface AttachedDoc {
  id: string
  name: string
  type: "pdf" | "excel" | "generic"
  file?: File
}

const AVAILABLE_GROUPS: RecipientItem[] = [
  { id: "grp-all-staff", name: "All Staff", type: "GROUP", department: "Organization Wide" },
  { id: "grp-branch-managers", name: "All Branch Managers", type: "GROUP", department: "Branch Network" },
  { id: "grp-management", name: "Management", type: "GROUP", department: "Executive Leadership" },
  { id: "grp-finance", name: "Finance Department", type: "GROUP", department: "Finance & Accounting" },
  { id: "grp-operations", name: "Operations Team", type: "GROUP", department: "Frontline Operations" },
  { id: "grp-hr", name: "Human Resources Department", type: "GROUP", department: "People & Talent" },
  { id: "grp-it", name: "IT & Cybersecurity", type: "GROUP", department: "Technology & Security" },
  { id: "grp-compliance", name: "Compliance & Legal", type: "GROUP", department: "Governance & AML" },
  { id: "grp-credit", name: "Credit & Lending", type: "GROUP", department: "Credit & Risk" },
  { id: "grp-audit", name: "Internal Audit", type: "GROUP", department: "Audit & Assurance" },
  { id: "grp-marketing", name: "Marketing & Communications", type: "GROUP", department: "Brand & PR" },
]

const AVAILABLE_USERS: RecipientItem[] = [
  { id: "user-emily", name: "Emily Tan", type: "USER", role: "Staff", department: "Finance & Accounting" },
  { id: "user-alex", name: "Alex Vorn", type: "USER", role: "Staff", department: "Customer Service" },
  { id: "user-sokha", name: "Sokha Chan", type: "USER", role: "Staff", department: "Human Resources" },
  { id: "user-dara", name: "Dara Pich", type: "USER", role: "Staff", department: "Credit & Lending" },
  { id: "user-bopha", name: "Bopha Meng", type: "USER", role: "Staff", department: "Compliance & Legal" },
  { id: "user-vichea", name: "Vichea Chea", type: "USER", role: "Staff", department: "IT Infrastructure" },
  { id: "user-kalyan", name: "Kalyan Roeun", type: "USER", role: "Staff", department: "Marketing & Communications" },
  { id: "user-rithy", name: "Rithy Sen", type: "USER", role: "Staff", department: "Internal Audit" },
  { id: "user-sovann", name: "Sovann Kong", type: "USER", role: "Staff", department: "Operations Team" },
  { id: "user-david", name: "David Miller", type: "USER", role: "Branch Manager", department: "Battambang Branch" },
  { id: "user-sreyneath", name: "Sreyneath Keo", type: "USER", role: "Branch Manager", department: "Siem Reap Branch" },
  { id: "user-sarah", name: "Sarah Lin", type: "USER", role: "Management", department: "Executive Office" },
]

export interface PostAnnouncementCardProps {
  onSuccess?: (id: number) => void
  onClose?: () => void
  showCloseButton?: boolean
  className?: string
}

export function PostAnnouncementCard({
  onSuccess,
  onClose,
  showCloseButton = false,
  className = "",
}: PostAnnouncementCardProps) {
  const { data: templates } = useTemplates()
  const postMutation = usePostAnnouncement()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Dropdown menus state & refs
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false)
  const [isRecipientMenuOpen, setIsRecipientMenuOpen] = useState(false)
  const [recipientSearch, setRecipientSearch] = useState("")
  const templateMenuRef = useRef<HTMLDivElement>(null)
  const recipientMenuRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const filteredGroups = AVAILABLE_GROUPS.filter((g) => {
    if (!recipientSearch.trim()) return true
    const q = recipientSearch.toLowerCase()
    return (
      g.name.toLowerCase().includes(q) ||
      (g.department && g.department.toLowerCase().includes(q))
    )
  })

  const filteredUsers = AVAILABLE_USERS.filter((u) => {
    if (!recipientSearch.trim()) return true
    const q = recipientSearch.toLowerCase()
    return (
      u.name.toLowerCase().includes(q) ||
      (u.department && u.department.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q))
    )
  })

  // Pre-loaded state matching Image 1
  const [selectedTemplateName, setSelectedTemplateName] = useState("Holiday notice")
  const [title, setTitle] = useState("Holiday Schedule Q4")
  const [content, setContent] = useState(
    "Dear colleagues,\n\nPlease find attached the public holiday schedule for October to December 2026 and the branch opening arrangements."
  )
  const [recipients, setRecipients] = useState<RecipientItem[]>([
    { id: "grp-all-staff", name: "All Staff", type: "GROUP" },
    { id: "grp-branch-managers", name: "Branch Managers", type: "GROUP" },
  ])
  const [attachedDocs, setAttachedDocs] = useState<AttachedDoc[]>([
    { id: "doc-1", name: "Holiday Calendar Q4 2026.pdf", type: "pdf" },
    { id: "doc-2", name: "Branch Opening Hours.xlsx", type: "excel" },
  ])

  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Close menus on outside click within document
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (
        templateMenuRef.current &&
        !templateMenuRef.current.contains(e.target as Node)
      ) {
        setIsTemplateMenuOpen(false)
      }
      if (
        recipientMenuRef.current &&
        !recipientMenuRef.current.contains(e.target as Node)
      ) {
        setIsRecipientMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleDocumentClick)
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick)
    }
  }, [])

  // Handle template selection
  const handleSelectTemplate = (templateName: string) => {
    setSelectedTemplateName(templateName)
    setErrorMessage(null)

    if (templateName === "Holiday notice") {
      setTitle("Holiday Schedule Q4")
      setContent(
        "Dear colleagues,\n\nPlease find attached the public holiday schedule for October to December 2026 and the branch opening arrangements."
      )
      setRecipients([
        { id: "grp-all-staff", name: "All Staff", type: "GROUP" },
        { id: "grp-branch-managers", name: "Branch Managers", type: "GROUP" },
      ])
      setAttachedDocs([
        { id: "doc-1", name: "Holiday Calendar Q4 2026.pdf", type: "pdf" },
        { id: "doc-2", name: "Branch Opening Hours.xlsx", type: "excel" },
      ])
    } else if (templateName === "Blank Announcement") {
      setTitle("")
      setContent("")
      setAttachedDocs([])
    } else {
      const match = templates?.find((t) => t.name === templateName)
      if (match) {
        setTitle(match.title_template)
        setContent(match.content_template)
      }
    }
  }

  // Insert formatting into textarea
  const insertFormatting = (prefix: string, suffix: string = "") => {
    if (!textareaRef.current) return
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const replacement = `${prefix}${selectedText || "text"}${suffix}`
    const newContent = content.substring(0, start) + replacement + content.substring(end)
    setContent(newContent)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText.length || 4))
    }, 0)
  }

  const handleRemoveRecipient = (id: string) => {
    setRecipients((prev) => prev.filter((r) => r.id !== id))
  }

  const handleAddRecipient = (item: RecipientItem) => {
    if (!recipients.some((r) => r.id === item.id)) {
      setRecipients((prev) => [...prev, item])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    const newDocs: AttachedDoc[] = files.map((f, idx) => {
      const ext = f.name.split(".").pop()?.toLowerCase()
      let type: "pdf" | "excel" | "generic" = "generic"
      if (ext === "pdf") type = "pdf"
      else if (ext === "xls" || ext === "xlsx") type = "excel"

      return {
        id: `upload-${Date.now()}-${idx}`,
        name: f.name,
        type,
        file: f,
      }
    })
    setAttachedDocs((prev) => [...prev, ...newDocs])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleRemoveDoc = (id: string) => {
    setAttachedDocs((prev) => prev.filter((d) => d.id !== id))
  }

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!title.trim()) {
      setErrorMessage("Please enter an announcement title.")
      return
    }
    if (!content.trim()) {
      setErrorMessage("Please enter announcement message content.")
      return
    }
    if (recipients.length === 0) {
      setErrorMessage("Please select at least one recipient group or person.")
      return
    }

    const formData = new FormData()
    formData.append("title", title.trim())
    formData.append("message_content", content.trim())
    formData.append("recipients", JSON.stringify(recipients))
    formData.append("confidentiality_level", "Internal")

    attachedDocs.forEach((doc) => {
      if (doc.file) {
        formData.append("files", doc.file)
      } else {
        const blob = new Blob([`VaultNotice content for ${doc.name}`], {
          type: doc.type === "pdf" ? "application/pdf" : "application/octet-stream",
        })
        const mockFile = new File([blob], doc.name, {
          type: doc.type === "pdf" ? "application/pdf" : "application/octet-stream",
        })
        formData.append("files", mockFile)
      }
    })

    try {
      const res = await postMutation.mutateAsync(formData)
      if (onClose) onClose()
      if (onSuccess && res?.id) {
        onSuccess(res.id)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to post announcement."
      setErrorMessage(msg)
    }
  }

  return (
    <div className={`rounded-xl border border-slate-200 bg-[#fbfbfa] overflow-hidden shadow-none w-full flex flex-col ${className}`}>
      {/* 1. Header: Dark Blue Banner with Megaphone Icon (Matching Image 1) */}
      <div className="bg-[#002d62] px-5 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="text-white shrink-0">
            <Megaphone className="w-5 h-5 text-white stroke-[2.2]" />
          </div>
          <h3 className="text-base font-bold text-white tracking-tight leading-tight">
            Post announcement
          </h3>
        </div>
        {showCloseButton && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1 rounded-sm cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. Form Body */}
      <form
        onSubmit={handleSubmit}
        className="p-4 sm:p-5 space-y-3.5 bg-[#fbfbfa] text-slate-800 overflow-y-auto max-h-[calc(92vh-60px)]"
      >
        {/* Template Field */}
        <div ref={templateMenuRef} className="relative space-y-1">
          <label className="text-xs font-semibold text-slate-800">Template</label>
          <button
            type="button"
            onClick={() => setIsTemplateMenuOpen((prev) => !prev)}
            className="w-full h-9 px-3 bg-white border border-slate-300 rounded-md text-xs font-medium text-slate-800 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left"
          >
            <span>{selectedTemplateName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          </button>
          {isTemplateMenuOpen && (
            <div className="absolute left-0 top-full mt-1 w-full bg-white border border-slate-300 rounded-md py-1 z-30 shadow-none">
              {[
                "Holiday notice",
                "Company Policy Update",
                "General Executive Circular",
                "Quarterly Townhall Agenda",
                "Blank Announcement",
              ].map((tplName) => (
                <button
                  key={tplName}
                  type="button"
                  onClick={() => {
                    handleSelectTemplate(tplName)
                    setIsTemplateMenuOpen(false)
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs hover:bg-slate-100 flex items-center justify-between cursor-pointer text-slate-800"
                >
                  <span>{tplName}</span>
                  {selectedTemplateName === tplName && (
                    <Check className="w-3.5 h-3.5 text-[#005fb8]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Title Field */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-800">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Holiday Schedule Q4"
            className="h-9 text-xs rounded-md border-slate-300 bg-white text-slate-900"
          />
        </div>

        {/* Message Content with Formatting Bar */}
        <div className="space-y-1">
          <div className="border border-slate-300 rounded-lg bg-white overflow-hidden">
            {/* Rich text toolbar */}
            <div className="flex items-center gap-1 px-2.5 py-1.5 border-b border-slate-200 bg-slate-50/60 text-slate-600 text-xs select-none flex-wrap">
              <button
                type="button"
                onClick={() => insertFormatting("**", "**")}
                title="Bold"
                className="w-6 h-6 rounded flex items-center justify-center font-bold text-slate-800 hover:bg-slate-200/70 cursor-pointer"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("*", "*")}
                title="Italic"
                className="w-6 h-6 rounded flex items-center justify-center italic font-serif text-slate-800 hover:bg-slate-200/70 cursor-pointer"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("<u>", "</u>")}
                title="Underline"
                className="w-6 h-6 rounded flex items-center justify-center underline text-slate-800 hover:bg-slate-200/70 cursor-pointer"
              >
                U
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("[", "](https://)")}
                title="Link"
                className="w-6 h-6 rounded flex items-center justify-center text-slate-700 hover:bg-slate-200/70 cursor-pointer"
              >
                <Link2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("`", "`")}
                title="Code"
                className="w-6 h-6 rounded flex items-center justify-center text-slate-700 hover:bg-slate-200/70 cursor-pointer"
              >
                <Code className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("\n- ")}
                title="Bullet List"
                className="w-6 h-6 rounded flex items-center justify-center text-slate-700 hover:bg-slate-200/70 cursor-pointer"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("\n1. ")}
                title="Numbered List"
                className="w-6 h-6 rounded flex items-center justify-center text-slate-700 hover:bg-slate-200/70 cursor-pointer"
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("\n> ")}
                title="Quote"
                className="w-6 h-6 rounded flex items-center justify-center text-slate-700 hover:bg-slate-200/70 cursor-pointer"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <span className="h-3.5 w-px bg-slate-300 mx-0.5" />
              <button
                type="button"
                title="More"
                className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:bg-slate-200/70 cursor-pointer"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter announcement text..."
              className="w-full p-3 text-xs leading-relaxed text-slate-800 bg-transparent resize-y border-none focus:outline-none focus:ring-0 font-sans"
            />
          </div>
        </div>

        {/* Recipients Section */}
        <div ref={recipientMenuRef} className="space-y-1.5">
          {/* Recipients Input Box: Navy blue pills with cross and inline search input / toggle button */}
          <div
            onClick={() => {
              setIsRecipientMenuOpen(true)
              searchInputRef.current?.focus()
            }}
            className="border border-slate-300 rounded-lg bg-white p-2 min-h-[42px] flex items-center gap-2 flex-wrap cursor-text"
          >
            {recipients.map((r) => (
              <span
                key={r.id}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#004e9a] text-white select-none"
              >
                <span>{r.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveRecipient(r.id)
                  }}
                  className="hover:text-blue-200 focus:outline-none cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {/* Inline search input */}
            <input
              ref={searchInputRef}
              type="text"
              value={recipientSearch}
              onChange={(e) => {
                setRecipientSearch(e.target.value)
                if (!isRecipientMenuOpen) setIsRecipientMenuOpen(true)
              }}
              onFocus={() => setIsRecipientMenuOpen(true)}
              placeholder={recipients.length === 0 ? "Search department or person to add..." : "Add more..."}
              className="flex-1 min-w-[130px] text-xs bg-transparent border-none outline-none focus:ring-0 text-slate-800 placeholder:text-slate-400 py-0.5"
            />

            {/* Plus / collapse toggle button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsRecipientMenuOpen((prev) => !prev)
              }}
              title={isRecipientMenuOpen ? "Hide list" : "Add recipient"}
              className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 border border-slate-300 transition-colors cursor-pointer text-sm font-semibold shrink-0 ml-auto"
            >
              {isRecipientMenuOpen ? (
                <ChevronDown className="w-3.5 h-3.5 rotate-180 transition-transform" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* List of departments & users displayed DIRECTLY BELOW the input box (Inline, not a floating modal) */}
          {isRecipientMenuOpen && (
            <div className="border border-slate-200 rounded-lg bg-white p-2 space-y-2 max-h-52 overflow-y-auto">
              {/* 1. Departments & Groups */}
              {filteredGroups.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 py-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-blue-600" />
                    <span>Departments & Groups</span>
                  </div>
                  <div className="space-y-0.5">
                    {filteredGroups.map((group) => {
                      const isSelected = recipients.some((r) => r.id === group.id)
                      return (
                        <button
                          key={group.id}
                          type="button"
                          disabled={isSelected}
                          onClick={() => {
                            handleAddRecipient(group)
                            setRecipientSearch("")
                          }}
                          className={`w-full px-2.5 py-1.5 text-left text-xs rounded-md flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? "opacity-50 cursor-not-allowed bg-slate-50 text-slate-400"
                              : "hover:bg-blue-50/80 text-slate-700"
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <p className="font-medium truncate text-slate-800">{group.name}</p>
                            {group.department && (
                              <p className="text-[10px] text-slate-400 truncate">{group.department}</p>
                            )}
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 2. Normal Users & Staff */}
              {filteredUsers.length > 0 && (
                <div className="space-y-1 pt-1.5 border-t border-slate-100">
                  <div className="px-2 py-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3 h-3 text-slate-500" />
                    <span>People (Staff & Managers)</span>
                  </div>
                  <div className="space-y-0.5">
                    {filteredUsers.map((user) => {
                      const isSelected = recipients.some((r) => r.id === user.id)
                      return (
                        <button
                          key={user.id}
                          type="button"
                          disabled={isSelected}
                          onClick={() => {
                            handleAddRecipient(user)
                            setRecipientSearch("")
                          }}
                          className={`w-full px-2.5 py-1.5 text-left text-xs rounded-md flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? "opacity-50 cursor-not-allowed bg-slate-50 text-slate-400"
                              : "hover:bg-blue-50/80 text-slate-700"
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <p className="font-medium truncate text-slate-800">{user.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {user.role} • {user.department}
                            </p>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {filteredGroups.length === 0 && filteredUsers.length === 0 && (
                <p className="text-center py-3 text-xs text-slate-400">
                  No matching departments or people found.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Attached Files List */}
        <div className="border border-slate-200 rounded-lg bg-white p-3 space-y-2">
          {attachedDocs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between group py-0.5 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                {doc.type === "pdf" ? (
                  <div className="w-5 h-5 rounded bg-[#ba1a1a] text-white flex items-center justify-center text-[9px] font-bold shrink-0 select-none">
                    PDF
                  </div>
                ) : doc.type === "excel" ? (
                  <div className="w-5 h-5 rounded bg-[#107c41] text-white flex items-center justify-center text-[9px] font-bold shrink-0 select-none">
                    XLS
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded bg-[#0b57d0] text-white flex items-center justify-center text-[9px] font-bold shrink-0 select-none">
                    DOC
                  </div>
                )}
                <span className="truncate text-slate-800 font-medium">{doc.name}</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveDoc(doc.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {/* + Attach file link */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-[#005fb8] hover:text-[#004280] text-xs font-medium inline-flex items-center gap-1 pt-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Attach file</span>
          </button>
        </div>

        {/* Inline Error Message */}
        {errorMessage && (
          <p className="text-xs text-red-600 font-medium pt-1">{errorMessage}</p>
        )}

        {/* Post Button & Explanatory Text */}
        <div className="pt-1 space-y-2">
          <Button
            type="submit"
            disabled={postMutation.isPending}
            className="w-full bg-[#005fb8] hover:bg-[#004ea3] text-white font-medium h-10 rounded-md text-sm cursor-pointer transition-colors shadow-none"
          >
            {postMutation.isPending ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Posting...</span>
              </span>
            ) : (
              "Post"
            )}
          </Button>
          <p className="text-[11px] text-slate-500 text-center leading-normal">
            Creates a folder only the selected people and groups can open, and emails them a link.
          </p>
        </div>
      </form>
    </div>
  )
}

export interface PostAnnouncementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (id: number) => void
  trigger?: React.ReactNode
  align?: "start" | "center" | "end"
}

export function PostAnnouncementDialog({
  open,
  onOpenChange,
  onSuccess,
  trigger,
  align = "end",
}: PostAnnouncementDialogProps) {
  if (trigger) {
    return (
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent
          align={align}
          side="bottom"
          sideOffset={8}
          collisionPadding={16}
          className="w-[490px] sm:w-[500px] max-w-[calc(100vw-2rem)] max-h-[85vh] overflow-y-auto p-0 border border-slate-300 rounded-xl bg-[#fbfbfa] shadow-none z-50 text-left outline-none"
        >
          <PostAnnouncementCard
            onSuccess={(id) => {
              onOpenChange(false)
              if (onSuccess) onSuccess(id)
            }}
            onClose={() => onOpenChange(false)}
            showCloseButton={true}
          />
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverContent
        align={align}
        side="bottom"
        sideOffset={8}
        collisionPadding={16}
        className="w-[490px] sm:w-[500px] max-w-[calc(100vw-2rem)] max-h-[85vh] overflow-y-auto p-0 border border-slate-300 rounded-xl bg-[#fbfbfa] shadow-none z-50 text-left outline-none"
      >
        <PostAnnouncementCard
          onSuccess={(id) => {
            onOpenChange(false)
            if (onSuccess) onSuccess(id)
          }}
          onClose={() => onOpenChange(false)}
          showCloseButton={true}
        />
      </PopoverContent>
    </Popover>
  )
}
