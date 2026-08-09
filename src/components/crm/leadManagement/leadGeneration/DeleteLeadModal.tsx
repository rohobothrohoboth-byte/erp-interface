// src/components/crm/leadManagement/leadGeneration/DeleteLeadModal.tsx
import React from 'react';
import { AlertCircle, Trash2 } from 'lucide-react';
import { Button } from '../../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../ui/dialog';
import type { LeadDto } from '../../../../types/crm/crm.types';

interface DeleteLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: LeadDto | null;
  onDelete: () => void;
  loading?: boolean;
}

const DeleteLeadModal: React.FC<DeleteLeadModalProps> = ({
                                                           open,
                                                           onOpenChange,
                                                           lead,
                                                           onDelete,
                                                           loading = false,
                                                         }) => {
  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Delete Lead
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">
              Are you sure you want to delete <strong>{lead?.fullName}</strong>?
            </p>
            {lead?.companyName && (
                <p className="text-sm text-gray-500 mt-1">
                  Company: {lead.companyName}
                </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={onDelete} disabled={loading}>
              <Trash2 className="h-4 w-4 mr-2" />
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
};

export default DeleteLeadModal;