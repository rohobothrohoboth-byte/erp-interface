// services/auth/account/account.api.ts

import { api } from '../../api';

// API version constant
const API_VERSION = 'v1';

// Helper to build correct API URLs
const buildUrl = (path: string): string => {
    const cleanPath = path.replace(/^\//, '');
    return `/auth/${API_VERSION}/${cleanPath}`;
};

// src/services/auth/account/account.api.ts

export const saveUserPermissions = async (data: {
    userId: string;
    moduleIds?: string[] | null;
    menuIds?: string[] | null;
    apiActionIds?: string[] | null;
}) => {
    // ✅ Build payload with ONLY provided fields
    const payload: any = {
        userId: data.userId
    };

    // ✅ Only include fields that were explicitly passed
    if (data.moduleIds !== undefined) {
        payload.moduleIds = data.moduleIds;
    }
    if (data.menuIds !== undefined) {
        payload.menuIds = data.menuIds;
    }
    if (data.apiActionIds !== undefined) {
        payload.apiActionIds = data.apiActionIds;
    }

    console.log('📤 Sending to backend:', {
        userId: payload.userId,
        moduleIds: data.moduleIds === undefined ? 'NOT SENT' : data.moduleIds?.length || 'null',
        menuIds: data.menuIds === undefined ? 'NOT SENT' : data.menuIds?.length || 'null',
        apiActionIds: data.apiActionIds === undefined ? 'NOT SENT' : data.apiActionIds?.length || 'null'
    });

    const response = await api.post('/auth/v1/Permission/SaveUserPermissions', payload);
    return response.data;
};
// ==================== GET DATA ENDPOINTS ====================

export const getAllRoles = async () => {
    try {
        const url = buildUrl('Permission/AllRole');
        const response = await api.get(url);

        return response.data?.data || response.data || [];
    } catch (error) {
        console.error("Failed to fetch roles:", error);
        return [];
    }
};

export const getAllModules = async () => {
    try {
        const url = buildUrl('Permission/AllModule');
        const response = await api.get(url);

        return response.data?.data || response.data || [];
    } catch (error) {
        console.error("Failed to fetch modules:", error);
        return [];
    }
};

// FIXED: Changed from PerMenu/GetMenuTree to Permission/GetMenuTree
export const getAllMenus = async () => {
    try {
        const url = buildUrl('Permission/GetMenuTree');
        const response = await api.get(url);
        return response.data?.data || response.data || [];
    } catch (error) {
        console.error("Failed to fetch menus:", error);
        return [];
    }
};



export const getUserApiPermissions = async (userId: string) => {
    try {
        const url = buildUrl(`Permission/GetPerApiByUser/${userId}`);
        const response = await api.get(url);
        return response.data?.data || response.data || [];
    } catch (error) {
        console.error("Failed to fetch API permissions:", error);
        return [];
    }
};

export const getApiActionsByMenu = async (menuId: string) => {
    try {
        const url = buildUrl(`Permission/GetPerApiByMenu/${menuId}`);
        const response = await api.get(url);
        return response.data?.data || response.data;
    } catch (error) {
        console.error("Failed to fetch API actions:", error);
        return null;
    }
};

export const getAppUserByEmployeeId = async (employeeId: string) => {
    try {
        const url = buildUrl(`User/GetAppUserByEmployeeId/${employeeId}`);
        const response = await api.get(url);
        return response.data?.data || response.data;
    } catch (error) {
        console.error("Failed to fetch AppUser:", error);
        return null;
    }
};
export const getAllAppUsers = async (): Promise<AppUserDto[]> => {
    try {
        const response = await api.get('/auth/v1/User/AllAppUser');

        return response.data?.data || [];
    } catch (error) {
        console.error('Error fetching all app users:', error);
        return [];
    }
};
// Add these to account.api.ts

export const reactivateAccount = async (userId: string): Promise<any> => {
    try {
        const response = await api.post(`/auth/v1/User/ReactivateAccount/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error reactivating account:', error);
        throw error;
    }
};



/**
 * Reset password for a user (Admin action - no current password required)
 * @param userId - The AppUser ID (NOT the Employee ID)
 * @param newPassword - The new password
 */
export const resetPassword = async (userId: string, newPassword: string): Promise<void> => {
    try {
        // Validate inputs
        if (!userId || userId === '00000000-0000-0000-0000-000000000000') {
            console.error('Invalid userId for password reset:', userId);
            throw new Error('Invalid user ID. Please ensure you are using the AppUser ID, not Employee ID.');
        }

        if (!newPassword || newPassword.length < 8) {
            throw new Error('Password must be at least 8 characters long.');
        }

        // Log what we're sending (but hide the password)
        console.log('Resetting password for userId:', userId);
        console.log('Password length:', newPassword.length);

        // The API expects the payload in a specific format
        // Try both common formats that backends expect
        const payload = {
            userId: userId,
            newPassword: newPassword
        };

        console.log('Sending payload:', { ...payload, newPassword: '[HIDDEN]' });

        const response = await api.post('/auth/v1/User/ResetPassword', payload);

        if (response.status === 200 || response.status === 204) {
            console.log('Password reset successful');
            return response.data?.data;
        }

        return response.data;
    } catch (error: any) {
        console.error('Error resetting password:', error);

        // Extract meaningful error message
        let errorMessage = 'Failed to reset password.';

        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);

            if (error.response.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response.data?.title) {
                errorMessage = error.response.data.title;
            } else if (error.response.data?.errors) {
                const errors = error.response.data.errors;
                if (typeof errors === 'object') {
                    errorMessage = Object.values(errors).flat().join(', ');
                } else {
                    errorMessage = String(errors);
                }
            } else if (error.response.status === 400) {
                errorMessage = 'Bad request. Please check the user ID and password format.';
            }
        } else if (error.request) {
            // The request was made but no response was received
            errorMessage = 'No response from server. Please try again.';
        } else {
            // Something happened in setting up the request that triggered an Error
            errorMessage = error.message || 'Unknown error occurred.';
        }

        throw new Error(errorMessage);
    }
};


// Get user's menu permissions
export const getMenuPermissionsByUser = async (employeeId: string): Promise<any> => {
    try {
        const response = await api.get(`/auth/v1/Permission/GetPerMenuByUser/${employeeId}`);
        return response.data.data || response.data || [];
    } catch (error) {
        console.error('Error fetching menu permissions:', error);
        return [];
    }
};

// Get user's API permissions
export const getApiPermissionsByUser = async (employeeId: string): Promise<any> => {
    try {
        const response = await api.get(`/auth/v1/Permission/GetPerApiByUser/${employeeId}`);
        return response.data.data || response.data || [];
    } catch (error) {
        console.error('Error fetching API permissions:', error);
        return [];
    }
};










export const getAccountByEmployeeId = async (employeeId: string) => {
    try {
        const url = buildUrl(`Permission/GetPerMenuByUser/${employeeId}`);
        const response = await api.get(url);

        console.log('=== getAccountByEmployeeId Response ===');
        console.log('Full response:', response.data);

        const data = response.data?.data || response.data;

        // Extract the data properly
        // The API might return different property names
        const result = {
            // Module IDs - try different possible property names
            moduleIds: data?.moduleIds || data?.modules || [],
            // Menu IDs - try different possible property names
            menuIds: data?.menuIds || data?.permissions || data?.menus || [],
            // API permissions
            apiPermissions: data?.apiPermissions || data?.apiActions || [],
            // Role
            roleId: data?.roleId || data?.role,
        };

        console.log('Extracted result:', result);

        return result;
    } catch (error) {
        console.error("Failed to fetch account:", error);
        return null;
    }
};
// Add this helper function to check if userId is an AppUser ID
export const validateAppUserId = (userId: string): boolean => {
    if (!userId) return false;
    if (userId === '00000000-0000-0000-0000-000000000000') return false;
    // UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(userId);
};

// ... rest of the existing code ...
export const accountApi = {
    saveUserPermissions,
    getAccountByEmployeeId,
    getUserApiPermissions,
    getAllModules,
    getAllMenus,
    getApiActionsByMenu,
    getAllRoles,
    getAppUserByEmployeeId,
};