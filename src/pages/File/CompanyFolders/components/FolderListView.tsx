// src/pages/file/CompanyFolders/components/FolderListView.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import type{ CompanyFolder } from '../../../../types/file/CompanyFolders/index';
import { getFolderIcon, getFolderColor, getFolderTypeDisplay, getItemCount, getFolderUpdatedAt, getFolderName, getFolderId }  from '../../../../utils/file/CompanyFolders/helpers';

interface FolderListViewProps {
    folders: CompanyFolder[];
    onViewDetails: (folder: CompanyFolder) => void;
    onEdit: (folder: CompanyFolder) => void;
    onDelete: (folder: CompanyFolder) => void;
    deletingId: string | null;
}

export const FolderListView: React.FC<FolderListViewProps> = ({
                                                                  folders,
                                                                  onViewDetails,
                                                                  onEdit,
                                                                  onDelete,
                                                                  deletingId,
                                                              }) => {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                    <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Items</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Updated</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {folders.map((folder) => {
                        const id = getFolderId(folder);
                        const name = getFolderName(folder);
                        const type = folder.folderType || folder.type || 'general';
                        const items = getItemCount(folder);
                        const updatedAt = getFolderUpdatedAt(folder);
                        const isDeleting = deletingId === id;

                        return (
                            <motion.tr
                                key={id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                                onClick={() => onViewDetails(folder)}
                            >
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        {getFolderIcon(type)}
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                                                {name}
                                            </p>
                                            {folder.description && (
                                                <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-xs">
                                                    {folder.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <Badge className={`text-xs ${getFolderColor(type)}`}>
                                        {getFolderTypeDisplay(type)}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                    {items}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                    {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
                                </td>
                                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-center gap-1">
                                        <button
                                            onClick={() => onEdit(folder)}
                                            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-400 dark:text-gray-500 hover:text-blue-500"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(folder)}
                                            disabled={isDeleting}
                                            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-400 dark:text-gray-500 hover:text-red-500"
                                            title="Delete"
                                        >
                                            {isDeleting ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => onViewDetails(folder)}
                                            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-400 dark:text-gray-500 hover:text-indigo-500"
                                            title="Details"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};