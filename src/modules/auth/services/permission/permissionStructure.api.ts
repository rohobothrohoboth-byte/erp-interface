// services/auth/permission/permissionStructure.api.ts

import { api } from '@/shared/services/api';
import type { ModuleStructure, MenuStructure, ApiAction } from '@/modules/auth/types/permissionStructure';

class PermissionStructureApi {
    private permissionUrl = `${import.meta.env.VITE_AUTH_MODULE_URL || 'auth/v1'}/Permission`;
    private perMenuUrl = `${import.meta.env.VITE_AUTH_MODULE_URL || 'auth/v1'}/PerMenu`;
    private perApiUrl = `${import.meta.env.VITE_AUTH_MODULE_URL || 'auth/v1'}/PerApi`;

    // Helper to extract data from nested ApiResponse wrapper
    private extractData(response: any): any {
        const axiosData = response.data;
        const apiData = axiosData?.data;

        if (apiData?.modules) {
            return apiData.modules;
        }
        if (Array.isArray(apiData)) return apiData;
        if (Array.isArray(axiosData)) return axiosData;
        return apiData || axiosData || [];
    }

    // Get complete permission structure
    async getPermissionStructure(): Promise<ModuleStructure[]> {
        try {
            console.log('📡 Fetching GetPermissionStructure:', `${this.permissionUrl}/GetPermissionStructure`);
            const response = await api.get(`${this.permissionUrl}/GetPermissionStructure`);
            return this.extractData(response);
        } catch (error: any) {
            console.error('❌ GetPermissionStructure FAILED:', error.message);
            throw error;
        }
    }

    // FIXED: Get menu tree - use correct endpoint /Permission/GetMenuTree
    async getMenuTree(): Promise<MenuStructure[]> {
        try {
            // The working endpoint from Postman is /Permission/GetMenuTree
            const response = await api.get(`${this.permissionUrl}/GetMenuTree`);
            const data = this.extractData(response);

            // The API returns an array of menu items, not nested structure
            // Convert flat list to nested structure
            return this.buildMenuTree(data);
        } catch (error: any) {
            console.error('❌ GetMenuTree FAILED:', error.message);
            return [];
        }
    }

    // Helper to build tree structure from flat list
    // In permissionStructure.api.ts, update the buildMenuTree method:

    private buildMenuTree(flatItems: any[]): MenuStructure[] {
        if (!Array.isArray(flatItems) || flatItems.length === 0) {
            return [];
        }

        const map = new Map<string, any>();
        const roots: any[] = [];

        // First pass: create map - preserve module name at root level
        flatItems.forEach(item => {
            map.set(item.id, {
                id: item.id,
                name: item.label || item.name,
                label: item.label,
                key: item.key,
                path: item.path,
                icon: item.icon,
                order: item.order,
                module: item.module,           // ← IMPORTANT: Preserve module name
                perModuleId: item.perModuleId,
                parentId: item.parentId,
                children: [],
                actions: item.actions || []
            });
        });

        // Second pass: build hierarchy
        flatItems.forEach(item => {
            const node = map.get(item.id);
            if (node && item.parentId && map.has(item.parentId)) {
                const parent = map.get(item.parentId);
                if (parent) {
                    parent.children = parent.children || [];
                    parent.children.push(node);
                }
            } else if (node) {
                roots.push(node);
            }
        });

        // Sort by order
        const sortByOrder = (nodes: any[]) => {
            nodes.sort((a, b) => (a.order || 0) - (b.order || 0));
            nodes.forEach(node => {
                if (node.children && node.children.length > 0) {
                    sortByOrder(node.children);
                }
            });
        };

        sortByOrder(roots);
        return roots;
    }

    // Get ALL menus (using the correct endpoint)
    async getAllMenus(): Promise<any[]> {
        try {
            const response = await api.get(`${this.permissionUrl}/AllMenu`);
            return this.extractData(response);
        } catch (error) {
            console.error('Error fetching all menus:', error);
            return [];
        }
    }

    // Get ALL API permissions
    async getAllApiPermissions(): Promise<any[]> {
        const response = await api.get(`${this.perApiUrl}/AllPerApi`);
        return this.extractData(response);
    }

    // Get menu permissions by module ID
    async getPerMenuByModule(moduleId: string): Promise<any> {
        const response = await api.get(`${this.permissionUrl}/GetPerMenuByMod/${moduleId}`);
        return this.extractData(response);
    }

    // Get API permissions by menu ID
    async getPerApiByMenu(menuId: string): Promise<any> {
        const response = await api.get(`${this.permissionUrl}/GetPerApiByMenu/${menuId}`);
        console.log('=== getPerApiByMenu ===');
        console.log('Menu ID:', menuId);
        console.log('Response:', response.data);
        return this.extractData(response);
    }

    // Get filtered permissions for user
    async getFilteredPermissionsForUser(
        userId: string,
        moduleIds: string[]
    ): Promise<ModuleStructure[]> {
        const response = await api.post(`${this.permissionUrl}/GetFilteredPermissionsForUser`, {
            userId,
            moduleIds
        });
        return this.extractData(response);
    }

    // Get filtered API permissions for user
    async getFilteredApiPermissionsForUser(
        userId: string,
        menuIds: string[]
    ): Promise<MenuStructure[]> {
        const response = await api.post(`${this.permissionUrl}/GetFilteredPerApisForUser`, {
            userId,
            menuIds
        });
        return this.extractData(response);
    }

    // Get user's current permissions
    async getUserPermissions(userId: string): Promise<{
        userId: string;
        modules: string[];
        menus: string[];
        apiActions: string[];
    }> {
        const [menuModules, apiPermissions] = await Promise.all([
            api.get(`${this.permissionUrl}/GetPerMenuByUser/${userId}`),
            api.get(`${this.permissionUrl}/GetPerApiByUser/${userId}`)
        ]);

        const menuData = this.extractData(menuModules);
        const apiData = this.extractData(apiPermissions);

        return {
            userId,
            modules: Array.isArray(menuData) ? menuData.map((m: any) => m.perModuleId) : [],
            menus: Array.isArray(menuData) ? menuData.flatMap((m: any) => m.perMenuList?.map((p: any) => p.id) || []) : [],
            apiActions: Array.isArray(apiData) ? apiData.flatMap((m: any) => m.perApiList?.map((p: any) => p.id) || []) : []
        };
    }

    // Save user permissions
    async saveUserPermissions(
        userId: string,
        moduleIds: string[],
        menuIds: string[],
        apiActionIds: string[]
    ): Promise<void> {
        await api.post(`${this.permissionUrl}/SaveUserPermissions`, {
            userId,
            moduleIds,
            menuIds,
            apiActionIds
        });
    }
}

export const permissionStructureApi = new PermissionStructureApi();