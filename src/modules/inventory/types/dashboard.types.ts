// Types for the Inventory Dashboard feature.
// Reached through the gateway route `/inventory` -> `/inventory/v1/...`.

import type { StockMovement } from '@/modules/inventory/types/stock.types';

export interface DashboardStats {
  productCount: number;
  warehouseCount: number;
  totalStockValue: number;
  lowStockCount: number;
  recentMovements: StockMovement[];
}
