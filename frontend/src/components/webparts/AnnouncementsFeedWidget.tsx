import { Folder } from "lucide-react"
import { AnnouncementSummary } from "@/types/api"

interface AnnouncementsFeedWidgetProps {
  announcements: AnnouncementSummary[]
  isLoading: boolean
  onSelectAnnouncement: (id: number) => void
  onSeeAll?: () => void
}

const FALLBACK_GROUP_NAMES: Record<string, string> = {
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
  "All Branch Managers": "All Branch Managers",
  "Finance Department": "Finance Department",
  "Management": "Management",
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

function getPrimaryTarget(targetSummary?: string[]): string {
  if (!targetSummary || targetSummary.length === 0) {
    return "All Staff"
  }
  const first = targetSummary[0]
  return FALLBACK_GROUP_NAMES[first] || first
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
}: AnnouncementsFeedWidgetProps) {
  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-5 shadow-none flex flex-col">
      {/* Header: Title & See all */}
      <div className="flex items-center justify-between pb-0.5">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          Announcements
        </h3>
        {onSeeAll && (
          <button
            type="button"
            onClick={onSeeAll}
            className="text-xs font-semibold text-[#005fb8] hover:text-[#004280] hover:underline cursor-pointer"
          >
            See all
          </button>
        )}
      </div>

      {/* Subtitle */}
      <p className="text-xs text-slate-500 font-normal">
        Newest first · only those shared with you
      </p>

      {/* Announcements List Rows (Scrollable Container) */}
      <div className="mt-4 divide-y divide-slate-100 max-h-[440px] overflow-y-auto pr-1">
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
            const primaryAudience = getPrimaryTarget(item.target_summary)
            const relativeTime = formatRelativeTime(item.created_at)
            const fileCount = item.attachment_count || 1

            return (
              <div
                key={item.id}
                onClick={() => onSelectAnnouncement(item.id)}
                className="flex items-center justify-between gap-3 py-3 group cursor-pointer hover:bg-slate-50/80 px-2 rounded-lg transition-colors"
              >
                {/* Left: Folder icon (no filled container outside) + Title & Relative Time */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 flex items-center justify-center shrink-0">
                    <Folder className="w-5 h-5 text-amber-500 fill-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate group-hover:text-[#005fb8] transition-colors leading-snug">
                      {folderDisplayName}
                    </p>
                    <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                      {relativeTime} · {fileCount} {fileCount === 1 ? "file" : "files"}
                    </p>
                  </div>
                </div>

                {/* Right: Recipient Pill (no prefix icon) */}
                <div className="shrink-0">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#e6e8eb] text-slate-700">
                    <span>{primaryAudience}</span>
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
