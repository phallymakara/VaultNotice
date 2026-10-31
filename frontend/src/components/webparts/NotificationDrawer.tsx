import { 
  Mail, 
  ExternalLink, 
  ShieldCheck, 
  MessageSquare, 
  Clock 
} from "lucide-react"
import { useMyNotifications } from "@/hooks/useNotifications"
import { usePersona } from "@/context/PersonaContext"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface NotificationDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenAnnouncement: (id: number) => void
}

export function NotificationDrawer({
  open,
  onOpenChange,
  onOpenAnnouncement,
}: NotificationDrawerProps) {
  const { activePersona } = usePersona()
  const { data: notifications, isLoading } = useMyNotifications()

  const handleOpenClick = (announcementId: number) => {
    onOpenChange(false)
    onOpenAnnouncement(announcementId)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-3 border-b">
          <SheetTitle className="text-base font-semibold">
            Alerts & Notifications
          </SheetTitle>
          <SheetDescription className="text-xs">
            Recent announcement notifications sent to <strong className="text-foreground">{activePersona.name}</strong>.
          </SheetDescription>
        </SheetHeader>

        {/* Security Rule Callout */}
        <div className="my-4 p-3 rounded-lg bg-muted/60 border border-border text-xs flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div className="text-muted-foreground text-[11px] leading-relaxed">
            <strong className="text-foreground">Confidentiality Standard:</strong> To protect sensitive corporate documents, files remain securely on the portal and are never attached directly to notification emails.
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Checking notification alerts...
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Mail className="w-7 h-7 text-muted-foreground/40 mx-auto" />
              <div className="text-xs font-medium text-foreground">No Alerts</div>
              <p className="text-[11px] text-muted-foreground">
                No notification alerts have been dispatched to {activePersona.name}.
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-border bg-card p-3.5 space-y-2.5 shadow-xs transition-all duration-150 hover:border-border/80 hover:shadow-xs"
              >
                {/* Channel Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    {item.channel === "EMAIL" ? (
                      <Badge variant="outline" className="text-[10px] gap-1 font-normal">
                        <Mail className="w-3 h-3 text-primary" /> Outlook Email
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] gap-1 font-normal">
                        <MessageSquare className="w-3 h-3 text-purple-500" /> Teams Card
                      </Badge>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(item.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                {/* Subject & Recipient */}
                <div>
                  <h4 className="text-xs font-semibold text-foreground leading-tight">
                    {item.announcement_title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Posted by: {item.author_name}
                  </p>
                </div>

                {/* Action Deep Link */}
                <div className="pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs h-8 gap-1.5 font-medium"
                    onClick={() => handleOpenClick(item.announcement_id)}
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open on Web Portal
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
