import { useState } from 'react'
import { Lightbulb } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@chatnotes/ui'

interface Note {
  id: string
  content: string
  category: string | null
  created_at: string
  source: string
  metadata?: {
    title?: string
    summary?: string
  }
}

interface IdeasListProps {
  notes: Note[]
}

export default function IdeasList({ notes }: IdeasListProps) {
  const [selectedIdea, setSelectedIdea] = useState<string | null>(null)

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 flex items-center justify-center mb-4">
          <span className="text-2xl">💡</span>
        </div>
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
          No ideas yet
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Your creative thoughts will appear here once categorized
        </p>
      </div>
    )
  }

  const getIdeaTitle = (note: Note) => {
    return note.metadata?.title || 'Untitled Idea'
  }

  const getIdeaSummary = (note: Note) => {
    return note.metadata?.summary || note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '')
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => {
        const ideaTitle = getIdeaTitle(note)
        const ideaSummary = getIdeaSummary(note)

        return (
          <Dialog
            key={note.id}
            onOpenChange={(open) => !open && setSelectedIdea(null)}
          >
            <DialogTrigger asChild>
              <div
                className="group cursor-pointer bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 rounded-2xl p-4 shadow-sm hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all"
                onClick={() => setSelectedIdea(note.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 flex items-center justify-center shrink-0">
                    <Lightbulb size={18} className="text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                      {ideaTitle}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-3">
                      {ideaSummary}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                        {new Date(note.created_at).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </DialogTrigger>

            {selectedIdea === note.id && (
              <DialogContent className="max-w-lg mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 max-h-[80vh] overflow-y-auto">
                <DialogHeader className="pb-4">
                  <DialogTitle className="flex items-center justify-between text-lg">
                    <span className="bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                      {ideaTitle}
                    </span>
                    <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 dark:from-amber-900/40 dark:to-yellow-900/40 dark:text-amber-300">
                      💡 Idea
                    </span>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                    <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      {new Date(note.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span
                      className={`px-2 py-1 rounded ${
                        note.source === 'auto'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {note.source === 'auto' ? '🤖 Auto' : '👤 Manual'}
                    </span>
                  </div>
                </div>
              </DialogContent>
            )}
          </Dialog>
        )
      })}
    </div>
  )
}