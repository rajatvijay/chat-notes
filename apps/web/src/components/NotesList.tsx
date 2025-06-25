import { useState } from 'react'
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
}

interface NotesListProps {
  notes: Note[]
}

export default function NotesList({ notes }: NotesListProps) {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mb-4">
          <span className="text-2xl">📝</span>
        </div>
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
          No notes yet
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Notes you categorize will appear here
        </p>
      </div>
    )
  }

  const truncateText = (text: string, length: number = 120) => {
    return text.length > length ? text.substring(0, length) + '...' : text
  }

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'task':
        return '✅'
      case 'idea':
        return '💡'
      case 'journal':
        return '📖'
      case 'meeting':
        return '👥'
      case 'reading':
        return '📚'
      default:
        return '📝'
    }
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <Dialog
          key={note.id}
          onOpenChange={(open) => !open && setSelectedNote(null)}
        >
          <DialogTrigger asChild>
            <div
              className="group cursor-pointer bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 rounded-2xl p-4 shadow-sm"
              onClick={() => setSelectedNote(note)}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center shrink-0">
                  <span className="text-lg">
                    {getCategoryEmoji(note.category || '')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed mb-3">
                    {truncateText(note.content)}
                  </p>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                        note.category === 'task'
                          ? 'bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 dark:from-rose-900/40 dark:to-pink-900/40 dark:text-rose-300'
                          : note.category === 'idea'
                            ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 dark:from-amber-900/40 dark:to-yellow-900/40 dark:text-amber-300'
                            : note.category === 'journal'
                              ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 dark:from-emerald-900/40 dark:to-green-900/40 dark:text-emerald-300'
                              : note.category === 'meeting'
                                ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 dark:from-blue-900/40 dark:to-cyan-900/40 dark:text-blue-300'
                                : note.category === 'reading'
                                  ? 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 dark:from-purple-900/40 dark:to-violet-900/40 dark:text-purple-300'
                                  : 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 dark:from-slate-900/40 dark:to-gray-900/40 dark:text-slate-300'
                      }`}
                    >
                      {note.category}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                      {new Date(note.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </DialogTrigger>

          {selectedNote && selectedNote.id === note.id && (
            <DialogContent className="max-w-lg mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-slate-700/30">
              <DialogHeader className="pb-4">
                <DialogTitle className="flex items-center justify-between text-lg">
                  <span className="bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                    Note Details
                  </span>
                  <span
                    className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                      selectedNote.category === 'task'
                        ? 'bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 dark:from-rose-900/40 dark:to-pink-900/40 dark:text-rose-300'
                        : selectedNote.category === 'idea'
                          ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 dark:from-amber-900/40 dark:to-yellow-900/40 dark:text-amber-300'
                          : selectedNote.category === 'journal'
                            ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 dark:from-emerald-900/40 dark:to-green-900/40 dark:text-emerald-300'
                            : selectedNote.category === 'meeting'
                              ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 dark:from-blue-900/40 dark:to-cyan-900/40 dark:text-blue-300'
                              : selectedNote.category === 'reading'
                                ? 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 dark:from-purple-900/40 dark:to-violet-900/40 dark:text-purple-300'
                                : 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 dark:from-slate-900/40 dark:to-gray-900/40 dark:text-slate-300'
                    }`}
                  >
                    {selectedNote.category}
                  </span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                  <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed">
                    {selectedNote.content}
                  </p>
                </div>
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>
                    {new Date(selectedNote.created_at).toLocaleDateString([], {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span
                    className={`px-2 py-1 rounded ${
                      selectedNote.source === 'auto'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {selectedNote.source === 'auto' ? '🤖 Auto' : '👤 Manual'}
                  </span>
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>
      ))}
    </div>
  )
}
