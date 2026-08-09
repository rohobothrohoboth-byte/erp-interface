// src/components/crm/salesManagement/components/orders/EditOrderModal.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    X,
    ShoppingCart,
    DollarSign,
    Calendar,
    Building2,
    Loader2,
    Plus,
    Trash2,
} from 'lucide-react';
import { Button } from '../../../../ui/button';
import { Input } from '../../../../ui/input';
import { Label } from '../../../../ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../../ui/select';
import { Textarea } from '../../../../ui/textarea';
import { updateOrder } from '../../../../../services/crm/crm.api';
import { getCustomers } from '../../../../../services/crm/crm.api';
import { showToast } from '../../../../../layout/layout';
import type { OrderDto, CustomerDto } from '../../../../../types/crm/crm.types';

interface OrderLine {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    totalPrice: number;
}

interface EditOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    order: OrderDto | null;
}

const EditOrderModal: React.FC<EditOrderModalProps> = ({
                                                           isOpen,
                                                           onClose,
                                                           onSuccess,
                                                           order,
                                                       }) => {
    const [loading, setLoading] = useState(false);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [customers, setCustomers] = useState<CustomerDto[]>([]);

    const [formData, setFormData] = useState({
        customerId: '',
        orderDate: '',
        status: 'Pending',
        shippingAddress: '',
        billingAddress: '',
        notes: '',
        subTotal: 0,
        taxAmount: 0,
        discountAmount: 0,
        shippingCost: 0,
        totalAmount: 0,
    });

    const [lines, setLines] = useState<OrderLine[]>([]);

    useEffect(() => {
        if (isOpen) {
            fetchCustomers();
            if (order) {
                setFormData({
                    customerId: order.customerId || '',
                    orderDate: order.orderDate ? new Date(order.orderDate).toISOString().split('T')[0] : '',
                    status: order.status || 'Pending',
                    shippingAddress: order.shippingAddress || '',
                    billingAddress: order.billingAddress || '',
                    notes: order.notes || '',
                    subTotal: order.subTotal || 0,
                    taxAmount: order.taxAmount || 0,
                    discountAmount: order.discountAmount || 0,
                    shippingCost: order.shippingCost || 0,
                    totalAmount: order.totalAmount || 0,
                });
                setLines(order.orderLines?.map(line => ({
                    id: line.id,
                    description: line.description,
                    quantity: line.quantity,
                    unitPrice: line.unitPrice,
                    discount: line.discount,
                    totalPrice: line.totalPrice,
                })) || []);
            }
        }
    }, [isOpen, order]);

    const fetchCustomers = async () => {
        try {
            setLoadingOptions(true);
            const response = await getCustomers({ page: 1, pageSize: 100 });
            setCustomers(response.data?.data || []);
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoadingOptions(false);
        }
    };

    const calculateTotals = (lines: OrderLine[]) => {
        const subTotal = lines.reduce((sum, line) => sum + line.totalPrice, 0);
        const taxAmount = subTotal * 0.1;
        const total = subTotal + taxAmount - formData.discountAmount + formData.shippingCost;
        return { subTotal, taxAmount, total };
    };

    const addLine = () => {
        setLines([
            ...lines,
            {
                id: crypto.randomUUID(),
                description: '',
                quantity: 1,
                unitPrice: 0,
                discount: 0,
                totalPrice: 0,
            },
        ]);
    };

    const removeLine = (id: string) => {
        if (lines.length === 1) return;
        setLines(lines.filter(line => line.id !== id));
    };

    const updateLine = (id: string, field: keyof OrderLine, value: string | number) => {
        setLines(lines.map(line => {
            if (line.id !== id) return line;
            const updated = { ...line, [field]: value };
            const quantity = typeof updated.quantity === 'string' ? parseFloat(updated.quantity) || 0 : updated.quantity;
            const unitPrice = typeof updated.unitPrice === 'string' ? parseFloat(updated.unitPrice) || 0 : updated.unitPrice;
            const discount = typeof updated.discount === 'string' ? parseFloat(updated.discount) || 0 : updated.discount;
            updated.totalPrice = quantity * unitPrice * (1 - discount / 100);
            return updated;
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!order) return;

        if (!formData.customerId) {
            showToast.error('Please select a customer');
            return;
        }

        if (lines.some(line => !line.description.trim())) {
            showToast.error('Please add descriptions for all line items');
            return;
        }

        const { subTotal, taxAmount, total } = calculateTotals(lines);

        try {
            setLoading(true);
            await updateOrder(order.id, {
                ...formData,
                subTotal,
                taxAmount,
                totalAmount: total,
                orderLines: lines.map(line => ({
                    description: line.description,
                    quantity: line.quantity,
                    unitPrice: line.unitPrice,
                    discount: line.discount,
                    notes: '',
                })),
            });
            showToast.success('Order updated successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error updating order:', error);
            showToast.error(error?.response?.data?.message || 'Failed to update order');
        } finally {
            setLoading(false);
        }
    };

    const statusOptions = ['Draft', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Completed'];

    if (!isOpen || !order) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-6"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <ShoppingCart className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Edit Order</h2>
                            <p className="text-sm text-gray-500">{order.orderNumber}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {loadingOptions ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                        <span className="ml-3 text-gray-600">Loading options...</span>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="customerId" className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-gray-500" />
                                    Customer *
                                </Label>
                                <Select value={formData.customerId} onValueChange={(value) => setFormData({ ...formData, customerId: value })}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select customer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {customers.map((customer) => (
                                            <SelectItem key={customer.id} value={customer.id}>
                                                {customer.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="orderDate" className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-500" />
                                    Order Date
                                </Label>
                                <Input
                                    id="orderDate"
                                    type="date"
                                    value={formData.orderDate}
                                    onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map((status) => (
                                            <SelectItem key={status} value={status}>{status}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="shippingAddress">Shipping Address</Label>
                                <Textarea
                                    id="shippingAddress"
                                    value={formData.shippingAddress}
                                    onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                                    placeholder="Enter shipping address..."
                                    className="mt-1"
                                    rows={2}
                                />
                            </div>
                            <div>
                                <Label htmlFor="billingAddress">Billing Address</Label>
                                <Textarea
                                    id="billingAddress"
                                    value={formData.billingAddress}
                                    onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                                    placeholder="Enter billing address..."
                                    className="mt-1"
                                    rows={2}
                                />
                            </div>
                        </div>

                        {/* Order Lines */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <Label>Line Items</Label>
                                <Button type="button" variant="outline" size="sm" onClick={addLine} className="flex items-center gap-1">
                                    <Plus className="h-4 w-4" />
                                    Add Line
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {lines.map((line) => (
                                    <div key={line.id} className="grid grid-cols-12 gap-2 p-3 bg-gray-50 rounded-lg">
                                        <div className="col-span-5">
                                            <Input
                                                placeholder="Description"
                                                value={line.description}
                                                onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <Input
                                                type="number"
                                                placeholder="Qty"
                                                value={line.quantity}
                                                onChange={(e) => updateLine(line.id, 'quantity', e.target.value)}
                                                min={1}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Input
                                                type="number"
                                                placeholder="Unit Price"
                                                value={line.unitPrice}
                                                onChange={(e) => updateLine(line.id, 'unitPrice', e.target.value)}
                                                min={0}
                                                step={0.01}
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <Input
                                                type="number"
                                                placeholder="Disc %"
                                                value={line.discount}
                                                onChange={(e) => updateLine(line.id, 'discount', e.target.value)}
                                                min={0}
                                                max={100}
                                            />
                                        </div>
                                        <div className="col-span-2 font-medium text-right text-indigo-600">
                                            ${line.totalPrice.toFixed(2)}
                                        </div>
                                        <div className="col-span-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeLine(line.id)}
                                                disabled={lines.length === 1}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">${calculateTotals(lines).subTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tax (10%)</span>
                                <span className="font-medium">${calculateTotals(lines).taxAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <Label htmlFor="discountAmount" className="text-gray-600">Discount</Label>
                                <div className="w-32">
                                    <Input
                                        id="discountAmount"
                                        type="number"
                                        value={formData.discountAmount}
                                        onChange={(e) => setFormData({ ...formData, discountAmount: parseFloat(e.target.value) || 0 })}
                                        min={0}
                                        step={0.01}
                                        className="text-right"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <Label htmlFor="shippingCost" className="text-gray-600">Shipping</Label>
                                <div className="w-32">
                                    <Input
                                        id="shippingCost"
                                        type="number"
                                        value={formData.shippingCost}
                                        onChange={(e) => setFormData({ ...formData, shippingCost: parseFloat(e.target.value) || 0 })}
                                        min={0}
                                        step={0.01}
                                        className="text-right"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between border-t pt-2 font-bold text-lg">
                                <span>Total</span>
                                <span className="text-indigo-600">${calculateTotals(lines).total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Additional notes..."
                                className="mt-1"
                                rows={2}
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update Order'
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default EditOrderModal;