import { api } from '@/shared/services/api';
import type { PeriodListDto, AddPeriodDto, EditPeriodDto, UUID } from '@/modules/core/types/period';

export interface PeriodFilters {
  search?: string;
  activeOnly?: boolean;
  fiscalYearId?: UUID;
  page?: number;
  limit?: number;
}

class PeriodApi {
  private baseUrl = `${import.meta.env.VITE_CORE_MODULE_URL || 'core/module/v1'}/Period`;

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

  async getAllPeriods(): Promise<PeriodListDto[]> {
    try {
      const response = await api.get(`${this.baseUrl}/AllPeriod`);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error fetching periods:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  async getPeriodById(id: UUID): Promise<PeriodListDto> {
    try {
      const response = await api.get(`${this.baseUrl}/GetPeriod/${id}`);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error fetching period:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  async createPeriod(period: AddPeriodDto): Promise<PeriodListDto> {
    try {
      const response = await api.post(`${this.baseUrl}/AddPeriod`, period);
      console.info('Period created successfully:', response.data.data.id);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error creating period:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  async updatePeriod(updateData: EditPeriodDto): Promise<PeriodListDto> {
    try {
      const response = await api.put(`${this.baseUrl}/ModPeriod/${updateData.id}`, updateData);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error updating period:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  async deletePeriod(id: UUID): Promise<void> {
    try {
      const response = await api.delete(`${this.baseUrl}/DelPeriod/${id}`);
      console.info('Period deleted successfully:', response.data.message);
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error deleting period:', errorMessage);
      throw new Error(errorMessage);
    }
  }
}

// Export a singleton instance
export const periodApi = new PeriodApi();

// Also export functions for React Query integration
export const periodFetcher = {
  // Queries
  getAllPeriods: () => periodApi.getAllPeriods(),
  getPeriodById: (id: UUID) => periodApi.getPeriodById(id),

  // Mutations
  createPeriod: (data: AddPeriodDto) => periodApi.createPeriod(data),
  updatePeriod: (data: EditPeriodDto) => periodApi.updatePeriod(data),
  deletePeriod: (id: UUID) => periodApi.deletePeriod(id),
};

// For easy service replacement, export an interface
export interface IPeriodApi {
  getAllPeriods(): Promise<PeriodListDto[]>;
  getPeriodById(id: UUID): Promise<PeriodListDto>;
  createPeriod(period: AddPeriodDto): Promise<PeriodListDto>;
  updatePeriod(updateData: EditPeriodDto): Promise<PeriodListDto>;
  deletePeriod(id: UUID): Promise<void>;
}