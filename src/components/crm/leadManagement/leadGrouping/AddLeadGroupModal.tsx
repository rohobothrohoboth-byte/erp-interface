// src/components/crm/leadManagement/leadGrouping/AddLeadGroupModal.tsx
import React, { useState } from 'react';
import { Layers, Plus } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../ui/dialog';

interface AddLeadGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (name: string, description: string) => void;
  loading?: boolean;
}

const AddLeadGroupModal: React.FC<AddLeadGroupModalProps> = ({
                                                               open,
                                                               onOpenChange,
                                                               onAdd,
                                                               loading = false,
                                                             }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (name.trim()) {
      onAdd(name.trim(), description.trim());
      setName('');
      setDescription('');
    }
  };

  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-indigo-600">
              <Layers className="h-5 w-5" />
              Create Lead Group
            </DialogTitle>
            <DialogDescription>
              Group leads based on custom criteria
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label>Group Name <span className="text-red-500">*</span></Label>
              <Input
                  className="mt-1"
                  placeholder="e.g., Enterprise Leads"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                  className="mt-1"
                  placeholder="Describe the group criteria..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={handleSubmit}
                disabled={loading || !name.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
};

export default AddLeadGroupModal;