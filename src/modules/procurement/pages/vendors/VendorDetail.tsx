import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Building2,
    Mail,
    Phone,
    MapPin,
    Globe,
    CreditCard,
    Building,
    User,
    Star,
    Package,
    DollarSign,
    Calendar,
    Briefcase,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Loader2,
    FileText,
    TrendingUp,
    Download,
    Printer,
    Shield,
    RefreshCw
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { showToast } from '@/shared/layout/layout';
import {
    getVendorById,
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
// INFO ITEM COMPONENT
// ============================================================

const InfoItem: React.FC<{ label: string; value: React.ReactNode; icon?: React.ReactNode }> = ({
                                                                                                   label,
                                                                                                   value,
                                                                                                   icon
                                                                                               }) => (
    <div className="space-y-1">
        <p className="text-xs text-gray-500 flex items-center gap-1.5">
            {icon}
            {label}
        </p>
        <p className="font-medium text-gray-900">{value || 'N/A'}</p>
    </div>
);

// ============================================================
// MAIN COMPONENT
// ============================================================

const VendorDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    // State
    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Fetch vendor
    const fetchVendor = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        try {
            const data = await getVendorById(id);
            setVendor(data);
            console.log('✅ Vendor loaded:', data);
        } catch (error: any) {
            console.error('Error fetching vendor:', error);
            showToast.error(error?.response?.data?.message || 'Failed to load vendor');
            navigate('/procurement/vendors');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchVendor();
    }, [fetchVendor]);

    // Handle delete
    const handleDelete = async () => {
        if (!vendor) return;
        if (!confirm(`Are you sure you want to delete vendor ${vendor.name}?`)) return;

        setProcessing(true);
        try {
            await deleteVendor(vendor.id);
            showToast.success('Vendor deleted successfully');
            navigate('/procurement/vendors');
        } catch (error: any) {
            console.error('Error deleting vendor:', error);
            showToast.error(error?.response?.data?.message || 'Failed to delete vendor');
        } finally {
            setProcessing(false);
        }
    };

    // Handle toggle status
    const handleToggleStatus = async () => {
        if (!vendor) return;

        const newStatus = vendor.status === 'Active' ? 'Inactive' : 'Active';
        if (!confirm(`Are you sure you want to ${newStatus === 'Active' ? 'activate' : 'deactivate'} this vendor?`)) return;

        setProcessing(true);
        try {
            await toggleVendorStatus(vendor.id, newStatus === 'Active');
            showToast.success(`Vendor ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully`);
            fetchVendor();
        } catch (error: any) {
            console.error('Error toggling status:', error);
            showToast.error(error?.response?.data?.message || 'Failed to update vendor status');
        } finally {
            setProcessing(false);
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
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading vendor details...</p>
                </div>
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Vendor not found</p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate('/procurement/vendors')}
                >
                    Back to Vendors
                </Button>
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
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/procurement/vendors')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            {vendor.name}
                            <Badge className={`${statusColors[vendor.status]} flex items-center gap-1`}>
                                {statusIcons[vendor.status]}
                                {vendor.status}
                            </Badge>
                            {vendor.isLocalOnly && (
                                <Badge variant="outline" className="text-blue-600 border-blue-200">
                                    <Shield className="w-3 h-3 mr-1" />
                                    Local
                                </Badge>
                            )}
                        </h1>
                        <p className="text-sm text-gray-500">{vendor.code}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleToggleStatus}
                        disabled={processing}
                        className={
                            vendor.status === 'Active'
                                ? 'text-yellow-600 border-yellow-200'
                                : 'text-green-600 border-green-200'
                        }
                    >
                        {processing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : vendor.status === 'Active' ? (
                            <>
                                <XCircle className="w-4 h-4 mr-1" />
                                Deactivate
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Activate
                            </>
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/procurement/vendors/${vendor.id}/edit`)}
                        className="text-blue-600"
                        disabled={processing}
                    >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDelete}
                        className="text-red-600"
                        disabled={processing}
                    >
                        {processing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                            <Package className="w-3 h-3" />
                            Vendor Type
                        </p>
                        <p className="text-lg font-medium text-gray-900">{vendor.vendorType}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                            <TrendingUp className="w-3 h-3" />
                            Rating
                        </p>
                        {vendor.rating && vendor.rating > 0 ? (
                            renderStars(vendor.rating)
                        ) : (
                            <p className="text-lg font-medium text-gray-400">N/A</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                            <DollarSign className="w-3 h-3" />
                            Total Spent
                        </p>
                        <p className="text-lg font-medium text-gray-900">
                            {formatCurrency(vendor.totalSpent || 0)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                            <FileText className="w-3 h-3" />
                            Transactions
                        </p>
                        <p className="text-lg font-medium text-gray-900">
                            {vendor.totalTransactions || 0}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <InfoItem
                    label="Vendor Code"
                    value={vendor.code}
                    icon={<Building2 className="w-3.5 h-3.5" />}
                />
                <InfoItem
                    label="Tax ID"
                    value={vendor.taxId || 'N/A'}
                    icon={<FileText className="w-3.5 h-3.5" />}
                />
                <InfoItem
                    label="Registration Number"
                    value={vendor.registrationNumber || 'N/A'}
                    icon={<FileText className="w-3.5 h-3.5" />}
                />
                <InfoItem
                    label="Email"
                    value={vendor.email || 'N/A'}
                    icon={<Mail className="w-3.5 h-3.5" />}
                />
                <InfoItem
                    label="Phone"
                    value={vendor.phone || 'N/A'}
                    icon={<Phone className="w-3.5 h-3.5" />}
                />
                <InfoItem
                    label="Mobile"
                    value={vendor.mobile || 'N/A'}
                    icon={<Phone className="w-3.5 h-3.5" />}
                />
                <InfoItem
                    label="Address"
                    value={vendor.address || 'N/A'}
                    icon={<MapPin className="w-3.5 h-3.5" />}
                />
                <InfoItem
                    label="City"
                    value={vendor.city || 'N/A'}
                    icon={<Building className="w-3.5 h-3.5" />}
                />
                <InfoItem
                    label="Country"
                    value={vendor.country || 'N/A'}
                    icon={<Globe className="w-3.5 h-3.5" />}
                />
            </div>

            {/* Financial & Payment Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <InfoItem
                    label="Payment Terms"
                    value={vendor.paymentTerms || 'N/A'}
                    icon={<Clock className="w-3.5 h-3.5" />}
                />
                <InfoItem
                    label="Currency"
                    value={vendor.currency || 'USD'}
                    icon={<DollarSign className="w-3.5 h-3.5" />}
                />
                <InfoItem
                    label="Bank Account"
                    value={vendor.bankAccount || 'N/A'}
                    icon={<CreditCard className="w-3.5 h-3.5" />}
                />
                <InfoItem
                    label="Bank Name"
                    value={vendor.bankName || 'N/A'}
                    icon={<Building className="w-3.5 h-3.5" />}
                />
                <InfoItem
                    label="Website"
                    value={vendor.website || 'N/A'}
                    icon={<Globe className="w-3.5 h-3.5" />}
                />
                <InfoItem
                    label="Source"
                    value={vendor.isLocalOnly ? 'Local' : 'Finance Sync'}
                    icon={<Shield className="w-3.5 h-3.5" />}
                />
            </div>

            {/* Contact Person */}
            {vendor.contactPerson && (
                <Card>
                    <CardContent className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-emerald-600" />
                            Contact Person
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InfoItem
                                label="Name"
                                value={vendor.contactPerson.name || 'N/A'}
                                icon={<User className="w-3.5 h-3.5" />}
                            />
                            <InfoItem
                                label="Position"
                                value={vendor.contactPerson.position || 'N/A'}
                                icon={<Briefcase className="w-3.5 h-3.5" />}
                            />
                            <InfoItem
                                label="Phone"
                                value={vendor.contactPerson.phone || 'N/A'}
                                icon={<Phone className="w-3.5 h-3.5" />}
                            />
                            <InfoItem
                                label="Email"
                                value={vendor.contactPerson.email || 'N/A'}
                                icon={<Mail className="w-3.5 h-3.5" />}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Description */}
            {vendor.description && (
                <Card>
                    <CardContent className="p-6">
                        <p className="text-xs text-gray-500 font-medium mb-1">Description</p>
                        <p className="text-sm text-gray-700">{vendor.description}</p>
                    </CardContent>
                </Card>
            )}

            {/* Audit Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-400 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                    <span className="font-medium text-gray-500">Created:</span>
                    <span className="ml-2">{formatDate(vendor.dateAdd)}</span>
                </div>
                {vendor.dateMod && (
                    <div>
                        <span className="font-medium text-gray-500">Last Modified:</span>
                        <span className="ml-2">{formatDate(vendor.dateMod)}</span>
                    </div>
                )}
                {vendor.syncedAt && (
                    <div>
                        <span className="font-medium text-gray-500">Last Synced:</span>
                        <span className="ml-2">{formatDate(vendor.syncedAt)}</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};




export default VendorDetail;