// src/services/fileManagement/folder.api.ts

import axios from 'axios';

// ============================================================
// CONFIGURATION
// ============================================================



// ✅ Configuration - Use the gateway
const API_BASE = import.meta.env.VITE_GATEWAY_URL || 'http://192.168.1.7:5000';
const FILE_PATH = import.meta.env.VITE_FILE_MANAGEMENT_URL || '/file/v1';

export const folderApi = axios.create({
    baseURL: `${API_BASE}${FILE_PATH}`,
    headers: {
        'Content-Type': 'application/json',
    },
});




// ============================================================
// INTERCEPTORS
// ============================================================

// ✅ Request interceptor - Add auth token
folderApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn('⚠️ No auth token found for folder API request');
        }



        return config;
    },
    (error) => {
        console.error('❌ [Folder API] Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// ✅ Response interceptor - Error handling
folderApi.interceptors.response.use(
    (response) => {
        if (import.meta.env.DEV) {

        }
        return response;
    },
    (error) => {
        if (error.response) {
            console.error(`❌ [Folder API] Error ${error.response.status}:`, {
                url: error.config?.url,
                method: error.config?.method,
                status: error.response.status,
                data: error.response.data,
            });

            switch (error.response.status) {
                case 400:
                    console.error('⚠️ Bad Request - Check your request data');
                    break;
                case 401:
                    console.error('⚠️ Unauthorized - Please login again');
                    break;
                case 403:
                    console.error('⚠️ Forbidden - You don\'t have permission');
                    break;
                case 404:
                    console.error('⚠️ Not Found - Endpoint does not exist:', error.config?.url);
                    break;
                case 409:
                    console.error('⚠️ Conflict - Folder with this name already exists');
                    break;
                case 502:
                    console.error('⚠️ Bad Gateway - File Management service may not be running');
                    break;
                default:
                    console.error(`⚠️ ${error.response.status} - ${error.response.statusText}`);
            }
        } else if (error.request) {
            console.error('❌ [Folder API] No response received:', {
                url: error.config?.url,
                method: error.config?.method,
                error: error.message,
            });
        } else {
            console.error('❌ [Folder API] Request error:', error.message);
        }

        return Promise.reject(error);
    }
);

// ============================================================
// TYPES
// ============================================================

export interface Folder {
    id: string;
    name: string;
    description?: string | null;
    folderType?: string;
    category?: string;
    parentId?: string | null;
    parentName?: string | null;
    isPublic?: boolean;
    isShared?: boolean;
    sharingLevel?: string;
    isArchived?: boolean;
    order?: number;
    documentCount?: number;
    subFolderCount?: number;
    createdBy?: string | null;
    createdAt?: string;
    updatedAt?: string;
    canEdit?: boolean;
    canDelete?: boolean;
    canShare?: boolean;
    icon?: string;
    color?: string;
    subFolders?: Folder[] | null;
    documents?: any[] | null;
}

export interface CreateFolderDto {
    name: string;
    description?: string;
    folderType?: string;
    category?: string;
    parentId?: string | null;
    isPublic?: boolean;
    isShared?: boolean;
    sharingLevel?: string;
    order?: number;
}

export interface UpdateFolderDto {
    name?: string;
    description?: string;
    folderType?: string;
    category?: string;
    isPublic?: boolean;
    isShared?: boolean;
    sharingLevel?: string;
    order?: number;
}

// ============================================================
// QUERY KEYS (for React Query)
// ============================================================

export const folderKeys = {
    all: ['folders'] as const,
    lists: () => [...folderKeys.all, 'list'] as const,
    list: (params?: any) => [...folderKeys.lists(), params] as const,
    details: () => [...folderKeys.all, 'detail'] as const,
    detail: (id: string) => [...folderKeys.details(), id] as const,
    root: () => [...folderKeys.all, 'root'] as const,
    tree: () => [...folderKeys.all, 'tree'] as const,
    shared: () => [...folderKeys.all, 'shared'] as const,
    contents: (id: string) => [...folderKeys.detail(id), 'contents'] as const,
    favorites: () => [...folderKeys.all, 'favorites'] as const,
};

// ============================================================
// FOLDER API FUNCTIONS - MATCHING BACKEND CONTROLLER
// ============================================================

/**
 * Get root folders (top-level folders)
 * GET /file/v1/folders/root
 */
export const getRootFolders = () => {
    try {
        return folderApi.get('/folders/root');
    } catch (error) {
        console.error('❌ [Folder API] Get root folders failed:', error);
        throw error;
    }
};

/**
 * Get all folders with optional filtering
 * GET /file/v1/folders
 */
export const getFolders = (params?: {
    folderType?: string;
    parentId?: string;
    includeSubFolders?: boolean;
    includeDocuments?: boolean;
    search?: string;
    page?: number;
    pageSize?: number;
}) => {
    try {
        return folderApi.get('/folders', { params });
    } catch (error) {
        console.error('❌ [Folder API] Get folders failed:', error);
        throw error;
    }
};

/**
 * Get folder by ID
 * GET /file/v1/folders/{id}
 */
export const getFolderById = (
    id: string,
    includeSubFolders: boolean = true,
    includeDocuments: boolean = true
) => {
    try {
        return folderApi.get(`/folders/${id}`, {
            params: { includeSubFolders, includeDocuments },
        });
    } catch (error) {
        console.error(`❌ [Folder API] Get folder by ID ${id} failed:`, error);
        throw error;
    }
};

/**
 * Get folder by ID (alias)
 */
export const getFolder = getFolderById;

/**
 * Get folder tree (hierarchical structure)
 * GET /file/v1/folders/tree
 */
export const getFolderTree = (folderType?: string) => {
    try {
        return folderApi.get('/folders/tree', { params: { folderType } });
    } catch (error) {
        console.error('❌ [Folder API] Get folder tree failed:', error);
        throw error;
    }
};

/**
 * Get folder contents (folders and documents inside a folder)
 * GET /file/v1/folders/{id}/contents
 *
 * Note: This endpoint may not exist in your backend yet.
 * If it returns 404, you may need to implement it or use a different approach.
 */
export const getFolderContents = (id: string) => {
    try {
        return folderApi.get(`/folders/${id}/contents`);
    } catch (error) {
        console.error(`❌ [Folder API] Get folder contents ${id} failed:`, error);
        throw error;
    }
};

/**
 * Get documents in a folder
 * GET /file/v1/folders/{id}/documents
 */
export const getFolderDocuments = (id: string, params?: {
    search?: string;
    category?: string;
    page?: number;
    pageSize?: number;
}) => {
    try {
        return folderApi.get(`/folders/${id}/documents`, { params });
    } catch (error) {
        console.error(`❌ [Folder API] Get folder documents ${id} failed:`, error);
        throw error;
    }
};

/**
 * Get sub-folders in a folder
 * GET /file/v1/folders/{id}/subfolders
 */
export const getSubFolders = (id: string, params?: {
    search?: string;
    page?: number;
    pageSize?: number;
}) => {
    try {
        return folderApi.get(`/folders/${id}/subfolders`, { params });
    } catch (error) {
        console.error(`❌ [Folder API] Get sub-folders ${id} failed:`, error);
        throw error;
    }
};

/**
 * Create a new folder
 * POST /file/v1/folders
 */
export const createFolder = async (data: CreateFolderDto) => {
    try {
        const payload = {
            name: data.name,
            description: data.description || '',
            folderType: data.folderType || 'general',
            category: data.category || 'general',
            parentId: data.parentId || null,
            isPublic: data.isPublic ?? false,
            isShared: data.isShared ?? false,
            sharingLevel: data.sharingLevel || 'Private',
            order: data.order || 0,
        };

        const response = await folderApi.post('/folders', payload);
        return response.data;
    } catch (error) {
        console.error('❌ [Folder API] Create folder failed:', error);
        throw error;
    }
};

/**
 * Update folder
 * PUT /file/v1/folders/{id}
 */
export const updateFolder = (id: string, data: UpdateFolderDto) => {
    try {
        return folderApi.put(`/folders/${id}`, data);
    } catch (error) {
        console.error(`❌ [Folder API] Update folder ${id} failed:`, error);
        throw error;
    }
};

/**
 * Delete folder (soft delete)
 * DELETE /file/v1/folders/{id}
 */
export const deleteFolder = (id: string) => {
    try {
        return folderApi.delete(`/folders/${id}`);
    } catch (error) {
        console.error(`❌ [Folder API] Delete folder ${id} failed:`, error);
        throw error;
    }
};

/**
 * Move folder to a different parent
 * POST /file/v1/folders/{id}/move
 */
export const moveFolder = (id: string, targetParentId: string | null) => {
    try {
        return folderApi.post(`/folders/${id}/move`, { targetParentId });
    } catch (error) {
        console.error(`❌ [Folder API] Move folder ${id} failed:`, error);
        throw error;
    }
};

// ============================================================
// SHARED FOLDER OPERATIONS
// ============================================================

/**
 * Get shared folders
 * GET /file/v1/folders/shared
 */
export const getSharedFolders = () => {
    try {
        return folderApi.get('/folders/shared');
    } catch (error) {
        console.error('❌ [Folder API] Get shared folders failed:', error);
        throw error;
    }
};

/**
 * Share a folder
 * POST /file/v1/folders/{id}/share
 */
export const shareFolder = (id: string, data: {
    sharedWithId: string;
    sharedWithType?: string;
    permission?: string;
    canDownload?: boolean;
    canDelete?: boolean;
    expiresAt?: string;
}) => {
    try {
        return folderApi.post(`/folders/${id}/share`, data);
    } catch (error) {
        console.error(`❌ [Folder API] Share folder ${id} failed:`, error);
        throw error;
    }
};

/**
 * Get folder shares
 * GET /file/v1/folders/{id}/shares
 */
export const getFolderShares = (id: string) => {
    try {
        return folderApi.get(`/folders/${id}/shares`);
    } catch (error) {
        console.error(`❌ [Folder API] Get folder shares ${id} failed:`, error);
        throw error;
    }
};

/**
 * Remove folder share
 * DELETE /file/v1/folders/{id}/share/{shareId}
 */
export const removeFolderShare = (id: string, shareId: string) => {
    try {
        return folderApi.delete(`/folders/${id}/share/${shareId}`);
    } catch (error) {
        console.error(`❌ [Folder API] Remove folder share ${id} failed:`, error);
        throw error;
    }
};

// ============================================================
// FAVORITE / STAR OPERATIONS
// ============================================================

/**
 * Toggle folder favorite
 * POST /file/v1/folders/{id}/favorite
 */
export const toggleFolderFavorite = (id: string) => {
    try {
        return folderApi.post(`/folders/${id}/favorite`);
    } catch (error) {
        console.error(`❌ [Folder API] Toggle folder favorite ${id} failed:`, error);
        throw error;
    }
};

/**
 * Get favorite folders
 * GET /file/v1/folders/favorites
 */
export const getFavoriteFolders = () => {
    try {
        return folderApi.get('/folders/favorites');
    } catch (error) {
        console.error('❌ [Folder API] Get favorite folders failed:', error);
        throw error;
    }
};

// ============================================================
// ARCHIVE OPERATIONS
// ============================================================

/**
 * Archive a folder
 * POST /file/v1/folders/{id}/archive
 */
export const archiveFolder = (id: string) => {
    try {
        return folderApi.post(`/folders/${id}/archive`);
    } catch (error) {
        console.error(`❌ [Folder API] Archive folder ${id} failed:`, error);
        throw error;
    }
};

/**
 * Restore a folder from archive
 * POST /file/v1/folders/{id}/restore
 */
export const restoreFolder = (id: string) => {
    try {
        return folderApi.post(`/folders/${id}/restore`);
    } catch (error) {
        console.error(`❌ [Folder API] Restore folder ${id} failed:`, error);
        throw error;
    }
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Format folder data for display
 */
export const formatFolderData = (data: any): Folder => {
    return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        folderType: data.folderType || data.type || 'general',
        category: data.category || data.folderType || data.type || 'general',
        parentId: data.parentId || null,
        parentName: data.parentName || null,
        isPublic: data.isPublic ?? false,
        isShared: data.isShared ?? false,
        sharingLevel: data.sharingLevel || 'Private',
        isArchived: data.isArchived ?? false,
        order: data.order || 0,
        documentCount: data.documentCount || data.fileCount || 0,
        subFolderCount: data.subFolderCount || 0,
        createdBy: data.createdBy || null,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt || data.createdAt,
        canEdit: data.canEdit ?? true,
        canDelete: data.canDelete ?? true,
        canShare: data.canShare ?? true,
        icon: data.icon || '📁',
        color: data.color || '#4F46E5',
        subFolders: data.subFolders || null,
        documents: data.documents || null,
    };
};

/**
 * Get folder type color
 */
export const getFolderTypeColor = (type?: string): string => {
    const colors: Record<string, string> = {
        company: '#4F46E5',
        department: '#7C3AED',
        team: '#0891B2',
        personal: '#10B981',
        shared: '#F59E0B',
        public: '#3B82F6',
        archive: '#6B7280',
        general: '#6366F1',
    };
    return colors[type || 'general'] || colors.general;
};

/**
 * Get folder type icon
 */
export const getFolderTypeIcon = (type?: string): string => {
    const icons: Record<string, string> = {
        company: '🏢',
        department: '📋',
        team: '👥',
        personal: '👤',
        shared: '🔗',
        public: '🌐',
        archive: '📦',
        general: '📁',
    };
    return icons[type || 'general'] || icons.general;
};

/**
 * Check if a folder is a root folder (no parent)
 */
export const isRootFolder = (folder: Folder): boolean => {
    return !folder.parentId || folder.parentId === null || folder.parentId === '';
};

/**
 * Check if a folder has children
 */
export const hasChildren = (folder: Folder): boolean => {
    return (folder.subFolderCount || 0) > 0 || (folder.documentCount || 0) > 0;
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {
    folderApi,
    folderKeys,
    createFolder,
    getFolder,
    getFolderById,
    getFolders,
    getRootFolders,
    getFolderTree,
    getFolderContents,
    getFolderDocuments,
    getSubFolders,
    getSharedFolders,
    shareFolder,
    getFolderShares,
    removeFolderShare,
    toggleFolderFavorite,
    getFavoriteFolders,
    archiveFolder,
    restoreFolder,
    updateFolder,
    deleteFolder,
    moveFolder,
    formatFolderData,
    getFolderTypeColor,
    getFolderTypeIcon,
    isRootFolder,
    hasChildren,
};