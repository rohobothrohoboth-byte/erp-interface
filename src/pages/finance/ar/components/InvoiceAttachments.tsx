// src/pages/finance/ar/components/InvoiceAttachments.tsx
import React, { useState } from 'react';
import {
    Paperclip,
    Upload,
    Download,
    Loader2,
    Eye,
    Image,
    FileText,
    X,
    File,
    FileArchive,
    Video,
    AlertCircle
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose
} from '../../../../components/ui/dialog';
import { formatFileSize, formatDate } from '../utils/invoice.utils';
import { showToast } from '../../../../layout/layout';

interface InvoiceAttachmentsProps {
    attachments: any[];
    loading: boolean;
    onUpload: (files: FileList) => void;
    onDownload: (attachment: any) => Promise<any>; // For preview
    onDownloadAndSave: (attachment: any) => Promise<void>; // For saving
    uploadingFiles: boolean;
    fileInputRef: React.RefObject<HTMLInputElement>;
}

// Get file icon based on file type
const getFileIcon = (fileType: string, fileName: string): React.ReactNode => {
    const extension = fileName?.split('.').pop()?.toLowerCase() || '';

    if (['pdf'].includes(extension) || fileType?.includes('pdf')) {
        return <FileText className="h-5 w-5 text-red-500" />;
    }
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension) || fileType?.includes('image')) {
        return <Image className="h-5 w-5 text-green-500" />;
    }
    if (['xls', 'xlsx', 'csv'].includes(extension) || fileType?.includes('excel')) {
        return <FileText className="h-5 w-5 text-green-600" />;
    }
    if (['doc', 'docx', 'txt'].includes(extension) || fileType?.includes('word')) {
        return <FileText className="h-5 w-5 text-blue-500" />;
    }
    if (['mp4', 'webm', 'avi', 'mov'].includes(extension) || fileType?.includes('video')) {
        return <Video className="h-5 w-5 text-purple-500" />;
    }
    if (['zip', 'rar', '7z'].includes(extension) || fileType?.includes('zip')) {
        return <FileArchive className="h-5 w-5 text-amber-500" />;
    }
    return <File className="h-5 w-5 text-gray-400" />;
};

// Check if file is an image
const isImageFile = (fileName: string, fileType: string): boolean => {
    const extension = fileName?.split('.').pop()?.toLowerCase() || '';
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'heic', 'heif'];
    return imageExtensions.includes(extension) || fileType?.includes('image');
};

// Get file color based on type
const getFileColor = (fileType: string, fileName: string): string => {
    const extension = fileName?.split('.').pop()?.toLowerCase() || '';

    if (['pdf'].includes(extension) || fileType?.includes('pdf')) {
        return 'border-red-200 bg-red-50 hover:bg-red-100';
    }
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension) || fileType?.includes('image')) {
        return 'border-green-200 bg-green-50 hover:bg-green-100';
    }
    if (['xls', 'xlsx', 'csv'].includes(extension) || fileType?.includes('excel')) {
        return 'border-green-300 bg-green-50 hover:bg-green-100';
    }
    if (['doc', 'docx', 'txt'].includes(extension) || fileType?.includes('word')) {
        return 'border-blue-200 bg-blue-50 hover:bg-blue-100';
    }
    if (['mp4', 'webm', 'avi', 'mov'].includes(extension) || fileType?.includes('video')) {
        return 'border-purple-200 bg-purple-50 hover:bg-purple-100';
    }
    return 'border-gray-200 bg-gray-50 hover:bg-gray-100';
};

