import { useState } from 'react'

export function useNoteOperations() {
  const [loading, setLoading] = useState(false)
  const [deletingNotes, setDeletingNotes] = useState<Set<string>>(new Set())

  const deleteNote = async (
    noteId: string, 
    optimisticUpdate?: () => void,
    rollback?: () => void
  ): Promise<boolean> => {
    setLoading(true)
    setDeletingNotes(prev => new Set(prev).add(noteId))

    // Perform optimistic update immediately
    if (optimisticUpdate) {
      optimisticUpdate()
    }

    try {
      const response = await fetch('/api/metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'soft_delete',
          note_id: noteId,
        }),
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete note')
      }

      return result.success
    } catch (error) {
      console.error('Error deleting note:', error)
      
      // Rollback optimistic update on error
      if (rollback) {
        rollback()
      }
      
      return false
    } finally {
      setLoading(false)
      setDeletingNotes(prev => {
        const newSet = new Set(prev)
        newSet.delete(noteId)
        return newSet
      })
    }
  }

  const isDeleting = (noteId: string) => deletingNotes.has(noteId)

  return {
    deleteNote,
    loading,
    isDeleting,
  }
}