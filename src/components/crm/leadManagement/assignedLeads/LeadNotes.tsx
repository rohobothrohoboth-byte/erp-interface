// src/components/crm/leadManagement/assignedLeads/LeadNotes.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, MessageSquare, User, Edit, Trash2,
  Lock, LockOpen, Loader2, Search, Filter
} from 'lucide-react';
import { Button } from '../../../ui/button';
import { Card, CardContent } from '../../../ui/card';
import { Textarea } from '../../../ui/textarea';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import { Badge } from '../../../ui/badge';
import { showToast } from '../../../../layout/layout';
import { getNotes, createNote, updateNote, deleteNote } from '../../../../services/crm/crm.api';
import type { NoteDto, CreateNoteDto } from '../../../../types/crm/crm.types';
import DeleteNoteModal from './DeleteNoteModal';

interface LeadNotesProps {
  leadId: string;
  onNoteAdded?: () => void;
}

export default function LeadNotes({ leadId, onNoteAdded }: LeadNotesProps) {
  const [notes, setNotes] = useState<NoteDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPrivate, setFilterPrivate] = useState<'all' | 'public' | 'private'>('all');

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteDto | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [leadId]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await getNotes({ leadId });
      if (response.data.success) {
        setNotes(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      showToast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) {
      showToast.warning('Please enter note content');
      return;
    }

    setIsSubmitting(true);
    try {
      const noteData: CreateNoteDto = {
        content: newNoteContent,
        leadId: leadId,
        isPinned: false,
      };

      const response = await createNote(noteData);
      if (response.data.success) {
        showToast.success('Note added successfully');
        setNewNoteContent('');
        setIsPrivate(false);
        setIsAddDialogOpen(false);
        await fetchNotes();
        if (onNoteAdded) onNoteAdded();
      }
    } catch (error) {
      console.error('Error adding note:', error);
      showToast.error('Failed to add note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateNote = async () => {
    if (!editingNote || !newNoteContent.trim()) {
      showToast.warning('Please enter note content');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await updateNote(editingNote.id, {
        content: newNoteContent,
        isPinned: isPrivate,
      });
      if (response.data.success) {
        showToast.success('Note updated successfully');
        setEditingNote(null);
        setNewNoteContent('');
        setIsPrivate(false);
        setIsAddDialogOpen(false);
        await fetchNotes();
      }
    } catch (error) {
      console.error('Error updating note:', error);
      showToast.error('Failed to update note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!deletingNoteId) return;

    try {
      const response = await deleteNote(deletingNoteId);
      if (response.data.success) {
        showToast.success('Note deleted successfully');
        setIsDeleteModalOpen(false);
        setDeletingNoteId(null);
        await fetchNotes();
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      showToast.error('Failed to delete note');
    }
  };

  const handleEditNote = (note: NoteDto) => {
    setEditingNote(note);
    setNewNoteContent(note.content);
    setIsPrivate(note.isPinned || false);
    setIsAddDialogOpen(true);
  };

  const handleDeleteNoteClick = (noteId: string) => {
    setDeletingNoteId(noteId);
    setIsDeleteModalOpen(true);
  };

  const closeDialog = () => {
    setIsAddDialogOpen(false);
    setEditingNote(null);
    setNewNoteContent('');
    setIsPrivate(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterPrivate === 'all' ||
        (filterPrivate === 'public' && !note.isPinned) ||
        (filterPrivate === 'private' && note.isPinned);
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
        </div>
    );
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notes</h3>
            <Badge variant="outline" className="text-sm">
              {notes.length} notes
            </Badge>
          </div>
          <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white"
              size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Note
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
            />
          </div>
          <Select
              value={filterPrivate}
              onValueChange={(value) => setFilterPrivate(value as typeof filterPrivate)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Notes</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {filteredNotes.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {searchTerm || filterPrivate !== 'all' ? 'No matching notes' : 'No notes yet'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {searchTerm || filterPrivate !== 'all'
                        ? 'Try adjusting your search or filter criteria'
                        : 'Add your first note to keep track of important information about this lead.'}
                  </p>
                  {!searchTerm && filterPrivate === 'all' && (
                      <Button
                          onClick={() => setIsAddDialogOpen(true)}
                          className="bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Note
                      </Button>
                  )}
                </CardContent>
              </Card>
          ) : (
              filteredNotes.map((note) => (
                  <Card key={note.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
                            <User className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {note.createdByUserName || 'Unknown User'}
                        </span>
                              {note.isPinned && (
                                  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 flex items-center gap-1">
                                    <Lock className="w-3 h-3" />
                                    Private
                                  </Badge>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(note.createdAt)}
                              {note.createdAt !== note.updatedAt && ' (Edited)'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditNote(note)}
                              className="text-gray-500 hover:text-gray-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteNoteClick(note.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mt-3 pl-3 border-l-2 border-orange-200 dark:border-orange-800">
                        {note.content}
                      </p>
                      {note.updatedAt && note.createdAt !== note.updatedAt && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                            Last edited: {formatDate(note.updatedAt)}
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
                  className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-xl overflow-hidden"
              >
                <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 px-6 py-4 sticky top-0 bg-white dark:bg-gray-900 z-10">
                  {editingNote ? (
                      <Edit className="w-5 h-5 text-orange-600" />
                  ) : (
                      <Plus className="w-5 h-5 text-orange-600" />
                  )}
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {editingNote ? 'Edit Note' : 'Add Note'}
                  </h2>
                </div>

                <div className="px-6 py-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="noteContent">Note Content <span className="text-red-500">*</span></Label>
                    <Textarea
                        id="noteContent"
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                        placeholder="Enter your note here..."
                        rows={6}
                        className="resize-none"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="isPrivate"
                        checked={isPrivate}
                        onChange={(e) => setIsPrivate(e.target.checked)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <Label htmlFor="isPrivate" className="text-sm cursor-pointer flex items-center gap-2">
                      {isPrivate ? (
                          <Lock className="w-4 h-4 text-yellow-500" />
                      ) : (
                          <LockOpen className="w-4 h-4 text-gray-400" />
                      )}
                      Make this note private (only visible to you)
                    </Label>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4">
                  <div className="flex justify-center items-center gap-3">
                    <Button variant="outline" onClick={closeDialog}>
                      Cancel
                    </Button>
                    <Button
                        onClick={editingNote ? handleUpdateNote : handleAddNote}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                        disabled={isSubmitting || !newNoteContent.trim()}
                    >
                      {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                      ) : (
                          <>
                            {editingNote ? 'Update Note' : 'Add Note'}
                          </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
        )}

        <DeleteNoteModal
            isOpen={isDeleteModalOpen}
            onClose={() => { setIsDeleteModalOpen(false); setDeletingNoteId(null); }}
            onConfirm={handleDeleteNote}
        />
      </div>
  );
}