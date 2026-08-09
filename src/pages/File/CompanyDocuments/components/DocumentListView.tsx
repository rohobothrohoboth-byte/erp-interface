// src/pages/file/CompanyDocuments/components/DocumentListView.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { Download, Star, Trash2, Share2, Move, Eye, Folder } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '../../../../components/ui/badge';
import type { CompanyDocument } from '../../../../types/file/CompanyDocuments/index';
import { getFileIcon, getDisplayName, getDisplaySize, getContentType, getUpdatedAt, getId, getOwner, getCategory, getDescription, getIsFavorite } from '../../../../utils/file/CompanyDocuments/helpers';
import { CATEGORY_COLORS, CATEGORIES } from '../../../../constants/file/CompanyDocuments/categories';

interface DocumentListViewProps {
    documents: any[]; // ✅ Changed to any[] to handle both folders and documents
    onDownload: (doc: any) => void;
    onToggleFavorite: (doc: any) => void;
    onDelete: (doc: any) => void;
    onViewDetails: (doc: any) => void;
    onShare: (doc: any) => void;
    onMove: (doc: any) => void;
    onFavorite: (doc: any, isFavorite: boolean) => void;
    onItemClick?: (item: any) => void; // ✅ Optional click handler
}

export const DocumentListView: React.FC<DocumentListViewProps> = ({
                                                                      documents = [], // ✅ Default to empty array
                                                                      onDownload,
                                                                      onToggleFavorite,
                                                                      onDelete,
                                                                      onViewDetails,
                                                                      onMove,
                                                                      onShare,
                                                                      onFavorite,
                                                                      onItemClick,
                                                                  }) => {
    const getCategoryBadge = (category: string) => {
        const found = CATEGORIES.find(c => c.id === category || category.includes(c.id));
        const color = found?.color || 'gray';
        return CATEGORY_COLORS[color] || CATEGORY_COLORS.gray;
    };

    // ✅ Check if item is a folder
    const isFolder = (item: any) => item?.type === 'folder';

    // ✅ Handle item click
    const handleItemClick = (item: any) => {
        if (onItemClick) {
            onItemClick(item);
        } else {
            onViewDetails(item);
        }
    };

    // ✅ Safe check for documents
    if (!documents || documents.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">No items found</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                    <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Size / Items</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Modified</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Owner</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {documents.map((item) => {
                        // ✅ Safe access with optional chaining
                        const id = getId(item);
                        const name = getDisplayName(item);
                        const contentType = getContentType(item);
                        const size = isFolder(item) ? `${item?.documentCount || item?.subFolderCount || 0} items` : getDisplaySize(item);
                        const updatedAt = getUpdatedAt(item);
                        const owner = getOwner(item);
                        const isFavorite = getIsFavorite(item);
                        const category = getCategory(item);
                        const description = getDescription(item);
                        const isFolderItem = isFolder(item);

                        return (
                            <motion.tr
                                key={id || `item-${Math.random()}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                                onClick={() => handleItemClick(item)}
                            >
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        {isFolderItem ? (
                                            <Folder className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                        ) : (
                                            getFileIcon(contentType, name)
                                        )}
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                                                {name || 'Unnamed'}
                                                {isFolderItem && (
                                                    <Badge className="ml-2 text-[10px] bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                                                        Folder
                                                    </Badge>
                                                )}
                                            </p>
                                            {description && (
                                                <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-xs">
                                                    {description}
                                                </p>
                                            )}
                                        </div>
                                        {isFavorite && !isFolderItem && (
                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    {isFolderItem ? (
                                        <Badge className="text-xs bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800">
                                            Folder
                                        </Badge>
                                    ) : (
                                        <Badge className={`text-xs ${getCategoryBadge(category)}`}>
                                            {category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Other'}
                                        </Badge>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{size || '0 KB'}</td>
                                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                    {updatedAt ? formatDistanceToNow(new Date(updatedAt), { addSuffix: true }) : 'Unknown'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                    {owner || 'Unknown'}
                                </td>
                                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-center gap-1">
                                        {isFolderItem ? (
                                            // ✅ Folder actions - Open, Delete
                                            <>
                                                <button
                                                    onClick={() => handleItemClick(item)}
                                                    className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-colors text-amber-500"
                                                    title="Open Folder"
                                                >
                                                    <Folder className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(item)}
                                                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-500"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        ) : (
                                            // ✅ Document actions
                                            <>
                                                <button
                                                    onClick={() => onDownload(item)}
                                                    className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-blue-500"
                                                    title="Download"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => onToggleFavorite(item)}
                                                    className={`p-1 rounded-lg transition-colors ${
                                                        isFavorite
                                                            ? 'text-yellow-500 hover:text-yellow-600'
                                                            : 'text-gray-400 dark:text-gray-500 hover:text-yellow-500'
                                                    }`}
                                                    title="Toggle Favorite"
                                                >
                                                    <Star className={`w-4 h-4 ${isFavorite ? 'fill-yellow-400' : ''}`} />
                                                </button>
                                                <button
                                                    onClick={() => onShare(item)}
                                                    className="p-1 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors text-purple-500"
                                                    title="Share"
                                                >
                                                    <Share2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => onMove(item)}
                                                    className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-colors text-amber-500"
                                                    title="Move"
                                                >
                                                    <Move className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(item)}
                                                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-500"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => onViewDetails(item)}
                                                    className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-400 dark:text-gray-500"
                                                    title="Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
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