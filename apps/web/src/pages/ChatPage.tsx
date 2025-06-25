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
                className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-violet-200/30 dark:border-violet-500/20 rounded-3xl p-5 shadow-xl shadow-violet-500/5 hover:shadow-2xl hover:shadow-violet-500/10"
              >
                <p className="text-slate-800 dark:text-slate-100 text-sm leading-relaxed mb-4 font-medium">
                  {note.content}
                </p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-4 py-2 rounded-full font-semibold shadow-lg ${
                    note.category === 'task' ? 'bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-rose-500/30' :
                    note.category === 'idea' ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-white shadow-amber-500/30' :
                    note.category === 'journal' ? 'bg-gradient-to-r from-emerald-400 to-green-400 text-white shadow-emerald-500/30' :
                    note.category === 'meeting' ? 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white shadow-blue-500/30' :
                    note.category === 'reading' ? 'bg-gradient-to-r from-purple-400 to-violet-400 text-white shadow-purple-500/30' :
                    note.category ? 'bg-gradient-to-r from-slate-400 to-gray-400 text-white shadow-slate-500/30' :
                    'bg-gradient-to-r from-violet-400 to-fuchsia-400 text-white shadow-violet-500/30'
                  }`}>
                    {note.category || 'classifying...'}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
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
      <div className="flex-shrink-0 border-t border-violet-200/40 dark:border-violet-500/30 bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl shadow-2xl shadow-violet-500/10">
        <Composer onSend={handleNoteInsert} />
      </div>
    </div>
  )
}