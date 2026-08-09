// src/components/crm/leadManagement/leadGeneration/ReassignLeadModal.tsx
import React, { useState } from 'react';
import { Users, UserPlus } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../ui/select';
import type { LeadDto } from '../../../../types/crm/crm.types';

interface ReassignLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: LeadDto | null;
  onReassign: (userId: string) => void;
  loading?: boolean;
  users?: Array<{ id: string; name: string }>;
}

const ReassignLeadModal: React.FC<ReassignLeadModalProps> = ({
                                                               open,
                                                               onOpenChange,
                                                               lead,
                                                               onReassign,
                                                               loading = false,
                                                               users = [],
                                                             }) => {
  const [selectedUserId, setSelectedUserId] = useState('');

  const handleSubmit = () => {
    if (selectedUserId) {
      onReassign(selectedUserId);
    }
  };

  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-indigo-600">
              <UserPlus className="h-5 w-5" />
              Reassign Lead
            </DialogTitle>
            <DialogDescription>
              Assign this lead to a different user
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">
                Lead: <strong>{lead?.fullName}</strong>
              </p>
              {lead?.companyName && (
                  <p className="text-sm text-gray-600">
                    Company: <strong>{lead.companyName}</strong>
                  </p>
              )}
              <p className="text-sm text-gray-600">
                Current: <strong>{lead?.assignedToUserName || 'Unassigned'}</strong>
              </p>
            </div>
            <div>
              <Label>Assign To</Label>
              {users.length > 0 ? (
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              ) : (
                  <Input
                      className="mt-1"
                      placeholder="Enter user ID"
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                  />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={handleSubmit}
                disabled={loading || !selectedUserId}
            >
              <Users className="h-4 w-4 mr-2" />
              {loading ? 'Assigning...' : 'Assign Lead'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
};

export default ReassignLeadModal;