// Inventory dashboard API client. Talks to the Inventory microservice through the
// gateway route `/inventory` (YARP transforms it to `.../inventory/v1/...`).

import { api } from '@/shared/services/api';
import type { DashboardStats } from '@/modules/inventory/types/dashboard.types';

const GATEWAY = import.meta.env.VITE_GATEWAY_URL || 'http://192.168.1.7:5000';

class InvDashboardApi {
  private baseUrl = `${GATEWAY}/inventory/v1`;

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

  async getStats(): Promise<DashboardStats> {
    try {
      return this.unwrap<DashboardStats>(await api.get(`${this.baseUrl}/Dashboard/stats`));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }
}

export const invDashboardApi = new InvDashboardApi();
