import { ReactNode } from "react"
import { Folder } from "lucide-react"
import { AnnouncementSummary } from "@/types/api"
import { getShortRecipientCode, getFullRecipientName } from "@/constants/shortcuts"

interface AnnouncementsFeedWidgetProps {
  announcements: AnnouncementSummary[]
  isLoading: boolean
  onSelectAnnouncement?: (id: number) => void
  onSeeAll?: () => void
  headerAction?: ReactNode
}

function cleanFolderName(folderName?: string, title?: string, createdAt?: string): string {
  if (folderName) {
    return folderName.replace(" - ", " ").trim()
  }
  if (title && createdAt) {
    const datePrefix = createdAt.slice(0, 10)
    return `${datePrefix} ${title}`
  }
  return title || "Announcement"
}

function formatRelativeTime(dateString: string): string {
  try {
    const d = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) return "Just now"
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  } catch {
    return "Recently"
  }
}

export function AnnouncementsFeedWidget({
  announcements,
  isLoading,
  onSelectAnnouncement,
  onSeeAll,
  headerAction,
}: AnnouncementsFeedWidgetProps) {
  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-5 shadow-none flex flex-col">
      {/* Header: Title + See all on left, optional action button aligned at right end */}
      <div className="flex items-start justify-between gap-2 pb-1">
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Announcements
          </h3>
          {onSeeAll && (
            <button
              type="button"
              onClick={onSeeAll}
              className="mt-0.5 text-xs font-semibold text-[#005fb8] hover:text-[#004280] hover:underline cursor-pointer"
            >
              See all
            </button>
          )}
        </div>
        {headerAction && (
          <div className="shrink-0">
            {headerAction}
          </div>
        )}
      </div>

      {/* Announcements List Rows (Scrollable Container) */}
      <div className="mt-3 divide-y divide-slate-100 max-h-[440px] overflow-y-auto pr-1">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Loading announcements...
          </div>
        ) : announcements.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No announcements available.
          </div>
        ) : (
          announcements.map((item) => {
            const folderDisplayName = cleanFolderName(
              item.folder_name,
              item.title,
              item.created_at
            )
            const rawTarget = (item.target_summary && item.target_summary.length > 0) ? item.target_summary[0] : "All Staff"
            const shortcutCode = getShortRecipientCode(rawTarget)
            const fullTargetName = getFullRecipientName(rawTarget)
            const relativeTime = formatRelativeTime(item.created_at)
            const fileCount = item.attachment_count || 1

            return (
              <div
                key={item.id}
                onClick={() => onSelectAnnouncement?.(item.id)}
                className={`flex items-center justify-between gap-3 py-3 group px-2 rounded-lg transition-colors ${
                  onSelectAnnouncement ? "cursor-pointer hover:bg-slate-50/80" : ""
                }`}
              >
                {/* Left: Folder icon + Title & Relative Time */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-7 h-7 flex items-center justify-center shrink-0">
                    <Folder className="w-5 h-5 text-amber-500 fill-amber-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-xs sm:text-sm font-semibold text-slate-900 truncate max-w-full leading-snug group-hover:text-[#005fb8] transition-colors"
                      title={folderDisplayName}
                    >
                      {folderDisplayName}
                    </p>
                    <p className="text-[11px] text-slate-500 font-normal mt-0.5 truncate">
                      {relativeTime} · {fileCount} {fileCount === 1 ? "file" : "files"}
                    </p>
                  </div>
                </div>

                {/* Right: Recipient Badge with shortcut text and aligned */}
                <div className="shrink-0 flex items-center justify-end pl-2">
                  <span
                    className="inline-flex items-center justify-center min-w-8 h-6 px-2.5 rounded-full text-xs font-bold bg-[#004e9a] text-white select-none shadow-none"
                    title={fullTargetName}
                  >
                    {shortcutCode}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
