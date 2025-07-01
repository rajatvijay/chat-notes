import TasksList from '../components/TasksList'
import { useCategoryNotes } from '../hooks/useCategoryNotes'

export default function TasksPage() {
  const { notes, loading, error, refetch } = useCategoryNotes('task')

  const handleNoteDeleted = () => {
    refetch()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-300 border-t-slate-600 dark:border-slate-600 dark:border-t-slate-300"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Error loading tasks</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <TasksList notes={notes} onNoteDeleted={handleNoteDeleted} />
    </div>
  )
}