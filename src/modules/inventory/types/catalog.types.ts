// Types for the Inventory catalog (Category / Unit / Product).
// Reached through the gateway route `/inventory` -> `/inventory/v1/...`.

export interface Category {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  parentId?: string | null;
  isActive: boolean;
}

export interface CategoryCreate {
  name: string;
  code?: string | null;
  description?: string | null;
  parentId?: string | null;
  isActive: boolean;
}

export interface CategoryUpdate extends CategoryCreate {
  id: string;
}

export interface Unit {
  id: string;
  name: string;
  symbol: string;
  description?: string | null;
  isActive: boolean;
}

export interface UnitCreate {
  name: string;
  symbol: string;
  description?: string | null;
  isActive: boolean;
}

export interface UnitUpdate extends UnitCreate {
  id: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string | null;
  categoryId: string;
  unitId: string;
  unitPrice: number;
  reorderLevel?: number | null;
  barcode?: string | null;
  isActive: boolean;
}

export interface ProductCreate {
  sku: string;
  name: string;
  description?: string | null;
  categoryId: string;
  unitId: string;
  unitPrice: number;
  reorderLevel?: number | null;
  barcode?: string | null;
  isActive: boolean;
}

export interface ProductUpdate extends ProductCreate {
  id: string;
}
