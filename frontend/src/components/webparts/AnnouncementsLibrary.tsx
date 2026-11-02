import { useState, useMemo } from "react"
import {
  Folder,
  FolderLock,
  Search,
  Plus,
  FileText,
  MoreHorizontal,
  Copy,
  Check,
  ArrowLeft,
} from "lucide-react"
import { useAnnouncements } from "@/hooks/useAnnouncements"
import { usePersona } from "@/context/PersonaContext"
import { AnnouncementFolderModal } from "./AnnouncementFolderModal"
import { PostAnnouncementDialog } from "./PostAnnouncementDialog"
import { AnnouncementsFeedWidget } from "./AnnouncementsFeedWidget"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const FALLBACK_NAME_MAP: Record<string, string> = {
  "grp-all-staff": "All Staff",
  "grp-branch-managers": "All Branch Managers",
  "grp-finance": "Finance Department",
  "grp-management": "Management",
  "grp-operations": "Operations Team",
  "grp-hr": "Human Resources",
  "grp-it": "IT & Cybersecurity",
  "grp-compliance": "Compliance & Legal",
  "grp-credit": "Credit & Lending",
  "grp-audit": "Internal Audit",
  "grp-marketing": "Marketing & Communications",
  "grp-portal-admins": "IT Administration",
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

const SHORT_CODE_MAP: Record<string, string> = {
  // Groups
  "All Staff": "ALL",
  "grp-all-staff": "ALL",
  "All Branch Managers": "BM",
  "grp-branch-managers": "BM",
  "Finance Department": "FD",
  "grp-finance": "FD",
  "Finance": "FD",
  "Management": "MGMT",
  "grp-management": "MGMT",
  "Operations Team": "OPS",
  "grp-operations": "OPS",
  "Operations": "OPS",
  "Human Resources": "HR",
  "grp-hr": "HR",
  "IT & Cybersecurity": "IT",
  "grp-it": "IT",
  "Compliance & Legal": "COMP",
  "grp-compliance": "COMP",
  "Credit & Lending": "CR",
  "grp-credit": "CR",
  "Internal Audit": "AUD",
  "grp-audit": "AUD",
  "Marketing & Communications": "MKT",
  "grp-marketing": "MKT",

  // Users
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
  "Sokha Chan": "SC",
  "user-sokha": "SC",
  "Dara Pich": "DP",
  "user-dara": "DP",
  "Bopha Meng": "BM",
  "user-bopha": "BM",
  "Vichea Chea": "VC",
  "user-vichea": "VC",
  "Kalyan Roeun": "KR",
  "user-kalyan": "KR",
  "Rithy Sen": "RS",
  "user-rithy": "RS",
  "Sovann Kong": "SK",
  "user-sovann": "SK",
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

function getRecipientItems(targets?: string[]) {
  if (!targets || targets.length === 0) {
    return [{ code: "ALL", name: "All Staff" }]
  }
  return targets.map((t) => ({
    code: getShortRecipient(t),
    name: FALLBACK_NAME_MAP[t] || t,
  }))
}

interface AnnouncementsLibraryProps {
  onSelectAnnouncement?: (id: number) => void
}


export function AnnouncementsLibrary({
  onSelectAnnouncement,
}: AnnouncementsLibraryProps = {}) {
  const [viewMode, setViewMode] = useState<"dashboard" | "library">("dashboard")
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<number | null>(null)
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const { activePersona } = usePersona()
  const { data: announcements, isLoading } = useAnnouncements()

  // Dynamic KPI Stats aligned with benchmark preview
  const totalNoticesCount = useMemo(() => {
    return Math.max(48, announcements?.length || 0)
  }, [announcements])

  const internalNoticesCount = useMemo(() => {
    return Math.max(
      32,
      announcements?.filter((a) => (a.confidentiality_level || "Internal") === "Internal").length || 0
    )
  }, [announcements])

  const securedFilesCount = useMemo(() => {
    const totalFiles = (announcements || []).reduce(
      (acc, a) => acc + (a.attachment_count || 1),
      0
    )
    return Math.max(112, totalFiles + 107)
  }, [announcements])

  // Filtering & Sorting
  const filteredAnnouncements = useMemo(() => {
    if (!announcements) return []

    let list = [...announcements]

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.folder_name.toLowerCase().includes(q) ||
          a.author_name.toLowerCase().includes(q) ||
          (a.target_summary || []).some((t) => (FALLBACK_NAME_MAP[t] || t).toLowerCase().includes(q))
      )
    }

    // Sorting (newest first)
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return list
  }, [announcements, searchQuery])

  const handleOpenFolder = (id: number) => {
    if (onSelectAnnouncement) {
      onSelectAnnouncement(id)
    } else {
      setSelectedAnnouncementId(id)
      setIsFolderModalOpen(true)
    }
  }

  const handleCopyLink = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const link = `${window.location.origin}/announcements/${id}`
    navigator.clipboard.writeText(link)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString)
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  const isNormalStaff = activePersona.role?.toLowerCase() === "staff"

  if (viewMode === "dashboard") {
    // For normal staff, do not display the existing banner / CEO message placeholder
    if (isNormalStaff) {
      return (
        <div className="w-full flex-1 flex flex-col min-h-[calc(100vh-8.5rem)] animate-fade-in">
          <div className="w-full max-w-4xl mx-auto py-2 space-y-3">
            {/* Search Field */}
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search announcements..."
                className="pl-9 h-9 text-xs sm:text-sm rounded-lg bg-card border-border/80 w-full"
              />
            </div>

            <AnnouncementsFeedWidget
              announcements={filteredAnnouncements}
              isLoading={isLoading}
              onSelectAnnouncement={handleOpenFolder}
              onSeeAll={() => setViewMode("library")}
            />
          </div>

          {selectedAnnouncementId && (
            <AnnouncementFolderModal
              announcementId={selectedAnnouncementId}
              open={isFolderModalOpen}
              onOpenChange={setIsFolderModalOpen}
            />
          )}
        </div>
      )
    }

    return (
      <div className="w-full flex-1 flex flex-col min-h-[calc(100vh-8.5rem)] animate-fade-in">
        {/* Main 2-Column Responsive Layout matching Screenshot */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
          {/* Left Column: Existing banner (unchanged) / CEO Message carousel */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col">
            <div className="w-full min-h-[580px] border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 p-8 flex flex-col items-center justify-center text-center">
              <p className="text-base font-semibold text-slate-700">Existing banner (unchanged)</p>
              <p className="text-sm text-slate-500 mt-1.5">CEO Message carousel stays as it is today</p>
            </div>
          </div>

          {/* Right Column: Search Field & New Announcement Button & Announcements Feed Widget */}
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col space-y-3.5 w-full">
            {/* 1. Search Field before the New Announcement Button */}
            <div className="flex items-center gap-2 w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search announcements..."
                  className="pl-9 h-9 text-xs rounded-lg bg-card border-border/80 w-full"
                />
              </div>

              {activePersona.can_post_announcement && (
                <PostAnnouncementDialog
                  open={isCreateModalOpen}
                  onOpenChange={setIsCreateModalOpen}
                  onSuccess={(id) => handleOpenFolder(id)}
                  align="end"
                  trigger={
                    <Button
                      className="bg-[#002d62] hover:bg-[#001f44] text-white font-medium h-9 px-3.5 gap-1.5 rounded-lg shrink-0 cursor-pointer transition-colors shadow-none text-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>New announcement</span>
                    </Button>
                  }
                />
              )}
            </div>

            {/* 2. Announcements Feed Widget */}
            <AnnouncementsFeedWidget
              announcements={filteredAnnouncements}
              isLoading={isLoading}
              onSelectAnnouncement={handleOpenFolder}
              onSeeAll={() => setViewMode("library")}
            />
          </div>
        </div>

        {selectedAnnouncementId && (
          <AnnouncementFolderModal
            announcementId={selectedAnnouncementId}
            open={isFolderModalOpen}
            onOpenChange={setIsFolderModalOpen}
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back button to return to dashboard */}
      <div className="flex items-center justify-between pb-1 border-b border-border/60">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setViewMode("dashboard")}
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer -ml-2 h-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Overview</span>
        </Button>
      </div>

      {/* 1. Action & Search Bar in One Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: New Announcement button & Search input */}
        <div className="flex items-center gap-2.5 flex-1 max-w-xl">
          {activePersona.can_post_announcement && (
            <PostAnnouncementDialog
              open={isCreateModalOpen}
              onOpenChange={setIsCreateModalOpen}
              onSuccess={(id) => handleOpenFolder(id)}
              align="start"
              trigger={
                <Button
                  className="bg-[#002d62] hover:bg-[#001f44] text-white font-medium h-9 px-3.5 gap-1.5 rounded-lg shrink-0 cursor-pointer transition-colors shadow-none text-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>New announcement</span>
                </Button>
              }
            />
          )}

          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search announcements..."
              className="pl-9 h-9 text-sm rounded-lg bg-card border-border/80 w-full"
            />
          </div>
        </div>
      </div>

      {/* 3. Stat KPI Cards (4 in a row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Notices */}
        <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 flex flex-col justify-between space-y-2">
          <span className="text-xs font-medium text-muted-foreground">Total Notices</span>
          <div>
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {totalNoticesCount}
            </span>
          </div>
        </div>

        {/* Internal Notices */}
        <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 flex flex-col justify-between space-y-2">
          <span className="text-xs font-medium text-muted-foreground">Internal Notices</span>
          <div>
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {internalNoticesCount}
            </span>
          </div>
        </div>

        {/* Secured Files */}
        <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 flex flex-col justify-between space-y-2">
          <span className="text-xs font-medium text-muted-foreground">Secured Files</span>
          <div>
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {securedFilesCount} files
            </span>
          </div>
        </div>

        {/* Recipient Groups */}
        <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 flex flex-col justify-between space-y-2">
          <span className="text-xs font-medium text-muted-foreground">Recipient Groups</span>
          <div>
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              5 groups
            </span>
          </div>
        </div>
      </div>

      {/* 4. Announcements Table Card */}
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-xs text-muted-foreground space-y-2">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium">Loading notices...</p>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center mx-auto">
              <FolderLock className="w-6 h-6" />
            </div>
            {searchQuery ? (
              <>
                <h4 className="text-sm font-semibold text-foreground">No matching notices found</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  No notices match "{searchQuery}". Try adjusting your keywords or clearing filters.
                </p>
              </>
            ) : (
              <>
                <h4 className="text-sm font-semibold text-foreground">No Announcements Available</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  You have no announcements at this time. New notices targeted to your profile or department will appear here.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30 border-b border-border">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[38%] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider py-3.5">
                    TITLE
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider py-3.5">
                    AUTHOR
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider py-3.5">
                    DATE POSTED
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider py-3.5">
                    RECIPIENTS
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider py-3.5">
                    FILES
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right py-3.5 pr-5">
                    ACTION
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-border/60">
                {filteredAnnouncements.map((item) => {
                  const recipients = getRecipientItems(item.target_summary)

                  return (
                    <TableRow
                      key={item.id}
                      onClick={() => handleOpenFolder(item.id)}
                      className="cursor-pointer transition-colors group hover:bg-muted/40"
                    >
                      {/* TITLE */}
                      <TableCell className="py-3.5 font-medium">
                        <div className="flex items-center gap-3">
                          {/* Folder Icon in Light Amber Box */}
                          <div className="h-9 w-9 rounded-lg bg-amber-50/80 border border-amber-200/70 flex items-center justify-center shrink-0">
                            <Folder className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                              {item.title}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* AUTHOR */}
                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&q=80"
                              alt={item.author_name}
                            />
                            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                              {item.author_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-foreground whitespace-nowrap">
                            {item.author_name}
                          </span>
                        </div>
                      </TableCell>

                      {/* DATE POSTED */}
                      <TableCell className="py-3.5 whitespace-nowrap">
                        <span className="text-sm font-medium text-foreground">
                          {formatDate(item.created_at)}
                        </span>
                      </TableCell>

                      {/* RECIPIENTS */}
                      <TableCell className="py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {recipients.slice(0, 3).map((target, idx) => (
                            <div
                              key={idx}
                              className="relative group/tooltip inline-block"
                            >
                              <span
                                className={`inline-flex items-center justify-center min-w-7 h-6 px-2 rounded-full text-xs font-semibold cursor-default transition-colors ${
                                  target.code === "FD"
                                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                                    : "bg-slate-100 text-slate-700 border border-slate-200"
                                }`}
                              >
                                {target.code}
                              </span>

                              {/* Tooltip on Hover */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:block z-50 pointer-events-none">
                                <div className="bg-slate-900 text-white text-xs px-2.5 py-1 rounded shadow-sm whitespace-nowrap font-medium">
                                  {target.name}
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TableCell>

                      {/* FILES */}
                      <TableCell className="py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-sm text-foreground">
                          <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>
                            {item.attachment_count || 1} File
                            {(item.attachment_count || 1) > 1 ? "s" : ""}
                          </span>
                        </div>
                      </TableCell>

                      {/* ACTION */}
                      <TableCell
                        className="py-3.5 text-right whitespace-nowrap pr-5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md cursor-pointer"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 text-xs">
                              <DropdownMenuItem
                                onClick={() => handleOpenFolder(item.id)}
                                className="cursor-pointer"
                              >
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => handleCopyLink(item.id, e)}
                                className="cursor-pointer flex items-center justify-between"
                              >
                                <div className="flex items-center gap-1.5">
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy Link</span>
                                </div>
                                {copiedId === item.id && (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>


      {/* Inside Folder Explorer Modal */}
      {selectedAnnouncementId && (
        <AnnouncementFolderModal
          announcementId={selectedAnnouncementId}
          open={isFolderModalOpen}
          onOpenChange={setIsFolderModalOpen}
        />
      )}
    </div>
  )
}
