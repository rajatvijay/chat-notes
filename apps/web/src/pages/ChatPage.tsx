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
}

export default function ChatPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentNotes()
  }, [])

  const fetchRecentNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
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
        try {
          const response = await fetch('/api/classify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ note_id: data.id, content })
          })
          
          if (response.ok) {
            const { category: newCategory } = await response.json()
            // Update local state with new category
            setNotes(prev => prev.map(note => 
              note.id === data.id ? { ...note, category: newCategory } : note
            ))
          }
        } catch (classifyError) {
          console.error('Classification error:', classifyError)
        }
      }

    } catch (error) {
      console.error('Error inserting note:', error)
    }
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
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Chat Messages - Scrollable */}
      <div className="flex-1 overflow-y-auto px-3 py-4 pb-0">
        <div className="space-y-4 pb-4">
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center mb-4">
                <MessageCircle size={32} className="text-blue-500/60" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Ready to capture your thoughts?
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs">
                Start by typing something below. I'll automatically organize it for you! ✨
              </p>
            </div>
          ) : (
            notes.map((note, index) => (
              <div
                key={note.id}
                className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 rounded-2xl p-4 shadow-lg"
              >
                <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed mb-3">
                  {note.content}
                </p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                    note.category === 'task' ? 'bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 dark:from-rose-900/40 dark:to-pink-900/40 dark:text-rose-300' :
                    note.category === 'idea' ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 dark:from-amber-900/40 dark:to-yellow-900/40 dark:text-amber-300' :
                    note.category === 'journal' ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 dark:from-emerald-900/40 dark:to-green-900/40 dark:text-emerald-300' :
                    note.category === 'meeting' ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 dark:from-blue-900/40 dark:to-cyan-900/40 dark:text-blue-300' :
                    note.category === 'reading' ? 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 dark:from-purple-900/40 dark:to-violet-900/40 dark:text-purple-300' :
                    note.category ? 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 dark:from-slate-900/40 dark:to-gray-900/40 dark:text-slate-300' :
                    'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 dark:from-blue-900/20 dark:to-indigo-900/20 dark:text-blue-400'
                  }`}>
                    {note.category || 'classifying...'}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    {new Date(note.created_at).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Fixed Composer at Bottom */}
      <div className="flex-shrink-0 border-t border-white/20 dark:border-slate-800/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
        <Composer onSend={handleNoteInsert} />
      </div>
    </div>
  )
}