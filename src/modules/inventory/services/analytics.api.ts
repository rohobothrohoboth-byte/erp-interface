// Inventory analytics API client. Talks to the Inventory microservice through the
// gateway route `/inventory` (YARP transforms it to `.../inventory/v1/...`).

import { api } from '@/shared/services/api';
import type {
  StockSummary,
  StockValue,
  MovementAnalysis,
  Forecast,
} from '@/modules/inventory/types/analytics.types';

const GATEWAY = import.meta.env.VITE_GATEWAY_URL || 'http://192.168.1.7:5000';

class InvAnalyticsApi {
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

  async getStockSummary(): Promise<StockSummary> {
    try {
      return this.unwrap<StockSummary>(await api.get(`${this.baseUrl}/InvAnalytics/stock-summary`));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async getStockValue(): Promise<StockValue> {
    try {
      return this.unwrap<StockValue>(await api.get(`${this.baseUrl}/InvAnalytics/stock-value`));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async getMovement(): Promise<MovementAnalysis> {
    try {
      return this.unwrap<MovementAnalysis>(await api.get(`${this.baseUrl}/InvAnalytics/movement`));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async getForecast(): Promise<Forecast> {
    try {
      return this.unwrap<Forecast>(await api.get(`${this.baseUrl}/InvAnalytics/forecast`));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }
}

export const invAnalyticsApi = new InvAnalyticsApi();
