// src/pages/finance/ap/components/VoucherModals/VoucherViewModal.tsx
import React from 'react';
import {
    Eye,
    X,
    FileText,
    Calendar,
    Building2,
    User,
    Tag,
    DollarSign,
    CheckCircle,
    Clock,
    AlertCircle,
    Printer,
    Download,
    FileCheck,
    Shield,
    Link2,
    Paperclip,
} from 'lucide-react';
import { Button } from '../../../../../components/ui/button';
import { Badge } from '../../../../../components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogContent as DialogContentType,
} from '../../../../../components/ui/dialog';
import type{ Voucher } from '../types/voucher.types';
import { formatCurrency, formatDate, getStatusColor, getTypeBadge } from '../utils/voucher.utils';

interface VoucherViewModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    voucher: Voucher | null;
    onPrint?: () => void;
    onExport?: () => void;
    onApprove?: () => void;
    onReject?: () => void;
    onEdit?: () => void;
}

export const VoucherViewModal: React.FC<VoucherViewModalProps> = ({
                                                                      isOpen,
                                                                      onOpenChange,
                                                                      voucher,
                                                                      onPrint,
                                                                      onExport,
                                                                      onApprove,
                                                                      onReject,
                                                                      onEdit,
                                                                  }) => {
    if (!voucher) return null;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Draft':
                return <Clock className="h-5 w-5 text-gray-500" />;
            case 'Pending':
                return <Clock className="h-5 w-5 text-yellow-500" />;
            case 'Approved':
                return <CheckCircle className="h-5 w-5 text-blue-500" />;
            case 'Posted':
                return <FileCheck className="h-5 w-5 text-green-500" />;
            case 'Rejected':
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            case 'Void':
                return <X className="h-5 w-5 text-gray-500" />;
            default:
                return <FileText className="h-5 w-5 text-gray-500" />;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <span className="text-xl font-bold text-gray-900">{voucher.voucherNumber}</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge className={getStatusColor(voucher.status)}>
                                        {getStatusIcon(voucher.status)}
                                        <span className="ml-1">{voucher.status}</span>
                                    </Badge>
                                    <Badge className={getTypeBadge(voucher.voucherType)}>
                                        {voucher.voucherType}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {onEdit && (voucher.status === 'Draft' || voucher.status === 'Pending') && (
                                <Button variant="outline" size="sm" onClick={onEdit}>
                                    <Eye className="h-4 w-4 mr-1" />
                                    Edit
                                </Button>
                            )}
                            {onPrint && (
                                <Button variant="outline" size="sm" onClick={onPrint}>
                                    <Printer className="h-4 w-4" />
                                </Button>
                            )}
                            {onExport && (
                                <Button variant="outline" size="sm" onClick={onExport}>
                                    <Download className="h-4 w-4" />
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onOpenChange(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Voucher Details */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-500">Date:</span>
                            <span className="text-sm font-medium text-gray-900">{formatDate(voucher.voucherDate)}</span>
                        </div>
                        {voucher.periodName && (
                            <div className="flex items-center gap-2">
                                <Tag className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-500">Period:</span>
                                <span className="text-sm font-medium text-gray-900">{voucher.periodName}</span>
                            </div>
                        )}
                        {voucher.vendorName && (
                            <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-500">Vendor:</span>
                                <span className="text-sm font-medium text-gray-900">{voucher.vendorName}</span>
                            </div>
                        )}
                        {voucher.approvedBy && (
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-500">Approved By:</span>
                                <span className="text-sm font-medium text-gray-900">{voucher.approvedBy}</span>
                            </div>
                        )}
                        {voucher.approvedAt && (
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-500">Approved At:</span>
                                <span className="text-sm font-medium text-gray-900">{formatDate(voucher.approvedAt)}</span>
                            </div>
                        )}
                        {voucher.postedBy && (
                            <div className="flex items-center gap-2">
                                <FileCheck className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-500">Posted By:</span>
                                <span className="text-sm font-medium text-gray-900">{voucher.postedBy}</span>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    {voucher.description && (
                        <div className="p-4 bg-white border border-gray-200 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                            <p className="text-sm text-gray-600">{voucher.description}</p>
                        </div>
                    )}

                    {/* Voucher Lines */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Voucher Lines</h4>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Debit</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Credit</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {voucher.lines.map((line, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 text-sm">
                                            <div>
                                                    <span className="font-medium text-gray-900">
                                                        {line.accountCode || ''}
                                                    </span>
                                                {line.accountName && (
                                                    <span className="text-gray-500 ml-2">{line.accountName}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-600">{line.description || '-'}</td>
                                        <td className="px-4 py-2 text-sm font-medium text-blue-600 text-right">
                                            {line.debitAmount > 0 ? formatCurrency(line.debitAmount) : '-'}
                                        </td>
                                        <td className="px-4 py-2 text-sm font-medium text-orange-600 text-right">
                                            {line.creditAmount > 0 ? formatCurrency(line.creditAmount) : '-'}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                                <tfoot className="bg-gray-50 border-t border-gray-200">
                                <tr>
                                    <td colSpan={2} className="px-4 py-2 text-sm font-medium text-gray-700 text-right">
                                        Total
                                    </td>
                                    <td className="px-4 py-2 text-sm font-bold text-blue-600 text-right">
                                        {formatCurrency(voucher.totalDebit)}
                                    </td>
                                    <td className="px-4 py-2 text-sm font-bold text-orange-600 text-right">
                                        {formatCurrency(voucher.totalCredit)}
                                    </td>
                                </tr>
                                </tfoot>
                            </table>
                        </div>
                        <div className="mt-2 flex items-center justify-end gap-4 text-sm">
                            <span className="text-gray-500">Total Debit:</span>
                            <span className="font-bold text-blue-600">{formatCurrency(voucher.totalDebit)}</span>
                            <span className="text-gray-500">Total Credit:</span>
                            <span className="font-bold text-orange-600">{formatCurrency(voucher.totalCredit)}</span>
                            {voucher.totalDebit === voucher.totalCredit && (
                                <Badge className="bg-green-100 text-green-700 border-green-200">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Balanced
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Attachments */}
                    {voucher.attachments && voucher.attachments.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                <Paperclip className="h-4 w-4" />
                                Attachments ({voucher.attachments.length})
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {voucher.attachments.map((attachment) => (
                                    <div
                                        key={attachment.id}
                                        className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                                    >
                                        <FileText className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm text-gray-700">{attachment.fileName}</span>
                                        <span className="text-xs text-gray-400">
                                            ({(attachment.fileSize / 1024).toFixed(1)} KB)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Status Timeline */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Timeline
                        </h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-gray-500">Created:</span>
                                </div>
                                <span className="text-gray-700">{formatDate(voucher.dateAdd)}</span>
                            </div>
                            {voucher.approvedAt && (
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span className="text-gray-500">Approved:</span>
                                    </div>
                                    <span className="text-gray-700">{formatDate(voucher.approvedAt)}</span>
                                    {voucher.approvedBy && (
                                        <span className="text-gray-500">by {voucher.approvedBy}</span>
                                    )}
                                </div>
                            )}
                            {voucher.postedAt && (
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                        <span className="text-gray-500">Posted:</span>
                                    </div>
                                    <span className="text-gray-700">{formatDate(voucher.postedAt)}</span>
                                    {voucher.postedBy && (
                                        <span className="text-gray-500">by {voucher.postedBy}</span>
                                    )}
                                </div>
                            )}
                            {voucher.dateMod && voucher.dateMod !== voucher.dateAdd && (
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                        <span className="text-gray-500">Modified:</span>
                                    </div>
                                    <span className="text-gray-700">{formatDate(voucher.dateMod)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    {voucher.status === 'Pending' && (onApprove || onReject) && (
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                            {onReject && (
                                <Button variant="outline" onClick={onReject} className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300">
                                    <X className="h-4 w-4 mr-2" />
                                    Reject
                                </Button>
                            )}
                            {onApprove && (
                                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={onApprove}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};