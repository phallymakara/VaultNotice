import { useState, useMemo } from "react"
import { 
  Folder, 
  FolderLock, 
  Search,
  Plus
} from "lucide-react"
import { useAnnouncements } from "@/hooks/useAnnouncements"
import { usePersona } from "@/context/PersonaContext"
import { AnnouncementFolderModal } from "./AnnouncementFolderModal"
import { PostAnnouncementDialog } from "./PostAnnouncementDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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

function formatRecipients(targets?: string[]): string {
  if (!targets || targets.length === 0) return "Designated Recipients"
  const resolved = targets.map((t) => FALLBACK_NAME_MAP[t] || t)
  if (resolved.length === 1) return resolved[0]
  if (resolved.length === 2) return `${resolved[0]}, ${resolved[1]}`
  return `${resolved[0]} +${resolved.length - 1} more`
}

export function AnnouncementsLibrary() {
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<number | null>(null)
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const { activePersona } = usePersona()
  const { data: announcements, isLoading } = useAnnouncements()

  // Filter announcements by search query
  const filteredAnnouncements = useMemo(() => {
    if (!announcements) return []
    if (!searchQuery.trim()) return announcements

    const q = searchQuery.toLowerCase()
    return announcements.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.folder_name.toLowerCase().includes(q) ||
        a.author_name.toLowerCase().includes(q)
    )
  }, [announcements, searchQuery])

  const handleOpenFolder = (id: number) => {
    setSelectedAnnouncementId(id)
    setIsFolderModalOpen(true)
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

  return (
    <div className="space-y-4">
      {/* Search & Action Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search announcements"
            className="pl-9 h-9 text-xs"
          />
        </div>

        {activePersona.can_post_announcement && (
          <Button
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-1.5 shadow-xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> New Announcement
          </Button>
        )}
      </div>

      {/* Table Card */}
      <div className="rounded-md border border-border bg-card shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-muted-foreground space-y-2">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Loading announcements...</p>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="p-12 text-center space-y-2.5">
            <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center mx-auto">
              <FolderLock className="w-5 h-5" />
            </div>
            {searchQuery ? (
              <>
                <h4 className="text-sm font-medium">No results found</h4>
                <p className="text-xs text-muted-foreground">
                  No announcements match "{searchQuery}".
                </p>
              </>
            ) : (
              <>
                <h4 className="text-sm font-medium">No Announcements Available</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  You have no announcements at this time. New notices targeted to your profile or department will appear here.
                </p>
              </>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[45%] text-xs font-semibold">Title</TableHead>
                <TableHead className="text-xs font-semibold">Author</TableHead>
                <TableHead className="text-xs font-semibold">Date Posted</TableHead>
                <TableHead className="text-xs font-semibold">Recipients</TableHead>
                <TableHead className="text-xs font-semibold text-center">Files</TableHead>
                <TableHead className="text-xs font-semibold text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAnnouncements.map((item) => (
                <TableRow
                  key={item.id}
                  onClick={() => handleOpenFolder(item.id)}
                  className="cursor-pointer transition-all duration-150 hover:bg-muted/60 group"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1.5 rounded-md bg-muted text-muted-foreground shrink-0">
                        <Folder className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate hover:underline">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          Official Notice • {formatDate(item.created_at)}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground">
                    {item.author_name}
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(item.created_at)}
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    <span title={item.target_summary?.map((t) => FALLBACK_NAME_MAP[t] || t).join(", ") || ""}>
                      {formatRecipients(item.target_summary)}
                    </span>
                  </TableCell>

                  <TableCell className="text-center">
                    <span className="text-xs text-muted-foreground">
                      {item.attachment_count || 1} file{(item.attachment_count || 1) > 1 ? "s" : ""}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs font-normal hover:bg-muted"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenFolder(item.id)
                      }}
                    >
                      View Notice
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Composer Dialog */}
      <PostAnnouncementDialog
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

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
