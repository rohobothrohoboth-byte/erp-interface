// Types for the Inventory Analytics feature (summary, movement, forecast).
// Reached through the gateway route `/inventory` -> `/inventory/v1/...`.

import type { ValuationReport } from '@/modules/inventory/types/valuation.types';

export interface StockSummary {
  productCount: number;
  totalOnHand: number;
  totalValue: number;
  lowStockCount: number;
}

export type StockValue = ValuationReport;

export interface MovementAnalysisItem {
  productId: string;
  productName?: string | null;
  totalQuantity: number;
  movementCount: number;
}

export interface MovementAnalysis {
  fastMovers: MovementAnalysisItem[];
  slowMovers: MovementAnalysisItem[];
}

export interface ForecastItem {
  productId: string;
  productName?: string | null;
  averageMonthlyOutbound: number;
  projectedNextMonthOutbound: number;
  currentOnHand: number;
  projectedEndOfMonthOnHand: number;
}

export interface Forecast {
  monthsAnalyzed: number;
  items: ForecastItem[];
}
