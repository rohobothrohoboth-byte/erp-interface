import { fileApi } from '@/modules/file/services/fileManagement/fileManagementApi';
import type { DocumentItem, FolderItem } from '@/modules/file/services/documentService';

export interface FolderResponse {
    success: boolean;
    data: FolderItem[];
    message?: string;
    errors?: any;
    statusCode: number;
    timestamp?: string;
}

// Export FolderItem from here for convenience
export type { FolderItem };

// ==================== FOLDER OPERATIONS ====================

// Get all folders
export const getAllFolders = async (params?: {
    search?: string;
    type?: string;
    includeArchived?: boolean;
}): Promise<FolderResponse> => {
    const response = await fileApi.get('/folders', { params });
    return response.data;
};

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

// Share folder
export const shareFolder = async (folderId: string, data: {
    sharedWithId: string;
    permission: 'Read' | 'Write' | 'FullControl';
    canDownload?: boolean;
    expiresAt?: string;
}): Promise<any> => {
    const response = await fileApi.post(`/folders/${folderId}/share`, data);
    return response.data;
};