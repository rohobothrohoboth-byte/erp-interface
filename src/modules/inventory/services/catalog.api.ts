// Inventory catalog API clients. Talks to the Inventory microservice through the
// gateway route `/inventory` (YARP transforms it to `.../inventory/v1/...`).

import { api } from '@/shared/services/api';
import type {
  Category,
  CategoryCreate,
  CategoryUpdate,
  Unit,
  UnitCreate,
  UnitUpdate,
  Product,
  ProductCreate,
  ProductUpdate,
} from '@/modules/inventory/types/catalog.types';

const GATEWAY = import.meta.env.VITE_GATEWAY_URL || 'http://192.168.1.7:5000';

class CategoryApi {
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

  async getAll(): Promise<Category[]> {
    try {
      return this.unwrap<Category[]>(await api.get(`${this.baseUrl}/Category`));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async getById(id: string): Promise<Category> {
    try {
      return this.unwrap<Category>(await api.get(`${this.baseUrl}/Category/${id}`));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async create(dto: CategoryCreate): Promise<Category> {
    try {
      return this.unwrap<Category>(await api.post(`${this.baseUrl}/Category`, dto));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async update(dto: CategoryUpdate): Promise<Category> {
    try {
      return this.unwrap<Category>(await api.put(`${this.baseUrl}/Category`, dto));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/Category/${id}`);
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }
}

class UnitApi {
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

  async getAll(): Promise<Unit[]> {
    try {
      return this.unwrap<Unit[]>(await api.get(`${this.baseUrl}/Unit`));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async getById(id: string): Promise<Unit> {
    try {
      return this.unwrap<Unit>(await api.get(`${this.baseUrl}/Unit/${id}`));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async create(dto: UnitCreate): Promise<Unit> {
    try {
      return this.unwrap<Unit>(await api.post(`${this.baseUrl}/Unit`, dto));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async update(dto: UnitUpdate): Promise<Unit> {
    try {
      return this.unwrap<Unit>(await api.put(`${this.baseUrl}/Unit`, dto));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/Unit/${id}`);
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }
}

class ProductApi {
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

  async getAll(): Promise<Product[]> {
    try {
      return this.unwrap<Product[]>(await api.get(`${this.baseUrl}/Product`));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async getById(id: string): Promise<Product> {
    try {
      return this.unwrap<Product>(await api.get(`${this.baseUrl}/Product/${id}`));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async create(dto: ProductCreate): Promise<Product> {
    try {
      return this.unwrap<Product>(await api.post(`${this.baseUrl}/Product`, dto));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async update(dto: ProductUpdate): Promise<Product> {
    try {
      return this.unwrap<Product>(await api.put(`${this.baseUrl}/Product`, dto));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/Product/${id}`);
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }
}

export const categoryApi = new CategoryApi();
export const unitApi = new UnitApi();
export const productApi = new ProductApi();
