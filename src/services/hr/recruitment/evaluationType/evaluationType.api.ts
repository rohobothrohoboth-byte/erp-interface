import type { 
  EvaluationTypeListDto, 
  EvaluationTypeAddDto, 
  EvaluationTypeModDto,
  UUID 
} from '../../../../types/hr/recruit/evaluationType';
import { api } from '../../../api';

export interface EvaluationTypeFilters {
  search?: string;
  page?: number;
  limit?: number;
}

class EvaluationTypeApi {
  private baseUrl = `${import.meta.env.VITE_HRMM_RECRUIT_URL || 'hrm/recruit/v1'}/EvalType`;
 
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

  // GET: /AllEvalType
  async getAllEvaluationTypes(): Promise<EvaluationTypeListDto[]> {
    try {
      const response = await api.get(`${this.baseUrl}/AllEvalType`);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error fetching evaluation types:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // GET: /GetEvalType/{id}
  async getEvaluationTypeById(id: UUID): Promise<EvaluationTypeListDto> {
    try {
      const response = await api.get(`${this.baseUrl}/GetEvalType/${id}`);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error fetching evaluation type:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // POST: /AddEvalType
  async createEvaluationType(data: EvaluationTypeAddDto): Promise<EvaluationTypeListDto> {
    try {
      const response = await api.post(`${this.baseUrl}/AddEvalType`, data);
      console.info('Evaluation type created successfully:', response.data.data.id);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error creating evaluation type:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // PUT: /ModEvalType/{id}
  async updateEvaluationType(updateData: EvaluationTypeModDto): Promise<EvaluationTypeListDto> {
    try {
      const response = await api.put(`${this.baseUrl}/ModEvalType/${updateData.id}`, updateData);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error updating evaluation type:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // DELETE: /DelEvalType/{id}
  async deleteEvaluationType(id: UUID): Promise<void> {
    try {
      const response = await api.delete(`${this.baseUrl}/DelEvalType/${id}`);
      console.info('Evaluation type deleted successfully:', response.data.message);
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error deleting evaluation type:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // GET: /StatEvalType
  async getEvaluationTypeStats(): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/StatEvalType`);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error fetching evaluation type statistics:', errorMessage);
      throw new Error(errorMessage);
    }
  }
}

// Export a singleton instance
export const evaluationTypeApi = new EvaluationTypeApi();

// Also export functions for React Query integration
export const evaluationTypeFetcher = {
  // Queries
  getAllEvaluationTypes: () => evaluationTypeApi.getAllEvaluationTypes(),
  getEvaluationTypeById: (id: UUID) => evaluationTypeApi.getEvaluationTypeById(id),
  getEvaluationTypeStats: () => evaluationTypeApi.getEvaluationTypeStats(),

  // Mutations
  createEvaluationType: (data: EvaluationTypeAddDto) => evaluationTypeApi.createEvaluationType(data),
  updateEvaluationType: (data: EvaluationTypeModDto) => evaluationTypeApi.updateEvaluationType(data),
  deleteEvaluationType: (id: UUID) => evaluationTypeApi.deleteEvaluationType(id),
};

