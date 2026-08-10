import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type {
  LeavePolicyConfigListDto,
  UUID,
} from "@/modules/core/types/Settings/leavePolicyConfig";

interface DeleteLeavePolicyConfigModalProps {
  leavePolicyConfig: LeavePolicyConfigListDto | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (appChain: UUID) => void;
}

const DeleteLeavePolicyConfigModal: React.FC<
  DeleteLeavePolicyConfigModalProps
> = ({ leavePolicyConfig, isOpen, onClose, onConfirm }) => {
  if (!isOpen || !leavePolicyConfig) return null;

  const handleConfirm = () => {
    onConfirm(leavePolicyConfig.id);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-md sm:max-w-lg"
      >
        {/* Modal Body */}
        <div className="p-4 sm:p-6">
          <div className="py-2 sm:py-4 text-center">
            <div className="flex items-center justify-center p-2 sm:p-3 rounded-full gap-2 text-red-600 mx-auto">
              <AlertTriangle className="w-8 h-8 sm:w-12 sm:h-12" />
            </div>

            <p className="text-base sm:text-lg font-medium text-red-600 mt-3 sm:mt-4">
              Are you sure you want to delete this policy config?
            </p>
            <p className="text-xs sm:text-sm text-red-600 mt-2">
              This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t p-4 sm:px-6 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-1.5">
            <Button
              variant="destructive"
              onClick={handleConfirm}
              className="w-full sm:w-auto cursor-pointer px-4 sm:px-6"
            >
              Yes, Delete!
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full sm:w-auto px-4 sm:px-6 py-2 cursor-pointer bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors duration-200 font-medium"
            >
              No, Keep It.
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DeleteLeavePolicyConfigModal;
