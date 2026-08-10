import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface DeleteEvaluationFlowModalProps {
  isOpen: boolean;
  name: string;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteEvaluationFlowModal: React.FC<DeleteEvaluationFlowModalProps> = ({ isOpen, name, isLoading = false, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-sm w-full"
      >
        <div className="p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle size={48} className="text-red-500" />
          </div>
          <p className="text-lg font-medium text-gray-900 mb-1">Delete Evaluation Flow</p>
          <p className="text-sm text-gray-500 mb-1">
            Are you sure you want to delete <span className="font-semibold text-gray-700">"{name}"</span>?
          </p>
          <p className="text-sm text-red-500">This action cannot be undone.</p>
        </div>
        <div className="border-t px-6 py-4 flex justify-center gap-2">
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading} className="px-6 cursor-pointer">
            {isLoading ? 'Deleting...' : 'Yes, Delete'}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="px-6 cursor-pointer">
            Cancel
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default DeleteEvaluationFlowModal;
