// src/components/finance/accountsPayable/AddPaymentModal/hooks/usePaymentForm.ts

import { useState, useCallback } from 'react';
import type { InvoiceToPay, PaymentFormData, PaymentMethod } from '@/modules/finance/components/accountsPayable/AddPaymentModal/types';
import { DEFAULT_PAYMENT_METHOD } from '@/modules/finance/components/accountsPayable/AddPaymentModal/constants';

export const usePaymentForm = (initialPeriodId?: string) => {
    const [formData, setFormData] = useState<PaymentFormData>({
        externalBankRef: '',
        vendorId: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: DEFAULT_PAYMENT_METHOD,
        bankAccountId: '',
        description: '',
        periodId: initialPeriodId || '',
        requireSignature: true,
        receiverName: '',
        authorizedBy: '',
        invoicesToPay: [],
    });

    const [activeTab, setActiveTab] = useState<'details' | 'invoices' | 'signature'>('details');

    const updateField = useCallback(<K extends keyof PaymentFormData>(
        field: K,
        value: PaymentFormData[K]
    ) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const addInvoiceToPay = useCallback((invoice: InvoiceToPay) => {
        setFormData(prev => ({
            ...prev,
            invoicesToPay: [...prev.invoicesToPay, invoice]
        }));
    }, []);

    const removeInvoiceToPay = useCallback((invoiceId: string) => {
        setFormData(prev => ({
            ...prev,
            invoicesToPay: prev.invoicesToPay.filter(inv => inv.invoice_id !== invoiceId)
        }));
    }, []);

    const resetForm = useCallback(() => {
        setFormData({
            externalBankRef: '',
            vendorId: '',
            paymentDate: new Date().toISOString().split('T')[0],
            paymentMethod: DEFAULT_PAYMENT_METHOD,
            bankAccountId: '',
            description: '',
            periodId: initialPeriodId || '',
            requireSignature: true,
            receiverName: '',
            authorizedBy: '',
            invoicesToPay: [],
        });
        setActiveTab('details');
    }, [initialPeriodId]);

    const setActiveTabSafe = useCallback((tab: 'details' | 'invoices' | 'signature') => {
        setActiveTab(tab);
    }, []);

    return {
        formData,
        updateField,
        addInvoiceToPay,
        removeInvoiceToPay,
        resetForm,
        activeTab,
        setActiveTab: setActiveTabSafe,
    };
};