import { useState, useRef, useEffect } from 'react'
import { Send, ChevronDown } from 'lucide-react'

interface ComposerProps {
  onSend: (content: string, category: string) => void
}

const categories = [
  { value: 'auto', label: 'Auto ✨', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  { value: 'task', label: 'Task', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  { value: 'idea', label: 'Idea', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  { value: 'journal', label: 'Journal', color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
  { value: 'meeting', label: 'Meeting', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  { value: 'reading', label: 'Reading', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  { value: 'misc', label: 'Misc', color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300' },
]

export default function Composer({ onSend }: ComposerProps) {
  const [content, setContent] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(categories[0])
  const [isOpen, setIsOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [content])

  const handleSubmit = () => {
    if (!content.trim()) return
    
    onSend(content.trim(), selectedCategory.value)
    setContent('')
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${selectedCategory.color}`}
          >
            {selectedCategory.label}
            <ChevronDown size={12} />
          </button>
          {isOpen && (
            <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10">
              <div className="p-1">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => {
                      setSelectedCategory(category)
                      setIsOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 rounded text-xs font-medium ${
                      selectedCategory.value === category.value 
                        ? category.color
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What's on your mind?"
          className="flex-1 resize-none border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[40px] max-h-32 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-slate-200"
          rows={1}
          aria-label="Note content"
        />
        <button
          onClick={handleSubmit}
          disabled={!content.trim()}
          className={`p-2 rounded-lg ${
            content.trim()
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
          }`}
          aria-label="Send note"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}