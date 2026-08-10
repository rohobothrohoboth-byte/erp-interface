import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Calendar,
    DollarSign,
    Building2,
    User,
    FileText,
    Loader2,
    Banknote,
    CreditCard,
    CheckCircle,
    AlertCircle,
    Clock,
    Receipt,
    Send,
    X,
    Plus,
    Trash2,
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
import { Badge } from '@/shared/components/ui/badge';
import { showToast } from '@/shared/layout/layout';
import { useAuthStore } from '@/shared/stores/auth.store';
import {
    getInvoices,
    getInvoiceById,
    updateInvoiceStatus
} from '@/modules/procurement/services/invoice.api';

import { searchInvoices } from '@/modules/procurement/services/invoice.api';
import type {

    Invoice
} from '@/modules/procurement/services/invoice.api';

// ============================================================
// TYPES
// ============================================================

interface PaymentFormData {
    invoiceId: string;
    paymentMethod: 'bank_transfer' | 'cheque' | 'credit_card' | 'cash';
    paymentReference: string;
    paymentDate: string;
    amount: number;
    notes: string;
    attachment?: File;
}

// ============================================================
// PAYMENT METHODS
// ============================================================

const PAYMENT_METHODS = [
    { value: 'bank_transfer', label: '🏦 Bank Transfer', icon: <Banknote className="w-4 h-4" /> },
    { value: 'cheque', label: '📄 Cheque', icon: <FileText className="w-4 h-4" /> },
    { value: 'credit_card', label: '💳 Credit Card', icon: <CreditCard className="w-4 h-4" /> },
    { value: 'cash', label: '💰 Cash', icon: <DollarSign className="w-4 h-4" /> },
];

// ============================================================
// MAIN COMPONENT
// ============================================================

