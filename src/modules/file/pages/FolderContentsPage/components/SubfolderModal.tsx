// src/pages/file/FolderContentsPage/components/SubfolderModal.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderPlus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface SubfolderModalProps {
    isOpen: boolean;
    onClose: () => void;
    folderName: string;
    onFolderNameChange: (name: string) => void;
    description: string;
    onDescriptionChange: (desc: string) => void;
    category: string;
    onCategoryChange: (category: string) => void;
    creating: boolean;
    onCreate: () => void;
    parentFolderName?: string;
    FOLDER_CATEGORIES: any[];
}

export const SubfolderModal: React.FC<SubfolderModalProps> = ({
                                                                  isOpen,
                                                                  onClose,
                                                                  folderName,
                                                                  onFolderNameChange,
                                                                  description,
                                                                  onDescriptionChange,
                                                                  category,
                                                                  onCategoryChange,
                                                                  creating,
                                                                  onCreate,
                                                                  parentFolderName,
                                                                  FOLDER_CATEGORIES,
                                                              }) => {
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
                                <FolderPlus className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create Subfolder</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Folder Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={folderName}
                                    onChange={(e) => onFolderNameChange(e.target.value)}
                                    placeholder="Enter subfolder name"
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-slate-800 dark:text-white"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Category
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => onCategoryChange(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-slate-800 dark:text-white"
                                >
                                    <option value="">Select a category...</option>
                                    {FOLDER_CATEGORIES.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => onDescriptionChange(e.target.value)}
                                    placeholder="Enter description (optional)"
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-slate-800 dark:text-white resize-none"
                                />
                            </div>

                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                <p>📍 This subfolder will be created inside: <span className="font-medium text-gray-700 dark:text-gray-300">{parentFolderName}</span></p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                                disabled={creating}
                            >
                                Cancel
                            </button>
                            <Button
                                onClick={onCreate}
                                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                                disabled={!folderName.trim() || creating}
                            >
                                {creating ? 'Creating...' : 'Create Subfolder'}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};