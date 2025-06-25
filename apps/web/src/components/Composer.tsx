import { useState, useRef, useEffect } from 'react'
import { Send, ChevronDown, Wand2 } from 'lucide-react'
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
    <div className="px-4 py-5">
      {/* Category Selector Row */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 tracking-wide">Category:</span>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <button className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold shadow-lg backdrop-blur-xl border border-violet-200/50 dark:border-violet-500/30 ${selectedCategory.color}`}>
              {selectedCategory.icon && <selectedCategory.icon size={14} />}
              {selectedCategory.label}
              <ChevronDown size={12} className="ml-1" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-2xl border border-violet-200/50 dark:border-violet-500/30 shadow-2xl shadow-violet-500/20 rounded-3xl" side="top">
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => {
                    setSelectedCategory(category)
                    setIsPopoverOpen(false)
                  }}
                  className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-semibold flex items-center gap-3 ${
                    selectedCategory.value === category.value 
                      ? `${category.color} shadow-lg` 
                      : 'hover:bg-violet-50/80 dark:hover:bg-violet-900/30 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {category.icon && <category.icon size={16} />}
                  {category.label}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Input Row */}
      <div className="flex items-end gap-4">
        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's on your mind? ✨"
            className="w-full resize-none border-0 rounded-3xl px-5 py-4 text-sm bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-violet-200/50 dark:border-violet-500/30 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 min-h-[52px] max-h-36 placeholder:text-slate-500 dark:placeholder:text-slate-400 text-slate-800 dark:text-slate-100 font-medium shadow-xl shadow-violet-500/5"
            rows={1}
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSubmit}
          disabled={!content.trim()}
          className={`p-4 rounded-3xl shadow-xl ${
            content.trim()
              ? 'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 text-white shadow-violet-500/30 hover:shadow-violet-500/40'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-slate-500/10'
          }`}
        >
          <Send size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}