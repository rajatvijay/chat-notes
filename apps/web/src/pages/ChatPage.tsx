import { useState, useEffect } from 'react'
import { MessageCircle } from 'lucide-react'
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


  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-300 border-t-slate-600 dark:border-slate-600 dark:border-t-slate-300"></div>
      </div>
    )
  }

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case 'task': return 'text-red-600 dark:text-red-400'
      case 'idea': return 'text-amber-600 dark:text-amber-400'
      case 'journal': return 'text-green-600 dark:text-green-400'
      case 'meeting': return 'text-blue-600 dark:text-blue-400'
      case 'reading': return 'text-purple-600 dark:text-purple-400'
      default: return 'text-slate-600 dark:text-slate-400'
    }
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
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-medium ${getCategoryColor(note.category)}`}>
                        {classifyingNotes.has(note.id) ? 'Classifying...' : (note.category || 'uncategorized')}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500">
                        {new Date(note.created_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
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
  )
}