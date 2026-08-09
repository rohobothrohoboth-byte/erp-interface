// src/pages/procurement/po/EditPurchaseOrder.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    Building2,
    FileText,
    Loader2,
    Calendar,
    DollarSign,
    Truck,
    Package,
    X
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../components/ui/select';
import { showToast } from '../../../layout/layout';
import { useAuthStore } from '../../../stores/auth.store';
import { useVendors } from '../../../hooks/procurement/useVendors';
import { useFinancialPeriods } from '../../../hooks/finance/useFinancialPeriods';
import {
    getPurchaseOrderById,
    updatePurchaseOrder
} from '../../../services/procurement/purchaseOrder.api';
import {
    PO_STATUSES,
    PO_CURRENCIES,
    PO_PAYMENT_TERMS
} from '../../../constants/procurement/purchaseOrderConstants';
import { Badge } from '../../../components/ui/badge';
import type { PurchaseOrder, PurchaseOrderLine } from '../../../types/procurement/purchaseOrder.types';

// ============================================================
// STATUS CONFIGURATIONS
// ============================================================

const statusColors: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-800 border-gray-200',
    Sent: 'bg-blue-100 text-blue-800 border-blue-200',
    Confirmed: 'bg-green-100 text-green-800 border-green-200',
    Shipped: 'bg-purple-100 text-purple-800 border-purple-200',
    Delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Cancelled: 'bg-red-100 text-red-800 border-red-200',
    PartiallyReceived: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

