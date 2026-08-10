import { api } from '@/shared/services/api';
import type { CompListDto, AddCompDto, EditCompDto, UUID } from '@/modules/core/types/comp';

export interface CompanyFilters {
  search?: string;
  page?: number;
  limit?: number;
}

class CompanyApi {
  private baseUrl = `${import.meta.env.VITE_CORE_MODULE_URL || 'core/module/v1'}/Company`;

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

  async getAllCompanies(): Promise<CompListDto[]> {
    try {
      const response = await api.get(`${this.baseUrl}/AllCompany`);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error fetching companies:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  async getCompanyById(id: UUID): Promise<CompListDto> {
    try {
      const response = await api.get(`${this.baseUrl}/GetCompany/${id}`);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error fetching company:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  async createCompany(company: AddCompDto): Promise<CompListDto> {
    try {
      const response = await api.post(`${this.baseUrl}/AddCompany`, company);
      console.info('Company created successfully:', response.data.data.id);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error creating company:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  async updateCompany(updateData: EditCompDto): Promise<CompListDto> {
    try {
      const response = await api.put(`${this.baseUrl}/ModCompany/${updateData.id}`, updateData);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error updating company:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  async deleteCompany(id: UUID): Promise<void> {
    try {
      const response = await api.delete(`${this.baseUrl}/DelCompany/${id}`);
      console.info('Company deleted successfully:', response.data.message);
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error deleting company:', errorMessage);
      throw new Error(errorMessage);
    }
  }
}

// Export a singleton instance
export const companyApi = new CompanyApi();

// Also export functions for React Query integration
export const companyFetcher = {
  // Queries
  getAllCompanies: () => companyApi.getAllCompanies(),
  getCompanyById: (id: UUID) => companyApi.getCompanyById(id),

  // Mutations
  createCompany: (data: AddCompDto) => companyApi.createCompany(data),
  updateCompany: (data: EditCompDto) => companyApi.updateCompany(data),
  deleteCompany: (id: UUID) => companyApi.deleteCompany(id),
};

// For easy service replacement, export an interface
export interface ICompanyApi {
  getAllCompanies(): Promise<CompListDto[]>;
  getCompanyById(id: UUID): Promise<CompListDto>;
  createCompany(company: AddCompDto): Promise<CompListDto>;
  updateCompany(updateData: EditCompDto): Promise<CompListDto>;
  deleteCompany(id: UUID): Promise<void>;
}