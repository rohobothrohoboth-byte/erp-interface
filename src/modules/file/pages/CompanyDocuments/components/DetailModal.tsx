// src/pages/file/CompanyDocuments/components/DetailModal.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Star, Trash2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Badge } from '@/shared/components/ui/badge';
import type { CompanyDocument } from '@/modules/file/types/CompanyDocuments/index';
import { getFileIcon, getDisplayName, getDisplaySize, getContentType, getCreatedAt, getUpdatedAt, getCategory, getDescription, getIsFavorite } from '@/modules/file/utils/CompanyDocuments/helpers';
import { CATEGORY_COLORS,CATEGORIES } from '@/modules/file/constants/CompanyDocuments/categories';




interface DetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    document: CompanyDocument | null;
    onDownload: (doc: CompanyDocument) => void;
    onToggleFavorite: (doc: CompanyDocument) => void;
    onDelete: (doc: CompanyDocument) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
                                                            isOpen,
                                                            onClose,
                                                            document,
                                                            onDownload,
                                                            onToggleFavorite,
                                                            onDelete,
                                                        }) => {
    if (!document) return null;

    const name = getDisplayName(document);
    const contentType = getContentType(document);
    const size = getDisplaySize(document);
    const category = getCategory(document);
    const description = getDescription(document);
    const createdAt = getCreatedAt(document);
    const updatedAt = getUpdatedAt(document);
    const isFavorite = getIsFavorite(document);

    const getCategoryBadge = (cat: string) => {
        const found = CATEGORIES.find(c => c.id === cat || cat.includes(c.id));
        const color = found?.color || 'gray';
        return CATEGORY_COLORS[color] || CATEGORY_COLORS.gray;
    };

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
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                                    {getFileIcon(contentType, name)}
                                </div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Document Details</h2>
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
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                                <Badge className={`${getCategoryBadge(category)}`}>
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Size</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{size}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Uploaded</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {format(new Date(createdAt), 'PPP')}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Last Modified</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
                                </p>
                            </div>
                            {description && (
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{description}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    onDownload(document);
                                    onClose();
                                }}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Download
                            </button>
                            <button
                                onClick={() => onToggleFavorite(document)}
                                className={`px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                                    isFavorite
                                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                        : 'border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'
                                }`}
                            >
                                <Star className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
                            </button>
                            <button
                                onClick={() => {
                                    onDelete(document);
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