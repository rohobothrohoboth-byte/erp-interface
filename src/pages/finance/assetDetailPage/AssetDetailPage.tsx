// src/pages/finance/assetDetailPage/AssetDetailPage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, TrendingDown, RefreshCw, AlertCircle,
  ArrowRight, Trash2, Edit, DollarSign, Calendar,
  Building2, MapPin, Tag, FileText, Clock,
  CheckCircle, XCircle, Printer, Download,
  Package, User, Briefcase, Home, Shield
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Separator } from '../../../components/ui/separator';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import { useNavigate, useParams } from 'react-router-dom';
import { getAssetById, getAssets } from '../../../services/finance/finance.api';
import { showToast } from '../../../layout/layout';

// ✅ Asset interface matching your API response
interface AssetDetail {
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

// ✅ Depreciation entry interface
interface DepreciationEntry {
  id: string;
  period: string;
  openingBalance: number;
  depreciationAmount: number;
  accumulatedDepreciation: number;
  closingBalance: number;
  date: string;
}

// ✅ History entry interface
interface HistoryEntry {
  id: string;
  date: string;
  type: 'acquisition' | 'depreciation' | 'revaluation' | 'impairment' | 'transfer' | 'disposal';
  description: string;
  amount: number;
  createdBy: string;
  notes?: string;
}

const AssetDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { assetId } = useParams();
  const [asset, setAsset] = useState<AssetDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('depreciation');
  const [depreciationSchedule, setDepreciationSchedule] = useState<DepreciationEntry[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (assetId) {
      fetchAsset(assetId);
    }
  }, [assetId]);

  // ✅ Fetch asset from the actual Assets API
  const fetchAsset = async (id: string) => {
    try {
      setIsLoading(true);

      const response = await getAssetById(id);

      // Handle different response formats
      let assetData = response?.data?.data || response?.data || response;

      if (assetData && typeof assetData === 'object' && !Array.isArray(assetData)) {
        setAsset(assetData);

        // ✅ Generate depreciation schedule from asset data
        const schedule = generateDepreciationSchedule(assetData);
        setDepreciationSchedule(schedule);

        // ✅ Generate history from asset data
        const historyData = generateHistory(assetData);
        setHistory(historyData);
      } else {
        showToast.error('Asset not found');
        navigate('/finance/assets');
      }

    } catch (error) {
      console.error('Error fetching asset:', error);
      showToast.error('Failed to load asset details');
      navigate('/finance/assets');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Generate depreciation schedule based on asset data
  const generateDepreciationSchedule = (assetData: AssetDetail): DepreciationEntry[] => {
    const schedule: DepreciationEntry[] = [];

    if (!assetData.acquisitionCost || !assetData.acquisitionDate || !assetData.usefulLife) {
      return schedule;
    }

    const cost = assetData.acquisitionCost;
    const salvage = assetData.salvageValue || 0;
    const usefulLifeMonths = assetData.usefulLife;
    const monthlyDepreciation = (cost - salvage) / usefulLifeMonths;

    const acquisitionDate = new Date(assetData.acquisitionDate);
    const currentDate = new Date();
    const monthsSinceAcquisition = (currentDate.getFullYear() - acquisitionDate.getFullYear()) * 12 +
        (currentDate.getMonth() - acquisitionDate.getMonth());

    let accumulatedDep = 0;
    const entriesToShow = Math.min(monthsSinceAcquisition + 1, 12); // Show up to 12 periods

    for (let i = 0; i < entriesToShow; i++) {
      const periodDate = new Date(acquisitionDate);
      periodDate.setMonth(periodDate.getMonth() + i);

      const depAmount = i === 0 ? monthlyDepreciation : monthlyDepreciation;
      accumulatedDep += depAmount;

      schedule.push({
        id: `dep-${i}`,
        period: periodDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        openingBalance: cost - (accumulatedDep - depAmount),
        depreciationAmount: Math.round(depAmount * 100) / 100,
        accumulatedDepreciation: Math.round(accumulatedDep * 100) / 100,
        closingBalance: Math.round((cost - accumulatedDep) * 100) / 100,
        date: periodDate.toISOString(),
      });
    }

    return schedule;
  };

  // ✅ Generate history from asset data
  const generateHistory = (assetData: AssetDetail): HistoryEntry[] => {
    const historyData: HistoryEntry[] = [];

    // Acquisition event
    if (assetData.acquisitionDate && assetData.acquisitionCost) {
      historyData.push({
        id: 'hist-1',
        date: assetData.acquisitionDate,
        type: 'acquisition',
        description: `Asset acquired: ${assetData.name}`,
        amount: assetData.acquisitionCost,
        createdBy: assetData.createdByUserName || 'System',
        notes: `Acquisition cost: ${assetData.acquisitionCost}, Useful life: ${assetData.usefulLife} months`,
      });
    }

    // Depreciation events (if any)
    if (assetData.accumulatedDepreciation && assetData.accumulatedDepreciation > 0) {
      historyData.push({
        id: 'hist-2',
        date: assetData.lastDepreciationDate || assetData.dateAdd,
        type: 'depreciation',
        description: 'Depreciation recorded',
        amount: assetData.accumulatedDepreciation,
        createdBy: 'System',
        notes: `Accumulated depreciation: ${assetData.accumulatedDepreciation}`,
      });
    }

    // Status change events
    if (assetData.status) {
      historyData.push({
        id: 'hist-3',
        date: assetData.dateMod || assetData.dateAdd,
        type: assetData.status === 'Disposed' ? 'disposal' : 'transfer',
        description: `Asset status changed to ${assetData.status}`,
        amount: 0,
        createdBy: assetData.updatedByUserName || 'System',
        notes: `Status: ${assetData.status}`,
      });
    }

    // Sort by date (newest first)
    return historyData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // ✅ Refresh asset data
  const handleRefresh = async () => {
    if (assetId) {
      await fetchAsset(assetId);
      showToast.success('Asset details refreshed');
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string, isActive: boolean) => {
    if (!isActive) return 'bg-red-100 text-red-700 border-red-200';

    const colors: Record<string, string> = {
      Active: 'bg-green-100 text-green-700 border-green-200',
      'In Use': 'bg-blue-100 text-blue-700 border-blue-200',
      'Under Maintenance': 'bg-orange-100 text-orange-700 border-orange-200',
      Maintenance: 'bg-orange-100 text-orange-700 border-orange-200',
      Disposed: 'bg-red-100 text-red-700 border-red-200',
      Idle: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusIcon = (status: string, isActive: boolean) => {
    if (!isActive) return <XCircle className="h-4 w-4 text-red-600" />;

    switch (status) {
      case 'Active':
      case 'In Use': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Under Maintenance':
      case 'Maintenance': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'Disposed': return <Trash2 className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getHistoryTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      acquisition: 'bg-green-100 text-green-700 border-green-200',
      depreciation: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      revaluation: 'bg-blue-100 text-blue-700 border-blue-200',
      impairment: 'bg-orange-100 text-orange-700 border-orange-200',
      transfer: 'bg-purple-100 text-purple-700 border-purple-200',
      disposal: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // ✅ Calculate summary stats
  const summaryStats = useMemo(() => {
    if (!asset) return null;

    const totalDepreciation = depreciationSchedule.reduce((sum, d) => sum + d.depreciationAmount, 0);
    const bookValue = asset.acquisitionCost - (asset.accumulatedDepreciation || 0);

    return {
      bookValue: bookValue,
      totalDepreciation: totalDepreciation,
      depreciationPeriods: depreciationSchedule.length,
      historyEvents: history.length,
    };
  }, [asset, depreciationSchedule, history]);

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );
  }

  if (!asset) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">Asset not found</h2>
            <p className="text-gray-600 mt-2">The requested asset could not be found.</p>
            <Button onClick={() => navigate('/finance/assets')} className="mt-4">
              Back to Assets
            </Button>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
          >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/finance/assets")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">{asset.name}</h1>
                    <Badge className={getStatusColor(asset.status, asset.isActive)}>
                      {getStatusIcon(asset.status, asset.isActive)}
                      {asset.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="font-mono">{asset.code}</span>
                    <span>•</span>
                    <span>{asset.assetCategory || 'Asset'}</span>
                    {asset.serialNumber && (
                        <>
                          <span>•</span>
                          <span>SN: {asset.serialNumber}</span>
                        </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={handleRefresh}
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Printer className="w-4 h-4" />
                  Print
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Book Value</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {formatCurrency(summaryStats?.bookValue || 0)}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-200 rounded-lg">
                      <DollarSign className="h-6 w-6 text-blue-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-700 font-medium">Total Depreciation</p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {formatCurrency(summaryStats?.totalDepreciation || 0)}
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-200 rounded-lg">
                      <TrendingDown className="h-6 w-6 text-yellow-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-700 font-medium">Depreciation Periods</p>
                      <p className="text-2xl font-bold text-purple-900">{summaryStats?.depreciationPeriods || 0}</p>
                    </div>
                    <div className="p-3 bg-purple-200 rounded-lg">
                      <Calendar className="h-6 w-6 text-purple-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-700 font-medium">History Events</p>
                      <p className="text-2xl font-bold text-orange-900">{summaryStats?.historyEvents || 0}</p>
                    </div>
                    <div className="p-3 bg-orange-200 rounded-lg">
                      <FileText className="h-6 w-6 text-orange-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Asset Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-indigo-600" />
                  Asset Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Code</p>
                    <p className="font-mono font-medium">{asset.code || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{asset.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Serial Number</p>
                    <p className="font-medium">{asset.serialNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Model</p>
                    <p>{asset.model || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Manufacturer</p>
                    <p>{asset.manufacturer || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Asset Type</p>
                    <p>{asset.assetType || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p>{asset.assetCategory || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      {asset.location || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Acquisition Cost</p>
                    <p className="font-medium text-indigo-600">{formatCurrency(asset.acquisitionCost)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Acquisition Date</p>
                    <p>{formatDate(asset.acquisitionDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Salvage Value</p>
                    <p>{formatCurrency(asset.salvageValue)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Useful Life</p>
                    <p>{asset.usefulLife || 'N/A'} months</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Depreciation Rate</p>
                    <p>{asset.depreciationRate ? `${asset.depreciationRate}%` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Assigned To</p>
                    <p className="flex items-center gap-1">
                      <User className="h-3 w-3 text-gray-400" />
                      {asset.assignedToName || 'Not assigned'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3 text-gray-400" />
                      {asset.departmentName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Branch</p>
                    <p className="flex items-center gap-1">
                      <Home className="h-3 w-3 text-gray-400" />
                      {asset.branchName || 'N/A'}
                    </p>
                  </div>
                  {asset.warrantyInfo && (
                      <div>
                        <p className="text-sm text-gray-500">Warranty</p>
                        <p>{asset.warrantyInfo}</p>
                        {asset.warrantyExpiryDate && (
                            <p className="text-xs text-gray-400">Expires: {formatDate(asset.warrantyExpiryDate)}</p>
                        )}
                      </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p>{formatDate(asset.dateAdd)}</p>
                    {asset.createdByUserName && (
                        <p className="text-xs text-gray-400">By: {asset.createdByUserName}</p>
                    )}
                  </div>
                  {asset.dateMod && (
                      <div>
                        <p className="text-sm text-gray-500">Last Modified</p>
                        <p>{formatDate(asset.dateMod)}</p>
                        {asset.updatedByUserName && (
                            <p className="text-xs text-gray-400">By: {asset.updatedByUserName}</p>
                        )}
                      </div>
                  )}
                  {asset.notes && (
                      <div className="col-span-2 lg:col-span-3">
                        <p className="text-sm text-gray-500">Notes</p>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{asset.notes}</p>
                      </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
              <nav className="flex space-x-2 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('depreciation')}
                    className={`flex items-center gap-3 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                        activeTab === 'depreciation'
                            ? 'bg-indigo-50 border border-indigo-300 text-indigo-700 shadow-sm'
                            : 'text-gray-500 hover:text-indigo-700 hover:bg-indigo-50'
                    }`}
                >
                  <TrendingDown className={`h-5 w-5 ${activeTab === 'depreciation' ? 'text-indigo-600' : 'text-gray-400'}`} />
                  Depreciation Schedule
                  {activeTab === 'depreciation' && <div className="w-2 h-2 rounded-full bg-indigo-500 ml-1"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center gap-3 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                        activeTab === 'history'
                            ? 'bg-indigo-50 border border-indigo-300 text-indigo-700 shadow-sm'
                            : 'text-gray-500 hover:text-indigo-700 hover:bg-indigo-50'
                    }`}
                >
                  <Clock className={`h-5 w-5 ${activeTab === 'history' ? 'text-indigo-600' : 'text-gray-400'}`} />
                  History
                  {activeTab === 'history' && <div className="w-2 h-2 rounded-full bg-indigo-500 ml-1"></div>}
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {activeTab === 'depreciation' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Depreciation Schedule</h3>
                    {depreciationSchedule.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                              <th className="text-left py-3 px-4 font-medium text-gray-700">Period</th>
                              <th className="text-right py-3 px-4 font-medium text-gray-700">Opening Balance</th>
                              <th className="text-right py-3 px-4 font-medium text-gray-700">Depreciation</th>
                              <th className="text-right py-3 px-4 font-medium text-gray-700">Accumulated</th>
                              <th className="text-right py-3 px-4 font-medium text-gray-700">Closing Balance</th>
                            </tr>
                            </thead>
                            <tbody>
                            {depreciationSchedule.map((entry) => (
                                <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                                  <td className="py-3 px-4 font-medium">{entry.period}</td>
                                  <td className="py-3 px-4 text-right">{formatCurrency(entry.openingBalance)}</td>
                                  <td className="py-3 px-4 text-right text-red-600">{formatCurrency(entry.depreciationAmount)}</td>
                                  <td className="py-3 px-4 text-right">{formatCurrency(entry.accumulatedDepreciation)}</td>
                                  <td className="py-3 px-4 text-right font-medium text-indigo-600">{formatCurrency(entry.closingBalance)}</td>
                                </tr>
                            ))}
                            </tbody>
                            <tfoot className="bg-gray-50 border-t border-gray-200">
                            <tr>
                              <td className="py-3 px-4 font-semibold">Total</td>
                              <td className="py-3 px-4 text-right"></td>
                              <td className="py-3 px-4 text-right font-semibold text-red-600">
                                {formatCurrency(depreciationSchedule.reduce((sum, d) => sum + d.depreciationAmount, 0))}
                              </td>
                              <td className="py-3 px-4 text-right font-semibold">
                                {formatCurrency(depreciationSchedule[depreciationSchedule.length - 1]?.accumulatedDepreciation || 0)}
                              </td>
                              <td className="py-3 px-4 text-right font-semibold text-indigo-600">
                                {formatCurrency(depreciationSchedule[depreciationSchedule.length - 1]?.closingBalance || 0)}
                              </td>
                            </tr>
                            </tfoot>
                          </table>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                          <TrendingDown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No depreciation entries found</p>
                          <p className="text-sm text-gray-400 mt-1">Depreciation schedule will appear once available</p>
                        </div>
                    )}
                  </div>
              )}

              {activeTab === 'history' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">History</h3>
                    {history.length > 0 ? (
                        <div className="space-y-4">
                          {history.map((entry) => (
                              <div key={entry.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <p className="font-medium text-gray-900">{entry.description}</p>
                                    <p className="text-sm text-gray-600">{formatDate(entry.date)}</p>
                                  </div>
                                  <Badge className={getHistoryTypeColor(entry.type)}>
                                    {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                                  </Badge>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">By: {entry.createdBy || 'System'}</span>
                                  {entry.amount > 0 && (
                                      <span className="font-medium text-indigo-600">{formatCurrency(entry.amount)}</span>
                                  )}
                                </div>
                                {entry.notes && (
                                    <div className="mt-2 pt-2 border-t border-gray-100">
                                      <p className="text-sm text-gray-600">{entry.notes}</p>
                                    </div>
                                )}
                              </div>
                          ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No history records found</p>
                          <p className="text-sm text-gray-400 mt-1">History will appear as events occur</p>
                        </div>
                    )}
                  </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
  );
};

export default AssetDetailPage;