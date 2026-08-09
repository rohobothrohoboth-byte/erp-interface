// src/pages/finance/ap/invoice/components/InvoiceViewModal.tsx

import React, { useEffect, useState } from 'react';
import { FileText, Edit, AlertCircle, X, Image as ImageIcon, Download, Loader2, File } from 'lucide-react';
import { Button } from '../../../../../components/ui/button';
import { Badge } from '../../../../../components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '../../../../../components/ui/dialog';
import { InvoiceAttachments } from './InvoiceAttachments';
import type { Invoice } from '../types/invoice.types';
import { formatCurrency, formatDate, getStatusColor, getTypeBadge, formatFileSize } from '../utils/invoice.utils';
import { showToast } from '../../../../../layout/layout';

interface InvoiceViewModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    invoice: Invoice | null;
    attachments: any[];
    loadingAttachments?: boolean;
    onDownloadAttachment: (attachment: any) => Promise<any>;
    onDownloadAndSave: (attachment: any) => Promise<void>;
    onRequestAmendment: () => void;
    canRequestAmendment: boolean;
    isAuthorizedToApprove: boolean;
}

export const InvoiceViewModal: React.FC<InvoiceViewModalProps> = ({
                                                                      isOpen,
                                                                      onOpenChange,
                                                                      invoice,
                                                                      attachments = [],
                                                                      loadingAttachments = false,
                                                                      onDownloadAttachment,
                                                                      onDownloadAndSave,
                                                                      onRequestAmendment,
                                                                      canRequestAmendment,
                                                                      isAuthorizedToApprove,
                                                                  }) => {
    // ✅ State for preview
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewAttachment, setPreviewAttachment] = useState<any | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [previewType, setPreviewType] = useState<'image' | 'pdf' | 'none'>('none');

    // ✅ Check if file is an image
    const isImageFile = (fileName: string, fileType: string): boolean => {
        const extension = fileName?.split('.').pop()?.toLowerCase() || '';
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'heic', 'heif'];
        return imageExtensions.includes(extension) || fileType?.includes('image');
    };

    // ✅ Check if file is a PDF
    const isPdfFile = (fileName: string, fileType: string): boolean => {
        const extension = fileName?.split('.').pop()?.toLowerCase() || '';
        return extension === 'pdf' || fileType?.includes('pdf');
    };

    // ✅ Handle preview for both images and PDFs
    const handlePreview = async (attachment: any) => {
        try {
            setIsLoadingPreview(true);

            if (isImageFile(attachment.fileName, attachment.fileType)) {
                const blob = await onDownloadAttachment(attachment);
                if (blob && blob.size > 0) {
                    const url = URL.createObjectURL(blob);
                    setPreviewUrl(url);
                    setPreviewAttachment(attachment);
                    setPreviewType('image');
                    setIsPreviewOpen(true);
                } else {
                    showToast.error('Failed to load image');
                }
            } else if (isPdfFile(attachment.fileName, attachment.fileType)) {
                const blob = await onDownloadAttachment(attachment);
                if (blob && blob.size > 0) {
                    const url = URL.createObjectURL(blob);
                    setPreviewUrl(url);
                    setPreviewAttachment(attachment);
                    setPreviewType('pdf');
                    setIsPreviewOpen(true);
                } else {
                    showToast.error('Failed to load PDF');
                }
            } else {
                showToast.info('This file type cannot be previewed');
                // For other files, just download
                await onDownloadAndSave(attachment);
            }
        } catch (error) {
            console.error('Error previewing file:', error);
            showToast.error('Failed to preview file');
        } finally {
            setIsLoadingPreview(false);
        }
    };

    // ✅ Handle download - saves the file
    const handleDownload = async (attachment: any) => {
        try {
            await onDownloadAndSave(attachment);
        } catch (error) {
            console.error('Error downloading:', error);
            showToast.error('Failed to download file');
        }
    };

    // ✅ Clean up preview URL when modal closes
    const handlePreviewClose = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setIsPreviewOpen(false);
        setPreviewUrl(null);
        setPreviewAttachment(null);
        setPreviewType('none');
    };

    if (!invoice) return null;

    const getPartyName = (inv: Invoice): string => {
        if (inv.invoiceType === 'Purchase') {
            return inv.vendorName || 'Unknown Vendor';
        }
        return inv.customerName || 'Unknown Customer';
    };

    // ✅ Render preview content based on type
    const renderPreviewContent = () => {
        if (isLoadingPreview) {
            return (
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    <p className="text-sm text-gray-500">Loading preview...</p>
                </div>
            );
        }

        if (!previewUrl) {
            return (
                <div className="flex flex-col items-center gap-3 text-gray-400">
                    <File className="h-16 w-16" />
                    <p className="text-sm">No preview available</p>
                    {previewAttachment && (
                        <Button
                            variant="outline"
                            onClick={() => handleDownload(previewAttachment)}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download File
                        </Button>
                    )}
                </div>
            );
        }

        if (previewType === 'image') {
            return (
                <img
                    src={previewUrl}
                    alt={previewAttachment?.fileName || 'Preview'}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg"
                    onError={() => {
                        setPreviewUrl(null);
                        showToast.error('Failed to display image');
                    }}
                />
            );
        }

        if (previewType === 'pdf') {
            return (
                <div className="w-full h-[70vh]">
                    <embed
                        src={previewUrl}
                        type="application/pdf"
                        className="w-full h-full rounded-lg"
                        title={previewAttachment?.fileName || 'PDF Preview'}
                    />
                </div>
            );
        }

        return null;
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-lg max-h-[95vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-indigo-600" />
                            Invoice Details
                        </DialogTitle>
                        <DialogDescription>
                            View invoice information, attachments, and amendments.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Invoice Details Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Invoice Number</p>
                                <p className="font-medium">{invoice.invoiceNumber}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Type</p>
                                <Badge className={getTypeBadge(invoice.invoiceType)}>
                                    {invoice.invoiceType === 'Purchase' ? 'AP - Purchase' : 'AR - Sales'}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{invoice.invoiceType === 'Purchase' ? 'Vendor' : 'Customer'}</p>
                                <p>{getPartyName(invoice)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <Badge className={getStatusColor(invoice.status)}>
                                    {invoice.status}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Date</p>
                                <p>{formatDate(invoice.invoiceDate)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Due Date</p>
                                <p>{formatDate(invoice.dueDate)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Period</p>
                                <p>{invoice.periodName || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Amount</p>
                                <p className="text-lg font-bold text-indigo-600">
                                    {formatCurrency(invoice.totalAmount)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Balance Due</p>
                                <p className={`text-lg font-bold ${(invoice.balanceDue || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {formatCurrency(invoice.balanceDue || 0)}
                                </p>
                            </div>
                        </div>

                        {/* Notes */}
                        {invoice.notes && (
                            <div>
                                <p className="text-sm text-gray-500">Notes</p>
                                <p className="text-sm text-gray-700">{invoice.notes}</p>
                            </div>
                        )}

                        {/* ✅ Attachments Section with Preview for both images and PDFs */}
                        <InvoiceAttachments
                            attachments={attachments}
                            loading={loadingAttachments}
                            onUpload={() => {}}
                            onDownload={handleDownload}
                            onDelete={() => {}}
                            onPreview={handlePreview}
                            uploadingFiles={false}
                            fileInputRef={{ current: null }}
                            isEdit={false}
                            disabled={true}
                            showPreview={true}
                        />

                        {/* Amendment Section */}
                        {invoice.status === 'Paid' && (
                            <div className="border-t border-gray-200 pt-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-orange-500" />
                                    Amendment Request
                                </h4>

                                {canRequestAmendment && (
                                    <Button
                                        onClick={onRequestAmendment}
                                        size="sm"
                                        variant="outline"
                                        className="border-orange-300 text-orange-600 hover:bg-orange-50"
                                    >
                                        <Edit className="h-4 w-4 mr-1" />
                                        Request Amendment
                                    </Button>
                                )}

                                {invoice.amendments && invoice.amendments.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {invoice.amendments.map((amendment: any) => (
                                            <div key={amendment.id} className="bg-gray-50 p-3 rounded-lg border">
                                                <div className="flex justify-between items-start">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                        amendment.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                            amendment.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                        {amendment.status}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {formatDate(amendment.requestedAt)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    <span className="font-medium">Reason:</span> {amendment.reason}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ✅ Preview Modal - Supports both Images and PDFs */}
            <Dialog open={isPreviewOpen} onOpenChange={handlePreviewClose}>
                <DialogContent className="max-w-4xl max-h-[90vh]">
                    <DialogHeader className="flex flex-row items-center justify-between">
                        <DialogTitle className="text-sm font-medium text-gray-700 truncate max-w-xs">
                            {previewAttachment?.fileName || 'Preview'}
                            {previewType === 'pdf' && (
                                <Badge variant="outline" className="ml-2 text-red-500 border-red-300">
                                    PDF
                                </Badge>
                            )}
                            {previewType === 'image' && (
                                <Badge variant="outline" className="ml-2 text-green-500 border-green-300">
                                    Image
                                </Badge>
                            )}
                        </DialogTitle>
                        <div className="flex items-center gap-2">
                            {previewAttachment && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDownload(previewAttachment)}
                                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                >
                                    <Download className="h-4 w-4 mr-1" />
                                    Download
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handlePreviewClose}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </DialogHeader>
                    <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg min-h-[300px]">
                        {renderPreviewContent()}
                    </div>
                    {previewAttachment && (
                        <div className="flex justify-between text-xs text-gray-400 border-t border-gray-100 pt-3 mt-2">
                            <span className="truncate max-w-xs">{previewAttachment.fileName}</span>
                            <span>{formatFileSize(previewAttachment.fileSize)}</span>
                            <span>{formatDate(previewAttachment.uploadDate)}</span>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};