import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'

export function useTaskCompletions(noteIds: string[]) {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  // Memoize the noteIds to prevent unnecessary re-fetches
  const memoizedNoteIds = useMemo(() => noteIds, [noteIds.join(',')])

  useEffect(() => {
    if (memoizedNoteIds.length === 0) {
      setCompletedTasks(new Set())
      setLoading(false)
      return
    }

    const fetchCompletions = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('task_completions')
          .select('note_id')
          .in('note_id', memoizedNoteIds)

        if (error) throw error

        const completedSet = new Set(data.map(item => item.note_id))
        setCompletedTasks(completedSet)
      } catch (err) {
        console.error('Error fetching task completions:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCompletions()
  }, [memoizedNoteIds])

  const toggleCompletion = (noteId: string) => {
    setCompletedTasks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(noteId)) {
        newSet.delete(noteId)
      } else {
        newSet.add(noteId)
      }
      return newSet
    })
  }

  return {
    completedTasks,
    loading,
    toggleCompletion,
    isCompleted: (noteId: string) => completedTasks.has(noteId)
  }
}