export const InvoiceAttachments: React.FC<InvoiceAttachmentsProps> = ({
                                                                          attachments,
                                                                          loading,
                                                                          onUpload,
                                                                          onDownload,
                                                                          onDownloadAndSave,
                                                                          uploadingFiles,
                                                                          fileInputRef,
                                                                      }) => {
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [previewAttachment, setPreviewAttachment] = useState<any | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);

    // Handle preview
    const handlePreview = async (attachment: any) => {
        try {
            setIsLoadingPreview(true);
            setPreviewError(null);

            // Check if it's an image
            if (isImageFile(attachment.fileName, attachment.fileType)) {
                const blob = await onDownload(attachment);

                if (blob && blob.size > 0) {
                    const url = URL.createObjectURL(blob);
                    setPreviewImage(url);
                    setPreviewAttachment(attachment);
                    setIsPreviewOpen(true);
                } else {
                    setPreviewError('Failed to load image - file is empty');
                    showToast.error('Failed to load image - file is empty');
                }
            } else {
                // For non-images, just download using the save function
                await onDownloadAndSave(attachment);
            }
        } catch (error) {
            console.error('Error previewing attachment:', error);
            setPreviewError(error?.message || 'Failed to load preview');
            showToast.error('Failed to load preview');
        } finally {
            setIsLoadingPreview(false);
        }
    };

    // Clean up preview URL when modal closes
    const handlePreviewClose = () => {
        if (previewImage) {
            URL.revokeObjectURL(previewImage);
        }
        setIsPreviewOpen(false);
        setPreviewImage(null);
        setPreviewAttachment(null);
        setPreviewError(null);
    };

    // ✅ Handle download with the save function
    const handleDownloadClick = async (e: React.MouseEvent, attachment: any) => {
        e.stopPropagation(); // Prevent triggering parent click
        try {
            console.log('📥 Downloading file:', attachment.fileName);
            await onDownloadAndSave(attachment);
        } catch (error) {
            console.error('Error downloading:', error);
            showToast.error('Failed to download file');
        }
    };

    // Handle preview click
    const handlePreviewClick = (e: React.MouseEvent, attachment: any) => {
        e.stopPropagation();
        handlePreview(attachment);
    };

    // Get file type label
    const getFileTypeLabel = (fileName: string, fileType: string): string => {
        const extension = fileName?.split('.').pop()?.toLowerCase() || '';

        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension) || fileType?.includes('image')) {
            return 'Image';
        }
        if (['pdf'].includes(extension) || fileType?.includes('pdf')) {
            return 'PDF';
        }
        if (['xls', 'xlsx', 'csv'].includes(extension) || fileType?.includes('excel')) {
            return 'Spreadsheet';
        }
        if (['doc', 'docx', 'txt'].includes(extension) || fileType?.includes('word')) {
            return 'Document';
        }
        if (['mp4', 'webm', 'avi', 'mov'].includes(extension) || fileType?.includes('video')) {
            return 'Video';
        }
        return 'File';
    };

    return (
        <>
            <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Paperclip className="h-4 w-4" />
                        Attachments
                        {attachments.length > 0 && (
                            <Badge variant="secondary" className="ml-1">
                                {attachments.length}
                            </Badge>
                        )}
                    </h4>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingFiles}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                        <Upload className="h-4 w-4 mr-1" />
                        {uploadingFiles ? 'Uploading...' : 'Upload'}
                    </Button>
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

                {loading ? (
                    <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                        <span className="ml-2 text-sm text-gray-500">Loading attachments...</span>
                    </div>
                ) : attachments.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
                        {attachments.map((attachment) => {
                            const isImage = isImageFile(attachment.fileName, attachment.fileType);
                            const fileColor = getFileColor(attachment.fileType, attachment.fileName);
                            const fileTypeLabel = getFileTypeLabel(attachment.fileName, attachment.fileType);

                            return (
                                <div
                                    key={attachment.id}
                                    className={`group relative border rounded-lg p-3 transition-all cursor-pointer ${fileColor}`}
                                    onClick={() => isImage ? handlePreview(attachment) : handleDownloadClick(event as any, attachment)}
                                >
                                    <div className="flex flex-col items-center text-center">
                                        <div className="mb-2">
                                            {getFileIcon(attachment.fileType, attachment.fileName)}
                                        </div>
                                        <p className="text-xs font-medium text-gray-700 truncate w-full" title={attachment.fileName}>
                                            {attachment.fileName}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">
                                            {formatFileSize(attachment.fileSize)}
                                        </p>
                                        <Badge variant="outline" className="text-[8px] px-1 py-0 mt-1 bg-white/50">
                                            {fileTypeLabel}
                                        </Badge>
                                    </div>

                                    {/* Hover actions */}
                                    <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {isImage && (
                                            <button
                                                onClick={(e) => handlePreviewClick(e, attachment)}
                                                className="p-1 bg-white rounded-full shadow-md hover:bg-gray-50"
                                                title="Preview"
                                            >
                                                <Eye size={12} className="text-blue-500" />
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => handleDownloadClick(e, attachment)}
                                            className="p-1 bg-white rounded-full shadow-md hover:bg-gray-50"
                                            title="Download"
                                        >
                                            <Download size={12} className="text-gray-600" />
                                        </button>
                                    </div>

                                    {/* File type indicator */}
                                    {isImage && (
                                        <div className="absolute bottom-1 right-1">
                                            <Badge variant="outline" className="text-[8px] px-1 py-0 bg-white/80">
                                                🖼️
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                        <Paperclip className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">No attachments</p>
                        <p className="text-xs text-gray-300">Upload receipts, invoices, or supporting documents</p>
                    </div>
                )}
            </div>

            {/* Image Preview Modal */}
            <Dialog open={isPreviewOpen} onOpenChange={handlePreviewClose}>
                <DialogContent className="max-w-3xl max-h-[90vh]">
                    <DialogHeader className="flex flex-row items-center justify-between">
                        <DialogTitle className="text-sm font-medium text-gray-700 truncate max-w-xs">
                            {previewAttachment?.fileName || 'Preview'}
                        </DialogTitle>
                        <div className="flex items-center gap-2">
                            {previewAttachment && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onDownloadAndSave(previewAttachment)}
                                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                >
                                    <Download className="h-4 w-4 mr-1" />
                                    Download
                                </Button>
                            )}
                            <DialogClose asChild>
                                <Button variant="ghost" size="sm" onClick={handlePreviewClose}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </DialogClose>
                        </div>
                    </DialogHeader>
                    <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg min-h-[300px]">
                        {isLoadingPreview ? (
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                                <p className="text-sm text-gray-500">Loading preview...</p>
                            </div>
                        ) : previewError ? (
                            <div className="flex flex-col items-center gap-3 text-red-500">
                                <AlertCircle className="h-16 w-16" />
                                <p className="text-sm">{previewError}</p>
                                {previewAttachment && (
                                    <Button
                                        variant="outline"
                                        onClick={() => onDownloadAndSave(previewAttachment)}
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download File Instead
                                    </Button>
                                )}
                            </div>
                        ) : previewImage ? (
                            <img
                                src={previewImage}
                                alt={previewAttachment?.fileName || 'Preview'}
                                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                                onError={() => {
                                    setPreviewError('Failed to display image');
                                    setIsLoadingPreview(false);
                                }}
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-3 text-gray-400">
                                <Image className="h-16 w-16" />
                                <p className="text-sm">No preview available</p>
                                {previewAttachment && (
                                    <Button
                                        variant="outline"
                                        onClick={() => onDownloadAndSave(previewAttachment)}
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download File
                                    </Button>
                                )}
                            </div>
                        )}
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