import { useState } from 'react'
import { Users, Calendar, Clock } from 'lucide-react'
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
    meeting_title?: string
    meeting_date?: string
    meeting_time?: string
    related_meeting_id?: string
  }
}

interface MeetingsListProps {
  notes: Note[]
}

export default function MeetingsList({ notes }: MeetingsListProps) {
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null)

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 flex items-center justify-center mb-4">
          <span className="text-2xl">👥</span>
        </div>
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
          No meeting notes yet
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Your meeting discussions will appear here once categorized
        </p>
      </div>
    )
  }

  // Group notes by meeting (using related_meeting_id or creating groups)
  const groupedMeetings = notes.reduce((acc, note) => {
    const meetingId = note.metadata?.related_meeting_id || note.id
    if (!acc[meetingId]) {
      acc[meetingId] = []
    }
    acc[meetingId].push(note)
    return acc
  }, {} as Record<string, Note[]>)

  const getMeetingTitle = (notes: Note[]) => {
    const firstNote = notes[0]
    if (firstNote.metadata?.meeting_title) {
      return firstNote.metadata.meeting_title
    }
    
    // Extract potential meeting title from content
    const content = firstNote.content
    const sentences = content.split(/[.!?]+/)
    const firstSentence = sentences[0]?.trim()
    
    if (firstSentence && firstSentence.length > 5 && firstSentence.length < 60) {
      return firstSentence
    }
    
    const words = content.split(' ')
    return words.slice(0, 4).join(' ') + (words.length > 4 ? '...' : '')
  }

  const getMeetingDateTime = (notes: Note[]) => {
    const firstNote = notes[0]
    if (firstNote.metadata?.meeting_date && firstNote.metadata?.meeting_time) {
      return {
        date: firstNote.metadata.meeting_date,
        time: firstNote.metadata.meeting_time
      }
    }
    
    // Use the creation date/time as fallback
    const createdAt = new Date(firstNote.created_at)
    return {
      date: createdAt.toLocaleDateString(),
      time: createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  const formatMeetingDate = (dateString: string) => {
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
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  return (
    <div className="space-y-3">
      {Object.entries(groupedMeetings)
        .sort(([, a], [, b]) => 
          new Date(b[0].created_at).getTime() - new Date(a[0].created_at).getTime()
        )
        .map(([meetingId, meetingNotes]) => {
          const meetingTitle = getMeetingTitle(meetingNotes)
          const { date, time } = getMeetingDateTime(meetingNotes)
          const formattedDate = formatMeetingDate(date)

          return (
            <Dialog
              key={meetingId}
              onOpenChange={(open) => !open && setSelectedMeeting(null)}
            >
              <DialogTrigger asChild>
                <div
                  className="group cursor-pointer bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 rounded-2xl p-4 shadow-sm hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all"
                  onClick={() => setSelectedMeeting(meetingId)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center shrink-0">
                      <Users size={18} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                        {meetingTitle}
                      </h3>
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                          <Calendar size={12} />
                          <span>{formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                          <Clock size={12} />
                          <span>{time}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          {meetingNotes.length === 1 ? '1 note' : `${meetingNotes.length} notes`}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                          {new Date(meetingNotes[0].created_at).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogTrigger>

              {selectedMeeting === meetingId && (
                <DialogContent className="max-w-lg mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 max-h-[80vh] overflow-y-auto">
                  <DialogHeader className="pb-4">
                    <DialogTitle className="flex items-center justify-between text-lg">
                      <span className="bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                        {meetingTitle}
                      </span>
                      <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 dark:from-blue-900/40 dark:to-cyan-900/40 dark:text-blue-300">
                        👥 Meeting
                      </span>
                    </DialogTitle>
                    <div className="flex items-center gap-4 pt-2">
                      <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                        <Calendar size={14} />
                        <span>{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                        <Clock size={14} />
                        <span>{time}</span>
                      </div>
                    </div>
                  </DialogHeader>
                  <div className="space-y-4">
                    {meetingNotes
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
                          {index < meetingNotes.length - 1 && (
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