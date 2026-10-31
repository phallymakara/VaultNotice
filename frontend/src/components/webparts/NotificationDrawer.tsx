import { 
  Bell, 
  Mail, 
  ExternalLink, 
  ShieldCheck, 
  Bot, 
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
  isOpen: boolean
  onClose: () => void
  onOpenAnnouncement: (id: number) => void
}

export function NotificationDrawer({
  isOpen,
  onClose,
  onOpenAnnouncement,
}: NotificationDrawerProps) {
  const { activePersona } = usePersona()
  const { data: notifications, isLoading } = useMyNotifications()

  const handleOpenClick = (announcementId: number) => {
    onClose()
    onOpenAnnouncement(announcementId)
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <SheetTitle className="text-base font-bold text-slate-900">
                Simulated Alerts & Inbox
              </SheetTitle>
              <SheetDescription className="text-xs text-slate-500">
                Demonstrating email and Microsoft Teams notifications received by{" "}
                <strong className="text-slate-700">{activePersona.name}</strong>.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Security Rule Callout */}
        <div className="my-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-start space-x-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Zero Attachment Security Rule:</strong> Files are strictly protected by portal permissions and are <strong>never</strong> attached directly to notification emails.
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Checking notification alerts...
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Mail className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="text-xs font-semibold text-slate-700">No New Notifications</div>
              <p className="text-[11px] text-slate-400">
                No announcement alerts have been dispatched to {activePersona.name} yet.
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-slate-200 bg-white p-3.5 space-y-3 shadow-2xs hover:border-slate-300 transition-colors"
              >
                {/* Channel Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    {item.channel === "EMAIL" ? (
                      <span className="p-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        <Mail className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="p-1 rounded bg-purple-50 text-purple-700 border border-purple-200">
                        <Bot className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <span className="text-xs font-bold text-slate-800">
                      {item.channel === "EMAIL" ? "Outlook Email Alert" : "Microsoft Teams Alert"}
                    </span>
                  </div>

                  <Badge variant="outline" className="text-[10px] text-slate-500">
                    <Clock className="w-2.5 h-2.5 mr-1" />
                    {new Date(item.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Badge>
                </div>

                {/* Message Content Card */}
                <div className="bg-slate-50/80 p-2.5 rounded border border-slate-100 text-xs space-y-1">
                  <div className="font-semibold text-slate-900">{item.announcement_title}</div>
                  <div className="text-slate-600 text-[11px]">
                    From: <span className="font-medium">{item.author_name}</span> via Web Portal
                  </div>
                  <div className="text-slate-500 text-[11px] pt-1">
                    You have a new announcement on the Web Portal. Please check the details and access official circular attachments securely.
                  </div>
                </div>

                {/* Call To Action Button (Open on Web Portal) */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400 font-mono">Status: {item.status}</span>
                  <Button
                    size="sm"
                    onClick={() => handleOpenClick(item.announcement_id)}
                    className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium gap-1.5"
                  >
                    <span>Open on Web Portal</span>
                    <ExternalLink className="w-3 h-3" />
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
