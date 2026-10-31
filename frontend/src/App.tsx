import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/services/apiClient"
import { usePersona } from "@/context/PersonaContext"
import { useMyNotifications } from "@/hooks/useNotifications"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserNav } from "@/components/layout/UserNav"
import { AnnouncementsLibrary } from "@/components/webparts/AnnouncementsLibrary"
import { AnnouncementFolderModal } from "@/components/webparts/AnnouncementFolderModal"
import { NotificationDrawer } from "@/components/webparts/NotificationDrawer"
import { AuditLogViewer } from "@/components/webparts/AuditLogViewer"
import { TemplateManager } from "@/components/webparts/TemplateManager"
import { 
  Lock, 
  Bell, 
  AlertCircle,
  FileText,
  Shield,
  LayoutTemplate
} from "lucide-react"

export default function App() {
  const { activePersona } = usePersona()
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false)
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<number | null>(null)
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"announcements" | "templates" | "audit">("announcements")

  // Backend Health Status query
  const { data: health, isLoading: isHealthLoading, isError: isHealthError } = useQuery({
    queryKey: ["health"],
    queryFn: () => apiClient.getHealth(),
    refetchInterval: 15000,
  })

  // Notifications query for active persona
  const { data: notifications } = useMyNotifications()
  const unreadCount = notifications?.length || 0

  const handleOpenAnnouncement = (announcementId: number) => {
    setSelectedAnnouncementId(announcementId)
    setIsFolderModalOpen(true)
  }

  const isAdmin = activePersona.role === "Portal Admin"

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Left: Brand & Navigation */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                <Lock className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-base tracking-tight">VaultNotice</span>
                <Badge variant="outline" className="text-[10px] font-normal px-1.5 py-0 h-4">
                  Enterprise
                </Badge>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="hidden sm:flex items-center space-x-1">
              <Button
                variant={activeTab === "announcements" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("announcements")}
                className="h-8 text-xs font-medium gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" /> Announcements
              </Button>

              {isAdmin && (
                <>
                  <Button
                    variant={activeTab === "templates" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("templates")}
                    className="h-8 text-xs font-medium gap-1.5"
                  >
                    <LayoutTemplate className="w-3.5 h-3.5" /> Templates
                  </Button>

                  <Button
                    variant={activeTab === "audit" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("audit")}
                    className="h-8 text-xs font-medium gap-1.5"
                  >
                    <Shield className="w-3.5 h-3.5" /> Audit Trail
                  </Button>
                </>
              )}
            </nav>
          </div>

          {/* Right: Notifications & User Profile Menu */}
          <div className="flex items-center space-x-3">
            {/* System Status */}
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-muted-foreground px-2.5 py-1 rounded-md border border-border">
              {isHealthLoading ? (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              ) : isHealthError || health?.status !== "healthy" ? (
                <>
                  <AlertCircle className="w-3 h-3 text-destructive" />
                  <span className="text-destructive">Service Unavailable</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Portal Connected</span>
                </>
              )}
            </div>

            {/* Notifications Trigger */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsNotificationDrawerOpen(true)}
              className="relative h-8 w-8 text-muted-foreground hover:text-foreground rounded-full"
              title="Recent Alerts & Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>

            {/* User Profile Menu */}
            <UserNav />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "announcements" && <AnnouncementsLibrary />}
        {activeTab === "templates" && isAdmin && <TemplateManager />}
        {activeTab === "audit" && isAdmin && <AuditLogViewer />}
      </main>

      {/* Slide-over Notification Drawer */}
      <NotificationDrawer
        open={isNotificationDrawerOpen}
        onOpenChange={setIsNotificationDrawerOpen}
        onOpenAnnouncement={handleOpenAnnouncement}
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
