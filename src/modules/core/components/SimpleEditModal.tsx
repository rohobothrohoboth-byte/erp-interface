// components/core/SimpleEditModal.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface SimpleEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    title: string;
    children: React.ReactNode;
    initialData?: any;
    saveLabel?: string;
}

export const SimpleEditModal: React.FC<SimpleEditModalProps> = ({
                                                                    isOpen,
                                                                    onClose,
                                                                    onSave,
                                                                    title,
                                                                    children,
                                                                    initialData,
                                                                    saveLabel = 'Save Changes',
                                                                }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setError(null);
            setLoading(false);
        }
    }, [isOpen]);

    const handleSave = async () => {
        setLoading(true);
        setError(null);
        try {
            await onSave(initialData);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to save changes');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={(e) => e.target === e.currentTarget && onClose()}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                                    <Shield className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {children}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mx-6 mb-4 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-red-500" />
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="flex justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                            <Button variant="outline" onClick={onClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={loading}
                                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        {saveLabel}
                                    </>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};