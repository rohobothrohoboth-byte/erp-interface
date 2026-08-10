import { api } from '@/shared/services/api';
import type {
  EducationQualListDto,
  EducationQualAddDto,
  EducationQualModDto,
  UUID
} from '@/modules/hr/types/educationalqual';

class EducationQualService {
  private baseUrl = `${import.meta.env.VITE_CORE_HRMM_URL || 'core/hrmm/v1'}/EducationQual`;

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

  // GET: /api/core/hrmm/v1/EducationQual/AllEducationQual
  async getAllEducationQuals(): Promise<EducationQualListDto[]> {
    try {
      const response = await api.get(`${this.baseUrl}/AllEducationQual`);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error fetching educational qualifications:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // GET: /api/core/hrmm/v1/EducationQual/GetEducationQual/{id}
  async getEducationQualById(id: UUID): Promise<EducationQualListDto> {
    try {
      const response = await api.get(`${this.baseUrl}/GetEducationQual/${id}`);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error fetching educational qualification:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // POST: /api/core/hrmm/v1/EducationQual/AddEducationQual
  async createEducationQual(educationQual: EducationQualAddDto): Promise<EducationQualListDto> {
    try {
      const response = await api.post(`${this.baseUrl}/AddEducationQual`, educationQual);
      console.info('Educational qualification created successfully:', response.data.data.id);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error creating educational qualification:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // PUT: /api/core/hrmm/v1/EducationQual/ModEducationQual/{id}
  async updateEducationQual(updateData: EducationQualModDto): Promise<EducationQualListDto> {
    try {
      const response = await api.put(`${this.baseUrl}/ModEducationQual/${updateData.id}`, updateData);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error updating educational qualification:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // DELETE: /api/core/hrmm/v1/EducationQual/DelEducationQual/{id}
  async deleteEducationQual(id: UUID): Promise<void> {
    try {
      const response = await api.delete(`${this.baseUrl}/DelEducationQual/${id}`);
      console.info('Educational qualification deleted successfully:', response.data.message);
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error deleting educational qualification:', errorMessage);
      throw new Error(errorMessage);
    }
  }
}

export const educationQualService = new EducationQualService();