// src/contexts/DocumentContext.tsx

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
    getAllDocuments,
    getFavoriteDocuments,
    getRecentDocuments,
    getDocumentsByFolder,
    getRootFolders,
    toggleFavorite,
    deleteDocument,
    restoreDocument,
    archiveDocument,
    uploadDocument,
    downloadDocument,
    shareDocument,
    createFolder,
    updateDocument,
    moveDocument,
    // ✅ Add these missing imports
    setArchiveStatus,
    getArchivedDocuments,
} from '@/modules/file/services/documentService';
import type { DocumentItem, FolderItem } from '@/modules/file/services/documentService';
import { showToast } from '@/shared/layout/layout';

interface DocumentContextType {
    documents: DocumentItem[];
    favorites: DocumentItem[];
    recent: DocumentItem[];
    folders: FolderItem[];
    loading: boolean;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    refreshAll: () => Promise<void>;
    refreshFavorites: () => Promise<void>;
    refreshRecent: () => Promise<void>;
    refreshFolders: () => Promise<void>;
    refreshFolderContents: (folderId: string) => Promise<DocumentItem[]>;
    toggleFavorite: (id: string) => Promise<void>;
    deleteDocument: (id: string, permanent?: boolean) => Promise<void>;
    restoreDocument: (id: string) => Promise<void>;
    archiveDocument: (id: string) => Promise<void>; // Toggle archive
    setArchiveStatus: (id: string, isArchived: boolean) => Promise<void>; // Explicit set
    getArchivedDocuments: () => Promise<DocumentItem[]>; // Get all archived
    downloadDocument: (id: string, fileName: string) => Promise<void>;
    refreshDocuments: () => Promise<void>;
    uploadDocument: (data: {
        file: File;
        module: string;
        referenceId?: string;
        category?: string;
        description?: string;
        folderId?: string;
        isPublic?: boolean;
        isShared?: boolean;
    }) => Promise<any>;
    updateDocument: (id: string, data: any) => Promise<any>;
    moveDocument: (id: string, targetFolderId: string | null) => Promise<any>;
    createFolder: (data: any) => Promise<any>;
    shareDocument: (id: string, data: any) => Promise<any>;
    getDocumentsByFolder: (folderId: string) => Promise<DocumentItem[]>;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [favorites, setFavorites] = useState<DocumentItem[]>([]);
    const [recent, setRecent] = useState<DocumentItem[]>([]);
    const [folders, setFolders] = useState<FolderItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // ✅ Helper to extract data from API response
    const extractData = useCallback((response: any): any[] => {
        if (!response) return [];
        if (Array.isArray(response)) return response;
        if (response.data) {
            if (Array.isArray(response.data)) return response.data;
            if (response.data.data && Array.isArray(response.data.data)) return response.data.data;
            if (response.data.$values && Array.isArray(response.data.$values)) return response.data.$values;
        }
        if (response.$values && Array.isArray(response.$values)) return response.$values;
        return [];
    }, []);

    // ✅ Normalize document to have consistent property names
    const normalizeDocument = useCallback((doc: any): DocumentItem => {
        if (!doc) return doc;

        // Helper to get property with fallback
        const getProp = (obj: any, ...keys: string[]): any => {
            for (const key of keys) {
                if (obj[key] !== undefined && obj[key] !== null) {
                    return obj[key];
                }
            }
            return undefined;
        };

        // Get file size
        const getSize = (obj: any): number => {
            let size = getProp(obj, 'sizeBytes', 'SizeBytes', 'fileSize', 'FileSize', 'size', 'Size');
            if (typeof size === 'string') {
                const cleaned = size.replace(/[^0-9.]/g, '');
                size = parseFloat(cleaned) || 0;
            }
            return typeof size === 'number' && !isNaN(size) ? size : 0;
        };

        return {
            ...doc,
            id: getProp(doc, 'id', 'Id', 'documentId', 'DocumentId'),
            name: getProp(doc, 'name', 'Name', 'fileName', 'FileName', 'originalFileName', 'OriginalFileName'),
            fileName: getProp(doc, 'fileName', 'FileName', 'originalFileName', 'OriginalFileName', 'name', 'Name'),
            sizeBytes: getSize(doc),
            fileSize: getSize(doc),
            size: getSize(doc),
            contentType: getProp(doc, 'contentType', 'ContentType', 'fileType', 'FileType', 'mimeType', 'MimeType', 'type', 'Type'),
            fileType: getProp(doc, 'fileType', 'FileType', 'contentType', 'ContentType', 'mimeType', 'MimeType'),
            documentType: getProp(doc, 'documentType', 'DocumentType', 'category', 'Category'),
            category: getProp(doc, 'category', 'Category', 'documentType', 'DocumentType'),
            isFavorite: getProp(doc, 'isFavorite', 'IsFavorite', 'isStarred', 'IsStarred') || false,
            isShared: getProp(doc, 'isShared', 'IsShared') || false,
            isPublic: getProp(doc, 'isPublic', 'IsPublic') || false,
            isArchived: getProp(doc, 'isArchived', 'IsArchived') || false,
            folderId: getProp(doc, 'folderId', 'FolderId', 'referenceId', 'ReferenceId'),
            uploadedBy: getProp(doc, 'uploadedBy', 'UploadedBy', 'owner', 'Owner'),
            uploadedAt: getProp(doc, 'uploadedAt', 'UploadedAt', 'dateAdd', 'DateAdd', 'createdAt', 'CreatedAt'),
            updatedAt: getProp(doc, 'updatedAt', 'UpdatedAt', 'dateMod', 'DateMod', 'lastModifiedAt', 'LastModifiedAt'),
            filePath: getProp(doc, 'filePath', 'FilePath', 'path', 'Path'),
            thumbnail: getProp(doc, 'thumbnail', 'Thumbnail', 'thumbnailPath', 'ThumbnailPath'),
            extension: getProp(doc, 'extension', 'Extension', 'fileExtension', 'FileExtension'),
            version: getProp(doc, 'version', 'Version') || 1,
            sharingLevel: getProp(doc, 'sharingLevel', 'SharingLevel') || 'Private',
            module: getProp(doc, 'module', 'Module'),
            storageProvider: getProp(doc, 'storageProvider', 'StorageProvider'),
            description: getProp(doc, 'description', 'Description'),
        };
    }, []);

