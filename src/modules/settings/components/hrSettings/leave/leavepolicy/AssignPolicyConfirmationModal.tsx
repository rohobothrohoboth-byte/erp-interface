import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface AssignPolicyConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading?: boolean;
}

const AssignPolicyConfirmationModal: React.FC<AssignPolicyConfirmationModalProps> = ({
                                                                                         isOpen,
                                                                                         onClose,
                                                                                         onConfirm,
                                                                                         isLoading = false
                                                                                     }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-md"
            >
                {/* Modal Body */}
                <div className="p-6">
                    <div className="text-center">
                        <div className="flex items-center justify-center p-3 rounded-full gap-2 text-amber-600 mx-auto bg-amber-50 w-16 h-16">
                            <AlertTriangle className="w-8 h-8" />
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 mt-4">
                            Assign Leave Policies
                        </h3>

                        <p className="text-sm text-gray-600 mt-2">
                            Are you sure you want to assign this leave policy to eligible employees?
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                            This action will apply the policy rules to all matching employees based on assignment rules and conditions.
                        </p>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="border-t px-6 py-4 bg-gray-50 rounded-b-xl">
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
                        <Button
                            onClick={onConfirm}  // FIXED: Use onConfirm directly, not handleConfirm
                            disabled={isLoading}
                            className="flex cursor-pointer items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto px-6"
                        >
                            {isLoading ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Assigning...
                                </>
                            ) : (
                                "Confirm Assignment"
                            )}
                        </Button>

                        <Button
                            onClick={onClose}
                            variant="outline"
                            disabled={isLoading}
                            className="w-full sm:w-auto px-6"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AssignPolicyConfirmationModal;