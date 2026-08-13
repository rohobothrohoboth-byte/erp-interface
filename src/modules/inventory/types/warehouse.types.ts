// Types for the Inventory Warehouse feature (Warehouse + StockLevel).
// Reached through the gateway route `/inventory` -> `/inventory/v1/...`.

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  location?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  zipCode?: string | null;
  phone?: string | null;
  email?: string | null;
  warehouseType?: string | null;
  status?: string | null;
  isActive: boolean;
  dateAdd?: string;
  dateMod?: string | null;
}

export interface WarehouseCreate {
  name: string;
  code: string;
  location?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  zipCode?: string | null;
  phone?: string | null;
  email?: string | null;
  warehouseType?: string | null;
  status?: string | null;
  isActive?: boolean;
}

export interface WarehouseUpdate extends Partial<WarehouseCreate> {
  id: string;
  rowVersion?: string | null;
}

export interface StockLevel {
  id: string;
  warehouseId: string;
  productId: string;
  productCode: string;
  productName: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  reorderLevel: number;
  reorderQuantity: number;
  lastReceivedDate?: string | null;
  lastIssuedDate?: string | null;
  averageCost?: number | null;
  lastUnitCost?: number | null;
  binLocation?: string | null;
  shelfNumber?: number | null;
  rackNumber?: number | null;
  dateAdd?: string;
  dateMod?: string | null;
}
