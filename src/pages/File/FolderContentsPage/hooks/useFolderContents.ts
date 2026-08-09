// src/pages/file/FolderContentsPage/hooks/useFolderContents.ts

import { useState, useEffect, useCallback } from 'react';
import { showToast } from '../../../../layout/layout';
import { getFolderContents } from '../../../../services/fileManagement/folder.api';

// ============================================================
// TYPES
// ============================================================

interface FolderItem {
    id: string;
    name: string;
    description?: string;
    folderType?: string;
    parentId?: string | null;
    documentCount?: number;
    subFolderCount?: number;
    createdAt?: string;
    updatedAt?: string;
    canEdit?: boolean;
    canDelete?: boolean;
    canShare?: boolean;
    icon?: string;
    color?: string;
}

interface DocumentItem {
    id: string;
    name: string;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    contentType?: string;
    mimeType?: string;
    description?: string;
    category?: string;
    documentType?: string;
    folderId?: string;
    uploadedBy?: string;
    uploadedAt?: string;
    createdAt?: string;
    updatedAt?: string;
    isFavorite?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    canDownload?: boolean;
    canShare?: boolean;
}

interface FolderContentsData {
    folder: FolderItem | null;
    subFolders: FolderItem[];
    documents: DocumentItem[];
}

// ============================================================
// HOOK
// ============================================================

export const useFolderContents = (
    folderId: string | undefined,
    folders: FolderItem[] = []
) => {
    const [folder, setFolder] = useState<FolderItem | null>(null);
    const [subFolders, setSubFolders] = useState<FolderItem[]>([]);
    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ============================================================
    // LOAD CONTENTS
    // ============================================================

    const loadContents = useCallback(async () => {
        if (!folderId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Find folder in the existing folders list
            const existingFolder = folders.find(f => f.id === folderId);

            // Fetch folder contents from API
            const response = await getFolderContents(folderId);
            const data = response?.data?.data || response?.data || { folder: null, subFolders: [], documents: [] };

            // Use the folder from API response or fallback to existing folder
            const folderData = data.folder || existingFolder || null;

            // Process sub-folders
            const subFoldersData = data.subFolders || data.folders || [];

            // Process documents
            const documentsData = data.documents || data.files || [];

            setFolder(folderData);
            setSubFolders(subFoldersData);
            setDocuments(documentsData);
        } catch (err: any) {
            console.error('Failed to load folder contents:', err);
            setError(err.message || 'Failed to load folder contents');

            // If API fails, fallback to folders from context
            if (folderId) {
                const existingFolder = folders.find(f => f.id === folderId);
                if (existingFolder) {
                    setFolder(existingFolder);
                    // Try to get subfolders from context
                    const contextSubFolders = folders.filter(f => f.parentId === folderId);
                    if (contextSubFolders.length > 0) {
                        setSubFolders(contextSubFolders);
                    }
                }
            }

            showToast.error(error?.message || 'Failed to load folder contents');
        } finally {
            setLoading(false);
        }
    }, [folderId, folders]);

    // ============================================================
    // INITIAL LOAD
    // ============================================================

    useEffect(() => {
        loadContents();
    }, [loadContents]);

    // ============================================================
    // REFRESH
    // ============================================================

    const refresh = useCallback(async () => {
        await loadContents();
    }, [loadContents]);

    // ============================================================
    // HELPER FUNCTIONS
    // ============================================================

    const getFolderPath = useCallback((): FolderItem[] => {
        const path: FolderItem[] = [];
        let current = folder;

        while (current) {
            path.unshift(current);
            const parent = folders.find(f => f.id === current?.parentId);
            current = parent || null;
        }

        return path;
    }, [folder, folders]);

    const hasSubFolders = useCallback((): boolean => {
        return subFolders.length > 0;
    }, [subFolders]);

    const hasDocuments = useCallback((): boolean => {
        return documents.length > 0;
    }, [documents]);

    const getDocumentById = useCallback((docId: string): DocumentItem | undefined => {
        return documents.find(d => d.id === docId);
    }, [documents]);

    const getSubFolderById = useCallback((subFolderId: string): FolderItem | undefined => {
        return subFolders.find(f => f.id === subFolderId);
    }, [subFolders]);

    const getTotalItems = useCallback((): number => {
        return subFolders.length + documents.length;
    }, [subFolders, documents]);

    const getTotalSize = useCallback((): number => {
        return documents.reduce((total, doc) => {
            const size = doc.fileSize || 0;
            return total + (typeof size === 'number' ? size : 0);
        }, 0);
    }, [documents]);

    const getTotalSizeFormatted = useCallback((): string => {
        const totalBytes = getTotalSize();
        if (totalBytes === 0) return '0 B';
        if (totalBytes < 1024) return totalBytes + ' B';
        if (totalBytes < 1024 * 1024) return (totalBytes / 1024).toFixed(1) + ' KB';
        return (totalBytes / (1024 * 1024)).toFixed(1) + ' MB';
    }, [getTotalSize]);

    // ============================================================
    // FILTER FUNCTIONS
    // ============================================================

    const filterDocumentsByCategory = useCallback((category: string): DocumentItem[] => {
        return documents.filter(doc =>
            (doc.category || '').toLowerCase() === category.toLowerCase()
        );
    }, [documents]);

    const filterDocumentsByType = useCallback((type: string): DocumentItem[] => {
        return documents.filter(doc =>
            (doc.documentType || doc.fileType || '').toLowerCase().includes(type.toLowerCase())
        );
    }, [documents]);

    const searchItems = useCallback((query: string): { folders: FolderItem[]; documents: DocumentItem[] } => {
        const search = query.toLowerCase();
        const filteredFolders = subFolders.filter(f =>
            f.name.toLowerCase().includes(search)
        );
        const filteredDocuments = documents.filter(d =>
            (d.name || d.fileName || '').toLowerCase().includes(search)
        );
        return { folders: filteredFolders, documents: filteredDocuments };
    }, [subFolders, documents]);

    // ============================================================
    // STATS
    // ============================================================

    const getStats = useCallback(() => {
        const totalDocuments = documents.length;
        const totalSubFolders = subFolders.length;
        const totalItems = totalDocuments + totalSubFolders;
        const totalSize = getTotalSize();
        const totalSizeFormatted = getTotalSizeFormatted();

        // Count documents by category
        const documentsByCategory: Record<string, number> = {};
        documents.forEach(doc => {
            const category = doc.category || 'uncategorized';
            documentsByCategory[category] = (documentsByCategory[category] || 0) + 1;
        });

        // Count documents by type
        const documentsByType: Record<string, number> = {};
        documents.forEach(doc => {
            const type = doc.documentType || doc.fileType || 'unknown';
            documentsByType[type] = (documentsByType[type] || 0) + 1;
        });

        return {
            totalDocuments,
            totalSubFolders,
            totalItems,
            totalSize,
            totalSizeFormatted,
            documentsByCategory,
            documentsByType,
        };
    }, [documents, subFolders, getTotalSize, getTotalSizeFormatted]);

    // ============================================================
    // RETURN
    // ============================================================

    return {
        // Data
        folder,
        subFolders,
        documents,
        loading,
        error,

        // Actions
        loadContents,
        refresh,

        // Helpers
        getFolderPath,
        hasSubFolders,
        hasDocuments,
        getDocumentById,
        getSubFolderById,
        getTotalItems,
        getTotalSize,
        getTotalSizeFormatted,
        getStats,

        // Filter functions
        filterDocumentsByCategory,
        filterDocumentsByType,
        searchItems,
    };
};

export default useFolderContents;