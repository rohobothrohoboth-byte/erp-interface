import { motion } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  accountName: string;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onDelete,
  accountName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-lg font-bold text-gray-800">Delete Account</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle size={50} className="text-red-600" />
            </div>
          </div>
          <p className="text-gray-700 mb-2">
            Are you sure you want to delete <span className="font-semibold">{accountName}</span>?
          </p>
          <p className="text-sm text-gray-500">
            This action cannot be undone. All child accounts will also be deleted.
          </p>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4">
          <div className="flex justify-center items-center gap-3">
            <Button
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer px-6"
              onClick={onDelete}
            >
              Yes, Delete!
            </Button>
            <Button variant="outline" className="cursor-pointer px-6" onClick={onClose}>
              No, Keep It.
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DeleteAccountModal;
