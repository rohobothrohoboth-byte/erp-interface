// Types for the Inventory Reorder feature (rules/levels, alerts, requests).
// Reached through the gateway route `/inventory` -> `/inventory/v1/...`.

export interface ReorderRule {
  id: string;
  productId: string;
  productName?: string | null;
  warehouseId?: string | null;
  minLevel: number;
  maxLevel: number;
  reorderQuantity: number;
  isActive: boolean;
  dateAdd?: string;
  dateMod?: string | null;
}

export interface ReorderRuleCreate {
  productId: string;
  productName?: string | null;
  warehouseId?: string | null;
  minLevel: number;
  maxLevel: number;
  reorderQuantity: number;
  isActive?: boolean;
}

export interface ReorderRuleUpdate {
  id: string;
  productName?: string | null;
  warehouseId?: string | null;
  minLevel?: number;
  maxLevel?: number;
  reorderQuantity?: number;
  isActive?: boolean;
  rowVersion?: string | null;
}

export interface ReorderAlert {
  productId: string;
  productName?: string | null;
  warehouseId: string;
  quantityOnHand: number;
  reorderLevel: number;
  reorderQuantity: number;
}

export interface ReorderRequest {
  id: string;
  productId: string;
  productName?: string | null;
  warehouseId?: string | null;
  quantity: number;
  status: string;
  reason?: string | null;
  decidedByUserId?: string | null;
  decidedByName?: string | null;
  decisionNote?: string | null;
  decisionDate?: string | null;
  dateAdd?: string;
  dateMod?: string | null;
}

export interface ReorderRequestCreate {
  productId: string;
  productName?: string | null;
  warehouseId?: string | null;
  quantity: number;
  reason?: string | null;
}

export interface ReorderDecision {
  decidedByUserId?: string | null;
  decidedByName?: string | null;
  decisionNote?: string | null;
}

export interface ReorderRequestFilter {
  status?: string;
}
