import { useState, useEffect } from 'react'
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
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {notes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No notes yet. Start by typing something below!</p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="motion-safe:animate-slideIn bg-card border rounded-lg p-3 shadow-sm"
            >
              <p className="text-sm">{note.content}</p>
              <div className="flex items-center justify-between mt-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  note.category === 'task' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  note.category === 'idea' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  note.category === 'journal' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  note.category === 'meeting' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  note.category === 'reading' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                }`}>
                  {note.category || 'classifying...'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(note.created_at).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Composer */}
      <div className="border-t bg-background">
        <Composer onSend={handleNoteInsert} />
      </div>
    </div>
  )
}