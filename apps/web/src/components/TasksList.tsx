import React, { useState, useMemo } from 'react'
import { Clock, Check, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@chatnotes/ui'
import { useTaskCompletions } from '../hooks/useTaskCompletions'
import { useTaskOperations } from '../hooks/useTaskOperations'
import { useNoteOperations } from '../hooks/useNoteOperations'
import DueDatePicker from './DueDatePicker'

interface Note {
  id: string
  content: string
  category: string | null
  created_at: string
  source: string
  metadata?: {
    due_date?: string
    completed?: boolean
    cleaned_content?: string
  }
}

interface TasksListProps {
  notes: Note[]
  onNoteDeleted?: () => void
}

export default function TasksList({ notes, onNoteDeleted }: TasksListProps) {
  const [selectedTask, setSelectedTask] = useState<Note | null>(null)
  const [localNotes, setLocalNotes] = useState<Note[]>(notes)
  const noteIds = useMemo(() => localNotes.map(note => note.id), [localNotes])
  const { toggleCompletion, isCompleted } = useTaskCompletions(noteIds)
  const { toggleTaskCompletion, setTaskDueDate } = useTaskOperations()
  const { deleteNote, isDeleting } = useNoteOperations()

  // Update local notes when props change
  React.useEffect(() => {
    setLocalNotes(notes)
  }, [notes])

  if (localNotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 flex items-center justify-center mb-4">
          <span className="text-2xl">✅</span>
        </div>
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
          No tasks yet
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Your tasks will appear here once categorized
        </p>
      </div>
    )
  }

  const handleToggleComplete = async (taskId: string) => {
    const currentlyCompleted = isCompleted(taskId)
    const newCompletedState = !currentlyCompleted
    
    // Optimistically update UI
    toggleCompletion(taskId)
    
    // Persist to database
    const success = await toggleTaskCompletion(taskId, newCompletedState)
    if (!success) {
      // Revert on failure
      toggleCompletion(taskId)
    }
  }

  const handleSetDueDate = async (noteId: string, dueDate: string) => {
    const success = await setTaskDueDate(noteId, dueDate)
    if (success) {
      // Refresh the page or update local state
      window.location.reload()
    }
    return success
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return
    }
    
    // Store original note for rollback
    const originalNote = localNotes.find(note => note.id === noteId)
    
    const success = await deleteNote(
      noteId,
      // Optimistic update: immediately remove from local state
      () => {
        setLocalNotes(prev => prev.filter(note => note.id !== noteId))
      },
      // Rollback: restore the note if delete fails
      () => {
        if (originalNote) {
          setLocalNotes(prev => [...prev, originalNote].sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          ))
        }
      }
    )
    
    // Only call onNoteDeleted if successful (for parent component refresh)
    if (success && onNoteDeleted) {
      // Small delay to allow animation to complete
      setTimeout(() => {
        onNoteDeleted()
      }, 300)
    }
  }

  const truncateText = (text: string, length: number = 80) => {
    return text.length > length ? text.substring(0, length) + '...' : text
  }

  const getDisplayContent = (note: Note) => {
    // Use cleaned content from metadata if available, otherwise use original content
    return note.metadata?.cleaned_content || note.content
  }

  const formatDueDate = (dateString?: string) => {
    if (!dateString) return null
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { text: 'Overdue', color: 'text-red-600 dark:text-red-400' }
    if (diffDays === 0) return { text: 'Today', color: 'text-orange-600 dark:text-orange-400' }
    if (diffDays === 1) return { text: 'Tomorrow', color: 'text-blue-600 dark:text-blue-400' }
    if (diffDays <= 7) return { text: `${diffDays} days`, color: 'text-green-600 dark:text-green-400' }
    return { text: date.toLocaleDateString(), color: 'text-slate-600 dark:text-slate-400' }
  }

  return (
    <div className="space-y-3">
      {localNotes.map((note) => {
        const taskCompleted = isCompleted(note.id)
        const dueDate = formatDueDate(note.metadata?.due_date)
        
        return (
          <Dialog
            key={note.id}
            onOpenChange={(open) => !open && setSelectedTask(null)}
          >
            <div className={`group bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 rounded-2xl p-4 shadow-sm transition-all duration-300 ${
              isDeleting(note.id) ? 'opacity-0 scale-95 translate-x-4' : 'opacity-100 scale-100 translate-x-0'
            }`}>
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleToggleComplete(note.id)}
                  className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    taskCompleted
                      ? 'bg-rose-500 border-rose-500 text-white'
                      : 'border-slate-300 dark:border-slate-600 hover:border-rose-400 dark:hover:border-rose-500'
                  }`}
                >
                  {taskCompleted && <Check size={12} strokeWidth={3} />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <DialogTrigger asChild>
                    <div 
                      className="cursor-pointer"
                      onClick={() => setSelectedTask(note)}
                    >
                      <p className={`text-slate-700 dark:text-slate-200 text-sm leading-relaxed mb-3 break-words overflow-wrap-anywhere ${
                        taskCompleted ? 'line-through opacity-60' : ''
                      }`}>
                        {truncateText(getDisplayContent(note))}
                      </p>
                    </div>
                  </DialogTrigger>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {dueDate && (
                        <div className={`flex items-center gap-1 text-xs ${dueDate.color}`}>
                          <Clock size={12} />
                          <span className="font-medium">{dueDate.text}</span>
                        </div>
                      )}
                      <DueDatePicker
                        noteId={note.id}
                        currentDueDate={note.metadata?.due_date}
                        onDueDateSet={handleSetDueDate}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                        {new Date(note.created_at).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteNote(note.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                        title="Delete task"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {selectedTask && selectedTask.id === note.id && (
              <DialogContent className="max-w-lg mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-slate-700/30">
                <DialogHeader className="pb-4">
                  <DialogTitle className="flex items-center justify-between text-lg">
                    <span className="bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                      Task Details
                    </span>
                    <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 dark:from-rose-900/40 dark:to-pink-900/40 dark:text-rose-300">
                      ✅ Task
                    </span>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                    <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed break-words overflow-wrap-anywhere">
                      {getDisplayContent(selectedTask)}
                    </p>
                  </div>
                  
                  {selectedTask.metadata?.due_date && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <Clock size={16} className="text-blue-600 dark:text-blue-400" />
                      <span className="text-sm text-blue-700 dark:text-blue-300">
                        Due: {new Date(selectedTask.metadata.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>
                      {new Date(selectedTask.created_at).toLocaleDateString([], {
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
                        selectedTask.source === 'auto'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {selectedTask.source === 'auto' ? '🤖 Auto' : '👤 Manual'}
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