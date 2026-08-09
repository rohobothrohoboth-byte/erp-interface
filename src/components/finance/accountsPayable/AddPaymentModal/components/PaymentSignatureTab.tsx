// src/components/finance/accountsPayable/AddPaymentModal/components/PaymentSignatureTab.tsx

import React from 'react';
import { ChevronLeft, Printer, Signature } from 'lucide-react';
import { Button } from '../../../../ui/button';
import { Input } from '../../../../ui/input';
import { Label } from '../../../../ui/label';
import { Checkbox } from '../../../../ui/checkbox';
import type{ InvoiceToPay, VendorWithInvoices } from '../types';
import { formatCurrency } from '../utils/paymentHelpers';

interface PaymentSignatureTabProps {
    requireSignature: boolean;
    onRequireSignatureChange: (checked: boolean) => void;
    receiverName: string;
    onReceiverNameChange: (value: string) => void;
    authorizedBy: string;
    onAuthorizedByChange: (value: string) => void;
    vendorsWithInvoices: VendorWithInvoices[];
    selectedVendor: string;
    totalAmount: number;
    externalBankRef: string;
    paymentMethod: string;
    selectedPeriodId: string;
    periods: any[];
    invoicesToPay: InvoiceToPay[];
    onBack: () => void;
    onPrint: () => void;
    isSubmitDisabled: boolean;
}

export const PaymentSignatureTab: React.FC<PaymentSignatureTabProps> = ({
                                                                            requireSignature,
                                                                            onRequireSignatureChange,
                                                                            receiverName,
                                                                            onReceiverNameChange,
                                                                            authorizedBy,
                                                                            onAuthorizedByChange,
                                                                            vendorsWithInvoices,
                                                                            selectedVendor,
                                                                            totalAmount,
                                                                            externalBankRef,
                                                                            paymentMethod,
                                                                            selectedPeriodId,
                                                                            periods,
                                                                            invoicesToPay,
                                                                            onBack,
                                                                            onPrint,
                                                                            isSubmitDisabled,
                                                                        }) => {
    const vendorName = vendorsWithInvoices.find(v => v.id === selectedVendor)?.name || 'N/A';
    const periodName = periods.find(p => p.id === selectedPeriodId)?.name || 'N/A';

    return (
        <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                    <Signature className="h-5 w-5 text-purple-600" />
                    <h3 className="text-sm font-semibold text-purple-900">Signature & Authorization</h3>
                </div>
                <p className="text-xs text-purple-700">
                    This payment will generate a payment voucher with signature fields. The voucher will be saved to file management.
                </p>
            </div>

            {/* Signature checkbox */}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Checkbox
                        checked={requireSignature}
                        onCheckedChange={(checked) => onRequireSignatureChange(checked as boolean)}
                        id="requireSignature"
                    />
                    <Label htmlFor="requireSignature" className="text-sm font-medium text-gray-700">
                        Require Signature
                    </Label>
                </div>
                <p className="text-xs text-gray-400 ml-6">
                    Enable to include signature fields on the payment voucher
                </p>
            </div>

            {/* Signature fields */}
            {requireSignature && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">
                            Receiver Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            value={receiverName}
                            onChange={(e) => onReceiverNameChange(e.target.value)}
                            placeholder="Enter receiver name"
                            className="h-10 bg-white w-full"
                            required={requireSignature}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">
                            Authorized By <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            value={authorizedBy}
                            onChange={(e) => onAuthorizedByChange(e.target.value)}
                            placeholder="Enter authorized person name"
                            className="h-10 bg-white w-full"
                            required={requireSignature}
                        />
                    </div>
                </div>
            )}

            {/* Payment summary preview */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <Printer className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-blue-700">Payment Voucher Preview</p>
                        <p className="text-xs text-blue-600">
                            A payment voucher will be generated with the following details:
                        </p>
                        <ul className="text-xs text-blue-600 mt-1 space-y-0.5 list-disc list-inside">
                            <li>Vendor: {vendorName}</li>
                            <li>Total Amount: {formatCurrency(totalAmount)}</li>
                            <li>Reference: {externalBankRef}</li>
                            <li>Payment Method: {paymentMethod.replace('_', ' ')}</li>
                            <li>Period: {periodName}</li>
                            <li>{invoicesToPay.length} invoice(s) included</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t border-gray-100">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    className="text-gray-600"
                >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back to Invoices
                </Button>
                <Button
                    type="button"
                    onClick={onPrint}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
                    disabled={isSubmitDisabled}
                >
                    <Printer className="h-4 w-4" />
                    Print & Save Payment
                </Button>
            </div>
        </div>
    );
};