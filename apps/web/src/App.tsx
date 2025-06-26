import { Routes, Route, Link } from 'react-router-dom'
import {
  MessageCircle,
  Moon,
  Sun,
  Search,
  Grid,
  Settings,
} from 'lucide-react'
import ChatPage from './pages/ChatPage'
import CategoryPage from './pages/CategoryPage'
import CategoriesPage from './pages/CategoriesPage'
import SearchPage from './pages/SearchPage'
import SettingsPage from './pages/SettingsPage'
import { useTheme } from './hooks/useTheme'

function App() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="max-w-md mx-auto">
      <Routes>
        <Route
          path="/"
          element={
            <div className="h-screen flex flex-col bg-white dark:bg-slate-900">
              <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between px-4 py-3">
                  <Link to="/" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Notes
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

              <main className="flex-1 overflow-hidden">
                <ChatPage />
              </main>

              <nav className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-around px-4 py-2">
                  <Link
                    to="/"
                    className="flex flex-col items-center gap-1 py-2 px-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  >
                    <MessageCircle size={20} />
                    <span className="text-xs font-medium">Chat</span>
                  </Link>

                  <Link
                    to="/categories"
                    className="flex flex-col items-center gap-1 py-2 px-4 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
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
          }
        />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/c/:category" element={<CategoryPage />} />
      </Routes>
    </div>
  )
}

export default App
