import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Building2,
    Mail,
    Phone,
    MapPin,
    Globe,
    CreditCard,
    Building,
    User,
    Loader2,
    X,
    Plus,
    Trash2,
    FileText,
    DollarSign,
    Clock,
    Shield,
    Briefcase,
    AlertCircle
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../components/ui/select';
import { showToast } from '../../../layout/layout';
import {
    getVendorById,
    updateVendor

} from '../../../services/procurement/vendor.api';

import type{

    Vendor
} from '../../../services/procurement/vendor.api';

// ============================================================
// CONSTANTS
// ============================================================

const VENDOR_TYPES = [
    { value: 'Supplier', label: 'Supplier' },
    { value: 'Manufacturer', label: 'Manufacturer' },
    { value: 'Distributor', label: 'Distributor' },
    { value: 'Service Provider', label: 'Service Provider' },
    { value: 'Consultant', label: 'Consultant' },
    { value: 'Contractor', label: 'Contractor' },
];

const PAYMENT_TERMS = [
    { value: 'Net 15', label: 'Net 15' },
    { value: 'Net 30', label: 'Net 30' },
    { value: 'Net 45', label: 'Net 45' },
    { value: 'Net 60', label: 'Net 60' },
    { value: 'Due on Receipt', label: 'Due on Receipt' },
    { value: 'Cash on Delivery', label: 'Cash on Delivery' },
];

const CURRENCIES = [
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'ETB', label: 'ETB - Ethiopian Birr' },
    { value: 'GBP', label: 'GBP - British Pound' },
];

const STATUS_OPTIONS = [
    { value: 'Active', label: 'Active', color: 'text-green-600' },
    { value: 'Inactive', label: 'Inactive', color: 'text-gray-600' },
    { value: 'Pending', label: 'Pending', color: 'text-yellow-600' },
    { value: 'Suspended', label: 'Suspended', color: 'text-red-600' },
];

// ============================================================
// MAIN COMPONENT
// ============================================================

