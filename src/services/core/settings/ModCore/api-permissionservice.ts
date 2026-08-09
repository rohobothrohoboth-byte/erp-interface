import { api } from '../../../api';
import type {
  MenuPerApiListDto,
  PerApiListDto,
  PerApiAddDto,
  PerApiModDto
} from '../../../../types/core/Settings/api-permission';

class ApiPermissionService {
  // CHANGED: Use merged Permission endpoint
  private baseUrl = `${import.meta.env.VITE_AUTH_URL || 'auth/v1'}/Permission`;

  private extractErrorMessage(error: any): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
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

  // CHANGED: /PerApi/AllPerApi → /Permission/AllPerApi
  async getAllApiPermissions(): Promise<PerApiListDto[]> {
    try {
      const response = await api.get(`${this.baseUrl}/AllPerApi`);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error fetching API permissions:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // CHANGED: /PerApi/GetPerApi/{id} → /Permission/GetPerApi/{id}
  async getApiPermissionById(id: string): Promise<PerApiListDto> {
    try {
      const response = await api.get(`${this.baseUrl}/GetPerApi/${id}`);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error fetching API permission:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // CHANGED: /PerApi/AddPerApi → /Permission/AddPerApi
  async createApiPermission(apiPermission: PerApiAddDto): Promise<PerApiListDto> {
    try {
      const response = await api.post(`${this.baseUrl}/AddPerApi`, apiPermission);
      console.info('API permission created successfully:', response.data.data.id);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error creating API permission:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // CHANGED: /PerApi/ModPerApi/{id} → /Permission/ModPerApi/{id}
  async updateApiPermission(updateData: PerApiModDto): Promise<PerApiListDto> {
    try {
      const response = await api.put(`${this.baseUrl}/ModPerApi/${updateData.id}`, updateData);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error updating API permission:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // CHANGED: /PerApi/DelPerApi/{id} → /Permission/DelPerApi/{id}
  async deleteApiPermission(id: string): Promise<void> {
    try {
      const response = await api.delete(`${this.baseUrl}/DelPerApi/${id}`);
      console.info('API permission deleted successfully:', response.data.message);
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error deleting API permission:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // CHANGED: Use proper endpoint for menu-based filtering
  async getApiPermissionsByMenu(menuId: string): Promise<MenuPerApiListDto> {
    try {
      const response = await api.get(`${this.baseUrl}/GetPerApiByMenu/${menuId}`);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error fetching API permissions by menu:', errorMessage);
      throw new Error(errorMessage);
    }
  }
}

export const apiPermissionService = new ApiPermissionService();