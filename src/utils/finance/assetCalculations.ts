// utils/finance/assetCalculations.ts

import { Asset, AssetWithCalculations, AssetPortfolioSummary } from '../../types/finance/asset.types';

/**
 * Calculate individual asset metrics
 * @param asset - Raw asset data from API
 * @returns Asset with calculated metrics
 */
export const calculateAssetMetrics = (asset: Asset): AssetWithCalculations => {
    const acquisitionCost = asset.acquisitionCost || 0;
    const accumulatedDep = asset.accumulatedDepreciation || 0;
    const salvageValue = asset.salvageValue || 0;
    const netBookValue = Math.max(0, acquisitionCost - accumulatedDep);

    // ✅ Calculate depreciation percentage
    const depreciationPercent = acquisitionCost > 0
        ? (accumulatedDep / acquisitionCost) * 100
        : 0;

    // ✅ Calculate age in months from acquisition date
    const acquisitionDate = new Date(asset.acquisitionDate);
    const now = new Date();
    const ageInMonths = (now.getFullYear() - acquisitionDate.getFullYear()) * 12 +
        (now.getMonth() - acquisitionDate.getMonth());

    // ✅ Calculate remaining useful life
    const usefulLife = asset.usefulLife || 0;
    const remainingUsefulLife = Math.max(0, usefulLife - ageInMonths);

    // ✅ Calculate annual depreciation
    const annualDepreciation = usefulLife > 0
        ? (acquisitionCost - salvageValue) / (usefulLife / 12)
        : 0;

    // ✅ Calculate monthly depreciation
    const monthlyDepreciation = usefulLife > 0
        ? (acquisitionCost - salvageValue) / usefulLife
        : 0;

    // ✅ Calculate depreciation rate (annual percentage)
    const depreciationRate = acquisitionCost > 0 && usefulLife > 0
        ? ((acquisitionCost - salvageValue) / acquisitionCost) / (usefulLife / 12) * 100
        : 0;

    return {
        ...asset,
        netBookValue,
        accumulatedDepreciationValue: accumulatedDep,
        depreciationPercent,
        ageInMonths,
        remainingUsefulLife,
        annualDepreciation,
        monthlyDepreciation,
        depreciationRate,
        // ✅ Current value (if not provided, use net book value)
        currentValue: asset.currentValue ?? netBookValue,
        // ✅ Asset age in years
        ageInYears: ageInMonths / 12,
        // ✅ Is fully depreciated
        isFullyDepreciated: netBookValue <= 0,
        // ✅ Is under maintenance
        isUnderMaintenance: asset.status === 'Under Maintenance' || asset.status === 'Maintenance',
        // ✅ Is disposed
        isDisposed: asset.status === 'Disposed' || asset.isActive === false,
    };
};

/**
 * Calculate portfolio summary
 * @param assets - Array of assets
 * @returns Portfolio summary statistics
 */
