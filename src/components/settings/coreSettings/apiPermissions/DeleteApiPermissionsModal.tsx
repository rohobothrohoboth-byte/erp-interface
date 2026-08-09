import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogClose,
} from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { AlertTriangle } from 'lucide-react';
import type { PerApiListDto, UUID } from '../../../../types/core/Settings/api-permission';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface DeleteApiPermissionModalProps {
  permission: PerApiListDto | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (permissionId: UUID) => Promise<any>;
}

const DeleteApiPermissionModal: React.FC<DeleteApiPermissionModalProps> = ({
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
      await onConfirm(permission.id);
      toast.success('API permission deleted successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete API permission');
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <Dialog open={isOpen} onOpenChange={() => !isLoading && onClose()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center justify-center p-3 bg-red-100 rounded-full text-red-600 mx-auto">
              <AlertTriangle size={32} />
            </div>
          </DialogHeader>
          {permission && (
              <div className="py-4 text-center space-y-4">
                <p className="text-lg font-medium text-red-600">
                  Are you sure you want to delete this API permission?
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                  <p className="text-sm font-medium text-red-800">Permission Details:</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-red-700">
                      <span className="font-semibold">Key:</span> {permission.key}
                    </p>
                    <p className="text-sm text-red-700">
                      <span className="font-semibold">Name:</span> {permission.name}
                    </p>
                    <p className="text-sm text-red-700">
                      <span className="font-semibold">Menu:</span> {permission.perMenu}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
          )}
          <DialogFooter className="border-t pt-6">
            <div className="mx-auto flex justify-center items-center gap-1.5">
              <Button variant="destructive" onClick={handleConfirm} disabled={isLoading} className="cursor-pointer px-6">
                {isLoading ? 'Deleting...' : 'Yes, Delete!'}
              </Button>
              <DialogClose asChild>
                <Button variant="outline" disabled={isLoading} className="cursor-pointer px-6">
                  No, Keep It.
                </Button>
              </DialogClose>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
};

export default DeleteApiPermissionModal;