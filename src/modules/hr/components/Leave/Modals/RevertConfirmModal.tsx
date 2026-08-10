// src/components/hr/Leave/Modals/RevertConfirmModal.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface Props {
    isOpen: boolean;
    fiscalYearName: string;
    onConfirm: () => void;
    onClose: () => void;
    reverting: boolean;
}

export const RevertConfirmModal: React.FC<Props> = ({
                                                        isOpen,
                                                        fiscalYearName,
                                                        onConfirm,
                                                        onClose,
                                                        reverting
                                                    }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-xl max-w-md w-full"
            >
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-100 rounded-full">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Revert Year-End Processing</h2>
                    </div>

                    <p className="text-gray-600 mb-4">
                        Revert year-end processing for <strong>{fiscalYearName}</strong>?
                    </p>

                    <div className="bg-red-50 p-3 rounded-lg mb-4">
                        <p className="text-sm text-red-800 font-medium">This will:</p>
                        <ul className="text-xs text-red-700 mt-1 space-y-1">
                            <li>• Restore original leave policies</li>
                            <li>• Remove all carryover records created</li>
                            <li>• Delete associated ledger entries</li>
                            <li>• Clear all history records</li>
                        </ul>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={reverting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={onConfirm}
                            disabled={reverting}
                            variant="destructive"
                        >
                            {reverting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Confirm Revert
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};