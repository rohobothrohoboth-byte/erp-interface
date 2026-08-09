// src/components/crm/salesManagement/components/opportunities/DeleteOpportunityModal.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '../../../../ui/button';

interface DeleteOpportunityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName: string;
    itemType?: string;
    isDeleting: boolean;
}

const DeleteOpportunityModal: React.FC<DeleteOpportunityModalProps> = ({
                                                                           isOpen,
                                                                           onClose,
                                                                           onConfirm,
                                                                           itemName,
                                                                           itemType = 'opportunity',
                                                                           isDeleting,
                                                                       }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
                    >
                        {/* Icon */}
                        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
                            <AlertTriangle className="h-8 w-8 text-red-600" />
                        </div>

                        {/* Content */}
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Delete {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
                            </h3>
                            <p className="text-sm text-gray-500 mb-1">
                                Are you sure you want to delete this {itemType}?
                            </p>
                            <p className="text-sm font-medium text-gray-700">
                                "{itemName}"
                            </p>
                            <p className="text-xs text-red-500 mt-2">
                                This action cannot be undone.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                disabled={isDeleting}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={onConfirm}
                                disabled={isDeleting}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete'
                                )}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DeleteOpportunityModal;