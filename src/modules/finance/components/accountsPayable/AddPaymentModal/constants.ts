// src/components/finance/accountsPayable/AddPaymentModal/constants.ts

import { Wallet, Banknote, FileText, Phone, CreditCard } from 'lucide-react';

export const PAYMENT_METHODS = {
    CASH: 'Cash',
    BANK_TRANSFER: 'Bank_Transfer',
    CHECK: 'Check',
    TELEBIRR: 'Telebirr',
} as const;

export const PAYMENT_METHOD_ICONS = {
    Cash: Wallet,
    Bank_Transfer: Banknote,
    Check: FileText,
    Telebirr: Phone,
    default: CreditCard,
} as const;

export const PAYMENT_METHOD_COLORS = {
    Cash: 'emerald',
    Bank_Transfer: 'blue',
    Check: 'purple',
    Telebirr: 'orange',
    default: 'gray',
} as const;

export const TABS = {
    DETAILS: 'details',
    INVOICES: 'invoices',
    SIGNATURE: 'signature',
} as const;

export const DEFAULT_PAYMENT_METHOD: PaymentMethod = 'Bank_Transfer';