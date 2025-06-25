import { useState, useEffect } from 'react'
import { MessageCircle, Edit2, Save, Calendar, Clock, Link, User, Hash } from 'lucide-react'
import Composer from '../components/Composer'
import { supabase } from '../lib/supabase'

interface Note {
  id: string
  content: string
  category: string | null
  created_at: string
  source: string
  metadata?: Record<string, unknown>
}

export default function ChatPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [classifyingNotes, setClassifyingNotes] = useState<Set<string>>(new Set())
  const [changingType, setChangingType] = useState<string | null>(null)
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [editingMetadata, setEditingMetadata] = useState<Record<string, unknown>>({})

  useEffect(() => {
    fetchRecentNotes()
  }, [])

  const fetchRecentNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('id, content, category, created_at, source, metadata')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setNotes(data || [])
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNoteInsert = async (content: string, category: string) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{ content, category: category === 'auto' ? null : category, source: category === 'auto' ? 'auto' : 'manual' }])
        .select()
        .single()

      if (error) throw error

      // Add to local state optimistically
      setNotes(prev => [data, ...prev])

      // If auto categorization, call classify endpoint
      if (category === 'auto') {
        // Add to classifying state
        setClassifyingNotes(prev => new Set([...prev, data.id]))
        
        try {
          const response = await fetch('/api/classify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ note_id: data.id, content })
          })
          
          if (response.ok) {
            const { category: newCategory, metadata } = await response.json()
            // Update local state with new category and metadata
            setNotes(prev => prev.map(note => 
              note.id === data.id ? { ...note, category: newCategory, metadata } : note
            ))
          }
        } catch (classifyError) {
          console.error('Classification error:', classifyError)
        } finally {
          // Remove from classifying state
          setClassifyingNotes(prev => {
            const newSet = new Set(prev)
            newSet.delete(data.id)
            return newSet
          })
        }
      }

    } catch (error) {
      console.error('Error inserting note:', error)
    }
  }

  const handleTypeChange = async (noteId: string, newCategory: string) => {
    setChangingType(noteId)
    
    try {
      const { error: updateError } = await supabase
        .from('notes')
        .update({ category: newCategory })
        .eq('id', noteId)

      if (updateError) throw updateError

      const note = notes.find(n => n.id === noteId)
      if (note) {
        const response = await fetch('/api/classify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            note_id: noteId, 
            content: note.content,
            category: newCategory 
          })
        })

        if (response.ok) {
          const { metadata } = await response.json()
          setNotes(prev => prev.map(n => 
            n.id === noteId ? { ...n, category: newCategory, metadata } : n
          ))
        } else {
          setNotes(prev => prev.map(n => 
            n.id === noteId ? { ...n, category: newCategory, metadata: {} } : n
          ))
        }
      }
    } catch (error) {
      console.error('Error changing type:', error)
    } finally {
      setChangingType(null)
    }
  }

  const startEditingMetadata = (note: Note) => {
    setEditingNote(note.id)
    setEditingMetadata(note.metadata || {})
  }

  const saveMetadata = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ metadata: editingMetadata })
        .eq('id', noteId)

      if (error) throw error

      setNotes(prev => prev.map(note => 
        note.id === noteId ? { ...note, metadata: editingMetadata } : note
      ))
      setEditingNote(null)
      setEditingMetadata({})
    } catch (error) {
      console.error('Error updating metadata:', error)
    }
  }

  const cancelEditingMetadata = () => {
    setEditingNote(null)
    setEditingMetadata({})
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-300 border-t-slate-600 dark:border-slate-600 dark:border-t-slate-300"></div>
      </div>
    )
  }


  const getCategoryEmoji = (category: string | null) => {
    switch (category) {
      case 'task': return '✅'
      case 'idea': return '💡'
      case 'journal': return '📖'
      case 'meeting': return '👥'
      case 'reading': return '📚'
      default: return '📝'
    }
  }


  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4">
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <MessageCircle size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Start typing below to create your first note
              </p>
            </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">{getCategoryEmoji(note.category)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed mb-2">
                      {note.content}
                    </p>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <select
                          value={note.category || ''}
                          onChange={(e) => handleTypeChange(note.id, e.target.value)}
                          disabled={changingType === note.id || classifyingNotes.has(note.id)}
                          className="text-xs px-2 py-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-50"
                        >
                          <option value="">{classifyingNotes.has(note.id) ? 'Classifying...' : 'Select type...'}</option>
                          <option value="task">Task</option>
                          <option value="idea">Idea</option>
                          <option value="journal">Journal</option>
                          <option value="meeting">Meeting</option>
                          <option value="reading">Reading</option>
                          <option value="misc">Misc</option>
                        </select>
                        {(changingType === note.id || classifyingNotes.has(note.id)) && (
                          <div className="animate-spin h-3 w-3 border border-slate-400 border-t-transparent rounded-full"></div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {note.category && note.category !== 'misc' && (
                          <button
                            onClick={() => startEditingMetadata(note)}
                            className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                            title="Edit metadata"
                          >
                            <Edit2 size={12} />
                          </button>
                        )}
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {new Date(note.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
        <div className="border-t border-slate-200 dark:border-slate-700">
          <Composer onSend={handleNoteInsert} />
        </div>
      </div>

      {/* Metadata Edit Bottom Sheet */}
      {editingNote && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/30 z-40 transition-opacity duration-300"
            onClick={cancelEditingMetadata}
          />
          
          {/* Bottom Sheet */}
          <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
            <div className="bg-white dark:bg-slate-900 rounded-t-2xl shadow-2xl max-h-[80vh] overflow-hidden">
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-8 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
              </div>
              
              {/* Header */}
              <div className="px-4 pb-4">
                <h3 className="font-medium text-slate-900 dark:text-slate-100 text-center">Edit Metadata</h3>
              </div>
              
              {/* Content */}
              <div className="px-4 pb-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {(() => {
                  const note = notes.find(n => n.id === editingNote)
                  if (!note) return null
                  
                  const fields: Array<[string, React.ReactNode, string, string]> = []
                  
                  if (note.category === 'task') {
                    fields.push(['due_date', <Calendar size={16} className="text-red-500" />, 'Due date', 'date'])
                  } else if (note.category === 'idea') {
                    fields.push(['title', <Hash size={16} className="text-amber-500" />, 'Title', 'text'])
                    fields.push(['summary', <Edit2 size={16} className="text-amber-500" />, 'Summary', 'text'])
                  } else if (note.category === 'meeting') {
                    fields.push(['title', <User size={16} className="text-blue-500" />, 'Meeting title', 'text'])
                    fields.push(['date', <Calendar size={16} className="text-blue-500" />, 'Date', 'date'])
                    fields.push(['time', <Clock size={16} className="text-blue-500" />, 'Time', 'time'])
                  } else if (note.category === 'reading') {
                    fields.push(['link', <Link size={16} className="text-purple-500" />, 'Link', 'url'])
                    fields.push(['title', <Hash size={16} className="text-purple-500" />, 'Title', 'text'])
                    fields.push(['summary', <Edit2 size={16} className="text-purple-500" />, 'Summary', 'text'])
                  }
                  
                  return fields.map(([key, icon, placeholder, type]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center gap-2">
                        {icon}
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {placeholder}
                        </label>
                      </div>
                      <input
                        type={type}
                        value={String(editingMetadata[key] || '')}
                        onChange={(e) => setEditingMetadata({ ...editingMetadata, [key]: e.target.value })}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  ))
                })()}
              </div>
              
              {/* Actions */}
              <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex gap-3">
                  <button
                    onClick={cancelEditingMetadata}
                    className="flex-1 px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => saveMetadata(editingNote)}
                    className="flex-1 px-4 py-3 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
                  >
                    <Save size={16} />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}