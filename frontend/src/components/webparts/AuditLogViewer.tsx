import { Shield, CheckCircle2, AlertCircle, RefreshCw, FileText } from "lucide-react"
import { useAuditLogs } from "@/hooks/useAnnouncements"
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

export function AuditLogViewer() {
  const { data: logs, isLoading, isRefetching, refetch } = useAuditLogs()

  return (
    <Card className="border-slate-200 shadow-sm bg-white">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">
                Announcements Audit Trail
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Immutable compliance log tracking who posted what, when, to which recipients, and execution status.
              </CardDescription>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="h-8 text-xs gap-1.5 text-slate-600 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin" : ""}`} />
            Refresh Log
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Loading compliance audit logs...
          </div>
        ) : !logs || logs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No audit records logged yet.
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="text-xs font-semibold text-slate-700 w-16">ID</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700">Announcement Title</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700">Author</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700">Designated Recipients</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700 text-center">Files</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700">Timestamp</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700 text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((item) => (
                <TableRow key={item.id} className="text-xs">
                  <TableCell className="font-mono text-slate-400">#{item.id}</TableCell>
                  <TableCell className="font-medium text-slate-900">{item.title}</TableCell>
                  <TableCell className="text-slate-600">{item.author_name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {item.recipients_summary.map((r, i) => (
                        <span
                          key={i}
                          className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-medium border border-slate-200"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-600">
                      <FileText className="w-3 h-3 text-slate-400" />
                      {item.file_count}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-500 whitespace-nowrap">
                    {new Date(item.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.status === "SUCCESS" ? (
                      <Badge variant="success" className="gap-1 text-[10px]">
                        <CheckCircle2 className="w-3 h-3" /> SUCCESS
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1 text-[10px]">
                        <AlertCircle className="w-3 h-3" /> FAILED
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
