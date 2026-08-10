// src/services/fileManagement/fileManagementApi.ts

import axios from 'axios';

// ✅ Configuration - Use the gateway
const API_BASE = import.meta.env.VITE_GATEWAY_URL || 'http://192.168.1.7:5000';
const FILE_PATH = import.meta.env.VITE_FILE_MANAGEMENT_URL || '/file/v1';

export const fileApi = axios.create({
    baseURL: `${API_BASE}${FILE_PATH}`,
    headers: {
        'Content-Type': 'application/json',
    },
});



// ✅ Request interceptor
fileApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn('⚠️ No auth token found for file API request');
        }




        return config;
    },
    (error) => {
        console.error('❌ [File API] Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// ✅ Response interceptor
fileApi.interceptors.response.use(
    (response) => {

        return response;
    },
    (error) => {
        if (error.response) {
            console.error(`❌ [File API] Error ${error.response.status}:`, {
                url: error.config?.url,
                method: error.config?.method,
                status: error.response.status,
                data: error.response.data,
            });
        } else if (error.request) {
            console.error('❌ [File API] No response received:', {
                url: error.config?.url,
                method: error.config?.method,
                error: error.message,
            });
        } else {
            console.error('❌ [File API] Request error:', error.message);
        }

        return Promise.reject(error);
    }
);

// ==================== FILE OPERATIONS ====================

// ✅ Upload file - POST /file/v1/documents/upload
export const uploadFile = async (data: {
    file: File;
    module: string;
    referenceId?: string;
    category?: string;
    documentType?: string;
    description?: string;
    isPublic?: boolean;
    isShared?: boolean;
    sharingLevel?: string;
    folderId?: string;
}) => {
    if (!data.file) {
        console.error('❌ No file provided for upload');
        throw new Error('No file provided');
    }



    const formData = new FormData();

    formData.append('file', data.file);
    formData.append('module', data.module);
    formData.append('fileName', data.file.name);

    if (data.referenceId) formData.append('referenceId', data.referenceId);
    if (data.category) formData.append('category', data.category);
    if (data.documentType) formData.append('documentType', data.documentType);
    if (data.description) formData.append('description', data.description);
    if (data.isPublic !== undefined) formData.append('isPublic', String(data.isPublic));
    if (data.isShared !== undefined) formData.append('isShared', String(data.isShared));
    if (data.sharingLevel) formData.append('sharingLevel', data.sharingLevel);
    if (data.folderId) formData.append('folderId', data.folderId);

    try {
        const response = await fileApi.post('/documents/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });


        return response.data;
    } catch (error) {
        console.error('❌ [File Upload] Upload failed:', error);
        throw error;
    }
};

// ✅ Get files by reference - Use ModuleController
// GET /file/v1/module/{module}/reference/{referenceId}
export const getFilesByReference = (module: string, referenceId: string, category?: string) => {

    return fileApi.get(`/module/${module}/reference/${referenceId}`, {
        params: {
            category
        }
    });
};

// ✅ Get files by module - Use ModuleController
// GET /file/v1/module/{module}
export const getFilesByModule = (module: string, category?: string) => {

    return fileApi.get(`/module/${module}`, { params: { category } });
};
export const getFavorites = () => {
    return fileApi.get('/documents/favorites');
};
export const toggleFavorite = async (id: string): Promise<boolean> => {
    try {
        const response = await fileApi.post(`/documents/${id}/favorite`);
        // The API returns { data: true/false } or { data: { isFavorite: true/false } }
        const result = response?.data?.data || response?.data;
        if (typeof result === 'boolean') {
            return result;
        }
        if (typeof result === 'object' && result !== null) {
            return result.isFavorite ?? result.favorited ?? false;
        }
        return false;
    } catch (error) {
        console.error('❌ [File API] Toggle favorite failed:', error);
        throw error;
    }
};
// ✅ Get file by ID - GET /file/v1/documents/{id}
export const getFile = (id: string) => {

    return fileApi.get(`/documents/${id}`);
};

// ✅ Update file metadata - PUT /file/v1/documents/{id}
export const updateFile = (id: string, data: {
    fileName?: string;
    description?: string;
    category?: string;
    isPublic?: boolean;
    isShared?: boolean;
    sharingLevel?: string;
    folderId?: string;
}) => {

    return fileApi.put(`/documents/${id}`, data);
};

// ✅ Delete file - DELETE /file/v1/documents/{id}
export const deleteFile = (id: string, permanent: boolean = false) => {

    return fileApi.delete(`/documents/${id}`, { params: { permanent } });
};

// ✅ Restore file - POST /file/v1/documents/{id}/restore
export const restoreFile = (id: string) => {

    return fileApi.post(`/documents/${id}/restore`);
};

// ✅ Archive file - POST /file/v1/documents/{id}/archive
export const archiveFile = (id: string) => {
    return fileApi.post(`/documents/${id}/archive`); // Correct: /documents/{id}/archive
};

// ✅ Move file - POST /file/v1/documents/{id}/move
export const moveFile = (id: string, targetFolderId: string | null) => {

    return fileApi.post(`/documents/${id}/move`, { targetFolderId });
};

// ✅ Download file - GET /file/v1/documents/{id}/download
export const downloadFile = async (id: string) => {

    const response = await fileApi.get(`/documents/${id}/download`, {
        responseType: 'blob',
    });

    return response.data;
};

// ✅ Download invoice file - GET /file/v1/documents/{id}/download
export const downloadFileinvoice = async (id: string) => {

    const response = await fileApi.get(`/documents/${id}/download`, {
        responseType: 'blob',
    });

    return response.data;
};

// ✅ Get recent files - GET /file/v1/documents/recent
export const getRecentFiles = (count: number = 10) => {

    return fileApi.get('/documents/recent', { params: { count } });
};

// ==================== FOLDER OPERATIONS ====================

// ✅ Create folder - POST /file/v1/folder
export const createFolder = (data: {
    name: string;
    description?: string;
    folderType?: string;
    parentId?: string;
    isPublic?: boolean;
    isShared?: boolean;
    sharingLevel?: string;
    order?: number;
}) => {

    return fileApi.post('/folder', data);
};

// ✅ Get folder by ID - GET /file/v1/folder/{id}
export const getFolder = (id: string, includeSubFolders: boolean = true, includeDocuments: boolean = true) => {

    return fileApi.get(`/folder/${id}`, {
        params: { includeSubFolders, includeDocuments },
    });
};

// ✅ Get root folders - GET /file/v1/folder/root
export const getRootFolders = () => {

    return fileApi.get('/folder/root');
};

// ✅ Get folder tree - GET /file/v1/folder/tree
export const getFolderTree = (folderType?: string) => {

    return fileApi.get('/folder/tree', { params: { folderType } });
};

// ✅ Update folder - PUT /file/v1/folder/{id}
export const updateFolder = (id: string, data: {
    name: string;
    description?: string;
    folderType?: string;
    isPublic?: boolean;
    isShared?: boolean;
    sharingLevel?: string;
    order?: number;
}) => {

    return fileApi.put(`/folder/${id}`, data);
};

// ✅ Delete folder - DELETE /file/v1/folder/{id}
export const deleteFolder = (id: string) => {

    return fileApi.delete(`/folder/${id}`);
};

// ✅ Move folder - POST /file/v1/folder/{id}/move
export const moveFolder = (id: string, targetParentId: string | null) => {

    return fileApi.post(`/folder/${id}/move`, { targetParentId });
};

// ==================== SHARE OPERATIONS ====================
export const generateShareLink = async (documentId: string): Promise<any> => {
    try {
        const response = await fileApi.post(`/documents/${documentId}/generate-share-link`);
        return response.data;
    } catch (error) {
        console.error('❌ [File API] Generate share link failed:', error);
        throw error;
    }
};
export const getPublicFileInfo = async (token: string) => {
    try {
        const response = await fileApi.get(`/public/info/${token}`);
        return response.data;
    } catch (error) {
        console.error('❌ [File API] Get public file info failed:', error);
        throw error;
    }
};

// ✅ Download public file - GET /public/download/{token}
export const downloadPublicFile = async (token: string) => {
    try {
        const response = await fileApi.get(`/public/download/${token}`, {
            responseType: 'blob',
        });
        return response.data;
    } catch (error) {
        console.error('❌ [File API] Download public file failed:', error);
        throw error;
    }
};

export const viewPublicFile = async (token: string): Promise<Blob> => {
    try {
        const response = await fileApi.get(`/public/view/${token}`, {
            responseType: 'blob',
        });
        return response.data;
    } catch (error) {
        console.error('❌ [File API] View public file failed:', error);
        throw error;
    }
};

// ✅ Get public file as data URL (for inline viewing)
export const viewPublicFileAsDataUrl = async (token: string): Promise<string> => {
    try {
        const blob = await viewPublicFile(token);
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('❌ [File API] View public file as data URL failed:', error);
        throw error;
    }
};
// ✅ Public download (no authentication required)
export const publicDownload = async (token: string): Promise<Blob> => {
    try {
        const response = await fileApi.get(`/public/share/${token}`, {
            responseType: 'blob',
        });
        return response.data;
    } catch (error) {
        console.error('❌ [File API] Public download failed:', error);
        throw error;
    }
};
// ✅ Share file or folder - POST /file/v1/share
export const shareFile = (data: {
    documentId?: string;
    folderId?: string;
    sharedWithId: string;
    sharedWithType?: string;
    permission?: string;
    canDownload?: boolean;
    canDelete?: boolean;
    expiresAt?: string;
}) => {

    return fileApi.post('/share', data);
};

// ✅ Update share - PUT /file/v1/share/{id}
export const updateShare = (id: string, data: {
    permission?: string;
    canDownload?: boolean;
    canDelete?: boolean;
    expiresAt?: string;
}) => {

    return fileApi.put(`/share/${id}`, data);
};

// ✅ Remove share - DELETE /file/v1/share/{id}
export const removeShare = (id: string) => {

    return fileApi.delete(`/share/${id}`);
};

// ✅ Get shares for a file - GET /file/v1/share/file/{documentId}
export const getFileShares = (documentId: string) => {

    return fileApi.get(`/share/file/${documentId}`);
};

// ✅ Get shares for a user - GET /file/v1/share/user/{userId}
export const getUserShares = (userId: string) => {

    return fileApi.get(`/share/user/${userId}`);
};

// ==================== INVOICE SPECIFIC HELPERS ====================
// ✅ Get folder contents - ADD THIS
export const getFolderContents = (id: string) => {
    return fileApi.get(`/folders/${id}/contents`);
};
// ✅ Upload invoice attachment
export const uploadInvoiceAttachment = async (invoiceId: string, file: File, description?: string) => {


    return uploadFile({
        file,
        module: 'invoice',
        referenceId: invoiceId,
        category: 'invoice_attachment',
        documentType: file.type.includes('pdf') ? 'PDF' : 'Image',
        description: description || `Attachment for invoice ${invoiceId}`,
        isPublic: false,
        isShared: false,
        sharingLevel: 'Private',
    });
};

// ✅ Get invoice attachments
export const getInvoiceAttachments = (invoiceId: string) => {

    return getFilesByReference('invoice', invoiceId, 'invoice_attachment');
};

// ✅ Delete invoice attachment
export const deleteInvoiceAttachment = (attachmentId: string) => {

    return deleteFile(attachmentId, false);
};

// ✅ Download invoice attachment
export const downloadInvoiceAttachment = async (attachmentId: string, fileName?: string) => {

    const blob = await downloadFile(attachmentId);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'attachment';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return blob;
};