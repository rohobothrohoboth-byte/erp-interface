// Inventory warehouse-zone API client. Talks to the Inventory microservice through
// the gateway route `/inventory` (YARP transforms it to `.../inventory/v1/...`).
// Covers zones, bins, and warehouse layout.

import { api } from '@/shared/services/api';
import type {
  WarehouseZone,
  WarehouseZoneCreate,
  WarehouseZoneUpdate,
  WarehouseZoneFilter,
  Bin,
  BinCreate,
  WarehouseLayout,
} from '@/modules/inventory/types/warehouseZone.types';

const GATEWAY = import.meta.env.VITE_GATEWAY_URL || 'http://192.168.1.7:5000';

class WarehouseZoneApi {
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

  async getAll(params: WarehouseZoneFilter = {}): Promise<WarehouseZone[]> {
    try {
      return this.unwrap<WarehouseZone[]>(
        await api.get(`${this.baseUrl}/WarehouseZone`, { params })
      );
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async getById(id: string): Promise<WarehouseZone> {
    try {
      return this.unwrap<WarehouseZone>(await api.get(`${this.baseUrl}/WarehouseZone/${id}`));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async create(dto: WarehouseZoneCreate): Promise<WarehouseZone> {
    try {
      return this.unwrap<WarehouseZone>(await api.post(`${this.baseUrl}/WarehouseZone`, dto));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async update(dto: WarehouseZoneUpdate): Promise<WarehouseZone> {
    try {
      return this.unwrap<WarehouseZone>(await api.put(`${this.baseUrl}/WarehouseZone`, dto));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/WarehouseZone/${id}`);
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async getBins(id: string): Promise<Bin[]> {
    try {
      return this.unwrap<Bin[]>(await api.get(`${this.baseUrl}/WarehouseZone/${id}/bins`));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async createBin(id: string, dto: BinCreate): Promise<Bin> {
    try {
      return this.unwrap<Bin>(await api.post(`${this.baseUrl}/WarehouseZone/${id}/bins`, dto));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async getLayout(warehouseId: string): Promise<WarehouseLayout> {
    try {
      return this.unwrap<WarehouseLayout>(
        await api.get(`${this.baseUrl}/WarehouseZone/layout/${warehouseId}`)
      );
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }
}

export const zoneApi = new WarehouseZoneApi();
