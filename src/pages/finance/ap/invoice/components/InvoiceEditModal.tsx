// src/pages/finance/ap/invoice/components/InvoiceEditModal.tsx

import React from 'react';
import { Save, X, Plus, Trash2, Paperclip, Upload,Download, Loader2 } from 'lucide-react';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import { Textarea } from '../../../../../components/ui/textarea';
import { Badge } from '../../../../../components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../../../components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '../../../../../components/ui/dialog';
import type { InvoiceFormData, InvoiceItem } from '../types/invoice.types';
import { formatCurrency, formatDate, formatFileSize, getFileIcon } from '../utils/invoice.utils';

interface InvoiceEditModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    formData: InvoiceFormData;
    setFormData: (data: InvoiceFormData) => void;
    selectedInvoice: any;
    vendors: any[];
    customers: any[];
    periods: any[];
    attachments: any[];
    uploadingFiles: boolean;
    editFileInputRef: React.RefObject<HTMLInputElement>;
    onAddItem: () => void;
    onRemoveItem: (index: number) => void;
    onUpdateItem: (index: number, field: keyof InvoiceItem, value: any) => void;

    onDeleteAttachment: (id: string) => void;
    onDownloadAttachment: (attachment: any) => void;
    onSubmit: () => void;
    onCancel: () => void;
    getPeriodStatus: (period: any) => { status: string; label: string; icon: string; color: string } | null;
    // ✅ Additional props for purchase orders and sales rep
    purchaseOrders?: any[];
    loadingPurchaseOrders?: boolean;
    onVendorChange?: (vendorId: string) => void;
    onFileUpload: (files: FileList, invoiceId: string) => void;
}

