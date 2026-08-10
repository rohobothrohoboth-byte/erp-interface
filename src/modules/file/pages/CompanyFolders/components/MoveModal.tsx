// src/pages/file/CompanyFolders/components/MoveModal.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Move, Loader2, Folder } from 'lucide-react';
import type { CompanyFolder } from '@/modules/file/types/CompanyFolders/index';

interface MoveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onMove: (targetFolderId: string | null) => void;
    folder: CompanyFolder | null;
    folders: CompanyFolder[];
    moving: boolean;
}

export const MoveModal: React.FC<MoveModalProps> = ({
                                                        isOpen,
                                                        onClose,
                                                        onMove,
                                                        folder,
                                                        folders,
                                                        moving,
                                                    }) => {
    const [targetFolderId, setTargetFolderId] = useState<string | null>(null);

    const handleSubmit = () => {
        onMove(targetFolderId);
    };

    if (!folder) return null;

    // Filter out the current folder and its children
    const availableFolders = folders.filter(f => f.id !== folder.id);

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
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Move className="w-5 h-5 text-amber-500" />
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Move Folder</h2>
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
                                <p className="text-sm text-gray-500 dark:text-gray-400">Moving</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{folder.name}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Target Folder
                                </label>
                                <select
                                    value={targetFolderId || ''}
                                    onChange={(e) => setTargetFolderId(e.target.value || null)}
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-slate-800 dark:text-white"
                                >
                                    <option value="">Root (Top Level)</option>
                                    {availableFolders.map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                                disabled={moving}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
                                disabled={moving}
                            >
                                {moving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                                        Moving...
                                    </>
                                ) : (
                                    <>
                                        <Move className="w-4 h-4 inline mr-2" />
                                        Move Folder
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};