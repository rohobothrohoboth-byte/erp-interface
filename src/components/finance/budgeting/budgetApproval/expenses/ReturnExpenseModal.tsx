import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X as CloseIcon, RotateCcw } from 'lucide-react';
import { Button } from '../../../../ui/button';
import { Label } from '../../../../ui/label';
import { Textarea } from '../../../../ui/textarea';
import type { BudgetExpenseWithApproval } from './ExpenseApprovalSection';

interface ReturnExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  expense: BudgetExpenseWithApproval;
}

export default function ReturnExpenseModal({
  isOpen,
  onClose,
  onConfirm,
  expense,
}: ReturnExpenseModalProps) {
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onConfirm(reason);
      setReason('');
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden"
          >
            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Return for Review</h2>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-4 space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Account:</span> {expense.account}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Amount:</span> ${expense.requestedAmount.toLocaleString()}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason" className="text-sm text-gray-500">
                    Return Reason <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please provide feedback for returning this expense for review..."
                    rows={4}
                    required
                    className="w-full"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 px-6 py-2">
                <div className="mx-auto flex justify-center items-center gap-1.5">
                  <Button
                    type="submit"
                    disabled={!reason.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Return for Review
                  </Button>
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
