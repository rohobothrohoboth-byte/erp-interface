// HR Training API client. Talks to the Training microservice through the gateway
// route `/training` (YARP transforms it to `api/v1/...`).

import { api } from '@/shared/services/api';
import type {
  TrainingProgram,
  TrainingProgramCreate,
  TrainingCourse,
  TrainingCourseCreate,
  TrainingEnrollment,
  TrainingEnrollmentCreate,
} from '@/modules/hr/types/training.types';

const GATEWAY = import.meta.env.VITE_GATEWAY_URL || 'http://192.168.1.7:5000';

class TrainingApi {
  private baseUrl = `${GATEWAY}/training`;

  private extractErrorMessage(error: any): string {
    if (error.response?.data?.message) return error.response.data.message;
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      return (Object.values(errors).flat() as string[]).join(', ');
    }
    return error.message || 'An unexpected error occurred';
  }

  private unwrap<T>(response: any): T {
    return (response.data?.data ?? response.data) as T;
  }

  // ---- Programs ----
  async getPrograms(): Promise<TrainingProgram[]> {
    try {
      return this.unwrap<TrainingProgram[]>(await api.get(`${this.baseUrl}/Program`));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async getProgram(id: string): Promise<TrainingProgram> {
    try {
      return this.unwrap<TrainingProgram>(await api.get(`${this.baseUrl}/Program/${id}`));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async createProgram(dto: TrainingProgramCreate): Promise<TrainingProgram> {
    try {
      return this.unwrap<TrainingProgram>(await api.post(`${this.baseUrl}/Program`, dto));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async updateProgram(id: string, dto: TrainingProgramCreate): Promise<TrainingProgram> {
    try {
      return this.unwrap<TrainingProgram>(await api.put(`${this.baseUrl}/Program/${id}`, dto));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async deleteProgram(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/Program/${id}`);
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  // ---- Courses ----
  async getCourses(): Promise<TrainingCourse[]> {
    try {
      return this.unwrap<TrainingCourse[]>(await api.get(`${this.baseUrl}/Course`));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async getCoursesByProgram(programId: string): Promise<TrainingCourse[]> {
    try {
      return this.unwrap<TrainingCourse[]>(await api.get(`${this.baseUrl}/Course/program/${programId}`));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async createCourse(dto: TrainingCourseCreate): Promise<TrainingCourse> {
    try {
      return this.unwrap<TrainingCourse>(await api.post(`${this.baseUrl}/Course`, dto));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async updateCourse(id: string, dto: TrainingCourseCreate): Promise<TrainingCourse> {
    try {
      return this.unwrap<TrainingCourse>(await api.put(`${this.baseUrl}/Course/${id}`, dto));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async deleteCourse(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/Course/${id}`);
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  // ---- Enrollments ----
  async getEnrollments(): Promise<TrainingEnrollment[]> {
    try {
      return this.unwrap<TrainingEnrollment[]>(await api.get(`${this.baseUrl}/Enrollment`));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async getEnrollmentsByEmployee(employeeId: string): Promise<TrainingEnrollment[]> {
    try {
      return this.unwrap<TrainingEnrollment[]>(await api.get(`${this.baseUrl}/Enrollment/employee/${employeeId}`));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async enroll(dto: TrainingEnrollmentCreate): Promise<TrainingEnrollment> {
    try {
      return this.unwrap<TrainingEnrollment>(await api.post(`${this.baseUrl}/Enrollment`, dto));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async updateEnrollment(id: string, dto: TrainingEnrollmentCreate): Promise<TrainingEnrollment> {
    try {
      return this.unwrap<TrainingEnrollment>(await api.put(`${this.baseUrl}/Enrollment/${id}`, dto));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async cancelEnrollment(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/Enrollment/${id}`);
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async issueCertificate(id: string): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/Enrollment/${id}/certificate`);
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }
}

export const trainingApi = new TrainingApi();
