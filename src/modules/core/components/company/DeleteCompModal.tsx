import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogClose
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';
import type { CompListDto, UUID } from '@/modules/core/types/comp';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface DeleteCompModalProps {
  company: CompListDto | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (companyId: UUID) => Promise<any>;
}

const DeleteCompModal: React.FC<DeleteCompModalProps> = ({
                                                           company,
                                                           isOpen,
                                                           onClose,
                                                           onConfirm
                                                         }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!company) return;

    setIsLoading(true);

    try {
      await onConfirm(company.id);
      toast.success('Company deleted successfully');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete company');
      console.error('Error deleting company:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-2">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </DialogHeader>

          {company && (
              <div className="text-center py-2">
                <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
                  Delete "{company.nameAm}"?
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  This action cannot be undone.
                </p>
                {parseInt(company.branchCount) > 0 && (
                    <p className="text-sm text-amber-600 dark:text-amber-400 mt-3 p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                      ⚠️ This company has {company.branchCount} branch(es). Deleting it will affect all associated data.
                    </p>
                )}
              </div>
          )}

          <DialogFooter className="border-t pt-4 mt-2">
            <div className="flex justify-center gap-3 w-full">
              <Button
                  variant="destructive"
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className="px-5 h-8 text-sm"
              >
                {isLoading ? 'Deleting...' : 'Yes, Delete'}
              </Button>
              <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-5 h-8 text-sm"
              >
                Cancel
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
};

export default DeleteCompModal;