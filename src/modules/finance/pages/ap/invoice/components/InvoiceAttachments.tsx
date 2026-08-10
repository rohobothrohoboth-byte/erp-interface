// src/pages/finance/ap/invoice/components/InvoiceAttachments.tsx

import React from 'react';
import { Paperclip, Upload, Download, Trash2, Loader2, Eye } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { formatFileSize, formatDate, getFileIcon } from '@/modules/finance/pages/ap/invoice/utils/invoice.utils';

interface InvoiceAttachmentsProps {
    attachments: any[];
    loading?: boolean;
    onUpload: (files: FileList) => void;
    onDownload: (attachment: any) => void;
    onDelete: (attachmentId: string) => void;
    onPreview?: (attachment: any) => void;
    uploadingFiles: boolean;
    fileInputRef: React.RefObject<HTMLInputElement>;
    isEdit?: boolean;
    disabled?: boolean;
    showPreview?: boolean;
    maxHeight?: string;
}

export const InvoiceAttachments: React.FC<InvoiceAttachmentsProps> = ({
                                                                          attachments = [],
                                                                          loading = false,
                                                                          onUpload,
                                                                          onDownload,
                                                                          onDelete,
                                                                          onPreview,
                                                                          uploadingFiles,
                                                                          fileInputRef,
                                                                          isEdit = false,
                                                                          disabled = false,
                                                                          showPreview = true,
                                                                          maxHeight = 'max-h-40',
                                                                      }) => {
    const hasAttachments = attachments && attachments.length > 0;

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

    // ✅ Check if file is previewable (image or PDF)
    const isPreviewable = (fileName: string, fileType: string): boolean => {
        return isImageFile(fileName, fileType) || isPdfFile(fileName, fileType);
    };

    return (
        <div className="border-t border-gray-200 pt-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    Attachments
                    {hasAttachments && (
                        <Badge variant="secondary" className="ml-1">
                            {attachments.length}
                        </Badge>
                    )}
                </h4>
                {!disabled && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingFiles || disabled}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                        <Upload className="h-4 w-4 mr-1" />
                        {uploadingFiles ? 'Uploading...' : 'Upload Files'}
                    </Button>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.gif,.bmp,.webp"
                    className="hidden"
                    onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                            onUpload(e.target.files);
                        }
                    }}
                />
            </div>

            {/* Uploading indicator */}
            {uploadingFiles && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading files...
                </div>
            )}

            {/* Loading state */}
            {loading ? (
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                    <span className="ml-2 text-sm text-gray-500">Loading attachments...</span>
                </div>
            ) : hasAttachments ? (
                /* Attachments grid */
                <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 ${maxHeight} overflow-y-auto`}>
                    {attachments.map((attachment) => {
                        const isImage = isImageFile(attachment.fileName, attachment.fileType);
                        const isPdf = isPdfFile(attachment.fileName, attachment.fileType);
                        const previewable = isPreviewable(attachment.fileName, attachment.fileType);
                        const fileIcon = getFileIcon(attachment.fileType || attachment.mimeType || '');
                        const fileName = attachment.fileName || attachment.originalFileName || 'Unnamed file';
                        const fileSize = attachment.fileSize || attachment.size || 0;
                        const uploadDate = attachment.uploadDate || attachment.createdAt || new Date().toISOString();
                        const fileType = attachment.fileType || attachment.mimeType || '';

                        return (
                            <div
                                key={attachment.id}
                                className="group relative border rounded-lg p-3 transition-all hover:shadow-md bg-white hover:bg-gray-50"
                            >
                                {/* File icon */}
                                <div className="flex flex-col items-center text-center">
                                    <div className="mb-2 text-3xl">
                                        {isImage ? '🖼️' : isPdf ? '📄' : fileIcon}
                                    </div>
                                    <p className="text-xs font-medium text-gray-700 truncate w-full" title={fileName}>
                                        {fileName}
                                    </p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                        {formatFileSize(fileSize)}
                                    </p>
                                    {uploadDate && (
                                        <p className="text-[10px] text-gray-400">
                                            {formatDate(uploadDate)}
                                        </p>
                                    )}
                                </div>

                                {/* Action buttons - shown on hover */}
                                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {showPreview && previewable && onPreview && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onPreview(attachment);
                                            }}
                                            className="p-1 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                                            title={isPdf ? 'Preview PDF' : 'Preview Image'}
                                        >
                                            <Eye size={12} className="text-blue-500" />
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDownload(attachment);
                                        }}
                                        className="p-1 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                                        title="Download"
                                    >
                                        <Download size={12} className="text-gray-600" />
                                    </button>
                                    {isEdit && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(attachment.id);
                                            }}
                                            className="p-1 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={12} className="text-red-500" />
                                        </button>
                                    )}
                                </div>

                                {/* File type badge */}
                                {fileType && (
                                    <div className="absolute bottom-1 right-1">
                                        <Badge variant="outline" className="text-[8px] px-1 py-0 bg-white/80">
                                            {isPdf ? '📄 PDF' :
                                                isImage ? '🖼️ Image' :
                                                    fileType.includes('word') ? '📝 DOC' :
                                                        fileType.includes('excel') ? '📊 XLS' :
                                                            '📎 File'}
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Empty state */
                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                    <Paperclip className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No attachments</p>
                    <p className="text-xs text-gray-300">
                        {isEdit
                            ? 'Upload invoice files, receipts, or supporting documents'
                            : 'No files attached to this invoice'}
                    </p>
                    <p className="text-xs text-gray-300 mt-1">Supported: PDF, JPEG, PNG, DOC (Max 10MB)</p>
                </div>
            )}
        </div>
    );
};

export default InvoiceAttachments;