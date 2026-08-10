// src/components/crm/leadManagement/leadGrouping/DeleteLeadGroupModal.tsx
import React from 'react';
import { AlertCircle, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog';

interface DeleteLeadGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupName: string;
  onDelete: () => void;
  loading?: boolean;
}

const DeleteLeadGroupModal: React.FC<DeleteLeadGroupModalProps> = ({
                                                                     open,
                                                                     onOpenChange,
                                                                     groupName,
                                                                     onDelete,
                                                                     loading = false,
                                                                   }) => {
  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Delete Lead Group
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">
              Are you sure you want to delete the group <strong>"{groupName}"</strong>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Leads in this group will not be deleted.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={onDelete} disabled={loading}>
              <Trash2 className="h-4 w-4 mr-2" />
              {loading ? 'Deleting...' : 'Delete Group'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
};

export default DeleteLeadGroupModal;