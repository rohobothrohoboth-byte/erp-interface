// Inventory reorder API client. Talks to the Inventory microservice through the
// gateway route `/inventory` (YARP transforms it to `.../inventory/v1/...`).
// Covers reorder rules/levels, alerts, and reorder requests.

import { api } from '@/shared/services/api';
import type {
  ReorderRule,
  ReorderRuleCreate,
  ReorderRuleUpdate,
  ReorderAlert,
  ReorderRequest,
  ReorderRequestCreate,
  ReorderRequestFilter,
  ReorderDecision,
} from '@/modules/inventory/types/reorder.types';

const GATEWAY = import.meta.env.VITE_GATEWAY_URL || 'http://192.168.1.7:5000';

class ReorderApi {
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

  // ---- Levels (rules) ----
  async getLevels(): Promise<ReorderRule[]> {
    try {
      return this.unwrap<ReorderRule[]>(await api.get(`${this.baseUrl}/Reorder/levels`));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async createLevel(dto: ReorderRuleCreate): Promise<ReorderRule> {
    try {
      return this.unwrap<ReorderRule>(await api.post(`${this.baseUrl}/Reorder/levels`, dto));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async updateLevel(id: string, dto: ReorderRuleUpdate): Promise<ReorderRule> {
    try {
      return this.unwrap<ReorderRule>(await api.put(`${this.baseUrl}/Reorder/levels/${id}`, dto));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  // ---- Alerts ----
  async getAlerts(): Promise<ReorderAlert[]> {
    try {
      return this.unwrap<ReorderAlert[]>(await api.get(`${this.baseUrl}/Reorder/alerts`));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  // ---- Requests ----
  async getRequests(params: ReorderRequestFilter = {}): Promise<ReorderRequest[]> {
    try {
      return this.unwrap<ReorderRequest[]>(
        await api.get(`${this.baseUrl}/Reorder/requests`, { params })
      );
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async createRequest(dto: ReorderRequestCreate): Promise<ReorderRequest> {
    try {
      return this.unwrap<ReorderRequest>(await api.post(`${this.baseUrl}/Reorder/requests`, dto));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async approveRequest(id: string, dto: ReorderDecision = {}): Promise<ReorderRequest> {
    try {
      return this.unwrap<ReorderRequest>(
        await api.put(`${this.baseUrl}/Reorder/requests/${id}/approve`, dto)
      );
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async rejectRequest(id: string, dto: ReorderDecision = {}): Promise<ReorderRequest> {
    try {
      return this.unwrap<ReorderRequest>(
        await api.put(`${this.baseUrl}/Reorder/requests/${id}/reject`, dto)
      );
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async convertRequest(id: string, dto: ReorderDecision = {}): Promise<ReorderRequest> {
    try {
      return this.unwrap<ReorderRequest>(
        await api.put(`${this.baseUrl}/Reorder/requests/${id}/convert`, dto)
      );
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }
}

export const reorderApi = new ReorderApi();
