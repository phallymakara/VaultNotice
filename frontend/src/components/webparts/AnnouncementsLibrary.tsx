import { useState } from "react"
import { 
  Folder, 
  FolderLock, 
  FileText, 
  Calendar, 
  ExternalLink, 
  ShieldAlert, 
  RefreshCw 
} from "lucide-react"
import { useAnnouncements } from "@/hooks/useAnnouncements"
import { usePersona } from "@/context/PersonaContext"
import { AnnouncementFolderModal } from "./AnnouncementFolderModal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function AnnouncementsLibrary() {
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { activePersona } = usePersona()
  const { data: announcements, isLoading, isRefetching, refetch } = useAnnouncements()

  const handleOpenFolder = (id: number) => {
    setSelectedAnnouncementId(id)
    setIsModalOpen(true)
  }

  return (
    <Card className="border-slate-200 shadow-sm bg-white">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <FolderLock className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">
                Announcements Document Library
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Security-trimmed document repository. You only see announcement folders shared with your account or groups.
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading || isRefetching}
              className="h-8 text-xs gap-1.5 text-slate-600"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500 space-y-2">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Loading security-trimmed announcements library...</p>
          </div>
        ) : !announcements || announcements.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-800">No Announcements Found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No announcement folders have been shared with{" "}
                <strong className="text-slate-700">{activePersona.name}</strong> or your assigned groups yet.
              </p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="text-xs font-semibold text-slate-700 w-[40%]">Announcement Folder</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700">Posted By</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700">Date</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700">Target Audience</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700 text-center">Files</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {announcements.map((item) => (
                <TableRow
                  key={item.id}
                  onClick={() => handleOpenFolder(item.id)}
                  className="cursor-pointer hover:bg-blue-50/40 transition-colors group"
                >
                  {/* Folder Name */}
                  <TableCell className="font-medium text-slate-900 py-3.5">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1.5 rounded bg-blue-100/70 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                        <Folder className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate">
                          {item.title}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 truncate">
                          {item.folder_name}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Author */}
                  <TableCell className="text-xs text-slate-600 whitespace-nowrap">
                    {item.author_name}
                  </TableCell>

                  {/* Date */}
                  <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </TableCell>

                  {/* Target Audience */}
                  <TableCell className="text-xs">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {item.target_summary.length === 0 ? (
                        <span className="text-[11px] text-slate-400">Designated Staff</span>
                      ) : (
                        item.target_summary.map((t, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-[10px] py-0 px-2 font-normal bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {t}
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>

                  {/* Files count */}
                  <TableCell className="text-center whitespace-nowrap">
                    <Badge variant="outline" className="text-[11px] gap-1 font-normal bg-white">
                      <FileText className="w-3 h-3 text-slate-500" />
                      {item.attachment_count + 1}
                    </Badge>
                  </TableCell>

                  {/* Open Button */}
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenFolder(item.id)
                      }}
                      className="h-8 text-xs gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-100/50"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Inside Folder Modal */}
      <AnnouncementFolderModal
        announcementId={selectedAnnouncementId}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedAnnouncementId(null)
        }}
      />
    </Card>
  )
}
