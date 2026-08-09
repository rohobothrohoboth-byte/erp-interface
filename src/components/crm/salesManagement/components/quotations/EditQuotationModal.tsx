// src/components/crm/salesManagement/components/quotations/EditQuotationModal.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Save,
    User,
    Mail,
    Phone,
    Calendar,
    FileText,
    Package,
    Plus,
    Trash2,
    RefreshCw,
    Building2,
    Users,
    AlertCircle,
} from 'lucide-react';
import { Button } from '../../../../ui/button';
import { Input } from '../../../../ui/input';
import { Label } from '../../../../ui/label';
import { Textarea } from '../../../../ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../../ui/select';
import { showToast } from '../../../../../layout/layout';
import { updateQuote, getQuoteById } from '../../../../../services/crm/crm.api';
import { getCustomers, getOpportunities } from '../../../../../services/crm/crm.api';
import type { QuoteDto, QuoteLineDto } from '../../../../../types/crm/crm.types';

interface EditQuotationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    quote: QuoteDto | null;
}

interface EditQuoteLine {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
    totalPrice: number;
}

const EditQuotationModal: React.FC<EditQuotationModalProps> = ({
                                                                   isOpen,
                                                                   onClose,
                                                                   onSuccess,
                                                                   quote,
                                                               }) => {
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [customers, setCustomers] = useState<any[]>([]);
    const [opportunities, setOpportunities] = useState<any[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

    const [formData, setFormData] = useState({
        customerId: '',
        opportunityId: '',
        validUntil: '',
        discountAmount: 0,
        shippingCost: 0,
        termsAndConditions: '',
        notes: '',
    });

    const [lines, setLines] = useState<EditQuoteLine[]>([]);

    useEffect(() => {
        if (isOpen && quote) {
            fetchQuoteData();
            fetchOptions();
        }
    }, [isOpen, quote]);

    const fetchQuoteData = async () => {
        if (!quote) return;
        try {
            setLoadingData(true);
            // Fetch the full quote data with all details
            const fullQuote = await getQuoteById(quote.id);
            console.log('Edit Modal - Full quote data:', fullQuote);
            console.log('Edit Modal - Quote lines:', fullQuote.quoteLines);

            // Populate form data
            setFormData({
                customerId: fullQuote.customerId || '',
                opportunityId: fullQuote.opportunityId || '',
                validUntil: fullQuote.validUntil ? new Date(fullQuote.validUntil).toISOString().split('T')[0] : '',
                discountAmount: fullQuote.discountAmount || 0,
                shippingCost: fullQuote.shippingCost || 0,
                termsAndConditions: fullQuote.termsAndConditions || '',
                notes: fullQuote.notes || '',
            });

            // Populate lines
            if (fullQuote.quoteLines && fullQuote.quoteLines.length > 0) {
                setLines(fullQuote.quoteLines.map((line: QuoteLineDto) => ({
                    id: line.id || crypto.randomUUID(),
                    description: line.description || '',
                    quantity: line.quantity || 1,
                    unitPrice: line.unitPrice || 0,
                    discount: line.discount || 0,
                    taxRate: line.taxRate || 0,
                    totalPrice: line.totalPrice || 0,
                })));
            } else {
                setLines([{
                    id: crypto.randomUUID(),
                    description: '',
                    quantity: 1,
                    unitPrice: 0,
                    discount: 0,
                    taxRate: 0,
                    totalPrice: 0,
                }]);
            }

            // Set selected customer
            if (fullQuote.customerId) {
                const customer = customers.find(c => c.id === fullQuote.customerId);
                setSelectedCustomer(customer || null);
            }
        } catch (error) {
            console.error('Error fetching quote data:', error);
            showToast.error('Failed to load quote data');
        } finally {
            setLoadingData(false);
        }
    };

    const fetchOptions = async () => {
        try {
            setLoadingOptions(true);
            const [customersRes, opportunitiesRes] = await Promise.all([
                getCustomers({ page: 1, pageSize: 1000 }),
                getOpportunities({ page: 1, pageSize: 1000 }),
            ]);
            setCustomers(customersRes.data?.data || []);
            setOpportunities(opportunitiesRes.data?.data || []);
        } catch (error) {
            console.error('Error fetching options:', error);
        } finally {
            setLoadingOptions(false);
        }
    };

    const calculateTotal = (lines: EditQuoteLine[]) => {
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
                taxRate: 0,
                totalPrice: 0,
            },
        ]);
    };

    const removeLine = (id: string) => {
        if (lines.length === 1) return;
        setLines(lines.filter(line => line.id !== id));
    };

    const updateLine = (id: string, field: keyof EditQuoteLine, value: string | number) => {
        setLines(lines.map(line => {
            if (line.id !== id) return line;
            const updated = { ...line, [field]: value };
            const quantity = typeof updated.quantity === 'string' ? parseFloat(updated.quantity) || 0 : updated.quantity;
            const unitPrice = typeof updated.unitPrice === 'string' ? parseFloat(updated.unitPrice) || 0 : updated.unitPrice;
            const discount = typeof updated.discount === 'string' ? parseFloat(updated.discount) || 0 : updated.discount;
            const taxRate = typeof updated.taxRate === 'string' ? parseFloat(updated.taxRate) || 0 : updated.taxRate;
            updated.totalPrice = quantity * unitPrice * (1 - discount / 100) * (1 + taxRate / 100);
            return updated;
        }));
    };

    const handleCustomerChange = (customerId: string) => {
        const customer = customers.find(c => c.id === customerId);
        setSelectedCustomer(customer || null);
        setFormData({ ...formData, customerId });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!quote) return;

        if (!formData.customerId) {
            showToast.error('Please select a customer');
            return;
        }

        if (lines.some(line => !line.description.trim())) {
            showToast.error('Please add descriptions for all line items');
            return;
        }

        const { subTotal, taxAmount, total } = calculateTotal(lines);

        try {
            setLoading(true);
            await updateQuote(quote.id, {
                customerId: formData.customerId,
                opportunityId: formData.opportunityId || undefined,
                validUntil: formData.validUntil,
                discountAmount: formData.discountAmount,
                shippingCost: formData.shippingCost,
                termsAndConditions: formData.termsAndConditions,
                notes: formData.notes,
                subTotal,
                taxAmount,
                totalAmount: total,
                quoteLines: lines.map(line => ({
                    id: line.id.startsWith('temp-') ? undefined : line.id,
                    description: line.description,
                    quantity: line.quantity,
                    unitPrice: line.unitPrice,
                    discount: line.discount,
                    taxRate: line.taxRate,
                    totalPrice: line.totalPrice,
                    notes: '',
                })),
            });
            showToast.success('Quote updated successfully');
            onSuccess();
        } catch (error: any) {
            console.error('Error updating quote:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to update quote';
            showToast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !quote) return null;

    const { subTotal, taxAmount, total } = calculateTotal(lines);
    const isLoading = loading || loadingData || loadingOptions;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl"
                    >
                        {/* Header */}
                        <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="bg-white/20 rounded-lg p-2">
                                    <FileText className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-white">
                                        Edit Quote
                                    </h2>
                                    <p className="text-sm text-indigo-200">
                                        {quote.quoteNumber}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5 text-white" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="overflow-y-auto p-6 max-h-[calc(90vh-140px)]">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
                                    <span className="ml-3 text-gray-600">Loading quote data...</span>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Customer Information */}
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                                            <User className="h-4 w-4 mr-2" />
                                            Customer Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="customerId" className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-gray-500" />
                                                    Customer *
                                                </Label>
                                                <Select
                                                    value={formData.customerId}
                                                    onValueChange={handleCustomerChange}
                                                >
                                                    <SelectTrigger className="mt-1 bg-white">
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
                                                <Label htmlFor="opportunityId" className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-gray-500" />
                                                    Opportunity
                                                </Label>
                                                <Select
                                                    value={formData.opportunityId || ''}
                                                    onValueChange={(value) => setFormData({ ...formData, opportunityId: value })}
                                                >
                                                    <SelectTrigger className="mt-1 bg-white">
                                                        <SelectValue placeholder="Select opportunity" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">None</SelectItem>
                                                        {opportunities.map((opp) => (
                                                            <SelectItem key={opp.id} value={opp.id}>
                                                                {opp.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quote Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="validUntil" className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-500" />
                                                Valid Until *
                                            </Label>
                                            <Input
                                                id="validUntil"
                                                type="date"
                                                value={formData.validUntil}
                                                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                                                className="mt-1 bg-white"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Quote Lines */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <Label className="flex items-center gap-2">
                                                <Package className="h-4 w-4 text-gray-500" />
                                                Line Items
                                            </Label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addLine}
                                                className="flex items-center gap-1 border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Add Line
                                            </Button>
                                        </div>

                                        <div className="space-y-2">
                                            {lines.map((line) => (
                                                <div key={line.id} className="grid grid-cols-12 gap-2 p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-200 transition-colors">
                                                    <div className="col-span-12 md:col-span-4">
                                                        <Input
                                                            placeholder="Description *"
                                                            value={line.description}
                                                            onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                                                            className="text-sm"
                                                        />
                                                    </div>
                                                    <div className="col-span-3 md:col-span-1">
                                                        <Input
                                                            type="number"
                                                            placeholder="Qty"
                                                            value={line.quantity}
                                                            onChange={(e) => updateLine(line.id, 'quantity', e.target.value)}
                                                            min={1}
                                                            className="text-sm text-right"
                                                        />
                                                    </div>
                                                    <div className="col-span-4 md:col-span-2">
                                                        <Input
                                                            type="number"
                                                            placeholder="Unit Price"
                                                            value={line.unitPrice}
                                                            onChange={(e) => updateLine(line.id, 'unitPrice', e.target.value)}
                                                            min={0}
                                                            step={0.01}
                                                            className="text-sm text-right"
                                                        />
                                                    </div>
                                                    <div className="col-span-2 md:col-span-1">
                                                        <Input
                                                            type="number"
                                                            placeholder="Disc %"
                                                            value={line.discount}
                                                            onChange={(e) => updateLine(line.id, 'discount', e.target.value)}
                                                            min={0}
                                                            max={100}
                                                            className="text-sm text-right"
                                                        />
                                                    </div>
                                                    <div className="col-span-2 md:col-span-2">
                                                        <Input
                                                            type="number"
                                                            placeholder="Tax %"
                                                            value={line.taxRate}
                                                            onChange={(e) => updateLine(line.id, 'taxRate', e.target.value)}
                                                            min={0}
                                                            max={100}
                                                            className="text-sm text-right"
                                                        />
                                                    </div>
                                                    <div className="col-span-2 md:col-span-1 font-medium text-right text-indigo-600 flex items-center justify-end">
                                                        ${line.totalPrice.toFixed(2)}
                                                    </div>
                                                    <div className="col-span-1 flex items-center justify-end">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeLine(line.id)}
                                                            disabled={lines.length === 1}
                                                            className="text-gray-400 hover:text-red-500 h-8 w-8"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Totals */}
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-200">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Subtotal</span>
                                            <span className="font-medium">${subTotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Tax (10%)</span>
                                            <span className="font-medium">${taxAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">Discount</span>
                                            <div className="w-32">
                                                <Input
                                                    id="discountAmount"
                                                    type="number"
                                                    value={formData.discountAmount}
                                                    onChange={(e) => setFormData({ ...formData, discountAmount: parseFloat(e.target.value) || 0 })}
                                                    min={0}
                                                    step={0.01}
                                                    className="text-right text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">Shipping</span>
                                            <div className="w-32">
                                                <Input
                                                    id="shippingCost"
                                                    type="number"
                                                    value={formData.shippingCost}
                                                    onChange={(e) => setFormData({ ...formData, shippingCost: parseFloat(e.target.value) || 0 })}
                                                    min={0}
                                                    step={0.01}
                                                    className="text-right text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-between border-t pt-2 font-bold text-lg">
                                            <span>Total</span>
                                            <span className="text-indigo-600">${total.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <Label htmlFor="notes" className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-gray-500" />
                                            Notes
                                        </Label>
                                        <Textarea
                                            id="notes"
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            placeholder="Additional notes..."
                                            className="mt-1 bg-white"
                                            rows={2}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="termsAndConditions" className="flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4 text-gray-500" />
                                            Terms & Conditions
                                        </Label>
                                        <Textarea
                                            id="termsAndConditions"
                                            value={formData.termsAndConditions}
                                            onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                                            placeholder="Terms and conditions..."
                                            className="mt-1 bg-white"
                                            rows={3}
                                        />
                                    </div>

                                    {/* Footer */}
                                    <div className="sticky bottom-0 bg-gray-50 -mx-6 px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
                                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4 mr-2" />
                                                    Update Quote
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default EditQuotationModal;