import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogClose,
  DialogTitle,
  DialogDescription
} from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { AlertTriangle } from 'lucide-react';
import type { PerMenuListDto, UUID } from '../../../../types/core/Settings/menu-permissions';
import { useState } from 'react';

interface DeleteMenuPermissionModalProps {
  permission: PerMenuListDto | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (permissionId: UUID) => Promise<any>;
}

const DeleteMenuPermissionModal: React.FC<DeleteMenuPermissionModalProps> = ({
                                                                               permission,
                                                                               isOpen,
                                                                               onClose,
                                                                               onConfirm
                                                                             }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!permission) return;
    setIsLoading(true);
    try {
      await onConfirm(permission.key);  // Pass key instead of id
      onClose();
    } catch (error: any) {
      console.error('Error deleting menu permission:', error);
      alert(error.message || 'Failed to delete menu permission');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <div className="flex items-center justify-center p-3 bg-red-100 rounded-full gap-2 text-red-600 mx-auto">
              <AlertTriangle size={32} />
            </div>
            <DialogTitle className="text-center text-red-600 mt-4">
              Delete Menu Permission
            </DialogTitle>
            <DialogDescription className="text-center">
              This action cannot be undone. This will permanently delete the menu permission from the system.
            </DialogDescription>
          </DialogHeader>

          {permission && (
              <div className="py-4 text-center space-y-4">
                <p className="text-lg font-medium text-red-600">
                  Are you sure you want to delete this menu permission?
                </p>

                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-left">
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">Permission Details:</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-red-700 dark:text-red-400">
                      <span className="font-semibold">Key:</span> {permission.key}
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-400">
                      <span className="font-semibold">Label:</span> {permission.label || permission.name}
                    </p>
                    {permission.module && (
                        <p className="text-sm text-red-700 dark:text-red-400">
                          <span className="font-semibold">Module:</span> {permission.module}
                        </p>
                    )}
                  </div>
                </div>
              </div>
          )}

          <DialogFooter className="border-t pt-6">
            <div className='mx-auto flex justify-center items-center gap-1.5'>
              <Button
                  variant="destructive"
                  onClick={handleConfirm}
                  className="cursor-pointer px-6"
                  disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Yes, Delete!'}
              </Button>
              <DialogClose asChild>
                <Button variant="outline" className="cursor-pointer px-6" disabled={isLoading}>
                  No, Keep It.
                </Button>
              </DialogClose>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
};

export default DeleteMenuPermissionModal;