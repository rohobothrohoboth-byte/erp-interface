import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, XCircle } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  requestName: string;
}

export default function RejectModal({
  isOpen,
  onClose,
  onConfirm,
  requestName
}: RejectModalProps) {
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(reason);
    setReason('');
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
            <XCircle size={20} className="text-red-600" />
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Reject Request</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              You are rejecting the additional budget request for{' '}
              <span className="font-semibold">{requestName}</span>.
            </p>

            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm text-gray-500 dark:text-gray-400">
                Rejection Reason <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                rows={4}
                placeholder="Please provide a reason for rejection..."
                required
              />
            </div>
          </div>

          <div className="border-t dark:border-gray-700 px-6 py-4">
            <div className="flex justify-center items-center gap-2">
              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white px-6"
              >
                Reject
              </Button>
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="px-6"
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
