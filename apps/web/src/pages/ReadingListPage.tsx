import ReadingList from '../components/ReadingList'
import { useCategoryNotes } from '../hooks/useCategoryNotes'

export default function ReadingListPage() {
  const { notes, loading, error, refetch } = useCategoryNotes('reading')

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
        <p className="text-red-500">Error loading reading list</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <ReadingList notes={notes} onNoteDeleted={handleNoteDeleted} />
    </div>
  )
}