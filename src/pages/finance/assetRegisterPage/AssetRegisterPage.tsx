// src/pages/finance/assetRegisterPage/AssetRegisterPage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Package, Search, RefreshCw, Eye, Edit, Trash2,
    Plus, Download, Filter, ChevronLeft, ChevronRight,
    DollarSign, Calendar, Building2, MapPin, Tag,
    AlertCircle, CheckCircle, FileText, Clock, MoreVertical, TrendingDown,
    Shield, Briefcase, Wrench, Printer, Laptop, Truck, Home, Landmark,
    Building, Warehouse, Sofa, Lightbulb, Settings, Car, Code,
    Save, Loader2
} from 'lucide-react';
import { getAssets, updateAsset, deleteAsset ,getDepartments} from '../../../services/finance/finance.api';

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
import { useNavigate } from 'react-router-dom';

// ✅ Asset interface matching your API
interface Asset {
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

// ✅ Extended asset for register
interface AssetRegister extends Asset {
    netBookValue: number;
    accumulatedDepreciationValue: number;
    depreciationPercent: number;
}

const FALLBACK_DEPARTMENTS = [
    { id: 'dept-1', name: 'IT Department' },
    { id: 'dept-2', name: 'Finance Department' },
    { id: 'dept-3', name: 'HR Department' },
    { id: 'dept-4', name: 'Operations' },
    { id: 'dept-5', name: 'Sales' },
    { id: 'dept-6', name: 'Marketing' },
];

const AssetRegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [assets, setAssets] = useState<AssetRegister[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterType, setFilterType] = useState('All');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterDepartment, setFilterDepartment] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedAsset, setSelectedAsset] = useState<AssetRegister | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
    const [departmentsLoading, setDepartmentsLoading] = useState(true);

    const [editForm, setEditForm] = useState<Partial<AssetRegister>>({});
    const ITEMS_PER_PAGE = 10;

    // ✅ Fetch assets from the actual Assets API
    // AssetRegisterPage.tsx - Update fetchAssets

    // AssetRegisterPage.tsx - Fixed fetchAssets

    const fetchAssets = async () => {
        try {
            setLoading(true);
            console.log('🔄 Fetching assets from API...');

            // ✅ Use the same pattern as the widget
            const response = await getAssets({ status: 'All' });

            // ✅ Log exactly what we got
            console.log('📦 Raw response:', response);

            // ✅ Extract data - try multiple formats
            let assetData = [];

            // Format 1: Direct array
            if (Array.isArray(response)) {
                assetData = response;
                console.log('✅ Format 1: Direct array');
            }
            // Format 2: response.data is array
            else if (response?.data && Array.isArray(response.data)) {
                assetData = response.data;
                console.log('✅ Format 2: response.data');
            }
            // Format 3: response.data.data is array
            else if (response?.data?.data && Array.isArray(response.data.data)) {
                assetData = response.data.data;
                console.log('✅ Format 3: response.data.data');
            }
            // Format 4: Find any array in the response
            else if (typeof response === 'object') {
                for (const key of Object.keys(response || {})) {
                    if (Array.isArray(response[key]) && response[key].length > 0) {
                        assetData = response[key];
                        console.log(`✅ Format 4: Found in response.${key}`);
                        break;
                    }
                }
            }

            // ✅ Try to find array in nested objects
            if (assetData.length === 0 && response?.data && typeof response.data === 'object') {
                for (const key of Object.keys(response.data)) {
                    if (Array.isArray(response.data[key]) && response.data[key].length > 0) {
                        assetData = response.data[key];
                        console.log(`✅ Found in response.data.${key}`);
                        break;
                    }
                }
            }

            console.log('📊 Final assets found:', assetData.length);
            console.log('📊 Sample:', assetData.length > 0 ? assetData[0] : 'None');

            if (assetData.length === 0) {
                console.warn('⚠️ No assets found');
                setAssets([]);
                setLoading(false);
                return;
            }

            // ✅ Map assets with calculations
            const assetsWithValues = assetData.map((a: any) => ({
                ...a,
                netBookValue: (a.acquisitionCost || 0) - (a.accumulatedDepreciation || 0),
                accumulatedDepreciationValue: a.accumulatedDepreciation || 0,
                depreciationPercent: a.acquisitionCost > 0
                    ? ((a.accumulatedDepreciation || 0) / a.acquisitionCost) * 100
                    : 0,
                departmentName: a.departmentName || null,
                branchName: a.branchName || null,
                assignedToName: a.assignedToName || null,
            }));

            setAssets(assetsWithValues);
            showToast.success(`Loaded ${assetsWithValues.length} assets`);

        } catch (error) {
            console.error('❌ Error fetching assets:', error);
            showToast.error('Failed to load assets');
            setAssets([]);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Fetch departments
    const fetchDepartments = async () => {
        setDepartmentsLoading(true);
        try {
            const response = await getDepartments();
            let departmentsData = response?.data?.data || response?.data || response || [];

            if (Array.isArray(departmentsData) && departmentsData.length > 0) {
                const formatted = departmentsData.map((d: any) => ({
                    id: d.id || '',
                    name: d.name || d.Name || 'Unnamed Department',
                }));
                setDepartments(formatted);
            } else {
                setDepartments(FALLBACK_DEPARTMENTS);
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
            setDepartments(FALLBACK_DEPARTMENTS);
        } finally {
            setDepartmentsLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets();
        fetchDepartments();
    }, []);

    // ✅ Handle edit asset
    const handleEditAsset = (asset: AssetRegister) => {
        setSelectedAsset(asset);
        setEditForm({
            name: asset.name,
            description: asset.description || '',
            location: asset.location || '',
            serialNumber: asset.serialNumber || '',
            model: asset.model || '',
            manufacturer: asset.manufacturer || '',
            acquisitionCost: asset.acquisitionCost,
            salvageValue: asset.salvageValue || 0,
            usefulLife: asset.usefulLife || 36,
            assetType: asset.assetType || 'Fixed',
            assetCategory: asset.assetCategory || 'Equipment',
            status: asset.status || 'Active',
            isActive: asset.isActive,
            assignedTo: asset.assignedTo,
            departmentId: asset.departmentId,
            branchId: asset.branchId,
            warrantyInfo: asset.warrantyInfo || '',
            notes: asset.notes || '',
        });
        setIsEditModalOpen(true);
    };

    // ✅ Handle save edit
    const handleSaveEdit = async () => {
        if (!selectedAsset) return;

        try {
            await updateAsset({
                id: selectedAsset.id,
                name: editForm.name || selectedAsset.name,
                code: selectedAsset.code,
                description: editForm.description || '',
                serialNumber: editForm.serialNumber || '',
                model: editForm.model || '',
                manufacturer: editForm.manufacturer || '',
                location: editForm.location || '',
                acquisitionCost: editForm.acquisitionCost || selectedAsset.acquisitionCost || 0,
                acquisitionDate: selectedAsset.acquisitionDate || new Date().toISOString().split('T')[0],
                salvageValue: editForm.salvageValue || 0,
                usefulLife: editForm.usefulLife || 36,
                depreciationRate: selectedAsset.depreciationRate || 2.78,
                assetType: editForm.assetType || 'Fixed',
                assetCategory: editForm.assetCategory || 'Equipment',
                status: editForm.status || 'Active',
                isActive: editForm.isActive !== false,
                assignedTo: editForm.assignedTo || null,
                departmentId: editForm.departmentId || null,
                branchId: editForm.branchId || null,
                accountId: selectedAsset.accountId || null,
                purchaseDate: selectedAsset.purchaseDate || null,
                currentValue: selectedAsset.currentValue || null,
                accumulatedDepreciation: selectedAsset.accumulatedDepreciation || null,
                lastDepreciationDate: selectedAsset.lastDepreciationDate || null,
                warrantyInfo: editForm.warrantyInfo || null,
                warrantyExpiryDate: selectedAsset.warrantyExpiryDate || null,
                notes: editForm.notes || null,
            });

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

    const getAssetCategoryIcon = (category: string) => {
        const icons: Record<string, any> = {
            'IT Equipment': Laptop,
            'Furniture': Sofa,
            'Vehicle': Car,
            'Software': Code,
            'Office Equipment': Printer,
            'Building': Building2,
            'Land': Landmark,
            'Machinery': Settings,
            'Equipment': Wrench,
            'Other': Package,
        };
        return icons[category] || Package;
    };

    // ✅ Calculate stats
    const stats = useMemo(() => {
        const totalAssets = assets.length;
        const totalValue = assets.reduce((sum, a) => sum + (a.acquisitionCost || 0), 0);
        const totalNetBook = assets.reduce((sum, a) => sum + (a.netBookValue || 0), 0);
        const activeCount = assets.filter(a => a.status === 'Active' && a.isActive !== false).length;
        const disposedCount = assets.filter(a => a.status === 'Disposed' || a.isActive === false).length;
        const totalDepreciation = assets.reduce((sum, a) => sum + (a.accumulatedDepreciationValue || 0), 0);
        const depreciationPercent = totalValue > 0 ? (totalDepreciation / totalValue) * 100 : 0;

        return {
            totalAssets,
            totalValue: Math.round(totalValue),
            totalNetBook: Math.round(totalNetBook),
            activeCount,
            disposedCount,
            totalDepreciation: Math.round(totalDepreciation),
            depreciationPercent,
        };
    }, [assets]);

    // ✅ Filter assets
    const filteredAssets = assets.filter(asset => {
        const matchesSearch =
            asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (asset.assignedToName?.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = filterStatus === 'All' ||
            (filterStatus === 'Active' && asset.status === 'Active') ||
            (filterStatus === 'Disposed' && asset.status === 'Disposed');

        const matchesType = filterType === 'All' || asset.assetType === filterType;
        const matchesCategory = filterCategory === 'All' || asset.assetCategory === filterCategory;
        const matchesDepartment = filterDepartment === 'All' || asset.departmentId === filterDepartment;

        return matchesSearch && matchesStatus && matchesType && matchesCategory && matchesDepartment;
    });

    // ✅ Pagination
    const totalPages = Math.ceil(filteredAssets.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedAssets = filteredAssets.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // ✅ Get unique categories and types for filters
    const uniqueCategories = Array.from(new Set(assets.map(a => a.assetCategory).filter(Boolean)));
    const uniqueTypes = Array.from(new Set(assets.map(a => a.assetType).filter(Boolean)));

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <span className="ml-2 text-gray-600">Loading assets...</span>
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
                            <Package className="w-6 h-6 text-indigo-600" />
                        </div>
                        Asset Register
                    </h1>
                    <p className="text-sm text-gray-500">
                        Complete register of all fixed assets
                        <span className="ml-2 text-indigo-600 font-medium">
                            ({assets.length} assets)
                        </span>
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button
                        onClick={() => {
                            fetchAssets();
                            fetchDepartments();
                        }}
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
                        onClick={() => navigate('/finance/asset-capitalization')}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        <Plus size={16} />
                        Add Asset
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
                                <TrendingDown className="h-6 w-6 text-purple-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-700 font-medium">Total Depreciation</p>
                                <p className="text-2xl font-bold text-orange-900">
                                    {formatCurrency(stats.totalDepreciation)}
                                </p>
                            </div>
                            <div className="p-3 bg-orange-200 rounded-lg">
                                <AlertCircle className="h-6 w-6 text-orange-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-teal-50 to-teal-100 border-teal-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-teal-700 font-medium">Depreciation %</p>
                                <p className="text-2xl font-bold text-teal-900">
                                    {stats.depreciationPercent.toFixed(1)}%
                                </p>
                            </div>
                            <div className="p-3 bg-teal-200 rounded-lg">
                                <Clock className="h-6 w-6 text-teal-700" />
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
                        placeholder="Search assets by name, code, serial or assigned to..."
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
                    <SelectTrigger className="w-48">
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
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                    <SelectTrigger className="w-40">
                        <Building2 className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Departments</SelectItem>
                        {departmentsLoading ? (
                            <SelectItem value="loading" disabled>Loading...</SelectItem>
                        ) : departments.length === 0 ? (
                            <SelectItem value="none" disabled>No departments</SelectItem>
                        ) : (
                            departments.map((dept) => (
                                <SelectItem key={dept.id} value={dept.id}>
                                    {dept.name}
                                </SelectItem>
                            ))
                        )}
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
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cost</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Book</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Deprec.</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {paginatedAssets.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                                    <Package className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                                    <p className="text-lg font-medium text-gray-600">No assets found</p>
                                    <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or add a new asset</p>
                                    <Button
                                        onClick={() => navigate('/finance/asset-capitalization')}
                                        className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        <Plus size={16} className="mr-2" />
                                        Add Asset
                                    </Button>
                                </td>
                            </tr>
                        ) : (
                            paginatedAssets.map((asset) => {
                                const isDisposed = asset.status === 'Disposed' || asset.isActive === false;
                                const AssetIcon = getAssetCategoryIcon(asset.assetCategory || 'Other');
                                const depreciation = (asset.acquisitionCost || 0) - (asset.netBookValue || 0);

                                return (
                                    <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isDisposed ? 'bg-red-100' : 'bg-indigo-100'}`}>
                                                    <AssetIcon className={`h-5 w-5 ${isDisposed ? 'text-red-600' : 'text-indigo-600'}`} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{asset.name}</p>
                                                    <p className="text-xs text-gray-400">
                                                        {asset.serialNumber ? `SN: ${asset.serialNumber}` : 'No SN'}
                                                        {asset.assignedToName && ` • ${asset.assignedToName}`}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-mono text-gray-600">{asset.code}</td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="text-sm text-gray-700">{asset.assetCategory || 'N/A'}</p>
                                                <p className="text-xs text-gray-400">{asset.assetType || 'N/A'}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3 text-gray-400" />
                                                {asset.location || 'N/A'}
                                            </div>
                                            {asset.departmentName && (
                                                <div className="text-xs text-gray-400">{asset.departmentName}</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                                            {formatCurrency(asset.acquisitionCost || 0)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right font-medium text-indigo-600">
                                            {formatCurrency(asset.netBookValue || 0)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-right">
                                                <div className="text-sm font-medium text-orange-600">
                                                    {formatCurrency(depreciation)}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {asset.depreciationPercent?.toFixed(1) || 0}%
                                                </div>
                                            </div>
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
                                                <button
                                                    onClick={() => handleEditAsset(asset)}
                                                    className="p-1 hover:bg-green-100 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} className="text-green-500" />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/finance/asset/${asset.id}`)}
                                                    className="p-1 hover:bg-purple-100 rounded-lg transition-colors"
                                                    title="Details"
                                                >
                                                    <FileText size={16} className="text-purple-500" />
                                                </button>
                                                {!isDisposed && (
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

            {/* View Asset Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-indigo-600" />
                            Asset Details
                        </DialogTitle>
                        <DialogDescription>
                            Complete asset information
                        </DialogDescription>
                    </DialogHeader>
                    {selectedAsset && (
                        <div className="space-y-6 py-4">
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
                                <div>
                                    <p className="text-sm text-gray-500">Salvage Value</p>
                                    <p className="font-medium">{formatCurrency(selectedAsset.salvageValue)}</p>
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

            {/* Edit Asset Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Edit className="h-5 w-5 text-green-600" />
                            Edit Asset
                        </DialogTitle>
                        <DialogDescription>
                            Update asset information
                        </DialogDescription>
                    </DialogHeader>
                    {selectedAsset && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Name</Label>
                                    <Input
                                        value={editForm.name || ''}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Location</Label>
                                    <Input
                                        value={editForm.location || ''}
                                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Serial Number</Label>
                                    <Input
                                        value={editForm.serialNumber || ''}
                                        onChange={(e) => setEditForm({ ...editForm, serialNumber: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Model</Label>
                                    <Input
                                        value={editForm.model || ''}
                                        onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Manufacturer</Label>
                                    <Input
                                        value={editForm.manufacturer || ''}
                                        onChange={(e) => setEditForm({ ...editForm, manufacturer: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Asset Type</Label>
                                    <Select
                                        value={editForm.assetType || 'Fixed'}
                                        onValueChange={(value) => setEditForm({ ...editForm, assetType: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Fixed">Fixed Asset</SelectItem>
                                            <SelectItem value="Current">Current Asset</SelectItem>
                                            <SelectItem value="Intangible">Intangible Asset</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Category</Label>
                                    <Select
                                        value={editForm.assetCategory || 'Equipment'}
                                        onValueChange={(value) => setEditForm({ ...editForm, assetCategory: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="IT Equipment">IT Equipment</SelectItem>
                                            <SelectItem value="Furniture">Furniture</SelectItem>
                                            <SelectItem value="Vehicle">Vehicle</SelectItem>
                                            <SelectItem value="Software">Software</SelectItem>
                                            <SelectItem value="Office Equipment">Office Equipment</SelectItem>
                                            <SelectItem value="Building">Building</SelectItem>
                                            <SelectItem value="Land">Land</SelectItem>
                                            <SelectItem value="Machinery">Machinery</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Status</Label>
                                    <Select
                                        value={editForm.status || 'Active'}
                                        onValueChange={(value) => setEditForm({ ...editForm, status: value })}
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
                                <div>
                                    <Label>Acquisition Cost</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={editForm.acquisitionCost || ''}
                                        onChange={(e) => setEditForm({ ...editForm, acquisitionCost: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <Label>Salvage Value</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={editForm.salvageValue || ''}
                                        onChange={(e) => setEditForm({ ...editForm, salvageValue: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <Label>Useful Life (months)</Label>
                                    <Input
                                        type="number"
                                        value={editForm.usefulLife || 36}
                                        onChange={(e) => setEditForm({ ...editForm, usefulLife: parseInt(e.target.value) || 36 })}
                                    />
                                </div>
                                <div>
                                    <Label>Department</Label>
                                    <Select
                                        value={editForm.departmentId || 'none'}
                                        onValueChange={(value) => setEditForm({ ...editForm, departmentId: value === 'none' ? null : value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept.id} value={dept.id}>
                                                    {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-2">
                                    <Label>Description</Label>
                                    <Input
                                        value={editForm.description || ''}
                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <Label>Notes</Label>
                                    <Textarea
                                        value={editForm.notes || ''}
                                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                        rows={2}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={handleSaveEdit}>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                        </Button>
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
                        {selectedAsset?.netBookValue && selectedAsset.netBookValue > 0 && (
                            <p className="text-sm text-amber-600 mt-2">
                                ⚠️ This asset has a net book value of {formatCurrency(selectedAsset.netBookValue)}
                            </p>
                        )}
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

export default AssetRegisterPage;