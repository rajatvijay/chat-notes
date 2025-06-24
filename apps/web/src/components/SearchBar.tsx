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

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search notes..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-9 pr-8 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && query && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="w-full text-left px-4 py-2 hover:bg-accent focus:bg-accent focus:outline-none"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm">{truncateText(result.content)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ml-2 shrink-0 ${
                      result.category === 'task' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      result.category === 'idea' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      result.category === 'journal' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      result.category === 'meeting' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      result.category === 'reading' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {result.category}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  )
}