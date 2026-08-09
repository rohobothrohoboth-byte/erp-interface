// src/pages/file/CompanyFolders/components/DetailModal.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { X, FolderOpen, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../../../components/ui/badge';
import type{ CompanyFolder } from '../../../../types/file/CompanyFolders/index';
import { getFolderIcon, getFolderColor, getFolderTypeDisplay, getItemCount, getFolderUpdatedAt, getFolderCreatedAt, getFolderOwner } from '../../../../utils/file/CompanyFolders/helpers';

interface DetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    folder: CompanyFolder | null;
    onEdit: (folder: CompanyFolder) => void;
    onDelete: (folder: CompanyFolder) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
                                                            isOpen,
                                                            onClose,
                                                            folder,
                                                            onEdit,
                                                            onDelete,
                                                        }) => {
    const navigate = useNavigate();

    if (!folder) return null;

    const type = folder.folderType || folder.type || 'general';
    const items = getItemCount(folder);
    const updatedAt = getFolderUpdatedAt(folder);
    const createdAt = getFolderCreatedAt(folder);
    const owner = getFolderOwner(folder);

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
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/30">
                                    {getFolderIcon(type)}
                                </div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Folder Details</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{folder.name}</p>
                            </div>
                            {folder.description && (
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{folder.description}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                                <Badge className={getFolderColor(type)}>
                                    {getFolderTypeDisplay(type)}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Items</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{items}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {format(new Date(createdAt), 'PPP')}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
                                </p>
                            </div>
                            {owner && (
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Owner</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{owner}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    navigate(`/folder/${folder.id}`);
                                    onClose();
                                }}
                                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                            >
                                <FolderOpen className="w-4 h-4" />
                                Open Folder
                            </button>
                            <button
                                onClick={() => {
                                    onEdit(folder);
                                    onClose();
                                }}
                                className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => {
                                    onDelete(folder);
                                    onClose();
                                }}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};