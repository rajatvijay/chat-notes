import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface Note {
  id: string
  content: string
  category: string | null
  created_at: string
  source: string
  metadata?: Record<string, unknown>
}

export function useCategoryNotes(category: string) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

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
          .is('deleted_at', null)
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
  }, [category, refreshTrigger])

  const refetch = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return { notes, loading, error, refetch }
}