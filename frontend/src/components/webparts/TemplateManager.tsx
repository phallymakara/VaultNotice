import { FileText } from "lucide-react"
import { useTemplates } from "@/hooks/useTemplates"
import { Badge } from "@/components/ui/badge"

export function TemplateManager() {
  const { data: templates, isLoading } = useTemplates()

  return (
    <div className="space-y-4">
      <div className="pb-2">
        <h2 className="text-xl font-semibold tracking-tight">Standard Announcement Templates</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Standardized message outlines maintained by administrators for company broadcasts.
        </p>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-muted-foreground">
          Loading templates...
        </div>
      ) : !templates || templates.length === 0 ? (
        <div className="p-12 text-center text-xs text-muted-foreground">
          No templates configured.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="p-4 rounded-lg border border-border bg-card shadow-xs space-y-3 transition-all duration-200 hover:border-border/80 hover:shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold text-foreground text-sm">{tpl.name}</span>
                </div>
              </div>

              <div className="text-xs bg-muted/40 p-2.5 rounded-md border border-border/60">
                <span className="font-medium text-foreground block text-[11px] mb-0.5">Default Subject:</span>
                <p className="text-muted-foreground text-[11px] truncate">
                  {tpl.title_template || "— (Blank Subject) —"}
                </p>
              </div>

              <div className="text-xs text-muted-foreground line-clamp-3 leading-relaxed whitespace-pre-wrap font-sans">
                {tpl.content_template || "Blank format for custom announcements."}
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/60">
                <Badge variant="secondary" className="text-[10px] font-normal">
                  Standard Template
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
