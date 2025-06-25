import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import NotesList from '../components/NotesList'
import TasksList from '../components/TasksList'
import IdeasList from '../components/IdeasList'
import JournalList from '../components/JournalList'
import MeetingsList from '../components/MeetingsList'
import ReadingList from '../components/ReadingList'
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
        <p className="text-slate-500 dark:text-slate-400">Category not found</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-300 border-t-slate-600 dark:border-slate-600 dark:border-t-slate-300"></div>
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
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <header className="border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 p-4">
          <Link
            to="/categories"
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft size={18} className="text-slate-600 dark:text-slate-400" />
          </Link>
          <span className="text-xl">
            {category === 'task' ? '✅' : 
             category === 'idea' ? '💡' :
             category === 'journal' ? '📖' :
             category === 'meeting' ? '👥' :
             category === 'reading' ? '📚' : '📝'}
          </span>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {categoryLabels[category]}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </p>
          </div>
        </div>
      </header>
      
      <div className="p-4">
        {category === 'task' && <TasksList notes={notes} />}
        {category === 'idea' && <IdeasList notes={notes} />}
        {category === 'journal' && <JournalList notes={notes} />}
        {category === 'meeting' && <MeetingsList notes={notes} />}
        {category === 'reading' && <ReadingList notes={notes} />}
        {category === 'misc' && <NotesList notes={notes} />}
      </div>
    </div>
  )
}