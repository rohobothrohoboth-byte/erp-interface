import { api } from '@/shared/services/api';
import type { MenuPerApiListDto, NameList, UUID } from '@/modules/auth/types/MenuPerApi';

class MenuPerApiApi {
  private baseUrl = `${import.meta.env.VITE_AUTH_MODULE_URL || 'auth/v1'}/Permission`;

  private extractErrorMessage(error: any): string {
    if (error.response?.data?.message) return error.response.data.message;
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      return (Object.values(errors).flat() as string[]).join(', ');
    }
    return error.message || 'An unexpected error occurred';
  }

  async getPerApisByUser(userId: UUID): Promise<MenuPerApiListDto[]> {
    try {
      const response = await api.get(`${this.baseUrl}/GetPerApiByUser/${userId}`);
      return response.data.data;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async getFilteredPerApisForUser(
    userId: UUID,
    selectedMenuIds: UUID[]
  ): Promise<MenuPerApiListDto[]> {
    const userApiPermissions = await this.getPerApisByUser(userId);
    return userApiPermissions.filter((menuGroup) => selectedMenuIds.includes(menuGroup.perMenuId));
  }

  async getFlattenedPerApisForUser(
    userId: UUID,
    selectedMenuIds: UUID[]
  ): Promise<Array<NameList & { menuId: UUID; menuName: string }>> {
    const filteredApiPermissions = await this.getFilteredPerApisForUser(userId, selectedMenuIds);
    const flattened: Array<NameList & { menuId: UUID; menuName: string }> = [];

    for (const menuGroup of filteredApiPermissions) {
      for (const apiPermission of menuGroup.perApiList) {
        flattened.push({
          ...apiPermission,
          menuId: menuGroup.perMenuId,
          menuName: menuGroup.perMenu,
        });
      }
    }
    return flattened;
  }

  async getAvailableMenusForUser(userId: UUID): Promise<Array<{ id: UUID; name: string }>> {
    const userApiPermissions = await this.getPerApisByUser(userId);
    return userApiPermissions.map((menuGroup) => ({
      id: menuGroup.perMenuId,
      name: menuGroup.perMenu,
    }));
  }
}

export const menuPerApiApi = new MenuPerApiApi();

export const menuPerApiFetcher = {
  getPerApisByUser: (userId: UUID) => menuPerApiApi.getPerApisByUser(userId),
  getFilteredPerApisForUser: (userId: UUID, menuIds: UUID[]) =>
    menuPerApiApi.getFilteredPerApisForUser(userId, menuIds),
  getFlattenedPerApisForUser: (userId: UUID, menuIds: UUID[]) =>
    menuPerApiApi.getFlattenedPerApisForUser(userId, menuIds),
  getAvailableMenusForUser: (userId: UUID) => menuPerApiApi.getAvailableMenusForUser(userId),
};
