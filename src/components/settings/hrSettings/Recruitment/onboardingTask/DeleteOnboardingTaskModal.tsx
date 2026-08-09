// src/components/hr/recruit/onboardingTask/DeleteOnboardingTaskModal.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertCircle } from 'lucide-react';
import { Button } from '../../../../ui/button';

interface DeleteOnboardingTaskModalProps {
  isOpen: boolean;
  taskName: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const DeleteOnboardingTaskModal: React.FC<DeleteOnboardingTaskModalProps> = ({
                                                                               isOpen,
                                                                               taskName,
                                                                               onClose,
                                                                               onConfirm,
                                                                               isLoading = false
                                                                             }) => (
    <AnimatePresence>
      {isOpen && (
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6"
              onClick={e => { if (e.target === e.currentTarget && !isLoading) onClose(); }}
          >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-white rounded-xl shadow-xl max-w-sm w-full"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-800">Delete Task</h2>
              </div>

              <div className="px-6 py-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-700">
                      Are you sure you want to delete <span className="font-semibold">"{taskName}"</span>?
                    </p>
                    <p className="text-xs text-gray-500 mt-1">This action cannot be undone.</p>
                  </div>
                </div>
              </div>

              <div className="border-t px-6 py-4 bg-gray-50 rounded-b-xl">
                <div className="flex justify-center gap-3">
                  <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      disabled={isLoading}
                      className="min-w-[100px]"
                  >
                    Cancel
                  </Button>
                  <Button
                      type="button"
                      onClick={onConfirm}
                      className="bg-red-600 hover:bg-red-700 text-white min-w-[100px] relative"
                      disabled={isLoading}
                  >
                    {isLoading ? (
                        <>
                          <span className="opacity-0">Delete</span>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          </div>
                        </>
                    ) : (
                        'Delete'
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
      )}
    </AnimatePresence>
);

export default DeleteOnboardingTaskModal;