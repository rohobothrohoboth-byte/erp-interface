import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import type { PositionEduListDto } from "@/modules/hr/types/position";
import { Button } from "@/shared/components/ui/button";

interface DeletePositionEducationModalProps {
  education: PositionEduListDto | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (education: PositionEduListDto) => void;
}

const DeletePositionEducationModal: React.FC<DeletePositionEducationModalProps> = ({
  education,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !education) return null;

  const handleConfirm = () => {
    onConfirm(education);
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
              Delete Education Requirement?
            </p>
            <p className="text-sm text-red-600 mt-2">
              This qualification requirement will be removed.
            </p>
            
            {/* Education Details */}
            {/* <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-center justify-center gap-2 mb-3">
                <GraduationCap className="h-4 w-4 text-red-600" />
                <p className="text-sm font-medium text-gray-800">{education.position}</p>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span className="font-medium">Education Level:</span>
                  <span>{education.educationLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Qualification:</span>
                  <span>{education.educationQual}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Position:</span>
                  <span>{education.position}</span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-red-200">
                <p className="text-xs text-red-600 font-medium text-center">
                  This education requirement will be permanently removed
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

export default DeletePositionEducationModal;