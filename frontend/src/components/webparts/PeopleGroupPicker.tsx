import { useState, useRef, useEffect } from "react"
import { Users, User, X, Search, Check, Shield } from "lucide-react"
import { useDirectorySearch } from "@/hooks/useDirectory"
import { RecipientTarget } from "@/types/api"
import { Badge } from "@/components/ui/badge"

interface PeopleGroupPickerProps {
  selectedRecipients: RecipientTarget[]
  onChange: (recipients: RecipientTarget[]) => void
  disabled?: boolean
}

export function PeopleGroupPicker({
  selectedRecipients,
  onChange,
  disabled = false,
}: PeopleGroupPickerProps) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const { data: searchResults, isLoading } = useDirectorySearch(query)

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (item: { id: string; name: string; type: "USER" | "GROUP" }) => {
    const exists = selectedRecipients.some((r) => r.id === item.id)
    if (!exists) {
      onChange([...selectedRecipients, { id: item.id, name: item.name, type: item.type }])
    }
    setQuery("")
    setIsOpen(false)
  }

  const handleRemove = (id: string) => {
    onChange(selectedRecipients.filter((r) => r.id !== id))
  }

  return (
    <div className="space-y-2" ref={containerRef}>
      {/* Selected Recipients Badge List */}
      <div className="flex flex-wrap items-center gap-1.5 min-h-[38px] p-2 bg-white rounded-md border border-input shadow-sm">
        {selectedRecipients.length === 0 ? (
          <span className="text-xs text-muted-foreground select-none">
            Search and select targeted Microsoft 365 users or groups...
          </span>
        ) : (
          selectedRecipients.map((recipient) => (
            <Badge
              key={recipient.id}
              variant={recipient.type === "GROUP" ? "default" : "secondary"}
              className="gap-1.5 py-1 px-2.5 text-xs font-medium"
            >
              {recipient.type === "GROUP" ? (
                <Shield className="w-3 h-3 text-blue-200" />
              ) : (
                <User className="w-3 h-3 text-slate-500" />
              )}
              <span>{recipient.name}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(recipient.id)}
                  className="rounded-full hover:bg-black/20 p-0.5 ml-0.5"
                >
                  <X className="w-3 h-3" />
                  <span className="sr-only">Remove</span>
                </button>
              )}
            </Badge>
          ))
        )}
      </div>

      {/* Search Input & Dropdown */}
      {!disabled && (
        <div className="relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setIsOpen(true)
              }}
              onFocus={() => setIsOpen(true)}
              placeholder="Type user name, branch group, or department..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-input bg-background shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-popover text-popover-foreground border border-border rounded-md shadow-lg z-50 p-1 divide-y divide-border/40">
              {isLoading ? (
                <div className="p-3 text-xs text-muted-foreground text-center">
                  Searching directory...
                </div>
              ) : !searchResults || searchResults.length === 0 ? (
                <div className="p-3 text-xs text-muted-foreground text-center">
                  No matching users or groups found.
                </div>
              ) : (
                searchResults.map((item) => {
                  const isSelected = selectedRecipients.some((r) => r.id === item.id)
                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={isSelected}
                      onClick={() => handleSelect(item)}
                      className={`w-full text-left px-3 py-2 text-xs rounded flex items-center justify-between transition-colors ${
                        isSelected
                          ? "opacity-50 cursor-not-allowed bg-muted/40"
                          : "hover:bg-accent hover:text-accent-foreground cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div
                          className={`p-1.5 rounded-full ${
                            item.type === "GROUP"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {item.type === "GROUP" ? (
                            <Users className="w-3.5 h-3.5" />
                          ) : (
                            <User className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            {item.name}
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-normal uppercase tracking-wider ${
                                item.type === "GROUP"
                                  ? "bg-blue-50 text-blue-600 border border-blue-200"
                                  : "bg-slate-100 text-slate-600 border border-slate-200"
                              }`}
                            >
                              {item.type}
                            </span>
                          </div>
                          <div className="text-[11px] text-muted-foreground">{item.details}</div>
                        </div>
                      </div>

                      {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                    </button>
                  )
                })
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

