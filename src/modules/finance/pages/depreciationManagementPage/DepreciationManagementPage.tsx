// src/pages/finance/DepreciationManagementPage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, Calendar, Play, FileSpreadsheet, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Card, CardContent } from '@/shared/components/ui/card';
import { showToast } from '@/shared/layout/layout';
import {
  getAssets,
  getAssetById,
  updateAsset,
  getAccounts,
  getFinancialPeriods,
  createJournalEntry
} from '@/modules/finance/services/finance.api';

// ✅ Asset interface matching your API
interface Asset {
  id: string;
  name: string;
  code: string;
  description: string;
  serialNumber: string;
  model: string;
  manufacturer: string;
  location: string;
  acquisitionCost: number;
  acquisitionDate: string;
  salvageValue: number;
  usefulLife: number;
  depreciationRate: number;
  assetType: string;
  assetCategory: string;
  status: string;
  isActive: boolean;
  assignedTo: string | null;
  assignedToName: string | null;
  departmentId: string | null;
  departmentName: string | null;
  branchId: string | null;
  branchName: string | null;
  accountId: string | null;
  accountCode: string | null;
  accountName: string | null;
  purchaseDate: string | null;
  currentValue: number | null;
  accumulatedDepreciation: number | null;
  lastDepreciationDate: string | null;
  warrantyInfo: string | null;
  warrantyExpiryDate: string | null;
  notes: string | null;
  dateAdd: string;
  dateMod: string | null;
  createdByUserName: string | null;
  updatedByUserName: string | null;
}

// ✅ Extended asset for depreciation
interface AssetForDepreciation extends Asset {
  netBookValue: number;
  monthlyDepreciation: number;
  annualDepreciation: number;
  accumulatedDepreciationValue: number;
}

interface DepreciationResult {
  assetId: string;
  assetCode: string;
  assetName: string;
  category: string;
  depreciationAmount: number;
  accumulatedDepreciation: number;
  netBookValue: number;
  depreciationRate: number;
}

interface DepreciationSummary {
  totalAssets: number;
  totalDepreciation: number;
  totalAccumulated: number;
  totalNetBookValue: number;
}

interface Account {
  id: string;
  code: string;
  name: string;
  accountType: string;
}

interface FinancialPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isClosed: boolean;
}

const DepreciationManagementPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [assets, setAssets] = useState<AssetForDepreciation[]>([]);
  const [results, setResults] = useState<DepreciationResult[]>([]);
  const [summary, setSummary] = useState<DepreciationSummary>({
    totalAssets: 0,
    totalDepreciation: 0,
    totalAccumulated: 0,
    totalNetBookValue: 0,
  });
  const [periods, setPeriods] = useState<FinancialPeriod[]>([]);
  const [formData, setFormData] = useState({
    depreciation_period: new Date().toISOString().slice(0, 7),
    run_date: new Date().toISOString().split('T')[0],
    asset_category: 'ALL',
    period_id: '', // ✅ Added period_id
  });
  const [depreciationAccounts, setDepreciationAccounts] = useState<{
    expenseAccount: Account | null;
    accumulatedAccount: Account | null;
  }>({
    expenseAccount: null,
    accumulatedAccount: null,
  });

  const assetCategories = [
    { id: 'ALL', name: 'All Categories' },
    { id: 'IT Equipment', name: 'IT Equipment' },
    { id: 'Office Equipment', name: 'Office Equipment' },
    { id: 'Vehicle', name: 'Vehicles' },
    { id: 'Furniture', name: 'Furniture' },
    { id: 'Machinery', name: 'Machinery' },
    { id: 'Building', name: 'Buildings' },
    { id: 'Land', name: 'Land' },
    { id: 'Software', name: 'Software' },
  ];

  useEffect(() => {
    fetchAssets();
    fetchDepreciationAccounts();
    fetchPeriods();
  }, []);

  // ✅ Fetch assets from the actual Assets API
  const fetchAssets = async () => {
    setIsFetching(true);
    try {
      const response = await getAssets({ status: 'All' });

      let assetData = response?.data?.data || response?.data || response || [];

      if (Array.isArray(assetData) && assetData.length > 0 && assetData[0].data) {
        assetData = assetData[0].data;
      }

      const activeAssets = assetData
          .filter((a: any) =>
              a.isActive !== false &&
              a.status !== 'Disposed' &&
              (a.acquisitionCost || 0) > 0
          )
          .map((a: any) => {
            const acquisitionCost = a.acquisitionCost || 0;
            const salvageValue = a.salvageValue || 0;
            const usefulLifeMonths = a.usefulLife || 36;
            const usefulLifeYears = usefulLifeMonths / 12;
            const annualDepreciation = usefulLifeYears > 0
                ? (acquisitionCost - salvageValue) / usefulLifeYears
                : 0;
            const monthlyDepreciation = usefulLifeMonths > 0
                ? (acquisitionCost - salvageValue) / usefulLifeMonths
                : 0;
            const accumulatedDep = a.accumulatedDepreciation || 0;
            const netBookValue = Math.max(0, acquisitionCost - accumulatedDep);

            return {
              ...a,
              netBookValue,
              monthlyDepreciation,
              annualDepreciation,
              accumulatedDepreciationValue: accumulatedDep,
              acquisitionCost,
              salvageValue,
              usefulLife: usefulLifeMonths,
            };
          });

      setAssets(activeAssets);

      if (activeAssets.length === 0) {
        showToast.warning('No active assets with positive acquisition cost found');
      } else {
        showToast.success(`Loaded ${activeAssets.length} assets for depreciation`);
      }

    } catch (error) {
      console.error('Error fetching assets:', error);
      showToast.error('Failed to load assets');
    } finally {
      setIsFetching(false);
    }
  };

  // ✅ Fetch periods
  const fetchPeriods = async () => {
    try {
      const response = await getFinancialPeriods({ isClosed: false });
      let periodData = response?.data?.data || response?.data || response || [];

      if (Array.isArray(periodData) && periodData.length > 0 && periodData[0].data) {
        periodData = periodData[0].data;
      }

      setPeriods(periodData);

      // ✅ Auto-select the period based on the depreciation period
      const [year, month] = formData.depreciation_period.split('-').map(Number);
      const targetDate = new Date(Date.UTC(year, month - 1, 1));

      const matchingPeriod = periodData.find((p: any) => {
        const startDate = new Date(p.startDate);
        const endDate = new Date(p.endDate);
        return targetDate >= startDate && targetDate <= endDate && !p.isClosed;
      });

      if (matchingPeriod) {
        setFormData(prev => ({ ...prev, period_id: matchingPeriod.id }));
        console.log('✅ Auto-selected period:', matchingPeriod.name);
      }

    } catch (error) {
      console.error('Error fetching periods:', error);
    }
  };

  // ✅ Fetch depreciation accounts from Chart of Accounts
  const fetchDepreciationAccounts = async () => {
    try {
      const response = await getAccounts();
      let accounts = response?.data?.data || response?.data || response || [];

      if (Array.isArray(accounts) && accounts.length > 0 && accounts[0].data) {
        accounts = accounts[0].data;
      }

      const expenseAccount = accounts.find((acc: any) =>
          acc.accountType === 'Expense' &&
          (acc.name?.toLowerCase().includes('depreciation') ||
              acc.code === '5000' ||
              acc.code === '5010')
      );

      const accumulatedAccount = accounts.find((acc: any) =>
          acc.accountType === 'Asset' &&
          (acc.name?.toLowerCase().includes('accumulated depreciation') ||
              acc.name?.toLowerCase().includes('accumulated dep') ||
              acc.code === '1500')
      );

      setDepreciationAccounts({
        expenseAccount: expenseAccount || null,
        accumulatedAccount: accumulatedAccount || null,
      });

      if (!expenseAccount) {
        console.warn('Depreciation Expense account not found.');
      }
      if (!accumulatedAccount) {
        console.warn('Accumulated Depreciation account not found.');
      }

    } catch (error) {
      console.error('Error fetching depreciation accounts:', error);
    }
  };

  // ✅ Calculate depreciation for a single asset
  const calculateDepreciation = (asset: AssetForDepreciation): DepreciationResult => {
    const acquisitionCost = asset.acquisitionCost || 0;
    const salvageValue = asset.salvageValue || 0;
    const usefulLifeMonths = asset.usefulLife || 36;
    const monthlyDepreciation = usefulLifeMonths > 0
        ? (acquisitionCost - salvageValue) / usefulLifeMonths
        : 0;
    const accumulatedDep = asset.accumulatedDepreciationValue || 0;
    const netBookValue = Math.max(0, acquisitionCost - accumulatedDep);

    let category = asset.assetCategory || 'Other';
    if (!assetCategories.find(c => c.id === category)) {
      category = 'Other';
    }

    return {
      assetId: asset.id,
      assetCode: asset.code,
      assetName: asset.name,
      category: category,
      depreciationAmount: Math.round(monthlyDepreciation * 100) / 100,
      accumulatedDepreciation: Math.round((accumulatedDep + monthlyDepreciation) * 100) / 100,
      netBookValue: Math.round((netBookValue - monthlyDepreciation) * 100) / 100,
      depreciationRate: asset.depreciationRate || (usefulLifeMonths > 0 ? (12 / usefulLifeMonths) * 100 : 0),
    };
  };

  // ✅ Handle run depreciation
  const handleRunDepreciation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if depreciation accounts exist
      if (!depreciationAccounts.expenseAccount) {
        showToast.error('Depreciation Expense account not found. Please create one first.');
        setIsLoading(false);
        return;
      }
      if (!depreciationAccounts.accumulatedAccount) {
        showToast.error('Accumulated Depreciation account not found. Please create one first.');
        setIsLoading(false);
        return;
      }

      // ✅ Check if period is selected
      if (!formData.period_id) {
        showToast.error('No active financial period found for the selected date. Please create a period first.');
        setIsLoading(false);
        return;
      }

      // Filter assets by category
      let assetsToProcess = assets;
      if (formData.asset_category !== 'ALL') {
        assetsToProcess = assets.filter(asset =>
            asset.assetCategory === formData.asset_category
        );
      }

      assetsToProcess = assetsToProcess.filter(asset => (asset.netBookValue || 0) > 0);

      if (assetsToProcess.length === 0) {
        showToast.warning('No eligible assets found for depreciation.');
        setIsLoading(false);
        return;
      }

      // Calculate depreciation
      const depreciationResults = assetsToProcess.map(asset => calculateDepreciation(asset));

      const totalDepreciation = depreciationResults.reduce((sum, r) => sum + r.depreciationAmount, 0);
      const totalAccumulated = depreciationResults.reduce((sum, r) => sum + r.accumulatedDepreciation, 0);
      const totalNetBookValue = depreciationResults.reduce((sum, r) => sum + r.netBookValue, 0);

      setResults(depreciationResults);
      setSummary({
        totalAssets: depreciationResults.length,
        totalDepreciation: totalDepreciation,
        totalAccumulated: totalAccumulated,
        totalNetBookValue: totalNetBookValue,
      });

      // ✅ Update each asset's accumulated depreciation
      for (const result of depreciationResults) {
        const asset = assetsToProcess.find(a => a.id === result.assetId);
        if (asset) {
          try {
            await updateAsset({
              id: asset.id,
              name: asset.name,
              code: asset.code,
              description: asset.description || '',
              serialNumber: asset.serialNumber || '',
              model: asset.model || '',
              manufacturer: asset.manufacturer || '',
              location: asset.location || '',
              acquisitionCost: asset.acquisitionCost || 0,
              acquisitionDate: asset.acquisitionDate || new Date().toISOString().split('T')[0],
              salvageValue: asset.salvageValue || 0,
              usefulLife: asset.usefulLife || 36,
              depreciationRate: asset.depreciationRate || 2.78,
              assetType: asset.assetType || 'Fixed',
              assetCategory: asset.assetCategory || 'Equipment',
              status: asset.status || 'Active',
              isActive: asset.isActive !== false,
              assignedTo: asset.assignedTo || null,
              departmentId: asset.departmentId || null,
              branchId: asset.branchId || null,
              accountId: asset.accountId || null,
              purchaseDate: asset.purchaseDate || null,
              currentValue: asset.currentValue || null,
              accumulatedDepreciation: result.accumulatedDepreciation,
              lastDepreciationDate: formData.run_date,
              warrantyInfo: asset.warrantyInfo || null,
              warrantyExpiryDate: asset.warrantyExpiryDate || null,
              notes: asset.notes || null,
            });
          } catch (err) {
            console.error(`Failed to update asset ${asset.name}:`, err);
          }
        }
      }

      // ✅ Create journal entry with PeriodId
      if (totalDepreciation > 0) {
        const journalEntry = {
          reference: `DEP-${formData.depreciation_period.replace('-', '')}`,
          entryDate: formData.run_date,
          description: `Monthly depreciation for ${formData.depreciation_period}`,
          entryType: 'Depreciation',
          periodId: formData.period_id, // ✅ INCLUDED!
          branchId: null,
          departmentId: null,
          employeeId: null,
          lines: [
            {
              accountId: depreciationAccounts.expenseAccount.id,
              direction: 'Debit',
              amount: Math.round(totalDepreciation * 100) / 100,
              description: `Monthly depreciation expense - ${formData.depreciation_period}`
            },
            {
              accountId: depreciationAccounts.accumulatedAccount.id,
              direction: 'Credit',
              amount: Math.round(totalDepreciation * 100) / 100,
              description: `Accumulated depreciation - ${formData.depreciation_period}`
            }
          ]
        };

        console.log('📤 Journal Entry Payload:', JSON.stringify(journalEntry, null, 2));

        try {
          await createJournalEntry(journalEntry);
          showToast.success(`Depreciation run completed successfully. Journal entry created for ${formatCurrency(totalDepreciation)}`);
        } catch (err: any) {
          console.error('Error creating journal entry:', err);
          console.error('Error response:', err.response?.data);
          showToast.warning(
              `Depreciation calculated but journal entry creation failed: ${err.response?.data?.message || err.message || 'Unknown error'}`
          );
        }
      } else {
        showToast.info('No depreciation to record (total amount is zero)');
      }

      // Refresh assets
      await fetchAssets();

    } catch (error: any) {
      console.error('Error running depreciation:', error);
      showToast.error(error.message || 'Error running depreciation');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCategoryLabel = (categoryId: string) => {
    const category = assetCategories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  };

  if (isFetching) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          <span className="ml-2 text-gray-600">Loading assets...</span>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-6 space-y-6"
        >
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingDown className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Depreciation Management</h1>
                <p className="text-sm text-gray-500">
                  Calculate and post depreciation for fixed assets
                  <span className="ml-2 text-orange-600 font-medium">
                  ({assets.length} assets available)
                </span>
                </p>
              </div>
            </div>
            <Button
                onClick={() => {
                  fetchAssets();
                  fetchDepreciationAccounts();
                  fetchPeriods();
                }}
                variant="outline"
                className="flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </Button>
          </div>

          {/* Depreciation Accounts Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className={`border ${depreciationAccounts.expenseAccount ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${depreciationAccounts.expenseAccount ? 'bg-green-200' : 'bg-red-200'}`}>
                    {depreciationAccounts.expenseAccount ? '✅' : '❌'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">Depreciation Expense</p>
                    <p className="text-xs text-gray-600">
                      {depreciationAccounts.expenseAccount
                          ? `${depreciationAccounts.expenseAccount.code} - ${depreciationAccounts.expenseAccount.name}`
                          : 'Not found'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className={`border ${depreciationAccounts.accumulatedAccount ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${depreciationAccounts.accumulatedAccount ? 'bg-green-200' : 'bg-red-200'}`}>
                    {depreciationAccounts.accumulatedAccount ? '✅' : '❌'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">Accumulated Depreciation</p>
                    <p className="text-xs text-gray-600">
                      {depreciationAccounts.accumulatedAccount
                          ? `${depreciationAccounts.accumulatedAccount.code} - ${depreciationAccounts.accumulatedAccount.name}`
                          : 'Not found'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className={`border ${formData.period_id ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${formData.period_id ? 'bg-green-200' : 'bg-red-200'}`}>
                    {formData.period_id ? '✅' : '❌'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">Active Financial Period</p>
                    <p className="text-xs text-gray-600">
                      {formData.period_id
                          ? periods.find(p => p.id === formData.period_id)?.name || 'Selected'
                          : 'No active period found'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Depreciation Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Run Depreciation</h3>

                <form onSubmit={handleRunDepreciation} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="depreciation_period" className="flex items-center gap-2">
                      <Calendar size={16} />
                      Depreciation Period <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="depreciation_period"
                        type="month"
                        value={formData.depreciation_period}
                        onChange={(e) => {
                          const newPeriod = e.target.value;
                          setFormData({ ...formData, depreciation_period: newPeriod });

                          // ✅ Auto-select period when month changes
                          const [year, month] = newPeriod.split('-').map(Number);
                          const targetDate = new Date(Date.UTC(year, month - 1, 1));
                          const matchingPeriod = periods.find((p: any) => {
                            const startDate = new Date(p.startDate);
                            const endDate = new Date(p.endDate);
                            return targetDate >= startDate && targetDate <= endDate && !p.isClosed;
                          });
                          if (matchingPeriod) {
                            setFormData(prev => ({ ...prev, period_id: matchingPeriod.id }));
                          }
                        }}
                        className="border-gray-300 focus:ring-2 focus:ring-orange-500"
                        required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="run_date" className="flex items-center gap-2">
                      <Calendar size={16} />
                      Run Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="run_date"
                        type="date"
                        value={formData.run_date}
                        onChange={(e) => setFormData({ ...formData, run_date: e.target.value })}
                        className="border-gray-300 focus:ring-2 focus:ring-orange-500"
                        required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="asset_category" className="flex items-center gap-2">
                      <FileSpreadsheet size={16} />
                      Asset Category (Optional)
                    </Label>
                    <Select
                        value={formData.asset_category}
                        onValueChange={(value) => setFormData({ ...formData, asset_category: value })}
                    >
                      <SelectTrigger className="w-full border-gray-300 focus:ring-2 focus:ring-orange-500">
                        <SelectValue placeholder="Select asset category" />
                      </SelectTrigger>
                      <SelectContent>
                        {assetCategories.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* ✅ Show selected period */}
                  {formData.period_id && (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-xs text-green-700 font-medium">Selected Period</p>
                        <p className="text-sm text-green-800">
                          {periods.find(p => p.id === formData.period_id)?.name || 'Unknown'}
                        </p>
                      </div>
                  )}

                  <Button
                      type="submit"
                      disabled={isLoading || assets.length === 0 || !depreciationAccounts.expenseAccount || !depreciationAccounts.accumulatedAccount || !formData.period_id}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Play size={16} />
                    )}
                    {isLoading ? 'Running Depreciation...' : 'Run Depreciation'}
                  </Button>

                  {!formData.period_id && (
                      <p className="text-sm text-red-600 text-center">
                        ⚠️ No active financial period found. Please create a period first.
                      </p>
                  )}
                  {!depreciationAccounts.expenseAccount && (
                      <p className="text-sm text-red-600 text-center">
                        ⚠️ Depreciation Expense account not found. Please create one.
                      </p>
                  )}
                  {!depreciationAccounts.accumulatedAccount && (
                      <p className="text-sm text-red-600 text-center">
                        ⚠️ Accumulated Depreciation account not found. Please create one.
                      </p>
                  )}
                  {assets.length === 0 && (
                      <p className="text-sm text-amber-600 text-center">
                        No active assets found. Please add asset accounts first.
                      </p>
                  )}
                </form>
              </div>
            </div>

            {/* Results */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Depreciation Results</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {results.length > 0
                          ? `${results.length} assets processed for ${formData.depreciation_period}`
                          : 'No depreciation run yet'
                      }
                    </p>
                  </div>
                </div>

                {/* Summary Cards */}
                {results.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-orange-50 border-b border-orange-100">
                      <div>
                        <p className="text-xs text-gray-500">Assets</p>
                        <p className="text-lg font-bold text-gray-900">{summary.totalAssets}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total Depreciation</p>
                        <p className="text-lg font-bold text-orange-600">{formatCurrency(summary.totalDepreciation)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Accumulated</p>
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(summary.totalAccumulated)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Net Book Value</p>
                        <p className="text-lg font-bold text-green-600">{formatCurrency(summary.totalNetBookValue)}</p>
                      </div>
                    </div>
                )}

                {results.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Depreciation</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Accumulated</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Net Book Value</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {results.map((result, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{result.assetCode}</div>
                                  <div className="text-sm text-gray-500">{result.assetName}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                              {getCategoryLabel(result.category)}
                            </span>
                              </td>
                              <td className="px-6 py-4 text-right text-sm text-gray-600">
                                {result.depreciationRate.toFixed(1)}%
                              </td>
                              <td className="px-6 py-4 text-right text-sm font-medium text-orange-600">
                                {formatCurrency(result.depreciationAmount)}
                              </td>
                              <td className="px-6 py-4 text-right text-sm text-gray-900">
                                {formatCurrency(result.accumulatedDepreciation)}
                              </td>
                              <td className="px-6 py-4 text-right text-sm font-semibold text-green-600">
                                {formatCurrency(result.netBookValue)}
                              </td>
                            </tr>
                        ))}
                        </tbody>
                      </table>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                      <TrendingDown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Depreciation Run</h3>
                      <p className="text-gray-600">
                        Click "Run Depreciation" to calculate and post depreciation entries
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        {assets.length} assets available for depreciation
                      </p>
                    </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
  );
};

export default DepreciationManagementPage;