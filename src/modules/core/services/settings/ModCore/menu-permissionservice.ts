import { api } from '@/shared/services/api';
import type {
  ModPerMenuListDto,
  PerMenuListDto,
  PerMenuAddDto,
  PerMenuModDto
} from '@/modules/core/types/Settings/menu-permissions';
import type { NameListItem } from '@/modules/list/types/NameList/nameList';

class MenuPermissionService {
  // CHANGED: Use merged Permission endpoint
  private baseUrl = `/auth/v1/Permission`;
  // CHANGED: Names endpoints also moved to Permission
  private namesBaseUrl = `/auth/v1/Permission`;

  private extractErrorMessage(error: any): string {
    if (error.response?.data?.message) {
      const message = error.response.data.message;
      if (message.includes('23505') || message.toLowerCase().includes('duplicate') || message.toLowerCase().includes('unique constraint')) {
        if (message.toLowerCase().includes('key') || message.toLowerCase().includes('permenu_key')) {
          return 'A menu permission with this key already exists. Please use a different key.';
        }
        return 'This value already exists. Please use a different value.';
      }
      if (message.includes('23503')) {
        return 'Invalid reference. Please check your module selection.';
      }
      if (message.includes('23502')) {
        return 'Required field is missing. Please fill all required fields.';
      }
      return message;
    }
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      const errorMessages = Object.values(errors).flat();
      return errorMessages.join(', ');
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }

  // CHANGED: /Names/AllModuleName → /Permission/AllModuleName
  async getAllModuleNames(): Promise<NameListItem[]> {
    try {

      const response = await api.get(`${this.namesBaseUrl}/AllModuleName`);

      const modules = response.data?.data || response.data;
      return Array.isArray(modules) ? modules : [];
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error fetching module names:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // CHANGED: /Names/GetModuleName/{id} → /Permission/GetModuleName/{id}
  async getModuleNameById(id: string): Promise<NameListItem> {
    try {
      const response = await api.get(`${this.namesBaseUrl}/GetModuleName/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error fetching module name:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // CHANGED: /PerMenu/AllPerMenu → /Permission/AllPerMenu
  async getAllMenuPermissions(): Promise<PerMenuListDto[]> {
    try {
      const response = await api.get(`${this.baseUrl}/AllPerMenu`);


      // Optional: Log the specific permission you're looking for
      if (response.data.data && Array.isArray(response.data.data)) {
        const myLeave = response.data.data.find(p => p.key === 'my.leave');

      }

      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error fetching menu permissions:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // CHANGED: /PerMenu/GetPerMenu/{id} → /Permission/GetPerMenu/{id}
  async getMenuPermissionById(id: string): Promise<PerMenuListDto> {
    try {
      const response = await api.get(`${this.baseUrl}/GetPerMenu/${id}`);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error fetching menu permission:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // CHANGED: /PerMenu/AddPerMenu → /Permission/AddPerMenu
  async createMenuPermission(data: PerMenuAddDto): Promise<PerMenuListDto> {
    try {

      const response = await api.post('/auth/v1/Permission/AddPerMenu', data);
      return response.data.data;
    } catch (error: any) {
      console.error("Error creating menu permission:", error);
      throw error;
    }
  }

  // In menu-permissionservice.ts

  async updateMenuPermission(id: string, data: PerMenuModDto): Promise<any> {
    try {
      // Use the ID from the data object (permission ID)
      const correctId = data.id;

      const payload = {
        Id: data.id,                    // ← Use data.id (permission ID)
        PerModuleId: data.perModuleId,  // ← Use data.perModuleId (module ID)
        Key: data.key,
        Label: data.label,
        Path: data.path,
        Icon: data.icon,
        IsChild: data.isChild,
        Order: data.order,
        ParentKey: data.parentKey
      };



      const response = await api.put(`/auth/v1/Permission/ModPerMenu/${correctId}`, payload);
      return response.data;
    } catch (error: any) {
      console.error("MenuPermissionService - Error:", error);
      throw error;
    }
  }
  // CHANGED: /PerMenu/DelPerMenu/{id} → /Permission/DelPerMenu/{id}
  async deleteMenuPermission(id: string): Promise<void> {
    try {
      try {
        const menu = await this.getMenuPermissionById(id);

      } catch (getError) {
        console.error('Menu permission not found with ID:', id);
        throw new Error(`Menu permission with ID ${id} not found. Please refresh the page and try again.`);
      }
      const response = await api.delete(`${this.baseUrl}/DelPerMenu/${id}`);

    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error deleting menu permission:', errorMessage);
      throw new Error(errorMessage);
    }
  }
  // In menu-permissionservice.ts
  async deleteMenuPermissionByKey(key: string): Promise<any> {
    try {

      const response = await api.delete(`/auth/v1/Permission/DelPerMenuByKey/${key}`);
      return response.data;
    } catch (error: any) {
      console.error("Error deleting menu permission:", error);
      throw error;
    }
  }
  async getAllModules(): Promise<ModPerMenuListDto[]> {
    try {
      const response = await api.get(`${this.baseUrl}/AllPerModule`);

      return response.data.data || [];
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error fetching all modules:', errorMessage);
      return [];
    }
  }
  // CHANGED: Use proper endpoint for module-based filtering
  // GET: /api/auth/v1/Permission/GetPerMenuByMod/{moduleId}
  async getMenuPermissionsByModule(moduleId: string): Promise<ModPerMenuListDto> {
    // Guard clause to prevent undefined being passed
    if (!moduleId || moduleId === 'undefined') {
      console.warn('getMenuPermissionsByModule: Invalid moduleId', moduleId);
      return { perModuleId: '', perModule: '', perMenuList: [] };
    }

    try {
      const response = await api.get(`${this.baseUrl}/GetPerMenuByMod/${moduleId}`);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error fetching menu permissions by module:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // NEW: Get menu tree
  async getMenuTree(): Promise<any[]> {
    try {
      const response = await api.get(`${this.baseUrl}/GetMenuTree`);
      return response.data.data || [];
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error fetching menu tree:', errorMessage);
      throw new Error(errorMessage);
    }
  }
}

export const menuPermissionService = new MenuPermissionService();