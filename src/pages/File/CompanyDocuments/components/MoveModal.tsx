// src/pages/file/CompanyDocuments/components/MoveModal.tsx

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Move, Loader2, Folder, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '../../../../components/ui/button';

interface MoveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onMove: (targetFolderId: string | null) => void;
    document: any;
    folders: any[];
    moving: boolean;
}

export const MoveModal: React.FC<MoveModalProps> = ({
                                                        isOpen,
                                                        onClose,
                                                        onMove,
                                                        document,
                                                        folders,
                                                        moving,
                                                    }) => {
    const [targetFolderId, setTargetFolderId] = useState<string | null>(null);
    const [selectedFolderName, setSelectedFolderName] = useState<string>('');
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

    // ✅ Build folder tree from ALL folders
    const folderTree = useMemo(() => {
        const currentFolderId = document?.folderId || document?.FolderId;

        // Filter out the current folder
        const availableFolders = folders.filter(f => f.id !== currentFolderId);

        // Build tree
        const tree: any[] = [];
        const folderMap: Record<string, any> = {};

        // First pass: create map
        availableFolders.forEach(f => {
            folderMap[f.id] = {
                ...f,
                children: []
            };
        });

        // Second pass: build tree
        availableFolders.forEach(f => {
            if (f.parentId && folderMap[f.parentId]) {
                folderMap[f.parentId].children.push(folderMap[f.id]);
            } else {
                tree.push(folderMap[f.id]);
            }
        });

        return tree;
    }, [folders, document]);

    const handleFolderSelect = (folderId: string | null) => {
        setTargetFolderId(folderId);
        if (folderId) {
            const folder = folders.find(f => f.id === folderId);
            setSelectedFolderName(folder?.name || '');
        } else {
            setSelectedFolderName('Root (Top Level)');
        }
    };

    const toggleExpand = (folderId: string) => {
        setExpandedFolders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(folderId)) {
                newSet.delete(folderId);
            } else {
                newSet.add(folderId);
            }
            return newSet;
        });
    };

    const handleSubmit = () => {
        onMove(targetFolderId);
    };

    if (!document) return null;

    const currentFolderId = document.folderId || document.FolderId;
    const currentFolderName = currentFolderId
        ? folders.find(f => f.id === currentFolderId)?.name || 'Current folder'
        : 'Root';

    // ✅ Render folder tree recursively
    const renderFolderTree = (items: any[], level: number = 0) => {
        return items.map((folder) => {
            const isSelected = targetFolderId === folder.id;
            const hasChildren = folder.children && folder.children.length > 0;
            const isExpanded = expandedFolders.has(folder.id);
            const indent = level * 16;

            // ✅ Check if this folder is a company folder (for visual indicator)
            const isCompanyFolder = (folder.folderType || folder.type || '').toLowerCase() === 'company';

            return (
                <div key={folder.id}>
                    <button
                        onClick={() => handleFolderSelect(folder.id)}
                        className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors border ${
                            isSelected
                                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-500'
                                : 'hover:bg-gray-50 dark:hover:bg-slate-800 border-transparent'
                        }`}
                        style={{ paddingLeft: `${12 + indent}px` }}
                    >
                        {hasChildren && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpand(folder.id);
                                }}
                                className="p-0.5 hover:bg-gray-200 dark:hover:bg-slate-700 rounded"
                            >
                                {isExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                )}
                            </button>
                        )}
                        {!hasChildren && <div className="w-4" />}
                        <Folder className={`w-4 h-4 flex-shrink-0 ${isCompanyFolder ? 'text-blue-500' : 'text-amber-400'}`} />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate flex-1 text-left">
                            {folder.name}
                        </span>
                        {isCompanyFolder && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                                Company
                            </span>
                        )}
                        <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                            {folder.documentCount || folder.subFolderCount || 0} items
                        </span>
                        {isSelected && (
                            <span className="ml-auto text-xs text-amber-500 flex-shrink-0">Selected</span>
                        )}
                    </button>
                    {hasChildren && isExpanded && (
                        <div className="ml-2">
                            {renderFolderTree(folder.children, level + 1)}
                        </div>
                    )}
                </div>
            );
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl border border-gray-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Move className="w-5 h-5 text-amber-500" />
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Move Document</h2>
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
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {document.fileName || document.name || 'Unnamed'}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    Current location: {currentFolderName}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Select Destination Folder
                                </label>
                                <div className="space-y-1 max-h-[300px] overflow-y-auto border border-gray-200 dark:border-slate-700 rounded-lg p-2">
                                    {/* Root option */}
                                    <button
                                        onClick={() => handleFolderSelect(null)}
                                        className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors border ${
                                            targetFolderId === null
                                                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-500'
                                                : 'hover:bg-gray-50 dark:hover:bg-slate-800 border-transparent'
                                        }`}
                                    >
                                        <FolderOpen className="w-4 h-4 text-amber-500" />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Root (Top Level)
                                        </span>
                                        {targetFolderId === null && (
                                            <span className="ml-auto text-xs text-amber-500">Selected</span>
                                        )}
                                    </button>

                                    {/* Folder tree - ALL folders */}
                                    {folderTree.length > 0 ? (
                                        renderFolderTree(folderTree)
                                    ) : (
                                        <div className="text-center py-4 text-sm text-gray-400 dark:text-gray-500">
                                            No folders available to move to
                                        </div>
                                    )}
                                </div>
                            </div>

                            {targetFolderId && selectedFolderName && (
                                <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <p className="text-xs text-blue-600 dark:text-blue-400">
                                        <Folder className="w-3 h-3 inline mr-1" />
                                        Moving to: {selectedFolderName}
                                    </p>
                                </div>
                            )}
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
                                disabled={moving || targetFolderId === undefined}
                            >
                                {moving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                                        Moving...
                                    </>
                                ) : (
                                    <>
                                        <Move className="w-4 h-4 inline mr-2" />
                                        Move Document
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