import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-white/20 dark:border-slate-800/50 p-4">
        <div className="flex items-center gap-3 mb-4">
          <Link
            to="/categories"
            className="p-2 rounded-xl bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-800/80 border border-white/20 dark:border-slate-700/50"
          >
            <ArrowLeft size={18} className="text-slate-600 dark:text-slate-300" />
          </Link>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
            <span className="text-2xl">
              {category === 'task' ? '✅' : 
               category === 'idea' ? '💡' :
               category === 'journal' ? '📖' :
               category === 'meeting' ? '👥' :
               category === 'reading' ? '📚' : '📝'}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
              {categoryLabels[category]}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <NotesList notes={notes} />
      </div>
    </div>
  )
}