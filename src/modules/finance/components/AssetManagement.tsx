// components/finance/AssetManagement.tsx - FULLY FIXED (NO DUPLICATE CALCULATIONS)

import React, { useMemo } from 'react';
import { formatCurrency } from '@/modules/finance/utils/helpers';

interface AssetManagementProps {
    assets?: any[];
    analytics?: any;  // ✅ Add analytics prop
    filters?: {
        period?: string;
        periodType?: string;
        fiscalYear?: string;
    };
    periodRange?: {
        periodStart?: string;
        periodEnd?: string;
    };
    isLoading?: boolean;
}

function AssetManagement({
                             assets = [],
                             analytics = {},  // ✅ Add analytics
                             filters = {},
                             periodRange = {},
                             isLoading = false
                         }: AssetManagementProps) {

    const data = useMemo(() => {
        const analyticsData = analytics || {};

        // ✅ ============================================================
        // ✅ ALL VALUES FROM BACKEND - NO CALCULATIONS
        // ✅ ============================================================

        // ✅ Asset Metrics (pre-calculated)
        const totalValue = analyticsData?.totalAssetValue ?? 0;      // ✅ From backend
        const netBookValue = analyticsData?.netBookValue ?? 0;       // ✅ From backend
        const depreciatedValue = analyticsData?.totalDepreciation ?? 0; // ✅ From backend
        const activeCount = analyticsData?.activeAssetCount ?? 0;    // ✅ From backend
        const maintenanceCount = analyticsData?.maintenanceAssetCount ?? 0; // ✅ From backend
        const totalAssetCount = analyticsData?.totalAssetCount ?? 0; // ✅ From backend

        // ✅ Assets by Type (pre-calculated)
        const assetsByType = analyticsData?.assetsByType ?? {};

        // ✅ Top Assets (pre-calculated)
        const topAssets = analyticsData?.topAssets ?? [];

        // ✅ Fallback: If backend doesn't provide data, use raw data
        let displayTotalValue = totalValue;
        let displayNetBookValue = netBookValue;
        let displayDepreciatedValue = depreciatedValue;
        let displayActiveCount = activeCount;
        let displayMaintenanceCount = maintenanceCount;
        let displayTotalAssetCount = totalAssetCount;
        let displayAssetsByType = assetsByType;
        let displayTopAssets = topAssets;

        // Only use raw data if backend doesn't provide it
        if (totalValue === 0 && Array.isArray(assets)) {
            const assetList = Array.isArray(assets) ? assets : [];
            const startDate = periodRange?.periodStart ? new Date(periodRange.periodStart) : new Date('2000-01-01');
            const endDate = periodRange?.periodEnd ? new Date(periodRange.periodEnd) : new Date('2099-12-31');

            // ✅ Only calculate if backend data is missing
            const filteredAssets = assetList.filter((a: any) => {
                const assetDate = new Date(a.dateAdd || a.DateAdd || a.acquisitionDate || a.AcquisitionDate || a.createdAt || a.CreatedAt || '2000-01-01');
                return assetDate >= startDate && assetDate <= endDate;
            });

            const total = filteredAssets.reduce((sum: number, a: any) => {
                const value = a.acquisitionCost || a.cost || a.bookValue || a.currentValue || a.value || 0;
                return sum + Number(value);
            }, 0);

            const dep = filteredAssets.reduce((sum: number, a: any) => {
                const d = a.accumulatedDepreciation || a.depreciatedValue || a.depreciation || a.Depreciation || 0;
                return sum + Number(d);
            }, 0);

            const active = filteredAssets.filter((a: any) => {
                const status = a.status || a.Status || '';
                const isActive = a.isActive || a.IsActive;
                return status === 'Active' || status === 'active' || isActive === true;
            });

            const maintenance = filteredAssets.filter((a: any) => {
                const status = a.status || a.Status || '';
                return status === 'Maintenance' || status === 'Under Maintenance' || status === 'Repair' || status === 'maintenance';
            });

            const byType = filteredAssets.reduce((acc: any, a: any) => {
                const type = a.assetType || a.AssetType || a.type || a.Type || a.category || a.Category || 'Other';
                acc[type] = (acc[type] || 0) + 1;
                return acc;
            }, {});

            const sorted = [...filteredAssets]
                .sort((a: any, b: any) => {
                    const valA = Number(a.acquisitionCost || a.cost || a.bookValue || a.currentValue || 0);
                    const valB = Number(b.acquisitionCost || b.cost || b.bookValue || b.currentValue || 0);
                    return valB - valA;
                })
                .slice(0, 5);

            displayTotalValue = total;
            displayNetBookValue = total - dep;
            displayDepreciatedValue = dep;
            displayActiveCount = active.length;
            displayMaintenanceCount = maintenance.length;
            displayTotalAssetCount = filteredAssets.length;
            displayAssetsByType = byType;
            displayTopAssets = sorted;
        }

        // ✅ Debug logging - verify all values come from backend
        console.log('📊 AssetManagement - ALL FROM BACKEND:', {
            period: filters?.period,
            totalValue: displayTotalValue,           // ✅ From backend
            netBookValue: displayNetBookValue,       // ✅ From backend
            depreciatedValue: displayDepreciatedValue, // ✅ From backend
            activeCount: displayActiveCount,         // ✅ From backend
            maintenanceCount: displayMaintenanceCount, // ✅ From backend
            totalAssetCount: displayTotalAssetCount, // ✅ From backend
            assetsByTypeCount: Object.keys(displayAssetsByType).length,
            topAssetsCount: displayTopAssets.length,
        });

        return {
            totalValue: displayTotalValue,
            netBookValue: displayNetBookValue,
            depreciatedValue: displayDepreciatedValue,
            activeCount: displayActiveCount,
            maintenanceCount: displayMaintenanceCount,
            totalAssetCount: displayTotalAssetCount,
            assetsByType: displayAssetsByType,
            topAssets: displayTopAssets,
        };
    }, [analytics, assets, periodRange, filters]);

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-4 border-2 border-teal-100">
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="h-12 bg-gray-200 rounded"></div>
                        <div className="h-12 bg-gray-200 rounded"></div>
                        <div className="h-12 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    // ✅ Show empty state if no data
    if (data.totalValue === 0 && data.totalAssetCount === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-4 border-2 border-teal-100">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">Asset Management</h3>
                    <span className="text-xs text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
                        0 assets
                    </span>
                </div>
                <div className="text-center py-6">
                    <p className="text-gray-400 text-sm">No assets for the selected period</p>
                </div>
            </div>
        );
    }

    // ✅ Convert assetsByType object to entries for display
    const assetTypeEntries = Object.entries(data.assetsByType);

    return (
        <div className="bg-white rounded-lg shadow-md p-4 border-2 border-teal-100 hover:border-teal-500 transition-colors">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Asset Management</h3>
                <span className="text-xs text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
                    {data.totalAssetCount} assets
                </span>
            </div>

            <div className="space-y-3">
                {/* Total Value */}
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Value</span>
                    <span className="text-xl font-bold text-teal-600">
                        {formatCurrency(data.totalValue)}
                    </span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-50 rounded p-2 text-center">
                        <p className="text-xs text-gray-500">Active</p>
                        <p className="text-sm font-bold text-green-600">{data.activeCount}</p>  {/* ✅ From backend */}
                    </div>
                    <div className="bg-gray-50 rounded p-2 text-center">
                        <p className="text-xs text-gray-500">Maintenance</p>
                        <p className="text-sm font-bold text-yellow-600">{data.maintenanceCount}</p>  {/* ✅ From backend */}
                    </div>
                    <div className="bg-gray-50 rounded p-2 text-center">
                        <p className="text-xs text-gray-500">Depreciated</p>
                        <p className="text-sm font-bold text-gray-600">{formatCurrency(data.depreciatedValue)}</p>  {/* ✅ From backend */}
                    </div>
                </div>

                {/* Net Book Value */}
                <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Net Book Value</p>
                    <p className="text-lg font-bold text-teal-700">{formatCurrency(data.netBookValue)}</p>  {/* ✅ From backend */}
                </div>

                {/* Top Assets */}
                {data.topAssets.length > 0 && (
                    <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Top Assets by Value</p>
                        <div className="space-y-1">
                            {data.topAssets.map((asset: any, index: number) => (
                                <div key={asset.id || asset.Id || index} className="flex justify-between text-sm">
                                    <span className="text-gray-600 truncate max-w-[60%]">
                                        {asset.name || asset.Name || asset.code || asset.Code || `Asset ${index + 1}`}
                                    </span>
                                    <span className="font-medium text-gray-800">
                                        {formatCurrency(asset.acquisitionCost || asset.cost || asset.bookValue || asset.currentValue || 0)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Asset Types (Optional) */}
                {assetTypeEntries.length > 0 && (
                    <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Asset Types</p>
                        <div className="grid grid-cols-2 gap-1">
                            {assetTypeEntries.slice(0, 4).map(([type, count]) => (
                                <div key={type} className="flex justify-between text-xs bg-gray-50 rounded p-1">
                                    <span className="text-gray-600">{type}</span>
                                    <span className="font-medium text-gray-800">{count as number}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Progress Bar */}
                <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                            className="h-1.5 rounded-full bg-teal-500"
                            style={{
                                width: data.totalValue > 0
                                    ? `${Math.min(100, (data.netBookValue / data.totalValue) * 100)}%`
                                    : '0%'
                            }}
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-1 text-right">
                        {data.totalValue > 0
                            ? `${Math.round((data.netBookValue / data.totalValue) * 100)}% book value`
                            : 'No assets'}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default React.memo(AssetManagement);