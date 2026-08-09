// src/pages/finance/ar/components/InvoiceViewModal.tsx
import React from 'react';
import {
    FileText, Building2, Calendar as CalendarIcon, Send,
    Clock, CheckCircle, AlertCircle, X
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '../../../../components/ui/dialog';
import type{ SalesInvoice } from '../types/invoice.types';
import { formatCurrency, formatDate, getStatusBadge } from '../utils/invoice.utils';
import { InvoiceItemsTable } from './InvoiceItemsTable';
import { InvoiceAttachments } from './InvoiceAttachments';
interface InvoiceViewModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    invoice: SalesInvoice | null;
    attachments: any[];
    loadingAttachments: boolean;
    onPost: () => void;
    onUpload: (files: FileList) => void;
    onDownload: (attachment: any) => Promise<any>;
    onDownloadAndSave: (attachment: any) => Promise<void>;

    uploadingFiles: boolean;
    fileInputRef: React.RefObject<HTMLInputElement>;
}

export const InvoiceViewModal: React.FC<InvoiceViewModalProps> = ({
                                                                      isOpen,
                                                                      onOpenChange,
                                                                      invoice,
                                                                      attachments,
                                                                      loadingAttachments,
                                                                      onPost,
                                                                      onUpload,
                                                                      onDownload,
                                                                      onDownloadAndSave,
                                                                      uploadingFiles,
                                                                      fileInputRef,
                                                                  }) => {
    if (!invoice) return null;
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-indigo-600" />
                        Invoice Details
                    </DialogTitle>
                    <DialogDescription>
                        Complete invoice information and attachments.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">{invoice.invoiceNumber}</h3>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                                <Badge className={getStatusBadge(invoice.status)}>
                                    {invoice.status}
                                </Badge>
                                {invoice.periodName && (
                                    <Badge variant="outline" className="text-xs">
                                        {invoice.periodName}
                                    </Badge>
                                )}
                                <span className="text-sm text-gray-500">
                                    {formatDate(invoice.dateAdd)}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Total Amount</p>
                            <p className="text-2xl font-bold text-indigo-600">
                                {formatCurrency(invoice.totalAmount)}
                            </p>
                        </div>
                    </div>

                    <div className="border-t border-gray-200" />

                    {/* Customer Info */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Building2 size={14} />
                            Customer
                        </p>
                        <p className="font-medium">{invoice.customerName}</p>
                        {invoice.customerId && (
                            <p className="text-xs text-gray-400">ID: {invoice.customerId}</p>
                        )}
                    </div>

                    {/* Period Info */}
                    {invoice.periodName && (
                        <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                            <p className="text-sm text-indigo-700 font-medium flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4" />
                                Financial Period
                            </p>
                            <p className="text-indigo-900 font-semibold">{invoice.periodName}</p>
                            {invoice.periodId && (
                                <p className="text-xs text-indigo-500">ID: {invoice.periodId}</p>
                            )}
                        </div>
                    )}

                    {/* Dates */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Invoice Date</p>
                            <p className="font-medium">{formatDate(invoice.invoiceDate)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Due Date</p>
                            <p className="font-medium">{formatDate(invoice.dueDate)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Balance</p>
                            <p className={`font-bold ${invoice.balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {formatCurrency(invoice.balanceDue)}
                            </p>
                        </div>
                    </div>

                    {/* Amounts */}
                    <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                        <div>
                            <p className="text-sm text-gray-500">Sub Total</p>
                            <p className="text-lg font-bold text-gray-900">{formatCurrency(invoice.subTotal)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Tax Amount</p>
                            <p className="text-lg font-bold text-gray-900">{formatCurrency(invoice.taxAmount)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Amount</p>
                            <p className="text-lg font-bold text-indigo-600">{formatCurrency(invoice.totalAmount)}</p>
                        </div>
                    </div>

                    {/* Items */}
                    {invoice.items && invoice.items.length > 0 && (
                        <InvoiceItemsTable items={invoice.items} totalAmount={invoice.totalAmount} />
                    )}

                    {/* Attachments */}
                    <InvoiceAttachments
                        attachments={attachments}
                        loading={loadingAttachments}
                        onUpload={onUpload}
                        onDownload={onDownload}
                        onDownloadAndSave={onDownloadAndSave}
                        uploadingFiles={uploadingFiles}
                        fileInputRef={fileInputRef}
                    />

                    {/* Notes */}
                    {invoice.notes && (
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Notes</p>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm text-gray-700">{invoice.notes}</p>
                            </div>
                        </div>
                    )}

                    {/* Status Messages */}
                    {invoice.status === 'Posted' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <p className="text-sm text-green-700">This invoice has been posted to General Ledger</p>
                        </div>
                    )}
                    {invoice.status === 'Draft' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-yellow-600" />
                            <p className="text-sm text-yellow-700">This invoice is a draft and needs to be posted</p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {invoice.status === 'Draft' && (
                        <Button
                            onClick={onPost}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <Send className="h-4 w-4 mr-2" />
                            Post Invoice
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};