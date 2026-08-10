// src/pages/finance/assetCapitalizationPage/AssetCapitalizationPage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp, RefreshCw, Search, Filter, Eye, Edit, Trash2,
    Plus, DollarSign, Calendar, Building2, MapPin, Tag,
    ChevronLeft, ChevronRight, MoreVertical, Save, X,
    AlertCircle, CheckCircle, FileText, Package, Clock,
    TrendingDown, User, Briefcase, Home, Shield
} from 'lucide-react';
import {
    getAssets,
    createAsset,
    updateAsset,
    deleteAsset,
    toggleAssetStatus
} from '@/modules/finance/services/finance.api';
import { showToast } from '@/shared/layout/layout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
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

// ✅ Form data interface
interface AssetFormData {
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
    departmentId: string | null;
    branchId: string | null;
    accountId: string | null;
    purchaseDate: string | null;
    warrantyInfo: string | null;
    warrantyExpiryDate: string | null;
    notes: string | null;
}

const AssetCapitalizationPage: React.FC = () => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterType, setFilterType] = useState('All');
    const [filterCategory, setFilterCategory] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const ITEMS_PER_PAGE = 10;

    // ✅ Initialize form data
    const initialFormData: AssetFormData = {
        name: '',
        code: '',
        description: '',
        serialNumber: '',
        model: '',
        manufacturer: '',
        location: '',
        acquisitionCost: 0,
        acquisitionDate: new Date().toISOString().split('T')[0],
        salvageValue: 0,
        usefulLife: 36,
        depreciationRate: 2.78,
        assetType: 'Fixed',
        assetCategory: 'Equipment',
        status: 'Active',
        isActive: true,
        assignedTo: null,
        departmentId: null,
        branchId: null,
        accountId: null,
        purchaseDate: null,
        warrantyInfo: null,
        warrantyExpiryDate: null,
        notes: null,
    };

    const [formData, setFormData] = useState<AssetFormData>(initialFormData);

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

            setAssets(assetData);
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

    // ✅ Handle create asset
    const handleCreateAsset = async () => {
        if (!formData.name || !formData.code) {
            showToast.error('Name and Code are required');
            return;
        }

        try {
            await createAsset(formData);
            showToast.success('Asset capitalized successfully');
            setIsAddModalOpen(false);
            setFormData(initialFormData);
            await fetchAssets();
        } catch (error: any) {
            console.error('Error capitalizing asset:', error);
            showToast.error(error?.response?.data?.message || 'Failed to capitalize asset');
        }
    };

    // ✅ Handle update asset
    const handleUpdateAsset = async () => {
        if (!selectedAsset) return;

        try {
            const payload = {
                id: selectedAsset.id,
                ...formData,
            };

            await updateAsset(payload);
            showToast.success('Asset updated successfully');
            setIsEditModalOpen(false);
            await fetchAssets();
        } catch (error: any) {
            console.error('Error updating asset:', error);
            showToast.error(error?.response?.data?.message || 'Failed to update asset');
        }
    };

    // ✅ Handle delete asset
    const handleDeleteAsset = async () => {
        if (!selectedAsset) return;

        try {
            await deleteAsset(selectedAsset.id);
            showToast.success('Asset deleted successfully');
            setIsDeleteModalOpen(false);
            await fetchAssets();
        } catch (error: any) {
            console.error('Error deleting asset:', error);
            showToast.error(error?.response?.data?.message || 'Failed to delete asset');
        }
    };

    // ✅ Handle toggle status
    const handleToggleStatus = async (id: string) => {
        try {
            await toggleAssetStatus(id);
            showToast.success('Asset status toggled successfully');
            await fetchAssets();
        } catch (error: any) {
            console.error('Error toggling asset status:', error);
            showToast.error(error?.response?.data?.message || 'Failed to toggle asset status');
        }
    };

    // ✅ Open edit modal
    const openEditModal = (asset: Asset) => {
        setSelectedAsset(asset);
        setFormData({
            name: asset.name,
            code: asset.code,
            description: asset.description || '',
            serialNumber: asset.serialNumber || '',
            model: asset.model || '',
            manufacturer: asset.manufacturer || '',
            location: asset.location || '',
            acquisitionCost: asset.acquisitionCost || 0,
            acquisitionDate: asset.acquisitionDate ? asset.acquisitionDate.split('T')[0] : new Date().toISOString().split('T')[0],
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
            purchaseDate: asset.purchaseDate ? asset.purchaseDate.split('T')[0] : null,
            warrantyInfo: asset.warrantyInfo || null,
            warrantyExpiryDate: asset.warrantyExpiryDate ? asset.warrantyExpiryDate.split('T')[0] : null,
            notes: asset.notes || null,
        });
        setIsEditModalOpen(true);
    };

    // ✅ Reset form
    const resetForm = () => {
        setFormData(initialFormData);
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

    // ✅ Calculate stats
    const stats = useMemo(() => {
        const totalAssets = assets.length;
        const totalValue = assets.reduce((sum, a) => sum + (a.acquisitionCost || 0), 0);
        const activeAssets = assets.filter(a => a.status === 'Active' && a.isActive !== false).length;
        const inactiveAssets = assets.filter(a => a.status === 'Disposed' || a.isActive === false).length;
        const underMaintenance = assets.filter(a => a.status === 'Under Maintenance' || a.status === 'Maintenance').length;

        return {
            totalAssets,
            totalValue: Math.round(totalValue),
            activeAssets,
            inactiveAssets,
            underMaintenance,
        };
    }, [assets]);

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

    // ✅ Unique categories and types for filters
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
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Asset Capitalization</h1>
                        <p className="text-sm text-gray-500">Capitalize and manage fixed assets</p>
                    </div>
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
                        onClick={() => {
                            resetForm();
                            setIsAddModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
                    >
                        <Plus size={16} />
                        Capitalize Asset
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 font-medium">Active</p>
                                <p className="text-2xl font-bold text-green-900">{stats.activeAssets}</p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-green-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-700 font-medium">Total Value</p>
                                <p className="text-2xl font-bold text-orange-900">
                                    {formatCurrency(stats.totalValue)}
                                </p>
                            </div>
                            <div className="p-3 bg-orange-200 rounded-lg">
                                <DollarSign className="h-6 w-6 text-orange-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-red-700 font-medium">Inactive / Disposed</p>
                                <p className="text-2xl font-bold text-red-900">{stats.inactiveAssets}</p>
                            </div>
                            <div className="p-3 bg-red-200 rounded-lg">
                                <AlertCircle className="h-6 w-6 text-red-700" />
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
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cost</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {paginatedAssets.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                    <Package className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                                    No assets found
                                    <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or capitalize a new asset</p>
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
                                                {asset.serialNumber && (
                                                    <p className="text-xs text-gray-400">SN: {asset.serialNumber}</p>
                                                )}
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
                                    <td className="px-4 py-3 text-sm text-right font-medium text-indigo-600">
                                        {formatCurrency(asset.acquisitionCost)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={getStatusColor(asset.status, asset.isActive)}>
                                            {asset.status}
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
                                            <button
                                                onClick={() => openEditModal(asset)}
                                                className="p-1 hover:bg-yellow-100 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit size={16} className="text-yellow-600" />
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(asset.id)}
                                                className="p-1 hover:bg-purple-100 rounded-lg transition-colors"
                                                title="Toggle Status"
                                            >
                                                <RefreshCw size={16} className="text-purple-500" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedAsset(asset);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                                className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} className="text-red-500" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
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

            {/* Create Asset Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5 text-indigo-600" />
                            Capitalize Asset
                        </DialogTitle>
                        <DialogDescription>
                            Create a new fixed asset in the system.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Asset Code *</Label>
                                <Input
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    placeholder="e.g., AST-001"
                                />
                            </div>
                            <div>
                                <Label>Asset Name *</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Asset name"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Serial Number</Label>
                                <Input
                                    value={formData.serialNumber}
                                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                                    placeholder="SN-001"
                                />
                            </div>
                            <div>
                                <Label>Model</Label>
                                <Input
                                    value={formData.model}
                                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                    placeholder="Model name"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Manufacturer</Label>
                                <Input
                                    value={formData.manufacturer}
                                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                                    placeholder="Manufacturer"
                                />
                            </div>
                            <div>
                                <Label>Location</Label>
                                <Input
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="Location"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label>Asset Type</Label>
                                <Select
                                    value={formData.assetType}
                                    onValueChange={(value) => setFormData({ ...formData, assetType: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Fixed">Fixed</SelectItem>
                                        <SelectItem value="Current">Current</SelectItem>
                                        <SelectItem value="Intangible">Intangible</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Category</Label>
                                <Select
                                    value={formData.assetCategory}
                                    onValueChange={(value) => setFormData({ ...formData, assetCategory: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Equipment">Equipment</SelectItem>
                                        <SelectItem value="Furniture">Furniture</SelectItem>
                                        <SelectItem value="Vehicle">Vehicle</SelectItem>
                                        <SelectItem value="Software">Software</SelectItem>
                                        <SelectItem value="Building">Building</SelectItem>
                                        <SelectItem value="Land">Land</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                                        <SelectItem value="Idle">Idle</SelectItem>
                                        <SelectItem value="Disposed">Disposed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label>Acquisition Date</Label>
                                <Input
                                    type="date"
                                    value={formData.acquisitionDate}
                                    onChange={(e) => setFormData({ ...formData, acquisitionDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Acquisition Cost ($)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.acquisitionCost || ''}
                                    onChange={(e) => setFormData({ ...formData, acquisitionCost: parseFloat(e.target.value) || 0 })}
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <Label>Salvage Value ($)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.salvageValue || ''}
                                    onChange={(e) => setFormData({ ...formData, salvageValue: parseFloat(e.target.value) || 0 })}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Useful Life (months)</Label>
                                <Input
                                    type="number"
                                    value={formData.usefulLife}
                                    onChange={(e) => setFormData({ ...formData, usefulLife: parseInt(e.target.value) || 36 })}
                                    min="1"
                                />
                            </div>
                            <div>
                                <Label>Depreciation Rate (%)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.depreciationRate}
                                    onChange={(e) => setFormData({ ...formData, depreciationRate: parseFloat(e.target.value) || 0 })}
                                    placeholder="2.78"
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Warranty Info</Label>
                            <Input
                                value={formData.warrantyInfo || ''}
                                onChange={(e) => setFormData({ ...formData, warrantyInfo: e.target.value || null })}
                                placeholder="Warranty details"
                            />
                        </div>
                        <div>
                            <Label>Notes</Label>
                            <Textarea
                                value={formData.notes || ''}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })}
                                placeholder="Additional notes"
                                rows={2}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleCreateAsset}>
                            <Save className="h-4 w-4 mr-2" />
                            Capitalize
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Asset Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Edit className="h-5 w-5 text-indigo-600" />
                            Edit Asset
                        </DialogTitle>
                        <DialogDescription>
                            Update the asset details.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Asset Code *</Label>
                                <Input
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Asset Name *</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Serial Number</Label>
                                <Input
                                    value={formData.serialNumber}
                                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Model</Label>
                                <Input
                                    value={formData.model}
                                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Manufacturer</Label>
                                <Input
                                    value={formData.manufacturer}
                                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Location</Label>
                                <Input
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label>Asset Type</Label>
                                <Select
                                    value={formData.assetType}
                                    onValueChange={(value) => setFormData({ ...formData, assetType: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Fixed">Fixed</SelectItem>
                                        <SelectItem value="Current">Current</SelectItem>
                                        <SelectItem value="Intangible">Intangible</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Category</Label>
                                <Select
                                    value={formData.assetCategory}
                                    onValueChange={(value) => setFormData({ ...formData, assetCategory: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Equipment">Equipment</SelectItem>
                                        <SelectItem value="Furniture">Furniture</SelectItem>
                                        <SelectItem value="Vehicle">Vehicle</SelectItem>
                                        <SelectItem value="Software">Software</SelectItem>
                                        <SelectItem value="Building">Building</SelectItem>
                                        <SelectItem value="Land">Land</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                                        <SelectItem value="Idle">Idle</SelectItem>
                                        <SelectItem value="Disposed">Disposed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label>Acquisition Date</Label>
                                <Input
                                    type="date"
                                    value={formData.acquisitionDate}
                                    onChange={(e) => setFormData({ ...formData, acquisitionDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Acquisition Cost ($)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.acquisitionCost || ''}
                                    onChange={(e) => setFormData({ ...formData, acquisitionCost: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div>
                                <Label>Salvage Value ($)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.salvageValue || ''}
                                    onChange={(e) => setFormData({ ...formData, salvageValue: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Useful Life (months)</Label>
                                <Input
                                    type="number"
                                    value={formData.usefulLife}
                                    onChange={(e) => setFormData({ ...formData, usefulLife: parseInt(e.target.value) || 36 })}
                                />
                            </div>
                            <div>
                                <Label>Depreciation Rate (%)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.depreciationRate}
                                    onChange={(e) => setFormData({ ...formData, depreciationRate: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Warranty Info</Label>
                            <Input
                                value={formData.warrantyInfo || ''}
                                onChange={(e) => setFormData({ ...formData, warrantyInfo: e.target.value || null })}
                            />
                        </div>
                        <div>
                            <Label>Notes</Label>
                            <Textarea
                                value={formData.notes || ''}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })}
                                rows={2}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleUpdateAsset}>
                            <Save className="h-4 w-4 mr-2" />
                            Update
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
                                        {selectedAsset.status}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Acquisition Cost</p>
                                    <p className="font-bold text-indigo-600">{formatCurrency(selectedAsset.acquisitionCost)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Acquisition Date</p>
                                    <p className="font-medium">{formatDate(selectedAsset.acquisitionDate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Salvage Value</p>
                                    <p className="font-medium">{formatCurrency(selectedAsset.salvageValue)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Useful Life</p>
                                    <p className="font-medium">{selectedAsset.usefulLife || 'N/A'} months</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Depreciation Rate</p>
                                    <p className="font-medium">{selectedAsset.depreciationRate || 'N/A'}%</p>
                                </div>
                                {selectedAsset.assignedToName && (
                                    <div>
                                        <p className="text-sm text-gray-500">Assigned To</p>
                                        <p className="font-medium">{selectedAsset.assignedToName}</p>
                                    </div>
                                )}
                                {selectedAsset.departmentName && (
                                    <div>
                                        <p className="text-sm text-gray-500">Department</p>
                                        <p className="font-medium">{selectedAsset.departmentName}</p>
                                    </div>
                                )}
                                {selectedAsset.branchName && (
                                    <div>
                                        <p className="text-sm text-gray-500">Branch</p>
                                        <p className="font-medium">{selectedAsset.branchName}</p>
                                    </div>
                                )}
                                {selectedAsset.warrantyInfo && (
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-500">Warranty</p>
                                        <p className="font-medium">{selectedAsset.warrantyInfo}</p>
                                        {selectedAsset.warrantyExpiryDate && (
                                            <p className="text-sm text-gray-500">Expires: {formatDate(selectedAsset.warrantyExpiryDate)}</p>
                                        )}
                                    </div>
                                )}
                                {selectedAsset.notes && (
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-500">Notes</p>
                                        <p className="font-medium text-gray-600">{selectedAsset.notes}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-gray-500">Created</p>
                                    <p className="font-medium">{formatDate(selectedAsset.dateAdd)}</p>
                                </div>
                                {selectedAsset.dateMod && (
                                    <div>
                                        <p className="text-sm text-gray-500">Last Modified</p>
                                        <p className="font-medium">{formatDate(selectedAsset.dateMod)}</p>
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

            {/* Delete Asset Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            Delete Asset
                        </DialogTitle>
                        <DialogDescription>
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-gray-700">
                            Are you sure you want to delete <strong>{selectedAsset?.name}</strong>?
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                        <Button className="bg-red-600 hover:bg-red-700" onClick={handleDeleteAsset}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default AssetCapitalizationPage;