// src/pages/file/CompanyDocuments/components/SubfolderModal.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderPlus, Loader2 } from 'lucide-react';

interface SubfolderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: { name: string; description: string; folderType?: string }) => void;
    parentFolder: any;
    creating: boolean;
}

export const SubfolderModal: React.FC<SubfolderModalProps> = ({
                                                                  isOpen,
                                                                  onClose,
                                                                  onCreate,
                                                                  parentFolder,
                                                                  creating,
                                                              }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [folderType, setFolderType] = useState('company');

    const handleSubmit = () => {
        if (!name.trim()) return;
        onCreate({ name: name.trim(), description: description.trim(), folderType });
        setName('');
        setDescription('');
        setFolderType('company');
    };

    if (!parentFolder) return null;

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
                                <FolderPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
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
                            <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Parent Folder</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{parentFolder.name}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Subfolder Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter subfolder name"
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-white"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Enter description (optional)"
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Folder Type
                                </label>
                                <select
                                    value={folderType}
                                    onChange={(e) => setFolderType(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-white"
                                >

                                    <option value="department">Department</option>
                                    <option value="team">Team</option>
                                    <option value="shared">Shared</option>

                                    <option value="archive">Archive</option>
                                </select>
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
                            <button
                                onClick={handleSubmit}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                                disabled={!name.trim() || creating}
                            >
                                {creating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create Subfolder'
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};