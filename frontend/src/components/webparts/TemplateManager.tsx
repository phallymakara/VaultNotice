import { LayoutTemplate, Sparkles, FileText, CheckCircle2 } from "lucide-react"
import { useTemplates } from "@/hooks/useTemplates"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function TemplateManager() {
  const { data: templates, isLoading } = useTemplates()

  return (
    <Card className="border-slate-200 shadow-sm bg-white">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <LayoutTemplate className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">
              Announcement Templates Catalog
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Standardized corporate templates maintained by administrators to streamline management broadcasts.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Loading template catalog...
          </div>
        ) : !templates || templates.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No templates configured.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="p-4 rounded-lg border border-slate-200 bg-white hover:border-blue-200 transition-colors shadow-2xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-900 text-sm">{tpl.name}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-slate-50 font-normal">
                    {tpl.category}
                  </Badge>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="font-semibold text-slate-700 block text-[11px] mb-0.5">Title Template:</span>
                  <p className="font-mono text-slate-800 text-[11px] truncate">
                    {tpl.title_template || "— (Blank Subject) —"}
                  </p>
                </div>

                <div className="text-xs text-slate-500 line-clamp-3 leading-relaxed whitespace-pre-wrap font-sans">
                  {tpl.content_template || "Empty scratchpad allowing management to author announcements from scratch."}
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Active Template
                  </span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-slate-300" /> System Template
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

