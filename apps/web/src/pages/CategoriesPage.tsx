import { Link } from 'react-router-dom'
import { CheckSquare, Lightbulb, BookOpen, Users, Book, MoreHorizontal, MessageCircle, Grid, Settings } from 'lucide-react'
import { useCategoryNotes } from '../hooks/useCategoryNotes'

const categories = [
  { 
    name: 'task', 
    label: 'Tasks', 
    icon: CheckSquare,
    emoji: '✅',
    description: 'To-dos and action items',
    color: 'bg-gradient-to-br from-rose-100 to-pink-100 text-rose-700 dark:from-rose-900/30 dark:to-pink-900/30 dark:text-rose-300'
  },
  { 
    name: 'idea', 
    label: 'Ideas', 
    icon: Lightbulb,
    emoji: '💡',
    description: 'Creative thoughts and concepts',
    color: 'bg-gradient-to-br from-amber-100 to-yellow-100 text-amber-700 dark:from-amber-900/30 dark:to-yellow-900/30 dark:text-amber-300'
  },
  { 
    name: 'journal', 
    label: 'Journal', 
    icon: BookOpen,
    emoji: '📖',
    description: 'Personal reflections and thoughts',
    color: 'bg-gradient-to-br from-emerald-100 to-green-100 text-emerald-700 dark:from-emerald-900/30 dark:to-green-900/30 dark:text-emerald-300'
  },
  { 
    name: 'meeting', 
    label: 'Meetings', 
    icon: Users,
    emoji: '👥',
    description: 'Meeting notes and discussions',
    color: 'bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-700 dark:from-blue-900/30 dark:to-cyan-900/30 dark:text-blue-300'
  },
  { 
    name: 'reading', 
    label: 'Reading', 
    icon: Book,
    emoji: '📚',
    description: 'Book notes and quotes',
    color: 'bg-gradient-to-br from-purple-100 to-violet-100 text-purple-700 dark:from-purple-900/30 dark:to-violet-900/30 dark:text-purple-300'
  },
  { 
    name: 'misc', 
    label: 'Misc', 
    icon: MoreHorizontal,
    emoji: '📝',
    description: 'Everything else',
    color: 'bg-gradient-to-br from-slate-100 to-gray-100 text-slate-700 dark:from-slate-900/30 dark:to-gray-900/30 dark:text-slate-300'
  },
]

function CategoryCard({ category }: { category: typeof categories[0] }) {
  const { notes } = useCategoryNotes(category.name)
  const IconComponent = category.icon

  return (
    <Link
      to={`/c/${category.name}`}
      className="block bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 rounded-2xl p-4 hover:bg-white/80 dark:hover:bg-slate-800/80"
    >
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 rounded-2xl ${category.color} flex items-center justify-center shrink-0`}>
          <span className="text-xl">{category.emoji}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
            {category.label}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            {category.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </span>
            <IconComponent size={16} className="text-slate-400 dark:text-slate-500" />
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col">
      <div className="flex-1 p-4 pb-20">
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent mb-2">
              Your Notes
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Organized by category
            </p>
          </div>

          <div className="space-y-3">
            {categories.map((category) => (
              <CategoryCard key={category.name} category={category} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-white/20 dark:border-slate-800/50 z-40">
        <div className="flex items-center justify-around p-3">
          <Link
            to="/"
            className="flex flex-col items-center gap-1 p-3 rounded-2xl min-w-max text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50"
          >
            <MessageCircle size={20} />
            <span className="text-xs font-medium">Chat</span>
          </Link>

          <Link
            to="/categories"
            className="flex flex-col items-center gap-1 p-3 rounded-2xl min-w-max bg-gradient-to-br from-blue-500 to-purple-600 text-white"
          >
            <Grid size={20} />
            <span className="text-xs font-medium">Notes</span>
          </Link>

          <Link
            to="/settings"
            className="flex flex-col items-center gap-1 p-3 rounded-2xl min-w-max text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50"
          >
            <Settings size={20} />
            <span className="text-xs font-medium">Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}