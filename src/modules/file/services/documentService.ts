// src/services/file/documentService.ts

import { fileApi } from '@/modules/file/services/fileManagement/fileManagementApi';

// ==================== TYPE DEFINITIONS ====================
export interface DocumentItem {
    id: string;
    name: string;
    originalFileName: string;
    contentType: string;
    size: string;
    sizeBytes: number;
    updatedAt: string;
    owner: string;
    ownerId: string;
    folderId: string | null;
    folderName?: string;
    folderCategory?: string;
    isFavorite: boolean;
    isArchived: boolean;
    isShared: boolean;
    sharingLevel: string;
    thumbnailPath: string | null;
    thumbnailUrl?: string | null;
    filePath: string;
    module: string;
    referenceId: string | null;
    category: string;
    documentType: string;
    icon: string;
    color?: string;
    canEdit: boolean;
    canDelete: boolean;
    canDownload: boolean;
    canShare: boolean;
    uploadedBy: string;
    uploadedByName: string;
    uploadedAt: string;
    lastModifiedAt: string | null;
    version: number;
    hash: string | null;
}

export interface FolderItem {
    id: string;
    name: string;
    description?: string;
    fileCount: number;
    updatedAt: string;
    type: 'company' | 'personal' | 'shared' | 'public' | 'archive';
    owner: string;
    ownerId?: string;
    parentId?: string | null;
    isShared?: boolean;
    isPublic?: boolean;
    sharingLevel?: string;
    createdAt?: string;
    createdBy?: string;
    canEdit?: boolean;
    canDelete?: boolean;
    canShare?: boolean;
    icon?: string;
    color?: string;
}

// ==================== RESPONSE TYPES ====================
export interface DocumentResponse {
    success: boolean;
    data: DocumentItem[];
    message?: string;
    errors?: any;
    statusCode: number;
    timestamp?: string;
}

export interface FolderResponse {
    success: boolean;
    data: FolderItem[];
    message?: string;
    errors?: any;
    statusCode: number;
    timestamp?: string;
}

// ==================== DOCUMENT OPERATIONS ====================

// Get all documents (with pagination and filtering)
export const getAllDocuments = async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    module?: string;
    category?: string;
    includeArchived?: boolean;
}): Promise<DocumentResponse> => {
    const response = await fileApi.get('/documents/all', { params });
    return response.data;
};

// Get favorite documents
export const getFavoriteDocuments = async (): Promise<DocumentResponse> => {
    const response = await fileApi.get('/documents/favorites');
    return response.data;
};

// Get recent documents
export const getRecentDocuments = async (limit: number = 10): Promise<DocumentResponse> => {
    const response = await fileApi.get('/documents/recent', { params: { limit } });
    return response.data;
};

// Get documents by module
export const getDocumentsByModule = async (module: string, referenceId?: string): Promise<DocumentResponse> => {
    const response = await fileApi.get(`/documents/module/${module}`, {
        params: { referenceId }
    });
    return response.data;
};

// Get documents by folder
export const getDocumentsByFolder = async (folderId: string): Promise<DocumentResponse> => {
    const response = await fileApi.get(`/folders/${folderId}/documents`);
    return response.data;
};

// Get document by ID
export const getDocumentById = async (id: string): Promise<any> => {
    const response = await fileApi.get(`/documents/${id}`);
    return response.data;
};

// Toggle favorite
export const toggleFavorite = async (documentId: string): Promise<any> => {
    const response = await fileApi.post(`/documents/${documentId}/favorite`);
    return response.data;
};

// Delete document
export const deleteDocument = async (documentId: string, permanent: boolean = false): Promise<any> => {
    const response = await fileApi.delete(`/documents/${documentId}`, {
        params: { permanent }
    });
    return response.data;
};

// Restore document
export const restoreDocument = async (documentId: string): Promise<any> => {
    const response = await fileApi.post(`/documents/${documentId}/restore`);
    return response.data;
};

// ✅ FIXED: Archive document (toggle) - REMOVED /api/ from path
export const archiveDocument = async (id: string): Promise<any> => {
    try {
        const response = await fileApi.post(`/documents/${id}/archive`);
        return response.data;
    } catch (error) {
        console.error('Error archiving document:', error);
        throw error;
    }
};

// ✅ FIXED: Set archive status explicitly - REMOVED /api/ from path
export const setArchiveStatus = async (id: string, isArchived: boolean): Promise<any> => {
    try {
        const response = await fileApi.put(`/documents/${id}/archive`, { isArchived });
        return response.data;
    } catch (error) {
        console.error('Error setting archive status:', error);
        throw error;
    }
};

