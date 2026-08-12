// Employee Transfer API client. Talks to the HRM Profile microservice through the
// gateway route (VITE_HRMM_PROFILE_URL, defaulting to `/hrm/profile/v1`).

import { api } from '@/shared/services/api';
import type { Transfer, TransferCreate, TransferUpdate } from '@/modules/hr/types/lifecycle.types';

const BASE = `${import.meta.env.VITE_HRMM_PROFILE_URL || '/hrm/profile/v1'}/Transfer`;

class TransferApi {
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

  async getAll(employeeId?: string): Promise<Transfer[]> {
    try {
      const url = employeeId ? `${BASE}?employeeId=${encodeURIComponent(employeeId)}` : BASE;
      return this.unwrap<Transfer[]>(await api.get(url));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async getByEmployee(employeeId: string): Promise<Transfer[]> {
    try {
      return this.unwrap<Transfer[]>(await api.get(`${BASE}/employee/${employeeId}`));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async getById(id: string): Promise<Transfer> {
    try {
      return this.unwrap<Transfer>(await api.get(`${BASE}/${id}`));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async create(dto: TransferCreate): Promise<Transfer> {
    try {
      return this.unwrap<Transfer>(await api.post(BASE, dto));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async update(id: string, dto: TransferUpdate): Promise<Transfer> {
    try {
      return this.unwrap<Transfer>(await api.put(`${BASE}/${id}`, dto));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await api.delete(`${BASE}/${id}`);
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }
}

export const transferApi = new TransferApi();
