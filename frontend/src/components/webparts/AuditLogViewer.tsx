import { RefreshCw } from "lucide-react"
import { useAuditLogs } from "@/hooks/useAnnouncements"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Compliance Audit Trail</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Immutable log recording author identity, publication timestamp, and target recipient snapshots.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading || isRefetching}
          className="gap-1.5 h-9 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="rounded-md border border-border bg-card shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            Loading compliance audit records...
          </div>
        ) : !logs || logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            No audit records logged yet.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-16 text-xs font-semibold">ID</TableHead>
                <TableHead className="text-xs font-semibold">Title</TableHead>
                <TableHead className="text-xs font-semibold">Author</TableHead>
                <TableHead className="text-xs font-semibold">Designated Recipients</TableHead>
                <TableHead className="text-xs font-semibold text-center">Files</TableHead>
                <TableHead className="text-xs font-semibold">Timestamp</TableHead>
                <TableHead className="text-xs font-semibold text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} className="transition-colors">
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    #{log.id}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-foreground">
                    {log.title}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {log.author_name}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {log.recipients_summary?.map((target, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="text-[10px] font-normal"
                        >
                          {target}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground text-center font-mono">
                    {log.file_count}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary" className="text-[10px] font-normal">
                      Completed
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