    const refreshAll = useCallback(async () => {
        try {
            setLoading(true);
            console.log('📤 [Context] Refreshing all documents...');
            const response = await getAllDocuments({ search: searchTerm });

            // Extract and normalize data
            const rawDocs = extractData(response);
            const normalizedDocs = rawDocs.map(normalizeDocument);

            console.log('📤 [Context] Setting documents:', normalizedDocs.length);
            setDocuments(normalizedDocs);
            console.log(`✅ [Context] Loaded ${normalizedDocs.length} documents`);
        } catch (error) {
            console.error('❌ [Context] Error fetching documents:', error);
            showToast.error('Failed to load documents');
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, extractData, normalizeDocument]);

    // ✅ refreshDocuments now properly calls getAllDocuments
    const refreshDocuments = useCallback(async () => {
        try {
            setLoading(true);
            console.log('📤 [Context] Refreshing documents...');
            const response = await getAllDocuments({ search: searchTerm });

            const rawDocs = extractData(response);
            const normalizedDocs = rawDocs.map(normalizeDocument);

            setDocuments(normalizedDocs);
            console.log(`✅ [Context] Loaded ${normalizedDocs.length} documents`);
            return normalizedDocs;
        } catch (error) {
            console.error('❌ [Context] Error refreshing documents:', error);
            showToast.error('Failed to refresh documents');
            setDocuments([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, [searchTerm, extractData, normalizeDocument]);

    const refreshFavorites = useCallback(async () => {
        try {
            console.log('📤 [Context] Refreshing favorites...');
            const response = await getFavoriteDocuments();
            const rawFavs = extractData(response);
            const normalizedFavs = rawFavs.map(normalizeDocument);
            setFavorites(normalizedFavs);
            console.log(`✅ [Context] Loaded ${normalizedFavs.length} favorites`);
        } catch (error) {
            console.error('❌ [Context] Error fetching favorites:', error);
            setFavorites([]);
        }
    }, [extractData, normalizeDocument]);

    const refreshRecent = useCallback(async () => {
        try {
            console.log('📤 [Context] Refreshing recent documents...');
            const response = await getRecentDocuments(10);
            const rawRecent = extractData(response);
            const normalizedRecent = rawRecent.map(normalizeDocument);
            setRecent(normalizedRecent);
            console.log(`✅ [Context] Loaded ${normalizedRecent.length} recent documents`);
        } catch (error) {
            console.error('❌ [Context] Error fetching recent:', error);
            setRecent([]);
        }
    }, [extractData, normalizeDocument]);

    const refreshFolders = useCallback(async () => {
        try {
            console.log('📤 [Context] Refreshing folders...');
            const response = await getRootFolders();
            const rawFolders = extractData(response);
            const normalizedFolders = rawFolders.map((folder: any) => ({
                ...folder,
                id: folder.id || folder.Id || folder.folderId || folder.FolderId,
                name: folder.name || folder.Name || folder.folderName || folder.FolderName,
                type: folder.type || folder.Type || folder.folderType || folder.FolderType,
                description: folder.description || folder.Description,
            }));
            setFolders(normalizedFolders);
            console.log(`✅ [Context] Loaded ${normalizedFolders.length} folders`);
        } catch (error) {
            console.error('❌ [Context] Error fetching folders:', error);
            setFolders([]);
        }
    }, [extractData]);

    const refreshFolderContents = useCallback(async (folderId: string): Promise<DocumentItem[]> => {
        try {
            console.log(`📤 [Context] Refreshing folder contents: ${folderId}`);
            const response = await getDocumentsByFolder(folderId);
            const rawDocs = extractData(response);
            const normalizedDocs = rawDocs.map(normalizeDocument);
            console.log(`✅ [Context] Loaded ${normalizedDocs.length} documents from folder`);
            return normalizedDocs;
        } catch (error) {
            console.error('❌ [Context] Error fetching folder contents:', error);
            showToast.error('Failed to load folder contents');
            return [];
        }
    }, [extractData, normalizeDocument]);

    const handleToggleFavorite = async (id: string) => {
        try {
            console.log(`📤 [Context] Toggling favorite for: ${id}`);
            await toggleFavorite(id);
            await refreshFavorites();
            await refreshAll();
            showToast.success('Favorite updated');
        } catch (error) {
            console.error('❌ [Context] Error toggling favorite:', error);
            showToast.error('Failed to update favorite');
        }
    };

    const handleDeleteDocument = async (id: string, permanent: boolean = false) => {
        try {
            console.log(`📤 [Context] Deleting document: ${id}`, { permanent });
            await deleteDocument(id, permanent);
            await refreshAll();
            await refreshFavorites();
            await refreshRecent();
            showToast.success(permanent ? 'Document permanently deleted' : 'Document moved to trash');
        } catch (error) {
            console.error('❌ [Context] Error deleting document:', error);
            showToast.error('Failed to delete document');
        }
    };

    const handleRestoreDocument = async (id: string) => {
        try {
            console.log(`📤 [Context] Restoring document: ${id}`);
            await restoreDocument(id);
            await refreshAll();
            await refreshFavorites();
            showToast.success('Document restored');
        } catch (error) {
            console.error('❌ [Context] Error restoring document:', error);
            showToast.error('Failed to restore document');
        }
    };

    // ✅ Toggle archive (uses POST)
    const handleArchiveDocument = async (id: string) => {
        try {
            console.log(`📤 [Context] Toggling archive for document: ${id}`);
            const response = await archiveDocument(id);
            await refreshAll();
            await refreshFavorites();
            showToast.success(response?.message || 'Archive status updated');
            return response;
        } catch (error) {
            console.error('❌ [Context] Error toggling archive:', error);
            showToast.error('Failed to update archive status');
            throw error;
        }
    };

    // ✅ Set archive status explicitly (uses PUT)
    const handleSetArchiveStatus = async (id: string, isArchived: boolean) => {
        try {
            console.log(`📤 [Context] Setting archive status for ${id} to ${isArchived}`);
            const response = await setArchiveStatus(id, isArchived);
            await refreshAll();
            await refreshFavorites();
            showToast.success(response?.message || 'Archive status updated');
            return response;
        } catch (error) {
            console.error('❌ [Context] Error setting archive status:', error);
            showToast.error('Failed to update archive status');
            throw error;
        }
    };

    // ✅ Get archived documents
    const handleGetArchivedDocuments = async (): Promise<DocumentItem[]> => {
        try {
            console.log('📤 [Context] Fetching archived documents...');
            const response = await getArchivedDocuments();
            const rawDocs = extractData(response);
            const normalizedDocs = rawDocs.map(normalizeDocument);
            console.log(`✅ [Context] Found ${normalizedDocs.length} archived documents`);
            return normalizedDocs;
        } catch (error) {
            console.error('❌ [Context] Error fetching archived documents:', error);
            return [];
        }
    };

    const handleDownloadDocument = async (id: string, fileName: string) => {
        try {
            console.log(`📤 [Context] Downloading document: ${id}`, { fileName });
            await downloadDocument(id, fileName);
            console.log(`✅ [Context] Download complete: ${fileName}`);
        } catch (error) {
            console.error('❌ [Context] Error downloading document:', error);
            showToast.error('Failed to download document');
        }
    };

    const handleUploadDocument = async (data: {
        file: File;
        module: string;
        referenceId?: string;
        category?: string;
        description?: string;
        folderId?: string;
        isPublic?: boolean;
        isShared?: boolean;
    }) => {
        console.log('📥 [Context] handleUploadDocument called with:', {
            fileExists: !!data?.file,
            fileName: data?.file?.name,
            fileSize: data?.file?.size,
            fileType: data?.file?.type,
            module: data?.module,
            category: data?.category,
        });

        try {
            if (!data?.file) {
                console.error('❌ [Context] No file provided to uploadDocument');
                showToast.error('No file selected');
                throw new Error('No file provided');
            }

            if (!(data.file instanceof File)) {
                console.error('❌ [Context] Invalid file object - not a File instance:', data.file);
                showToast.error('Invalid file object');
                throw new Error('Invalid file object');
            }

            console.log('📤 [Context] Uploading document:', {
                fileName: data.file.name,
                fileSize: `${(data.file.size / 1024).toFixed(2)} KB`,
                fileType: data.file.type,
                module: data.module,
                category: data.category,
            });

            const response = await uploadDocument({
                file: data.file,
                module: data.module,
                referenceId: data.referenceId,
                category: data.category,
                description: data.description,
                folderId: data.folderId,
                isPublic: data.isPublic,
                isShared: data.isShared,
            });

            console.log('✅ [Context] Upload successful:', response);

            await refreshAll();
            await refreshRecent();
            showToast.success('Document uploaded successfully');
            return response;
        } catch (error) {
            console.error('❌ [Context] Upload failed:', error);
            showToast.error('Failed to upload document');
            throw error;
        }
    };

    const handleUpdateDocument = async (id: string, data: any) => {
        try {
            console.log(`📤 [Context] Updating document: ${id}`, data);
            const response = await updateDocument(id, data);
            await refreshAll();
            showToast.success('Document updated');
            return response;
        } catch (error) {
            console.error('❌ [Context] Error updating document:', error);
            showToast.error('Failed to update document');
            throw error;
        }
    };

    const handleMoveDocument = async (id: string, targetFolderId: string | null) => {
        try {
            console.log(`📤 [Context] Moving document: ${id}`, { targetFolderId });
            const response = await moveDocument(id, targetFolderId);
            await refreshAll();
            showToast.success('Document moved');
            return response;
        } catch (error) {
            console.error('❌ [Context] Error moving document:', error);
            showToast.error('Failed to move document');
            throw error;
        }
    };

    const handleCreateFolder = async (data: any) => {
        try {
            console.log('📤 [Context] Creating folder:', data);
            const response = await createFolder(data);
            await refreshFolders();
            showToast.success('Folder created');
            return response;
        } catch (error) {
            console.error('❌ [Context] Error creating folder:', error);
            showToast.error('Failed to create folder');
            throw error;
        }
    };

    const handleShareDocument = async (id: string, data: any) => {
        try {
            console.log(`📤 [Context] Sharing document: ${id}`, data);
            const response = await shareDocument(id, data);
            showToast.success('Document shared');
            return response;
        } catch (error) {
            console.error('❌ [Context] Error sharing document:', error);
            showToast.error('Failed to share document');
            throw error;
        }
    };

    const handleGetDocumentsByFolder = async (folderId: string): Promise<DocumentItem[]> => {
        try {
            console.log(`📤 [Context] Getting documents by folder: ${folderId}`);
            const response = await getDocumentsByFolder(folderId);
            const rawDocs = extractData(response);
            const normalizedDocs = rawDocs.map(normalizeDocument);
            console.log(`✅ [Context] Found ${normalizedDocs.length} documents in folder`);
            return normalizedDocs;
        } catch (error) {
            console.error('❌ [Context] Error fetching documents by folder:', error);
            return [];
        }
    };

    useEffect(() => {
        console.log('🔁 [Context] Initializing DocumentProvider...');
        refreshAll();
        refreshFavorites();
        refreshRecent();
        refreshFolders();
    }, []);

    const value = useMemo(() => ({
        documents,
        favorites,
        recent,
        folders,
        loading,
        searchTerm,
        setSearchTerm,
        refreshAll,
        refreshFavorites,
        refreshRecent,
        refreshFolders,
        refreshFolderContents,
        refreshDocuments,
        toggleFavorite: handleToggleFavorite,
        deleteDocument: handleDeleteDocument,
        restoreDocument: handleRestoreDocument,
        archiveDocument: handleArchiveDocument,
        setArchiveStatus: handleSetArchiveStatus, // ✅ Add this
        getArchivedDocuments: handleGetArchivedDocuments, // ✅ Add this
        downloadDocument: handleDownloadDocument,
        uploadDocument: handleUploadDocument,
        updateDocument: handleUpdateDocument,
        moveDocument: handleMoveDocument,
        createFolder: handleCreateFolder,
        shareDocument: handleShareDocument,
        getDocumentsByFolder: handleGetDocumentsByFolder,
    }), [
        documents,
        favorites,
        recent,
        folders,
        loading,
        searchTerm,
    ]);

    return (
        <DocumentContext.Provider value={value}>
            {children}
        </DocumentContext.Provider>
    );
};

export const useDocuments = () => {
    const context = useContext(DocumentContext);
    if (!context) {
        throw new Error('useDocuments must be used within a DocumentProvider');
    }
    return context;
};