import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/services/apiClient"
import { usePersona } from "@/context/PersonaContext"
import { useMyNotifications } from "@/hooks/useNotifications"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ShieldCheck, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Lock,
  Bell,
  Home,
  Shield,
  LayoutTemplate
} from "lucide-react"

import { PostAnnouncementForm } from "@/components/webparts/PostAnnouncementForm"
import { FeedbackBanner } from "@/components/webparts/FeedbackBanner"
import { AnnouncementsLibrary } from "@/components/webparts/AnnouncementsLibrary"
import { AnnouncementFolderModal } from "@/components/webparts/AnnouncementFolderModal"
import { NotificationDrawer } from "@/components/webparts/NotificationDrawer"
import { AuditLogViewer } from "@/components/webparts/AuditLogViewer"
import { TemplateManager } from "@/components/webparts/TemplateManager"

export default function App() {
  const { activePersona, setActivePersona, personas } = usePersona()
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false)
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<number | null>(null)
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("portal")

  // Backend Health Status query
  const { data: health, isLoading: isHealthLoading, isError: isHealthError } = useQuery({
    queryKey: ["health"],
    queryFn: () => apiClient.getHealth(),
    refetchInterval: 10000,
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Microsoft 365 Corporate Top Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Portal Branding */}
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg flex items-center justify-center shadow-md">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight">VaultNotice</span>
                <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded font-medium">
                  Web Portal
                </span>
              </div>
              <p className="text-xs text-slate-400">Proseth Solution Intranet</p>
            </div>
          </div>

          {/* Right Controls: Notifications, Health & Persona Switcher */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Backend Health Badge */}
            <div className="hidden md:flex items-center space-x-2 bg-slate-800/80 px-2.5 py-1.5 rounded-md border border-slate-700 text-xs">
              {isHealthLoading ? (
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  Connecting...
                </span>
              ) : isHealthError || health?.status !== "healthy" ? (
                <span className="text-red-400 flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  API Degraded
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  DB Online
                </span>
              )}
            </div>

            {/* Simulated Notification Bell */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsNotificationDrawerOpen(true)}
              className="relative text-slate-300 hover:text-white hover:bg-slate-800 h-9 px-2.5"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 shadow">
                  {unreadCount}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>

            {/* Persona Switcher Dropdown */}
            <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              <Users className="w-4 h-4 text-slate-400 shrink-0" />
              <label htmlFor="persona-select" className="text-xs text-slate-400 font-medium hidden sm:inline">
                Persona:
              </label>
              <select
                id="persona-select"
                value={activePersona.id}
                onChange={(e) => {
                  const selected = personas.find((p) => p.id === e.target.value)
                  if (selected) {
                    setActivePersona(selected)
                    // If switching from admin to staff and was on an admin tab, reset to portal tab
                    if (selected.role !== "Portal Admin" && activeTab !== "portal") {
                      setActiveTab("portal")
                    }
                  }
                }}
                className="bg-transparent text-xs sm:text-sm text-white font-medium focus:outline-none cursor-pointer"
              >
                {personas.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                    {p.name} ({p.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Active Persona Banner */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-lg shadow-inner shrink-0">
              {activePersona.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h1 className="text-lg font-bold text-slate-900">{activePersona.name}</h1>
                <Badge variant={activePersona.can_post_announcement ? "default" : "secondary"}>
                  {activePersona.role}
                </Badge>
                {activePersona.can_post_announcement ? (
                  <Badge variant="success" className="gap-1 text-[11px]">
                    <ShieldCheck className="w-3 h-3" /> Can Post Announcements
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[11px] text-slate-500 font-normal">
                    Recipient Staff View
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {activePersona.department} • <span className="text-slate-400">{activePersona.email}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
            <span className="font-semibold text-slate-500 mr-1">Assigned Groups:</span>
            {activePersona.groups.length === 0 ? (
              <span className="text-slate-400 text-xs">No group memberships</span>
            ) : (
              activePersona.groups.map((group) => (
                <span
                  key={group}
                  className="bg-white text-slate-800 px-2 py-0.5 rounded border border-slate-200 font-medium text-[11px] shadow-2xs"
                >
                  {group}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Tab Navigation for Portal Admin */}
        {isAdmin ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-slate-200/80 p-1">
              <TabsTrigger value="portal" className="text-xs gap-1.5 data-[state=active]:bg-white">
                <Home className="w-3.5 h-3.5" /> Web Portal Home
              </TabsTrigger>
              <TabsTrigger value="audit" className="text-xs gap-1.5 data-[state=active]:bg-white">
                <Shield className="w-3.5 h-3.5" /> Audit Trail Log
              </TabsTrigger>
              <TabsTrigger value="templates" className="text-xs gap-1.5 data-[state=active]:bg-white">
                <LayoutTemplate className="w-3.5 h-3.5" /> Templates Catalog
              </TabsTrigger>
            </TabsList>

            <TabsContent value="portal" className="space-y-6 m-0">
              {/* Audience Targeted Form */}
              <PostAnnouncementForm />
              {/* Security Trimmed Library */}
              <AnnouncementsLibrary />
            </TabsContent>

            <TabsContent value="audit" className="m-0">
              <AuditLogViewer />
            </TabsContent>

            <TabsContent value="templates" className="m-0">
              <TemplateManager />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-6">
            {/* Audience Targeted Form vs Staff Feedback Banner */}
            {activePersona.can_post_announcement ? (
              <PostAnnouncementForm />
            ) : (
              <FeedbackBanner />
            )}

            {/* Security Trimmed Document Library Web Part */}
            <AnnouncementsLibrary />
          </div>
        )}
      </main>

      {/* Simulated Outlook & Teams Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        onOpenAnnouncement={handleOpenAnnouncement}
      />

      {/* Inside Announcement Folder Modal */}
      <AnnouncementFolderModal
        announcementId={selectedAnnouncementId}
        isOpen={isFolderModalOpen}
        onClose={() => {
          setIsFolderModalOpen(false)
          setSelectedAnnouncementId(null)
        }}
      />
    </div>
  )
}
