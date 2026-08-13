// HR Performance API client. Talks to the Performance microservice through the
// gateway route `/performance` (YARP transforms it to `api/v1/...`).

import { api } from '@/shared/services/api';
import type {
  Kpi,
  KpiCreate,
  Goal,
  GoalCreate,
  PerformanceReview,
  PerformanceReviewCreate,
} from '@/modules/hr/types/performance.types';

const GATEWAY = import.meta.env.VITE_GATEWAY_URL || 'http://192.168.1.7:5000';

class PerformanceApi {
  private baseUrl = `${GATEWAY}/performance`;

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

  // ---- KPIs ----
  async getKpis(): Promise<Kpi[]> {
    try {
      return this.unwrap<Kpi[]>(await api.get(`${this.baseUrl}/KPI`));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async getKpi(id: string): Promise<Kpi> {
    try {
      return this.unwrap<Kpi>(await api.get(`${this.baseUrl}/KPI/${id}`));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async createKpi(dto: KpiCreate): Promise<Kpi> {
    try {
      return this.unwrap<Kpi>(await api.post(`${this.baseUrl}/KPI`, dto));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async updateKpi(id: string, dto: KpiCreate): Promise<Kpi> {
    try {
      return this.unwrap<Kpi>(await api.put(`${this.baseUrl}/KPI/${id}`, dto));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async deleteKpi(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/KPI/${id}`);
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  // ---- Goals ----
  async getGoals(): Promise<Goal[]> {
    try {
      return this.unwrap<Goal[]>(await api.get(`${this.baseUrl}/Goal`));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async getGoalsByEmployee(employeeId: string): Promise<Goal[]> {
    try {
      return this.unwrap<Goal[]>(await api.get(`${this.baseUrl}/Goal/employee/${employeeId}`));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async createGoal(dto: GoalCreate): Promise<Goal> {
    try {
      return this.unwrap<Goal>(await api.post(`${this.baseUrl}/Goal`, dto));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async updateGoal(id: string, dto: GoalCreate): Promise<Goal> {
    try {
      return this.unwrap<Goal>(await api.put(`${this.baseUrl}/Goal/${id}`, dto));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async deleteGoal(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/Goal/${id}`);
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  // ---- Reviews ----
  async getReviews(): Promise<PerformanceReview[]> {
    try {
      return this.unwrap<PerformanceReview[]>(await api.get(`${this.baseUrl}/Review`));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async getReviewsByEmployee(employeeId: string): Promise<PerformanceReview[]> {
    try {
      return this.unwrap<PerformanceReview[]>(await api.get(`${this.baseUrl}/Review/employee/${employeeId}`));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async createReview(dto: PerformanceReviewCreate): Promise<PerformanceReview> {
    try {
      return this.unwrap<PerformanceReview>(await api.post(`${this.baseUrl}/Review`, dto));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async updateReview(id: string, dto: PerformanceReviewCreate): Promise<PerformanceReview> {
    try {
      return this.unwrap<PerformanceReview>(await api.put(`${this.baseUrl}/Review/${id}`, dto));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async deleteReview(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/Review/${id}`);
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async submitReview(id: string): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/Review/${id}/submit`);
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async approveReview(id: string): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/Review/${id}/approve`);
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }
}

export const performanceApi = new PerformanceApi();
