// src/pages/file/CompanyDocuments/components/DocumentGridView.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Download, Star, Trash2, Share2, Move, Folder } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import type { CompanyDocument } from '@/modules/file/types/CompanyDocuments/index';
import { getFileIcon, getDisplayName, getDisplaySize, getContentType, getId, getUpdatedAt, getCategory, getDescription, getIsFavorite } from '@/modules/file/utils/CompanyDocuments/helpers';
import { CATEGORY_COLORS, CATEGORIES } from '@/modules/file/constants/CompanyDocuments/categories';

interface DocumentGridViewProps {
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

export const DocumentGridView: React.FC<DocumentGridViewProps> = ({
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {documents.map((item) => {
                const id = getId(item);
                const name = getDisplayName(item);
                const contentType = getContentType(item);
                const size = isFolder(item) ? `${item?.documentCount || item?.subFolderCount || 0} items` : getDisplaySize(item);
                const updatedAt = getUpdatedAt(item);
                const isFavorite = getIsFavorite(item);
                const category = getCategory(item);
                const isFolderItem = isFolder(item);

                return (
                    <motion.div
                        key={id || `item-${Math.random()}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -4 }}
                        className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => handleItemClick(item)}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${isFolderItem ? 'bg-amber-50 dark:bg-amber-950/30' : 'bg-gray-50 dark:bg-slate-800'}`}>
                                    {isFolderItem ? (
                                        <Folder className="w-5 h-5 text-amber-500" />
                                    ) : (
                                        getFileIcon(contentType, name)
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
                                        {name || 'Unnamed'}
                                    </p>
                                    {isFolderItem ? (
                                        <Badge className="text-xs mt-1 bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                                            Folder • {size}
                                        </Badge>
                                    ) : (
                                        <Badge className={`text-xs mt-1 ${getCategoryBadge(category)}`}>
                                            {category || 'Other'}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            {isFavorite && !isFolderItem && (
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                            )}
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                    {size || '0 KB'}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                    {updatedAt ? formatDistanceToNow(new Date(updatedAt), { addSuffix: true }) : 'Unknown'}
                                </p>
                            </div>
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                {isFolderItem ? (
                                    // ✅ Folder actions - Open, Delete
                                    <>
                                        <button
                                            onClick={() => handleItemClick(item)}
                                            className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-colors text-amber-500"
                                            title="Open Folder"
                                        >
                                            <Folder className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(item)}
                                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-500"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-3 h-3" />
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
                                            <Download className="w-3 h-3" />
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
                                            <Star className={`w-3 h-3 ${isFavorite ? 'fill-yellow-400' : ''}`} />
                                        </button>
                                        <button
                                            onClick={() => onShare(item)}
                                            className="p-1 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors text-purple-500"
                                            title="Share"
                                        >
                                            <Share2 className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => onMove(item)}
                                            className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-colors text-amber-500"
                                            title="Move"
                                        >
                                            <Move className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(item)}
                                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-500"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};