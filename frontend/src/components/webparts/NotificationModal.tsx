import { useMyNotifications } from "@/hooks/useNotifications"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface NotificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenAnnouncement: (id: number) => void
}

export function NotificationModal({
  open,
  onOpenChange,
  onOpenAnnouncement,
}: NotificationModalProps) {
  const { data: notifications, isLoading } = useMyNotifications()

  const handleOpenClick = (announcementId: number) => {
    onOpenChange(false)
    onOpenAnnouncement(announcementId)
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Notifications</DialogTitle>
          <DialogDescription className="sr-only">
            List of recent notifications
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1 pt-1">
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
                className="rounded-lg border border-border bg-card p-3.5 space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {item.channel === "TEAMS" ? "Teams Card" : "Outlook Email"}
                  </span>
                  <span>{formatTime(item.sent_at)}</span>
                </div>

                <div className="text-sm font-semibold text-foreground">
                  {item.announcement_title}
                </div>

                <div className="text-xs text-muted-foreground">
                  Posted by: {item.author_name}
                </div>

                <div className="pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs h-8 font-medium cursor-pointer"
                    onClick={() => handleOpenClick(item.announcement_id)}
                  >
                    Open on Web Portal
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
