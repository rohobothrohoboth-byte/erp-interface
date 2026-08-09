// src/pages/file/CompanyFolders/components/FolderGridView.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import type{ CompanyFolder } from '../../../../types/file/CompanyFolders/index';
import { getFolderIcon, getFolderColor, getFolderTypeDisplay, getItemCount, getFolderUpdatedAt, getFolderName, getFolderId }  from '../../../../utils/file/CompanyFolders/helpers';

interface FolderGridViewProps {
    folders: CompanyFolder[];
    onViewDetails: (folder: CompanyFolder) => void;
    onEdit: (folder: CompanyFolder) => void;
    onDelete: (folder: CompanyFolder) => void;
    deletingId: string | null;
}

export const FolderGridView: React.FC<FolderGridViewProps> = ({
                                                                  folders,
                                                                  onViewDetails,
                                                                  onEdit,
                                                                  onDelete,
                                                                  deletingId,
                                                              }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {folders.map((folder) => {
                const id = getFolderId(folder);
                const name = getFolderName(folder);
                const type = folder.folderType || folder.type || 'general';
                const items = getItemCount(folder);
                const updatedAt = getFolderUpdatedAt(folder);
                const isDeleting = deletingId === id;

                return (
                    <motion.div
                        key={id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -4 }}
                        className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 hover:shadow-lg transition-all cursor-pointer group"
                        onClick={() => onViewDetails(folder)}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gray-50 dark:bg-slate-800">
                                    {getFolderIcon(type)}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
                                        {name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {items} items
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => onEdit(folder)}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-400 dark:text-gray-500 hover:text-blue-500"
                                    title="Edit"
                                >
                                    <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => onDelete(folder)}
                                    disabled={isDeleting}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-400 dark:text-gray-500 hover:text-red-500"
                                    title="Delete"
                                >
                                    {isDeleting ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-3.5 h-3.5" />
                                    )}
                                </button>
                            </div>
                        </div>
                        {folder.description && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-1">
                                {folder.description}
                            </p>
                        )}
                        <div className="mt-3 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                            <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
                            </span>
                            <Badge className={`text-[10px] ${getFolderColor(type)}`}>
                                {getFolderTypeDisplay(type)}
                            </Badge>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};