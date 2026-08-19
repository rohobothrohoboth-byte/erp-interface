// Inventory employee-materials API client. Talks to the Inventory microservice
// through the gateway route `/inventory` (YARP transforms it to
// `.../inventory/v1/...`). Covers material requests and assignments.

import { api } from '@/shared/services/api';
import type {
  MaterialRequest,
  MaterialRequestCreate,
  MaterialRequestDecision,
  MaterialAssignment,
  MaterialAssignmentCreate,
} from '@/modules/inventory/types/materials.types';

const GATEWAY = import.meta.env.VITE_GATEWAY_URL || 'http://192.168.1.7:5000';

class MaterialsApi {
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

  // ---- Material Requests ----
  async createMyRequest(dto: MaterialRequestCreate): Promise<MaterialRequest> {
    try {
      return this.unwrap<MaterialRequest>(
        await api.post(`${this.baseUrl}/MaterialRequest/my`, dto)
      );
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async getMyRequests(): Promise<MaterialRequest[]> {
    try {
      return this.unwrap<MaterialRequest[]>(
        await api.get(`${this.baseUrl}/MaterialRequest/my`)
      );
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async getAllRequests(): Promise<MaterialRequest[]> {
    try {
      return this.unwrap<MaterialRequest[]>(
        await api.get(`${this.baseUrl}/MaterialRequest`)
      );
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async approveRequest(id: string, dto: MaterialRequestDecision = {}): Promise<MaterialRequest> {
    try {
      return this.unwrap<MaterialRequest>(
        await api.put(`${this.baseUrl}/MaterialRequest/${id}/approve`, dto)
      );
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async rejectRequest(id: string, dto: MaterialRequestDecision = {}): Promise<MaterialRequest> {
    try {
      return this.unwrap<MaterialRequest>(
        await api.put(`${this.baseUrl}/MaterialRequest/${id}/reject`, dto)
      );
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async issueRequest(id: string): Promise<MaterialRequest> {
    try {
      return this.unwrap<MaterialRequest>(
        await api.put(`${this.baseUrl}/MaterialRequest/${id}/issue`)
      );
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  // ---- Material Assignments ----
  async getMyAssignments(): Promise<MaterialAssignment[]> {
    try {
      return this.unwrap<MaterialAssignment[]>(
        await api.get(`${this.baseUrl}/MaterialAssignment/my`)
      );
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async getAllAssignments(): Promise<MaterialAssignment[]> {
    try {
      return this.unwrap<MaterialAssignment[]>(
        await api.get(`${this.baseUrl}/MaterialAssignment`)
      );
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async createAssignment(dto: MaterialAssignmentCreate): Promise<MaterialAssignment> {
    try {
      return this.unwrap<MaterialAssignment>(
        await api.post(`${this.baseUrl}/MaterialAssignment`, dto)
      );
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async returnAssignment(id: string): Promise<MaterialAssignment> {
    try {
      return this.unwrap<MaterialAssignment>(
        await api.put(`${this.baseUrl}/MaterialAssignment/${id}/return`)
      );
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }
}

export const materialsApi = new MaterialsApi();
