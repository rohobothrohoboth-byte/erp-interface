// Types for the Inventory Valuation feature (method + report).
// Reached through the gateway route `/inventory` -> `/inventory/v1/...`.

export type ValuationMethodValue = 'AVG' | 'FIFO' | 'LIFO' | string;

export interface ValuationMethod {
  method: ValuationMethodValue;
}

export interface ValuationReportLine {
  productId: string;
  productName?: string | null;
  warehouseId: string;
  quantityOnHand: number;
  averageCost: number;
  value: number;
}

export interface ValuationReport {
  method: ValuationMethodValue;
  warehouseId?: string | null;
  lines: ValuationReportLine[];
  totalQuantity: number;
  totalValue: number;
}

export interface ValuationReportFilter {
  warehouseId?: string;
}
