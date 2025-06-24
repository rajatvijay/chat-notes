import { useState } from 'react'
import { Card, CardContent } from '@chatnotes/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@chatnotes/ui'

interface Note {
  id: string
  content: string
  category: string | null
  created_at: string
  source: string
}

interface NotesListProps {
  notes: Note[]
}

export default function NotesList({ notes }: NotesListProps) {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)

  if (notes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No notes in this category yet.</p>
      </div>
    )
  }

  const truncateText = (text: string, length: number = 80) => {
    return text.length > length ? text.substring(0, length) + '...' : text
  }

  return (
    <div className="space-y-2">
      {notes.map((note) => (
        <Dialog key={note.id} onOpenChange={(open) => !open && setSelectedNote(null)}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedNote(note)}>
              <CardContent className="p-4">
                <p className="text-sm leading-relaxed">
                  {truncateText(note.content)}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    note.category === 'task' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    note.category === 'idea' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    note.category === 'journal' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    note.category === 'meeting' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    note.category === 'reading' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {note.category}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(note.created_at).toLocaleDateString()} {new Date(note.created_at).toLocaleTimeString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          
          {selectedNote && selectedNote.id === note.id && (
            <DialogContent className="max-w-sm mx-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Note Details</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    selectedNote.category === 'task' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    selectedNote.category === 'idea' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    selectedNote.category === 'journal' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    selectedNote.category === 'meeting' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    selectedNote.category === 'reading' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {selectedNote.category}
                  </span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm leading-relaxed">
                  {selectedNote.content}
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Created: {new Date(selectedNote.created_at).toLocaleString()}</p>
                  <p>Source: {selectedNote.source === 'auto' ? 'Auto-categorized' : 'Manual'}</p>
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>
      ))}
    </div>
  )
}