// src/services/auth/permission/perMenu.api.ts

import { api } from '@/shared/services/api';
import type { ModPerMenuListDto, NameList, UUID } from '@/modules/auth/types/ModPerMenu';

class PerMenuApi {
  private baseUrl = `${import.meta.env.VITE_AUTH_MODULE_URL || 'auth/v1'}/Permission`;
  private menuUrl = `${import.meta.env.VITE_AUTH_MODULE_URL || 'auth/v1'}/Menu`;

  private extractErrorMessage(error: any): string {
    if (error.response?.data?.message) return error.response.data.message;
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      return (Object.values(errors).flat() as string[]).join(', ');
    }
    return error.message || 'An unexpected error occurred';
  }

  // ==================== EXISTING METHODS ====================

  async getPerMenusByUser(userId: UUID): Promise<ModPerMenuListDto[]> {
    try {
      const response = await api.get(`${this.baseUrl}/GetPerMenuByUser/${userId}`);
      return response.data.data;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async getFilteredPermissionsForUser(
      userId: UUID,
      selectedModuleIds: UUID[]
  ): Promise<ModPerMenuListDto[]> {
    const userPermissions = await this.getPerMenusByUser(userId);
    return userPermissions.filter((moduleGroup) => selectedModuleIds.includes(moduleGroup.perModuleId));
  }

  async getFlattenedPermissionsForUser(
      userId: UUID,
      selectedModuleIds: UUID[]
  ): Promise<Array<NameList & { moduleId: UUID; moduleName: string }>> {
    const filteredPermissions = await this.getFilteredPermissionsForUser(userId, selectedModuleIds);
    const flattened: Array<NameList & { moduleId: UUID; moduleName: string }> = [];

    for (const moduleGroup of filteredPermissions) {
      for (const permission of moduleGroup.perMenuList) {
        flattened.push({
          ...permission,
          moduleId: moduleGroup.perModuleId,
          moduleName: moduleGroup.perModule,
        });
      }
    }
    return flattened;
  }

  async getAvailableModulesForUser(userId: UUID): Promise<Array<{ id: UUID; name: string }>> {
    const userPermissions = await this.getPerMenusByUser(userId);
    return userPermissions.map((moduleGroup) => ({
      id: moduleGroup.perModuleId,
      name: moduleGroup.perModule,
    }));
  }

  // ==================== NEW METHODS FOR OPTIMIZED JWT ====================

  /**
   * Fetch the user's menu structure from the optimized endpoint
   * This replaces the need to store permissions in JWT
   */
  async getMenuStructure(): Promise<any[]> {
    try {
      const response = await api.get(`${this.menuUrl}/structure`);
      // API returns: { success: true, data: [...] }
      const data = response.data?.data || response.data || [];
      console.log(`📋 Menu structure loaded: ${data.length} modules`);
      return data;
    } catch (error) {
      console.error("Failed to fetch menu structure:", error);
      return [];
    }
  }

  /**
   * Fetch the user's permission keys from the optimized endpoint
   */
  async getPermissionKeys(): Promise<string[]> {
    try {
      const response = await api.get(`${this.menuUrl}/permissions`);
      const data = response.data?.data || response.data || [];
      console.log(`🔑 Permission keys loaded: ${data.length}`);
      return data;
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
      return [];
    }
  }

  /**
   * Build menu structure from permission keys (fallback)
   * This is used if the menu structure API fails
   */
  async buildMenuFromKeys(permissionKeys: string[]): Promise<any[]> {
    try {
      // If we have permission keys, we can build a minimal menu structure
      // This is a fallback - normally you'd use getMenuStructure()
      if (!permissionKeys || permissionKeys.length === 0) {
        return [];
      }

      // Group permissions by module (extract module from key)
      const moduleMap = new Map<string, any>();

      for (const key of permissionKeys) {
        const parts = key.split('.');
        if (parts.length >= 2) {
          const moduleKey = parts[0];
          if (!moduleMap.has(moduleKey)) {
            moduleMap.set(moduleKey, {
              K: `mod.${moduleKey}`,
              L: moduleKey.charAt(0).toUpperCase() + moduleKey.slice(1),
              M: []
            });
          }
        }
      }

      return Array.from(moduleMap.values());
    } catch (error) {
      console.error("Failed to build menu from keys:", error);
      return [];
    }
  }

  /**
   * Check if user has a specific permission
   * Uses the permission hash from JWT
   */
  async hasPermission(permission: string): Promise<boolean> {
    try {
      const permissions = await this.getPermissionKeys();
      return permissions.includes(permission);
    } catch (error) {
      console.error("Failed to check permission:", error);
      return false;
    }
  }
}

export const perMenuApi = new PerMenuApi();

export const perMenuFetcher = {
  // Existing fetchers
  getPerMenusByUser: (userId: UUID) => perMenuApi.getPerMenusByUser(userId),
  getFilteredPermissionsForUser: (userId: UUID, moduleIds: UUID[]) =>
      perMenuApi.getFilteredPermissionsForUser(userId, moduleIds),
  getFlattenedPermissionsForUser: (userId: UUID, moduleIds: UUID[]) =>
      perMenuApi.getFlattenedPermissionsForUser(userId, moduleIds),
  getAvailableModulesForUser: (userId: UUID) => perMenuApi.getAvailableModulesForUser(userId),

  // NEW fetchers
  getMenuStructure: () => perMenuApi.getMenuStructure(),
  getPermissionKeys: () => perMenuApi.getPermissionKeys(),
  hasPermission: (permission: string) => perMenuApi.hasPermission(permission),
};