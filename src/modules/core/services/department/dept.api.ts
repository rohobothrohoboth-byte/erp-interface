import { api } from '@/shared/services/api';
import type { DeptListDto, AddDeptDto, EditDeptDto, UUID, BranchDeptList } from '@/modules/core/types/dept';

export interface DepartmentFilters {
  search?: string;
  branchId?: UUID;
  page?: number;
  limit?: number;
}

class DepartmentApi {
  private baseUrl = `${import.meta.env.VITE_CORE_MODULE_URL || 'core/module/v1'}/Department`;
  private listUrl = `${import.meta.env.VITE_CORE_MODULE_URL || 'core/module/v1'}/Names`;

  // Helper method to extract error messages
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

  async getAllDepartments(): Promise<DeptListDto[]> {
    try {
      const response = await api.get(`${this.baseUrl}/AllDept`);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error fetching departments:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  async getDepartmentById(id: UUID): Promise<DeptListDto> {
    try {
      const response = await api.get(`${this.baseUrl}/GetDept/${id}`);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error fetching department:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  async createDepartment(department: AddDeptDto): Promise<DeptListDto> {
    try {
      const response = await api.post(`${this.baseUrl}/AddDept`, department);
      console.info('Department created successfully:', response.data.data.id);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error creating department:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  async updateDepartment(updateData: EditDeptDto): Promise<DeptListDto> {
    try {
      const response = await api.put(`${this.baseUrl}/ModDept/${updateData.id}`, updateData);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error updating department:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  async deleteDepartment(id: UUID): Promise<void> {
    try {
      const response = await api.delete(`${this.baseUrl}/DelDept/${id}`);
      console.info('Department deleted successfully:', response.data.message);
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error deleting department:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  async getBranchDepartmentNames(branchId: UUID): Promise<BranchDeptList[]> {
    try {
      const response = await api.get(`${this.listUrl}/BranchDept/${branchId}`);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error fetching branch department names:', errorMessage);
      throw new Error(errorMessage);
    }
  }
}

// Export a singleton instance
export const departmentApi = new DepartmentApi();

// Also export functions for React Query integration
export const departmentFetcher = {
  // Queries
  getAllDepartments: () => departmentApi.getAllDepartments(),
  getDepartmentById: (id: UUID) => departmentApi.getDepartmentById(id),
  getBranchDepartmentNames: (branchId: UUID) => departmentApi.getBranchDepartmentNames(branchId),

  // Mutations
  createDepartment: (data: AddDeptDto) => departmentApi.createDepartment(data),
  updateDepartment: (data: EditDeptDto) => departmentApi.updateDepartment(data),
  deleteDepartment: (id: UUID) => departmentApi.deleteDepartment(id),
};

// For easy service replacement, export an interface
export interface IDepartmentApi {
  getAllDepartments(): Promise<DeptListDto[]>;
  getDepartmentById(id: UUID): Promise<DeptListDto>;
  createDepartment(department: AddDeptDto): Promise<DeptListDto>;
  updateDepartment(updateData: EditDeptDto): Promise<DeptListDto>;
  deleteDepartment(id: UUID): Promise<void>;
  getBranchDepartmentNames(branchId: UUID): Promise<BranchDeptList[]>;
}