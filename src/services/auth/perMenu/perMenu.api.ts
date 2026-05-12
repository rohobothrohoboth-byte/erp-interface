import { api } from '../../api';
import type { ModPerMenuListDto, NameList, UUID } from '../../../types/auth/ModPerMenu';

class PerMenuApi {
  private baseUrl = `${import.meta.env.VITE_AUTH_MODULE_URL || 'auth/v1'}/Permission`;

  private extractErrorMessage(error: any): string {
    if (error.response?.data?.message) return error.response.data.message;
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      return (Object.values(errors).flat() as string[]).join(', ');
    }
    return error.message || 'An unexpected error occurred';
  }

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
}

export const perMenuApi = new PerMenuApi();

export const perMenuFetcher = {
  getPerMenusByUser: (userId: UUID) => perMenuApi.getPerMenusByUser(userId),
  getFilteredPermissionsForUser: (userId: UUID, moduleIds: UUID[]) =>
    perMenuApi.getFilteredPermissionsForUser(userId, moduleIds),
  getFlattenedPermissionsForUser: (userId: UUID, moduleIds: UUID[]) =>
    perMenuApi.getFlattenedPermissionsForUser(userId, moduleIds),
  getAvailableModulesForUser: (userId: UUID) => perMenuApi.getAvailableModulesForUser(userId),
};
