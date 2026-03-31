import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../../../ui/button';

interface DeleteWorkforcePlanModalProps {
  isOpen: boolean;
  title: string;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteWorkforcePlanModal: React.FC<DeleteWorkforcePlanModalProps> = ({ isOpen, title, isLoading = false, onClose, onConfirm }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-xl shadow-xl max-w-sm w-full">
          <div className="p-6 text-center">
            <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-1">Delete Workforce Plan</p>
            <p className="text-sm text-gray-500 mb-1">
              Are you sure you want to delete <span className="font-semibold text-gray-700">"{title}"</span>?
            </p>
            <p className="text-sm text-red-500">This action cannot be undone.</p>
          </div>
          <div className="border-t px-6 py-4 bg-gray-50 rounded-b-xl flex justify-center gap-3">
            <Button variant="outline" onClick={onClose} disabled={isLoading} className="px-6 cursor-pointer">Cancel</Button>
            <Button variant="destructive" onClick={onConfirm} disabled={isLoading} className="px-6 cursor-pointer">
              {isLoading ? 'Deleting...' : 'Yes, Delete'}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default DeleteWorkforcePlanModal;
