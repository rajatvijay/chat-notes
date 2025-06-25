import { useState } from 'react'
import { Calendar } from 'lucide-react'
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

interface JournalListProps {
  notes: Note[]
}

export default function JournalList({ notes }: JournalListProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 flex items-center justify-center mb-4">
          <span className="text-2xl">📖</span>
        </div>
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
          No journal entries yet
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Your reflections and thoughts will appear here once categorized
        </p>
      </div>
    )
  }

  // Group notes by date
  const groupedByDate = notes.reduce((acc, note) => {
    const date = new Date(note.created_at).toDateString()
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(note)
    return acc
  }, {} as Record<string, Note[]>)

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  )

  const generateSummary = (dayNotes: Note[]) => {
    if (dayNotes.length === 1) {
      const content = dayNotes[0].content
      const words = content.split(' ')
      const firstLine = words.slice(0, 8).join(' ') + (words.length > 8 ? '...' : '')
      const secondLine = words.length > 8 ? words.slice(8, 16).join(' ') + (words.length > 16 ? '...' : '') : ''
      return { firstLine, secondLine }
    }
    
    // Multiple entries for the day
    const totalWords = dayNotes.reduce((sum, note) => sum + note.content.split(' ').length, 0)
    const firstEntry = dayNotes[0].content.split(' ').slice(0, 6).join(' ') + '...'
    return {
      firstLine: `${dayNotes.length} entries • ${totalWords} words`,
      secondLine: firstEntry
    }
  }

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString([], {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    }
  }

  return (
    <div className="space-y-3">
      {sortedDates.map((dateString) => {
        const dayNotes = groupedByDate[dateString]
        const { firstLine, secondLine } = generateSummary(dayNotes)
        const date = new Date(dateString)

        return (
          <Dialog
            key={dateString}
            onOpenChange={(open) => !open && setSelectedDate(null)}
          >
            <DialogTrigger asChild>
              <div
                className="group cursor-pointer bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 rounded-2xl p-4 shadow-sm hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all"
                onClick={() => setSelectedDate(dateString)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 flex items-center justify-center shrink-0">
                    <Calendar size={18} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                      {formatDateHeader(dateString)}
                    </h3>
                    <div className="space-y-1 mb-3">
                      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                        {firstLine}
                      </p>
                      {secondLine && (
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                          {secondLine}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        {dayNotes.length === 1 ? '1 entry' : `${dayNotes.length} entries`}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                        {date.toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </DialogTrigger>

            {selectedDate === dateString && (
              <DialogContent className="max-w-lg mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 max-h-[80vh] overflow-y-auto">
                <DialogHeader className="pb-4">
                  <DialogTitle className="flex items-center justify-between text-lg">
                    <span className="bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                      {formatDateHeader(dateString)}
                    </span>
                    <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 dark:from-emerald-900/40 dark:to-green-900/40 dark:text-emerald-300">
                      📖 Journal
                    </span>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {dayNotes
                    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                    .map((note, index) => (
                      <div key={note.id} className="space-y-2">
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                          <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed">
                            {note.content}
                          </p>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span>
                            {new Date(note.created_at).toLocaleTimeString([], {
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
                        {index < dayNotes.length - 1 && (
                          <div className="border-t border-slate-200 dark:border-slate-700 pt-4" />
                        )}
                      </div>
                    ))}
                </div>
              </DialogContent>
            )}
          </Dialog>
        )
      })}
    </div>
  )
}