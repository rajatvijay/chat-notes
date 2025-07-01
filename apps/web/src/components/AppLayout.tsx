import { Link, useLocation } from 'react-router-dom'
import {
  MessageCircle,
  Moon,
  Sun,
  Search,
  Grid,
  Settings,
  CheckSquare,
} from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

interface AppLayoutProps {
  children: React.ReactNode
  showHeader?: boolean
}

export default function AppLayout({ children, showHeader = true }: AppLayoutProps) {
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true
    if (path === '/tasks' && location.pathname === '/tasks') return true
    if (path === '/categories' && location.pathname === '/categories') return true
    if (path === '/settings' && location.pathname === '/settings') return true
    return false
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-slate-900">
      {showHeader && (
        <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between px-4 py-3">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo-optimized.png" alt="ChatNotes" className="w-8 h-8 object-contain" />
              <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">ChatNotes</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                to="/search"
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Search"
              >
                <Search size={18} className="text-slate-600 dark:text-slate-400" />
              </Link>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? (
                  <Moon size={18} className="text-slate-600 dark:text-slate-400" />
                ) : (
                  <Sun size={18} className="text-amber-500" />
                )}
              </button>
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 overflow-hidden">
        {children}
      </main>

      <nav className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-around px-4 py-2">
          <Link
            to="/"
            className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg ${
              isActive('/') 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MessageCircle size={20} />
            <span className="text-xs font-medium">Chat</span>
          </Link>

          <Link
            to="/tasks"
            className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg ${
              isActive('/tasks')
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CheckSquare size={20} />
            <span className="text-xs font-medium">Tasks</span>
          </Link>

          <Link
            to="/categories"
            className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg ${
              isActive('/categories')
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Grid size={20} />
            <span className="text-xs font-medium">Notes</span>
          </Link>

          <Link
            to="/settings"
            className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg ${
              isActive('/settings')
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Settings size={20} />
            <span className="text-xs font-medium">Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}