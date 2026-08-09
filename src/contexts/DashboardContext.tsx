// src/contexts/DashboardContext.tsx

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
    getAllDocuments,
    getRecentDocuments,
    getFavoriteDocuments,
} from '../services/file/documentService';
import type { DocumentItem, FolderItem } from '../services/file/documentService';
import { getRootFolders } from '../services/file/folderService';
import { showToast } from '../layout/layout';

interface DashboardStats {
    totalFiles: number;
    totalFolders: number;
    totalImages: number;
    totalVideos: number;
    totalAudio: number;
    totalArchives: number;
    storageUsed: number;
    totalStorage: number;
}

interface DashboardContextType {
    stats: DashboardStats;
    recentFiles: DocumentItem[];
    favoriteFiles: DocumentItem[];
    folders: FolderItem[];
    loading: boolean;
    refreshing: boolean;
    refreshDashboard: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// ✅ Helper to get property from document with fallback keys
const getDocProperty = (doc: any, ...keys: string[]): any => {
    if (!doc) return undefined;
    for (const key of keys) {
        if (doc[key] !== undefined && doc[key] !== null) {
            return doc[key];
        }
    }
    return undefined;
};

// ✅ Helper to get file size from document (handles various formats)
const getFileSize = (doc: any): number => {
    if (!doc) return 0;

    // Try to get size from various possible field names
    let size = getDocProperty(
        doc,
        'sizeBytes', 'SizeBytes',
        'fileSize', 'FileSize',
        'size', 'Size',
        'fileSizeFormatted'
    );

    // If size is a string, try to parse it
    if (typeof size === 'string') {
        // Remove any non-numeric characters except decimal point
        const cleaned = size.replace(/[^0-9.]/g, '');
        size = parseFloat(cleaned) || 0;
    }

    // If size is not a number, return 0
    if (typeof size !== 'number' || isNaN(size)) {
        return 0;
    }

    return size;
};

// ✅ Helper to get content type from document
const getContentType = (doc: any): string => {
    if (!doc) return '';

    let contentType = getDocProperty(
        doc,
        'contentType', 'ContentType',
        'fileType', 'FileType',
        'mimeType', 'MimeType',
        'type', 'Type',
        'documentType', 'DocumentType',
        'category', 'Category'
    );

    return contentType || '';
};

// ✅ Normalize document to have consistent property names
const normalizeDocument = (doc: any): DocumentItem => {
    if (!doc) return doc;

    // Get all properties with fallbacks
    const id = getDocProperty(doc, 'id', 'Id', 'documentId', 'DocumentId');
    const name = getDocProperty(doc, 'name', 'Name', 'fileName', 'FileName', 'originalFileName', 'OriginalFileName');
    const fileName = getDocProperty(doc, 'fileName', 'FileName', 'originalFileName', 'OriginalFileName', 'name', 'Name');
    const fileSize = getFileSize(doc);
    const contentType = getContentType(doc);
    const documentType = getDocProperty(doc, 'documentType', 'DocumentType', 'category', 'Category');
    const category = getDocProperty(doc, 'category', 'Category', 'documentType', 'DocumentType');
    const isFavorite = getDocProperty(doc, 'isFavorite', 'IsFavorite', 'isStarred', 'IsStarred') || false;
    const isShared = getDocProperty(doc, 'isShared', 'IsShared') || false;
    const isPublic = getDocProperty(doc, 'isPublic', 'IsPublic') || false;
    const folderId = getDocProperty(doc, 'folderId', 'FolderId', 'referenceId', 'ReferenceId');
    const uploadedBy = getDocProperty(doc, 'uploadedBy', 'UploadedBy', 'owner', 'Owner');
    const uploadedAt = getDocProperty(doc, 'uploadedAt', 'UploadedAt', 'dateAdd', 'DateAdd', 'createdAt', 'CreatedAt');
    const updatedAt = getDocProperty(doc, 'updatedAt', 'UpdatedAt', 'dateMod', 'DateMod', 'lastModifiedAt', 'LastModifiedAt');
    const filePath = getDocProperty(doc, 'filePath', 'FilePath', 'path', 'Path');
    const thumbnail = getDocProperty(doc, 'thumbnail', 'Thumbnail', 'thumbnailPath', 'ThumbnailPath');
    const extension = getDocProperty(doc, 'extension', 'Extension', 'fileExtension', 'FileExtension');
    const version = getDocProperty(doc, 'version', 'Version') || 1;
    const sharingLevel = getDocProperty(doc, 'sharingLevel', 'SharingLevel') || 'Private';
    const module = getDocProperty(doc, 'module', 'Module');
    const storageProvider = getDocProperty(doc, 'storageProvider', 'StorageProvider');
    const description = getDocProperty(doc, 'description', 'Description');

    return {
        ...doc,
        // Ensure consistent property names (camelCase)
        id,
        name: name || fileName,
        fileName: fileName || name,
        sizeBytes: fileSize,
        fileSize: fileSize,
        size: fileSize,
        contentType: contentType || documentType || category || '',
        fileType: contentType || documentType || category || '',
        documentType: documentType || category || contentType || '',
        category: category || documentType || '',
        isFavorite,
        isShared,
        isPublic,
        folderId,
        uploadedBy,
        uploadedAt,
        updatedAt,
        filePath,
        thumbnail,
        extension,
        version,
        sharingLevel,
        module,
        storageProvider,
        description,
        // Keep original data for reference
        _original: doc
    };
};

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [stats, setStats] = useState<DashboardStats>({
        totalFiles: 0,
        totalFolders: 0,
        totalImages: 0,
        totalVideos: 0,
        totalAudio: 0,
        totalArchives: 0,
        storageUsed: 0,
        totalStorage: 100,
    });
    const [recentFiles, setRecentFiles] = useState<DocumentItem[]>([]);
    const [favoriteFiles, setFavoriteFiles] = useState<DocumentItem[]>([]);
    const [folders, setFolders] = useState<FolderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // ✅ Calculate stats from documents and folders
    // ✅ Calculate stats from documents and folders
    const calculateStats = useCallback((documents: DocumentItem[], folderList: FolderItem[]) => {
        console.log('📊 [Dashboard] Calculating stats from:', documents.length, 'documents');

        const totalFiles = documents.length;
        const totalFolders = folderList.length;

        // ✅ Count by file type with better detection and priority
        let images = 0;
        let videos = 0;
        let audio = 0;
        let archives = 0;
        let documents_count = 0;
        let others = 0;

        documents.forEach(d => {
            // Get all type fields
            const contentType = (d.contentType || '').toLowerCase();
            const fileType = (d.fileType || '').toLowerCase();
            const documentType = (d.documentType || '').toLowerCase();
            const category = (d.category || '').toLowerCase();
            const extension = (d.extension || '').toLowerCase();
            const fileName = (d.name || d.fileName || '').toLowerCase();

            // ✅ Check for archive FIRST (highest priority)
            const isArchive =
                category === 'archive' ||
                documentType === 'archive' ||
                contentType.includes('zip') ||
                contentType.includes('rar') ||
                contentType.includes('7z') ||
                contentType.includes('archive') ||
                ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].some(ext =>
                    extension.includes(ext) || fileName.includes(ext)
                ) ||
                // Check for spreadsheet (Excel files are often stored in archives)
                (contentType.includes('spreadsheet') && category === 'archive');

            if (isArchive) {
                archives++;
                console.log(`📊 [Dashboard] Archive detected: ${d.name || d.fileName} (${contentType || fileType || documentType || category})`);
                return;
            }

            // ✅ Check for images
            const isImage =
                contentType.startsWith('image/') ||
                fileType.startsWith('image/') ||
                documentType === 'image' ||
                category === 'image' ||
                ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'].some(ext =>
                    extension.includes(ext) || fileName.includes(ext)
                );

            if (isImage) {
                images++;
                return;
            }

            // ✅ Check for videos
            const isVideo =
                contentType.startsWith('video/') ||
                fileType.startsWith('video/') ||
                documentType === 'video' ||
                category === 'video' ||
                ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'].some(ext =>
                    extension.includes(ext) || fileName.includes(ext)
                );

            if (isVideo) {
                videos++;
                return;
            }

            // ✅ Check for audio
            const isAudio =
                contentType.startsWith('audio/') ||
                fileType.startsWith('audio/') ||
                documentType === 'audio' ||
                category === 'audio' ||
                ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'].some(ext =>
                    extension.includes(ext) || fileName.includes(ext)
                );

