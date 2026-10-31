import { MessageSquareText, ThumbsUp, Send } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FeedbackBanner() {
  return (
    <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl p-6 text-white shadow-sm border border-blue-800/50 flex flex-col sm:flex-row items-center justify-between gap-6">
      <div className="flex items-start space-x-4">
        <div className="bg-white/10 p-3 rounded-lg flex items-center justify-center shrink-0">
          <MessageSquareText className="w-6 h-6 text-blue-300" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold">Feedback & Suggestions</h2>
            <span className="bg-blue-400/20 text-blue-200 text-xs px-2 py-0.5 rounded border border-blue-300/20 font-medium">
              Employee Voice
            </span>
          </div>
          <p className="text-sm text-blue-200/90 mt-1 max-w-xl">
            Have ideas to improve our digital workplace or branch operations? Share your feedback directly with our organizational development team.
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3 shrink-0">
        <Button variant="secondary" size="sm" className="bg-white text-blue-950 hover:bg-blue-50 font-medium gap-1.5">
          <Send className="w-3.5 h-3.5" /> Submit Suggestion
        </Button>
        <Button variant="ghost" size="sm" className="text-blue-200 hover:text-white hover:bg-white/10 gap-1.5">
          <ThumbsUp className="w-3.5 h-3.5" /> Recent Ideas
        </Button>
      </div>
    </div>
  )
}