const EditVendor = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    // State
    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        code: '',
        name: '',
        nameAm: '',
        description: '',
        email: '',
        phone: '',
        mobile: '',
        address: '',
        city: '',
        country: '',
        taxId: '',
        registrationNumber: '',
        vendorType: 'Supplier',
        status: 'Active',
        paymentTerms: 'Net 30',
        currency: 'ETB',
        bankName: '',
        bankAccount: '',
        website: '',
        contactPerson: {
            name: '',
            phone: '',
            email: '',
            position: ''
        },
        isActive: true,
        rowVersion: ''
    });

    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [showErrors, setShowErrors] = useState(false);

    // Fetch vendor
    const fetchVendor = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        try {
            const data = await getVendorById(id);
            setVendor(data);
            setFormData({
                id: data.id,
                code: data.code,
                name: data.name,
                nameAm: data.nameAm || '',
                description: data.description || '',
                email: data.email || '',
                phone: data.phone || '',
                mobile: data.mobile || '',
                address: data.address || '',
                city: data.city || '',
                country: data.country || '',
                taxId: data.taxId || '',
                registrationNumber: data.registrationNumber || '',
                vendorType: data.vendorType,
                status: data.status,
                paymentTerms: data.paymentTerms || 'Net 30',
                currency: data.currency || 'ETB',
                bankName: data.bankName || '',
                bankAccount: data.bankAccount || '',
                website: data.website || '',
                contactPerson: {
                    name: data.contactPerson?.name || '',
                    phone: data.contactPerson?.phone || '',
                    email: data.contactPerson?.email || '',
                    position: data.contactPerson?.position || ''
                },
                isActive: data.isActive,
                rowVersion: data.rowVersion || ''
            });
            console.log('✅ Vendor loaded for edit:', data);
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

    // Validate form
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.code?.trim()) {
            errors.code = 'Vendor code is required';
        }
        if (!formData.name?.trim()) {
            errors.name = 'Vendor name is required';
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Invalid email format';
        }

        setValidationErrors(errors);
        setShowErrors(true);
        return Object.keys(errors).length === 0;
    };

    // Submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            const firstError = Object.values(validationErrors)[0];
            if (firstError) showToast.error(firstError);
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                id: formData.id,
                code: formData.code,
                name: formData.name,
                nameAm: formData.nameAm,
                description: formData.description,
                email: formData.email,
                phone: formData.phone,
                mobile: formData.mobile,
                address: formData.address,
                city: formData.city,
                country: formData.country,
                taxId: formData.taxId,
                registrationNumber: formData.registrationNumber,
                vendorType: formData.vendorType,
                status: formData.status,
                paymentTerms: formData.paymentTerms,
                currency: formData.currency,
                bankName: formData.bankName,
                bankAccount: formData.bankAccount,
                website: formData.website,
                contactPerson: formData.contactPerson,
                isActive: formData.status === 'Active',
                rowVersion: formData.rowVersion
            };

            console.log('📤 Updating vendor:', payload);
            const response = await updateVendor(payload);
            console.log('✅ Vendor updated:', response);

            showToast.success('Vendor updated successfully');
            navigate(`/procurement/vendors/${formData.id}`);
        } catch (error: any) {
            console.error('Error updating vendor:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to update vendor';
            showToast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const getError = (field: string) => {
        return showErrors ? validationErrors[field] || '' : '';
    };

    const hasError = (field: string) => {
        return showErrors && !!validationErrors[field];
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading vendor...</p>
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
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/procurement/vendors/${id}`)}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Vendor</h1>
                    <p className="text-sm text-gray-500">{vendor.code} - {vendor.name}</p>
                </div>
                {vendor.isLocalOnly && (
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                        <Shield className="w-3 h-3 mr-1" />
                        Local
                    </Badge>
                )}
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form - Same as CreateVendor but pre-filled */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-emerald-600" />
                                    Basic Information
                                </h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Vendor Code *</Label>
                                            <Input
                                                placeholder="e.g., V001"
                                                value={formData.code}
                                                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                                                className={hasError('code') ? 'border-red-500' : ''}
                                                disabled={isSaving}
                                            />
                                            {getError('code') && (
                                                <p className="text-xs text-red-500 mt-1">{getError('code')}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label>Vendor Name *</Label>
                                            <Input
                                                placeholder="Enter vendor name"
                                                value={formData.name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                className={hasError('name') ? 'border-red-500' : ''}
                                                disabled={isSaving}
                                            />
                                            {getError('name') && (
                                                <p className="text-xs text-red-500 mt-1">{getError('name')}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Vendor Name (Amharic)</Label>
                                        <Input
                                            placeholder="Enter vendor name in Amharic"
                                            value={formData.nameAm}
                                            onChange={(e) => setFormData(prev => ({ ...prev, nameAm: e.target.value }))}
                                            disabled={isSaving}
                                        />
                                    </div>
                                    <div>
                                        <Label>Description</Label>
                                        <textarea
                                            rows={3}
                                            placeholder="Enter vendor description"
                                            value={formData.description}
                                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                            disabled={isSaving}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Vendor Type</Label>
                                            <Select
                                                value={formData.vendorType}
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, vendorType: value }))}
                                                disabled={isSaving}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {VENDOR_TYPES.map((type) => (
                                                        <SelectItem key={type.value} value={type.value}>
                                                            {type.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Status</Label>
                                            <Select
                                                value={formData.status}
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                                                disabled={isSaving}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {STATUS_OPTIONS.map((status) => (
                                                        <SelectItem key={status.value} value={status.value}>
                                                            <span className={status.color}>{status.label}</span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Information */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Phone className="w-5 h-5 text-emerald-600" />
                                    Contact Information
                                </h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Email</Label>
                                            <Input
                                                type="email"
                                                placeholder="vendor@company.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                className={hasError('email') ? 'border-red-500' : ''}
                                                disabled={isSaving}
                                            />
                                            {getError('email') && (
                                                <p className="text-xs text-red-500 mt-1">{getError('email')}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label>Phone</Label>
                                            <Input
                                                placeholder="+251-911-123456"
                                                value={formData.phone}
                                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                                disabled={isSaving}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Mobile</Label>
                                            <Input
                                                placeholder="+251-922-789012"
                                                value={formData.mobile}
                                                onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                                                disabled={isSaving}
                                            />
                                        </div>
                                        <div>
                                            <Label>Website</Label>
                                            <Input
                                                placeholder="https://www.company.com"
                                                value={formData.website}
                                                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                                                disabled={isSaving}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Address</Label>
                                        <Input
                                            placeholder="Enter address"
                                            value={formData.address}
                                            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                            disabled={isSaving}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>City</Label>
                                            <Input
                                                placeholder="Enter city"
                                                value={formData.city}
                                                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                                disabled={isSaving}
                                            />
                                        </div>
                                        <div>
                                            <Label>Country</Label>
                                            <Input
                                                placeholder="Enter country"
                                                value={formData.country}
                                                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                                                disabled={isSaving}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Financial Information */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-emerald-600" />
                                    Financial Information
                                </h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Tax ID</Label>
                                            <Input
                                                placeholder="Enter tax ID"
                                                value={formData.taxId}
                                                onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))}
                                                disabled={isSaving}
                                            />
                                        </div>
                                        <div>
                                            <Label>Registration Number</Label>
                                            <Input
                                                placeholder="Enter registration number"
                                                value={formData.registrationNumber}
                                                onChange={(e) => setFormData(prev => ({ ...prev, registrationNumber: e.target.value }))}
                                                disabled={isSaving}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Payment Terms</Label>
                                            <Select
                                                value={formData.paymentTerms}
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, paymentTerms: value }))}
                                                disabled={isSaving}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {PAYMENT_TERMS.map((term) => (
                                                        <SelectItem key={term.value} value={term.value}>
                                                            {term.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Currency</Label>
                                            <Select
                                                value={formData.currency}
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                                                disabled={isSaving}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {CURRENCIES.map((currency) => (
                                                        <SelectItem key={currency.value} value={currency.value}>
                                                            {currency.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Bank Name</Label>
                                            <Input
                                                placeholder="Enter bank name"
                                                value={formData.bankName}
                                                onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                                                disabled={isSaving}
                                            />
                                        </div>
                                        <div>
                                            <Label>Bank Account</Label>
                                            <Input
                                                placeholder="Enter bank account number"
                                                value={formData.bankAccount}
                                                onChange={(e) => setFormData(prev => ({ ...prev, bankAccount: e.target.value }))}
                                                disabled={isSaving}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Person */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-emerald-600" />
                                    Contact Person
                                </h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Name</Label>
                                            <Input
                                                placeholder="Contact person name"
                                                value={formData.contactPerson.name}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    contactPerson: { ...prev.contactPerson, name: e.target.value }
                                                }))}
                                                disabled={isSaving}
                                            />
                                        </div>
                                        <div>
                                            <Label>Position</Label>
                                            <Input
                                                placeholder="Position"
                                                value={formData.contactPerson.position}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    contactPerson: { ...prev.contactPerson, position: e.target.value }
                                                }))}
                                                disabled={isSaving}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Phone</Label>
                                            <Input
                                                placeholder="Contact phone"
                                                value={formData.contactPerson.phone}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    contactPerson: { ...prev.contactPerson, phone: e.target.value }
                                                }))}
                                                disabled={isSaving}
                                            />
                                        </div>
                                        <div>
                                            <Label>Email</Label>
                                            <Input
                                                type="email"
                                                placeholder="contact@company.com"
                                                value={formData.contactPerson.email}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    contactPerson: { ...prev.contactPerson, email: e.target.value }
                                                }))}
                                                disabled={isSaving}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
                                <div className="space-y-3">
                                    <Button
                                        type="submit"
                                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Update Vendor
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => navigate(`/procurement/vendors/${id}`)}
                                        disabled={isSaving}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Summary</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Code</span>
                                        <span className="font-medium">{formData.code}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Name</span>
                                        <span className="font-medium">{formData.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Type</span>
                                        <span className="font-medium">{formData.vendorType}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Status</span>
                                        <span className="font-medium">{formData.status}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Payment Terms</span>
                                        <span className="font-medium">{formData.paymentTerms}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-gray-200">
                                        <span className="text-gray-500">Source</span>
                                        <span className="font-medium">
                                            {vendor.isLocalOnly ? 'Local' : 'Finance Sync'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </motion.div>
    );
};

export default EditVendor;