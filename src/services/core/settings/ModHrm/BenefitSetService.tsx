import { api } from '../../../api';
import type {
  BenefitSetListDto,
  BenefitSetAddDto,
  BenefitSetModDto,
  UUID
} from '../../../../types/hr/benefit';

class BenefitSetService {
  private baseUrl = `${import.meta.env.VITE_CORE_HRMM_URL || 'core/hrmm/v1'}/BenefitSet`;

  // Helper method to extract error messages
  private extractErrorMessage(error: any): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.errors) {
      // Handle validation errors (object with field names as keys)
      const errors = error.response.data.errors;
      const errorMessages = Object.values(errors).flat();
      return errorMessages.join(', ');
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }

  // GET: /api/core/hrmm/v1/BenefitSet/AllBenefitSet
  async getAllBenefitSets(): Promise<BenefitSetListDto[]> {
    try {
      const response = await api.get(`${this.baseUrl}/AllBenefitSet`);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error fetching benefit sets:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // GET: /api/core/hrmm/v1/BenefitSet/GetBenefitSet/{id}
  async getBenefitSetById(id: UUID): Promise<BenefitSetListDto> {
    try {
      const response = await api.get(`${this.baseUrl}/GetBenefitSet/${id}`);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error fetching benefit set:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // POST: /api/core/hrmm/v1/BenefitSet/AddBenefitSet
  async createBenefitSet(benefitSet: BenefitSetAddDto): Promise<BenefitSetListDto> {
    try {
      const response = await api.post(`${this.baseUrl}/AddBenefitSet`, benefitSet);
      console.info('Benefit set created successfully:', response.data.data.id);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error creating benefit set:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // PUT: /api/core/hrmm/v1/BenefitSet/ModBenefitSet/{id}
  async updateBenefitSet(updateData: BenefitSetModDto): Promise<BenefitSetListDto> {
    try {
      const response = await api.put(`${this.baseUrl}/ModBenefitSet/${updateData.id}`, updateData);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error updating benefit set:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // DELETE: /api/core/hrmm/v1/BenefitSet/DelBenefitSet/{id}
  async deleteBenefitSet(id: UUID): Promise<void> {
    try {
      const response = await api.delete(`${this.baseUrl}/DelBenefitSet/${id}`);
      console.info('Benefit set deleted successfully:', response.data.message);
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error deleting benefit set:', errorMessage);
      throw new Error(errorMessage);
    }
  }
}

export const benefitSetService = new BenefitSetService();