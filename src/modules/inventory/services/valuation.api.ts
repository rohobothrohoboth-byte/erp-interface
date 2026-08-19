// Inventory valuation API client. Talks to the Inventory microservice through the
// gateway route `/inventory` (YARP transforms it to `.../inventory/v1/...`).

import { api } from '@/shared/services/api';
import type {
  ValuationMethod,
  ValuationReport,
  ValuationReportFilter,
} from '@/modules/inventory/types/valuation.types';

const GATEWAY = import.meta.env.VITE_GATEWAY_URL || 'http://192.168.1.7:5000';

class ValuationApi {
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

  async getMethod(): Promise<ValuationMethod> {
    try {
      return this.unwrap<ValuationMethod>(await api.get(`${this.baseUrl}/Valuation/method`));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async setMethod(dto: ValuationMethod): Promise<ValuationMethod> {
    try {
      return this.unwrap<ValuationMethod>(await api.put(`${this.baseUrl}/Valuation/method`, dto));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async getReport(params: ValuationReportFilter = {}): Promise<ValuationReport> {
    try {
      return this.unwrap<ValuationReport>(
        await api.get(`${this.baseUrl}/Valuation/report`, { params })
      );
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }
}

export const valuationApi = new ValuationApi();
