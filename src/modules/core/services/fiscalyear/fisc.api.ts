import { api } from '@/shared/services/api';
import type { FiscYearListDto, AddFiscYearDto, EditFiscYearDto, UUID } from '@/modules/core/types/fisc';

export interface FiscalYearFilters {
  search?: string;
  page?: number;
  limit?: number;
}

class FiscalYearApi {
  // FIXED: Add leading slash to match gateway pattern
  private baseUrl = `/core/module/v1/FiscalYear`;

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

  async getAllFiscalYears(): Promise<FiscYearListDto[]> {
    try {
      const response = await api.get(`${this.baseUrl}/AllFiscalYear`);
      return response.data?.data || [];
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error fetching fiscal years:', errorMessage);
      return []; // Return empty array instead of throwing
    }
  }

  async getActiveFiscalYear(): Promise<FiscYearListDto | null> {
    try {
      const allFiscalYears = await this.getAllFiscalYears();
      // Find the active fiscal year (based on current date or isActive flag)
      const currentDate = new Date();
      const activeFiscalYear = allFiscalYears.find((fy) => {
        const startDate = new Date(fy.startDate);
        const endDate = new Date(fy.endDate);
        return currentDate >= startDate && currentDate <= endDate;
      });
      return activeFiscalYear || null;
    } catch (error) {
      console.error('Error fetching active fiscal year:', error);
      return null;
    }
  }

  async getFiscalYearById(id: UUID): Promise<FiscYearListDto | null> {
    try {
      const response = await api.get(`${this.baseUrl}/GetFiscalYear/${id}`);
      return response.data?.data || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error fetching fiscal year:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  async createFiscalYear(fiscalYear: AddFiscYearDto): Promise<FiscYearListDto> {
    try {
      const response = await api.post(`${this.baseUrl}/AddFiscalYear`, fiscalYear);
      console.info('Fiscal year created successfully:', response.data?.data?.id);
      return response.data?.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error creating fiscal year:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  async updateFiscalYear(updateData: EditFiscYearDto): Promise<FiscYearListDto> {
    try {
      const response = await api.put(`${this.baseUrl}/ModFiscalYear/${updateData.id}`, updateData);
      return response.data?.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error updating fiscal year:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  async deleteFiscalYear(id: UUID): Promise<void> {
    try {
      const response = await api.delete(`${this.baseUrl}/DelFiscalYear/${id}`);
      console.info('Fiscal year deleted successfully:', response.data?.message);
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error deleting fiscal year:', errorMessage);
      throw new Error(errorMessage);
    }
  }
}

// Export a singleton instance
export const fiscalYearApi = new FiscalYearApi();

// Also export functions for React Query integration
export const fiscalYearFetcher = {
  // Queries
  getAllFiscalYears: () => fiscalYearApi.getAllFiscalYears(),
  getActiveFiscalYear: () => fiscalYearApi.getActiveFiscalYear(),
  getFiscalYearById: (id: UUID) => fiscalYearApi.getFiscalYearById(id),

  // Mutations
  createFiscalYear: (data: AddFiscYearDto) => fiscalYearApi.createFiscalYear(data),
  updateFiscalYear: (data: EditFiscYearDto) => fiscalYearApi.updateFiscalYear(data),
  deleteFiscalYear: (id: UUID) => fiscalYearApi.deleteFiscalYear(id),
};

// For easy service replacement, export an interface
export interface IFiscalYearApi {
  getAllFiscalYears(): Promise<FiscYearListDto[]>;
  getActiveFiscalYear(): Promise<FiscYearListDto | null>;
  getFiscalYearById(id: UUID): Promise<FiscYearListDto | null>;
  createFiscalYear(fiscalYear: AddFiscYearDto): Promise<FiscYearListDto>;
  updateFiscalYear(updateData: EditFiscYearDto): Promise<FiscYearListDto>;
  deleteFiscalYear(id: UUID): Promise<void>;
}