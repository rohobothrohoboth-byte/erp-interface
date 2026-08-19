// Types for the Inventory Warehouse Zone feature (zones + bins + layout).
// Reached through the gateway route `/inventory` -> `/inventory/v1/...`.

export interface WarehouseZone {
  id: string;
  warehouseId: string;
  name: string;
  code?: string | null;
  zoneType?: string | null;
  description?: string | null;
  isActive: boolean;
  dateAdd?: string;
  dateMod?: string | null;
}

export interface WarehouseZoneCreate {
  warehouseId: string;
  name: string;
  code?: string | null;
  zoneType?: string | null;
  description?: string | null;
  isActive?: boolean;
}

export interface WarehouseZoneUpdate extends Partial<Omit<WarehouseZoneCreate, 'warehouseId'>> {
  id: string;
  rowVersion?: string | null;
}

export interface Bin {
  id: string;
  zoneId: string;
  code: string;
  description?: string | null;
  capacity?: number | null;
  isActive: boolean;
  dateAdd?: string;
  dateMod?: string | null;
}

export interface BinCreate {
  code: string;
  description?: string | null;
  capacity?: number | null;
  isActive?: boolean;
}

export interface WarehouseLayoutZone extends WarehouseZone {
  bins: Bin[];
}

export interface WarehouseLayout {
  warehouseId: string;
  zones: WarehouseLayoutZone[];
}

export interface WarehouseZoneFilter {
  warehouseId?: string;
}
