import { api } from '@/shared/services/api';
import type {
  JobGradeListDto,
  JobGradeAddDto,
  JobGradeModDto,
  UUID
} from '@/modules/hr/types/jobgrade';

class JobGradeService {
  private baseUrl = `${import.meta.env.VITE_CORE_HRMM_URL || 'core/hrmm/v1'}/JobGrade`;

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

  // GET: /api/core/hrmm/v1/JobGrade/AllJobGrade
  async getAllJobGrades(): Promise<JobGradeListDto[]> {
    try {
      const response = await api.get(`${this.baseUrl}/AllJobGrade`);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error fetching job grades:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // GET: /api/core/hrmm/v1/JobGrade/GetJobGrade/{id}
  async getJobGradeById(id: UUID): Promise<JobGradeListDto> {
    try {
      const response = await api.get(`${this.baseUrl}/GetJobGrade/${id}`);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error fetching job grade:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // POST: /api/core/hrmm/v1/JobGrade/AddJobGrade
  async createJobGrade(jobGrade: JobGradeAddDto): Promise<JobGradeListDto> {
    try {
      const response = await api.post(`${this.baseUrl}/AddJobGrade`, jobGrade);
      console.info('Job grade created successfully:', response.data.data.id);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error creating job grade:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // PUT: /api/core/hrmm/v1/JobGrade/ModJobGrade/{id}
  async updateJobGrade(updateData: JobGradeModDto): Promise<JobGradeListDto> {
    try {
      const response = await api.put(`${this.baseUrl}/ModJobGrade/${updateData.id}`, updateData);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error updating job grade:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // DELETE: /api/core/hrmm/v1/JobGrade/DelJobGrade/{id}
  async deleteJobGrade(id: UUID): Promise<void> {
    try {
      const response = await api.delete(`${this.baseUrl}/DelJobGrade/${id}`);
      console.info('Job grade deleted successfully:', response.data.message);
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error deleting job grade:', errorMessage);
      throw new Error(errorMessage);
    }
  }
}

export const jobGradeService = new JobGradeService();