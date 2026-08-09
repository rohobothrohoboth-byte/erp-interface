// src/components/finance/accountsPayable/AddPaymentModal/components/PaymentTabs.tsx

import React from 'react';
import { FileText, CreditCard, Signature } from 'lucide-react';

interface PaymentTabsProps {
    activeTab: 'details' | 'invoices' | 'signature';
    onTabChange: (tab: 'details' | 'invoices' | 'signature') => void;
    selectedVendor: string;
    invoicesToPayCount: number;
    canProceedToInvoices: boolean;
    canProceedToSignature: boolean;
}

export const PaymentTabs: React.FC<PaymentTabsProps> = ({
                                                            activeTab,
                                                            onTabChange,
                                                            selectedVendor,
                                                            invoicesToPayCount,
                                                            canProceedToInvoices,
                                                            canProceedToSignature,
                                                        }) => {
    const tabs = [
        {
            id: 'details',
            label: 'Payment Details',
            icon: FileText,
            onClick: () => onTabChange('details'),
        },
        {
            id: 'invoices',
            label: 'Invoices',
            icon: CreditCard,
            badge: invoicesToPayCount,
            onClick: () => {
                if (canProceedToInvoices) {
                    onTabChange('invoices');
                }
            },
            disabled: !selectedVendor,
        },
        {
            id: 'signature',
            label: 'Signature & Print',
            icon: Signature,
            onClick: () => {
                if (canProceedToSignature) {
                    onTabChange('signature');
                }
            },
            disabled: !selectedVendor || invoicesToPayCount === 0,
        },
    ];

    return (
        <div className="flex border-b border-gray-200 bg-gray-50/50 px-6">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={tab.onClick}
                        disabled={tab.disabled}
                        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                            isActive
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        } ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <div className="flex items-center gap-2">
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                            {tab.badge !== undefined && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ml-1 ${
                                    tab.badge > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'
                                }`}>
                  {tab.badge}
                </span>
                            )}
                        </div>
                    </button>
                );
            })}
        </div>
    );
};