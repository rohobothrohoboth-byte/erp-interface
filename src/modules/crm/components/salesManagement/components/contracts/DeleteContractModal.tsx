// src/components/crm/salesManagement/components/contracts/DeleteContractModal.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { X, FileText, Loader2, AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';  // Adjust path as needed

interface DeleteContractModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    contractNumber: string;
    customerName?: string;
    isDeleting?: boolean;
}

const DeleteContractModal: React.FC<DeleteContractModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     onConfirm,
                                                                     contractNumber,
                                                                     customerName,
                                                                     isDeleting = false,
                                                                 }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <FileText className="h-5 w-5 text-red-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Delete Contract</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-yellow-800">
                                This action cannot be undone
                            </p>
                            <p className="text-sm text-yellow-700">
                                Deleting this contract will permanently remove it from the system.
                            </p>
                        </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium text-gray-900">{contractNumber}</p>
                        {customerName && (
                            <p className="text-sm text-gray-500">Customer: {customerName}</p>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Contract
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default DeleteContractModal;