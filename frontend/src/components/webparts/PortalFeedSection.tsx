import { useMemo, useState } from "react"
import { ChevronRight, Search, User } from "lucide-react"
import { PortalCardItem } from "@/constants/portalSections"
import merchantPromoImg from "@/assets/img/merchant-promotion.webp"

interface PortalFeedSectionProps {
  title: string
  searchPlaceholder: string
  items: PortalCardItem[]
}

const ITEMS_PER_PAGE = 3

/**
 * Renders a compact file type indicator badge in the bottom-left corner of a card preview.
 */
function FileBadge({ fileType }: { fileType: PortalCardItem["fileType"] }) {
  const isPdf = fileType === "PDF"
  return (
    <span
      className={`absolute bottom-2 left-2 inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[9px] font-bold tracking-tight text-white border border-white select-none ${
        isPdf ? "bg-[#ba1a1a]" : "bg-[#0b57d0]"
      }`}
    >
      {isPdf ? "PDF" : "W"}
    </span>
  )
}

/**
 * Renders a clean wireframe/banner thumbnail matching the document card style.
 */
function CardThumbnail({ item }: { item: PortalCardItem }) {
  if (item.thumbnailKind === "khqr-promo") {
    return (
      <div className="relative h-36 w-full bg-slate-100 border-b border-slate-200 overflow-hidden select-none">
        <img
          src={merchantPromoImg}
          alt={item.title}
          className="w-full h-full object-cover object-[50%_25%] block"
        />
        <FileBadge fileType={item.fileType} />
      </div>
    )
  }

  if (item.thumbnailKind === "interest-rate") {
    return (
      <div className="relative h-36 w-full bg-slate-50 border-b border-slate-200 px-4 pt-2.5 overflow-hidden select-none">
        <div className="mx-auto h-full w-full rounded-t border border-b-0 border-slate-200 bg-white p-2.5">
          <div className="text-[8px] font-bold text-[#002d62] mb-1.5 truncate">
            Savings Account Rate Schedule
          </div>
          <div className="grid grid-cols-4 gap-px bg-slate-200 border border-slate-200 text-[7px]">
            <div className="bg-[#e8f1fc] px-1 py-0.5 font-semibold text-[#002d62]">Product</div>
            <div className="bg-[#e8f1fc] px-1 py-0.5 font-semibold text-[#002d62]">Term</div>
            <div className="bg-[#e8f1fc] px-1 py-0.5 font-semibold text-[#002d62]">KHR</div>
            <div className="bg-[#e8f1fc] px-1 py-0.5 font-semibold text-[#002d62]">USD</div>
            <div className="bg-white px-1 py-0.5 text-slate-600">Standard</div>
            <div className="bg-white px-1 py-0.5 text-slate-600">6M</div>
            <div className="bg-white px-1 py-0.5 text-slate-600">4.75%</div>
            <div className="bg-white px-1 py-0.5 text-slate-600">3.50%</div>
            <div className="bg-white px-1 py-0.5 text-slate-600">Premium</div>
            <div className="bg-white px-1 py-0.5 text-slate-600">12M</div>
            <div className="bg-white px-1 py-0.5 text-slate-600">5.50%</div>
            <div className="bg-white px-1 py-0.5 text-slate-600">4.25%</div>
            <div className="bg-white px-1 py-0.5 text-slate-600">Planned</div>
            <div className="bg-white px-1 py-0.5 text-slate-600">24M</div>
            <div className="bg-white px-1 py-0.5 text-slate-600">6.00%</div>
            <div className="bg-white px-1 py-0.5 text-slate-600">4.75%</div>
          </div>
        </div>
        <FileBadge fileType={item.fileType} />
      </div>
    )
  }

  if (item.thumbnailKind === "visa-promo") {
    return (
      <div className="relative h-36 w-full bg-slate-50 border-b border-slate-200 px-4 pt-2.5 overflow-hidden select-none">
        <div className="mx-auto h-full w-full rounded-t border border-b-0 border-slate-200 bg-white p-2.5 space-y-1.5">
          <div className="space-y-1">
            <div className="h-1.5 w-3/4 rounded bg-slate-200" />
            <div className="h-1.5 w-2/3 rounded bg-slate-200" />
          </div>
          <div className="grid grid-cols-3 gap-px bg-slate-200 border border-slate-200 text-[7px]">
            <div className="bg-slate-100 px-1 py-0.5 font-semibold text-slate-700">Program</div>
            <div className="bg-slate-100 px-1 py-0.5 font-semibold text-slate-700">Cashback</div>
            <div className="bg-slate-100 px-1 py-0.5 font-semibold text-slate-700">Period</div>
            <div className="bg-white px-1 py-0.5 text-slate-600">Visa Gold</div>
            <div className="bg-white px-1 py-0.5 text-slate-600">5%</div>
            <div className="bg-white px-1 py-0.5 text-slate-600">Q4 2026</div>
            <div className="bg-white px-1 py-0.5 text-slate-600">Platinum</div>
            <div className="bg-white px-1 py-0.5 text-slate-600">8%</div>
            <div className="bg-white px-1 py-0.5 text-slate-600">Q4 2026</div>
          </div>
          <div className="h-1.5 w-4/5 rounded bg-slate-100" />
        </div>
        <FileBadge fileType={item.fileType} />
      </div>
    )
  }

  return (
    <div className="relative h-36 w-full bg-slate-50 border-b border-slate-200 px-4 pt-2.5 overflow-hidden select-none">
      <div className="mx-auto h-full w-full rounded-t border border-b-0 border-slate-200 bg-white p-2.5 space-y-1.5">
        <div className="grid grid-cols-2 gap-px bg-slate-200 border border-slate-200 text-[7px]">
          <div className="bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-700">Requirement</div>
          <div className="bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-700">Notes</div>
          <div className="bg-white px-1.5 py-0.5 text-slate-600">Thumbnails</div>
          <div className="bg-white px-1.5 py-0.5 text-slate-600">PDF & DOC files</div>
          <div className="bg-white px-1.5 py-0.5 text-slate-600">Pagination</div>
          <div className="bg-white px-1.5 py-0.5 text-slate-600">3 cards per page</div>
        </div>
        <div className="space-y-1">
          <div className="text-[7.5px] font-bold text-slate-800">Proposed solution</div>
          <div className="h-1.5 w-11/12 rounded bg-slate-200" />
          <div className="h-1.5 w-3/4 rounded bg-slate-100" />
        </div>
      </div>
      <FileBadge fileType={item.fileType} />
    </div>
  )
}

