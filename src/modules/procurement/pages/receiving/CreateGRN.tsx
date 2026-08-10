// src/pages/procurement/receiving/CreateGRN.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    Package,
    Building2,
    Calendar,
    User,
    Loader2,
    AlertCircle,
    CheckCircle,
    FileText,
    Search
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
import { getPurchaseOrderById,getPurchaseOrderByNumber,getPurchaseOrders } from '@/modules/procurement/services/purchaseOrder.api';
import { createGoodsReceiptNote,getActiveWarehouses } from '@/modules/procurement/services/grn.api';
// ✅ Import from warehouse API
import type { Warehouse } from '@/modules/procurement/types/purchaseOrder.types';


interface ReceivedItem {
    id: string;
    purchaseOrderItemId: string;
    description: string;
    quantityReceived: number;
    quantityAccepted: number;
    quantityRejected: number;
    rejectionReason: string;
    condition: 'Good' | 'Damaged' | 'Partial';
    unitPrice: number;
}

const CreateGRN = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { userId, userName } = useAuthStore();

    // Get PO ID from query params
    const queryParams = new URLSearchParams(location.search);
    const poIdFromQuery = queryParams.get('poId');

    // State
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingPO, setIsFetchingPO] = useState(false);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [loadingWarehouses, setLoadingWarehouses] = useState(false);
    const [poOptions, setPoOptions] = useState<Array<{ id: string; number: string }>>([]);
    const [loadingPOs, setLoadingPOs] = useState(false);
    const [purchaseOrder, setPurchaseOrder] = useState<any>(null);
    const [formData, setFormData] = useState({
        purchaseOrderId: poIdFromQuery || '',
        purchaseOrderNumber: '',
        deliveryNoteNumber: '',
        receivedDate: new Date().toISOString().split('T')[0],
        warehouseId: '',
        warehouseName: '',
        receivedBy: userName || '',
        inspectedBy: '',
        notes: ''
    });
    const [items, setItems] = useState<ReceivedItem[]>([
        {
            id: '1',
            purchaseOrderItemId: '',
            description: '',
            quantityReceived: 0,
            quantityAccepted: 0,
            quantityRejected: 0,
            rejectionReason: '',
            condition: 'Good',
            unitPrice: 0
        }
    ]);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [showErrors, setShowErrors] = useState(false);

    // Fetch warehouses
    const fetchWarehouses = useCallback(async () => {
        setLoadingWarehouses(true);
        try {
            const data = await getActiveWarehouses();
            console.log('✅ Warehouses loaded from Procurement:', data);
            setWarehouses(data);

            if (data.length > 0 && !formData.warehouseId) {
                setFormData(prev => ({
                    ...prev,
                    warehouseId: data[0].id,
                    warehouseName: data[0].name
                }));
            }
        } catch (error) {
            console.error('Error fetching warehouses:', error);
            showToast.error('Failed to load warehouses');
        } finally {
            setLoadingWarehouses(false);
        }
    }, [formData.warehouseId]);

    // Fetch POs
    const fetchPOs = useCallback(async () => {
        setLoadingPOs(true);
        try {
            const response = await getPurchaseOrders({ status: 'Confirmed' });
            const data = response?.data?.data || response?.data || [];
            setPoOptions(data.map((po: any) => ({
                id: po.id,
                number: po.purchaseOrderNumber
            })));
        } catch (error) {
            console.error('Error fetching POs:', error);
            showToast.error('Failed to load purchase orders');
        } finally {
            setLoadingPOs(false);
        }
    }, []);

    // Fetch PO details
    const fetchPurchaseOrder = useCallback(async (poId: string) => {
        if (!poId) return;

        setIsFetchingPO(true);
        try {
            const response = await getPurchaseOrderById(poId);
            const data = response?.data?.data || response?.data;
            setPurchaseOrder(data);

            // Pre-fill items from PO
            if (data?.lines && data.lines.length > 0) {
                const poItems = data.lines.map((line: any, index: number) => ({
                    id: `po-${index}`,
                    purchaseOrderItemId: line.id || `line-${index}`,
                    description: line.description || line.itemName || '',
                    quantityReceived: line.quantity || 0,
                    quantityAccepted: line.quantity || 0,
                    quantityRejected: 0,
                    rejectionReason: '',
                    condition: 'Good' as const,
                    unitPrice: line.unitPrice || 0
                }));
                setItems(poItems);
            }
        } catch (error) {
            console.error('Error fetching PO:', error);
            showToast.error('Failed to load purchase order details');
        } finally {
            setIsFetchingPO(false);
        }
    }, []);

    useEffect(() => {
        fetchWarehouses();
        fetchPOs();
    }, [fetchWarehouses, fetchPOs]);

    // Auto-select PO from query param
    useEffect(() => {
        if (poIdFromQuery) {
            setFormData(prev => ({ ...prev, purchaseOrderId: poIdFromQuery }));
            fetchPurchaseOrder(poIdFromQuery);
        }
    }, [poIdFromQuery, fetchPurchaseOrder]);

    // Add item
    const addItem = () => {
        const newId = `item-${Date.now()}`;
        setItems([...items, {
            id: newId,
            purchaseOrderItemId: '',
            description: '',
            quantityReceived: 0,
            quantityAccepted: 0,
            quantityRejected: 0,
            rejectionReason: '',
            condition: 'Good',
            unitPrice: 0
        }]);
    };

    // Remove item
    const removeItem = (id: string) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    // Update item
    const updateItem = (id: string, field: keyof ReceivedItem, value: any) => {
        setItems(items =>
            items.map(item => {
                if (item.id === id) {
                    const updated = { ...item, [field]: value };
                    if (field === 'quantityReceived') {
                        const received = Number(value) || 0;
                        const accepted = Math.min(updated.quantityAccepted, received);
                        updated.quantityAccepted = accepted;
                        updated.quantityRejected = received - accepted;
                    }
                    if (field === 'quantityAccepted') {
                        const accepted = Number(value) || 0;
                        const received = updated.quantityReceived;
                        updated.quantityAccepted = Math.min(accepted, received);
                        updated.quantityRejected = received - updated.quantityAccepted;
                    }
                    return updated;
                }
                return item;
            })
        );
    };

    // Validate form
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.purchaseOrderId) {
            errors.purchaseOrder = 'Purchase Order is required';
        }
        if (!formData.warehouseId) {
            errors.warehouse = 'Warehouse is required';
        }
        if (!formData.receivedBy?.trim()) {
            errors.receivedBy = 'Received By is required';
        }
        if (!formData.receivedDate) {
            errors.receivedDate = 'Received Date is required';
        }

        items.forEach((item, index) => {
            if (item.quantityReceived <= 0) {
                errors[`item_${index}_qty`] = `Item ${index + 1}: Quantity Received must be greater than 0`;
            }
            if (item.quantityRejected > 0 && !item.rejectionReason?.trim()) {
                errors[`item_${index}_reason`] = `Item ${index + 1}: Rejection reason is required`;
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

        setIsLoading(true);
        try {
            // ✅ Use GUIDs, not display numbers
            const payload = {
                purchaseOrderId: formData.purchaseOrderId, // This must be a GUID
                deliveryNoteNumber: formData.deliveryNoteNumber || null,
                receivedDate: new Date(formData.receivedDate).toISOString(),
                warehouseId: formData.warehouseId, // This must be a GUID
                warehouseName: formData.warehouseName || null,
                receivedBy: formData.receivedBy || userName || '',
                inspectedBy: formData.inspectedBy || null,
                notes: formData.notes || null,
                items: items.map(item => ({
                    purchaseOrderItemId: item.purchaseOrderItemId, // This must be a GUID
                    description: item.description || null,
                    quantityReceived: Number(item.quantityReceived) || 0,
                    quantityAccepted: Number(item.quantityAccepted) || 0,
                    quantityRejected: Number(item.quantityRejected) || 0,
                    condition: item.condition || 'Good',
                    rejectionReason: item.rejectionReason || null,
                    unitPrice: Number(item.unitPrice) || 0
                }))
            };

            console.log('📤 Creating GRN with payload:', JSON.stringify(payload, null, 2));

            const response = await createGoodsReceiptNote(payload);
            console.log('✅ GRN created:', response);

            showToast.success('Goods Receipt Note created successfully');
            navigate('/procurement/receipt');
        } catch (error: any) {
            console.error('Error creating GRN:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create GRN';
            showToast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const getError = (field: string) => {
        return showErrors ? validationErrors[field] || '' : '';
    };

    const hasError = (field: string) => {
        return showErrors && !!validationErrors[field];
    };

    const totals = items.reduce((acc, item) => ({
        totalReceived: acc.totalReceived + item.quantityReceived,
        totalAccepted: acc.totalAccepted + item.quantityAccepted,
        totalRejected: acc.totalRejected + item.quantityRejected
    }), { totalReceived: 0, totalAccepted: 0, totalRejected: 0 });

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
                    onClick={() => navigate('/procurement/receipt')}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create Goods Receipt Note</h1>
                    <p className="text-sm text-gray-500">Receive and inspect incoming goods</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Purchase Order Reference */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-emerald-600" />
                                    Purchase Order Reference
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="poId">Purchase Order *</Label>
                                        {loadingPOs ? (
                                            <div className="flex items-center gap-2 p-2 border rounded-lg">
                                                <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                                                <span className="text-sm text-gray-500">Loading POs...</span>
                                            </div>
                                        ) : (
                                            <Select
                                                value={formData.purchaseOrderId}
                                                onValueChange={(value) => {
                                                    const po = poOptions.find(p => p.id === value);
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        purchaseOrderId: value,
                                                        purchaseOrderNumber: po?.number || ''
                                                    }));
                                                    if (value) fetchPurchaseOrder(value);
                                                }}
                                                disabled={isLoading || isFetchingPO}
                                            >
                                                <SelectTrigger className={hasError('purchaseOrder') ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select Purchase Order" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {poOptions.length === 0 ? (
                                                        <SelectItem value="none" disabled>No approved POs available</SelectItem>
                                                    ) : (
                                                        poOptions.map((po) => (
                                                            <SelectItem key={po.id} value={po.id}>
                                                                {po.number}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        )}
                                        {getError('purchaseOrder') && (
                                            <p className="text-xs text-red-500 mt-1">{getError('purchaseOrder')}</p>
                                        )}
                                        {isFetchingPO && (
                                            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Loading PO details...
                                            </div>
                                        )}
                                        {purchaseOrder && (
                                            <div className="mt-2 p-2 bg-green-50 rounded-lg text-sm">
                                                <p className="font-medium text-green-700">{purchaseOrder.purchaseOrderNumber}</p>
                                                <p className="text-xs text-green-600">{purchaseOrder.vendorName}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="deliveryNote">Delivery Note</Label>
                                        <Input
                                            id="deliveryNote"
                                            placeholder="Enter delivery note number"
                                            value={formData.deliveryNoteNumber}
                                            onChange={(e) => setFormData(prev => ({ ...prev, deliveryNoteNumber: e.target.value }))}
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Receiving Details */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Receiving Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="receivedDate">Received Date *</Label>
                                        <Input
                                            id="receivedDate"
                                            type="date"
                                            value={formData.receivedDate}
                                            onChange={(e) => setFormData(prev => ({ ...prev, receivedDate: e.target.value }))}
                                            className={hasError('receivedDate') ? 'border-red-500' : ''}
                                            required
                                            disabled={isLoading}
                                        />
                                        {getError('receivedDate') && (
                                            <p className="text-xs text-red-500 mt-1">{getError('receivedDate')}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="warehouse">Warehouse *</Label>
                                        {loadingWarehouses ? (
                                            <div className="flex items-center gap-2 p-2 border rounded-lg">
                                                <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                                                <span className="text-sm text-gray-500">Loading warehouses...</span>
                                            </div>
                                        ) : (
                                            <Select
                                                value={formData.warehouseId}
                                                onValueChange={(value) => {
                                                    const warehouse = warehouses.find(w => w.id === value);
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        warehouseId: value,
                                                        warehouseName: warehouse?.name || ''
                                                    }));
                                                }}
                                                disabled={isLoading || warehouses.length === 0}
                                            >
                                                <SelectTrigger className={hasError('warehouse') ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select warehouse" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {warehouses.length === 0 ? (
                                                        <SelectItem value="" disabled>No warehouses available</SelectItem>
                                                    ) : (
                                                        warehouses.map((warehouse) => (
                                                            <SelectItem key={warehouse.id} value={warehouse.id}>
                                                                {warehouse.code} - {warehouse.name}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        )}
                                        {getError('warehouse') && (
                                            <p className="text-xs text-red-500 mt-1">{getError('warehouse')}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="receivedBy">Received By *</Label>
                                        <Input
                                            id="receivedBy"
                                            placeholder="Name of person receiving goods"
                                            value={formData.receivedBy}
                                            onChange={(e) => setFormData(prev => ({ ...prev, receivedBy: e.target.value }))}
                                            className={hasError('receivedBy') ? 'border-red-500' : ''}
                                            required
                                            disabled={isLoading}
                                        />
                                        {getError('receivedBy') && (
                                            <p className="text-xs text-red-500 mt-1">{getError('receivedBy')}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="inspectedBy">Inspected By</Label>
                                        <Input
                                            id="inspectedBy"
                                            placeholder="Name of inspector"
                                            value={formData.inspectedBy}
                                            onChange={(e) => setFormData(prev => ({ ...prev, inspectedBy: e.target.value }))}
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Received Items */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-gray-900">Received Items</h3>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addItem}
                                        className="flex items-center gap-2"
                                        disabled={isLoading}
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Item
                                    </Button>
                                </div>

                                {getError('items') && (
                                    <p className="text-xs text-red-500 mb-2">{getError('items')}</p>
                                )}

                                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                    {items.map((item, index) => (
                                        <div key={item.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <Label className="text-xs text-gray-500">PO Item ID</Label>
                                                    <Input
                                                        value={item.purchaseOrderItemId}
                                                        onChange={(e) => updateItem(item.id, 'purchaseOrderItemId', e.target.value)}
                                                        placeholder="PO item reference"
                                                        className="text-sm"
                                                        disabled={isLoading}
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs text-gray-500">Description</Label>
                                                    <Input
                                                        value={item.description}
                                                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                        placeholder="Item description"
                                                        className="text-sm"
                                                        disabled={isLoading}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                                <div>
                                                    <Label className="text-xs text-gray-500">Qty Received *</Label>
                                                    <Input
                                                        type="number"
                                                        value={item.quantityReceived || ''}
                                                        onChange={(e) => updateItem(item.id, 'quantityReceived', parseInt(e.target.value) || 0)}
                                                        min="0"
                                                        className={`text-sm ${hasError(`item_${index}_qty`) ? 'border-red-500' : ''}`}
                                                        disabled={isLoading}
                                                    />
                                                    {hasError(`item_${index}_qty`) && (
                                                        <p className="text-xs text-red-500 mt-0.5">{getError(`item_${index}_qty`)}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <Label className="text-xs text-gray-500">Qty Accepted</Label>
                                                    <Input
                                                        type="number"
                                                        value={item.quantityAccepted || ''}
                                                        onChange={(e) => updateItem(item.id, 'quantityAccepted', parseInt(e.target.value) || 0)}
                                                        min="0"
                                                        className="text-sm"
                                                        disabled={isLoading}
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs text-gray-500">Qty Rejected</Label>
                                                    <Input
                                                        type="number"
                                                        value={item.quantityRejected || ''}
                                                        onChange={(e) => updateItem(item.id, 'quantityRejected', parseInt(e.target.value) || 0)}
                                                        min="0"
                                                        className="text-sm"
                                                        disabled={isLoading}
                                                    />
                                                    {hasError(`item_${index}_reason`) && (
                                                        <p className="text-xs text-red-500 mt-0.5">{getError(`item_${index}_reason`)}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <Label className="text-xs text-gray-500">Condition</Label>
                                                    <Select
                                                        value={item.condition}
                                                        onValueChange={(value: any) => updateItem(item.id, 'condition', value)}
                                                        disabled={isLoading}
                                                    >
                                                        <SelectTrigger className="text-sm">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Good">Good</SelectItem>
                                                            <SelectItem value="Damaged">Damaged</SelectItem>
                                                            <SelectItem value="Partial">Partial</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            {item.quantityRejected > 0 && (
                                                <div>
                                                    <Label className="text-xs text-gray-500">Rejection Reason *</Label>
                                                    <Input
                                                        value={item.rejectionReason}
                                                        onChange={(e) => updateItem(item.id, 'rejectionReason', e.target.value)}
                                                        placeholder="Reason for rejection"
                                                        className={`text-sm ${hasError(`item_${index}_reason`) ? 'border-red-500' : ''}`}
                                                        disabled={isLoading}
                                                    />
                                                    {hasError(`item_${index}_reason`) && (
                                                        <p className="text-xs text-red-500 mt-0.5">{getError(`item_${index}_reason`)}</p>
                                                    )}
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-400">
                                                    Unit Price: ${(item.unitPrice || 0).toFixed(2)}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-700"
                                                    onClick={() => removeItem(item.id)}
                                                    disabled={items.length === 1 || isLoading}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notes */}
                        <Card>
                            <CardContent className="p-6">
                                <Label htmlFor="notes">Notes</Label>
                                <textarea
                                    id="notes"
                                    rows={3}
                                    placeholder="Additional notes or comments"
                                    value={formData.notes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                    disabled={isLoading}
                                />
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
                                                Create GRN
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => navigate('/procurement/receipt')}
                                        disabled={isLoading}
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
                                        <span className="text-gray-500">Total Items</span>
                                        <span className="font-medium">{items.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Total Received</span>
                                        <span className="font-medium">{totals.totalReceived}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Total Accepted</span>
                                        <span className="font-medium text-green-600">{totals.totalAccepted}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Total Rejected</span>
                                        <span className="font-medium text-red-600">{totals.totalRejected}</span>
                                    </div>
                                    <hr className="my-2" />
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Status</span>
                                        <span className="font-medium text-blue-600">Draft</span>
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

export default CreateGRN;