import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, MessageSquare, User, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Card, CardContent } from '../../../ui/card';
import { Textarea } from '../../../ui/textarea';
import { Label } from '../../../ui/label';
import DeleteNoteModal from './DeleteNoteModal';

interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  isPrivate: boolean;
}

interface LeadNotesProps {
  leadId: string;
}

export default function LeadNotes({ leadId }: LeadNotesProps) {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      content: 'Lead showed strong interest in our enterprise solution. Mentioned they are currently using a competitor but are unhappy with the support.',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      author: 'Sarah Johnson',
      isPrivate: false
    },
    {
      id: '2',
      content: 'Follow-up call scheduled for next week. Need to prepare demo focusing on integration capabilities.',
      createdAt: '2024-01-16T14:15:00Z',
      updatedAt: '2024-01-16T14:15:00Z',
      author: 'Sarah Johnson',
      isPrivate: true
    }
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const handleAddNote = () => {
    if (newNoteContent.trim()) {
      const note: Note = {
        id: Date.now().toString(),
        content: newNoteContent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: 'Current User',
        isPrivate
      };
      setNotes([note, ...notes]);
      setNewNoteContent('');
      setIsPrivate(false);
      setIsAddDialogOpen(false);
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNewNoteContent(note.content);
    setIsPrivate(note.isPrivate);
    setIsAddDialogOpen(true);
  };

  const handleUpdateNote = () => {
    if (editingNote && newNoteContent.trim()) {
      setNotes(notes.map(note =>
        note.id === editingNote.id
          ? { ...note, content: newNoteContent, isPrivate, updatedAt: new Date().toISOString() }
          : note
      ));
      setEditingNote(null);
      setNewNoteContent('');
      setIsPrivate(false);
      setIsAddDialogOpen(false);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    setDeletingNoteId(noteId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteNote = () => {
    if (deletingNoteId) {
      setNotes(notes.filter(note => note.id !== deletingNoteId));
      setIsDeleteModalOpen(false);
      setDeletingNoteId(null);
    }
  };

  const closeDialog = () => {
    setIsAddDialogOpen(false);
    setEditingNote(null);
    setNewNoteContent('');
    setIsPrivate(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Notes</h3>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Note
        </Button>
      </div>

      <div className="space-y-4">
        {notes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notes yet</h3>
              <p className="text-gray-500 mb-4">Add your first note to keep track of important information about this lead.</p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="bg-orange-600 hover:bg-orange-700">
                <Plus className="w-4 h-4 mr-2" />
                Add First Note
              </Button>
            </CardContent>
          </Card>
        ) : (
          notes.map((note) => (
            <Card key={note.id}>
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium">{note.author}</span>
                    {note.isPrivate && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Private</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {new Date(note.createdAt).toLocaleDateString()} at{' '}
                      {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => handleEditNote(note)}>
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteNote(note.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                {note.updatedAt !== note.createdAt && (
                  <p className="text-xs text-gray-400 mt-2">
                    Last edited: {new Date(note.updatedAt).toLocaleDateString()} at{' '}
                    {new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Note Modal */}
      {isAddDialogOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden"
          >
            <div className="flex items-center gap-2 border-b px-4 py-4 sticky top-0 bg-white z-10">
              <Plus className="w-5 h-5 text-orange-600" />
              <h2 className="text-base font-semibold">{editingNote ? 'Edit Note' : 'Add Note'}</h2>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="noteContent">Note Content</Label>
                <Textarea
                  id="noteContent"
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Enter your note here..."
                  rows={6}
                  className="resize-none"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="isPrivate" className="text-sm">
                  Make this note private (only visible to you)
                </Label>
              </div>
            </div>

            <div className="border-t px-6 py-2">
              <div className="flex justify-center items-center gap-1.5">
                <Button variant="outline" onClick={closeDialog}>Cancel</Button>
                <Button
                  onClick={editingNote ? handleUpdateNote : handleAddNote}
                  className="bg-orange-600 hover:bg-orange-700"
                  disabled={!newNoteContent.trim()}
                >
                  {editingNote ? 'Update Note' : 'Add Note'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <DeleteNoteModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setDeletingNoteId(null); }}
        onConfirm={confirmDeleteNote}
      />
    </div>
  );
}
