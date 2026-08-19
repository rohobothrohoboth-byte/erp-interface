import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    FileText,
    Building2,
    Calendar,
    DollarSign,
    Loader2,
    User,
    Hash,
    Package,
    Receipt,
    X
} from 'lucide-react';
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
import { getPurchaseOrders } from '@/modules/procurement/services/purchaseOrder.api';
import { createInvoice } from '@/modules/procurement/services/invoice.api';

interface InvoiceLineItem {
    id: string;
    purchaseOrderItemId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    discount?: number;
    taxAmount?: number;
}

const CreateInvoice = () => {
    const navigate = useNavigate();
    const { userId, userName } = useAuthStore();

    // State
    const [isLoading, setIsLoading] = useState(false);
    const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
    const [loadingPOs, setLoadingPOs] = useState(false);
    const [selectedPO, setSelectedPO] = useState<any>(null);
    const [formData, setFormData] = useState({
        purchaseOrderId: '',
        title: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentTerms: 'Net 30',
        notes: ''
    });
    const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
        {
            id: '1',
            purchaseOrderItemId: '',
            description: '',
            quantity: 1,
            unitPrice: 0,
            totalAmount: 0,
            discount: 0,
            taxAmount: 0
        }
    ]);

    // Fetch purchase orders
    const fetchPurchaseOrders = useCallback(async () => {
        setLoadingPOs(true);
        try {
            const response = await getPurchaseOrders({ status: 'Confirmed' });
            const data = response?.data?.data || response?.data || [];
            setPurchaseOrders(data);
        } catch (error) {
            console.error('Error fetching POs:', error);
            showToast.error('Failed to load purchase orders');
        } finally {
            setLoadingPOs(false);
        }
    }, []);

    useEffect(() => {
        fetchPurchaseOrders();
    }, [fetchPurchaseOrders]);

    // Handle PO selection
    const handlePOSelect = (poId: string) => {
        const po = purchaseOrders.find(p => p.id === poId);
        setSelectedPO(po);
        setFormData(prev => ({ ...prev, purchaseOrderId: poId, title: po?.title || '' }));

        // Pre-fill line items from PO
        if (po?.lines) {
            const items = po.lines.map((line: any, index: number) => ({
                id: `po-${index}`,
                purchaseOrderItemId: line.id || `line-${index}`,
                description: line.description || line.itemName || '',
                quantity: line.quantity || 1,
                unitPrice: line.unitPrice || 0,
                totalAmount: (line.quantity || 1) * (line.unitPrice || 0),
                discount: 0,
                taxAmount: 0
            }));
            setLineItems(items);
        }
    };

    // Calculate line total
    const calculateLineTotal = (line: InvoiceLineItem) => {
        const total = line.quantity * line.unitPrice;
        const discount = line.discount || 0;
        const tax = line.taxAmount || 0;
        return total - discount + tax;
    };

    // Calculate total
    const calculateTotal = () => {
        return lineItems.reduce((sum, line) => sum + calculateLineTotal(line), 0);
    };

    // Update line item
    const updateLine = (index: number, field: keyof InvoiceLineItem, value: any) => {
        setLineItems(prev => {
            const newLines = [...prev];
            newLines[index] = { ...newLines[index], [field]: value };
            if (field === 'quantity' || field === 'unitPrice' || field === 'discount' || field === 'taxAmount') {
                const total = newLines[index].quantity * newLines[index].unitPrice;
                const discount = newLines[index].discount || 0;
                const tax = newLines[index].taxAmount || 0;
                newLines[index].totalAmount = total - discount + tax;
            }
            return newLines;
        });
    };

    // Add line
    const addLine = () => {
        setLineItems(prev => [...prev, {
            id: `line-${Date.now()}`,
            purchaseOrderItemId: '',
            description: '',
            quantity: 1,
            unitPrice: 0,
            totalAmount: 0,
            discount: 0,
            taxAmount: 0
        }]);
    };

    // Remove line
    const removeLine = (index: number) => {
        if (lineItems.length > 1) {
            setLineItems(prev => prev.filter((_, i) => i !== index));
        }
    };

    // Validate form
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.purchaseOrderId) {
            errors.purchaseOrder = 'Purchase Order is required';
        }
        if (!formData.invoiceDate) {
            errors.invoiceDate = 'Invoice date is required';
        }
        if (!formData.dueDate) {
            errors.dueDate = 'Due date is required';
        }

        lineItems.forEach((line, index) => {
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

        if (Object.keys(errors).length > 0) {
            const firstError = Object.values(errors)[0];
            showToast.error(firstError);
            return false;
        }

        return true;
    };

    // Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const payload = {
                purchaseOrderId: formData.purchaseOrderId,
                title: formData.title,
                invoiceDate: new Date(formData.invoiceDate).toISOString(),
                dueDate: new Date(formData.dueDate).toISOString(),
                paymentTerms: formData.paymentTerms,
                notes: formData.notes,
                lineItems: lineItems.map(item => ({
                    purchaseOrderItemId: item.purchaseOrderItemId,
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    discount: item.discount || 0,
                    taxAmount: item.taxAmount || 0
                }))
            };

            await createInvoice(payload);
            showToast.success('Invoice created successfully');
            navigate('/procurement/invoice');
        } catch (error: any) {
            console.error('Error creating invoice:', error);
            showToast.error(error?.response?.data?.message || 'Failed to create invoice');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/procurement/invoice')} className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create Invoice</h1>
                    <p className="text-sm text-gray-500">Create a new vendor invoice</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-emerald-600" />
                                    Basic Information
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <Label>Purchase Order *</Label>
                                        {loadingPOs ? (
                                            <div className="flex items-center gap-2 p-2 border rounded-lg">
                                                <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                                                <span className="text-sm text-gray-500">Loading POs...</span>
                                            </div>
                                        ) : (
                                            <Select value={formData.purchaseOrderId} onValueChange={handlePOSelect}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Purchase Order" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {purchaseOrders.map((po) => (
                                                        <SelectItem key={po.id} value={po.id}>
                                                            {po.purchaseOrderNumber} - {po.vendorName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>
                                    <div>
                                        <Label>Title</Label>
                                        <Input
                                            placeholder="Invoice title"
                                            value={formData.title}
                                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Invoice Date *</Label>
                                            <Input
                                                type="date"
                                                value={formData.invoiceDate}
                                                onChange={(e) => setFormData(prev => ({ ...prev, invoiceDate: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label>Due Date *</Label>
                                            <Input
                                                type="date"
                                                value={formData.dueDate}
                                                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                                                required
                                            />
                                        </div>
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
                                                <SelectItem value="Net 30">Net 30</SelectItem>
                                                <SelectItem value="Net 60">Net 60</SelectItem>
                                                <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Notes</Label>
                                        <textarea
                                            rows={3}
                                            placeholder="Additional notes"
                                            value={formData.notes}
                                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
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
                                    <Button type="button" variant="outline" size="sm" onClick={addLine} className="flex items-center gap-2">
                                        <Plus className="w-4 h-4" />
                                        Add Item
                                    </Button>
                                </div>

                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                    {lineItems.map((line, index) => (
                                        <div key={line.id} className="flex items-end gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex-[2]">
                                                <Label className="text-xs text-gray-500">Description *</Label>
                                                <Input
                                                    value={line.description}
                                                    onChange={(e) => updateLine(index, 'description', e.target.value)}
                                                    placeholder="Item description"
                                                    className="text-sm"
                                                />
                                            </div>
                                            <div className="w-16">
                                                <Label className="text-xs text-gray-500">Qty *</Label>
                                                <Input
                                                    type="number"
                                                    value={line.quantity}
                                                    onChange={(e) => updateLine(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                    min="0.01"
                                                    step="0.01"
                                                    className="text-sm"
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
                                                    className="text-sm"
                                                />
                                            </div>
                                            <div className="w-20">
                                                <Label className="text-xs text-gray-500">Discount</Label>
                                                <Input
                                                    type="number"
                                                    value={line.discount || ''}
                                                    onChange={(e) => updateLine(index, 'discount', parseFloat(e.target.value) || 0)}
                                                    min="0"
                                                    step="0.01"
                                                    className="text-sm"
                                                />
                                            </div>
                                            <div className="w-20">
                                                <Label className="text-xs text-gray-500">Tax</Label>
                                                <Input
                                                    type="number"
                                                    value={line.taxAmount || ''}
                                                    onChange={(e) => updateLine(index, 'taxAmount', parseFloat(e.target.value) || 0)}
                                                    min="0"
                                                    step="0.01"
                                                    className="text-sm"
                                                />
                                            </div>
                                            <div className="w-28">
                                                <Label className="text-xs text-gray-500">Total</Label>
                                                <div className="px-2 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-900 text-right">
                                                    ${calculateLineTotal(line).toFixed(2)}
                                                </div>
                                            </div>
                                            {lineItems.length > 1 && (
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
                                    ))}
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Total Items: {lineItems.length}</span>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">Total Amount</p>
                                        <p className="text-2xl font-bold text-gray-900">${calculateTotal().toFixed(2)}</p>
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
                                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Create Invoice
                                            </>
                                        )}
                                    </Button>
                                    <Button type="button" variant="outline" className="w-full" onClick={() => navigate('/procurement/invoice')}>
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
                                        <span className="text-gray-500">Total Items</span>
                                        <span className="font-medium">{lineItems.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Total Amount</span>
                                        <span className="font-bold text-emerald-600">${calculateTotal().toFixed(2)}</span>
                                    </div>
                                    {selectedPO && (
                                        <>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">PO Number</span>
                                                <span className="font-medium">{selectedPO.purchaseOrderNumber}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Vendor</span>
                                                <span className="font-medium">{selectedPO.vendorName}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </motion.div>
    );
};

export default CreateInvoice;