export const InvoiceEditModal: React.FC<InvoiceEditModalProps> = ({
                                                                      isOpen,
                                                                      onOpenChange,
                                                                      formData,
                                                                      setFormData,
                                                                      selectedInvoice,
                                                                      vendors,
                                                                      customers,
                                                                      periods,
                                                                      attachments,
                                                                      uploadingFiles,
                                                                      editFileInputRef,
                                                                      onAddItem,
                                                                      onRemoveItem,
                                                                      onUpdateItem,
                                                                      onFileUpload,
                                                                      onDeleteAttachment,
                                                                      onDownloadAttachment,
                                                                      onSubmit,
                                                                      onCancel,
                                                                      getPeriodStatus,
                                                                      purchaseOrders = [],
                                                                      loadingPurchaseOrders = false,
                                                                      onVendorChange,
                                                                  }) => {
    const selectedPeriod = periods.find(p => p.id === formData.periodId);
    const periodStatus = selectedPeriod ? getPeriodStatus(selectedPeriod) : null;
    const isPeriodClosed = selectedPeriod?.isClosed || false;

    const subTotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = subTotal * 0.15;
    const totalAmount = subTotal + taxAmount;
    const isPurchase = formData.invoiceType === 'Purchase';
    const isSales = formData.invoiceType === 'Sales';

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Save className="h-5 w-5 text-yellow-600" />
                        Edit Invoice
                    </DialogTitle>
                    <DialogDescription>
                        Update invoice details and manage attachments.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Period Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-sm font-medium">
                                Financial Period <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={formData.periodId}
                                onValueChange={(value) => setFormData({ ...formData, periodId: value })}
                                disabled={isPeriodClosed}
                            >
                                <SelectTrigger className={`mt-1 ${periodStatus?.color || ''}`}>
                                    <SelectValue placeholder="Select Period" />
                                </SelectTrigger>
                                <SelectContent>
                                    {periods.map((period) => {
                                        const status = getPeriodStatus(period);
                                        return (
                                            <SelectItem key={period.id} value={period.id}>
                                                <span className="flex items-center gap-2">
                                                    <span>{period.name || period.periodName || 'Period'}</span>
                                                    {period.startDate && period.endDate && (
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                    <span className={`text-xs ${status?.color || ''}`}>
                                                        {status?.icon} {status?.label}
                                                    </span>
                                                </span>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                            {selectedPeriod && periodStatus && (
                                <div className="mt-1 space-y-1">
                                    <p className={`text-xs ${periodStatus.color}`}>
                                        Status: {periodStatus.icon} {periodStatus.label}
                                    </p>
                                    {selectedPeriod.startDate && selectedPeriod.endDate && (
                                        <p className="text-xs text-gray-400">
                                            📅 {new Date(selectedPeriod.startDate).toLocaleDateString()} - {new Date(selectedPeriod.endDate).toLocaleDateString()}
                                        </p>
                                    )}
                                    {isPeriodClosed && (
                                        <p className="text-xs text-red-500 flex items-center gap-1">
                                            ⚠️ This period is closed. Cannot update invoices.
                                        </p>
                                    )}
                                    {!isPeriodClosed && periodStatus?.status === 'inactive' && (
                                        <p className="text-xs text-amber-500 flex items-center gap-1">
                                            ⚠️ This period is not active. Please select an active period.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                        <div>
                            <Label>Invoice Number</Label>
                            <Input value={selectedInvoice?.invoiceNumber || ''} disabled className="bg-gray-50" />
                        </div>
                    </div>

                    {/* Invoice Type and Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Invoice Type *</Label>
                            <Select
                                value={formData.invoiceType}
                                onValueChange={(value: 'Purchase' | 'Sales') => {
                                    setFormData({ ...formData, invoiceType: value, vendorId: '', customerId: '' });
                                }}
                                disabled={isPeriodClosed}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Purchase">Purchase (AP)</SelectItem>
                                    <SelectItem value="Sales">Sales (AR)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                                disabled={isPeriodClosed}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Draft">Draft</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Approved">Approved</SelectItem>
                                    <SelectItem value="Paid">Paid</SelectItem>
                                    <SelectItem value="Partially_Paid">Partially Paid</SelectItem>
                                    <SelectItem value="Rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Party Selection */}
                    <div>
                        <Label>{isPurchase ? 'Vendor *' : 'Customer *'}</Label>
                        {isPurchase ? (
                            <Select
                                value={formData.vendorId}
                                onValueChange={(value) => {
                                    setFormData({ ...formData, vendorId: value });
                                    if (onVendorChange) onVendorChange(value);
                                }}
                                disabled={isPeriodClosed}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select vendor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {vendors.map((vendor) => (
                                        <SelectItem key={vendor.id} value={vendor.id}>
                                            {vendor.name || vendor.vendorName || vendor.displayName || 'Unknown Vendor'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <Select
                                value={formData.customerId}
                                onValueChange={(value) => setFormData({ ...formData, customerId: value })}
                                disabled={isPeriodClosed}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select customer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {customers.map((customer) => (
                                        <SelectItem key={customer.id} value={customer.id}>
                                            {customer.name || customer.customerName || customer.displayName || 'Unknown Customer'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* ✅ Type-specific fields */}
                    {isPurchase && (
                        <div>
                            <Label>Purchase Order</Label>
                            <Select
                                value={formData.purchaseOrderId}
                                onValueChange={(value) => setFormData({ ...formData, purchaseOrderId: value })}
                                disabled={isPeriodClosed || loadingPurchaseOrders || !formData.vendorId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select purchase order" />
                                </SelectTrigger>
                                <SelectContent>
                                    {loadingPurchaseOrders ? (
                                        <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-500">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Loading purchase orders...
                                        </div>
                                    ) : purchaseOrders.length === 0 ? (
                                        <div className="px-2 py-1.5 text-sm text-gray-500 text-center">
                                            {formData.vendorId ? 'No purchase orders found for this vendor' : 'Select a vendor first'}
                                        </div>
                                    ) : (
                                        purchaseOrders.map((po) => (
                                            <SelectItem key={po.id} value={po.id}>
                                                <div className="flex items-center justify-between w-full gap-3">
                                                    <span className="font-medium">{po.purchaseOrderNumber || po.poNumber || po.number}</span>
                                                    <span className="text-xs text-gray-400">
                                                        {formatCurrency(po.totalAmount || po.total || 0)}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-400 mt-1">
                                Select a purchase order to link to this invoice
                            </p>
                        </div>
                    )}

                    {isSales && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Sales Rep</Label>
                                <Input
                                    value={formData.salesRep}
                                    onChange={(e) => setFormData({ ...formData, salesRep: e.target.value })}
                                    placeholder="Sales person"
                                    className="mt-1"
                                    disabled={isPeriodClosed}
                                />
                            </div>
                            <div>
                                <Label>Delivery Date</Label>
                                <Input
                                    type="date"
                                    value={formData.deliveryDate}
                                    onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                                    className="mt-1"
                                    disabled={isPeriodClosed}
                                />
                            </div>
                        </div>
                    )}

                    {/* Invoice Items */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <Label className="text-base font-semibold">Invoice Items</Label>
                            <Button type="button" variant="outline" size="sm" onClick={onAddItem} disabled={isPeriodClosed}>
                                <Plus size={14} className="mr-1" /> Add Item
                            </Button>
                        </div>
                        <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                            {formData.items.map((item, index) => (
                                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex-[3]">
                                        <Input
                                            value={item.description}
                                            onChange={(e) => onUpdateItem(index, 'description', e.target.value)}
                                            placeholder="Description"
                                            className="h-9"
                                            disabled={isPeriodClosed}
                                        />
                                    </div>
                                    <div className="w-20">
                                        <Input
                                            type="number"
                                            value={item.quantity || ''}
                                            onChange={(e) => onUpdateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                            placeholder="Qty"
                                            className="h-9"
                                            disabled={isPeriodClosed}
                                        />
                                    </div>
                                    <div className="w-28">
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={item.unitPrice || ''}
                                            onChange={(e) => onUpdateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                            placeholder="Price"
                                            className="h-9"
                                            disabled={isPeriodClosed}
                                        />
                                    </div>
                                    <div className="w-28">
                                        <Input
                                            value={formatCurrency(item.total || 0)}
                                            disabled
                                            className="h-9 bg-gray-100"
                                        />
                                    </div>
                                    {formData.items.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => onRemoveItem(index)}
                                            className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50"
                                            disabled={isPeriodClosed}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 p-3 bg-gray-100 rounded-lg space-y-1">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Sub Total:</span>
                                <span className="text-sm font-medium">{formatCurrency(subTotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Tax (15%):</span>
                                <span className="text-sm font-medium">{formatCurrency(taxAmount)}</span>
                            </div>
                            <div className="flex justify-between border-t pt-1 font-bold">
                                <span>Total:</span>
                                <span className="text-indigo-600">{formatCurrency(totalAmount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Attachments */}
                    <div className="border-t border-gray-200 pt-4">
                        <div className="flex items-center justify-between mb-3">
                            <Label className="text-base font-semibold flex items-center gap-2">
                                <Paperclip className="h-4 w-4"/>
                                Attachments
                                {attachments.length > 0 && (
                                    <Badge variant="secondary" className="ml-1">
                                        {attachments.length}
                                    </Badge>
                                )}
                            </Label>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => editFileInputRef.current?.click()}
                                disabled={uploadingFiles || isPeriodClosed}
                                className="text-blue-600 border-blue-300 hover:bg-blue-50"
                            >
                                <Upload className="h-4 w-4 mr-1"/>
                                {uploadingFiles ? 'Uploading...' : 'Upload Files'}
                            </Button>
                            <input
                                ref={editFileInputRef}
                                type="file"
                                multiple
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        onFileUpload(e.target.files, selectedInvoice?.id); // ✅ Pass invoice ID
                                    }
                                }}
                            />
                        </div>

                        {uploadingFiles && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                <Loader2 className="h-4 w-4 animate-spin"/>
                                Uploading files...
                            </div>
                        )}

                        {attachments.length > 0 ? (
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {attachments.map((attachment) => (
                                    <div key={attachment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <span className="text-xl">{getFileIcon(attachment.fileType)}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-700 truncate">
                                                    {attachment.fileName}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {formatFileSize(attachment.fileSize)} • {formatDate(attachment.uploadDate)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <button
                                                onClick={() => onDownloadAttachment(attachment)}
                                                className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                                                title="Download"
                                            >
                                                <Download size={14} className="text-blue-500" />
                                            </button>
                                            <button
                                                onClick={() => onDeleteAttachment(attachment.id)}
                                                className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={14} className="text-red-500" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">
                                <Paperclip className="h-8 w-8 text-gray-300 mx-auto mb-1" />
                                <p className="text-sm text-gray-400">No attachments</p>
                                <p className="text-xs text-gray-300">Upload invoice files, receipts, or supporting documents</p>
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <Label>Notes</Label>
                        <Textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Additional notes..."
                            rows={2}
                            disabled={isPeriodClosed}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onCancel} disabled={uploadingFiles}>
                        Cancel
                    </Button>
                    <Button
                        className="bg-indigo-600 hover:bg-indigo-700"
                        onClick={onSubmit}
                        disabled={isPeriodClosed || uploadingFiles || !formData.periodId}
                    >
                        {uploadingFiles ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Update Invoice
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};