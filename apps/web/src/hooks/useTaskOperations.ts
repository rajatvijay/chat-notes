import { useState } from 'react'
import { useAuthenticatedFetch } from './useAuthenticatedFetch'

export function useTaskOperations() {
  const [loading, setLoading] = useState(false)
  const { authenticatedFetch } = useAuthenticatedFetch()

  const toggleTaskCompletion = async (noteId: string, completed: boolean) => {
    setLoading(true)
    try {
      const response = await authenticatedFetch('/api/metadata', {
        method: 'POST',
        body: JSON.stringify({
          action: 'task_completion',
          note_id: noteId,
          completed: completed
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update task completion')
      }

      return true
    } catch (error) {
      console.error('Error toggling task completion:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const setTaskDueDate = async (noteId: string, dueDate: string) => {
    setLoading(true)
    try {
      const response = await authenticatedFetch('/api/metadata', {
        method: 'POST',
        body: JSON.stringify({
          action: 'task_due_date',
          note_id: noteId,
          due_date: dueDate
        })
      })

      if (!response.ok) {
        throw new Error('Failed to set task due date')
      }

      return true
    } catch (error) {
      console.error('Error setting task due date:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    toggleTaskCompletion,
    setTaskDueDate,
    loading
  }
}