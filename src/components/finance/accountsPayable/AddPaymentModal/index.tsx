// src/components/finance/accountsPayable/AddPaymentModal/index.tsx

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../ui/dialog';
import type{ AddPaymentModalProps } from './types';
import { PaymentHeader } from './components/PaymentHeader';
import { PaymentTabs } from './components/PaymentTabs';
import { PaymentDetailsTab } from './components/PaymentDetailsTab';
import { PaymentInvoicesTab } from './components/PaymentInvoicesTab';
import { PaymentSignatureTab } from './components/PaymentSignatureTab';
import { usePaymentForm } from './hooks/usePaymentForm';
import { usePaymentData } from './hooks/usePaymentData';
import { useVoucherGenerator } from './hooks/useVoucherGenerator';
import { formatCurrency, formatDate, calculateTotal, isOverpaying } from './utils/paymentHelpers';
import { showToast } from '../../../../layout/layout';

import {
    getFinancialPeriods,
    getAllFinancialPeriods
} from '../../../../services/finance/finance.api';
// ✅ Helper to determine if period is currently active based on dates
const isPeriodCurrentlyActive = (period: any) => {
    if (period.isActive) return true;
    if (period.startDate && period.endDate) {
        const now = new Date();
        const start = new Date(period.startDate);
        const end = new Date(period.endDate);
        return now >= start && now <= end;
    }
    return false;
};

// ✅ Helper to get period status
const getPeriodStatus = (period: any) => {
    if (!period) return { status: 'unknown', label: 'Unknown', icon: '❓', color: 'text-gray-500' };

    if (period.isClosed) {
        return { status: 'closed', label: 'Closed', icon: '🔒', color: 'text-red-500' };
    }

    if (period.isActive || isPeriodCurrentlyActive(period)) {
        return { status: 'active', label: 'Active', icon: '✅', color: 'text-green-500' };
    }

    if (period.startDate && period.endDate) {
        const now = new Date();
        const start = new Date(period.startDate);
        const end = new Date(period.endDate);

        if (now < start) {
            return { status: 'future', label: 'Future', icon: '📅', color: 'text-amber-500' };
        }
        if (now > end) {
            return { status: 'expired', label: 'Expired', icon: '⏰', color: 'text-orange-500' };
        }
    }

    return { status: 'inactive', label: 'Inactive', icon: '⏳', color: 'text-gray-500' };
};

