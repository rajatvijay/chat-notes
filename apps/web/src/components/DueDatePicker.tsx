import { useState } from 'react'
import { Calendar } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
} from '@chatnotes/ui'

interface DueDatePickerProps {
  noteId: string
  currentDueDate?: string
  onDueDateSet: (noteId: string, dueDate: string) => Promise<boolean>
}

export default function DueDatePicker({ noteId, currentDueDate, onDueDateSet }: DueDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(
    currentDueDate ? new Date(currentDueDate).toISOString().split('T')[0] : ''
  )
  const [isLoading, setIsLoading] = useState(false)

  const handleSetDueDate = async () => {
    if (!selectedDate) return

    setIsLoading(true)
    const success = await onDueDateSet(noteId, selectedDate)
    if (success) {
      setIsOpen(false)
    }
    setIsLoading(false)
  }

  const getQuickDateOptions = () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)

    return [
      { label: 'Today', date: today.toISOString().split('T')[0] },
      { label: 'Tomorrow', date: tomorrow.toISOString().split('T')[0] },
      { label: 'Next Week', date: nextWeek.toISOString().split('T')[0] },
    ]
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
          <Calendar size={12} />
          <span>{currentDueDate ? 'Change due date' : 'Set due date'}</span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-slate-700/30">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
            Set Due Date
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Quick options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Quick options:</p>
            <div className="grid grid-cols-3 gap-2">
              {getQuickDateOptions().map((option) => (
                <button
                  key={option.label}
                  onClick={() => setSelectedDate(option.date)}
                  className={`p-2 text-xs rounded-lg border transition-colors ${
                    selectedDate === option.date
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom date picker */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Or choose a custom date:</p>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => setIsOpen(false)}
              variant="outline"
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSetDueDate}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              disabled={!selectedDate || isLoading}
            >
              {isLoading ? 'Setting...' : 'Set Due Date'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}