const MakePayment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { userId, userName } = useAuthStore();
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Get invoice ID from query params
    const queryParams = new URLSearchParams(location.search);
    const invoiceIdFromQuery = queryParams.get('invoiceId');

    // State
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searching, setSearching] = useState(false);
    const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
    const [searchResults, setSearchResults] = useState<Invoice[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState<PaymentFormData>({
        invoiceId: invoiceIdFromQuery || '',
        paymentMethod: 'bank_transfer',
        paymentReference: '',
        paymentDate: new Date().toISOString().split('T')[0],
        amount: 0,
        notes: ''
    });
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [showErrors, setShowErrors] = useState(false);

    // Load all invoices on mount
    useEffect(() => {
        const loadInvoices = async () => {
            try {
                const data = await getInvoices();
                setAllInvoices(data);
                console.log('✅ Loaded all invoices:', data.length);
            } catch (error) {
                console.error('Error loading invoices:', error);
            }
        };
        loadInvoices();
    }, []);

    // Search invoices with debounce
    const searchInvoices = useCallback(async (term: string) => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (!term || term.length < 2) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        setSearching(true);

        searchTimeoutRef.current = setTimeout(async () => {
            try {
                // ✅ Use the new search API endpoint
                const results = await searchInvoices({
                    searchTerm: term,
                    status: 'Approved' // Only search approved invoices
                });

                console.log(`🔍 Search results for "${term}": ${results.length} found`);
                setSearchResults(results);
                setShowSearchResults(results.length > 0);
            } catch (error) {
                console.error('Error searching invoices:', error);
                setSearchResults([]);
                setShowSearchResults(false);
            } finally {
                setSearching(false);
            }
        }, 300);
    }, []);

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);
        searchInvoices(term);
    };

    // Select invoice from search results
    const selectInvoice = (selectedInvoice: Invoice) => {
        setInvoice(selectedInvoice);
        setFormData(prev => ({
            ...prev,
            invoiceId: selectedInvoice.id,
            amount: selectedInvoice.totalAmount
        }));
        setSearchTerm(selectedInvoice.invoiceNumber);
        setShowSearchResults(false);
        setSearchResults([]);
        showToast.success(`Selected: ${selectedInvoice.invoiceNumber}`);
    };

    // Clear selected invoice
    const clearInvoiceSelection = () => {
        setInvoice(null);
        setFormData(prev => ({
            ...prev,
            invoiceId: '',
            amount: 0
        }));
        setSearchTerm('');
        setShowSearchResults(false);
        setSearchResults([]);
    };

    // Fetch invoice by ID (if provided from query params)
    const fetchInvoiceById = useCallback(async (id: string) => {
        if (!id) return;

        setLoading(true);
        try {
            const data = await getInvoiceById(id);
            if (data.status !== 'Approved') {
                showToast.error('Only approved invoices can be paid');
                navigate('/procurement/payment');
                return;
            }
            setInvoice(data);
            setFormData(prev => ({
                ...prev,
                invoiceId: data.id,
                amount: data.totalAmount
            }));
            setSearchTerm(data.invoiceNumber);
            console.log('✅ Invoice loaded for payment:', data);
        } catch (error: any) {
            console.error('Error fetching invoice:', error);
            showToast.error(error?.response?.data?.message || 'Failed to load invoice');
            navigate('/procurement/payment');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        if (invoiceIdFromQuery) {
            fetchInvoiceById(invoiceIdFromQuery);
        } else {
            setLoading(false);
        }
    }, [invoiceIdFromQuery, fetchInvoiceById]);

    // Validate form
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.invoiceId) {
            errors.invoiceId = 'Please select an invoice';
        }
        if (!formData.paymentMethod) {
            errors.paymentMethod = 'Payment method is required';
        }
        if (!formData.paymentDate) {
            errors.paymentDate = 'Payment date is required';
        }
        if (!formData.paymentReference?.trim()) {
            errors.paymentReference = 'Payment reference is required';
        }
        if (formData.amount <= 0) {
            errors.amount = 'Amount must be greater than 0';
        }

        setValidationErrors(errors);
        setShowErrors(true);
        return Object.keys(errors).length === 0;
    };

    // Submit payment
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            const firstError = Object.values(validationErrors)[0];
            if (firstError) showToast.error(firstError);
            return;
        }

        if (!invoice) {
            showToast.error('Invoice not found');
            return;
        }

        setSubmitting(true);
        try {
            await updateInvoiceStatus({
                id: invoice.id,
                status: 'Paid'
            });

            showToast.success(`Payment of ${formatCurrency(formData.amount)} processed successfully for ${invoice.invoiceNumber}`);
            navigate('/procurement/payment');
        } catch (error: any) {
            console.error('Error processing payment:', error);
            showToast.error(error?.response?.data?.message || 'Failed to process payment');
        } finally {
            setSubmitting(false);
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

    const getError = (field: string) => {
        return showErrors ? validationErrors[field] || '' : '';
    };

    const hasError = (field: string) => {
        return showErrors && !!validationErrors[field];
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading invoice details...</p>
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
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/procurement/invoice/payment')}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Make Payment</h1>
                    <p className="text-sm text-gray-500">Process vendor invoice payment</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Payment Form */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Banknote className="w-5 h-5 text-emerald-600" />
                                Payment Details
                            </h3>

                            <div className="space-y-4">
                                {/* Invoice Selection with Search */}
                                <div>
                                    <Label>Search Invoice *</Label>
                                    <div className="relative">
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                <Input
                                                    placeholder="Search by Invoice #, PO #, Vendor Name..."
                                                    value={searchTerm}
                                                    onChange={handleSearchChange}
                                                    onFocus={() => {
                                                        if (searchResults.length > 0) {
                                                            setShowSearchResults(true);
                                                        }
                                                    }}
                                                    className={`pl-10 ${hasError('invoiceId') ? 'border-red-500' : ''}`}
                                                    disabled={submitting || !!invoiceIdFromQuery}
                                                />
                                            </div>
                                            {invoice && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={clearInvoiceSelection}
                                                    disabled={submitting}
                                                    className="text-red-500"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>

                                        {/* Search Results Dropdown */}
                                        {showSearchResults && searchResults.length > 0 && !invoice && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                {searching ? (
                                                    <div className="p-4 text-center text-gray-500">
                                                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                                        <p className="text-sm mt-1">Searching...</p>
                                                    </div>
                                                ) : (
                                                    searchResults.map((result) => (
                                                        <div
                                                            key={result.id}
                                                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
                                                            onClick={() => selectInvoice(result)}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <p className="font-medium text-gray-900">
                                                                        {result.invoiceNumber}
                                                                    </p>
                                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                                        <span>PO: {result.purchaseOrderNumber || 'N/A'}</span>
                                                                        <span>•</span>
                                                                        <span className="flex items-center gap-1">
                                                                            <Building2 className="w-3 h-3" />
                                                                            {result.vendorName || 'Unknown Vendor'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="font-medium text-emerald-600">
                                                                        {formatCurrency(result.totalAmount)}
                                                                    </p>
                                                                    <Badge className="bg-green-100 text-green-700 text-xs">
                                                                        Approved
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}

                                        {searchResults.length === 0 && searchTerm.length >= 2 && !invoice && !searching && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                                                <p className="text-center text-gray-500 text-sm">
                                                    No approved invoices found matching "{searchTerm}"
                                                </p>
                                                <p className="text-center text-xs text-gray-400 mt-1">
                                                    Try searching by Invoice #, PO #, or Vendor Name
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {getError('invoiceId') && (
                                        <p className="text-xs text-red-500 mt-1">{getError('invoiceId')}</p>
                                    )}

                                    {invoice && (
                                        <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-green-800">{invoice.invoiceNumber}</p>
                                                    <p className="text-sm text-green-600">
                                                        {invoice.vendorName || 'Unknown Vendor'} • PO: {invoice.purchaseOrderNumber || 'N/A'}
                                                    </p>
                                                    <p className="text-xs text-green-500 mt-1">
                                                        Invoice Date: {formatDate(invoice.invoiceDate)} • Due: {formatDate(invoice.dueDate)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-emerald-600">
                                                        {formatCurrency(invoice.totalAmount)}
                                                    </p>
                                                    <Badge className="bg-green-100 text-green-700">
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Approved
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Payment Method */}
                                <div>
                                    <Label>Payment Method *</Label>
                                    <Select
                                        value={formData.paymentMethod}
                                        onValueChange={(value: any) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
                                        disabled={submitting}
                                    >
                                        <SelectTrigger className={hasError('paymentMethod') ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select payment method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PAYMENT_METHODS.map((method) => (
                                                <SelectItem key={method.value} value={method.value}>
                                                    <span className="flex items-center gap-2">
                                                        {method.icon}
                                                        {method.label}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {getError('paymentMethod') && (
                                        <p className="text-xs text-red-500 mt-1">{getError('paymentMethod')}</p>
                                    )}
                                </div>

                                {/* Payment Reference */}
                                <div>
                                    <Label>Payment Reference *</Label>
                                    <Input
                                        placeholder="Enter payment reference (e.g., transaction ID, cheque number)"
                                        value={formData.paymentReference}
                                        onChange={(e) => setFormData(prev => ({ ...prev, paymentReference: e.target.value }))}
                                        className={hasError('paymentReference') ? 'border-red-500' : ''}
                                        disabled={submitting}
                                    />
                                    {getError('paymentReference') && (
                                        <p className="text-xs text-red-500 mt-1">{getError('paymentReference')}</p>
                                    )}
                                </div>

                                {/* Payment Date */}
                                <div>
                                    <Label>Payment Date *</Label>
                                    <Input
                                        type="date"
                                        value={formData.paymentDate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
                                        className={hasError('paymentDate') ? 'border-red-500' : ''}
                                        disabled={submitting}
                                    />
                                    {getError('paymentDate') && (
                                        <p className="text-xs text-red-500 mt-1">{getError('paymentDate')}</p>
                                    )}
                                </div>

                                {/* Amount */}
                                <div>
                                    <Label>Amount *</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            placeholder="0.00"
                                            value={formData.amount || ''}
                                            onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                                            className={`pl-9 ${hasError('amount') ? 'border-red-500' : ''}`}
                                            disabled={submitting}
                                        />
                                    </div>
                                    {getError('amount') && (
                                        <p className="text-xs text-red-500 mt-1">{getError('amount')}</p>
                                    )}
                                    {invoice && (
                                        <p className="text-xs text-gray-400 mt-1">
                                            Invoice total: {formatCurrency(invoice.totalAmount)}
                                        </p>
                                    )}
                                </div>

                                {/* Notes */}
                                <div>
                                    <Label>Notes</Label>
                                    <textarea
                                        rows={3}
                                        placeholder="Additional payment notes..."
                                        value={formData.notes}
                                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                        disabled={submitting}
                                    />
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
                                    onClick={handleSubmit}
                                    disabled={submitting || !invoice}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            Process Payment
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => navigate('/procurement/payment')}
                                    disabled={submitting}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Invoice Summary */}
                    {invoice && (
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Receipt className="w-5 h-5 text-emerald-600" />
                                    Invoice Summary
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Invoice</span>
                                        <span className="font-medium">{invoice.invoiceNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Vendor</span>
                                        <span className="font-medium">{invoice.vendorName || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">PO Number</span>
                                        <span className="font-medium">{invoice.purchaseOrderNumber || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Invoice Date</span>
                                        <span className="font-medium">{formatDate(invoice.invoiceDate)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Due Date</span>
                                        <span className="font-medium">{formatDate(invoice.dueDate)}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-gray-200">
                                        <span className="text-gray-500 font-medium">Total Amount</span>
                                        <span className="font-bold text-emerald-600">{formatCurrency(invoice.totalAmount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Status</span>
                                        <Badge className="bg-green-100 text-green-700">Approved</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Payment Method Info */}
                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-blue-800">Payment Information</p>
                                    <ul className="text-xs text-blue-700 mt-1 space-y-1">
                                        <li>• Payment will be recorded in the system</li>
                                        <li>• Invoice status will be updated to "Paid"</li>
                                        <li>• Payment reference is required for tracking</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </motion.div>
    );
};

export default MakePayment;