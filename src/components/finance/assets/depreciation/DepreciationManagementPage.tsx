// src/pages/finance/depreciationManagementPage/DepreciationManagementPage.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingDown, Calendar, Play, FileText, RefreshCw,
  Download, Printer, CheckCircle, XCircle, AlertCircle,
  DollarSign, Clock, Package
} from 'lucide-react';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Badge } from '../../../ui/badge';
import { Card, CardContent } from'../../../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { showToast } from '../../../layout/layout';
import { getAccounts, getJournalEntries, createJournalEntry, postJournalEntry } from '../../../../services/finance/finance.api';

interface DepreciationResult {
  assetTag: string;
  assetName: string;
  assetId: string;
  depreciationAmount: number;
  period: string;
  status: 'SUCCESS' | 'ERROR';
  accountId?: string;
  accumulatedAccountId?: string;
}

interface Asset {
  id: string;
  code: string;
  name: string;
  accountType: string;
  accountSubType?: string;
  openingBalance?: number;
  isActive: boolean;
  usefulLife?: number;
  depreciationMethod?: string;
}

const DepreciationManagementPage: React.FC = () => {
  const [formData, setFormData] = useState({
    depreciationPeriod: new Date().toISOString().slice(0, 7),
    runDate: new Date().toISOString().split('T')[0],
    assetCategory: 'ALL',
  });
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DepreciationResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [depreciationAccounts, setDepreciationAccounts] = useState<{ expenseAccountId?: string; accumulatedAccountId?: string }>({});

  const assetCategories = [
    { value: 'ALL', label: 'All Categories' },
    { value: 'IT_EQUIPMENT', label: 'IT Equipment' },
    { value: 'OFFICE_EQUIPMENT', label: 'Office Equipment' },
    { value: 'VEHICLES', label: 'Vehicles' },
    { value: 'FURNITURE', label: 'Furniture' },
    { value: 'MACHINERY', label: 'Machinery' },
    { value: 'BUILDINGS', label: 'Buildings' },
  ];

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await getAccounts();
      const data = res.data.data || res.data || [];

      // Filter asset accounts
      const assetAccounts = data
          .filter((a: any) => a.accountType === 'Asset' && a.isActive !== false)
          .map((a: any) => ({
            id: a.id,
            code: a.code,
            name: a.name,
            accountType: a.accountType,
            accountSubType: a.accountSubType || 'Fixed Asset',
            openingBalance: a.openingBalance || 0,
            isActive: a.isActive,
            usefulLife: a.usefulLife || 5,
            depreciationMethod: a.depreciationMethod || 'Straight-line',
          }));

      setAssets(assetAccounts);

      // Find depreciation accounts
      const expenseAccount = data.find((a: any) =>
          a.accountType === 'Expense' &&
          (a.name.toLowerCase().includes('depreciation') || a.code === '5200')
      );

      const accumulatedAccount = data.find((a: any) =>
          a.accountType === 'Asset' &&
          (a.name.toLowerCase().includes('accumulated depreciation') || a.code === '1200')
      );

      setDepreciationAccounts({
        expenseAccountId: expenseAccount?.id,
        accumulatedAccountId: accumulatedAccount?.id,
      });
    } catch (error) {
      console.error('Error fetching assets:', error);
      showToast('Failed to load assets', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRunDepreciation = async () => {
    if (!formData.depreciationPeriod || !formData.runDate) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (!depreciationAccounts.expenseAccountId || !depreciationAccounts.accumulatedAccountId) {
      showToast('Depreciation accounts not found. Please set up Depreciation Expense and Accumulated Depreciation accounts.', 'error');
      return;
    }

    setIsRunning(true);
    try {
      // Filter assets by category
      let activeAssets = assets;
      if (formData.assetCategory !== 'ALL') {
        activeAssets = assets.filter(a =>
            a.accountSubType?.toUpperCase().replace(' ', '_') === formData.assetCategory
        );
      }

      if (activeAssets.length === 0) {
        showToast('No assets found for the selected category', 'warning');
        setIsRunning(false);
        return;
      }

      // Calculate depreciation for each asset
      const depreciationResults: DepreciationResult[] = activeAssets.map(asset => {
        const cost = asset.openingBalance || 0;
        const usefulLife = asset.usefulLife || 5;
        const annualDepreciation = cost / usefulLife;
        const monthlyDepreciation = annualDepreciation / 12;

        return {
          assetTag: asset.code,
          assetName: asset.name,
          assetId: asset.id,
          depreciationAmount: Math.round(monthlyDepreciation * 100) / 100,
          period: formData.depreciationPeriod,
          status: 'SUCCESS' as const,
          accountId: depreciationAccounts.expenseAccountId,
          accumulatedAccountId: depreciationAccounts.accumulatedAccountId,
        };
      });

      // Create journal entry for depreciation
      const totalDepreciation = depreciationResults.reduce((sum, r) => sum + r.depreciationAmount, 0);

      if (totalDepreciation > 0) {
        const journalEntry = {
          reference: `DEP-${formData.depreciationPeriod.replace('-', '')}`,
          entryDate: new Date(formData.runDate).toISOString(),
          description: `Depreciation for period ${formData.depreciationPeriod}`,
          entryType: 'Depreciation',
          isPosted: true,
          totalDebit: totalDepreciation,
          totalCredit: totalDepreciation,
          lines: [
            {
              accountId: depreciationAccounts.expenseAccountId,
              direction: 'Debit',
              amount: totalDepreciation,
              description: `Depreciation expense for ${formData.depreciationPeriod}`,
            },
            {
              accountId: depreciationAccounts.accumulatedAccountId,
              direction: 'Credit',
              amount: totalDepreciation,
              description: `Accumulated depreciation for ${formData.depreciationPeriod}`,
            },
          ],
        };

        await createJournalEntry(journalEntry);
      }

      setResults(depreciationResults);
      setShowResults(true);

      showToast(`Depreciation run completed successfully for ${depreciationResults.length} assets`, 'success');

    } catch (error) {
      console.error('Error running depreciation:', error);
      showToast('Error running depreciation. Please try again.', 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const totalDepreciation = results.reduce((sum, result) => sum + result.depreciationAmount, 0);

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Depreciation Management</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Run depreciation calculations and generate journal entries
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                    onClick={fetchAssets}
                    variant="outline"
                    className="flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Total Assets</p>
                      <p className="text-2xl font-bold text-blue-900">{assets.length}</p>
                    </div>
                    <div className="p-3 bg-blue-200 rounded-lg">
                      <Package className="h-6 w-6 text-blue-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700 font-medium">Active Assets</p>
                      <p className="text-2xl font-bold text-green-900">
                        {assets.filter(a => a.isActive).length}
                      </p>
                    </div>
                    <div className="p-3 bg-green-200 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-700 font-medium">Total Value</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {formatCurrency(assets.reduce((sum, a) => sum + (a.openingBalance || 0), 0))}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-200 rounded-lg">
                      <DollarSign className="h-6 w-6 text-purple-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-700 font-medium">Avg Useful Life</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {assets.length > 0
                            ? Math.round(assets.reduce((sum, a) => sum + (a.usefulLife || 5), 0) / assets.length)
                            : 0} yrs
                      </p>
                    </div>
                    <div className="p-3 bg-orange-200 rounded-lg">
                      <Clock className="h-6 w-6 text-orange-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Run Depreciation Form */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Play className="w-5 h-5 text-indigo-600" />
                Run Depreciation
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="depreciation_period" className="text-sm text-gray-500">
                    Depreciation Period <span className="text-red-500">*</span>
                  </Label>
                  <Input
                      id="depreciation_period"
                      type="month"
                      value={formData.depreciationPeriod}
                      onChange={(e) => setFormData({ ...formData, depreciationPeriod: e.target.value })}
                      className="border-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                      required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="run_date" className="text-sm text-gray-500">
                    Run Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                      id="run_date"
                      type="date"
                      value={formData.runDate}
                      onChange={(e) => setFormData({ ...formData, runDate: e.target.value })}
                      className="border-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                      required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="asset_category" className="text-sm text-gray-500">
                    Asset Category (Optional)
                  </Label>
                  <Select
                      value={formData.assetCategory}
                      onValueChange={(value) => setFormData({ ...formData, assetCategory: value })}
                  >
                    <SelectTrigger className="w-full border-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-transparent">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {assetCategories.map(category => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                    onClick={handleRunDepreciation}
                    disabled={isRunning || assets.length === 0}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 flex items-center gap-2"
                >
                  {isRunning ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Running Depreciation...
                      </>
                  ) : (
                      <>
                        <Play size={16} />
                        Run Depreciation
                      </>
                  )}
                </Button>
                {assets.length === 0 && (
                    <p className="text-sm text-yellow-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      No assets found. Please add assets first.
                    </p>
                )}
              </div>
            </div>

            {/* Results */}
            {showResults && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200"
                >
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        Depreciation Results
                        <Badge className="bg-green-100 text-green-700 ml-2">
                          {results.length} assets
                        </Badge>
                      </h2>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total Depreciation</p>
                        <p className="text-lg font-bold text-red-600">{formatCurrency(totalDepreciation)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-white">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Asset
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Asset Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Depreciation Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Period
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                      {results.map((result, index) => (
                          <motion.tr
                              key={result.assetTag}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-indigo-600">{result.assetTag}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{result.assetName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="text-sm font-semibold text-red-600">
                                {formatCurrency(result.depreciationAmount)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="text-sm text-gray-900 flex items-center justify-center gap-1">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                {result.period}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              result.status === 'SUCCESS'
                                  ? 'bg-green-100 text-green-800 border border-green-200'
                                  : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {result.status}
                          </span>
                            </td>
                          </motion.tr>
                      ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Journal Entry Notice */}
                  <div className="px-6 py-4 bg-indigo-50 border-t border-gray-200">
                    <div className="flex items-start gap-3">
                      <div className="p-1 bg-indigo-100 rounded-full">
                        <FileText className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-indigo-800">Journal Entries Created</h4>
                        <p className="text-sm text-indigo-700 mt-1">
                          Depreciation journal entries have been automatically posted to the general ledger.
                          Total depreciation expense: <span className="font-semibold">{formatCurrency(totalDepreciation)}</span>
                        </p>
                        <div className="mt-2 flex gap-3">
                          <Button variant="outline" size="sm" className="text-indigo-600 border-indigo-300">
                            <FileText className="w-4 h-4 mr-1" />
                            View Journal Entry
                          </Button>
                          <Button variant="outline" size="sm" className="text-indigo-600 border-indigo-300">
                            <Download className="w-4 h-4 mr-1" />
                            Export Results
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
            )}
          </motion.div>
        </div>
      </div>
  );
};

export default DepreciationManagementPage;