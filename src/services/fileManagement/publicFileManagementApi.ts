// src/services/fileManagement/publicFileManagementApi.ts

import axios from 'axios';

// ✅ Configuration - Use the gateway
const API_BASE = import.meta.env.VITE_GATEWAY_URL || 'http://192.168.1.7:5000';
const FILE_PATH = import.meta.env.VITE_FILE_MANAGEMENT_URL || '/file/v1';

// ✅ Public API instance (no auth)
export const publicFileApi = axios.create({
    baseURL: `${API_BASE}${FILE_PATH}`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ✅ Public API response interceptor
publicFileApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            console.error(`❌ [Public File API] Error ${error.response.status}:`, {
                url: error.config?.url,
                method: error.config?.method,
                status: error.response.status,
                data: error.response.data,
            });
        } else if (error.request) {
            console.error('❌ [Public File API] No response received:', {
                url: error.config?.url,
                method: error.config?.method,
                error: error.message,
            });
        } else {
            console.error('❌ [Public File API] Request error:', error.message);
        }
        return Promise.reject(error);
    }
);

// ================================================================
// PUBLIC API FUNCTIONS (NO AUTH REQUIRED)
// ================================================================

/**
 * Get public file information
 * @param token - Share token
 * @returns File information
 */
export const getPublicFileInfo = async (token: string) => {
    try {
        const response = await publicFileApi.get(`/public/info/${token}`);
        return response.data;
    } catch (error: any) {
        console.error('❌ [Public API] Get file info failed:', error);
        throw {
            message: error?.response?.data?.message || 'Failed to load file information',
            status: error?.response?.status,
            data: error?.response?.data
        };
    }
};

/**
 * Download public file
 * @param token - Share token
 * @returns File blob
 */
export const downloadPublicFile = async (token: string): Promise<Blob> => {
    try {
        const response = await publicFileApi.get(`/public/download/${token}`, {
            responseType: 'blob',
        });
        return response.data;
    } catch (error: any) {
        console.error('❌ [Public API] Download file failed:', error);
        throw {
            message: error?.response?.data?.message || 'Failed to download file',
            status: error?.response?.status,
        };
    }
};

/**
 * View public file (inline preview)
 * @param token - Share token
 * @returns File blob
 */
export const viewPublicFile = async (token: string): Promise<Blob> => {
    try {
        const response = await publicFileApi.get(`/public/view/${token}`, {
            responseType: 'blob',
        });
        return response.data;
    } catch (error: any) {
        console.error('❌ [Public API] View file failed:', error);
        throw {
            message: error?.response?.data?.message || 'Failed to view file',
            status: error?.response?.status,
        };
    }
};

/**
 * Get public share info (alias for getPublicFileInfo)
 */
export const getPublicShareInfo = async (token: string) => {
    return getPublicFileInfo(token);
};

/**
 * Download public share (alias for downloadPublicFile)
 */
export const downloadPublicShare = async (token: string): Promise<Blob> => {
    return downloadPublicFile(token);
};

/**
 * View public share (alias for viewPublicFile)
 */
export const viewPublicShare = async (token: string): Promise<Blob> => {
    return viewPublicFile(token);
};