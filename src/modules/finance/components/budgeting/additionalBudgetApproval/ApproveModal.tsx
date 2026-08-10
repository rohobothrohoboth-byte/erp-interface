import { motion } from 'framer-motion';
import { X, CheckCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface ApproveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  requestName: string;
  amount: number;
}

export default function ApproveModal({
  isOpen,
  onClose,
  onConfirm,
  requestName,
  amount
}: ApproveModalProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full"
      >
        <div className="flex justify-between items-center border-b dark:border-gray-700 px-6 py-4">
          <div className="flex items-center gap-2">
            <CheckCircle size={20} className="text-green-600" />
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Approve Request</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>

        <div className="px-6 py-4">
          <p className="text-gray-600 dark:text-gray-300">
            Are you sure you want to approve the additional budget request for{' '}
            <span className="font-semibold">{requestName}</span> with amount{' '}
            <span className="font-semibold text-green-600">{formatCurrency(amount)}</span>?
          </p>
        </div>

        <div className="border-t dark:border-gray-700 px-6 py-4">
          <div className="flex justify-center items-center gap-2">
            <Button
              onClick={onConfirm}
              className="bg-green-600 hover:bg-green-700 text-white px-6"
            >
              Approve
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="px-6"
            >
              Cancel
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
