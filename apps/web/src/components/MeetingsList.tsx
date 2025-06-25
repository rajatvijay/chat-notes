import { useState } from 'react'
import { Users, Calendar, Clock, Edit2, Save, X } from 'lucide-react'
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
    date?: string
    time?: string
  }
}

interface MeetingsListProps {
  notes: Note[]
}

export default function MeetingsList({ notes }: MeetingsListProps) {
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null)
  const [editingMeeting, setEditingMeeting] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editTime, setEditTime] = useState('')

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

  // Group notes by meeting date and time
  const groupedMeetings = notes.reduce((acc, note) => {
    const date = note.metadata?.date || new Date(note.created_at).toISOString().split('T')[0]
    const time = note.metadata?.time || new Date(note.created_at).toTimeString().slice(0, 5)
    const key = `${date}_${time}`
    
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(note)
    return acc
  }, {} as Record<string, Note[]>)

  const getMeetingTitle = (notes: Note[]) => {
    // Use title from any note that has one
    const noteWithTitle = notes.find(note => note.metadata?.title)
    if (noteWithTitle?.metadata?.title) {
      return noteWithTitle.metadata.title
    }
    
    // Fallback to extracting from content
    const firstNote = notes[0]
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
    if (firstNote.metadata?.date && firstNote.metadata?.time) {
      return {
        date: firstNote.metadata.date,
        time: firstNote.metadata.time
      }
    }
    
    // Use the creation date/time as fallback
    const createdAt = new Date(firstNote.created_at)
    return {
      date: createdAt.toISOString().split('T')[0],
      time: createdAt.toTimeString().slice(0, 5)
    }
  }

  const startEditing = (meetingKey: string, notes: Note[]) => {
    const { date, time } = getMeetingDateTime(notes)
    const title = getMeetingTitle(notes)
    
    setEditingMeeting(meetingKey)
    setEditTitle(title)
    setEditDate(date)
    setEditTime(time)
  }

  const saveEditing = async (_meetingKey: string, notes: Note[]) => {
    try {
      const noteIds = notes.map(note => note.id)
      
      const response = await fetch('/api/update-meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note_ids: noteIds,
          title: editTitle,
          date: editDate,
          time: editTime
        })
      })

      if (response.ok) {
        // Refresh the page or update local state
        window.location.reload()
      } else {
        console.error('Failed to update meeting metadata')
      }
    } catch (error) {
      console.error('Error updating meeting:', error)
    }
    
    setEditingMeeting(null)
    setEditTitle('')
    setEditDate('')
    setEditTime('')
  }

  const cancelEditing = () => {
    setEditingMeeting(null)
    setEditTitle('')
    setEditDate('')
    setEditTime('')
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
                      {editingMeeting === meetingId ? (
                        <div 
                          className="space-y-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onFocus={(e) => e.stopPropagation()}
                            className="w-full px-2 py-1 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Meeting title"
                          />
                          <div className="flex gap-2">
                            <input
                              type="date"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onFocus={(e) => e.stopPropagation()}
                              className="flex-1 px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="time"
                              value={editTime}
                              onChange={(e) => setEditTime(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onFocus={(e) => e.stopPropagation()}
                              className="flex-1 px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                saveEditing(meetingId, meetingNotes)
                              }}
                              className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/40"
                            >
                              <Save size={12} />
                              Save
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                cancelEditing()
                              }}
                              className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                            >
                              <X size={12} />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                              {meetingTitle}
                            </h3>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                startEditing(meetingId, meetingNotes)
                              }}
                              className="opacity-60 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-all bg-slate-100/50 hover:bg-slate-200/70 dark:bg-slate-700/50 dark:hover:bg-slate-600/70 rounded-md"
                            >
                              <Edit2 size={16} />
                            </button>
                          </div>
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
                        </>
                      )}
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