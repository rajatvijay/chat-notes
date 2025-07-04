import { Link, useLocation } from 'react-router-dom'
import {
  MessageCircle,
  Moon,
  Sun,
  Search,
  Grid,
  Settings,
  CheckSquare,
  BookOpen,
  LogOut,
} from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect, useRef } from 'react'

interface AppLayoutProps {
  children: React.ReactNode
  showHeader?: boolean
}

export default function AppLayout({ children, showHeader = true }: AppLayoutProps) {
  const { theme, toggleTheme } = useTheme()
  const { user, signOut } = useAuth()
  const location = useLocation()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true
    if (path === '/tasks' && location.pathname === '/tasks') return true
    if (path === '/reading' && location.pathname === '/reading') return true
    if (path === '/categories' && location.pathname === '/categories') return true
    if (path === '/settings' && location.pathname === '/settings') return true
    return false
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
    setShowUserMenu(false)
  }

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  return (
    <div className="h-dvh flex flex-col bg-white dark:bg-slate-900">
      {showHeader && (
        <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex-shrink-0">
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
              
              {/* User Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="User menu"
                >
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {user?.displayName || 'User'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 overflow-hidden">
        {children}
      </main>

      <nav className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex-shrink-0 sticky bottom-0 z-50 safe-bottom">
        <div className="flex items-center justify-around px-4 py-2">
          <Link
            to="/"
            className={`flex flex-col items-center gap-1 py-2 px-2 rounded-lg ${
              isActive('/') 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MessageCircle size={18} />
            <span className="text-xs font-medium">Chat</span>
          </Link>

          <Link
            to="/tasks"
            className={`flex flex-col items-center gap-1 py-2 px-2 rounded-lg ${
              isActive('/tasks')
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CheckSquare size={18} />
            <span className="text-xs font-medium">Tasks</span>
          </Link>

          <Link
            to="/reading"
            className={`flex flex-col items-center gap-1 py-2 px-2 rounded-lg ${
              isActive('/reading')
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen size={18} />
            <span className="text-xs font-medium">Reading</span>
          </Link>

          <Link
            to="/categories"
            className={`flex flex-col items-center gap-1 py-2 px-2 rounded-lg ${
              isActive('/categories')
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Grid size={18} />
            <span className="text-xs font-medium">Notes</span>
          </Link>

          <Link
            to="/settings"
            className={`flex flex-col items-center gap-1 py-2 px-2 rounded-lg ${
              isActive('/settings')
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Settings size={18} />
            <span className="text-xs font-medium">Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}