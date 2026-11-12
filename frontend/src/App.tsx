import { useState } from "react"
import { usePersona } from "@/context/PersonaContext"
import { useAppRouter } from "@/hooks/useAppRouter"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/layout/UserNav"
import { AnnouncementsLibrary } from "@/components/webparts/AnnouncementsLibrary"
import { AnnouncementDetailPage } from "@/components/webparts/AnnouncementDetailPage"
import headerLogo from "@/assets/img/header-logo.webp"

const PORTAL_NAV_ITEMS = [
  { id: "Home", label: "Home" },
  { id: "By-Laws", label: "By-Laws" },
  { id: "ARF", label: "ARF" },
  { id: "Products", label: "Products" },
  { id: "Job Vacancies", label: "Job Vacancies" },
  { id: "Organization Chart", label: "Organization Chart" },
  { id: "My Tasks", label: "My Tasks" },
]

export default function App() {
  const { activePersona } = usePersona()
  const {
    selectedAnnouncementId,
    navigateToAnnouncement,
    navigateToAnnouncementsList,
  } = useAppRouter()

  const [activePortalTab, setActivePortalTab] = useState<string>("Home")

  const handleLogoClick = () => {
    setActivePortalTab("Home")
    navigateToAnnouncementsList()
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased">
      {/* Top Navigation Bar with Portal Tabs */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          {/* Left: Brand & Portal Navigation */}
          <div className="flex items-center space-x-6 min-w-0 flex-1">
            <button
              type="button"
              onClick={handleLogoClick}
              aria-label="Woori Bank Home"
              className="flex items-center hover:opacity-90 transition-opacity cursor-pointer shrink-0"
            >
              <img
                src={headerLogo}
                alt="Woori Bank"
                className="h-6 sm:h-7 w-auto object-contain select-none"
              />
            </button>

            {/* Portal Header Navigation Tabs */}
            <nav className="flex items-center space-x-1 overflow-x-auto h-14 scrollbar-none">
              {PORTAL_NAV_ITEMS.map((tab) => {
                const isActive = activePortalTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActivePortalTab(tab.id)
                      if (tab.id === "Home") {
                        navigateToAnnouncementsList()
                      }
                    }}
                    className={`h-14 px-3 flex items-center text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                      isActive
                        ? "border-[#002d62] text-slate-900 font-semibold"
                        : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Right: User Profile Menu */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <UserNav />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main
        key={`${activePortalTab}-${activePersona.id}-${selectedAnnouncementId ?? "list"}`}
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in flex flex-col"
      >
        {activePortalTab !== "Home" ? (
          <div className="w-full max-w-6xl mx-auto py-6 animate-fade-in space-y-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-normal select-none">
              <button
                type="button"
                onClick={handleLogoClick}
                className="hover:text-slate-900 hover:underline cursor-pointer transition-colors"
              >
                Web Portal
              </button>
              <span>&gt;</span>
              <span className="text-slate-700 font-medium">{activePortalTab}</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center space-y-3">
              <h2 className="text-xl font-bold text-slate-800">{activePortalTab}</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Corporate intranet directory and resources for {activePortalTab}.
              </p>
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogoClick}
                  className="text-xs"
                >
                  Return to Home
                </Button>
              </div>
            </div>
          </div>
        ) : (
          selectedAnnouncementId ? (
            <AnnouncementDetailPage
              announcementId={selectedAnnouncementId}
              onBack={navigateToAnnouncementsList}
            />
          ) : (
            <AnnouncementsLibrary onSelectAnnouncement={navigateToAnnouncement} />
          )
        )}
      </main>
    </div>
  )
}
