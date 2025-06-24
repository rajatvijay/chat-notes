import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { MessageCircle, Moon, Sun, Sparkles, Search, Grid, Settings } from 'lucide-react'
import ChatPage from './pages/ChatPage'
import CategoryPage from './pages/CategoryPage'
import CategoriesPage from './pages/CategoriesPage'
import SearchPage from './pages/SearchPage'
import SettingsPage from './pages/SettingsPage'
import { useTheme } from './hooks/useTheme'


function App() {
  const location = useLocation()
  const isChat = location.pathname === '/'
  const isCategoriesPage = location.pathname === '/categories'
  const isSearchPage = location.pathname === '/search'
  const isSettingsPage = location.pathname === '/settings'
  const showBottomNav = isChat || isCategoriesPage || isSettingsPage
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="max-w-sm mx-auto">
      <Routes>
        <Route path="/" element={
          <div className="h-screen flex flex-col relative overflow-hidden">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-white/20 dark:border-slate-800/50">
              <div className="flex items-center justify-between px-4 py-3">
                <Link 
                  to="/" 
                  className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  Chat Notes
                </Link>
                <div className="flex items-center gap-2">
                  <Link
                    to="/search"
                    className="p-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-800/80 border border-white/20 dark:border-slate-700/50 backdrop-blur-sm"
                  >
                    <Search size={18} className="text-slate-600 dark:text-slate-300" />
                  </Link>
                  <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-800/80 border border-white/20 dark:border-slate-700/50 backdrop-blur-sm"
                    aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                  >
                    {theme === 'light' ? (
                      <Moon size={18} className="text-slate-600 dark:text-slate-300" />
                    ) : (
                      <Sun size={18} className="text-amber-500" />
                    )}
                  </button>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden relative z-10">
              <ChatPage />
            </main>

            {/* Bottom Navigation */}
            <nav className="sticky bottom-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-white/20 dark:border-slate-800/50 z-40">
              <div className="flex items-center justify-around p-3">
                <Link
                  to="/"
                  className="flex flex-col items-center gap-1 p-3 rounded-2xl min-w-max bg-gradient-to-br from-blue-500 to-purple-600 text-white"
                >
                  <MessageCircle size={20} />
                  <span className="text-xs font-medium">Chat</span>
                </Link>

                <Link
                  to="/categories"
                  className="flex flex-col items-center gap-1 p-3 rounded-2xl min-w-max text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50"
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
        } />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/c/:category" element={<CategoryPage />} />
      </Routes>
    </div>
  )
}

export default App