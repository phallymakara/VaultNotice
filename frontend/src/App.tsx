import { useState } from "react"
import { usePersona } from "@/context/PersonaContext"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/layout/UserNav"
import { AnnouncementsLibrary } from "@/components/webparts/AnnouncementsLibrary"
import { AnnouncementFolderModal } from "@/components/webparts/AnnouncementFolderModal"
import { NotificationModal } from "@/components/webparts/NotificationModal"
import { AuditLogViewer } from "@/components/webparts/AuditLogViewer"
import { TemplateManager } from "@/components/webparts/TemplateManager"
import { 
  Lock, 
  Shield,
  LayoutTemplate
} from "lucide-react"

export default function App() {
  const { activePersona } = usePersona()
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<number | null>(null)
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"announcements" | "templates" | "audit">("announcements")

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
          {/* Left: Brand & Admin Navigation */}
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setActiveTab("announcements")}
              className="flex items-center space-x-2.5 hover:opacity-90 transition-opacity cursor-pointer"
            >
              <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                <Lock className="w-4 h-4" />
              </div>
              <span className="font-semibold text-base tracking-tight">VaultNotice</span>
            </button>

            {/* Admin Nav Links */}
            {isAdmin && (
              <nav className="hidden sm:flex items-center space-x-1">
                <Button
                  variant={activeTab === "templates" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(activeTab === "templates" ? "announcements" : "templates")}
                  className="h-8 text-xs font-medium gap-1.5"
                >
                  <LayoutTemplate className="w-3.5 h-3.5" /> Templates
                </Button>

                <Button
                  variant={activeTab === "audit" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(activeTab === "audit" ? "announcements" : "audit")}
                  className="h-8 text-xs font-medium gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" /> Audit Trail
                </Button>
              </nav>
            )}
          </div>

          {/* Right: Notifications & User Profile Menu */}
          <div className="flex items-center space-x-3">
            <NotificationModal onOpenAnnouncement={handleOpenAnnouncement} />
            <UserNav />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main
        key={`${activeTab}-${activePersona.id}`}
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in"
      >
        {activeTab === "announcements" && <AnnouncementsLibrary />}
        {activeTab === "templates" && isAdmin && <TemplateManager />}
        {activeTab === "audit" && isAdmin && <AuditLogViewer />}
      </main>

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
