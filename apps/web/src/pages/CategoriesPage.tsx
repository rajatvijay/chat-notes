import { Link } from 'react-router-dom'
import {
  MessageCircle,
  Grid,
  Settings,
} from 'lucide-react'
import { useCategoryNotes } from '../hooks/useCategoryNotes'

const categories = [
  {
    name: 'task',
    label: 'Tasks',
    emoji: '✅',
    description: 'To-dos and action items',
    color: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300',
  },
  {
    name: 'idea',
    label: 'Ideas',
    emoji: '💡',
    description: 'Creative thoughts and concepts',
    color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
  },
  {
    name: 'journal',
    label: 'Journal',
    emoji: '📖',
    description: 'Personal reflections and thoughts',
    color: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300',
  },
  {
    name: 'meeting',
    label: 'Meetings',
    emoji: '👥',
    description: 'Meeting notes and discussions',
    color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
  },
  {
    name: 'reading',
    label: 'Reading',
    emoji: '📚',
    description: 'Book notes and quotes',
    color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300',
  },
  {
    name: 'misc',
    label: 'Misc',
    emoji: '📝',
    description: 'Everything else',
    color: 'bg-slate-50 text-slate-700 dark:bg-slate-900/20 dark:text-slate-300',
  },
]

function CategoryCard({ category }: { category: (typeof categories)[0] }) {
  const { notes } = useCategoryNotes(category.name)

  return (
    <Link
      to={`/c/${category.name}`}
      className="block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${category.color} flex items-center justify-center`}>
          <span className="text-lg">{category.emoji}</span>
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-slate-800 dark:text-slate-200">
            {category.label}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </p>
        </div>
      </div>
    </Link>
  )
}

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col">
      <header className="border-b border-slate-200 dark:border-slate-700">
        <div className="p-4">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Categories
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Notes organized by type
          </p>
        </div>
      </header>

      <div className="flex-1 p-4">
        <div className="space-y-3">
          {categories.map((category) => (
            <CategoryCard key={category.name} category={category} />
          ))}
        </div>
      </div>

      <nav className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-around px-4 py-2">
          <Link
            to="/"
            className="flex flex-col items-center gap-1 py-2 px-4 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <MessageCircle size={20} />
            <span className="text-xs font-medium">Chat</span>
          </Link>

          <Link
            to="/categories"
            className="flex flex-col items-center gap-1 py-2 px-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
          >
            <Grid size={20} />
            <span className="text-xs font-medium">Notes</span>
          </Link>

          <Link
            to="/settings"
            className="flex flex-col items-center gap-1 py-2 px-4 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Settings size={20} />
            <span className="text-xs font-medium">Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
