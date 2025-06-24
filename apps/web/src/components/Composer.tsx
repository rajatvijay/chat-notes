import { useState, useRef, useEffect } from 'react'
import { Send, ChevronDown } from 'lucide-react'
import { Button } from '@chatnotes/ui'
import { Popover, PopoverContent, PopoverTrigger } from '@chatnotes/ui'

interface ComposerProps {
  onSend: (content: string, category: string) => void
}

const categories = [
  { value: 'auto', label: 'Auto', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'task', label: 'Task', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  { value: 'idea', label: 'Idea', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'journal', label: 'Journal', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'meeting', label: 'Meeting', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'reading', label: 'Reading', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  { value: 'misc', label: 'Misc', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
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
    <div className="p-4">
      <div className="flex items-end gap-2">
        {/* Category Selector */}
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-1"
            >
              <span className={`w-2 h-2 rounded-full ${selectedCategory.color.split(' ')[0]}`} />
              {selectedCategory.label}
              <ChevronDown size={14} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-2" side="top">
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => {
                    setSelectedCategory(category)
                    setIsPopoverOpen(false)
                  }}
                  className={`w-full text-left px-2 py-1 rounded text-sm hover:bg-accent flex items-center gap-2 ${
                    selectedCategory.value === category.value ? 'bg-accent' : ''
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${category.color.split(' ')[0]}`} />
                  {category.label}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your note..."
            className="w-full resize-none border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-h-[40px] max-h-32"
            rows={1}
          />
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSubmit}
          disabled={!content.trim()}
          size="sm"
          className="shrink-0"
        >
          <Send size={16} />
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Press Cmd/Ctrl + Enter to send
      </p>
    </div>
  )
}