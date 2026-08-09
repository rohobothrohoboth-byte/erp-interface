// services/auth/menuService.ts
import api from '../api';

export interface MenuItem {
    id: string;
    key: string;
    modKey: string;
    label: string;
    path: string;
    icon: string;
    parKey: string;
    isChild: boolean;
    order: number;
    moduleId?: string;
    moduleName?: string;
    name?: string;
    title?: string;
    permissions?: Array<{ id: string; key: string; name: string }>;
    perModuleId?: string;
    module?: string;
    parentId?: string;
    children?: MenuItem[];
}

export const menuService = {
    // ✅ FIXED: Use the existing getAllMenus function from account.api
    getMenus: async (): Promise<MenuItem[]> => {
        try {
            // Import dynamically to avoid circular dependency
            const { getAllMenus } = await import('./account/account.api');
            const response = await getAllMenus();

            // Handle different response formats
            if (Array.isArray(response)) {
                return response;
            }
            if (response && response.data) {
                return response.data;
            }
            if (response && response.items) {
                return response.items;
            }
            return [];
        } catch (error) {
            console.error('Failed to fetch menus:', error);
            throw error;
        }
    },

    // Alternative: Use direct API call if getAllMenus is not available
    getMenusDirect: async (): Promise<MenuItem[]> => {
        try {
            // Try different possible endpoints
            const endpoints = [
                '/auth/v1/menu/all',
                '/auth/v1/menus',
                '/auth/v1/permission/menus',
                '/core/module/v1/menus'
            ];

            for (const endpoint of endpoints) {
                try {
                    const response = await api.get(endpoint);
                    if (response.data) {
                        const data = response.data.data || response.data;
                        if (Array.isArray(data) && data.length > 0) {
                            console.log(`✅ Found menus at endpoint: ${endpoint}`);
                            return data;
                        }
                    }
                } catch (e) {
                    // Continue to next endpoint
                    console.log(`⚠️ Endpoint ${endpoint} failed, trying next...`);
                }
            }

            // If all endpoints fail, return empty array
            console.warn('No menu endpoints found');
            return [];
        } catch (error) {
            console.error('Failed to fetch menus:', error);
            throw error;
        }
    },

    // Get menus by module
    getMenusByModule: async (moduleId: string): Promise<MenuItem[]> => {
        try {
            const { getAllMenus } = await import('./account/account.api');
            const allMenus = await getAllMenus();

            if (!allMenus || !Array.isArray(allMenus)) {
                return [];
            }

            return allMenus.filter((menu: MenuItem) =>
                menu.perModuleId === moduleId ||
                menu.moduleId === moduleId ||
                menu.modKey === moduleId
            );
        } catch (error) {
            console.error(`Failed to fetch menus for module ${moduleId}:`, error);
            throw error;
        }
    },

    // Get permissions for a menu
    getMenuPermissions: async (menuId: string): Promise<any[]> => {
        try {
            // Try different endpoints
            const endpoints = [
                `/auth/v1/menu/${menuId}/permissions`,
                `/auth/v1/permission/menu/${menuId}`,
                `/auth/v1/menus/${menuId}/permissions`
            ];

            for (const endpoint of endpoints) {
                try {
                    const response = await api.get(endpoint);
                    if (response.data) {
                        const data = response.data.data || response.data;
                        if (Array.isArray(data)) {
                            console.log(`✅ Found permissions at endpoint: ${endpoint}`);
                            return data;
                        }
                    }
                } catch (e) {
                    // Continue to next endpoint
                }
            }

            // Return empty array if no permissions found
            return [];
        } catch (error) {
            console.error(`Failed to fetch permissions for menu ${menuId}:`, error);
            return [];
        }
    }
};