// src/components/finance/accountsPayable/ViewPaymentModal.tsx

import { useState, useEffect, useRef } from 'react';
import {
  X, Download, FileText, Building2, Paperclip, ExternalLink,
  Image, File, FileArchive, Loader2, Upload, Printer, CheckCircle,
  AlertCircle, Plus, Trash2, Banknote, Wallet, Phone, CreditCard, Calendar, User,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
  getFilesByReference,
  downloadFileinvoice,
  uploadFile,
  deleteFile
} from '../../../services/fileManagement/fileManagementApi';
import { showToast } from '../../../layout/layout';
import type { PaymentEntry } from './types';

interface Attachment {
  id: string;
  fileName: string;
  originalName?: string;
  fileSize: number;
  fileType: string;
  uploadDate: string;
  uploadedBy: string;
  filePath: string;
  url?: string;
  category?: string;
  module?: string;
  referenceId?: string;
  canDownload?: boolean;
  canDelete?: boolean;
  canEdit?: boolean;
  canShare?: boolean;
}

interface ViewPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentEntry | null;
  getVendorName?: (vendorId: string) => string;
  onPaymentUpdated?: () => void;
}

export default function ViewPaymentModal({
                                           isOpen,
                                           onClose,
                                           payment,
                                           getVendorName,
                                           onPaymentUpdated
                                         }: ViewPaymentModalProps) {
  const [invoiceAttachments, setInvoiceAttachments] = useState<Attachment[]>([]);
  const [paymentAttachments, setPaymentAttachments] = useState<Attachment[]>([]);
  const [signedAttachments, setSignedAttachments] = useState<Attachment[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [uploadingSigned, setUploadingSigned] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && payment) {
      fetchAllAttachments();
    } else {
      setInvoiceAttachments([]);
      setPaymentAttachments([]);
      setSignedAttachments([]);
    }
  }, [isOpen, payment]);

  // ============================================================
  // Fetch Attachments
  // ============================================================

  const fetchAllAttachments = async () => {
    try {
      setLoadingAttachments(true);

      const paymentId = getValue(payment, 'id', 'paymentId', 'payment_id');
      const invoiceId = getValue(payment, 'invoiceId', 'InvoiceId', 'invoice_id');

      console.log('🔍 Fetching attachments for payment:', paymentId);
      console.log('🔍 Invoice ID:', invoiceId);

      // Fetch payment attachments (vouchers)
      if (paymentId) {
        try {
          const response = await getFilesByReference('payment', paymentId);
          console.log('📄 Payment attachments response:', response);
          const parsed = parseAttachments(response);
          console.log('📄 Parsed payment attachments:', parsed);

          // Filter for payment vouchers
          const vouchers = parsed.filter(a =>
              a.category === 'payment_voucher' ||
              a.category === 'payment_voucher_signed' ||
              a.fileName?.toLowerCase().includes('voucher') ||
              a.fileName?.toLowerCase().includes('payment')
          );
          setPaymentAttachments(vouchers.length > 0 ? vouchers : parsed);
        } catch (error) {
          console.error('Error fetching payment attachments:', error);
        }

        // Fetch signed payment attachments
        try {
          const signedResponse = await getFilesByReference('payment', paymentId, 'payment_voucher_signed');
          console.log('📄 Signed attachments response:', signedResponse);
          const parsed = parseAttachments(signedResponse);
          console.log('📄 Parsed signed attachments:', parsed);
          setSignedAttachments(parsed);
        } catch (error) {
          console.error('Error fetching signed attachments:', error);
        }
      }

      // Fetch invoice attachments
      if (invoiceId) {
        try {
          const invoiceResponse = await getFilesByReference('invoice', invoiceId);
          console.log('📄 Invoice attachments response:', invoiceResponse);
          const parsed = parseAttachments(invoiceResponse);
          console.log('📄 Parsed invoice attachments:', parsed);

          // Filter for invoice attachments
          const invoiceFiles = parsed.filter(a =>
              a.category === 'invoice_attachment' ||
              a.fileName?.toLowerCase().includes('invoice')
          );
          setInvoiceAttachments(invoiceFiles.length > 0 ? invoiceFiles : parsed);
        } catch (error) {
          console.error('Error fetching invoice attachments:', error);
        }
      }

      // Check for direct attachment URL on the payment object
      const attachmentUrl = getValue(payment, 'attachment_url', 'attachmentUrl', 'AttachmentUrl');
      if (attachmentUrl && typeof attachmentUrl === 'string' && attachmentUrl.trim() !== '') {
        const exists = paymentAttachments.some(a => a.filePath === attachmentUrl || a.url === attachmentUrl);
        if (!exists) {
          setPaymentAttachments(prev => [...prev, {
            id: 'direct-' + Date.now(),
            fileName: 'Payment Voucher',
            fileSize: 0,
            fileType: 'application/pdf',
            uploadDate: new Date().toISOString(),
            uploadedBy: 'System',
            filePath: attachmentUrl,
            url: attachmentUrl,
            category: 'payment_voucher',
            canDownload: true,
            canDelete: false,
            canEdit: false,
            canShare: false
          }]);
        }
      }

    } catch (error) {
      console.error('Error fetching attachments:', error);
    } finally {
      setLoadingAttachments(false);
    }
  };

  // ============================================================
  // Parse Attachments
  // ============================================================

  const parseAttachments = (response: any): Attachment[] => {
    console.log('🔍 Parsing attachments from response:', response);

    let attachmentsData = [];

    // Handle the actual API response structure
    if (response?.data) {
      if (Array.isArray(response.data)) {
        attachmentsData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        attachmentsData = response.data.data;
      } else if (response.data.$values && Array.isArray(response.data.$values)) {
        attachmentsData = response.data.$values;
      } else if (response.data.fileName || response.data.filePath) {
        attachmentsData = [response.data];
      }
    } else if (Array.isArray(response)) {
      attachmentsData = response;
    } else if (response?.fileName || response?.filePath) {
      attachmentsData = [response];
    }

    console.log('📊 Raw attachments data:', attachmentsData);

    const mapped = attachmentsData.map((att: any) => {
      const attachment: Attachment = {
        id: att.id || att.Id || att.fileId || 'unknown',
        fileName: att.fileName || att.FileName || att.name || att.originalFileName || 'Unknown',
        originalName: att.originalFileName || att.originalName || att.fileName || '',
        fileSize: att.fileSize || att.FileSize || att.size || 0,
        fileType: att.fileType || att.FileType || att.mimeType || att.contentType || 'application/pdf',
        uploadDate: att.uploadedAt || att.UploadedAt || att.uploadDate || att.UploadDate || att.createdAt || new Date().toISOString(),
        uploadedBy: att.uploadedBy || att.UploadedBy || att.createdBy || 'Unknown',
        filePath: att.filePath || att.FilePath || att.url || att.Url || '',
        url: att.url || att.Url || att.downloadUrl || att.filePath || '',
        category: att.category || att.Category || att.documentType || '',
        module: att.module || att.Module || '',
        referenceId: att.referenceId || att.ReferenceId || '',
        canDownload: att.canDownload !== undefined ? att.canDownload : true,
        canDelete: att.canDelete !== undefined ? att.canDelete : false,
        canEdit: att.canEdit !== undefined ? att.canEdit : false,
        canShare: att.canShare !== undefined ? att.canShare : false,
      };
      return attachment;
    });

    console.log('✅ Mapped attachments:', mapped);
    return mapped;
  };

  // ============================================================
  // Upload Signed Voucher
  // ============================================================

  const handleUploadSigned = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const paymentId = getValue(payment, 'id', 'paymentId', 'payment_id');

    if (file.size > 10 * 1024 * 1024) {
      showToast.error('File size exceeds 10MB limit');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      showToast.error('Please upload PDF, JPEG, or PNG files only');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setUploadingSigned(true);
      showToast.info('Uploading signed voucher...');

      await uploadFile({
        file: file,
        module: 'payment',
        referenceId: paymentId,
        category: 'payment_voucher_signed',
        documentType: file.type.includes('pdf') ? 'PDF' : 'Image',
        description: `Signed payment voucher for ${payment?.paymentNumber || paymentId}`,
        isPublic: false,
        isShared: false,
        sharingLevel: 'Private',
      });

      await fetchAllAttachments();
      if (onPaymentUpdated) onPaymentUpdated();
      showToast.success('Signed voucher uploaded successfully');

    } catch (error: any) {
      console.error('Upload error:', error);
      showToast.error(error.response?.data?.message || 'Failed to upload signed voucher');
    } finally {
      setUploadingSigned(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ============================================================
  // Delete Signed Voucher
  // ============================================================

  const handleDeleteSigned = async (attachmentId: string) => {
    try {
      await deleteFile(attachmentId);
      showToast.success('Signed voucher deleted');
      await fetchAllAttachments();
      if (onPaymentUpdated) onPaymentUpdated();
    } catch (error) {
      console.error('Delete error:', error);
      showToast.error('Failed to delete signed voucher');
    }
  };

  // ============================================================
  // Download / Print
  // ============================================================

  const handlePrintVoucher = () => {
    if (paymentAttachments.length > 0) {
      handleDownloadAttachment(paymentAttachments[0]);
    } else {
      showToast.warning('No voucher found to print');
    }
  };

  const handleDownloadAttachment = async (attachment: Attachment) => {
    try {
      console.log('📥 Downloading attachment:', attachment);

      // If it's a direct URL
      if (attachment.url && attachment.url.startsWith('http')) {
        window.open(attachment.url, '_blank');
        return;
      }

      if (attachment.filePath && attachment.filePath.startsWith('http')) {
        window.open(attachment.filePath, '_blank');
        return;
      }

      // Use the file ID to download via API
      if (attachment.id && !attachment.id.startsWith('direct-')) {
        const blob = await downloadFileinvoice(attachment.id);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = attachment.originalName || attachment.fileName || 'attachment';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return;
      }

      // Fallback: try opening the file path
      if (attachment.filePath) {
        window.open(attachment.filePath, '_blank');
        return;
      }

      showToast.error('Cannot download this file');
    } catch (error) {
      console.error('Download error:', error);
      showToast.error('Failed to download attachment');
    }
  };

  // ============================================================
  // Utility Functions
  // ============================================================

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (!fileType) return '📎';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('excel') || fileType.includes('sheet')) return '📊';
    if (fileType.includes('zip') || fileType.includes('archive')) return '📦';
    return '📎';
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'Cash': return <Wallet className="h-4 w-4 text-emerald-500" />;
      case 'Bank_Transfer': return <Banknote className="h-4 w-4 text-blue-500" />;
      case 'Check': return <FileText className="h-4 w-4 text-purple-500" />;
      case 'Telebirr': return <Phone className="h-4 w-4 text-orange-500" />;
      default: return <CreditCard className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const getStatusColor = (status: string): string => {
    if (!status) return 'bg-gray-100 text-gray-800 border border-gray-200';
    const statusLower = status?.toLowerCase() || '';
    if (['draft'].includes(statusLower)) return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    if (['posted', 'paid', 'completed', 'approved'].includes(statusLower)) return 'bg-green-100 text-green-800 border border-green-200';
    if (['cancelled', 'rejected', 'void'].includes(statusLower)) return 'bg-red-100 text-red-800 border border-red-200';
    if (['pending', 'submitted'].includes(statusLower)) return 'bg-blue-100 text-blue-800 border border-blue-200';
    if (['partially_paid', 'partial'].includes(statusLower)) return 'bg-orange-100 text-orange-800 border border-orange-200';
    if (['overdue'].includes(statusLower)) return 'bg-rose-100 text-rose-800 border border-rose-200';
    return 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const getValue = (obj: any, ...keys: string[]) => {
    for (const key of keys) {
      if (obj && obj[key] !== undefined && obj[key] !== null) {
        return obj[key];
      }
    }
    return undefined;
  };

  const formatPaymentMethod = (method: string | undefined) => {
    if (!method) return 'N/A';
    return method.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
  };

  // ============================================================
  // Computed Values
  // ============================================================

  if (!payment) return null;

  const pvNumber = getValue(payment, 'internal_pv_no', 'paymentNumber', 'pvNumber', 'number');
  const bankRef = getValue(payment, 'external_bank_ref', 'reference', 'bankReference', 'externalRef');
  const paymentDate = getValue(payment, 'payment_date', 'paymentDate', 'date', 'createdAt');
  const paymentMethod = getValue(payment, 'payment_method', 'paymentMethod', 'method');
  const vendorId = getValue(payment, 'vendor_id', 'vendorId', 'vendor');
  const vendorName = getValue(payment, 'vendor_name', 'vendorName', 'vendor', 'supplierName');
  const bankAccount = getValue(payment, 'bank_account_name', 'bankAccountName', 'bankName', 'accountName');
  const totalAmount = getValue(payment, 'total_amount', 'totalAmount', 'amount', 'total');
  const status = getValue(payment, 'status', 'paymentStatus');
  const description = getValue(payment, 'description', 'notes');
  const createdBy = getValue(payment, 'created_by', 'createdBy', 'userName');
  const createdAt = getValue(payment, 'created_at', 'createdAt', 'dateAdd');
  const invoiceId = getValue(payment, 'invoiceId', 'InvoiceId', 'invoice_id');
  const invoiceNumber = getValue(payment, 'invoiceNumber', 'invoice_no', 'InvoiceNumber');
  const periodId = getValue(payment, 'periodId', 'PeriodId', 'period_id');
  const periodName = getValue(payment, 'periodName', 'PeriodName', 'period_name');

  const displayVendorName = getVendorName && vendorId
      ? getVendorName(vendorId)
      : vendorName || 'Unknown Vendor';

  // Get all attachments for display
  const allAttachments = [...invoiceAttachments, ...paymentAttachments, ...signedAttachments];

  // Get voucher attachments (PDFs first, then by date)
  const getVoucherAttachments = () => {
    const all = [...paymentAttachments];
    return all.sort((a, b) => {
      if (a.fileType.includes('pdf') && !b.fileType.includes('pdf')) return -1;
      if (!a.fileType.includes('pdf') && b.fileType.includes('pdf')) return 1;
      return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
    });
  };
  const voucherAttachments = getVoucherAttachments();

  // ============================================================
  // Render
  // ============================================================

  return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                Payment Details
              </div>
              <div className="flex items-center gap-2">
                {periodName && (
                    <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
                      {periodName}
                    </Badge>
                )}
                <Badge className={getStatusColor(status)}>
                  {status?.replace(/_/g, ' ') || 'N/A'}
                </Badge>
              </div>
            </DialogTitle>
            <DialogDescription>
              View payment details and manage attachments
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Period Information */}
            {periodName && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 flex items-center gap-3">
                  <CalendarIcon className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="text-xs text-indigo-600 font-medium">Financial Period</p>
                    <p className="text-sm font-semibold text-indigo-900">{periodName}</p>
                    {periodId && <p className="text-xs text-indigo-500">ID: {periodId}</p>}
                  </div>
                </div>
            )}

            {/* Payment Information */}
            <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-indigo-900 mb-3">Payment Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">PV Number</p>
                  <p className="text-sm font-semibold text-gray-900">{pvNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Bank Reference</p>
                  <p className="text-sm font-semibold text-gray-900">{bankRef || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Payment Date</p>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(paymentDate)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500">Payment Method</p>
                  <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                    {getPaymentMethodIcon(paymentMethod)}
                    {formatPaymentMethod(paymentMethod)}
                  </div>
                </div>
                {description && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">Description</p>
                      <p className="text-sm text-gray-900">{description}</p>
                    </div>
                )}
              </div>
            </div>

            {/* Vendor Information */}
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Vendor Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Vendor Name</p>
                  <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    {displayVendorName}
                  </p>
                  {vendorId && <p className="text-xs text-gray-400">ID: {vendorId}</p>}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Bank Account</p>
                  <p className="text-sm font-semibold text-gray-900">{bankAccount || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Invoices Paid */}
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Invoices Paid</h3>
              {(invoiceId || invoiceNumber) ? (
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{invoiceNumber || 'Invoice'}</p>
                        <p className="text-xs text-gray-500">ID: {invoiceId || 'N/A'}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-indigo-600">{formatCurrency(totalAmount || 0)}</p>
                  </div>
              ) : (
                  <p className="text-gray-500 text-center py-2 text-sm">No invoice linked to this payment</p>
              )}
            </div>

            {/* Attachments */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  Attachments
                  {allAttachments.length > 0 && (
                      <Badge variant="secondary" className="ml-1">{allAttachments.length}</Badge>
                  )}
                </h4>
                <div className="flex gap-2">
                  {voucherAttachments.length > 0 && (
                      <Button
                          size="sm"
                          variant="outline"
                          onClick={handlePrintVoucher}
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        <Printer className="h-4 w-4 mr-1" /> Print
                      </Button>
                  )}
                  <Button
                      size="sm"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingSigned}
                      className="text-green-600 border-green-300 hover:bg-green-50"
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    {uploadingSigned ? 'Uploading...' : 'Upload Signed'}
                  </Button>
                  <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={handleUploadSigned}
                      disabled={uploadingSigned}
                  />
                </div>
              </div>

              {loadingAttachments ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                    <span className="ml-2 text-sm text-gray-500">Loading...</span>
                  </div>
              ) : allAttachments.length > 0 ? (
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {/* Payment Vouchers */}
                    {voucherAttachments.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Payment Vouchers</p>
                          {voucherAttachments.map((att) => (
                              <AttachmentItem
                                  key={att.id}
                                  attachment={att}
                                  onDownload={handleDownloadAttachment}
                                  getFileIcon={getFileIcon}
                                  formatFileSize={formatFileSize}
                                  formatDate={formatDate}
                              />
                          ))}
                        </div>
                    )}

                    {/* Signed Copies */}
                    {signedAttachments.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1 flex items-center gap-2">
                            <CheckCircle className="h-3 w-3" /> Signed Copies
                          </p>
                          {signedAttachments.map((att) => (
                              <div key={att.id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <span className="text-xl">{getFileIcon(att.fileType)}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-700 truncate">
                                      {att.originalName || att.fileName}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {formatFileSize(att.fileSize)} • {formatDate(att.uploadDate)}
                                      {att.category && (
                                          <span className="ml-2 px-1.5 py-0.5 bg-green-100 rounded text-green-600 text-xs">
                                  {att.category.replace(/_/g, ' ')}
                                </span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  {att.canDownload !== false && (
                                      <button
                                          onClick={() => handleDownloadAttachment(att)}
                                          className="p-1 hover:bg-blue-100 rounded-lg"
                                          title="Download"
                                      >
                                        <Download size={14} className="text-blue-500" />
                                      </button>
                                  )}
                                  {att.canDelete !== false && (
                                      <button
                                          onClick={() => handleDeleteSigned(att.id)}
                                          className="p-1 hover:bg-red-100 rounded-lg"
                                          title="Delete"
                                      >
                                        <Trash2 size={14} className="text-red-500" />
                                      </button>
                                  )}
                                </div>
                              </div>
                          ))}
                        </div>
                    )}

                    {/* Invoice Attachments */}
                    {invoiceAttachments.length > 0 && (
                        <div>
                          {(voucherAttachments.length > 0 || signedAttachments.length > 0) && (
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Invoice Attachments</p>
                          )}
                          {invoiceAttachments.map((att) => (
                              <AttachmentItem
                                  key={att.id}
                                  attachment={att}
                                  onDownload={handleDownloadAttachment}
                                  getFileIcon={getFileIcon}
                                  formatFileSize={formatFileSize}
                                  formatDate={formatDate}
                              />
                          ))}
                        </div>
                    )}
                  </div>
              ) : (
                  <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">
                    <Paperclip className="h-8 w-8 text-gray-300 mx-auto mb-1" />
                    <p className="text-sm text-gray-400">No attachments</p>
                  </div>
              )}
            </div>

            {/* Total Amount */}
            <div className="bg-emerald-50 rounded-lg p-4 border-2 border-emerald-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">Total Payment Amount:</span>
                <span className="text-2xl font-bold text-emerald-600">{formatCurrency(totalAmount || 0)}</span>
              </div>
            </div>

            {/* Audit */}
            <div className="border-t pt-3 flex justify-between text-xs text-gray-400">
              <span>Created By: {createdBy || 'N/A'}</span>
              <span>Created At: {formatDate(createdAt)}</span>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose} variant="outline">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
  );
}

// ============================================================
// Attachment Item Component
// ============================================================

function AttachmentItem({
                          attachment,
                          onDownload,
                          getFileIcon,
                          formatFileSize,
                          formatDate
                        }: {
  attachment: Attachment;
  onDownload: (attachment: Attachment) => void;
  getFileIcon: (fileType: string) => string;
  formatFileSize: (bytes: number) => string;
  formatDate: (dateString: string) => string;
}) {
  return (
      <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-xl">{getFileIcon(attachment.fileType)}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">
              {attachment.originalName || attachment.fileName}
            </p>
            <p className="text-xs text-gray-400">
              {formatFileSize(attachment.fileSize)} • {formatDate(attachment.uploadDate)}
              {attachment.category && (
                  <span className="ml-2 px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 text-xs">
                {attachment.category.replace(/_/g, ' ')}
              </span>
              )}
            </p>
          </div>
        </div>
        {attachment.canDownload !== false && (
            <button
                onClick={() => onDownload(attachment)}
                className="p-1 hover:bg-blue-100 rounded-lg"
                title="Download"
            >
              <Download size={14} className="text-blue-500" />
            </button>
        )}
      </div>
  );
}