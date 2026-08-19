import type { Product, StockMovement, Warehouse } from '@/modules/inventory/types/inventory.types';

const products: Product[] = [
  { id: 'p1', sku: 'RM-1001', name: 'Portland Cement 50kg', category: 'Raw Material', uom: 'BAG', qtyOnHand: 1240, reorderLevel: 300, unitCost: 18.5, warehouse: 'WH-ADDIS-01', status: 'Active' },
  { id: 'p2', sku: 'FG-2204', name: 'Ceramic Floor Tile 60x60', category: 'Finished Goods', uom: 'BOX', qtyOnHand: 86, reorderLevel: 120, unitCost: 42, warehouse: 'WH-ADDIS-01', status: 'Active' },
  { id: 'p3', sku: 'SP-3310', name: 'Hydraulic Pump Seal Kit', category: 'Spare Parts', uom: 'SET', qtyOnHand: 24, reorderLevel: 40, unitCost: 75, warehouse: 'WH-MEK-02', status: 'Active' },
  { id: 'p4', sku: 'CO-4402', name: 'Copper Cable 2.5mm', category: 'Consumables', uom: 'M', qtyOnHand: 3500, reorderLevel: 1000, unitCost: 1.2, warehouse: 'WH-ADDIS-01', status: 'Active' },
  { id: 'p5', sku: 'FG-1188', name: 'Office Desk Modular', category: 'Finished Goods', uom: 'PCS', qtyOnHand: 12, reorderLevel: 8, unitCost: 210, warehouse: 'WH-AA-OUT', status: 'Inactive' },
];

const warehouses: Warehouse[] = [
  { id: 'w1', code: 'WH-ADDIS-01', name: 'Addis Central Warehouse', location: 'Addis Ababa', zones: 6, capacity: 10000, utilization: 72, status: 'Active' },
  { id: 'w2', code: 'WH-MEK-02', name: 'Mekelle Spare Depot', location: 'Mekelle', zones: 3, capacity: 2500, utilization: 58, status: 'Active' },
  { id: 'w3', code: 'WH-AA-OUT', name: 'Outbound Staging', location: 'Addis Ababa', zones: 2, capacity: 1200, utilization: 41, status: 'Active' },
];

const movements: StockMovement[] = [
  { id: 'm1', type: 'IN', sku: 'RM-1001', productName: 'Portland Cement 50kg', qty: 500, warehouse: 'WH-ADDIS-01', reference: 'GRN-1042', date: '2026-08-08', status: 'Posted' },
  { id: 'm2', type: 'OUT', sku: 'FG-2204', productName: 'Ceramic Floor Tile 60x60', qty: 40, warehouse: 'WH-ADDIS-01', reference: 'SO-8891', date: '2026-08-08', status: 'Posted' },
  { id: 'm3', type: 'TRANSFER', sku: 'SP-3310', productName: 'Hydraulic Pump Seal Kit', qty: 10, warehouse: 'WH-MEK-02', reference: 'TR-221', date: '2026-08-07', status: 'Posted' },
  { id: 'm4', type: 'ADJUST', sku: 'CO-4402', productName: 'Copper Cable 2.5mm', qty: -25, warehouse: 'WH-ADDIS-01', reference: 'ADJ-77', date: '2026-08-06', status: 'Draft' },
  { id: 'm5', type: 'COUNT', sku: 'FG-1188', productName: 'Office Desk Modular', qty: 12, warehouse: 'WH-AA-OUT', reference: 'CNT-19', date: '2026-08-05', status: 'Posted' },
];

const delay = <T,>(data: T, ms = 250) => new Promise<T>((resolve) => setTimeout(() => resolve(structuredClone(data)), ms));

export const inventoryApi = {
  getProducts: () => delay(products),
  getWarehouses: () => delay(warehouses),
  getMovements: () => delay(movements),
  getCategories: () => delay([
    { id: 'c1', name: 'Raw Material', products: 42, status: 'Active' },
    { id: 'c2', name: 'Finished Goods', products: 31, status: 'Active' },
    { id: 'c3', name: 'Spare Parts', products: 58, status: 'Active' },
    { id: 'c4', name: 'Consumables', products: 77, status: 'Active' },
  ]),
  getUnits: () => delay([
    { id: 'u1', code: 'PCS', name: 'Pieces', decimals: 0 },
    { id: 'u2', code: 'BAG', name: 'Bag', decimals: 0 },
    { id: 'u3', code: 'BOX', name: 'Box', decimals: 0 },
    { id: 'u4', code: 'M', name: 'Meter', decimals: 2 },
    { id: 'u5', code: 'SET', name: 'Set', decimals: 0 },
  ]),
};
