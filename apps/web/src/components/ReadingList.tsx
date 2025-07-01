import { useState } from 'react'
import { ExternalLink, Quote, Check, CircleDot, Filter } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@chatnotes/ui'

interface Note {
  id: string
  content: string
  category: string | null
  created_at: string
  source: string
  metadata?: {
    link?: string
    title?: string
    excerpt?: boolean
    book_title?: string
    author?: string
    read?: boolean
  }
}

interface ReadingListProps {
  notes: Note[]
  onNoteDeleted?: () => void
}

export default function ReadingList({ notes, onNoteDeleted }: ReadingListProps) {
  const [selectedItem, setSelectedItem] = useState<Note | null>(null)
  const [updatingReadStatus, setUpdatingReadStatus] = useState<string | null>(null)
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  const toggleReadStatus = async (noteId: string, currentReadStatus: boolean) => {
    setUpdatingReadStatus(noteId)
    
    try {
      const response = await fetch('/api/metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_metadata',
          note_id: noteId,
          metadata: {
            read: !currentReadStatus
          }
        }),
      })

      if (response.ok) {
        // Trigger a refetch of notes
        onNoteDeleted?.()
      } else {
        console.error('Failed to update read status')
      }
    } catch (error) {
      console.error('Error updating read status:', error)
    } finally {
      setUpdatingReadStatus(null)
    }
  }

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 flex items-center justify-center mb-4">
          <span className="text-2xl">📚</span>
        </div>
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
          No reading notes yet
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Your book notes and quotes will appear here once categorized
        </p>
      </div>
    )
  }

  const truncateText = (text: string, length: number = 120) => {
    return text.length > length ? text.substring(0, length) + '...' : text
  }

  const extractLinkFromContent = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const matches = content.match(urlRegex)
    return matches ? matches[0] : null
  }

  const getItemTitle = (note: Note) => {
    if (note.metadata?.title) {
      return note.metadata.title
    }
    
    if (note.metadata?.book_title) {
      return note.metadata.book_title
    }
    
    // Extract title from content
    const lines = note.content.split('\n')
    const firstLine = lines[0]?.trim()
    
    if (firstLine && firstLine.length > 5 && firstLine.length < 80) {
      return firstLine
    }
    
    const words = note.content.split(' ')
    return words.slice(0, 6).join(' ') + (words.length > 6 ? '...' : '')
  }

  const getItemType = (note: Note) => {
    if (note.metadata?.link || extractLinkFromContent(note.content)) {
      return 'link'
    }
    return 'excerpt'
  }

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // Filter notes based on read status
  const filteredNotes = showUnreadOnly 
    ? notes.filter(note => !note.metadata?.read)
    : notes

  const unreadCount = notes.filter(note => !note.metadata?.read).length

  return (
    <div className="space-y-4">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            Reading List
          </h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            ({filteredNotes.length} {showUnreadOnly ? 'unread' : 'items'})
          </span>
        </div>
        <button
          onClick={() => setShowUnreadOnly(!showUnreadOnly)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            showUnreadOnly
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
          }`}
        >
          <Filter size={14} />
          {showUnreadOnly ? 'Show All' : `Unread (${unreadCount})`}
        </button>
      </div>

      <div className="space-y-2">
      {filteredNotes.length === 0 && showUnreadOnly ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 flex items-center justify-center mb-3">
            <span className="text-xl">📖</span>
          </div>
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">
            No unread items
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            All reading items are marked as read
          </p>
        </div>
      ) : (
        filteredNotes.map((note) => {
        const itemType = getItemType(note)
        const itemTitle = getItemTitle(note)
        const link = note.metadata?.link || extractLinkFromContent(note.content)
        const isLink = itemType === 'link'
        const isRead = note.metadata?.read || false
        const isUpdating = updatingReadStatus === note.id

        return (
          <div key={note.id} className={`relative ${isRead ? 'opacity-75' : ''}`}>
            {isLink ? (
              // Link item
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 rounded-xl p-3 shadow-sm transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/10 to-violet-500/10 flex items-center justify-center shrink-0">
                    <ExternalLink size={14} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div 
                      className="cursor-pointer group"
                      onClick={() => link && handleLinkClick(link)}
                    >
                      <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-1 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors text-sm">
                        {itemTitle}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed mb-2 break-words overflow-wrap-anywhere">
                        {truncateText(note.content.replace(link || '', '').trim(), 80)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                          🔗
                        </span>
                        {note.metadata?.author && (
                          <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-20">
                            {note.metadata.author}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                          {new Date(note.created_at).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleReadStatus(note.id, isRead)
                          }}
                          disabled={isUpdating}
                          className={`p-2 rounded-lg transition-colors ${
                            isRead 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                          } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={isRead ? 'Mark as unread' : 'Mark as read'}
                        >
                          {isUpdating ? (
                            <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
                          ) : isRead ? (
                            <Check size={14} />
                          ) : (
                            <CircleDot size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Excerpt item - opens dialog
              <Dialog onOpenChange={(open) => !open && setSelectedItem(null)}>
                <DialogTrigger asChild>
                  <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 rounded-xl p-3 shadow-sm transition-all">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/10 to-violet-500/10 flex items-center justify-center shrink-0">
                        <Quote size={14} className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div 
                          className="cursor-pointer group"
                          onClick={() => setSelectedItem(note)}
                        >
                          <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-1 text-sm">
                            {itemTitle}
                          </h3>
                          <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed mb-2 break-words overflow-wrap-anywhere">
                            {truncateText(note.content, 80)}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                              📖
                            </span>
                            {note.metadata?.author && (
                              <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-20">
                                {note.metadata.author}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                              {new Date(note.created_at).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleReadStatus(note.id, isRead)
                              }}
                              disabled={isUpdating}
                              className={`p-2 rounded-lg transition-colors ${
                                isRead 
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                              } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                              title={isRead ? 'Mark as unread' : 'Mark as read'}
                            >
                              {isUpdating ? (
                                <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
                              ) : isRead ? (
                                <Check size={14} />
                              ) : (
                                <CircleDot size={14} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogTrigger>

                {selectedItem && selectedItem.id === note.id && (
                  <DialogContent className="max-w-lg mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 max-h-[80vh] overflow-y-auto">
                    <DialogHeader className="pb-4">
                      <DialogTitle className="flex items-center justify-between text-lg">
                        <span className="bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                          {getItemTitle(selectedItem)}
                        </span>
                        <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 dark:from-purple-900/40 dark:to-violet-900/40 dark:text-purple-300">
                          📚 Reading
                        </span>
                      </DialogTitle>
                      {selectedItem.metadata?.author && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          by {selectedItem.metadata.author}
                        </p>
                      )}
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border-l-4 border-purple-500">
                        <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed italic break-words overflow-wrap-anywhere">
                          {selectedItem.content}
                        </p>
                      </div>
                      
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <span>
                          {new Date(selectedItem.created_at).toLocaleDateString([], {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span
                          className={`px-2 py-1 rounded ${
                            selectedItem.source === 'auto'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {selectedItem.source === 'auto' ? '🤖 Auto' : '👤 Manual'}
                        </span>
                      </div>
                    </div>
                  </DialogContent>
                )}
              </Dialog>
            )}
          </div>
        )
      }))}
      </div>
    </div>
  )
}