// src/components/hr/recruitment/jobPosting/DeleteJobPostingModal.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '../../../ui/button';

interface DeleteJobPostingModalProps {
  isOpen: boolean;
  postNumber: string;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteJobPostingModal: React.FC<DeleteJobPostingModalProps> = ({
                                                                       isOpen,
                                                                       postNumber,
                                                                       isLoading = false,
                                                                       onClose,
                                                                       onConfirm,
                                                                     }) => {
  // Handle ESC key
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  return (
      <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            >
              <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b px-6 py-4 bg-red-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-full">
                      <AlertTriangle size={20} className="text-red-600" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-800">Delete Job Posting</h2>
                  </div>
                  <button
                      onClick={onClose}
                      disabled={isLoading}
                      className="p-1 rounded-lg hover:bg-red-100 transition-colors text-gray-400 hover:text-gray-600"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle size={32} className="text-red-600" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">
                      Are you sure you want to delete this posting?
                    </p>
                    <p className="text-sm text-gray-500 mb-1">
                      You are about to delete job posting <span className="font-semibold text-gray-700">"{postNumber}"</span>
                    </p>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
                      <p className="text-sm text-red-600 flex items-center gap-2">
                        <AlertTriangle size={16} />
                        This action cannot be undone. All associated data will be permanently removed.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t px-6 py-4 bg-gray-50 flex justify-end gap-3">
                  <Button
                      variant="outline"
                      onClick={onClose}
                      disabled={isLoading}
                      className="px-6 cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                      variant="destructive"
                      onClick={onConfirm}
                      disabled={isLoading}
                      className="px-6 cursor-pointer"
                  >
                    {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Deleting...
                        </>
                    ) : (
                        'Yes, Delete'
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
  );
};

export default DeleteJobPostingModal;