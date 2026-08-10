import { api } from '@/shared/services/api';
import type { HierListDto, AddHierDto, EditHierDto, UUID } from '@/modules/core/types/hier';

class HierarchyApi {
  private baseUrl = `${import.meta.env.VITE_CORE_MODULE_URL || 'core/module/v1'}/hierarchy`;

  private extractErrorMessage(error: any): string {
    if (error.response?.data?.message) return error.response.data.message;
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      return (Object.values(errors).flat() as string[]).join(', ');
    }
    return error.message || 'An unexpected error occurred';
  }

  async getAllHierarchies(): Promise<HierListDto[]> {
    try {
      const response = await api.get(`${this.baseUrl}/AllHierarchy`);
      return response.data.data;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async getHierarchyById(id: UUID): Promise<HierListDto> {
    try {
      const response = await api.get(`${this.baseUrl}/GetHierarchy/${id}`);
      return response.data.data;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async createHierarchy(hierarchy: AddHierDto): Promise<HierListDto> {
    try {
      const response = await api.post(`${this.baseUrl}/AddHierarchy`, hierarchy);
      return response.data.data;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async updateHierarchy(updateData: EditHierDto): Promise<HierListDto> {
    try {
      const response = await api.put(`${this.baseUrl}/ModHierarchy/${updateData.id}`, updateData);
      return response.data.data;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async deleteHierarchy(id: UUID): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/DelHierarchy/${id}`);
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }
}

export const hierarchyApi = new HierarchyApi();

export const hierarchyFetcher = {
  getAllHierarchies: () => hierarchyApi.getAllHierarchies(),
  getHierarchyById: (id: UUID) => hierarchyApi.getHierarchyById(id),
  createHierarchy: (data: AddHierDto) => hierarchyApi.createHierarchy(data),
  updateHierarchy: (data: EditHierDto) => hierarchyApi.updateHierarchy(data),
  deleteHierarchy: (id: UUID) => hierarchyApi.deleteHierarchy(id),
};
