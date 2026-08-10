import React, { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { LeaveRequestListDto } from '@/modules/hr/types/leaverequest';

interface DeleteLeaveReqModalProps {
  leave: LeaveRequestListDto | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (leaveId: string) => Promise<void>;
}

const DeleteLeaveReqModal: React.FC<DeleteLeaveReqModalProps> = ({
                                                                   leave,
                                                                   isOpen,
                                                                   onClose,
                                                                   onConfirm
                                                                 }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!leave) return;

    setIsDeleting(true);
    try {
      await onConfirm(leave.id);
      onClose();
    } catch (error) {
      console.error('Error deleting leave request:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      onClose();
    }
  };

  if (!isOpen || !leave) return null;

  return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden"
        >
          {/* Modal Body */}
          <div className="p-6">
            <div className="text-center">
              <div className="flex items-center justify-center p-3 rounded-full bg-red-100 mx-auto w-16 h-16">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">
                Delete Leave Request
              </h3>

              <p className="text-sm text-gray-600 mt-2">
                Are you sure you want to delete this leave request?
              </p>

              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-800">
                  {leave.leaveType}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                </p>
              </div>

              <p className="text-xs text-red-600 mt-3">
                This action cannot be undone.
              </p>

              {leave.statusStr === 'Approved' && (
                  <p className="text-xs text-amber-600 mt-2">
                    Note: This leave request has already been approved. Deleting it may affect leave balance calculations.
                  </p>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="border-t px-6 py-4 bg-gray-50">
            <div className="flex justify-center gap-3">
              <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isDeleting}
                  className="px-6 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                  variant="destructive"
                  onClick={handleConfirm}
                  disabled={isDeleting}
                  className="px-6 cursor-pointer"
              >
                {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Deleting...
                    </>
                ) : (
                    'Yes, Delete'
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
  );
};

export default DeleteLeaveReqModal;