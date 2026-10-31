import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/services/apiClient"
import { usePersona } from "@/context/PersonaContext"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ShieldCheck, 
  Database, 
  Server, 
  HardDrive, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Lock
} from "lucide-react"

export default function App() {
  const { activePersona, setActivePersona, personas } = usePersona()

  const { data: health, isLoading, isError } = useQuery({
    queryKey: ["health"],
    queryFn: () => apiClient.getHealth(),
    refetchInterval: 10000,
  })

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Microsoft 365 Corporate Top Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Portal Name */}
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

          {/* Persona Switcher & Health Indicator */}
          <div className="flex items-center space-x-4">
            {/* Backend Health Badge */}
            <div className="hidden sm:flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-md border border-slate-700 text-xs">
              {isLoading ? (
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  Connecting API...
                </span>
              ) : isError || health?.status !== "healthy" ? (
                <span className="text-red-400 flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  API Degraded
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  API & DB Online
                </span>
              )}
            </div>

            {/* Persona Switcher Dropdown */}
            <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              <Users className="w-4 h-4 text-slate-400" />
              <label htmlFor="persona-select" className="text-xs text-slate-400 font-medium">
                Persona:
              </label>
              <select
                id="persona-select"
                value={activePersona.id}
                onChange={(e) => {
                  const selected = personas.find((p) => p.id === e.target.value)
                  if (selected) setActivePersona(selected)
                }}
                className="bg-transparent text-sm text-white font-medium focus:outline-none cursor-pointer"
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Active Persona Banner */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-lg shadow-inner">
              {activePersona.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-slate-900">{activePersona.name}</h1>
                <Badge variant={activePersona.can_post_announcement ? "default" : "secondary"}>
                  {activePersona.role}
                </Badge>
                {activePersona.can_post_announcement && (
                  <Badge variant="success" className="gap-1">
                    <ShieldCheck className="w-3 h-3" /> Can Post Announcements
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-500 flex items-center gap-2 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {activePersona.department} • <span className="text-slate-400">{activePersona.email}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
            <span className="font-medium text-slate-400">Targeted Groups:</span>
            {activePersona.groups.map((group) => (
              <span
                key={group}
                className="bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200 font-medium"
              >
                {group}
              </span>
            ))}
          </div>
        </div>

        {/* Phase 1 Scaffolding Verification Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Backend API Status */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">FastAPI Backend</CardTitle>
              <Server className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {isLoading ? "Checking..." : health?.status === "healthy" ? "Online" : "Degraded"}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Port 8000 • Framework v0.115+ with uv
              </p>
              <div className="mt-3 text-xs bg-slate-50 p-2 rounded border border-slate-100 font-mono text-slate-600">
                GET /api/v1/health
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Database Container */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">PostgreSQL Database</CardTitle>
              <Database className="w-4 h-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {isLoading ? "Checking..." : health?.database === "connected" ? "Connected" : "Disconnected"}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                PostgreSQL 16 Alpine • Dockerized
              </p>
              <div className="mt-3 text-xs bg-slate-50 p-2 rounded border border-slate-100 font-mono text-slate-600">
                Connection: 0.0.0.0:5432
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Storage Engine */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Folder & PDF Engine</CardTitle>
              <HardDrive className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {isLoading ? "Checking..." : health?.storage === "ready" ? "Ready" : "Missing"}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                ReportLab PDF + Isolated storage directory
              </p>
              <div className="mt-3 text-xs bg-slate-50 p-2 rounded border border-slate-100 font-mono text-slate-600">
                storage/announcements/
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Phase 1 Scaffold Completion Note */}
        <Card className="border-blue-200 bg-blue-50/40">
          <CardHeader>
            <CardTitle className="text-base text-blue-950 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              Phase 1 Environment & Scaffolding Successfully Configured
            </CardTitle>
            <CardDescription className="text-blue-900/80">
              Docker PostgreSQL 16 is healthy, the FastAPI backend is initialized with SQLAlchemy 2.x and Pydantic Settings, and the React TSX frontend is configured with shadcn/ui and TanStack Query. Ready for Phase 2 (Database Modeling & Seeding).
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    </div>
  )
}
