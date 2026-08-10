// src/pages/procurement/vendors/VendorContracts.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    FileText,
    Calendar,
    DollarSign,
    Clock,
    AlertCircle,
    CheckCircle,
    Eye,
    Edit,
    Trash2,
    Download,
    Filter,
    Building2,
    Loader2,
    RefreshCw,
    XCircle
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { showToast } from '@/shared/layout/layout';
import {
    getVendorContracts,
    deleteVendorContract

} from '@/modules/procurement/services/vendorContract.api';

import type {

    VendorContract
} from '@/modules/procurement/services/vendorContract.api';

// ============================================================
// STATUS CONFIGURATIONS
// ============================================================

const typeColors: Record<string, string> = {
    Service: 'bg-blue-100 text-blue-800 border-blue-200',
    Supply: 'bg-green-100 text-green-800 border-green-200',
    Maintenance: 'bg-purple-100 text-purple-800 border-purple-200',
    Consulting: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

const statusColors: Record<string, string> = {
    Active: 'bg-green-100 text-green-800 border-green-200',
    Expired: 'bg-red-100 text-red-800 border-red-200',
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Terminated: 'bg-gray-100 text-gray-800 border-gray-200',
    Renewal: 'bg-blue-100 text-blue-800 border-blue-200',
};

const statusIcons: Record<string, React.ReactNode> = {
    Active: <CheckCircle className="w-4 h-4" />,
    Expired: <AlertCircle className="w-4 h-4" />,
    Pending: <Clock className="w-4 h-4" />,
    Terminated: <XCircle className="w-4 h-4" />,
    Renewal: <Clock className="w-4 h-4" />,
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const VendorContracts = () => {
    const navigate = useNavigate();

    // State
    const [contracts, setContracts] = useState<VendorContract[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Fetch contracts
    const fetchContracts = useCallback(async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (searchTerm) params.searchTerm = searchTerm;
            if (filterStatus !== 'all') params.status = filterStatus;

            console.log('📡 Fetching contracts:', params);
            const data = await getVendorContracts(params);
            setContracts(data);
            console.log(`✅ Fetched ${data.length} contracts`);
        } catch (error: any) {
            console.error('Error fetching contracts:', error);
            showToast.error(error?.response?.data?.message || 'Failed to load contracts');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [searchTerm, filterStatus]);

    // Initial load and filter changes
    useEffect(() => {
        fetchContracts();
    }, [searchTerm, filterStatus]);

    // Handle refresh
    const handleRefresh = () => {
        setRefreshing(true);
        fetchContracts();
    };

    // Handle delete
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this contract?')) return;

        setProcessingId(id);
        try {
            await deleteVendorContract(id);
            showToast.success('Contract deleted successfully');
            fetchContracts();
        } catch (error: any) {
            console.error('Error deleting contract:', error);
            showToast.error(error?.response?.data?.message || 'Failed to delete contract');
        } finally {
            setProcessingId(null);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'ETB',
            minimumFractionDigits: 2,
        }).format(amount || 0);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const getDaysRemaining = (endDate: string) => {
        const end = new Date(endDate);
        const now = new Date();
        const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    if (loading && !contracts.length) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading contracts...</p>
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
                    <h1 className="text-2xl font-bold text-gray-900">Vendor Contracts</h1>
                    <p className="text-sm text-gray-500">
                        {contracts.length} contracts • Manage vendor agreements
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
                        onClick={() => navigate('/procurement/vendors/contracts/create')}
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Contract
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Total Contracts</p>
                        <p className="text-2xl font-bold text-gray-900">{contracts.length}</p>
                    </CardContent>
                </Card>
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-green-600">Active</p>
                        <p className="text-2xl font-bold text-green-700">
                            {contracts.filter(c => c.status === 'Active').length}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-yellow-600">Pending</p>
                        <p className="text-2xl font-bold text-yellow-700">
                            {contracts.filter(c => c.status === 'Pending').length}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-blue-600">Total Value</p>
                        <p className="text-2xl font-bold text-blue-700">
                            {formatCurrency(contracts.reduce((acc, c) => acc + c.value, 0))}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        placeholder="Search by contract number, title, or vendor..."
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
                    <option value="Expired">Expired</option>
                    <option value="Pending">Pending</option>
                    <option value="Terminated">Terminated</option>
                    <option value="Renewal">Renewal</option>
                </select>
            </div>

            {/* Contracts Grid */}
            {contracts.length === 0 ? (
                <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No contracts found</p>
                    <p className="text-sm text-gray-400 mt-1">
                        {searchTerm || filterStatus !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Create your first vendor contract'}
                    </p>
                    <Button
                        className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => navigate('/procurement/vendors/contracts/create')}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Contract
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {contracts.map((contract) => (
                        <motion.div
                            key={contract.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -4 }}
                            className="cursor-pointer"
                            onClick={() => navigate(`/procurement/vendors/contracts/${contract.id}`)}
                        >
                            <Card className="h-full hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                                <FileText className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{contract.title}</h3>
                                                <p className="text-sm text-gray-500">{contract.contractNumber}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={typeColors[contract.type]}>
                                                {contract.type}
                                            </Badge>
                                            <Badge className={`${statusColors[contract.status]} flex items-center gap-1`}>
                                                {statusIcons[contract.status]}
                                                {contract.status}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Building2 className="w-4 h-4" />
                                            {contract.vendorName} ({contract.vendorCode})
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <DollarSign className="w-4 h-4" />
                                            {formatCurrency(contract.value)}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Calendar className="w-4 h-4" />
                                            {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                                        </div>
                                        {contract.status === 'Active' && (
                                            <div className={`flex items-center gap-2 text-sm ${
                                                getDaysRemaining(contract.endDate) < 30 ? 'text-red-600' :
                                                    getDaysRemaining(contract.endDate) < 90 ? 'text-yellow-600' :
                                                        'text-gray-500'
                                            }`}>
                                                <Clock className="w-4 h-4" />
                                                {getDaysRemaining(contract.endDate)} days remaining
                                            </div>
                                        )}
                                        {contract.autoRenew && (
                                            <div className="text-sm text-blue-600 flex items-center gap-1">
                                                <RefreshCw className="w-3 h-3" />
                                                Auto-renew
                                            </div>
                                        )}
                                    </div>

                                    {contract.terms && contract.terms.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {contract.terms.slice(0, 3).map((term, index) => (
                                                <Badge key={index} variant="outline" className="bg-gray-50 text-xs">
                                                    {term}
                                                </Badge>
                                            ))}
                                            {contract.terms.length > 3 && (
                                                <span className="text-xs text-gray-400">
                                                    +{contract.terms.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {contract.notes && (
                                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{contract.notes}</p>
                                    )}

                                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/procurement/vendors/contracts/${contract.id}`);
                                            }}
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            View
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 text-red-600 hover:text-red-700"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(contract.id);
                                            }}
                                            disabled={processingId === contract.id}
                                        >
                                            {processingId === contract.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4 mr-2" />
                                            )}
                                            Delete
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

export default VendorContracts;