export default function AddPaymentModal({
                                            isOpen,
                                            onClose,
                                            onSubmit,
                                            availableInvoices: propAvailableInvoices = [],
                                            vendors: propVendors = [],
                                            periods: propPeriods = [],
                                            selectedPeriodId: propSelectedPeriodId = ''
                                        }: AddPaymentModalProps) {
    // ✅ Period state
    const [periods, setPeriods] = useState<any[]>([]);
    const [loadingPeriods, setLoadingPeriods] = useState(false);

    // Hooks
    const {
        formData,
        updateField,
        addInvoiceToPay,
        removeInvoiceToPay,
        resetForm,
        activeTab,
        setActiveTab,
    } = usePaymentForm(propSelectedPeriodId);

    const {
        bankAccounts,
        availableInvoices,
        vendorsWithInvoices,
        loadingBankAccounts,
        loadingInvoices,
        loadingVendors,
        fetchBankAccounts,
        fetchVendors,
        setAvailableInvoices,
    } = usePaymentData(
        formData.periodId,
        formData.vendorId,
        propVendors, // ✅ Pass propVendors here
        propAvailableInvoices, // ✅ Pass propAvailableInvoices here
        {} // ✅ vendorMap
    );

    const { generatePDF, generateVoucherHTML } = useVoucherGenerator();

    // Local state
    const [selectedInvoice, setSelectedInvoice] = useState('');
    const [amountToPay, setAmountToPay] = useState('');
    const [invoiceSummary, setInvoiceSummary] = useState<any>(null);

    // ✅ Fetch periods
    const fetchPeriods = async () => {
        // If periods are provided as props, use them
        if (propPeriods && propPeriods.length > 0) {
            console.log('📅 Using periods from props:', propPeriods.length);
            setPeriods(propPeriods);
            setLoadingPeriods(false);
            const active = propPeriods.find((p: any) => p.isActive || isPeriodCurrentlyActive(p));
            if (active && !formData.periodId) {
                updateField('periodId', active.id);
            }
            return;
        }

        // Otherwise fetch from API
        try {
            setLoadingPeriods(true);
            console.log('📡 Fetching periods from API...');

            // Try getAllFinancialPeriods first
            let response;
            try {
                response = await getAllFinancialPeriods({ isClosed: false });
            } catch (error) {
                console.log('📡 Falling back to getFinancialPeriods...');
                response = await getFinancialPeriods({ status: 'All' });
            }

            console.log('📡 API Response:', response);
            console.log('📡 Response data structure:', response?.data);

            // ✅ IMPROVED DATA EXTRACTION
            let data = [];
            if (response?.data) {
                // Try different data structures
                if (Array.isArray(response.data)) {
                    data = response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    data = response.data.data;
                } else if (response.data.$values && Array.isArray(response.data.$values)) {
                    data = response.data.$values;
                } else if (response.data.items && Array.isArray(response.data.items)) {
                    data = response.data.items;
                } else if (response.data.results && Array.isArray(response.data.results)) {
                    data = response.data.results;
                } else if (response.data.list && Array.isArray(response.data.list)) {
                    data = response.data.list;
                } else if (response.data.periods && Array.isArray(response.data.periods)) {
                    data = response.data.periods;
                } else {
                    // ✅ Try to find any array in the response
                    const keys = Object.keys(response.data);
                    for (const key of keys) {
                        if (Array.isArray(response.data[key]) && response.data[key].length > 0) {
                            console.log(`📡 Found array in response.data.${key}:`, response.data[key].length);
                            data = response.data[key];
                            break;
                        }
                    }

                    // ✅ If still no data, check if response.data itself might be the array
                    if (data.length === 0 && response.data.length !== undefined) {
                        data = response.data;
                    }
                }
            }

            console.log('📅 Periods fetched:', data.length, data);
            setPeriods(data);

            // Auto-select active period
            const active = data.find((p: any) => p.isActive || isPeriodCurrentlyActive(p));
            if (active && !formData.periodId) {
                console.log('📅 Auto-selected period:', active.name);
                updateField('periodId', active.id);
            } else if (data.length > 0 && !formData.periodId) {
                console.log('📅 No active period, selecting first:', data[0].name);
                updateField('periodId', data[0].id);
            }
        } catch (error) {
            console.error('❌ Error fetching financial periods:', error);
            showToast.error('Failed to load financial periods');
        } finally {
            setLoadingPeriods(false);
        }
    };

    // ✅ Initialize data when modal opens
    useEffect(() => {
        if (isOpen) {
            console.log('🔓 AddPaymentModal opened');
            fetchPeriods();
            fetchBankAccounts();
            fetchVendors();
        }
    }, [isOpen]);

    // ✅ Update formData.periodId when prop changes
    useEffect(() => {
        if (propSelectedPeriodId && !formData.periodId) {
            updateField('periodId', propSelectedPeriodId);
        }
    }, [propSelectedPeriodId]);

    // ✅ Build vendor map from props
    useEffect(() => {
        if (propVendors.length > 0) {
            fetchVendors();
        }
    }, [propVendors]);

    // ✅ Use available invoices from props when vendor changes
    useEffect(() => {
        if (formData.vendorId && propAvailableInvoices.length > 0) {
            const vendorInvoices = propAvailableInvoices.filter(
                (inv: any) => String(inv.vendor_id || inv.vendorId) === String(formData.vendorId)
            );
            if (vendorInvoices.length > 0) {
                setAvailableInvoices(vendorInvoices);
            }
        }
    }, [formData.vendorId, propAvailableInvoices]);

    // ✅ Update invoice summary
    useEffect(() => {
        if (availableInvoices.length > 0) {
            const totalAmount = availableInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
            const alreadyPaid = availableInvoices.reduce((sum, inv) => sum + inv.paid_amount, 0);
            const remainingFromDb = availableInvoices.reduce((sum, inv) => sum + inv.remaining_amount, 0);
            const currentPaymentAmount = formData.invoicesToPay.reduce((sum, inv) => sum + inv.amount_paid, 0);
            const newTotalPaid = alreadyPaid + currentPaymentAmount;
            const newRemaining = totalAmount - newTotalPaid;

            setInvoiceSummary({
                totalAmount,
                paidAmount: alreadyPaid,
                remainingAmount: remainingFromDb,
                currentPaymentAmount,
                newTotalPaid,
                newRemaining
            });
        } else {
            setInvoiceSummary(null);
        }
    }, [availableInvoices, formData.invoicesToPay]);

    // Handlers
    const handleAddInvoice = () => {
        if (!selectedInvoice || !amountToPay) {
            showToast.error('Please select an invoice and enter an amount');
            return;
        }

        const invoice = availableInvoices.find(inv => inv.id === selectedInvoice);
        if (!invoice) return;

        const amount = parseFloat(amountToPay);
        if (isNaN(amount) || amount <= 0) {
            showToast.error('Please enter a valid amount');
            return;
        }

        if (amount > invoice.remaining_amount) {
            showToast.error(`Amount cannot exceed remaining balance of ${formatCurrency(invoice.remaining_amount)}`);
            return;
        }

        if (formData.invoicesToPay.find(inv => inv.invoice_id === invoice.id)) {
            showToast.error('This invoice is already selected');
            return;
        }

        addInvoiceToPay({
            invoice_id: invoice.id,
            invoice_no: invoice.invoice_no,
            amount_paid: amount,
            periodId: formData.periodId,
        });

        setAvailableInvoices(availableInvoices.map(inv =>
            inv.id === invoice.id
                ? { ...inv, remaining_amount: inv.remaining_amount - amount }
                : inv
        ));

        setSelectedInvoice('');
        setAmountToPay('');
        showToast.success(`Added ${formatCurrency(amount)} to ${invoice.invoice_no}`);
    };

    const handleRemoveInvoice = (invoiceId: string) => {
        const removedInvoice = formData.invoicesToPay.find(inv => inv.invoice_id === invoiceId);
        if (removedInvoice) {
            setAvailableInvoices(availableInvoices.map(inv =>
                inv.id === invoiceId
                    ? { ...inv, remaining_amount: inv.remaining_amount + removedInvoice.amount_paid }
                    : inv
            ));
        }
        removeInvoiceToPay(invoiceId);
    };

    const handlePrintAndSave = async () => {
        const totalAmount = calculateTotal(formData.invoicesToPay);
        const vendor = vendorsWithInvoices.find(v => v.id === formData.vendorId);
        const vendorName = vendor?.name || 'Unknown Vendor';

        try {
            showToast.info('Generating payment voucher...');

            const htmlContent = generateVoucherHTML({
                ...formData,
                vendorName,
                vendorsWithInvoices,
                bankAccounts,
                periods,
                totalAmount,
            }, formatCurrency, formatDate);

            const pdfBlob = await generatePDF(htmlContent);

            onSubmit({
                external_bank_ref: formData.externalBankRef,
                vendor_id: formData.vendorId,
                payment_date: formData.paymentDate,
                payment_method: formData.paymentMethod,
                bank_account_id: formData.paymentMethod === 'Cash' ? 'cash-account' : formData.bankAccountId,
                invoices_to_pay: formData.invoicesToPay,
                total_amount: totalAmount,
                attachment_url: '',
                description: formData.description || `Payment to ${vendorName}`,
                require_signature: formData.requireSignature,
                receiver_name: formData.receiverName,
                authorized_by: formData.authorizedBy,
                _pdfBlob: pdfBlob,
                _pdfFileName: `payment-voucher-${formData.externalBankRef}.pdf`,
                periodId: formData.periodId,
            });

            const pdfUrl = URL.createObjectURL(pdfBlob);
            const printWindow = window.open(pdfUrl, '_blank');
            if (printWindow) {
                printWindow.focus();
            }

            showToast.success('Payment voucher generated');
            resetForm();
            onClose();
        } catch (error: any) {
            console.error('Error generating voucher:', error);
            showToast.error(error.message || 'Failed to generate payment voucher');
        }
    };

    // Computed values
    const totalAmount = calculateTotal(formData.invoicesToPay);
    const selectedAccount = bankAccounts.find(a => a.id === formData.bankAccountId);
    const isCashPayment = formData.paymentMethod === 'Cash';
    const isOverpayingCheck = isOverpaying(formData.invoicesToPay, invoiceSummary);
    const selectedPeriod = periods.find(p => p.id === formData.periodId);
    const isPeriodClosed = selectedPeriod?.isClosed || false;
    const periodStatus = selectedPeriod ? getPeriodStatus(selectedPeriod) : null;

    console.log('📊 Current state:', {
        periodsCount: periods.length,
        selectedPeriodId: formData.periodId,
        selectedPeriod: selectedPeriod?.name,
        vendorsCount: vendorsWithInvoices.length,
        invoicesCount: availableInvoices.length,
    });

    const isSubmitDisabled = () => {
        if (isPeriodClosed) return true;
        if (isOverpayingCheck) return true;
        if (formData.invoicesToPay.length === 0) return true;
        if (!formData.vendorId) return true;
        if (!formData.periodId) return true;
        if (!isCashPayment && !formData.bankAccountId) return true;
        if (!isCashPayment && bankAccounts.length === 0) return true;
        if (!isCashPayment && selectedAccount && totalAmount > selectedAccount.currentBalance) return true;
        if (formData.requireSignature && (!formData.receiverName.trim() || !formData.authorizedBy.trim())) return true;
        return false;
    };

    const canProceedToInvoices = !!formData.vendorId && !!formData.periodId && !isPeriodClosed;
    const canProceedToSignature = formData.vendorId && formData.invoicesToPay.length > 0;

    // ✅ If no periods, show loading
    if (loadingPeriods) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
                    <div className="flex items-center justify-center min-h-[300px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        <p className="ml-4 text-gray-500">Loading periods...</p>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
                <DialogHeader className="sr-only">
                    <DialogTitle>Add Payment</DialogTitle>
                    <DialogDescription>Create a vendor payment transaction</DialogDescription>
                </DialogHeader>

                {/* Header */}
                <PaymentHeader paymentMethod={formData.paymentMethod} isCashPayment={isCashPayment} />

                {/* Tabs */}
                <PaymentTabs
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    selectedVendor={formData.vendorId}
                    invoicesToPayCount={formData.invoicesToPay.length}
                    canProceedToInvoices={canProceedToInvoices}
                    canProceedToSignature={canProceedToSignature}
                />

                {/* Content */}
                <form onSubmit={(e) => e.preventDefault()} className="px-6 py-5 space-y-5">
                    {activeTab === 'details' && (
                        <PaymentDetailsTab
                            periods={periods}
                            periodStatus={periodStatus}
                            selectedPeriodId={formData.periodId}
                            onPeriodChange={(value) => updateField('periodId', value)}
                            loadingPeriods={loadingPeriods}
                            vendorsWithInvoices={vendorsWithInvoices}
                            selectedVendor={formData.vendorId}
                            onVendorChange={(value) => updateField('vendorId', value)}
                            loadingVendors={loadingVendors}
                            paymentDate={formData.paymentDate}
                            onPaymentDateChange={(value) => updateField('paymentDate', value)}
                            externalBankRef={formData.externalBankRef}
                            onExternalBankRefChange={(value) => updateField('externalBankRef', value)}
                            paymentMethod={formData.paymentMethod}
                            onPaymentMethodChange={(value) => updateField('paymentMethod', value)}
                            selectedBankAccount={formData.bankAccountId}
                            onBankAccountChange={(value) => updateField('bankAccountId', value)}
                            bankAccounts={bankAccounts}
                            loadingBankAccounts={loadingBankAccounts}
                            description={formData.description}
                            onDescriptionChange={(value) => updateField('description', value)}
                            onNext={() => setActiveTab('invoices')}
                            isNextDisabled={!canProceedToInvoices}
                            selectedPeriod={selectedPeriod}

                        />
                    )}

                    {activeTab === 'invoices' && (
                        <PaymentInvoicesTab
                            selectedVendor={formData.vendorId}
                            vendorsWithInvoices={vendorsWithInvoices}
                            availableInvoices={availableInvoices}
                            selectedInvoice={selectedInvoice}
                            onSelectedInvoiceChange={setSelectedInvoice}
                            amountToPay={amountToPay}
                            onAmountToPayChange={setAmountToPay}
                            onAddInvoice={handleAddInvoice}
                            onRemoveInvoice={handleRemoveInvoice}
                            invoicesToPay={formData.invoicesToPay}
                            invoiceSummary={invoiceSummary}
                            totalAmount={totalAmount}
                            loadingInvoices={loadingInvoices}
                            selectedPeriodId={formData.periodId}
                            periods={periods}
                            bankAccounts={bankAccounts}
                            selectedBankAccount={formData.bankAccountId}
                            isCashPayment={isCashPayment}
                            onBack={() => setActiveTab('details')}
                            onNext={() => setActiveTab('signature')}
                            isNextDisabled={formData.invoicesToPay.length === 0}
                        />
                    )}

                    {activeTab === 'signature' && (
                        <PaymentSignatureTab
                            requireSignature={formData.requireSignature}
                            onRequireSignatureChange={(checked) => updateField('requireSignature', checked)}
                            receiverName={formData.receiverName}
                            onReceiverNameChange={(value) => updateField('receiverName', value)}
                            authorizedBy={formData.authorizedBy}
                            onAuthorizedByChange={(value) => updateField('authorizedBy', value)}
                            vendorsWithInvoices={vendorsWithInvoices}
                            selectedVendor={formData.vendorId}
                            totalAmount={totalAmount}
                            externalBankRef={formData.externalBankRef}
                            paymentMethod={formData.paymentMethod}
                            selectedPeriodId={formData.periodId}
                            periods={periods}
                            invoicesToPay={formData.invoicesToPay}
                            onBack={() => setActiveTab('invoices')}
                            onPrint={handlePrintAndSave}
                            isSubmitDisabled={isSubmitDisabled()}
                        />
                    )}
                </form>
            </DialogContent>
        </Dialog>
    );
}