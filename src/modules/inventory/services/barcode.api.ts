// Inventory barcode API client. Talks to the Inventory microservice through the
// gateway route `/inventory` (YARP transforms it to `.../inventory/v1/...`).

import { api } from '@/shared/services/api';
import type {
  BarcodeProduct,
  GenerateBarcode,
} from '@/modules/inventory/types/barcode.types';

const GATEWAY = import.meta.env.VITE_GATEWAY_URL || 'http://192.168.1.7:5000';

class BarcodeApi {
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

  async getAll(): Promise<BarcodeProduct[]> {
    try {
      return this.unwrap<BarcodeProduct[]>(await api.get(`${this.baseUrl}/Barcode`));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async generate(productId: string, dto: GenerateBarcode = {}): Promise<BarcodeProduct> {
    try {
      return this.unwrap<BarcodeProduct>(
        await api.post(`${this.baseUrl}/Barcode/generate/${productId}`, dto)
      );
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async scan(barcode: string): Promise<BarcodeProduct> {
    try {
      return this.unwrap<BarcodeProduct>(
        await api.get(`${this.baseUrl}/Barcode/scan/${encodeURIComponent(barcode)}`)
      );
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }
}

export const barcodeApi = new BarcodeApi();
