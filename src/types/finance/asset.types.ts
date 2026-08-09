// types/finance/asset.types.ts

export interface Asset {
    id: string;
    name: string;
    code: string;
    description: string | null;
    serialNumber: string | null;
    model: string | null;
    manufacturer: string | null;
    location: string | null;
    acquisitionCost: number;
    acquisitionDate: string;
    salvageValue: number | null;
    usefulLife: number | null;
    depreciationRate: number | null;
    assetType: string | null;
    assetCategory: string | null;
    status: string;
    isActive: boolean;
    assignedTo: string | null;
    assignedToName?: string | null;
    departmentId: string | null;
    departmentName?: string | null;
    branchId: string | null;
    branchName?: string | null;
    accountId: string | null;
    accountCode?: string | null;
    accountName?: string | null;
    purchaseDate: string | null;
    currentValue: number | null;
    accumulatedDepreciation: number | null;
    lastDepreciationDate: string | null;
    warrantyInfo: string | null;
    warrantyExpiryDate: string | null;
    notes: string | null;
    dateAdd: string;
    dateMod: string | null;
    rowVersion: string | null;
    isDeleted: boolean;
    periodId: string | null;
    createdByUserId: string | null;
    createdByUserName: string | null;
    updatedByUserId: string | null;
    updatedByUserName: string | null;
}

export interface AssetWithCalculations extends Asset {
    netBookValue: number;
    accumulatedDepreciationValue: number;
    depreciationPercent: number;
    ageInMonths: number;
    remainingUsefulLife: number;
    annualDepreciation: number;
    monthlyDepreciation: number;
    depreciationRate: number;
    currentValue: number;
    ageInYears: number;
    isFullyDepreciated: boolean;
    isUnderMaintenance: boolean;
    isDisposed: boolean;
}

export interface AssetPortfolioSummary {
    totalAssets: number;
    totalCost: number;
    totalDepreciation: number;
    totalNetBookValue: number;
    activeAssets: number;
    disposedAssets: number;
    underMaintenance: number;
    idleAssets?: number;
    byCategory: Record<string, number>;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    depreciationRate: number;
    averageAgeInMonths: number;
    oldestAssetAge: number;
    newestAssetAge: number;
    highestValueAsset: Asset | null;
    lowestValueAsset: Asset | null;
    mostDepreciatedAsset: Asset | null;
    leastDepreciatedAsset: Asset | null;
}

export interface CreateAssetDto {
    name: string;
    code?: string;
    description?: string | null;
    serialNumber?: string | null;
    model?: string | null;
    manufacturer?: string | null;
    location?: string | null;
    acquisitionCost: number;
    acquisitionDate: string;
    salvageValue?: number | null;
    usefulLife?: number | null;
    depreciationRate?: number | null;
    assetType?: string | null;
    assetCategory?: string | null;
    status?: string;
    assignedTo?: string | null;
    departmentId?: string | null;
    branchId?: string | null;
    accountId?: string | null;
    purchaseDate?: string | null;
    warrantyInfo?: string | null;
    warrantyExpiryDate?: string | null;
    notes?: string | null;
}

export interface UpdateAssetDto extends CreateAssetDto {
    id: string;
    isActive?: boolean;
    currentValue?: number | null;
    accumulatedDepreciation?: number | null;
    lastDepreciationDate?: string | null;
}