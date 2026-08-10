export interface FixedAsset {
  id: string;
  asset_id: string;
  asset_name: string;
  category: string;
  department?: string;
  location?: string;
  vendor_name?: string;
  purchase_date: string;
  capitalization_date: string;
  cost: number;
  residual_value: number;
  useful_life_years: number;
  depreciation_method: 'STRAIGHT_LINE' | 'DECLINING_BALANCE';
  accumulated_depreciation: number;
  net_book_value: number;
  status: 'ACTIVE' | 'DISPOSED' | 'IMPAIRED' | 'TRANSFERRED';
  created_at: string;
  updated_at: string;
}

export interface DepreciationScheduleEntry {
  id: string;
  asset_id: string;
  period: string;
  opening_balance: number;
  depreciation_amount: number;
  accumulated_depreciation: number;
  closing_balance: number;
  date: string;
}

export interface AssetRevaluation {
  id: string;
  asset_id: string;
  revaluation_date: string;
  current_value: number;
  new_value: number;
  revaluation_amount: number;
  reason: string;
  created_by: string;
  created_at: string;
}

export interface AssetImpairment {
  id: string;
  asset_id: string;
  impairment_date: string;
  impairment_amount: number;
  reason: string;
  created_by: string;
  created_at: string;
}

export interface AssetTransfer {
  id: string;
  asset_id: string;
  from_department: string;
  to_department: string;
  transfer_date: string;
  reason: string;
  created_by: string;
  created_at: string;
}

export interface AssetDisposal {
  id: string;
  asset_id: string;
  disposal_date: string;
  disposal_method: 'SALE' | 'SCRAP' | 'DONATION' | 'TRADE_IN';
  sale_amount?: number;
  gain_loss_amount: number;
  notes?: string;
  created_by: string;
  created_at: string;
}

export interface DepreciationRun {
  id: string;
  run_date: string;
  period: string;
  asset_category?: string;
  total_assets: number;
  total_depreciation: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  created_by: string;
  created_at: string;
}