export const calculateAssetPortfolioSummary = (assets: Asset[]): AssetPortfolioSummary => {
    if (!assets || assets.length === 0) {
        return {
            totalAssets: 0,
            totalCost: 0,
            totalDepreciation: 0,
            totalNetBookValue: 0,
            activeAssets: 0,
            disposedAssets: 0,
            underMaintenance: 0,
            byCategory: {},
            byType: {},
            byStatus: {},
            depreciationRate: 0,
            averageAgeInMonths: 0,
            oldestAssetAge: 0,
            newestAssetAge: 0,
            highestValueAsset: null,
            lowestValueAsset: null,
            mostDepreciatedAsset: null,
            leastDepreciatedAsset: null,
        };
    }

    // ✅ Calculate base metrics
    const totalAssets = assets.length;
    const totalCost = assets.reduce((sum, a) => sum + (a.acquisitionCost || 0), 0);
    const totalDepreciation = assets.reduce((sum, a) => sum + (a.accumulatedDepreciation || 0), 0);
    const totalNetBookValue = totalCost - totalDepreciation;

    // ✅ Status counts
    const activeAssets = assets.filter(a => a.status === 'Active' && a.isActive !== false).length;
    const disposedAssets = assets.filter(a => a.status === 'Disposed' || a.isActive === false).length;
    const underMaintenance = assets.filter(a => a.status === 'Under Maintenance' || a.status === 'Maintenance').length;
    const idleAssets = assets.filter(a => a.status === 'Idle').length;

    // ✅ Group by category
    const byCategory = assets.reduce((acc, a) => {
        const category = a.assetCategory || 'Other';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // ✅ Group by type
    const byType = assets.reduce((acc, a) => {
        const type = a.assetType || 'Other';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // ✅ Group by status
    const byStatus = assets.reduce((acc, a) => {
        const status = a.status || 'Unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // ✅ Age calculations
    const now = new Date();
    const assetAges = assets.map(a => {
        const acquisitionDate = new Date(a.acquisitionDate);
        return (now.getFullYear() - acquisitionDate.getFullYear()) * 12 +
            (now.getMonth() - acquisitionDate.getMonth());
    });

    const averageAgeInMonths = assetAges.length > 0
        ? assetAges.reduce((sum, age) => sum + age, 0) / assetAges.length
        : 0;

    const oldestAssetAge = Math.max(...assetAges, 0);
    const newestAssetAge = Math.min(...assetAges, 0);

    // ✅ Find highest and lowest value assets
    const assetsWithValue = assets.filter(a => (a.acquisitionCost || 0) > 0);
    const sortedByCost = [...assetsWithValue].sort((a, b) => (b.acquisitionCost || 0) - (a.acquisitionCost || 0));
    const sortedByNetBook = [...assetsWithValue].sort((a, b) => {
        const nbvA = (a.acquisitionCost || 0) - (a.accumulatedDepreciation || 0);
        const nbvB = (b.acquisitionCost || 0) - (b.accumulatedDepreciation || 0);
        return nbvB - nbvA;
    });

    // ✅ Most and least depreciated
    const sortedByDepreciationPercent = [...assetsWithValue]
        .filter(a => (a.acquisitionCost || 0) > 0)
        .sort((a, b) => {
            const depA = ((a.accumulatedDepreciation || 0) / (a.acquisitionCost || 1)) * 100;
            const depB = ((b.accumulatedDepreciation || 0) / (b.acquisitionCost || 1)) * 100;
            return depB - depA;
        });

    return {
        totalAssets,
        totalCost: Math.round(totalCost * 100) / 100,
        totalDepreciation: Math.round(totalDepreciation * 100) / 100,
        totalNetBookValue: Math.round(totalNetBookValue * 100) / 100,
        activeAssets,
        disposedAssets,
        underMaintenance,
        idleAssets,
        byCategory,
        byType,
        byStatus,
        depreciationRate: totalCost > 0 ? (totalDepreciation / totalCost) * 100 : 0,
        averageAgeInMonths: Math.round(averageAgeInMonths),
        oldestAssetAge: Math.round(oldestAssetAge),
        newestAssetAge: Math.round(newestAssetAge),
        highestValueAsset: sortedByCost.length > 0 ? sortedByCost[0] : null,
        lowestValueAsset: sortedByCost.length > 0 ? sortedByCost[sortedByCost.length - 1] : null,
        mostDepreciatedAsset: sortedByDepreciationPercent.length > 0 ? sortedByDepreciationPercent[0] : null,
        leastDepreciatedAsset: sortedByDepreciationPercent.length > 0 ? sortedByDepreciationPercent[sortedByDepreciationPercent.length - 1] : null,
    };
};

/**
 * Calculate depreciation for a specific period
 * @param asset - Asset to calculate depreciation for
 * @param months - Number of months to depreciate
 * @returns Depreciation calculation result
 */
export const calculateDepreciationForPeriod = (
    asset: Asset,
    months: number = 1
): {
    monthlyDepreciation: number;
    totalDepreciation: number;
    newAccumulatedDepreciation: number;
    newNetBookValue: number;
    isFullyDepreciated: boolean;
} => {
    const acquisitionCost = asset.acquisitionCost || 0;
    const salvageValue = asset.salvageValue || 0;
    const usefulLifeMonths = asset.usefulLife || 36;
    const currentAccumulated = asset.accumulatedDepreciation || 0;

    // ✅ Calculate monthly depreciation
    const monthlyDepreciation = usefulLifeMonths > 0
        ? (acquisitionCost - salvageValue) / usefulLifeMonths
        : 0;

    const totalDepreciation = monthlyDepreciation * months;
    const newAccumulated = currentAccumulated + totalDepreciation;
    const newNetBookValue = Math.max(0, acquisitionCost - newAccumulated);
    const isFullyDepreciated = newNetBookValue <= 0 || newAccumulated >= acquisitionCost;

    return {
        monthlyDepreciation: Math.round(monthlyDepreciation * 100) / 100,
        totalDepreciation: Math.round(totalDepreciation * 100) / 100,
        newAccumulatedDepreciation: Math.round(Math.min(newAccumulated, acquisitionCost) * 100) / 100,
        newNetBookValue: Math.round(newNetBookValue * 100) / 100,
        isFullyDepreciated,
    };
};

/**
 * Format currency
 * @param amount - Number to format
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount || 0);
};

/**
 * Format date
 * @param dateString - Date string to format
 * @returns Formatted date string
 */
export const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

/**
 * Get status color for badge
 * @param status - Asset status
 * @param isActive - Is asset active
 * @returns CSS classes for status badge
 */
export const getStatusColor = (status: string, isActive: boolean): string => {
    if (!isActive || status === 'Disposed') {
        return 'bg-red-100 text-red-700 border-red-200';
    }

    const colors: Record<string, string> = {
        Active: 'bg-green-100 text-green-700 border-green-200',
        'In Use': 'bg-blue-100 text-blue-700 border-blue-200',
        'Under Maintenance': 'bg-orange-100 text-orange-700 border-orange-200',
        Maintenance: 'bg-orange-100 text-orange-700 border-orange-200',
        Idle: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
};

/**
 * Get status icon for asset
 * @param status - Asset status
 * @param isActive - Is asset active
 * @returns React component or null
 */
export const getStatusIcon = (status: string, isActive: boolean): string => {
    if (!isActive || status === 'Disposed') return 'Trash2';

    const icons: Record<string, string> = {
        Active: 'CheckCircle',
        'In Use': 'CheckCircle',
        'Under Maintenance': 'AlertCircle',
        Maintenance: 'AlertCircle',
        Idle: 'Clock',
    };
    return icons[status] || 'Package';
};

/**
 * Get asset category icon
 * @param category - Asset category
 * @returns Icon name
 */
export const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
        'IT Equipment': 'Laptop',
        'Furniture': 'Sofa',
        'Vehicle': 'Car',
        'Software': 'Code',
        'Office Equipment': 'Printer',
        'Building': 'Building2',
        'Land': 'Landmark',
        'Machinery': 'Settings',
        'Equipment': 'Wrench',
        'Other': 'Package',
    };
    return icons[category] || 'Package';
};

/**
 * Get asset type icon
 * @param type - Asset type
 * @returns Icon name
 */
export const getTypeIcon = (type: string): string => {
    const icons: Record<string, string> = {
        Fixed: 'Building',
        Current: 'DollarSign',
        Intangible: 'Shield',
    };
    return icons[type] || 'Package';
};

/**
 * Calculate asset health score (0-100)
 * @param asset - Asset to evaluate
 * @returns Health score
 */
export const calculateAssetHealthScore = (asset: Asset): number => {
    let score = 0;

    // ✅ Active status (30 points)
    if (asset.isActive && asset.status !== 'Disposed') {
        score += 30;
    }

    // ✅ Net book value (20 points)
    const netBookValue = (asset.acquisitionCost || 0) - (asset.accumulatedDepreciation || 0);
    if (netBookValue > 0) {
        score += 20;
    }

    // ✅ Depreciation rate (20 points)
    const depreciationRate = asset.acquisitionCost && asset.acquisitionCost > 0
        ? ((asset.accumulatedDepreciation || 0) / asset.acquisitionCost) * 100
        : 0;
    if (depreciationRate < 50) {
        score += 20;
    } else if (depreciationRate < 80) {
        score += 10;
    }

    // ✅ Warranty (15 points)
    if (asset.warrantyExpiryDate) {
        const expiryDate = new Date(asset.warrantyExpiryDate);
        if (expiryDate > new Date()) {
            score += 15;
        }
    }

    // ✅ Location (15 points)
    if (asset.location) {
        score += 15;
    }

    return Math.min(100, score);
};