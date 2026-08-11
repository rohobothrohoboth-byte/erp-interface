// Inventory stock API clients. Talks to the Inventory microservice through the
// gateway route `/inventory` (YARP transforms it to `.../inventory/v1/...`).
// Covers stock movements/levels (StockController) and stock counts (StockCountController).

import { api } from '@/shared/services/api';
import type {
  StockMovement,
  StockMovementFilter,
  StockLevelFilter,
  StockMovementRequest,
  StockTransferRequest,
  StockAdjustmentRequest,
  StockCount,
  StockCountCreate,
  StockCountLinesUpdate,
} from '@/modules/inventory/types/stock.types';
import type { StockLevel } from '@/modules/inventory/types/warehouse.types';

const GATEWAY = import.meta.env.VITE_GATEWAY_URL || 'http://192.168.1.7:5000';

class StockApi {
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

  async getMovements(params: StockMovementFilter = {}): Promise<StockMovement[]> {
    try {
      return this.unwrap<StockMovement[]>(
        await api.get(`${this.baseUrl}/Stock/movements`, { params })
      );
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async getLevels(params: StockLevelFilter = {}): Promise<StockLevel[]> {
    try {
      return this.unwrap<StockLevel[]>(
        await api.get(`${this.baseUrl}/Stock/levels`, { params })
      );
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async inbound(dto: StockMovementRequest): Promise<StockMovement> {
    try {
      return this.unwrap<StockMovement>(await api.post(`${this.baseUrl}/Stock/inbound`, dto));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async outbound(dto: StockMovementRequest): Promise<StockMovement> {
    try {
      return this.unwrap<StockMovement>(await api.post(`${this.baseUrl}/Stock/outbound`, dto));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async transfer(dto: StockTransferRequest): Promise<StockMovement> {
    try {
      return this.unwrap<StockMovement>(await api.post(`${this.baseUrl}/Stock/transfer`, dto));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async adjustment(dto: StockAdjustmentRequest): Promise<StockMovement> {
    try {
      return this.unwrap<StockMovement>(await api.post(`${this.baseUrl}/Stock/adjustment`, dto));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }
}

class StockCountApi {
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

  async getAll(): Promise<StockCount[]> {
    try {
      return this.unwrap<StockCount[]>(await api.get(`${this.baseUrl}/StockCount`));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async getById(id: string): Promise<StockCount> {
    try {
      return this.unwrap<StockCount>(await api.get(`${this.baseUrl}/StockCount/${id}`));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async create(dto: StockCountCreate): Promise<StockCount> {
    try {
      return this.unwrap<StockCount>(await api.post(`${this.baseUrl}/StockCount`, dto));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async recordLines(id: string, dto: StockCountLinesUpdate): Promise<StockCount> {
    try {
      return this.unwrap<StockCount>(
        await api.put(`${this.baseUrl}/StockCount/${id}/lines`, dto)
      );
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async reconcile(id: string): Promise<StockCount> {
    try {
      return this.unwrap<StockCount>(
        await api.post(`${this.baseUrl}/StockCount/${id}/reconcile`)
      );
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }
}

export const stockApi = new StockApi();
export const stockCountApi = new StockCountApi();
