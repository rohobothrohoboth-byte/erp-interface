import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, User, Calendar, MessageSquare } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Card, CardContent } from '../../../ui/card';
import { Textarea } from '../../../ui/textarea';
import { Badge } from '../../../ui/badge';
import { Label } from '../../../ui/label';
import { showToast } from '../../../../layout/layout';

interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isPrivate: boolean;
  tags: string[];
}

interface ContactNotesProps {
  contactId: string;
}

export default function ContactNotes({ contactId }: ContactNotesProps) {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      content: 'Initial contact made through website inquiry.',
      createdAt: '2024-01-18T14:30:00Z',
      updatedAt: '2024-01-18T14:30:00Z',
      createdBy: 'Sarah Johnson',
      isPrivate: false,
      tags: ['follow-up', 'enterprise']
    },
    {
      id: '2',
      content: 'Follow-up call scheduled for next week.',
      createdAt: '2024-01-19T09:15:00Z',
      updatedAt: '2024-01-19T09:15:00Z',
      createdBy: 'Sarah Johnson',
      isPrivate: false,
      tags: ['demo', 'budget']
    },
    {
      id: '3',
      content: 'Personal note: Alice seems very detail-oriented.',
      createdAt: '2024-01-19T16:45:00Z',
      updatedAt: '2024-01-19T16:45:00Z',
      createdBy: 'Sarah Johnson',
      isPrivate: true,
      tags: ['personal']
    }
  ]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [newNote, setNewNote] = useState({ content: '', isPrivate: false, tags: [] as string[] });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil(Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleAddNote = () => {
    if (!newNote.content.trim()) { showToast.error('Please enter note content'); return; }
    const note: Note = {
      id: Date.now().toString(),
      content: newNote.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Current User',
      isPrivate: newNote.isPrivate,
      tags: newNote.tags
    };
    setNotes([note, ...notes]);
    setNewNote({ content: '', isPrivate: false, tags: [] });
    setIsAddOpen(false);
    showToast.success('Note added successfully');
  };

  const handleEditNote = () => {
    if (!selectedNote || !newNote.content.trim()) { showToast.error('Please enter note content'); return; }
    setNotes(notes.map(note =>
      note.id === selectedNote.id
        ? { ...note, content: newNote.content, isPrivate: newNote.isPrivate, tags: newNote.tags, updatedAt: new Date().toISOString() }
        : note
    ));
    closeDialogs();
    showToast.success('Note updated successfully');
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
    showToast.success('Note deleted successfully');
  };

  const openEditDialog = (note: Note) => {
    setSelectedNote(note);
    setNewNote({ content: note.content, isPrivate: note.isPrivate, tags: note.tags });
    setIsEditOpen(true);
  };

  const closeDialogs = () => {
    setIsAddOpen(false);
    setIsEditOpen(false);
    setSelectedNote(null);
    setNewNote({ content: '', isPrivate: false, tags: [] });
  };

  const NoteModal = ({ title, onSave }: { title: string; onSave: () => void }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden"
      >
        <div className="flex items-center gap-2 border-b px-6 py-2 sticky top-0 bg-white z-10">
          <MessageSquare className="w-5 h-5 text-orange-600" />
          <h2 className="text-base font-semibold">{title}</h2>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="noteContent">Note Content *</Label>
            <Textarea
              id="noteContent"
              value={newNote.content}
              onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Enter your note here..."
              rows={6}
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPrivate"
              checked={newNote.isPrivate}
              onChange={(e) => setNewNote(prev => ({ ...prev, isPrivate: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isPrivate" className="text-sm">Make this note private (only visible to you)</Label>
          </div>
        </div>
        <div className="border-t px-6 py-2">
          <div className="flex justify-center items-center gap-1.5">
            <Button variant="outline" onClick={closeDialogs}>Cancel</Button>
            <Button onClick={onSave} className="bg-orange-600 hover:bg-orange-700">{title}</Button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
          <p className="text-sm text-gray-600">Keep track of important information and observations</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Note
        </Button>
      </div>

      <div className="space-y-3">
        {notes.length === 0 ? (
          <Card className="border-orange-200">
            <CardContent>
              <div className="text-center py-6">
                <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-medium text-gray-900 mb-2">No notes yet</h3>
                <p className="text-sm text-gray-500 mb-4">Start adding notes to keep track of important information.</p>
                <Button onClick={() => setIsAddOpen(true)} className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Note
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          notes.map((note, index) => (
            <motion.div key={note.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card className={`border-orange-200 hover:shadow-md transition-shadow ${note.isPrivate ? 'bg-yellow-50 border-yellow-200' : ''}`}>
                <CardContent>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <User className="w-3 h-3 text-gray-400" />
                      <span className="text-xs font-medium text-gray-700">{note.createdBy}</span>
                      {note.isPrivate && (
                        <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800">Private</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(note)} className="h-6 w-6 p-0">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteNote(note.id)} className="text-red-600 hover:text-red-800 h-6 w-6 p-0">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap">{note.content}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(note.createdAt)}</span>
                      {note.updatedAt !== note.createdAt && <span>(edited)</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {isAddOpen && <NoteModal title="Add Note" onSave={handleAddNote} />}
      {isEditOpen && <NoteModal title="Update Note" onSave={handleEditNote} />}
    </div>
  );
}