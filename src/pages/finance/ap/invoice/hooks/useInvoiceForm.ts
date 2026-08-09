// src/pages/finance/ap/invoice/hooks/useInvoiceForm.ts

import { useState, useCallback } from 'react';
import type{ Invoice, InvoiceFormData, InvoiceItem } from '../types/invoice.types';

const defaultItem = (): InvoiceItem => ({
    description: '',
    quantity: 1,
    unitPrice: 0,
    total: 0,
});

const defaultFormData = (): InvoiceFormData => ({
    invoiceType: 'Purchase',
    vendorId: '',
    customerId: '',
    periodId: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [defaultItem()],
    notes: '',
    status: 'Draft',
    subTotal: 0,
    taxAmount: 0,
    totalAmount: 0,
    paidAmount: 0,
    balanceDue: 0,
    rowVersion: '',
    manualSubTotal: 0,
    salesRep: '',
    deliveryDate: '',
    purchaseOrderId: '',
    receivedDate: '',
});

export const useInvoiceForm = () => {
    const [formData, setFormData] = useState<InvoiceFormData>(defaultFormData());

    const resetForm = useCallback(() => {
        setFormData(defaultFormData());
    }, []);

    const addItem = useCallback(() => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, defaultItem()],
        }));
    }, []);

    const removeItem = useCallback((index: number) => {
        if (formData.items.length > 1) {
            setFormData(prev => ({
                ...prev,
                items: prev.items.filter((_, i) => i !== index),
            }));
        }
    }, [formData.items.length]);

    const updateItem = useCallback((index: number, field: keyof InvoiceItem, value: any) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };

        // Recalculate total if quantity or unitPrice changed
        if (field === 'quantity' || field === 'unitPrice') {
            newItems[index].total = (newItems[index].quantity || 0) * (newItems[index].unitPrice || 0);
        }

        setFormData(prev => {
            const newSubTotal = newItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
            const newTaxAmount = newSubTotal * 0.15;
            const newTotalAmount = newSubTotal + newTaxAmount;

            return {
                ...prev,
                items: newItems,
                subTotal: newSubTotal,
                taxAmount: newTaxAmount,
                totalAmount: newTotalAmount,
            };
        });
    }, [formData.items]);

    const setEditFormData = useCallback((invoice: Invoice) => {
        setFormData({
            invoiceType: invoice.invoiceType || 'Purchase',
            vendorId: invoice.vendorId || '',
            customerId: invoice.customerId || '',
            periodId: invoice.periodId || '',
            invoiceDate: invoice.invoiceDate.split('T')[0],
            dueDate: invoice.dueDate.split('T')[0],
            items: invoice.items || [defaultItem()],
            notes: invoice.notes || '',
            status: invoice.status,
            subTotal: invoice.subTotal || 0,
            taxAmount: invoice.taxAmount || 0,
            totalAmount: invoice.totalAmount || 0,
            paidAmount: invoice.paidAmount || 0,
            balanceDue: invoice.balanceDue || 0,
            rowVersion: invoice.rowVersion || '',
            manualSubTotal: invoice.subTotal || 0,
            salesRep: invoice.salesRep || '',
            deliveryDate: invoice.deliveryDate ? new Date(invoice.deliveryDate).toISOString().split('T')[0] : '',
            purchaseOrderId: invoice.purchaseOrderId || '',
            receivedDate: invoice.receivedDate ? new Date(invoice.receivedDate).toISOString().split('T')[0] : '',
        });
    }, []);

    const validateForm = useCallback((data: InvoiceFormData, periods: any[]) => {
        const errors: string[] = [];

        if (!data.periodId) {
            errors.push('Financial Period is required');
        }

        const selectedPeriod = periods.find(p => p.id === data.periodId);
        if (selectedPeriod?.isClosed) {
            errors.push('Selected period is closed. Cannot create/update invoice.');
        }

        if (data.invoiceType === 'Purchase' && !data.vendorId) {
            errors.push('Vendor is required for Purchase invoices');
        }
        if (data.invoiceType === 'Sales' && !data.customerId) {
            errors.push('Customer is required for Sales invoices');
        }

        if (!data.invoiceDate) {
            errors.push('Invoice Date is required');
        }

        if (selectedPeriod) {
            const invoiceDate = new Date(data.invoiceDate);
            const startDate = new Date(selectedPeriod.startDate);
            const endDate = new Date(selectedPeriod.endDate);
            invoiceDate.setHours(0, 0, 0, 0);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(0, 0, 0, 0);

            if (invoiceDate < startDate || invoiceDate > endDate) {
                errors.push(`Invoice date must be between ${selectedPeriod.startDate.split('T')[0]} and ${selectedPeriod.endDate.split('T')[0]}`);
            }
        }

        for (const item of data.items) {
            if (!item.description || item.quantity <= 0 || item.unitPrice <= 0) {
                errors.push('All items must have description, quantity, and price');
                break;
            }
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    }, []);

    return {
        formData,
        setFormData,
        resetForm,
        addItem,
        removeItem,
        updateItem,
        setEditFormData,
        validateForm,
    };
};