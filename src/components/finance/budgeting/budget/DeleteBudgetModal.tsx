import { motion } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '../../../ui/button';

interface DeleteBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  budgetName: string;
}

const DeleteBudgetModal: React.FC<DeleteBudgetModalProps> = ({
  isOpen,
  onClose,
  onDelete,
  budgetName,
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
        <div className="flex justify-between items-center border-b border-red-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-bold text-red-900">Delete Budget</h2>
          </div>
          <button
            onClick={onClose}
            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors duration-200"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <p className="text-gray-700">
            Are you sure you want to delete the budget <span className="font-semibold text-red-600">"{budgetName}"</span>?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            This action cannot be undone. All associated versions will remain but will no longer be linked to this budget.
          </p>
        </div>

        {/* Footer */}
        <div className="border-t border-red-200 px-6 py-4 rounded-b-xl bg-gray-50">
          <div className="flex justify-end items-center gap-2">
            <Button
              variant="outline"
              className="cursor-pointer px-6 border-gray-300 text-gray-700 hover:bg-gray-100"
              onClick={onClose}
              type="button"
            >
              Cancel
            </Button>
            <Button
              onClick={onDelete}
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer px-6"
            >
              Delete Budget
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DeleteBudgetModal;
