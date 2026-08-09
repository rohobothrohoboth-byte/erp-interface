// src/components/ui/DeleteModal.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, File, Loader2 } from 'lucide-react';
import { Button } from '../../../../components/ui/button';

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName: string;
    itemType?: 'file' | 'folder' | 'document';
    isDeleting?: boolean;
    permanent?: boolean;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
                                                            isOpen,
                                                            onClose,
                                                            onConfirm,
                                                            itemName,
                                                            itemType = 'file',
                                                            isDeleting = false,
                                                            permanent = false,
                                                        }) => {
    const getItemIcon = () => {
        switch (itemType) {
            case 'folder':
                return <Folder className="w-12 h-12 text-amber-500" />;
            case 'document':
                return <FileText className="w-12 h-12 text-blue-500" />;
            default:
                return <File className="w-12 h-12 text-red-500" />;
        }
    };

    const getItemLabel = () => {
        switch (itemType) {
            case 'folder':
                return 'folder';
            case 'document':
                return 'document';
            default:
                return 'file';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl border border-gray-200 dark:border-slate-700"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-red-500">
                                <AlertTriangle className="w-5 h-5" />
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Delete {getItemLabel()}
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                disabled={isDeleting}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex flex-col items-center text-center py-4">
                            <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-full mb-4">
                                {getItemIcon()}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Are you sure?
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                You are about to delete <strong className="text-gray-700 dark:text-gray-300">{itemName}</strong>.
                                {permanent ? (
                                    <span className="text-red-500 block mt-1 font-medium">
                                        This action is permanent and cannot be undone!
                                    </span>
                                ) : (
                                    <span className="text-amber-500 block mt-1">
                                        This item will be moved to trash.
                                    </span>
                                )}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                            <Button
                                onClick={onClose}
                                disabled={isDeleting}
                                variant="outline"
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={onConfirm}
                                disabled={isDeleting}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle className="w-4 h-4 mr-2" />
                                        Delete {getItemLabel()}
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