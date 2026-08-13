// Types for the Inventory Barcode feature.
// Reached through the gateway route `/inventory` -> `/inventory/v1/...`.

export interface BarcodeProduct {
  productId: string;
  sku: string;
  name: string;
  barcode?: string | null;
}

export interface GenerateBarcode {
  barcode?: string | null;
}
