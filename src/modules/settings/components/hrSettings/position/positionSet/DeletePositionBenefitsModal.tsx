import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import type { PositionBenefitListDto } from "@/modules/hr/types/position";
import { Button } from "@/shared/components/ui/button";

interface DeletePositionBenefitsModalProps {
  benefit: PositionBenefitListDto | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (benefit: PositionBenefitListDto) => void;
}

const DeletePositionBenefitsModal: React.FC<DeletePositionBenefitsModalProps> = ({
  benefit,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !benefit) return null;

  const handleConfirm = () => {
    onConfirm(benefit);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6 h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Body */}
        <div className="p-6">
          <div className="py-4 text-center">
            <div className="flex items-center justify-center p-3 rounded-full gap-2 text-red-600 mx-auto">
              <AlertTriangle size={50} />
            </div>

            <p className="text-lg font-medium text-red-600 mt-4">
              Remove Benefit?
            </p>
            <p className="text-sm text-red-600 mt-2">
              This action cannot be undone.
            </p>
            
            {/* Benefit Details */}
            {/* <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Award className="h-4 w-4 text-red-600" />
                <p className="text-sm font-medium text-gray-800">{benefit.position}</p>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-2">Benefit will be removed from:</p>
                <p className="text-sm font-semibold text-gray-800">{benefit.position}</p>
                <p className="text-xs text-gray-500 mt-1">{benefit.positionAm}</p>
              </div>
              
              <div className="mt-3 pt-3 border-t border-red-200">
                <p className="text-xs text-red-600 font-medium text-center">
                  This benefit assignment will be permanently removed
                </p>
              </div>
            </div> */}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t px-6 py-2">
          <div className="mx-auto flex justify-center items-center gap-1.5">
            <Button
              variant="destructive"
              onClick={handleConfirm}
              className="cursor-pointer px-6"
            >
              Yes, Delete!
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors duration-200 font-medium"
            >
              No, Keep It.
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DeletePositionBenefitsModal;