// Inventory warehouse API client. Talks to the Inventory microservice through the
// gateway route `/inventory` (YARP transforms it to `.../inventory/v1/...`).

import { api } from '@/shared/services/api';
import type {
  Warehouse,
  WarehouseCreate,
  WarehouseUpdate,
} from '@/modules/inventory/types/warehouse.types';

const GATEWAY = import.meta.env.VITE_GATEWAY_URL || 'http://192.168.1.7:5000';

class WarehouseApi {
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

  async getAll(): Promise<Warehouse[]> {
    try {
      return this.unwrap<Warehouse[]>(await api.get(`${this.baseUrl}/Warehouse`));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async getById(id: string): Promise<Warehouse> {
    try {
      return this.unwrap<Warehouse>(await api.get(`${this.baseUrl}/Warehouse/${id}`));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async create(dto: WarehouseCreate): Promise<Warehouse> {
    try {
      return this.unwrap<Warehouse>(await api.post(`${this.baseUrl}/Warehouse`, dto));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async update(dto: WarehouseUpdate): Promise<Warehouse> {
    try {
      return this.unwrap<Warehouse>(await api.put(`${this.baseUrl}/Warehouse`, dto));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/Warehouse/${id}`);
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }
}

export const warehouseApi = new WarehouseApi();
