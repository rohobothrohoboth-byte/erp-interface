export type ProductStatus = 'Active' | 'Inactive' | 'Discontinued';
export type StockMovementType = 'IN' | 'OUT' | 'TRANSFER' | 'ADJUST' | 'COUNT';

export type Product = {
  id: string;
  sku: string;
  name: string;
  category: string;
  uom: string;
  qtyOnHand: number;
  reorderLevel: number;
  unitCost: number;
  warehouse: string;
  status: ProductStatus;
};

export type Warehouse = {
  id: string;
  code: string;
  name: string;
  location: string;
  zones: number;
  capacity: number;
  utilization: number;
  status: 'Active' | 'Inactive';
};

export type StockMovement = {
  id: string;
  type: StockMovementType;
  sku: string;
  productName: string;
  qty: number;
  warehouse: string;
  reference: string;
  date: string;
  status: 'Posted' | 'Draft' | 'Cancelled';
};
