// src/components/crm/leadManagement/assignedLeads/DeleteNoteModal.tsx
import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface DeleteNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  noteContent?: string;
}

const DeleteNoteModal: React.FC<DeleteNoteModalProps> = ({
                                                           isOpen,
                                                           onClose,
                                                           onConfirm,
                                                           noteContent = "",
                                                         }) => {
  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-6 py-4 sticky top-0 bg-white dark:bg-gray-900 z-10">
            <div className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Note</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="px-6 py-6">
            <div className="text-center">
              <div className="flex items-center justify-center p-4 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
                <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Are you sure you want to delete this note?
              </h3>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                This action cannot be undone. The note will be permanently removed.
              </p>

              {noteContent && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-left">
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                      {noteContent}
                    </p>
                  </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4">
            <div className="flex justify-center items-center gap-3">
              <Button
                  variant="outline"
                  onClick={onClose}
                  className="px-6"
              >
                Cancel
              </Button>
              <Button
                  variant="destructive"
                  onClick={onConfirm}
                  className="px-6 bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Note
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
  );
};

export default DeleteNoteModal;