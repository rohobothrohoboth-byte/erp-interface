export interface AssetPendingCapitalization {
  id: string;
  asset_reference_id: string;
  asset_name: string;
  vendor_name: string;
  invoice_number: string;
  purchase_cost: number;
  purchase_date: string;
  status: 'PENDING_CAPITALIZATION';
  description?: string;
  created_at: string;
}

export interface CapitalizeAssetDTO {
  asset_reference_id: string;
  capitalization_date: string;
  asset_category_id: string;
  asset_category_name?: string;
  asset_account_id: string;
  asset_account_name?: string;
  depreciation_method: 'STRAIGHT_LINE' | 'DECLINING_BALANCE';
  useful_life_years: number;
  residual_value: number;
}

export interface AssetCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface CapitalizedAsset {
  id: string;
  asset_id: string;
  asset_tag: string;
  asset_name: string;
  asset_category: string;
  purchase_cost: number;
  capitalization_date: string;
  depreciation_method: string;
  useful_life_years: number;
  residual_value: number;
  accumulated_depreciation: number;
  net_book_value: number;
  status: 'ACTIVE' | 'DISPOSED' | 'IMPAIRED';
  created_at: string;
  created_by: string;
}
