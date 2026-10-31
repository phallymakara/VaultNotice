import { useState } from "react"
import { Bell } from "lucide-react"
import { useMyNotifications } from "@/hooks/useNotifications"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface NotificationModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onOpenAnnouncement: (id: number) => void
}

export function NotificationModal({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onOpenAnnouncement,
}: NotificationModalProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen
  const setIsOpen = isControlled ? controlledOnOpenChange! : setUncontrolledOpen

  const { data: notifications, isLoading } = useMyNotifications()
  const unreadCount = notifications?.length || 0

  const handleOpenClick = (announcementId: number) => {
    setIsOpen(false)
    setTimeout(() => {
      onOpenAnnouncement(announcementId)
    }, 50)
  }

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch {
      return dateStr
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative h-8 w-8 text-muted-foreground hover:text-foreground rounded-full cursor-pointer hover:bg-accent transition-all duration-150"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="w-[360px] sm:w-[380px] p-0 shadow-xl border border-border bg-popover"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-[11px] text-muted-foreground font-medium">
              {unreadCount} {unreadCount === 1 ? "alert" : "alerts"}
            </span>
          )}
        </div>

        <div className="max-h-[380px] overflow-y-auto p-3 space-y-2.5">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Loading notifications...
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-border bg-card p-3 space-y-1.5 shadow-xs transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {item.channel === "TEAMS" ? "Teams Card" : "Outlook Email"}
                  </span>
                  <span>{formatTime(item.sent_at)}</span>
                </div>

                <div className="text-sm font-semibold text-foreground leading-snug">
                  {item.announcement_title}
                </div>

                <div className="text-xs text-muted-foreground">
                  Posted by: {item.author_name}
                </div>

                <div className="pt-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs h-7 font-medium cursor-pointer"
                    onClick={() => handleOpenClick(item.announcement_id)}
                  >
                    Open on Web Portal
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
