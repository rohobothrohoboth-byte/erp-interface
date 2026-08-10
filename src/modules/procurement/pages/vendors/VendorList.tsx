// src/pages/procurement/vendors/VendorList.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Building2,
    Mail,
    Phone,
    MapPin,
    Star,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    CheckCircle,
    Clock,
    AlertCircle,
    Filter,
    Download,
    TrendingUp,
    DollarSign,
    Package,
    Loader2,
    RefreshCw,
    Shield,
    XCircle
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { showToast } from '@/shared/layout/layout';
import {
    getVendors,
    deleteVendor,
    toggleVendorStatus

} from '@/modules/procurement/services/vendor.api';

import type {

    Vendor
} from '@/modules/procurement/services/vendor.api';

// ============================================================
// STATUS CONFIGURATIONS
// ============================================================

const statusColors: Record<string, string> = {
    Active: 'bg-green-100 text-green-800 border-green-200',
    Inactive: 'bg-gray-100 text-gray-800 border-gray-200',
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Suspended: 'bg-red-100 text-red-800 border-red-200',
};

const statusIcons: Record<string, React.ReactNode> = {
    Active: <CheckCircle className="w-4 h-4" />,
    Inactive: <Clock className="w-4 h-4" />,
    Pending: <AlertCircle className="w-4 h-4" />,
    Suspended: <XCircle className="w-4 h-4" />,
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const VendorList = () => {
    const navigate = useNavigate();

    // State
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Fetch vendors
    const fetchVendors = useCallback(async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (searchTerm) params.searchTerm = searchTerm;
            if (filterStatus !== 'all') params.status = filterStatus;

            console.log('📡 Fetching vendors with params:', params);
            const data = await getVendors(params);
            setVendors(data);
            console.log(`✅ Fetched ${data.length} vendors`);
        } catch (error: any) {
            console.error('Error fetching vendors:', error);
            showToast.error(error?.response?.data?.message || 'Failed to load vendors');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [searchTerm, filterStatus]);

    // Initial load and filter changes
    useEffect(() => {
        fetchVendors();
    }, [searchTerm, filterStatus]);

    // Handle refresh
    const handleRefresh = () => {
        setRefreshing(true);
        fetchVendors();
    };

    // Handle delete
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this vendor?')) return;

        setProcessingId(id);
        try {
            await deleteVendor(id);
            showToast.success('Vendor deleted successfully');
            fetchVendors();
        } catch (error: any) {
            console.error('Error deleting vendor:', error);
            showToast.error(error?.response?.data?.message || 'Failed to delete vendor');
        } finally {
            setProcessingId(null);
        }
    };

    // Handle toggle status
    const handleToggleStatus = async (id: string, isActive: boolean) => {
        const action = isActive ? 'activate' : 'deactivate';
        if (!confirm(`Are you sure you want to ${action} this vendor?`)) return;

        setProcessingId(id);
        try {
            await toggleVendorStatus(id, isActive);
            showToast.success(`Vendor ${action}d successfully`);
            fetchVendors();
        } catch (error: any) {
            console.error('Error toggling status:', error);
            showToast.error(error?.response?.data?.message || 'Failed to update vendor status');
        } finally {
            setProcessingId(null);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'ETB',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${
                            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                    />
                ))}
                <span className="text-sm font-medium text-gray-700 ml-1">{rating.toFixed(1)}</span>
            </div>
        );
    };

    if (loading && !vendors.length) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading vendors...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
                    <p className="text-sm text-gray-500">
                        {vendors.length} vendors • Manage vendor relationships and performance
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        onClick={() => navigate('/procurement/vendors/create')}
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Vendor
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Total Vendors</p>
                        <p className="text-2xl font-bold text-gray-900">{vendors.length}</p>
                    </CardContent>
                </Card>
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-green-600">Active</p>
                        <p className="text-2xl font-bold text-green-700">
                            {vendors.filter(v => v.status === 'Active').length}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-yellow-600">Pending</p>
                        <p className="text-2xl font-bold text-yellow-700">
                            {vendors.filter(v => v.status === 'Pending').length}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-blue-600">Total Spent</p>
                        <p className="text-2xl font-bold text-blue-700">
                            {formatCurrency(vendors.reduce((acc, v) => acc + (v.totalSpent || 0), 0))}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        placeholder="Search vendors by name, code, email, or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[150px]"
                >
                    <option value="all">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                    <option value="Suspended">Suspended</option>
                </select>
            </div>

            {/* Vendor Cards */}
            {vendors.length === 0 ? (
                <div className="text-center py-12">
                    <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No vendors found</p>
                    <p className="text-sm text-gray-400 mt-1">
                        {searchTerm || filterStatus !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Add your first vendor'}
                    </p>
                    <Button
                        className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => navigate('/procurement/vendors/create')}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Vendor
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {vendors.map((vendor) => (
                        <motion.div
                            key={vendor.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -4 }}
                            className="cursor-pointer"
                            onClick={() => navigate(`/procurement/vendors/${vendor.id}`)}
                        >
                            <Card className="h-full hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                                                <Building2 className="w-6 h-6 text-emerald-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{vendor.name}</h3>
                                                <p className="text-sm text-gray-500">{vendor.code}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {vendor.isLocalOnly && (
                                                <Badge variant="outline" className="text-blue-600 border-blue-200 text-[10px]">
                                                    <Shield className="w-3 h-3 mr-1" />
                                                    Local
                                                </Badge>
                                            )}
                                            <Badge className={`${statusColors[vendor.status]} flex items-center gap-1`}>
                                                {statusIcons[vendor.status]}
                                                {vendor.status}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        {vendor.email && (
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Mail className="w-4 h-4" />
                                                {vendor.email}
                                            </div>
                                        )}
                                        {vendor.phone && (
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Phone className="w-4 h-4" />
                                                {vendor.phone}
                                            </div>
                                        )}
                                        {vendor.address && (
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <MapPin className="w-4 h-4" />
                                                {vendor.address}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Package className="w-4 h-4" />
                                            {vendor.vendorType}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">Rating</p>
                                            {vendor.rating && vendor.rating > 0 ? (
                                                renderStars(vendor.rating)
                                            ) : (
                                                <span className="text-sm text-gray-400">N/A</span>
                                            )}
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">Transactions</p>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {vendor.totalTransactions || 0}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">Total Spent</p>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {formatCurrency(vendor.totalSpent || 0)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/procurement/vendors/${vendor.id}`);
                                            }}
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            View
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/procurement/vendors/${vendor.id}/edit`);
                                            }}
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default VendorList;