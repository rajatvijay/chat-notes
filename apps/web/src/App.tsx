import { Routes, Route, Link } from 'react-router-dom'
import {
  MessageCircle,
  Moon,
  Sun,
  Sparkles,
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
    <div className="max-w-lg mx-auto">
      <Routes>
        <Route
          path="/"
          element={
            <div className="h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-rose-50/50 via-violet-50/50 to-blue-50/50 dark:from-slate-950 dark:via-violet-950/50 dark:to-slate-950">
              {/* Ambient Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-100/20 via-violet-100/20 to-blue-100/20 dark:from-violet-500/5 dark:via-fuchsia-500/5 dark:to-blue-500/5" />
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-violet-400/10 to-fuchsia-400/10 rounded-full blur-3xl -translate-y-1/2" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl translate-y-1/2" />

              {/* Header */}
              <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-b border-violet-200/30 dark:border-violet-500/20 shadow-lg shadow-violet-500/5">
                <div className="flex items-center justify-between px-4 py-4">
                  <Link
                    to="/"
                    className="flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent"
                  >
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
                      <Sparkles size={18} className="text-white" />
                    </div>
                    Chat Notes
                  </Link>
                  <div className="flex items-center gap-3">
                    <Link
                      to="/search"
                      className="p-3 rounded-2xl bg-white/60 dark:bg-slate-800/60 hover:bg-white/90 dark:hover:bg-slate-800/90 border border-violet-200/50 dark:border-violet-500/30 backdrop-blur-xl shadow-lg shadow-violet-500/10"
                    >
                      <Search
                        size={18}
                        className="text-violet-600 dark:text-violet-400"
                      />
                    </Link>
                    <button
                      onClick={toggleTheme}
                      className="p-3 rounded-2xl bg-white/60 dark:bg-slate-800/60 hover:bg-white/90 dark:hover:bg-slate-800/90 border border-violet-200/50 dark:border-violet-500/30 backdrop-blur-xl shadow-lg shadow-violet-500/10"
                      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    >
                      {theme === 'light' ? (
                        <Moon
                          size={18}
                          className="text-violet-600 dark:text-violet-400"
                        />
                      ) : (
                        <Sun size={18} className="text-amber-400" />
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
              <nav className="sticky bottom-0 bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border-t border-violet-200/40 dark:border-violet-500/30 z-40 shadow-2xl shadow-violet-500/10">
                <div className="flex items-center justify-around px-4 py-3">
                  <Link
                    to="/"
                    className="flex flex-col items-center gap-2 px-6 py-3 rounded-3xl min-w-max bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 text-white shadow-xl shadow-violet-500/30"
                  >
                    <MessageCircle size={22} strokeWidth={2.5} />
                    <span className="text-xs font-semibold tracking-wide">
                      Chat
                    </span>
                  </Link>

                  <Link
                    to="/categories"
                    className="flex flex-col items-center gap-2 px-6 py-3 rounded-3xl min-w-max text-violet-600 dark:text-violet-400 hover:bg-violet-50/80 dark:hover:bg-violet-900/30"
                  >
                    <Grid size={22} strokeWidth={2} />
                    <span className="text-xs font-semibold tracking-wide">
                      Notes
                    </span>
                  </Link>

                  <Link
                    to="/settings"
                    className="flex flex-col items-center gap-2 px-6 py-3 rounded-3xl min-w-max text-violet-600 dark:text-violet-400 hover:bg-violet-50/80 dark:hover:bg-violet-900/30"
                  >
                    <Settings size={22} strokeWidth={2} />
                    <span className="text-xs font-semibold tracking-wide">
                      Settings
                    </span>
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
