// pages/procurement/po/CreatePurchaseOrder.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Building2, Calendar, DollarSign, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { showToast } from '@/shared/layout/layout';
import { useAuthStore } from '@/shared/stores/auth.store';
import { useVendors } from '@/modules/procurement/hooks/useVendors';
// ✅ FIXED: Import from correct path
import { useFinancialPeriods } from '@/modules/finance/hooks/useFinancialPeriods';
import { createPurchaseOrder } from '@/modules/procurement/services/purchaseOrder.api';
import { DEFAULT_PO_FORM_DATA, PO_STATUSES, PO_CURRENCIES, PO_PAYMENT_TERMS } from '@/modules/procurement/constants/purchaseOrderConstants';
import type { PurchaseOrderFormData, PurchaseOrderLine } from '@/modules/procurement/types/purchaseOrder.types';

const CreatePurchaseOrder = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<PurchaseOrderFormData>(DEFAULT_PO_FORM_DATA);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [showErrors, setShowErrors] = useState(false);

    // ✅ Get user data from auth store
    const { userId, userName } = useAuthStore();
    const { vendors, loading: vendorsLoading, fetchVendors } = useVendors();
    const { periods, loading: periodsLoading, fetchPeriods } = useFinancialPeriods();

    // Fetch vendors and periods on mount
    useEffect(() => {
        fetchVendors();
        fetchPeriods({ isClosed: false, isActive: true });
    }, []);

    // Generate PO number
    useEffect(() => {
        if (!formData.purchaseOrderNumber) {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const count = Math.floor(Math.random() * 1000);
            setFormData(prev => ({
                ...prev,
                purchaseOrderNumber: `PO-${year}${month}-${String(count).padStart(3, '0')}`
            }));
        }
    }, []);

    // Calculate totals
    const calculateLineTotal = (line: PurchaseOrderLine) => {
        const subtotal = (line.quantity || 0) * (line.unitPrice || 0);
        const taxAmount = subtotal * ((line.taxRate || 0) / 100);
        return subtotal + taxAmount;
    };

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
            return { ...prev, lines: newLines };
        });
    };

    // Add/Remove lines
    const addLine = () => {
        setFormData(prev => ({
            ...prev,
            lines: [
                ...prev.lines,
                { description: '', quantity: 1, unitPrice: 0, totalAmount: 0, taxRate: 0, unitOfMeasure: 'Each' }
            ]
        }));
    };

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
            if (line.unitPrice <= 0) {
                errors[`line_${index}_unitPrice`] = `Line ${index + 1}: Unit price must be greater than 0`;
            }
        });

        setValidationErrors(errors);
        setShowErrors(true);
        return Object.keys(errors).length === 0;
    };

    // Submit form
    // pages/procurement/po/CreatePurchaseOrder.tsx - Fix date formatting

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            const firstError = Object.values(validationErrors)[0];
            if (firstError) showToast.error(firstError);
            return;
        }

        setIsLoading(true);
        try {
            const totalAmount = calculateTotal();

            // ✅ FIX: Ensure dates are in UTC format
            const orderDate = formData.orderDate ? new Date(formData.orderDate).toISOString() : new Date().toISOString();
            const expectedDeliveryDate = formData.expectedDeliveryDate
                ? new Date(formData.expectedDeliveryDate).toISOString()
                : null;

            // ✅ Format payload to match backend
            const payload = {
                purchaseOrderNumber: formData.purchaseOrderNumber,
                orderDate: orderDate, // ✅ UTC format
                expectedDeliveryDate: expectedDeliveryDate, // ✅ UTC format or null
                vendorId: formData.vendorId || null,
                vendorName: formData.vendorName || '',
                description: formData.description || '',
                totalAmount: totalAmount,
                status: formData.status || 'Draft',
                currency: formData.currency || 'USD',
                paymentTerms: formData.paymentTerms || 'Net 30',
                shippingAddress: formData.shippingAddress || '',
                requisitionId: formData.requisitionId || null,
                requisitionNumber: formData.requisitionNumber || '',
                periodId: formData.periodId,
                createdByUserId: userId || null,
                createdByUserName: userName || null,
                lines: formData.lines.map(line => ({
                    description: line.description,
                    quantity: line.quantity,
                    unitPrice: line.unitPrice,
                    totalAmount: (line.quantity * line.unitPrice) + ((line.quantity * line.unitPrice) * (line.taxRate || 0) / 100),
                    discount: 0,
                    taxRate: line.taxRate || 0,
                    taxAmount: (line.quantity * line.unitPrice) * ((line.taxRate || 0) / 100),
                    unitOfMeasure: line.unitOfMeasure || 'Each',
                    periodId: formData.periodId || null
                }))
            };

            console.log('📤 Creating purchase order:', payload);

            const response = await createPurchaseOrder(payload);
            console.log('✅ Purchase order created:', response.data);

            showToast.success('Purchase order created successfully');
            navigate('/procurement/po');
        } catch (error: any) {
            console.error('Error creating purchase order:', error);
            const errorMessage = error.response?.data?.message || 'Failed to create purchase order';
            showToast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const totalAmount = calculateTotal();

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
                    onClick={() => navigate('/procurement/po')}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create Purchase Order</h1>
                    <p className="text-sm text-gray-500">Create a new purchase order</p>
                </div>
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
                                            value={formData.expectedDeliveryDate || ''}
                                            onChange={(e) => setFormData(prev => ({ ...prev, expectedDeliveryDate: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label>Description</Label>
                                        <Input
                                            placeholder="PO description"
                                            value={formData.description || ''}
                                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label>Status</Label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PO_STATUSES.map((status) => (
                                                    <SelectItem key={status.value} value={status.value}>
                                                        {status.label}
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
                                </div>

                                {showErrors && validationErrors.lines && (
                                    <p className="text-xs text-red-500 mb-2">{validationErrors.lines}</p>
                                )}

                                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                    {formData.lines.map((line, index) => (
                                        <div key={index} className="flex items-end gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex-[2]">
                                                <Label className="text-xs text-gray-500">Description *</Label>
                                                <Input
                                                    value={line.description}
                                                    onChange={(e) => updateLine(index, 'description', e.target.value)}
                                                    placeholder="Item description"
                                                    className={`text-sm ${showErrors && validationErrors[`line_${index}_description`] ? 'border-red-500' : ''}`}
                                                />
                                                {showErrors && validationErrors[`line_${index}_description`] && (
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
                                                    className={`text-sm ${showErrors && validationErrors[`line_${index}_quantity`] ? 'border-red-500' : ''}`}
                                                />
                                            </div>
                                            <div className="w-24">
                                                <Label className="text-xs text-gray-500">Unit Price *</Label>
                                                <Input
                                                    type="number"
                                                    value={line.unitPrice}
                                                    onChange={(e) => updateLine(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                    min="0"
                                                    step="0.01"
                                                    className={`text-sm ${showErrors && validationErrors[`line_${index}_unitPrice`] ? 'border-red-500' : ''}`}
                                                />
                                            </div>
                                            <div className="w-16">
                                                <Label className="text-xs text-gray-500">Tax %</Label>
                                                <Input
                                                    type="number"
                                                    value={line.taxRate || 0}
                                                    onChange={(e) => updateLine(index, 'taxRate', parseFloat(e.target.value) || 0)}
                                                    min="0"
                                                    max="100"
                                                    className="text-sm"
                                                />
                                            </div>
                                            <div className="w-24">
                                                <Label className="text-xs text-gray-500">Unit</Label>
                                                <Input
                                                    value={line.unitOfMeasure || ''}
                                                    onChange={(e) => updateLine(index, 'unitOfMeasure', e.target.value)}
                                                    placeholder="Each"
                                                    className="text-sm"
                                                />
                                            </div>
                                            <div className="w-28">
                                                <Label className="text-xs text-gray-500">Total</Label>
                                                <div className="px-2 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-900 text-right">
                                                    ${calculateLineTotal(line).toFixed(2)}
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-700 mt-4"
                                                onClick={() => removeLine(index)}
                                                disabled={formData.lines.length === 1}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
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
                                    <Button
                                        type="submit"
                                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Create PO
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => {
                                            setFormData(prev => ({ ...prev, status: 'Draft' }));
                                            handleSubmit(new Event('submit') as any);
                                        }}
                                        disabled={isLoading}
                                    >
                                        Save as Draft
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="w-full text-red-600 hover:text-red-700"
                                        onClick={() => navigate('/procurement/po')}
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
                                        <span>Status: {formData.status}</span>
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

export default CreatePurchaseOrder;