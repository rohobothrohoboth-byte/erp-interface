// steps/ConfirmAccountModal.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import { Button } from '../../../../components/ui/button';

interface ConfirmAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    employeeName: string;
    totalPermissions: number;
    isLoading: boolean;
}

export const ConfirmAccountModal: React.FC<ConfirmAccountModalProps> = ({
                                                                            isOpen,
                                                                            onClose,
                                                                            onConfirm,
                                                                            employeeName,
                                                                            totalPermissions,
                                                                            isLoading,
                                                                        }) => {
    if (!isOpen) return null;

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
                <div className="flex justify-between items-center px-5 py-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                            Confirm Account Creation
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        You are about to create an account for <span className="font-semibold text-slate-800 dark:text-slate-200">{employeeName}</span> with <span className="font-semibold text-emerald-600 dark:text-emerald-400">{totalPermissions}</span> permissions.
                    </p>
                    <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg">
                        ⚠️ This action cannot be undone. Please verify all permissions before confirming.
                    </p>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex justify-center gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-5 h-8 text-sm"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="px-5 h-8 text-sm bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                                    Creating...
                                </>
                            ) : (
                                'Confirm'
                            )}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};