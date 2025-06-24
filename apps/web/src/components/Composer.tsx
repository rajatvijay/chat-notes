import { useState, useRef, useEffect } from 'react'
import { Send, ChevronDown, Sparkles, Wand2 } from 'lucide-react'
import { Button } from '@chatnotes/ui'
import { Popover, PopoverContent, PopoverTrigger } from '@chatnotes/ui'

interface ComposerProps {
  onSend: (content: string, category: string) => void
}

const categories = [
  { 
    value: 'auto', 
    label: 'Auto ✨', 
    color: 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 dark:from-blue-900/40 dark:to-indigo-900/40 dark:text-blue-300',
    icon: Wand2
  },
  { 
    value: 'task', 
    label: 'Task', 
    color: 'bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 dark:from-rose-900/40 dark:to-pink-900/40 dark:text-rose-300',
    icon: null
  },
  { 
    value: 'idea', 
    label: 'Idea', 
    color: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 dark:from-amber-900/40 dark:to-yellow-900/40 dark:text-amber-300',
    icon: null
  },
  { 
    value: 'journal', 
    label: 'Journal', 
    color: 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 dark:from-emerald-900/40 dark:to-green-900/40 dark:text-emerald-300',
    icon: null
  },
  { 
    value: 'meeting', 
    label: 'Meeting', 
    color: 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 dark:from-blue-900/40 dark:to-cyan-900/40 dark:text-blue-300',
    icon: null
  },
  { 
    value: 'reading', 
    label: 'Reading', 
    color: 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 dark:from-purple-900/40 dark:to-violet-900/40 dark:text-purple-300',
    icon: null
  },
  { 
    value: 'misc', 
    label: 'Misc', 
    color: 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 dark:from-slate-900/40 dark:to-gray-900/40 dark:text-slate-300',
    icon: null
  },
]

export default function Composer({ onSend }: ComposerProps) {
  const [content, setContent] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(categories[0])
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
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
    setIsPopoverOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="px-3 py-4">
      {/* Category Selector Row */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Category:</span>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <button className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium ${selectedCategory.color}`}>
              {selectedCategory.icon && <selectedCategory.icon size={12} />}
              {selectedCategory.label}
              <ChevronDown size={12} className="ml-1" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-white/20 dark:border-slate-700/30" side="top">
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => {
                    setSelectedCategory(category)
                    setIsPopoverOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                    selectedCategory.value === category.value 
                      ? `${category.color} shadow-sm` 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {category.icon && <category.icon size={14} />}
                  {category.label}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Input Row */}
      <div className="flex items-end gap-3">
        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's on your mind? ✨"
            className="w-full resize-none border-0 rounded-2xl px-4 py-3 text-sm bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 min-h-[48px] max-h-32 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            rows={1}
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSubmit}
          disabled={!content.trim()}
          className={`p-3 rounded-2xl ${
            content.trim()
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
          }`}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}