// src/pages/finance/PageAssets.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Package, Plus, Search, RefreshCw, Eye, Edit, Trash2,
  Calendar, DollarSign, Building2, MapPin, Tag, FileText,
  ChevronLeft, ChevronRight, MoreVertical, Download, Filter,
  TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock,
  Printer, Upload
} from 'lucide-react';
import { getAssets, deleteAsset, toggleAssetStatus } from '@/modules/finance/services/finance.api';
import { showToast } from '@/shared/layout/layout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog';

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

const PageAssets: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const ITEMS_PER_PAGE = 10;

  // ✅ Fetch assets from the actual Assets API
  const fetchAssets = async () => {
    try {
      setLoading(true);
      const response = await getAssets({ status: 'Active' });

      // Handle different response formats
      let assetData = response?.data?.data || response?.data || response || [];

      // If it's an array with a data property
      if (Array.isArray(assetData) && assetData.length > 0 && assetData[0].data) {
        assetData = assetData[0].data;
      }

      setAssets(assetData);
    } catch (error) {
      console.error('Error fetching assets:', error);
      showToast.error('Failed to load assets');
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  // ✅ Calculate stats from actual assets
  const stats = useMemo(() => {
    const totalAssets = assets.length;
    const totalValue = assets.reduce((sum, a) => sum + (a.acquisitionCost || 0), 0);
    const totalCurrentValue = assets.reduce((sum, a) => sum + (a.currentValue || a.acquisitionCost || 0), 0);
    const activeAssets = assets.filter(a => a.status === 'Active' && a.isActive !== false).length;
    const maintenanceAssets = assets.filter(a => a.status === 'Under Maintenance' || a.status === 'Maintenance').length;
    const disposedAssets = assets.filter(a => a.status === 'Disposed' || a.isActive === false).length;

    // Calculate depreciation
    const totalAcquisitionCost = assets.reduce((sum, a) => sum + (a.acquisitionCost || 0), 0);
    const totalDepreciation = assets.reduce((sum, a) => sum + (a.accumulatedDepreciation || 0), 0);
    const netBookValue = totalAcquisitionCost - totalDepreciation;

    // Assets needing maintenance (simplified - check if warranty is expiring or status)
    const maintenanceDue = assets.filter(a => {
      if (a.status === 'Under Maintenance') return true;
      if (a.warrantyExpiryDate) {
        const expiry = new Date(a.warrantyExpiryDate);
        const now = new Date();
        const daysUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return daysUntilExpiry < 30 && daysUntilExpiry > 0;
      }
      return false;
    }).length;

    return {
      totalAssets,
      totalValue: Math.round(totalValue),
      totalCurrentValue: Math.round(totalCurrentValue),
      activeAssets,
      maintenanceAssets,
      disposedAssets,
      totalAcquisitionCost: Math.round(totalAcquisitionCost),
      totalDepreciation: Math.round(totalDepreciation),
      netBookValue: Math.round(netBookValue),
      maintenanceDue,
    };
  }, [assets]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
    if (!isActive) return <Trash2 className="h-4 w-4 text-red-600" />;

    switch (status) {
      case 'Active':
      case 'In Use': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Under Maintenance':
      case 'Maintenance': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'Disposed': return <Trash2 className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  // ✅ Handle delete
  const handleDelete = async (id: string) => {
    try {
      await deleteAsset(id);
      showToast.success('Asset deleted successfully');
      await fetchAssets();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting asset:', error);
      showToast.error('Failed to delete asset');
    }
  };

  // ✅ Handle toggle status
  const handleToggleStatus = async (id: string) => {
    try {
      await toggleAssetStatus(id);
      showToast.success('Asset status toggled successfully');
      await fetchAssets();
    } catch (error) {
      console.error('Error toggling asset status:', error);
      showToast.error('Failed to toggle asset status');
    }
  };

  // ✅ Filter assets
  const filteredAssets = assets.filter(asset => {
    const matchesSearch =
        asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'All' || asset.status === filterStatus;
    const matchesType = filterType === 'All' || asset.assetType === filterType;
    const matchesCategory = filterCategory === 'All' || asset.assetCategory === filterCategory;

    return matchesSearch && matchesStatus && matchesType && matchesCategory;
  });

  // ✅ Pagination
  const totalPages = Math.ceil(filteredAssets.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAssets = filteredAssets.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // ✅ Unique categories for filters
  const uniqueCategories = Array.from(new Set(assets.map(a => a.assetCategory).filter(Boolean)));
  const uniqueTypes = Array.from(new Set(assets.map(a => a.assetType).filter(Boolean)));

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );
  }

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Package className="h-5 w-5 text-indigo-600" />
              </div>
              Asset Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage and track all company assets</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
                onClick={fetchAssets}
                variant="outline"
                className="flex items-center gap-2"
                disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </Button>
            <Button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700">
              <Plus size={16} />
              Add Asset
            </Button>
          </div>
        </div>

        {/* Stats Cards - Using actual asset data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-indigo-700 font-medium">Total Assets</p>
                  <p className="text-2xl font-bold text-indigo-900">{stats.totalAssets}</p>
                </div>
                <div className="p-3 bg-indigo-200 rounded-lg">
                  <Package className="h-6 w-6 text-indigo-700" />
                </div>
              </div>
              <p className="text-xs text-indigo-600 mt-1">{stats.activeAssets} active</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-700 font-medium">Total Value</p>
                  <p className="text-2xl font-bold text-emerald-900">{formatCurrency(stats.totalValue)}</p>
                </div>
                <div className="p-3 bg-emerald-200 rounded-lg">
                  <DollarSign className="h-6 w-6 text-emerald-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Net Book Value</p>
                  <p className="text-2xl font-bold text-blue-900">{formatCurrency(stats.netBookValue)}</p>
                </div>
                <div className="p-3 bg-blue-200 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700 font-medium">Depreciation</p>
                  <p className="text-2xl font-bold text-amber-900">{formatCurrency(stats.totalDepreciation)}</p>
                </div>
                <div className="p-3 bg-amber-200 rounded-lg">
                  <TrendingDown className="h-6 w-6 text-amber-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-700 font-medium">Maintenance</p>
                  <p className="text-2xl font-bold text-orange-900">{stats.maintenanceDue}</p>
                </div>
                <div className="p-3 bg-orange-200 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-orange-700" />
                </div>
              </div>
              <p className="text-xs text-orange-600 mt-1">Due soon</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 font-medium">Acquisition</p>
                  <p className="text-2xl font-bold text-purple-900">{formatCurrency(stats.totalAcquisitionCost)}</p>
                </div>
                <div className="p-3 bg-purple-200 rounded-lg">
                  <Tag className="h-6 w-6 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
              <SelectItem value="Disposed">Disposed</SelectItem>
              <SelectItem value="Idle">Idle</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <Tag className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              {uniqueTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40">
              <Package className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              {uniqueCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center gap-2">
            <Download size={16} />
            Export
          </Button>
        </div>

        {/* Assets Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acquisition</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Current Value</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
              {paginatedAssets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      <Package className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                      No assets found
                      <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or add a new asset</p>
                    </td>
                  </tr>
              ) : (
                  paginatedAssets.map((asset) => (
                      <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                              <Package className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{asset.name}</p>
                              <p className="text-xs text-gray-400">{asset.code}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm text-gray-600">{asset.assetCategory || 'N/A'}</p>
                            <p className="text-xs text-gray-400">{asset.assetType || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            {asset.location || 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                          {formatCurrency(asset.acquisitionCost)}
                          <p className="text-xs text-gray-400">{formatDate(asset.acquisitionDate)}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-indigo-600">
                          {formatCurrency(asset.currentValue || asset.acquisitionCost || 0)}
                        </td>
                        <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 w-fit ${getStatusColor(asset.status, asset.isActive)}`}>
                              {getStatusIcon(asset.status, asset.isActive)}
                              {asset.status}
                            </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                                <MoreVertical size={16} />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 p-0" align="end">
                              <div className="py-1">
                                <button
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-gray-700 flex items-center gap-2"
                                    onClick={() => {
                                      setSelectedAsset(asset);
                                      setIsViewDialogOpen(true);
                                    }}
                                >
                                  <Eye size={16} />
                                  View Details
                                </button>
                                <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-indigo-600 flex items-center gap-2">
                                  <Edit size={16} />
                                  Edit
                                </button>
                                <button
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-amber-600 flex items-center gap-2"
                                    onClick={() => handleToggleStatus(asset.id)}
                                >
                                  <RefreshCw size={16} />
                                  Toggle Status
                                </button>
                                <button
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center gap-2"
                                    onClick={() => {
                                      setSelectedAsset(asset);
                                      setIsDeleteDialogOpen(true);
                                    }}
                                >
                                  <Trash2 size={16} />
                                  Delete
                                </button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </td>
                      </tr>
                  ))
              )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredAssets.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2 bg-gray-50">
                <p className="text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredAssets.length)} of {filteredAssets.length} assets
                </p>
                <div className="flex items-center gap-2">
                  <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages || 1}
                  </span>
                  <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
          )}
        </div>

        {/* View Asset Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-indigo-600" />
                Asset Details
              </DialogTitle>
              <DialogDescription>
                Detailed information about the selected asset
              </DialogDescription>
            </DialogHeader>
            {selectedAsset && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="font-medium">{selectedAsset.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Code</p>
                      <p className="font-medium">{selectedAsset.code}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Serial Number</p>
                      <p className="font-medium">{selectedAsset.serialNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Model</p>
                      <p className="font-medium">{selectedAsset.model || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Manufacturer</p>
                      <p className="font-medium">{selectedAsset.manufacturer || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="font-medium">{selectedAsset.location || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedAsset.status, selectedAsset.isActive)}`}>
                      {selectedAsset.status}
                    </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Asset Type</p>
                      <p className="font-medium">{selectedAsset.assetType || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Category</p>
                      <p className="font-medium">{selectedAsset.assetCategory || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Acquisition Cost</p>
                      <p className="font-medium text-indigo-600">{formatCurrency(selectedAsset.acquisitionCost)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Acquisition Date</p>
                      <p className="font-medium">{formatDate(selectedAsset.acquisitionDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Useful Life</p>
                      <p className="font-medium">{selectedAsset.usefulLife || 'N/A'} months</p>
                    </div>
                  </div>
                  {selectedAsset.notes && (
                      <div>
                        <p className="text-xs text-gray-500">Notes</p>
                        <p className="text-sm text-gray-600">{selectedAsset.notes}</p>
                      </div>
                  )}
                </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-red-600 flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Delete Asset
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedAsset?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                  variant="destructive"
                  onClick={() => selectedAsset && handleDelete(selectedAsset.id)}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
  );
};

export default PageAssets;