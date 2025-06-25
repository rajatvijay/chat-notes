import { useState, useEffect } from 'react'
import { MessageCircle, Edit2, Save, X, Calendar, Clock, Link, User, Hash } from 'lucide-react'
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
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [editingMetadata, setEditingMetadata] = useState<Record<string, unknown>>({})
  const [changingType, setChangingType] = useState<string | null>(null)
  const [classifyingNotes, setClassifyingNotes] = useState<Set<string>>(new Set())

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
      // First update the category
      const { error: updateError } = await supabase
        .from('notes')
        .update({ category: newCategory })
        .eq('id', noteId)

      if (updateError) throw updateError

      // Then extract metadata for the new category
      const note = notes.find(n => n.id === noteId)
      if (note) {
        const response = await fetch('/api/extract-metadata', {
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
          // Update local state with new category and metadata
          setNotes(prev => prev.map(n => 
            n.id === noteId ? { ...n, category: newCategory, metadata } : n
          ))
        } else {
          // If metadata extraction fails, just update category
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
      const response = await fetch('/api/update-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note_id: noteId,
          metadata: editingMetadata
        })
      })

      if (response.ok) {
        await fetchRecentNotes()
        setEditingNote(null)
        setEditingMetadata({})
      }
    } catch (error) {
      console.error('Error updating metadata:', error)
    }
  }

  const cancelEditingMetadata = () => {
    setEditingNote(null)
    setEditingMetadata({})
  }

  const renderMetadata = (note: Note) => {
    const isEditing = editingNote === note.id
    const metadata = isEditing ? editingMetadata : note.metadata || {}

    if (!note.category || note.category === 'misc') return null

    const renderField = (key: string, value: unknown, icon: React.ReactNode, placeholder: string) => {
      if (!value && !isEditing) return null
      
      return (
        <div key={key} className="flex items-center gap-2">
          {icon}
          {isEditing ? (
            <input
              type={key === 'date' ? 'date' : key === 'time' ? 'time' : 'text'}
              value={String(value || '')}
              onChange={(e) => setEditingMetadata({ ...editingMetadata, [key]: e.target.value })}
              placeholder={placeholder}
              className="flex-1 px-2 py-1 text-xs bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <span className="text-xs text-slate-600 dark:text-slate-300">{String(value)}</span>
          )}
        </div>
      )
    }

    const fields: Array<[string, React.ReactNode, string]> = []

    if (note.category === 'task') {
      fields.push(['due_date', <Calendar size={12} className="text-rose-500" />, 'Due date'])
    } else if (note.category === 'idea') {
      fields.push(['title', <Hash size={12} className="text-amber-500" />, 'Title'])
      fields.push(['summary', <Edit2 size={12} className="text-amber-500" />, 'Summary'])
    } else if (note.category === 'meeting') {
      fields.push(['title', <User size={12} className="text-blue-500" />, 'Meeting title'])
      fields.push(['date', <Calendar size={12} className="text-blue-500" />, 'Date'])
      fields.push(['time', <Clock size={12} className="text-blue-500" />, 'Time'])
    } else if (note.category === 'reading') {
      fields.push(['link', <Link size={12} className="text-purple-500" />, 'Link'])
      fields.push(['title', <Hash size={12} className="text-purple-500" />, 'Title'])
      fields.push(['summary', <Edit2 size={12} className="text-purple-500" />, 'Summary'])
    }

    if (fields.length === 0 && !isEditing) return null

    return (
      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
        <div className="space-y-2">
          {fields.map(([key, icon, placeholder]) => renderField(key, metadata[key], icon, placeholder))}
          {isEditing && (
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => saveMetadata(note.id)}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/40"
              >
                <Save size={12} />
                Save
              </button>
              <button
                onClick={cancelEditingMetadata}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <X size={12} />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages - Scrollable */}
      <div className="flex-1 overflow-y-auto px-3 py-6 pb-0">
        <div className="space-y-5 pb-6">
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500/20 via-fuchsia-500/20 to-pink-500/20 flex items-center justify-center mb-6 shadow-2xl shadow-violet-500/10">
                <MessageCircle size={36} className="text-violet-500 dark:text-violet-400" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent mb-3">
                Ready to capture your thoughts?
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xs leading-relaxed">
                Start by typing something below. I'll automatically organize it for you! ✨
              </p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-violet-200/30 dark:border-violet-500/20 rounded-3xl p-5 shadow-xl shadow-violet-500/5 hover:shadow-2xl hover:shadow-violet-500/10 group"
              >
                <p className="text-slate-800 dark:text-slate-100 text-sm leading-relaxed mb-4 font-medium">
                  {note.content}
                </p>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <select
                      value={note.category || ''}
                      onChange={(e) => handleTypeChange(note.id, e.target.value)}
                      disabled={changingType === note.id || classifyingNotes.has(note.id)}
                      className={`text-xs px-3 py-1 rounded-full font-semibold shadow-lg border-none outline-none cursor-pointer ${
                        note.category === 'task' ? 'bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-rose-500/30' :
                        note.category === 'idea' ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-white shadow-amber-500/30' :
                        note.category === 'journal' ? 'bg-gradient-to-r from-emerald-400 to-green-400 text-white shadow-emerald-500/30' :
                        note.category === 'meeting' ? 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white shadow-blue-500/30' :
                        note.category === 'reading' ? 'bg-gradient-to-r from-purple-400 to-violet-400 text-white shadow-purple-500/30' :
                        note.category ? 'bg-gradient-to-r from-slate-400 to-gray-400 text-white shadow-slate-500/30' :
                        'bg-gradient-to-r from-violet-400 to-fuchsia-400 text-white shadow-violet-500/30'
                      } ${(changingType === note.id || classifyingNotes.has(note.id)) ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                      <div className="animate-spin h-4 w-4 border-2 border-violet-500 border-t-transparent rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {(note.metadata && Object.keys(note.metadata).length > 0) && (
                      <button
                        onClick={() => startEditingMetadata(note)}
                        className="opacity-60 group-hover:opacity-100 p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-all bg-slate-100/50 hover:bg-slate-200/70 dark:bg-slate-700/50 dark:hover:bg-slate-600/70 rounded"
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                      {new Date(note.created_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>

                {renderMetadata(note)}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Fixed Composer at Bottom */}
      <div className="flex-shrink-0 border-t border-violet-200/40 dark:border-violet-500/30 bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl shadow-2xl shadow-violet-500/10">
        <Composer onSend={handleNoteInsert} />
      </div>
    </div>
  )
}