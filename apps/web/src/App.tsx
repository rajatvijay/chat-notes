import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { Home, List, Moon, Sun } from 'lucide-react'
import ChatPage from './pages/ChatPage'
import CategoryPage from './pages/CategoryPage'
import SearchBar from './components/SearchBar'
import { useTheme } from './hooks/useTheme'

const categories = [
  { name: 'task', label: 'Tasks', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  { name: 'idea', label: 'Ideas', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { name: 'journal', label: 'Journal', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { name: 'meeting', label: 'Meetings', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { name: 'reading', label: 'Reading', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  { name: 'misc', label: 'Misc', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
]

function App() {
  const location = useLocation()
  const isChat = location.pathname === '/'
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-background max-w-sm mx-auto flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="text-xl font-bold">
            Chat Notes
          </Link>
          <div className="flex items-center gap-2">
            <SearchBar />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-accent"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/c/:category" element={<CategoryPage />} />
        </Routes>
      </main>

      {/* Bottom Navigation */}
      <nav className="sticky bottom-0 bg-background border-t">
        <div className="flex items-center justify-around py-2">
          <Link
            to="/"
            className={`flex flex-col items-center gap-1 p-2 rounded-lg ${
              isChat ? 'text-primary bg-primary/10' : 'text-muted-foreground'
            }`}
          >
            <Home size={20} />
            <span className="text-xs">Chat</span>
          </Link>

          <div className="flex gap-1 overflow-x-auto">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/c/${cat.name}`}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg min-w-max ${
                  location.pathname === `/c/${cat.name}`
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground'
                }`}
              >
                <List size={16} />
                <span className="text-xs">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </div>
  )
}

export default App