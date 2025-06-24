import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface Note {
  id: string
  content: string
  category: string | null
  created_at: string
  source: string
}

export function useCategoryNotes(category: string) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!category) return

    const fetchNotes = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('category', category)
          .order('created_at', { ascending: false })

        if (error) throw error
        setNotes(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchNotes()
  }, [category])

  return { notes, loading, error }
}