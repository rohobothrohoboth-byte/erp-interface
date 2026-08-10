import { api } from '@/shared/services/api';
import type { HolidayListDto, AddHolidayDto, EditHolidayDto, UUID } from '@/modules/core/types/holiday';

export interface HolidayFilters {
  fiscalYearId?: UUID;
  isPublic?: boolean;
  page?: number;
  limit?: number;
}

class HolidayApi {
  private baseUrl = `${import.meta.env.VITE_CORE_MODULE_URL || 'core/module/v1'}/Holiday`;

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

  async getAllHolidays(): Promise<HolidayListDto[]> {
    try {
      const response = await api.get(`${this.baseUrl}/AllHoliday`);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error fetching holidays:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  async getHolidayById(id: UUID): Promise<HolidayListDto> {
    try {
      const response = await api.get(`${this.baseUrl}/GetHoliday/${id}`);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error fetching holiday:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  async createHoliday(holiday: AddHolidayDto): Promise<HolidayListDto> {
    try {
      const response = await api.post(`${this.baseUrl}/AddHoliday`, holiday);
      console.info('Holiday created successfully:', response.data.data.id);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error creating holiday:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  async updateHoliday(updateData: EditHolidayDto): Promise<HolidayListDto> {
    try {
      const response = await api.put(`${this.baseUrl}/ModHoliday/${updateData.id}`, updateData);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error updating holiday:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  async deleteHoliday(id: UUID): Promise<void> {
    try {
      const response = await api.delete(`${this.baseUrl}/DelHoliday/${id}`);
      console.info('Holiday deleted successfully:', response.data.message);
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error deleting holiday:', errorMessage);
      throw new Error(errorMessage);
    }
  }
}

// Export a singleton instance
export const holidayApi = new HolidayApi();

// Also export functions for React Query integration
export const holidayFetcher = {
  // Queries
  getAllHolidays: () => holidayApi.getAllHolidays(),
  getHolidayById: (id: UUID) => holidayApi.getHolidayById(id),

  // Mutations
  createHoliday: (data: AddHolidayDto) => holidayApi.createHoliday(data),
  updateHoliday: (data: EditHolidayDto) => holidayApi.updateHoliday(data),
  deleteHoliday: (id: UUID) => holidayApi.deleteHoliday(id),
};

// For easy service replacement, export an interface
export interface IHolidayApi {
  getAllHolidays(): Promise<HolidayListDto[]>;
  getHolidayById(id: UUID): Promise<HolidayListDto>;
  createHoliday(holiday: AddHolidayDto): Promise<HolidayListDto>;
  updateHoliday(updateData: EditHolidayDto): Promise<HolidayListDto>;
  deleteHoliday(id: UUID): Promise<void>;
}