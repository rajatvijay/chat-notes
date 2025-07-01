import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { useDebounce } from '../hooks/useDebounce'

interface SearchResult {
  id: string
  content: string
  category: string | null
  created_at: string
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 300)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Search function
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([])
      return
    }

    const performSearch = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: debouncedQuery })
        })
        
        if (response.ok) {
          const data = await response.json()
          setResults(data.results.slice(0, 5)) // Limit to 5 results
        }
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setLoading(false)
      }
    }

    performSearch()
  }, [debouncedQuery])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setIsOpen(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && results.length > 0) {
      handleResultClick(results[0])
    }
    if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  const handleResultClick = (result: SearchResult) => {
    navigate(`/c/${result.category}#${result.id}`)
    setIsOpen(false)
    setQuery('')
    inputRef.current?.blur()
    
    // Scroll to note after navigation
    setTimeout(() => {
      const element = document.getElementById(result.id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const truncateText = (text: string, length: number = 50) => {
    return text.length > length ? text.substring(0, length) + '...' : text
  }

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'task': return '✅'
      case 'idea': return '💡'
      case 'journal': return '📖'
      case 'meeting': return '👥'
      case 'reading': return '📚'
      default: return '📝'
    }
  }


  return (
    <div className="relative">
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
          query || isOpen 
            ? 'text-blue-500 dark:text-blue-400' 
            : 'text-slate-400 dark:text-slate-500'
        }`} size={16} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search notes..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-10 py-2 text-base bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-700 dark:text-slate-200"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && query && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
        >
          {loading ? (
            <div className="p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500/20 border-t-blue-500"></div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Searching...</span>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="p-1">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="w-full text-left p-3 rounded hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg mt-0.5">{getCategoryEmoji(result.category || '')}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed mb-1">
                        {truncateText(result.content, 60)}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {result.category}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {new Date(result.created_at).toLocaleDateString([], { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <Search size={20} className="text-slate-400 dark:text-slate-500 mx-auto mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">No results found</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try different keywords</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}