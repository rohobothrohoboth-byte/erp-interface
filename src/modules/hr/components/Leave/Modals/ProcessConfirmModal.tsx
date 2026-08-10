// src/components/hr/Leave/Modals/ProcessConfirmModal.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface Props {
    isOpen: boolean;
    fiscalYearName: string;
    onConfirm: () => void;
    onClose: () => void;
    processing: boolean;
}

export const ProcessConfirmModal: React.FC<Props> = ({
                                                         isOpen,
                                                         fiscalYearName,
                                                         onConfirm,
                                                         onClose,
                                                         processing
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
                        <div className="p-2 bg-amber-100 rounded-full">
                            <AlertCircle className="w-6 h-6 text-amber-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Confirm Year-End Processing</h2>
                    </div>

                    <p className="text-gray-600 mb-4">
                        Process year-end carryover for <strong>{fiscalYearName}</strong>?
                    </p>

                    <div className="bg-amber-50 p-3 rounded-lg mb-4">
                        <p className="text-sm text-amber-800 font-medium">This will:</p>
                        <ul className="text-xs text-amber-700 mt-1 space-y-1">
                            <li>• Close current leave policies for the fiscal year</li>
                            <li>• Create new policies with carryover balances</li>
                            <li>• Record all transactions in the ledger</li>
                            <li>• Archive current state for audit trail</li>
                        </ul>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={onConfirm}
                            disabled={processing}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Confirm Process
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};