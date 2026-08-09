// src/pages/file/FolderContentsPage/components/MoveModal.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Move } from 'lucide-react';
import { Button } from '../../../../components/ui/button';

interface MoveModalProps {
    isOpen: boolean;
    onClose: () => void;
    document: any;
    targetFolderId: string;
    onTargetFolderChange: (id: string) => void;
    availableFolders: any[];
    onMove: () => void;
}

export const MoveModal: React.FC<MoveModalProps> = ({
                                                        isOpen,
                                                        onClose,
                                                        document,
                                                        targetFolderId,
                                                        onTargetFolderChange,
                                                        availableFolders,
                                                        onMove,
                                                    }) => {
    return (
        <AnimatePresence>
            {isOpen && document && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl border border-gray-200 dark:border-slate-700"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Move className="w-5 h-5 text-amber-500" />
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Move File</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Moving:</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {document.fileName || document.name}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Target Folder <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={targetFolderId}
                                    onChange={(e) => onTargetFolderChange(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-slate-800 dark:text-white"
                                >
                                    <option value="">Select a folder...</option>
                                    {availableFolders.map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.name} {f.folderType ? `(${f.folderType})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button
                                onClick={onClose}
                                variant="outline"
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={onMove}
                                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                                disabled={!targetFolderId}
                            >
                                Move
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};