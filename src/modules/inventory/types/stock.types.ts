// Types for the Inventory Stock feature (movements + stock counts).
// Reached through the gateway route `/inventory` -> `/inventory/v1/...`.

export interface StockMovement {
  id: string;
  type: string;
  productId: string;
  productName?: string | null;
  warehouseId: string;
  toWarehouseId?: string | null;
  quantity: number;
  unitCost?: number | null;
  reference?: string | null;
  reason?: string | null;
  notes?: string | null;
  status: string;
  movementDate: string;
  dateAdd?: string;
  dateMod?: string | null;
}

export interface StockMovementFilter {
  type?: string;
  warehouseId?: string;
}

export interface StockLevelFilter {
  warehouseId?: string;
}

// Base body for inbound / outbound movements.
export interface StockMovementRequest {
  productId: string;
  warehouseId: string;
  quantity: number;
  unitCost?: number | null;
  reference?: string | null;
  reason?: string | null;
  notes?: string | null;
}

export interface StockTransferRequest extends StockMovementRequest {
  toWarehouseId: string;
}

export interface StockAdjustmentRequest extends StockMovementRequest {
  isDelta?: boolean;
}

export interface StockCountLine {
  id: string;
  stockCountId: string;
  productId: string;
  productName?: string | null;
  systemQuantity: number;
  countedQuantity: number;
  variance: number;
}

export interface StockCount {
  id: string;
  warehouseId: string;
  warehouseName?: string | null;
  status: string;
  scheduledDate?: string | null;
  notes?: string | null;
  dateAdd?: string;
  dateMod?: string | null;
  lines: StockCountLine[];
}

export interface StockCountCreate {
  warehouseId: string;
  scheduledDate?: string | null;
  notes?: string | null;
}

// The backend records count lines keyed by PRODUCT, so line updates carry the
// productId (not the line id).
export interface StockCountLineUpdate {
  productId: string;
  countedQuantity: number;
}

export interface StockCountLinesUpdate {
  lines: StockCountLineUpdate[];
}