const statusLabels: Record<string, string> = {
    Draft: 'Draft',
    Sent: 'Sent',
    Confirmed: 'Confirmed',
    Shipped: 'Shipped',
    Delivered: 'Delivered',
    Cancelled: 'Cancelled',
    PartiallyReceived: 'Partially Received',
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const EditPurchaseOrder = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { userId, userName } = useAuthStore();

    // State
    const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [showErrors, setShowErrors] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        id: '',
        purchaseOrderNumber: '',
        orderDate: '',
        expectedDeliveryDate: '',
        vendorId: '',
        vendorName: '',
        description: '',
        totalAmount: 0,
        status: 'Draft',
        currency: 'USD',
        paymentTerms: 'Net 30',
        shippingAddress: '',
        requisitionId: '',
        requisitionNumber: '',
        periodId: '',
        rowVersion: '',
        lines: [] as PurchaseOrderLine[]
    });

    // Hooks
    const { vendors, loading: vendorsLoading, fetchVendors } = useVendors();
    const { periods, loading: periodsLoading, fetchPeriods } = useFinancialPeriods();

    // Fetch purchase order
    const fetchPurchaseOrder = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        try {
            const response = await getPurchaseOrderById(id);
            const data = response?.data?.data || response?.data;

            if (!data) {
                showToast.error('Purchase order not found');
                navigate('/procurement/po');
                return;
            }

            setPurchaseOrder(data);
            setFormData({
                id: data.id,
                purchaseOrderNumber: data.purchaseOrderNumber,
                orderDate: data.orderDate?.split('T')[0] || '',
                expectedDeliveryDate: data.expectedDeliveryDate?.split('T')[0] || '',
                vendorId: data.vendorId || '',
                vendorName: data.vendorName || '',
                description: data.description || '',
                totalAmount: data.totalAmount || 0,
                status: data.status || 'Draft',
                currency: data.currency || 'USD',
                paymentTerms: data.paymentTerms || 'Net 30',
                shippingAddress: data.shippingAddress || '',
                requisitionId: data.requisitionId || '',
                requisitionNumber: data.requisitionNumber || '',
                periodId: data.periodId || '',
                rowVersion: data.rowVersion || '',
                lines: data.lines?.map((line: any) => ({
                    id: line.id,
                    description: line.description || '',
                    quantity: line.quantity || 1,
                    unitPrice: line.unitPrice || 0,
                    totalAmount: line.totalAmount || 0,
                    discount: line.discount || 0,
                    taxRate: line.taxRate || 0,
                    taxAmount: line.taxAmount || 0,
                    unitOfMeasure: line.unitOfMeasure || 'Each',
                    requisitionLineId: line.requisitionLineId,
                    periodId: line.periodId
                })) || []
            });

            console.log('✅ Purchase order loaded:', data);
        } catch (error: any) {
            console.error('Error fetching purchase order:', error);
            showToast.error(error?.response?.data?.message || 'Failed to load purchase order');
            navigate('/procurement/po');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    // Fetch vendors and periods
    useEffect(() => {
        fetchVendors();
        fetchPeriods({ isClosed: false, isActive: true });
    }, []);

    // Load purchase order
    useEffect(() => {
        fetchPurchaseOrder();
    }, [fetchPurchaseOrder]);

    // Calculate line total
    const calculateLineTotal = (line: PurchaseOrderLine) => {
        const subtotal = (line.quantity || 0) * (line.unitPrice || 0);
        const taxAmount = subtotal * ((line.taxRate || 0) / 100);
        return subtotal + taxAmount;
    };

    // Calculate total amount
    const calculateTotal = () => {
        return formData.lines.reduce((sum, line) => sum + calculateLineTotal(line), 0);
    };

    // Update line item
    const updateLine = (index: number, field: keyof PurchaseOrderLine, value: any) => {
        setFormData(prev => {
            const newLines = [...prev.lines];
            newLines[index] = {
                ...newLines[index],
                [field]: value
            };
            // Recalculate totalAmount for this line
            if (field === 'quantity' || field === 'unitPrice' || field === 'taxRate') {
                const subtotal = (newLines[index].quantity || 0) * (newLines[index].unitPrice || 0);
                const taxAmount = subtotal * ((newLines[index].taxRate || 0) / 100);
                newLines[index].totalAmount = subtotal + taxAmount;
            }
            return { ...prev, lines: newLines, totalAmount: calculateTotal() };
        });
    };

    // Add line
    const addLine = () => {
        setFormData(prev => ({
            ...prev,
            lines: [
                ...prev.lines,
                {
                    description: '',
                    quantity: 1,
                    unitPrice: 0,
                    totalAmount: 0,
                    discount: 0,
                    taxRate: 0,
                    taxAmount: 0,
                    unitOfMeasure: 'Each',
                    requisitionLineId: ''
                }
            ]
        }));
    };

    // Remove line
    const removeLine = (index: number) => {
        if (formData.lines.length > 1) {
            setFormData(prev => ({
                ...prev,
                lines: prev.lines.filter((_, i) => i !== index)
            }));
        }
    };

    // Validate form
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.vendorId) {
            errors.vendor = 'Vendor is required';
        }
        if (!formData.orderDate) {
            errors.orderDate = 'Order date is required';
        }
        if (!formData.periodId) {
            errors.period = 'Financial period is required';
        }
        if (formData.lines.length === 0) {
            errors.lines = 'At least one line item is required';
        }
        formData.lines.forEach((line, index) => {
            if (!line.description?.trim()) {
                errors[`line_${index}_description`] = `Line ${index + 1}: Description is required`;
            }
            if (line.quantity <= 0) {
                errors[`line_${index}_quantity`] = `Line ${index + 1}: Quantity must be greater than 0`;
            }
            if (line.unitPrice < 0) {
                errors[`line_${index}_unitPrice`] = `Line ${index + 1}: Unit price cannot be negative`;
            }
        });

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

        if (purchaseOrder?.status !== 'Draft') {
            showToast.error(`Cannot edit a purchase order with status '${purchaseOrder?.status}'`);
            return;
        }

        setSaving(true);
        try {
            const totalAmount = calculateTotal();

            const payload = {
                id: formData.id,
                purchaseOrderNumber: formData.purchaseOrderNumber,
                orderDate: new Date(formData.orderDate).toISOString(),
                expectedDeliveryDate: formData.expectedDeliveryDate ? new Date(formData.expectedDeliveryDate).toISOString() : null,
                vendorId: formData.vendorId || null,
                vendorName: formData.vendorName || '',
                description: formData.description || '',
                totalAmount: totalAmount,
                status: formData.status,
                currency: formData.currency || 'USD',
                paymentTerms: formData.paymentTerms || 'Net 30',
                shippingAddress: formData.shippingAddress || '',
                requisitionId: formData.requisitionId || null,
                requisitionNumber: formData.requisitionNumber || '',
                periodId: formData.periodId,
                rowVersion: formData.rowVersion,
                updatedByUserId: userId || null,
                updatedByUserName: userName || null,
                lines: formData.lines.map(line => ({
                    id: line.id,
                    description: line.description,
                    quantity: line.quantity,
                    unitPrice: line.unitPrice,
                    totalAmount: (line.quantity * line.unitPrice) + ((line.quantity * line.unitPrice) * (line.taxRate || 0) / 100),
                    discount: line.discount || 0,
                    taxRate: line.taxRate || 0,
                    taxAmount: (line.quantity * line.unitPrice) * ((line.taxRate || 0) / 100),
                    unitOfMeasure: line.unitOfMeasure || 'Each',
                    requisitionLineId: line.requisitionLineId || null,
                    periodId: formData.periodId || null
                }))
            };

            console.log('📤 Updating purchase order:', payload);

            const response = await updatePurchaseOrder(payload);
            console.log('✅ Purchase order updated:', response.data);

            showToast.success('Purchase order updated successfully');
            navigate('/procurement/po');
        } catch (error: any) {
            console.error('Error updating purchase order:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to update purchase order';
            showToast.error(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading purchase order...</p>
                </div>
            </div>
        );
    }

    // Check if editable
    const isEditable = purchaseOrder?.status === 'Draft';
    const totalAmount = calculateTotal();

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
                        onClick={() => navigate('/procurement/po')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Purchase Order</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-500">{formData.purchaseOrderNumber}</span>
                            <Badge className={statusColors[formData.status] || 'bg-gray-100'}>
                                {statusLabels[formData.status] || formData.status}
                            </Badge>
                            {!isEditable && (
                                <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                                    Read Only
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
                {isEditable && (
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => navigate('/procurement/po')}
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={handleSubmit}
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Update PO
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Vendor Information */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-emerald-600" />
                                    Vendor Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Vendor *</Label>
                                        {vendorsLoading ? (
                                            <div className="flex items-center gap-2 p-2 border rounded-lg">
                                                <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                                                <span className="text-sm text-gray-500">Loading vendors...</span>
                                            </div>
                                        ) : (
                                            <Select
                                                value={formData.vendorId || ''}
                                                onValueChange={(value) => {
                                                    const vendor = vendors.find(v => v.id === value);
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        vendorId: value,
                                                        vendorName: vendor?.name || ''
                                                    }));
                                                }}
                                                disabled={!isEditable}
                                            >
                                                <SelectTrigger className={showErrors && validationErrors.vendor ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select vendor" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {vendors.map((vendor) => (
                                                        <SelectItem key={vendor.id} value={vendor.id}>
                                                            {vendor.code} - {vendor.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                        {showErrors && validationErrors.vendor && (
                                            <p className="text-xs text-red-500 mt-1">{validationErrors.vendor}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label>Vendor Contact</Label>
                                        <Input
                                            placeholder="Contact person name"
                                            value={formData.vendorName || ''}
                                            onChange={(e) => setFormData(prev => ({ ...prev, vendorName: e.target.value }))}
                                            disabled={!isEditable}
                                        />
                                    </div>
                                    <div>
                                        <Label>Financial Period *</Label>
                                        {periodsLoading ? (
                                            <div className="flex items-center gap-2 p-2 border rounded-lg">
                                                <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                                                <span className="text-sm text-gray-500">Loading periods...</span>
                                            </div>
                                        ) : (
                                            <Select
                                                value={formData.periodId || ''}
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, periodId: value }))}
                                                disabled={!isEditable}
                                            >
                                                <SelectTrigger className={showErrors && validationErrors.period ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select period" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {periods.map((period) => (
                                                        <SelectItem key={period.id} value={period.id}>
                                                            {period.name} ({new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                        {showErrors && validationErrors.period && (
                                            <p className="text-xs text-red-500 mt-1">{validationErrors.period}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label>PO Number</Label>
                                        <Input
                                            value={formData.purchaseOrderNumber}
                                            disabled
                                            className="bg-gray-100"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Details */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-emerald-600" />
                                    Order Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Order Date *</Label>
                                        <Input
                                            type="date"
                                            value={formData.orderDate}
                                            onChange={(e) => setFormData(prev => ({ ...prev, orderDate: e.target.value }))}
                                            disabled={!isEditable}
                                            className={showErrors && validationErrors.orderDate ? 'border-red-500' : ''}
                                        />
                                        {showErrors && validationErrors.orderDate && (
                                            <p className="text-xs text-red-500 mt-1">{validationErrors.orderDate}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label>Expected Delivery</Label>
                                        <Input
                                            type="date"
                                            value={formData.expectedDeliveryDate}
                                            onChange={(e) => setFormData(prev => ({ ...prev, expectedDeliveryDate: e.target.value }))}
                                            disabled={!isEditable}
                                        />
                                    </div>
                                    <div>
                                        <Label>Description</Label>
                                        <Input
                                            placeholder="PO description"
                                            value={formData.description || ''}
                                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                            disabled={!isEditable}
                                        />
                                    </div>
                                    <div>
                                        <Label>Currency</Label>
                                        <Select
                                            value={formData.currency}
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                                            disabled={!isEditable}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PO_CURRENCIES.map((currency) => (
                                                    <SelectItem key={currency.value} value={currency.value}>
                                                        {currency.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Payment Terms</Label>
                                        <Select
                                            value={formData.paymentTerms}
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, paymentTerms: value }))}
                                            disabled={!isEditable}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PO_PAYMENT_TERMS.map((term) => (
                                                    <SelectItem key={term.value} value={term.value}>
                                                        {term.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label>Shipping Address</Label>
                                        <Input
                                            placeholder="Shipping address"
                                            value={formData.shippingAddress || ''}
                                            onChange={(e) => setFormData(prev => ({ ...prev, shippingAddress: e.target.value }))}
                                            disabled={!isEditable}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Line Items */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-gray-900">Line Items</h3>
                                    {isEditable && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addLine}
                                            className="flex items-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Item
                                        </Button>
                                    )}
                                </div>

                                {showErrors && validationErrors.lines && (
                                    <p className="text-xs text-red-500 mb-2">{validationErrors.lines}</p>
                                )}

                                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                    {formData.lines.map((line, index) => {
                                        const hasDescError = showErrors && validationErrors[`line_${index}_description`];
                                        const hasQtyError = showErrors && validationErrors[`line_${index}_quantity`];
                                        const hasPriceError = showErrors && validationErrors[`line_${index}_unitPrice`];

                                        return (
                                            <div key={line.id || index} className="flex items-end gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                <div className="flex-[2]">
                                                    <Label className="text-xs text-gray-500">Description *</Label>
                                                    <Input
                                                        value={line.description}
                                                        onChange={(e) => updateLine(index, 'description', e.target.value)}
                                                        placeholder="Item description"
                                                        disabled={!isEditable}
                                                        className={`text-sm ${hasDescError ? 'border-red-500' : ''}`}
                                                    />
                                                    {hasDescError && (
                                                        <p className="text-xs text-red-500 mt-0.5">{validationErrors[`line_${index}_description`]}</p>
                                                    )}
                                                </div>
                                                <div className="w-16">
                                                    <Label className="text-xs text-gray-500">Qty *</Label>
                                                    <Input
                                                        type="number"
                                                        value={line.quantity}
                                                        onChange={(e) => updateLine(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                        min="0.01"
                                                        step="0.01"
                                                        disabled={!isEditable}
                                                        className={`text-sm ${hasQtyError ? 'border-red-500' : ''}`}
                                                    />
                                                    {hasQtyError && (
                                                        <p className="text-xs text-red-500 mt-0.5">{validationErrors[`line_${index}_quantity`]}</p>
                                                    )}
                                                </div>
                                                <div className="w-24">
                                                    <Label className="text-xs text-gray-500">Unit Price</Label>
                                                    <Input
                                                        type="number"
                                                        value={line.unitPrice}
                                                        onChange={(e) => updateLine(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                        min="0"
                                                        step="0.01"
                                                        disabled={!isEditable}
                                                        className={`text-sm ${hasPriceError ? 'border-red-500' : ''}`}
                                                    />
                                                    {hasPriceError && (
                                                        <p className="text-xs text-red-500 mt-0.5">{validationErrors[`line_${index}_unitPrice`]}</p>
                                                    )}
                                                </div>
                                                <div className="w-16">
                                                    <Label className="text-xs text-gray-500">Tax %</Label>
                                                    <Input
                                                        type="number"
                                                        value={line.taxRate || 0}
                                                        onChange={(e) => updateLine(index, 'taxRate', parseFloat(e.target.value) || 0)}
                                                        min="0"
                                                        max="100"
                                                        disabled={!isEditable}
                                                        className="text-sm"
                                                    />
                                                </div>
                                                <div className="w-24">
                                                    <Label className="text-xs text-gray-500">Unit</Label>
                                                    <Input
                                                        value={line.unitOfMeasure || ''}
                                                        onChange={(e) => updateLine(index, 'unitOfMeasure', e.target.value)}
                                                        placeholder="Each"
                                                        disabled={!isEditable}
                                                        className="text-sm"
                                                    />
                                                </div>
                                                <div className="w-28">
                                                    <Label className="text-xs text-gray-500">Total</Label>
                                                    <div className="px-2 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-900 text-right">
                                                        ${calculateLineTotal(line).toFixed(2)}
                                                    </div>
                                                </div>
                                                {isEditable && formData.lines.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-500 hover:text-red-700 mt-4"
                                                        onClick={() => removeLine(index)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Total Items: {formData.lines.length}</span>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Total Amount</p>
                                            <p className="text-2xl font-bold text-gray-900">${totalAmount.toFixed(2)}</p>
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
                                    {isEditable ? (
                                        <>
                                            <Button
                                                type="submit"
                                                className="w-full bg-emerald-600 hover:bg-emerald-700"
                                                disabled={saving}
                                            >
                                                {saving ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="w-4 h-4 mr-2" />
                                                        Update PO
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full"
                                                onClick={() => navigate('/procurement/po')}
                                                disabled={saving}
                                            >
                                                Cancel
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-sm text-yellow-600 mb-2">
                                                This purchase order is in <strong>{statusLabels[formData.status]}</strong> status and cannot be edited.
                                            </p>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full"
                                                onClick={() => navigate('/procurement/po')}
                                            >
                                                Back to List
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Summary</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="font-medium">${totalAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Tax</span>
                                        <span className="font-medium">
                                            ${formData.lines.reduce((sum, line) => {
                                            const subtotal = (line.quantity || 0) * (line.unitPrice || 0);
                                            return sum + (subtotal * ((line.taxRate || 0) / 100));
                                        }, 0).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-gray-200">
                                        <span className="font-semibold">Total</span>
                                        <span className="font-bold text-emerald-600">${totalAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-400 pt-1">
                                        <span>Items: {formData.lines.length}</span>
                                        <span>Status: {statusLabels[formData.status] || formData.status}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Status History */}
                        {purchaseOrder && (
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="font-semibold text-gray-900 mb-4">Status History</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Current Status</span>
                                            <Badge className={statusColors[formData.status] || 'bg-gray-100'}>
                                                {statusLabels[formData.status] || formData.status}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Created</span>
                                            <span className="font-medium">{new Date(purchaseOrder.dateAdd).toLocaleDateString()}</span>
                                        </div>
                                        {purchaseOrder.createdByUserName && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Created By</span>
                                                <span className="font-medium">{purchaseOrder.createdByUserName}</span>
                                            </div>
                                        )}
                                        {purchaseOrder.dateMod && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Last Modified</span>
                                                <span className="font-medium">{new Date(purchaseOrder.dateMod).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </form>
        </motion.div>
    );
};

export default EditPurchaseOrder;