// ✅ FIXED: Get archived documents - REMOVED /api/ from path
export const getArchivedDocuments = async (search?: string): Promise<any> => {
    try {
        const response = await fileApi.get('/documents/archived', { params: { search } });
        return response.data;
    } catch (error) {
        console.error('Error fetching archived documents:', error);
        throw error;
    }
};

// Download document
export const downloadDocument = async (documentId: string, fileName: string): Promise<void> => {
    try {
        if (!documentId) {
            throw new Error('Document ID is required');
        }

        const response = await fileApi.get(`/documents/${documentId}/download`, {
            responseType: 'blob',
            timeout: 30000,
        });

        if (!response.data || response.data.size === 0) {
            throw new Error('Downloaded file is empty');
        }

        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }, 100);
    } catch (error: any) {
        console.error('❌ [Documents] Download failed:', error);
        throw new Error('Failed to download document. Please try again later.');
    }
};

// Upload document
export const uploadDocument = async (data: {
    file: File;
    module: string;
    referenceId?: string;
    category?: string;
    description?: string;
    folderId?: string;
    isPublic?: boolean;
    isShared?: boolean;
}): Promise<any> => {
    if (!data.file) {
        console.error('❌ [Documents] No file provided for upload');
        throw new Error('No file provided');
    }

    try {
        const formData = new FormData();
        formData.append('file', data.file);
        formData.append('module', data.module || 'general');
        formData.append('fileName', data.file.name);
        if (data.referenceId) formData.append('referenceId', data.referenceId);
        if (data.category) formData.append('category', data.category);
        if (data.description) formData.append('description', data.description);
        if (data.folderId) formData.append('folderId', data.folderId);
        if (data.isPublic !== undefined) formData.append('isPublic', String(data.isPublic));
        if (data.isShared !== undefined) formData.append('isShared', String(data.isShared));

        const response = await fileApi.post('/documents/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (error) {
        console.error('❌ [Documents] Upload failed:', error);
        throw error;
    }
};

// Update document metadata
export const updateDocument = async (id: string, data: {
    fileName?: string;
    description?: string;
    category?: string;
    isPublic?: boolean;
    isShared?: boolean;
    sharingLevel?: string;
    folderId?: string;
}): Promise<any> => {
    const response = await fileApi.put(`/documents/${id}`, data);
    return response.data;
};

// Share document
export const shareDocument = async (documentId: string, data: {
    sharedWithId: string;
    permission: 'Read' | 'Write' | 'FullControl';
    canDownload?: boolean;
    expiresAt?: string;
}): Promise<any> => {
    const response = await fileApi.post(`/documents/${documentId}/share`, data);
    return response.data;
};

// ==================== FOLDER OPERATIONS ====================

// Get root folders
export const getRootFolders = async (): Promise<FolderResponse> => {
    const response = await fileApi.get('/folders/root');
    return response.data;
};

// Get folder by ID
export const getFolderById = async (id: string): Promise<any> => {
    const response = await fileApi.get(`/folders/${id}`);
    return response.data;
};

// Get folder contents (documents and subfolders)
export const getFolderContents = async (folderId: string): Promise<any> => {
    const response = await fileApi.get(`/folders/${folderId}/contents`);
    return response.data;
};

// Create folder
export const createFolder = async (data: {
    name: string;
    description?: string;
    folderType?: string;
    parentId?: string;
    isPublic?: boolean;
    isShared?: boolean;
    sharingLevel?: string;
}): Promise<any> => {
    const response = await fileApi.post('/folders', data);
    return response.data;
};

// Update folder
export const updateFolder = async (id: string, data: {
    name?: string;
    description?: string;
    isPublic?: boolean;
    isShared?: boolean;
    sharingLevel?: string;
}): Promise<any> => {
    const response = await fileApi.put(`/folders/${id}`, data);
    return response.data;
};

// Delete folder
export const deleteFolder = async (id: string): Promise<any> => {
    const response = await fileApi.delete(`/folders/${id}`);
    return response.data;
};

// Move folder
export const moveFolder = async (id: string, targetParentId: string | null): Promise<any> => {
    const response = await fileApi.post(`/folders/${id}/move`, { targetParentId });
    return response.data;
};

// Move document
export const moveDocument = async (id: string, targetFolderId: string | null): Promise<any> => {
    const response = await fileApi.post(`/documents/${id}/move`, { targetFolderId });
    return response.data;
};