            if (isAudio) {
                audio++;
                return;
            }

            // ✅ Count as document if it's a known document type
            const isDocument =
                contentType.includes('pdf') ||
                contentType.includes('word') ||
                contentType.includes('document') ||
                contentType.includes('spreadsheet') ||
                contentType.includes('presentation') ||
                contentType.includes('text') ||
                documentType === 'document' ||
                documentType === 'pdf' ||
                ['pdf', 'doc', 'docx', 'txt', 'rtf', 'xls', 'xlsx', 'csv', 'ppt', 'pptx'].some(ext =>
                    extension.includes(ext) || fileName.includes(ext)
                );

            if (isDocument) {
                documents_count++;
                return;
            }

            // ✅ Everything else
            others++;
            console.log(`📊 [Dashboard] Other file type: ${d.name || d.fileName} (${contentType || fileType || documentType || category})`);
        });

        // ✅ Calculate storage used (in GB)
        const totalBytes = documents.reduce((acc, d) => {
            // Try to get size from various fields
            let size = d.sizeBytes || d.fileSize || d.size || 0;

            // If size is a string, try to parse it
            if (typeof size === 'string') {
                const cleaned = size.replace(/[^0-9.]/g, '');
                size = parseFloat(cleaned) || 0;
            }

            // Ensure it's a number
            if (typeof size !== 'number' || isNaN(size)) {
                size = 0;
            }

            return acc + size;
        }, 0);

        // Convert bytes to GB and round to 2 decimal places
        const storageUsedGB = Math.round((totalBytes / (1024 * 1024 * 1024)) * 100) / 100;

        console.log('📊 [Dashboard] Stats calculated:', {
            totalFiles,
            totalFolders,
            images,
            videos,
            audio,
            archives,
            documents: documents_count,
            others,
            totalBytes,
            storageUsedGB,
            totalStorage: 100,
        });

        // ✅ Log individual file sizes for debugging
        if (documents.length > 0) {
            console.log('📊 [Dashboard] File details:');
            documents.forEach(d => {
                const size = d.sizeBytes || d.fileSize || d.size || 0;
                const type = d.contentType || d.fileType || d.documentType || d.category || 'unknown';
                console.log(`  - ${d.name || d.fileName || 'Unnamed'}: ${size} bytes (${(size / 1024 / 1024).toFixed(2)} MB) - Type: ${type}`);
            });
        }

        setStats({
            totalFiles,
            totalFolders,
            totalImages: images,
            totalVideos: videos,
            totalAudio: audio,
            totalArchives: archives,
            storageUsed: storageUsedGB,
            totalStorage: 100,
        });
    }, []);

    // ✅ Helper to extract data from API response
    const extractData = (response: any): any[] => {
        if (!response) return [];
        if (Array.isArray(response)) return response;
        if (response.data) {
            if (Array.isArray(response.data)) return response.data;
            if (response.data.data && Array.isArray(response.data.data)) return response.data.data;
            if (response.data.$values && Array.isArray(response.data.$values)) return response.data.$values;
        }
        if (response.$values && Array.isArray(response.$values)) return response.$values;
        return [];
    };

    // ✅ Refresh dashboard data
    const refreshDashboard = useCallback(async () => {
        try {
            setRefreshing(true);
            setLoading(true);

            console.log('📊 [Dashboard] Fetching dashboard data...');

            // ✅ Fetch all data in parallel
            const [documentsRes, recentRes, favoritesRes, foldersRes] = await Promise.all([
                getAllDocuments({ page: 1, pageSize: 1000 }),
                getRecentDocuments(10),
                getFavoriteDocuments(),
                getRootFolders(),
            ]);

            // ✅ Extract data from responses
            const rawDocuments = extractData(documentsRes);
            const rawRecentDocs = extractData(recentRes);
            const rawFavoriteDocs = extractData(favoritesRes);
            const rawFolderList = extractData(foldersRes);

            console.log('📊 [Dashboard] Raw data loaded:', {
                documents: rawDocuments.length,
                recent: rawRecentDocs.length,
                favorites: rawFavoriteDocs.length,
                folders: rawFolderList.length,
            });

            // ✅ Log sample document to debug field names
            if (rawDocuments.length > 0) {
                console.log('📊 [Dashboard] Sample document fields:', Object.keys(rawDocuments[0]));
                console.log('📊 [Dashboard] Sample document:', rawDocuments[0]);
            }

            // ✅ Normalize documents to have consistent property names
            const normalizedDocuments = rawDocuments.map(normalizeDocument);
            const normalizedRecent = rawRecentDocs.map(normalizeDocument);
            const normalizedFavorites = rawFavoriteDocs.map(normalizeDocument);

            // ✅ Normalize folders
            const normalizedFolders = rawFolderList.map((folder: any) => ({
                ...folder,
                id: getDocProperty(folder, 'id', 'Id', 'folderId', 'FolderId'),
                name: getDocProperty(folder, 'name', 'Name', 'folderName', 'FolderName'),
                type: getDocProperty(folder, 'type', 'Type', 'folderType', 'FolderType'),
                description: getDocProperty(folder, 'description', 'Description'),
                isPublic: getDocProperty(folder, 'isPublic', 'IsPublic') || false,
                isShared: getDocProperty(folder, 'isShared', 'IsShared') || false,
                sharingLevel: getDocProperty(folder, 'sharingLevel', 'SharingLevel') || 'Private',
                createdAt: getDocProperty(folder, 'createdAt', 'CreatedAt', 'dateAdd', 'DateAdd'),
                updatedAt: getDocProperty(folder, 'updatedAt', 'UpdatedAt', 'dateMod', 'DateMod'),
            }));

            console.log('📊 [Dashboard] Normalized data:', {
                documents: normalizedDocuments.length,
                recent: normalizedRecent.length,
                favorites: normalizedFavorites.length,
                folders: normalizedFolders.length,
            });

            // ✅ Set state with normalized data
            setRecentFiles(normalizedRecent);
            setFavoriteFiles(normalizedFavorites);
            setFolders(normalizedFolders);
            calculateStats(normalizedDocuments, normalizedFolders);

            console.log('📊 [Dashboard] Dashboard refresh complete');
        } catch (error) {
            console.error('❌ [Dashboard] Error refreshing dashboard:', error);
            showToast.error('Failed to refresh dashboard');
            // ✅ Set empty arrays on error
            setRecentFiles([]);
            setFavoriteFiles([]);
            setFolders([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [calculateStats]);

    // ✅ Initial load
    useEffect(() => {
        refreshDashboard();
    }, [refreshDashboard]);

    // ✅ Memoize context value
    const value = useMemo(() => ({
        stats,
        recentFiles,
        favoriteFiles,
        folders,
        loading,
        refreshing,
        refreshDashboard,
    }), [stats, recentFiles, favoriteFiles, folders, loading, refreshing, refreshDashboard]);

    return (
        <DashboardContext.Provider value={value}>
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};