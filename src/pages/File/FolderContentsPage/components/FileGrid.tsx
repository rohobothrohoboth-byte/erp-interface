// src/pages/file/FolderContentsPage/components/FileGrid.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Star, Download, Move, Share2, Trash2, Loader2 } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { getFileIcon, getFolderIcon, formatFileSize } from '../utils/helpers';
import { toggleFavorite } from '../../../../services/fileManagement/fileManagementApi';
import { showToast } from '../../../../layout/layout';

interface FileGridProps {
    items: any[];
    onFolderClick: (id: string) => void;
    onDocumentClick: (id: string) => void;
    onDownload: (doc: any) => void;
    onDelete: (doc: any) => void;
    onMove: (doc: any) => void;
    onShare: (doc: any) => void;
    onFavorite: (doc: any, isFavorite: boolean) => void; // ✅ Expects doc and isFavorite
}

export const FileGrid: React.FC<FileGridProps> = ({
                                                      items,
                                                      onFolderClick,
                                                      onDocumentClick,
                                                      onDownload,
                                                      onDelete,
                                                      onMove,
                                                      onShare,
                                                      onFavorite,
                                                  }) => {
    const [favoriteLoading, setFavoriteLoading] = useState<string | null>(null);

    // ✅ Helper to get display category
    const getDisplayCategory = (item: any) => {
        if (item.type === 'folder') {
            return item.category || item.folderType || item.type || 'General';
        }
        return item.documentType || item.fileType || 'Document';
    };

    // ✅ Helper to get category color
    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            work: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800',
            personal: 'bg-green-50 text-green-600 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800',
            projects: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800',
            documents: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
            images: 'bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-950/30 dark:text-pink-400 dark:border-pink-800',
            videos: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800',
            music: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800',
            archive: 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700',
            company: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800',
            shared: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
            department: 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800',
        };
        return colors[category?.toLowerCase()] || 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700';
    };

    // ✅ Handle favorite toggle - FIXED
    const handleFavoriteClick = async (e: React.MouseEvent, item: any) => {
        e.stopPropagation();

        // ✅ Get the ID from the item
        const docId = item.id || item.Id || item.documentId || item.fileId;
        if (!docId) {
            console.error('❌ [FileGrid] No ID found in item:', item);
            showToast.warning('Cannot toggle favorite: Invalid document');
            return;
        }

        if (favoriteLoading === docId) return;

        setFavoriteLoading(docId);
        try {
            // ✅ Call the API to toggle favorite
            const isFavorite = await toggleFavorite(docId);

            // ✅ Call the parent's onFavorite with the item and new status
            if (onFavorite) {
                onFavorite(item, isFavorite);
            }

            showToast.success(isFavorite ? 'Added to favorites' : 'Removed from favorites');
        } catch (error: any) {
            console.error('Favorite toggle failed:', error);
            showToast.error(error?.message || 'Failed to toggle favorite');
        } finally {
            setFavoriteLoading(null);
        }
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => {
                const category = getDisplayCategory(item);
                const colorClass = getCategoryColor(category);
                const isFavorite = item.isFavorite || false;
                const docId = item.id || item.Id || item.documentId || item.fileId;

                return (
                    <motion.div
                        key={item.id || docId}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -4 }}
                        className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 hover:shadow-lg transition-all cursor-pointer group"
                        onClick={() => item.type === 'folder'
                            ? onFolderClick(item.id)
                            : onDocumentClick(item.id)
                        }
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/30">
                                    {item.type === 'folder'
                                        ? getFolderIcon(item.folderType || item.type)
                                        : getFileIcon(item.fileType || item.mimeType, item.name)
                                    }
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
                                        {item.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {item.type === 'folder'
                                            ? `${item.documentCount || item.subFolderCount || 0} items`
                                            : formatFileSize(item.size || item.fileSize || 0)
                                        }
                                    </p>
                                </div>
                            </div>
                            {item.type === 'folder' ? (
                                <Badge className={`text-[10px] ${colorClass}`}>
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                </Badge>
                            ) : (
                                <button
                                    className={`p-1 rounded-lg transition-colors ${
                                        isFavorite
                                            ? 'text-yellow-500 hover:text-yellow-600'
                                            : 'text-gray-400 hover:text-yellow-500'
                                    }`}
                                    onClick={(e) => handleFavoriteClick(e, item)}
                                    disabled={favoriteLoading === docId}
                                    title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                >
                                    {favoriteLoading === docId ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Star className={`w-4 h-4 ${isFavorite ? 'fill-yellow-400' : ''}`} />
                                    )}
                                </button>
                            )}
                        </div>
                        {item.description && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-1">
                                {item.description}
                            </p>
                        )}
                        <div className="mt-3 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(item.updatedAt || item.createdAt || Date.now()), { addSuffix: true })}
                            </span>
                            {item.type === 'document' && (
                                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-blue-500"
                                        onClick={() => onDownload(item)}
                                        title="Download"
                                    >
                                        <Download className="w-3 h-3" />
                                    </button>
                                    <button
                                        className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-colors text-amber-500"
                                        onClick={() => onMove(item)}
                                        title="Move"
                                    >
                                        <Move className="w-3 h-3" />
                                    </button>
                                    <button
                                        className="p-1 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors text-purple-500"
                                        onClick={() => onShare(item)}
                                        title="Share"
                                    >
                                        <Share2 className="w-3 h-3" />
                                    </button>
                                    <button
                                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-500"
                                        onClick={() => onDelete(item)}
                                        title="Delete"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};