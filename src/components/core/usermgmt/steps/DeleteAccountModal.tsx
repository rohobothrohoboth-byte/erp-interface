import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../../ui/button';
import type { UUID } from '../../../../types/hr/employee';
import { useDeleteAccount } from '../../../../services/hr/employee/user/user.queries';

interface DeleteAccountModalProps {
  userId?: UUID;
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  userId,
  isOpen,
  onClose,
}) => {
  const { mutateAsync, isPending } = useDeleteAccount();

  const handleConfirm = async () => {
    if (!userId) {
      toast.error('Invalid user selected');
      return;
    }

    try {
      await mutateAsync(userId);
      toast.success('Account deleted successfully');
      onClose();
    } catch (error: any) {
      toast.error(error?.message ?? 'Failed to delete account');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden"
      >
        <div className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto" />
          <p className="text-lg font-medium text-red-600 mt-4">Delete Account?</p>
          <p className="text-sm text-gray-500 mt-2">
            This action cannot be undone. The account will be permanently removed.
          </p>
        </div>

        <div className="border-t px-6 py-4 flex justify-center gap-2">
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending || !userId}
          >
            {isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-1" />Deleting...</>
            ) : (
              'Yes, Delete!'
            )}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            No, Keep It.
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
