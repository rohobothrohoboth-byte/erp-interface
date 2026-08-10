// services/hr/JgStepService.ts
import { api } from '@/shared/services/api';
import type {
  JgStepListDto,
  JgStepAddDto,
  JgStepModDto,
  UUID
} from '@/modules/hr/types/JgStep';

class JgStepService {
  private baseUrl = `${import.meta.env.VITE_CORE_HRMM_URL || 'core/hrmm/v1'}/JgStep`;

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

  // ✅ FIXED: GET /api/core/hrmm/v1/JgStep/AllJgStepsByJobGrade/{id}
  async getJgStepsByJobGrade(jobGradeId: UUID): Promise<JgStepListDto[]> {
    try {
      // ✅ Changed from AllJgSteps to AllJgStepsByJobGrade
      const response = await api.get(`${this.baseUrl}/AllJgStepsByJobGrade/${jobGradeId}`);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error fetching job grade steps by job grade:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // GET: /api/core/hrmm/v1/JgStep/GetJgStep/{id}
  async getJgStepById(id: UUID): Promise<JgStepListDto> {
    try {
      const response = await api.get(`${this.baseUrl}/GetJgStep/${id}`);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error fetching job grade step:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // POST: /api/core/hrmm/v1/JgStep/AddJgStep
  async createJgStep(jgStep: JgStepAddDto): Promise<JgStepListDto> {
    try {
      const response = await api.post(`${this.baseUrl}/AddJgStep`, jgStep);
      console.info('Job grade step created successfully:', response.data.data.id);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error creating job grade step:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // PUT: /api/core/hrmm/v1/JgStep/ModJgStep/{id}
  async updateJgStep(updateData: JgStepModDto): Promise<JgStepListDto> {
    try {
      const response = await api.put(`${this.baseUrl}/ModJgStep/${updateData.id}`, updateData);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error updating job grade step:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // DELETE: /api/core/hrmm/v1/JgStep/DelJgStep/{id}
  async deleteJgStep(id: UUID): Promise<void> {
    try {
      const response = await api.delete(`${this.baseUrl}/DelJgStep/${id}`);
      console.info('Job grade step deleted successfully:', response.data.message);
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error deleting job grade step:', errorMessage);
      throw new Error(errorMessage);
    }
  }
}

export const jgStepService = new JgStepService();