/**
 * Displays a searchable, paginated 3-column portal card section (e.g., News or General Announcements).
 */
export function PortalFeedSection({
  title,
  searchPlaceholder,
  items,
}: PortalFeedSectionProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showAll, setShowAll] = useState(false)

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q)
    )
  }, [items, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)

  const visibleItems = useMemo(() => {
    if (showAll) return filteredItems
    const start = (safePage - 1) * ITEMS_PER_PAGE
    return filteredItems.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredItems, safePage, showAll])

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  return (
    <section className="w-full space-y-4">
      {/* Header Row: Title + See all link on left, Search field on right */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {title}
          </h2>
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="mt-1 text-xs font-medium text-[#005fb8] hover:text-[#004280] underline underline-offset-2 cursor-pointer"
          >
            {showAll ? "Show less" : "See all"}
          </button>
        </div>

        <div className="relative w-full sm:w-72 md:w-80 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 bg-white border border-slate-300 rounded-md outline-none focus:border-[#005fb8] transition-colors"
          />
        </div>
      </div>

      {/* Cards Grid */}
      {visibleItems.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white py-10 text-center text-xs text-slate-500">
          No matching items found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {visibleItems.map((item) => (
            <article
              key={item.id}
              className="rounded-md border border-slate-200 bg-white overflow-hidden flex flex-col hover:border-slate-300 transition-colors"
            >
              <CardThumbnail item={item} />

              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <span className="inline-block text-xs font-medium text-[#005fb8] underline underline-offset-2">
                    {item.source}
                  </span>
                  <h3 className="text-sm font-normal text-slate-900 leading-snug line-clamp-2 min-h-[2.5rem]">
                    {item.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2.5 pt-0.5">
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="min-w-0 leading-tight">
                    <p className="text-xs font-medium text-slate-700 truncate">
                      {item.author}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {item.date}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Centered Pagination */}
      {!showAll && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-1 text-xs">
          {Array.from({ length: totalPages }, (_, index) => {
            const page = index + 1
            const isActive = page === safePage
            return (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`px-1 cursor-pointer transition-colors ${
                  isActive
                    ? "font-bold text-slate-900"
                    : "font-medium text-slate-500 hover:text-slate-900"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {page}
              </button>
            )
          })}
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={safePage >= totalPages}
            aria-label={`Next page of ${title}`}
            className="p-0.5 text-slate-600 hover:text-slate-900 disabled:text-slate-300 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </section>
  )
}

