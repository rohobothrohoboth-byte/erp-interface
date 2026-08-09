import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Trash2 } from "lucide-react";
import type { FiscYearListDto, UUID } from "../../../types/core/fisc";
import { Button } from "../../../components/ui/button";
import toast from 'react-hot-toast';

interface DeleteFiscModalProps {
  fiscalYear: FiscYearListDto | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (fiscalYearId: UUID) => Promise<any>;
}

export const DeleteFiscModal: React.FC<DeleteFiscModalProps> = ({
                                                                  fiscalYear,
                                                                  isOpen,
                                                                  onClose,
                                                                  onConfirm
                                                                }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!fiscalYear) return;
    setIsLoading(true);

    try {
      await onConfirm(fiscalYear.id);
      toast.success("Fiscal year deleted successfully");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete fiscal year");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !fiscalYear) return null;

  return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-md w-full overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              Delete Fiscal Year
            </h2>
          </div>

          {/* Body */}
          <div className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <p className="text-base font-medium text-slate-800 dark:text-slate-200 mb-2">
              Delete "{fiscalYear.name}"?
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              This action cannot be undone.
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-center gap-3 p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <Button
                variant="destructive"
                onClick={handleConfirm}
                disabled={isLoading}
                className="px-5 h-8 text-sm"
            >
              {isLoading ? "Deleting..." : "Yes, Delete"}
            </Button>
            <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="px-5 h-8 text-sm"
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      </div>
  );
};