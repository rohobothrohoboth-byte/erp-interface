// src/pages/finance/assetDisposalPage/AssetDisposal.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Trash2, RefreshCw, Search, Filter, Eye, Edit,
    Plus, DollarSign, Calendar, Building2, MapPin, Tag,
    ChevronLeft, ChevronRight, MoreVertical, Save, X,
    AlertCircle, CheckCircle, FileText, Package, Clock,
    TrendingDown, TrendingUp, Download, Printer,
    BookOpen, User, Briefcase, Home
} from 'lucide-react';
import {
    getAssets,
    getAssetById,
    updateAsset,
    deleteAsset,
    toggleAssetStatus
} from '../../../services/finance/finance.api';
import { showToast } from '../../../layout/layout';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '../../../components/ui/dialog';

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

// ✅ Extended asset for disposal
interface AssetDisposal extends Asset {
    netBookValue: number;
    accumulatedDepreciationValue: number;
    disposalDate?: string;
    disposalAmount?: number;
    disposalReason?: string;
    disposalMethod?: 'Sale' | 'Scrap' | 'Donation' | 'Write-off';
    gainLoss?: number;
    buyerName?: string;
}

const AssetDisposal: React.FC = () => {
    const [assets, setAssets] = useState<AssetDisposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedAsset, setSelectedAsset] = useState<AssetDisposal | null>(null);
    const [isDisposeModalOpen, setIsDisposeModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        disposalDate: new Date().toISOString().split('T')[0],
        disposalMethod: 'Sale' as 'Sale' | 'Scrap' | 'Donation' | 'Write-off',
        disposalAmount: 0,
        buyerName: '',
        disposalReason: '',
        notes: '',
    });

    const ITEMS_PER_PAGE = 10;

    // ✅ Fetch assets from the actual Assets API
    const fetchAssets = async () => {
        try {
            setLoading(true);
            const response = await getAssets({ status: 'All' });

            // Handle different response formats
            let assetData = response?.data?.data || response?.data || response || [];

            if (Array.isArray(assetData) && assetData.length > 0 && assetData[0].data) {
                assetData = assetData[0].data;
            }

            // ✅ Calculate net book value and accumulated depreciation
            const assetsWithValues = assetData.map((a: any) => {
                const acquisitionCost = a.acquisitionCost || 0;
                const accumulatedDep = a.accumulatedDepreciation || 0;
                const netBookValue = Math.max(0, acquisitionCost - accumulatedDep);

                return {
                    ...a,
                    netBookValue,
                    accumulatedDepreciationValue: accumulatedDep,
                };
            });

            setAssets(assetsWithValues);
        } catch (error) {
            console.error('Error fetching assets:', error);
            showToast.error('Failed to load assets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets();
    }, []);

    // ✅ Handle dispose asset
    const handleDisposeAsset = async () => {
        if (!selectedAsset) return;

        if (!formData.disposalDate || !formData.disposalMethod) {
            showToast.error('Disposal date and method are required');
            return;
        }

        try {
            const gainLoss = (formData.disposalAmount || 0) - (selectedAsset.netBookValue || 0);

            // ✅ Update asset status to Disposed
            await updateAsset({
                id: selectedAsset.id,
                name: selectedAsset.name,
                code: selectedAsset.code,
                description: selectedAsset.description || '',
                serialNumber: selectedAsset.serialNumber || '',
                model: selectedAsset.model || '',
                manufacturer: selectedAsset.manufacturer || '',
                location: selectedAsset.location || '',
                acquisitionCost: selectedAsset.acquisitionCost || 0,
                acquisitionDate: selectedAsset.acquisitionDate || new Date().toISOString().split('T')[0],
                salvageValue: selectedAsset.salvageValue || 0,
                usefulLife: selectedAsset.usefulLife || 36,
                depreciationRate: selectedAsset.depreciationRate || 2.78,
                assetType: selectedAsset.assetType || 'Fixed',
                assetCategory: selectedAsset.assetCategory || 'Equipment',
                status: 'Disposed',
                isActive: false,
                assignedTo: selectedAsset.assignedTo || null,
                departmentId: selectedAsset.departmentId || null,
                branchId: selectedAsset.branchId || null,
                accountId: selectedAsset.accountId || null,
                purchaseDate: selectedAsset.purchaseDate || null,
                currentValue: selectedAsset.currentValue || 0,
                accumulatedDepreciation: selectedAsset.accumulatedDepreciation || 0,
                lastDepreciationDate: selectedAsset.lastDepreciationDate || null,
                warrantyInfo: selectedAsset.warrantyInfo || null,
                warrantyExpiryDate: selectedAsset.warrantyExpiryDate || null,
                notes: `Disposed: ${formData.disposalReason || 'Asset disposal'}. Method: ${formData.disposalMethod}. ${selectedAsset.notes || ''}`,
            });

            showToast.success(`Asset ${selectedAsset.name} disposed successfully`);
            setIsDisposeModalOpen(false);
            setIsConfirmModalOpen(false);
            resetForm();
            await fetchAssets();
        } catch (error: any) {
            console.error('Error disposing asset:', error);
            showToast.error(error?.response?.data?.message || 'Failed to dispose asset');
        }
    };

    // ✅ Reset form
    const resetForm = () => {
        setFormData({
            disposalDate: new Date().toISOString().split('T')[0],
            disposalMethod: 'Sale',
            disposalAmount: 0,
            buyerName: '',
            disposalReason: '',
            notes: '',
        });
    };

    // ✅ Open dispose modal
    const openDisposeModal = (asset: AssetDisposal) => {
        setSelectedAsset(asset);
        setFormData({
            ...formData,
            disposalAmount: asset.netBookValue || 0,
        });
        setIsDisposeModalOpen(true);
    };

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

    const getMethodBadge = (method: string) => {
        const colors: Record<string, string> = {
            Sale: 'bg-blue-100 text-blue-700 border-blue-200',
            Scrap: 'bg-gray-100 text-gray-700 border-gray-200',
            Donation: 'bg-purple-100 text-purple-700 border-purple-200',
            'Write-off': 'bg-red-100 text-red-700 border-red-200',
        };
        return colors[method] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    // ✅ Calculate stats
    const stats = useMemo(() => {
        const totalAssets = assets.length;
        const totalValue = assets.reduce((sum, a) => sum + (a.acquisitionCost || 0), 0);
        const totalNetBook = assets.reduce((sum, a) => sum + (a.netBookValue || 0), 0);
        const activeCount = assets.filter(a => a.status === 'Active' && a.isActive !== false).length;
        const disposedCount = assets.filter(a => a.status === 'Disposed' || a.isActive === false).length;
        const totalDepreciation = assets.reduce((sum, a) => sum + (a.accumulatedDepreciationValue || 0), 0);

        return {
            totalAssets,
            totalValue: Math.round(totalValue),
            totalNetBook: Math.round(totalNetBook),
            activeCount,
            disposedCount,
            totalDepreciation: Math.round(totalDepreciation),
        };
    }, [assets]);

    // ✅ Filter assets
    const filteredAssets = assets.filter(asset => {
        const matchesSearch =
            asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase());

        const isDisposed = asset.status === 'Disposed' || asset.isActive === false;
        const matchesStatus = filterStatus === 'All' ||
            (filterStatus === 'Active' && !isDisposed) ||
            (filterStatus === 'Disposed' && isDisposed);

        return matchesSearch && matchesStatus;
    });

    // ✅ Pagination
    const totalPages = Math.ceil(filteredAssets.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedAssets = filteredAssets.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
                        <div className="p-2 bg-red-100 rounded-lg">
                            <Trash2 className="w-6 h-6 text-red-600" />
                        </div>
                        Asset Disposal
                    </h1>
                    <p className="text-sm text-gray-500">Manage asset disposals and write-offs</p>
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
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <Download size={16} />
                        Export
                    </Button>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <Printer size={16} />
                        Print
                    </Button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Total Assets</p>
                                <p className="text-2xl font-bold text-blue-900">{stats.totalAssets}</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-lg">
                                <Package className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                        <p className="text-xs text-blue-600 mt-1">{stats.activeCount} active</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 font-medium">Total Cost</p>
                                <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.totalValue)}</p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-lg">
                                <DollarSign className="h-6 w-6 text-green-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Net Book Value</p>
                                <p className="text-2xl font-bold text-purple-900">{formatCurrency(stats.totalNetBook)}</p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-lg">
                                <BookOpen className="h-6 w-6 text-purple-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-700 font-medium">Depreciation</p>
                                <p className="text-2xl font-bold text-orange-900">{formatCurrency(stats.totalDepreciation)}</p>
                            </div>
                            <div className="p-3 bg-orange-200 rounded-lg">
                                <TrendingDown className="h-6 w-6 text-orange-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-red-700 font-medium">Disposed</p>
                                <p className="text-2xl font-bold text-red-900">{stats.disposedCount}</p>
                            </div>
                            <div className="p-3 bg-red-200 rounded-lg">
                                <Trash2 className="h-6 w-6 text-red-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search assets by name, code, or serial..."
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
                        <SelectItem value="Disposed">Disposed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Assets Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cost</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Depreciation</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Book Value</th>
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
                                </td>
                            </tr>
                        ) : (
                            paginatedAssets.map((asset) => {
                                const isDisposed = asset.status === 'Disposed' || asset.isActive === false;
                                return (
                                    <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isDisposed ? 'bg-red-100' : 'bg-indigo-100'}`}>
                                                    <Package className={`h-5 w-5 ${isDisposed ? 'text-red-600' : 'text-indigo-600'}`} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{asset.name}</p>
                                                    <p className="text-xs text-gray-400">{asset.serialNumber || 'No SN'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-mono text-gray-600">{asset.code}</td>
                                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                                            {formatCurrency(asset.acquisitionCost || 0)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right text-orange-600">
                                            {formatCurrency(asset.accumulatedDepreciationValue || 0)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right font-medium text-indigo-600">
                                            {formatCurrency(asset.netBookValue || 0)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge className={getStatusColor(asset.status, asset.isActive)}>
                                                {isDisposed ? 'Disposed' : asset.status || 'Active'}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => {
                                                        setSelectedAsset(asset);
                                                        setIsViewModalOpen(true);
                                                    }}
                                                    className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                                                    title="View"
                                                >
                                                    <Eye size={16} className="text-blue-500" />
                                                </button>
                                                {!isDisposed && (
                                                    <button
                                                        onClick={() => openDisposeModal(asset)}
                                                        className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                                                        title="Dispose"
                                                    >
                                                        <Trash2 size={16} className="text-red-500" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        </tbody>
                    </table>
                </div>
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
            </div>

            {/* Dispose Modal */}
            <Dialog open={isDisposeModalOpen} onOpenChange={setIsDisposeModalOpen}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <Trash2 className="h-5 w-5" />
                            Dispose Asset
                        </DialogTitle>
                        <DialogDescription>
                            Record the disposal of this asset. This action will mark the asset as disposed.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedAsset && (
                        <div className="space-y-4 py-4">
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-sm font-medium text-gray-900">{selectedAsset.name}</p>
                                <p className="text-xs text-gray-500">Code: {selectedAsset.code}</p>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <div>
                                        <p className="text-xs text-gray-500">Cost</p>
                                        <p className="text-sm font-medium">{formatCurrency(selectedAsset.acquisitionCost)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Net Book Value</p>
                                        <p className="text-sm font-medium text-indigo-600">{formatCurrency(selectedAsset.netBookValue)}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label>Disposal Date *</Label>
                                <Input
                                    type="date"
                                    value={formData.disposalDate}
                                    onChange={(e) => setFormData({ ...formData, disposalDate: e.target.value })}
                                />
                            </div>

                            <div>
                                <Label>Disposal Method *</Label>
                                <Select
                                    value={formData.disposalMethod}
                                    onValueChange={(value) => setFormData({ ...formData, disposalMethod: value as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Sale">Sale</SelectItem>
                                        <SelectItem value="Scrap">Scrap</SelectItem>
                                        <SelectItem value="Donation">Donation</SelectItem>
                                        <SelectItem value="Write-off">Write-off</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Disposal Amount</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.disposalAmount || ''}
                                    onChange={(e) => setFormData({ ...formData, disposalAmount: parseFloat(e.target.value) || 0 })}
                                    placeholder="0.00"
                                />
                                {selectedAsset && (
                                    <p className={`text-xs mt-1 ${(formData.disposalAmount || 0) - (selectedAsset.netBookValue || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        Gain/Loss: {formatCurrency((formData.disposalAmount || 0) - (selectedAsset.netBookValue || 0))}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label>Buyer Name (Optional)</Label>
                                <Input
                                    value={formData.buyerName}
                                    onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                                    placeholder="Enter buyer name"
                                />
                            </div>

                            <div>
                                <Label>Disposal Reason</Label>
                                <Input
                                    value={formData.disposalReason}
                                    onChange={(e) => setFormData({ ...formData, disposalReason: e.target.value })}
                                    placeholder="Reason for disposal"
                                />
                            </div>

                            <div>
                                <Label>Notes</Label>
                                <Textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Additional notes..."
                                    rows={2}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDisposeModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => {
                                setIsDisposeModalOpen(false);
                                setIsConfirmModalOpen(true);
                            }}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Proceed to Dispose
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirm Disposal Modal */}
            <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            Confirm Disposal
                        </DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. The asset will be marked as disposed.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-gray-700">
                            Are you sure you want to dispose <strong>{selectedAsset?.name}</strong>?
                        </p>
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-1 border border-gray-200">
                            <p className="text-sm"><span className="text-gray-500">Method:</span> {formData.disposalMethod}</p>
                            <p className="text-sm"><span className="text-gray-500">Amount:</span> {formatCurrency(formData.disposalAmount)}</p>
                            <p className="text-sm"><span className="text-gray-500">Net Book Value:</span> {formatCurrency(selectedAsset?.netBookValue || 0)}</p>
                            <p className="text-sm">
                                <span className="text-gray-500">Gain/Loss:</span>
                                <span className={(formData.disposalAmount || 0) - (selectedAsset?.netBookValue || 0) >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                    {formatCurrency((formData.disposalAmount || 0) - (selectedAsset?.netBookValue || 0))}
                                </span>
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)}>Cancel</Button>
                        <Button className="bg-red-600 hover:bg-red-700" onClick={handleDisposeAsset}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Confirm Disposal
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Asset Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-indigo-600" />
                            Asset Details
                        </DialogTitle>
                        <DialogDescription>
                            View asset information.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedAsset && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Code</p>
                                    <p className="font-mono font-medium">{selectedAsset.code}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium">{selectedAsset.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Serial Number</p>
                                    <p className="font-medium">{selectedAsset.serialNumber || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Model</p>
                                    <p className="font-medium">{selectedAsset.model || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Manufacturer</p>
                                    <p className="font-medium">{selectedAsset.manufacturer || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Location</p>
                                    <p className="font-medium">{selectedAsset.location || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Asset Type</p>
                                    <p className="font-medium">{selectedAsset.assetType || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Category</p>
                                    <p className="font-medium">{selectedAsset.assetCategory || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <Badge className={getStatusColor(selectedAsset.status, selectedAsset.isActive)}>
                                        {selectedAsset.status || 'Active'}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Acquisition Cost</p>
                                    <p className="font-bold text-indigo-600">{formatCurrency(selectedAsset.acquisitionCost)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Net Book Value</p>
                                    <p className="font-bold text-purple-600">{formatCurrency(selectedAsset.netBookValue)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Accumulated Depreciation</p>
                                    <p className="font-bold text-orange-600">{formatCurrency(selectedAsset.accumulatedDepreciationValue)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Acquisition Date</p>
                                    <p className="font-medium">{formatDate(selectedAsset.acquisitionDate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Useful Life</p>
                                    <p className="font-medium">{selectedAsset.usefulLife || 'N/A'} months</p>
                                </div>
                                {selectedAsset.assignedToName && (
                                    <div>
                                        <p className="text-sm text-gray-500">Assigned To</p>
                                        <p className="font-medium flex items-center gap-1">
                                            <User className="h-3 w-3 text-gray-400" />
                                            {selectedAsset.assignedToName}
                                        </p>
                                    </div>
                                )}
                                {selectedAsset.departmentName && (
                                    <div>
                                        <p className="text-sm text-gray-500">Department</p>
                                        <p className="font-medium flex items-center gap-1">
                                            <Briefcase className="h-3 w-3 text-gray-400" />
                                            {selectedAsset.departmentName}
                                        </p>
                                    </div>
                                )}
                                {selectedAsset.branchName && (
                                    <div>
                                        <p className="text-sm text-gray-500">Branch</p>
                                        <p className="font-medium flex items-center gap-1">
                                            <Home className="h-3 w-3 text-gray-400" />
                                            {selectedAsset.branchName}
                                        </p>
                                    </div>
                                )}
                                {selectedAsset.notes && (
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-500">Notes</p>
                                        <p className="font-medium text-gray-600">{selectedAsset.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default AssetDisposal;