import { useParams } from 'react-router-dom'
import NotesList from '../components/NotesList'
import { useCategoryNotes } from '../hooks/useCategoryNotes'

const categoryLabels: Record<string, string> = {
  task: 'Tasks',
  idea: 'Ideas', 
  journal: 'Journal',
  meeting: 'Meetings',
  reading: 'Reading',
  misc: 'Misc'
}

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>()
  const { notes, loading, error } = useCategoryNotes(category || '')

  if (!category || !categoryLabels[category]) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">Category not found</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading notes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Error loading notes</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <h1 className="text-2xl font-bold">{categoryLabels[category]}</h1>
        <span className="text-sm text-muted-foreground">
          ({notes.length} {notes.length === 1 ? 'note' : 'notes'})
        </span>
      </div>
      
      <NotesList notes={notes} />
    </div>
  )
}