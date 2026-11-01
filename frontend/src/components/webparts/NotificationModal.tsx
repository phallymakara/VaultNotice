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
        className="w-[360px] sm:w-[380px] p-0 shadow-xl border border-border bg-popover flex flex-col max-h-[85vh]"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3 shrink-0">
          <h3 className="text-sm font-normal text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-[11px] text-muted-foreground">
              {unreadCount} {unreadCount === 1 ? "alert" : "alerts"}
            </span>
          )}
        </div>

        <div className="max-h-[500px] overflow-y-auto divide-y divide-border flex-1">
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
                onClick={() => handleOpenClick(item.announcement_id)}
                className="p-3.5 space-y-1 cursor-pointer transition-colors hover:bg-muted/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="text-sm font-normal text-foreground leading-snug">
                    {item.announcement_title}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
                    {formatTime(item.sent_at)}
                  </span>
                </div>

                <div className="text-xs text-muted-foreground">
                  Posted by: {item.author_name}
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
