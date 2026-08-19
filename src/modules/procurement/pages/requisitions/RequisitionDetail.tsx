// src/pages/procurement/requisitions/RequisitionDetail.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Edit,
    Trash2,
    FileText,
    Calendar,
    DollarSign,
    Building2,
    User,
    Hash,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Send,
    FileCheck,
    Loader2,
    Download,
    Printer,
    Paperclip,
    Eye,
    MoreVertical,
    ChevronDown,
    ChevronUp,
    Package,
    Image,
    File,
    FileArchive,
    FileSpreadsheet,
    ExternalLink,
    Copy,
    Check,
    ZoomIn,
    ZoomOut,
    RotateCw,
    X,
    Maximize2,
    Minimize2
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { showToast } from '@/shared/layout/layout';
import {
    getRequisitionById,
    deleteRequisition,
    submitRequisition,
    approveRequisition,
    rejectRequisition,
    createPurchaseOrderFromRequisition
} from '@/modules/procurement/services/requisition.api';
import { getFilesByReference, downloadFile } from '@/modules/file/services/fileManagement/fileManagementApi';
import type { Requisition } from '@/modules/procurement/types/requisition.types';

// ============================================================
// STATUS CONFIGURATIONS
// ============================================================

const statusColors: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-800 border-gray-200',
    Submitted: 'bg-blue-100 text-blue-800 border-blue-200',
    UnderReview: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Approved: 'bg-green-100 text-green-800 border-green-200',
    Rejected: 'bg-red-100 text-red-800 border-red-200',
    Purchased: 'bg-purple-100 text-purple-800 border-purple-200',
};

const statusIcons: Record<string, React.ReactNode> = {
    Draft: <Clock className="w-4 h-4" />,
    Submitted: <Send className="w-4 h-4" />,
    UnderReview: <AlertCircle className="w-4 h-4" />,
    Approved: <CheckCircle className="w-4 h-4" />,
    Rejected: <XCircle className="w-4 h-4" />,
    Purchased: <FileCheck className="w-4 h-4" />,
};

const statusLabels: Record<string, string> = {
    Draft: 'Draft',
    Submitted: 'Submitted',
    UnderReview: 'Under Review',
    Approved: 'Approved',
    Rejected: 'Rejected',
    Purchased: 'Purchased',
};

const priorityColors: Record<string, string> = {
    Urgent: 'bg-red-100 text-red-800 border-red-200',
    High: 'bg-orange-100 text-orange-800 border-orange-200',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Low: 'bg-blue-100 text-blue-800 border-blue-200',
};

const statusOrder = ['Draft', 'Submitted', 'UnderReview', 'Approved', 'Purchased', 'Rejected'];

// ============================================================
// SUB-COMPONENTS
// ============================================================

const StatusTimeline: React.FC<{ currentStatus: string }> = ({ currentStatus }) => {
    const currentIndex = statusOrder.indexOf(currentStatus);

    return (
        <div className="flex items-center gap-2 py-4 overflow-x-auto">
            {statusOrder.map((status, index) => {
                const isCompleted = currentIndex >= index && currentStatus !== 'Rejected';
                const isCurrent = status === currentStatus;
                const isRejected = currentStatus === 'Rejected';

                return (
                    <React.Fragment key={status}>
                        <div className="flex flex-col items-center gap-1 min-w-[80px]">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                    isRejected && status === 'Rejected'
                                        ? 'bg-red-100 text-red-600 border-2 border-red-400'
                                        : isCompleted
                                            ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-400'
                                            : 'bg-gray-100 text-gray-300 border-2 border-gray-200'
                                } ${isCurrent ? 'ring-2 ring-emerald-400 ring-offset-2' : ''}`}
                            >
                                {isRejected && status === 'Rejected' ? (
                                    <XCircle className="w-5 h-5" />
                                ) : isCompleted ? (
                                    <CheckCircle className="w-5 h-5" />
                                ) : (
                                    <Clock className="w-5 h-5" />
                                )}
                            </div>
                            <span
                                className={`text-xs text-center ${
                                    isRejected && status === 'Rejected'
                                        ? 'text-red-600 font-medium'
                                        : isCompleted
                                            ? 'text-gray-700 font-medium'
                                            : 'text-gray-400'
                                }`}
                            >
                                {statusLabels[status]}
                            </span>
                        </div>
                        {index < statusOrder.length - 1 && (
                            <div
                                className={`flex-1 h-0.5 ${
                                    isRejected && status === 'Rejected'
                                        ? 'bg-red-400'
                                        : isCompleted
                                            ? 'bg-emerald-400'
                                            : 'bg-gray-200'
                                }`}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

const InfoItem: React.FC<{ label: string; value: React.ReactNode; icon?: React.ReactNode }> = ({
                                                                                                   label,
                                                                                                   value,
                                                                                                   icon
                                                                                               }) => (
    <div className="space-y-1">
        <p className="text-xs text-gray-500 flex items-center gap-1.5">
            {icon}
            {label}
        </p>
        <p className="font-medium text-gray-900">{value || 'N/A'}</p>
    </div>
);

// ============================================================
// FILE PREVIEW COMPONENT
// ============================================================

const FilePreviewModal: React.FC<{
    file: any;
    isOpen: boolean;
    onClose: () => void;
    onDownload: () => void;
}> = ({ file, isOpen, onClose, onDownload }) => {
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && file) {
            loadPreview();
        }
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [isOpen, file]);

    const loadPreview = async () => {
        setLoading(true);
        setError(null);
        try {
            const fileId = file.id || file.fileId;
            const blob = await downloadFile(fileId);
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
        } catch (err) {
            setError('Failed to load preview');
            console.error('Preview error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.25));
    const handleRotate = () => setRotation(prev => (prev + 90) % 360);

    const isImage = file?.fileType?.startsWith('image/') || file?.type?.startsWith('image/');
    const isPDF = file?.fileType === 'application/pdf' || file?.type === 'application/pdf';

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex-shrink-0">
                            {isImage ? (
                                <Image className="w-5 h-5 text-purple-500" />
                            ) : isPDF ? (
                                <FileText className="w-5 h-5 text-red-500" />
                            ) : (
                                <File className="w-5 h-5 text-gray-500" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {file?.fileName || file?.name || 'Untitled'}
                            </p>
                            <p className="text-xs text-gray-500">
                                {isImage ? 'Image' : isPDF ? 'PDF Document' : 'File'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={handleZoomOut}
                            title="Zoom Out"
                        >
                            <ZoomOut className="w-4 h-4" />
                        </Button>
                        <span className="text-xs text-gray-500 w-12 text-center">
                            {Math.round(zoom * 100)}%
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={handleZoomIn}
                            title="Zoom In"
                        >
                            <ZoomIn className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={handleRotate}
                            title="Rotate"
                        >
                            <RotateCw className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                        >
                            {isFullscreen ? (
                                <Minimize2 className="w-4 h-4" />
                            ) : (
                                <Maximize2 className="w-4 h-4" />
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-blue-500"
                            onClick={onDownload}
                            title="Download"
                        >
                            <Download className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500"
                            onClick={onClose}
                            title="Close"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className={`flex-1 overflow-auto p-4 bg-gray-100 ${isFullscreen ? 'h-[90vh]' : 'max-h-[70vh]'}`}>
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
                                <p className="mt-4 text-gray-500">Loading preview...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                                <p className="mt-4 text-red-500">{error}</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                    onClick={loadPreview}
                                >
                                    Retry
                                </Button>
                            </div>
                        </div>
                    ) : isImage && previewUrl ? (
                        <div
                            className="flex items-center justify-center h-full"
                            style={{
                                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                                transition: 'transform 0.2s ease'
                            }}
                        >
                            <img
                                src={previewUrl}
                                alt={file?.fileName || 'Preview'}
                                className="max-h-full max-w-full object-contain shadow-lg rounded"
                            />
                        </div>
                    ) : isPDF && previewUrl ? (
                        <iframe
                            src={`${previewUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                            className="w-full h-full min-h-[600px] rounded shadow-lg"
                            title={file?.fileName || 'PDF Preview'}
                            style={{
                                transform: `scale(${zoom})`,
                                transformOrigin: 'top left',
                                transition: 'transform 0.2s ease'
                            }}
                        />
                    ) : previewUrl ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <File className="w-16 h-16 text-gray-400 mx-auto" />
                                <p className="mt-2 text-gray-500">Preview not available for this file type</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-4"
                                    onClick={onDownload}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download to view
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">No preview available</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ============================================================
// FILE ATTACHMENT COMPONENT
// ============================================================

const FileAttachment: React.FC<{ file: any; onDownload: (file: any) => void }> = ({ file, onDownload }) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const getFileIcon = (type: string) => {
        if (type?.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
        if (type?.includes('image')) return <Image className="w-5 h-5 text-purple-500" />;
        if (type?.includes('word')) return <FileText className="w-5 h-5 text-blue-500" />;
        if (type?.includes('excel')) return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
        if (type?.includes('zip') || type?.includes('rar')) return <FileArchive className="w-5 h-5 text-orange-500" />;
        return <File className="w-5 h-5 text-gray-500" />;
    };

    const getFileColor = (type: string) => {
        if (type?.includes('pdf')) return 'border-red-200 bg-red-50';
        if (type?.includes('image')) return 'border-purple-200 bg-purple-50';
        if (type?.includes('word')) return 'border-blue-200 bg-blue-50';
        if (type?.includes('excel')) return 'border-green-200 bg-green-50';
        if (type?.includes('zip') || type?.includes('rar')) return 'border-orange-200 bg-orange-50';
        return 'border-gray-200 bg-gray-50';
    };

    const formatFileSize = (bytes: number) => {
        if (!bytes) return 'Unknown size';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const isPreviewable = (type: string) => {
        return type?.includes('image/') ||
            type === 'application/pdf' ||
            type?.includes('text/');
    };

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            await onDownload(file);
        } finally {
            setIsDownloading(false);
        }
    };

    const handlePreview = () => {
        if (isPreviewable(file.fileType || file.type)) {
            setShowPreview(true);
        } else {
            handleDownload();
        }
    };

    const copyFileName = () => {
        navigator.clipboard.writeText(file.fileName || file.name || 'Unnamed');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <div
                className={`flex items-center gap-3 p-3 rounded-lg border ${getFileColor(file.fileType || file.type)} transition-all hover:shadow-md cursor-pointer`}
                onClick={handlePreview}
            >
                <div className="flex-shrink-0">
                    {getFileIcon(file.fileType || file.type)}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {file.fileName || file.name || 'Unnamed'}
                        </p>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                copyFileName();
                            }}
                            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                            title="Copy file name"
                        >
                            {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                        <p className="text-xs text-gray-400">
                            {formatFileSize(file.fileSize || file.size)}
                        </p>
                        {file.fileType && (
                            <Badge variant="outline" className="text-[10px]">
                                {file.fileType.split('/').pop()?.toUpperCase() || 'Unknown'}
                            </Badge>
                        )}
                        {isPreviewable(file.fileType || file.type) && (
                            <span className="text-xs text-blue-500 flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                Click to preview
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDownload();
                        }}
                        disabled={isDownloading}
                        title="Download file"
                    >
                        {isDownloading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4" />
                        )}
                    </Button>
                    {isPreviewable(file.fileType || file.type) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-purple-500 hover:text-purple-700"
                            onClick={(e) => {
                                e.stopPropagation();
                                handlePreview();
                            }}
                            title="Preview file"
                        >
                            <Eye className="w-4 h-4" />
                        </Button>
                    )}
                    {file.downloadUrl || file.url ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-purple-500 hover:text-purple-700"
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(file.downloadUrl || file.url, '_blank');
                            }}
                            title="Open in new tab"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </Button>
                    ) : null}
                </div>
            </div>

            {/* Preview Modal */}
            <FilePreviewModal
                file={file}
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                onDownload={handleDownload}
            />
        </>
    );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const RequisitionDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    // State
    const [requisition, setRequisition] = useState<Requisition | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [attachments, setAttachments] = useState<any[]>([]);
    const [showAttachments, setShowAttachments] = useState(true);

    // Fetch requisition
    const fetchRequisition = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        try {
            const response = await getRequisitionById(id);
            const data = response?.data?.data || response?.data;
            console.log('✅ Requisition loaded:', data);
            setRequisition(data);

            // Fetch attachments
            if (data?.id) {
                try {
                    const attachResponse = await getFilesByReference('requisition', data.id);
                    const attachData = attachResponse?.data?.data || attachResponse?.data || [];
                    console.log('📎 Attachments loaded:', attachData);
                    setAttachments(attachData);
                } catch (error) {
                    console.error('Error fetching attachments:', error);
                    setAttachments([]);
                }
            }
        } catch (error: any) {
            console.error('Error fetching requisition:', error);
            showToast.error(error?.response?.data?.message || 'Failed to load requisition');
            navigate('/procurement/requisitions');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchRequisition();
    }, [fetchRequisition]);

    // Handle file download
    const handleFileDownload = async (file: any) => {
        try {
            const fileId = file.id || file.fileId;
            if (!fileId) {
                showToast.error('File ID not found');
                return;
            }

            const blob = await downloadFile(fileId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = file.fileName || file.name || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            showToast.success(`Downloaded: ${file.fileName || file.name}`);
        } catch (error) {
            console.error('Error downloading file:', error);
            showToast.error('Failed to download file');
        }
    };

    // Handlers
    const handleDelete = async () => {
        if (!requisition) return;
        if (!confirm(`Are you sure you want to delete requisition ${requisition.requisitionNumber}?`)) return;

        setProcessing(true);
        try {
            await deleteRequisition(requisition.id);
            showToast.success('Requisition deleted successfully');
            navigate('/procurement/requisitions');
        } catch (error: any) {
            console.error('Error deleting:', error);
            showToast.error(error?.response?.data?.message || 'Failed to delete requisition');
        } finally {
            setProcessing(false);
        }
    };

    const handleSubmit = async () => {
        if (!requisition) return;

        setProcessing(true);
        try {
            await submitRequisition(requisition.id);
            showToast.success('Requisition submitted for approval');
            fetchRequisition();
        } catch (error: any) {
            console.error('Error submitting:', error);
            showToast.error(error?.response?.data?.message || 'Failed to submit requisition');
        } finally {
            setProcessing(false);
        }
    };

    const handleApprove = async () => {
        if (!requisition) return;

        setProcessing(true);
        try {
            await approveRequisition(requisition.id, { comments: 'Approved' });
            showToast.success('Requisition approved successfully');
            fetchRequisition();
        } catch (error: any) {
            console.error('Error approving:', error);
            showToast.error(error?.response?.data?.message || 'Failed to approve requisition');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!requisition) return;

        const reason = prompt('Enter rejection reason:');
        if (!reason) return;

        setProcessing(true);
        try {
            await rejectRequisition(requisition.id, { rejectionReason: reason });
            showToast.success('Requisition rejected');
            fetchRequisition();
        } catch (error: any) {
            console.error('Error rejecting:', error);
            showToast.error(error?.response?.data?.message || 'Failed to reject requisition');
        } finally {
            setProcessing(false);
        }
    };

    const handleCreatePO = async () => {
        if (!requisition) return;

        setProcessing(true);
        try {
            const response = await createPurchaseOrderFromRequisition(requisition.id);
            const poData = response?.data?.data || response?.data;
            showToast.success('Purchase order created successfully');
            navigate(`/procurement/po/${poData.id}`);
        } catch (error: any) {
            console.error('Error creating PO:', error);
            showToast.error(error?.response?.data?.message || 'Failed to create purchase order');
        } finally {
            setProcessing(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount || 0);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading requisition...</p>
                </div>
            </div>
        );
    }

    if (!requisition) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Requisition not found</p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate('/procurement/requisitions')}
                >
                    Back to Requisitions
                </Button>
            </div>
        );
    }

    const isEditable = requisition.status === 'Draft';
    const isSubmittable = requisition.status === 'Draft';
    const isApprovable = requisition.status === 'Submitted' || requisition.status === 'UnderReview';
    const isRejectable = requisition.status === 'Submitted' || requisition.status === 'UnderReview';
    const isPurchasable = requisition.status === 'Approved';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/procurement/requisitions')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            {requisition.requisitionNumber}
                            <Badge className={statusColors[requisition.status] || 'bg-gray-100'}>
                                {statusIcons[requisition.status]}
                                <span className="ml-1">{statusLabels[requisition.status] || requisition.status}</span>
                            </Badge>
                        </h1>
                        <p className="text-sm text-gray-500">{requisition.title}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrint}
                        className="flex items-center gap-1.5"
                    >
                        <Printer className="w-4 h-4" />
                        Print
                    </Button>
                    {isEditable && (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/procurement/requisitions/${requisition.id}/edit`)}
                                className="flex items-center gap-1.5 text-blue-600"
                                disabled={processing}
                            >
                                <Edit className="w-4 h-4" />
                                Edit
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDelete}
                                className="flex items-center gap-1.5 text-red-500"
                                disabled={processing}
                            >
                                {processing ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4" />
                                )}
                            </Button>
                        </>
                    )}
                    {isSubmittable && (
                        <Button
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={handleSubmit}
                            disabled={processing}
                        >
                            {processing ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4 mr-2" />
                            )}
                            Submit
                        </Button>
                    )}
                    {isApprovable && (
                        <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={handleApprove}
                            disabled={processing}
                        >
                            {processing ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                            Approve
                        </Button>
                    )}
                    {isRejectable && (
                        <Button
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={handleReject}
                            disabled={processing}
                        >
                            {processing ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <XCircle className="w-4 h-4 mr-2" />
                            )}
                            Reject
                        </Button>
                    )}
                    {isPurchasable && (
                        <Button
                            className="bg-purple-600 hover:bg-purple-700"
                            onClick={handleCreatePO}
                            disabled={processing}
                        >
                            {processing ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Package className="w-4 h-4 mr-2" />
                            )}
                            Create PO
                        </Button>
                    )}
                </div>
            </div>

            {/* Status Timeline */}
            <Card>
                <CardContent className="p-6">
                    <StatusTimeline currentStatus={requisition.status} />
                </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                            <DollarSign className="w-3 h-3" />
                            Total Amount
                        </p>
                        <p className="text-xl font-bold text-emerald-600">
                            {formatCurrency(requisition.totalAmount)}
                        </p>
                        <p className="text-xs text-gray-400">{requisition.lines?.length || 0} items</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                            <Building2 className="w-3 h-3" />
                            Department
                        </p>
                        <p className="text-lg font-medium text-gray-900">
                            {requisition.departmentName || 'N/A'}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                            <User className="w-3 h-3" />
                            Requester
                        </p>
                        <p className="text-lg font-medium text-gray-900">
                            {requisition.requesterName || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-400">
                            {formatDate(requisition.submittedDate)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            Required Date
                        </p>
                        <p className="text-lg font-medium text-gray-900">
                            {formatDate(requisition.requiredDate)}
                        </p>
                        <Badge className={priorityColors[requisition.priority] || 'bg-gray-100'}>
                            {requisition.priority || 'Medium'}
                        </Badge>
                    </CardContent>
                </Card>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <InfoItem
                    label="Requisition Number"
                    value={requisition.requisitionNumber}
                    icon={<Hash className="w-3.5 h-3.5" />}
                />
                <InfoItem
                    label="Budget Code"
                    value={requisition.budgetCode || 'N/A'}
                    icon={<Hash className="w-3.5 h-3.5" />}
                />
                <InfoItem
                    label="Priority"
                    value={
                        <Badge className={priorityColors[requisition.priority] || 'bg-gray-100'}>
                            {requisition.priority || 'Medium'}
                        </Badge>
                    }
                    icon={<AlertCircle className="w-3.5 h-3.5" />}
                />
                <InfoItem
                    label="Created By"
                    value={requisition.createdByUserName || 'System'}
                    icon={<User className="w-3.5 h-3.5" />}
                />
                <InfoItem
                    label="Created Date"
                    value={formatDate(requisition.dateAdd)}
                    icon={<Calendar className="w-3.5 h-3.5" />}
                />
                <InfoItem
                    label="Last Modified"
                    value={requisition.dateMod ? formatDate(requisition.dateMod) : 'N/A'}
                    icon={<Clock className="w-3.5 h-3.5" />}
                />
            </div>

            {/* Description */}
            {requisition.description && (
                <Card>
                    <CardContent className="p-6">
                        <p className="text-xs text-gray-500 font-medium mb-1">Description</p>
                        <p className="text-sm text-gray-700">{requisition.description}</p>
                    </CardContent>
                </Card>
            )}

            {/* Rejection Reason */}
            {requisition.rejectionReason && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-3">
                            <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-red-800">Rejection Reason</p>
                                <p className="text-sm text-red-700 mt-1">{requisition.rejectionReason}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Purchase Order Info */}
            {requisition.purchaseOrderId && (
                <Card className="border-purple-200 bg-purple-50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Package className="w-5 h-5 text-purple-600" />
                                <div>
                                    <p className="text-sm font-semibold text-purple-800">Purchase Order Created</p>
                                    <p className="text-sm text-purple-700">
                                        PO Number: {requisition.purchaseOrderNumber || 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-purple-600"
                                onClick={() => navigate(`/procurement/po/${requisition.purchaseOrderId}`)}
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                View PO
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Line Items */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Line Items</h3>
                        <span className="text-sm text-gray-500">
                            {requisition.lines?.length || 0} items
                        </span>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {requisition.lines?.map((line, index) => (
                                <tr key={line.id || index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-gray-500 text-center">{index + 1}</td>
                                    <td className="px-4 py-3 text-gray-700">
                                        <div>
                                            <span>{line.description}</span>
                                            {line.unitOfMeasure && (
                                                <span className="text-xs text-gray-400 ml-2">({line.unitOfMeasure})</span>
                                            )}
                                            {line.notes && (
                                                <p className="text-xs text-gray-400 mt-0.5">{line.notes}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium">{line.quantity}</td>
                                    <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(line.unitPrice)}</td>
                                    <td className="px-4 py-3 text-right font-medium text-emerald-600">{formatCurrency(line.totalAmount)}</td>
                                </tr>
                            ))}
                            </tbody>
                            <tfoot className="bg-gray-50 font-semibold">
                            <tr>
                                <td colSpan={4} className="px-4 py-3 text-right text-gray-700">Total</td>
                                <td className="px-4 py-3 text-right text-emerald-600 text-lg">{formatCurrency(requisition.totalAmount)}</td>
                            </tr>
                            </tfoot>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* ✅ ATTACHMENTS SECTION WITH PREVIEW */}
            <Card>
                <CardContent className="p-6">
                    <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setShowAttachments(!showAttachments)}
                    >
                        <div className="flex items-center gap-2">
                            <Paperclip className="w-5 h-5 text-gray-500" />
                            <h3 className="font-semibold text-gray-900">Attachments</h3>
                            <Badge variant="outline">{attachments.length} files</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            {attachments.length > 0 && (
                                <span className="text-xs text-gray-400">
                                    {attachments.reduce((sum, f) => sum + (f.fileSize || 0), 0) > 0
                                        ? (attachments.reduce((sum, f) => sum + (f.fileSize || 0), 0) / (1024 * 1024)).toFixed(2) + ' MB total'
                                        : ''}
                                </span>
                            )}
                            {showAttachments ? (
                                <ChevronUp className="w-4 h-4 text-gray-500" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                            )}
                        </div>
                    </div>

                    {showAttachments && (
                        <div className="mt-4">
                            {attachments.length === 0 ? (
                                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                                    <Paperclip className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">No attachments</p>
                                    <p className="text-xs text-gray-400">This requisition has no attached files</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {attachments.map((file, index) => (
                                        <FileAttachment
                                            key={file.id || index}
                                            file={file}
                                            onDownload={handleFileDownload}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Approvals History */}
            {requisition.approvals && requisition.approvals.length > 0 && (
                <Card>
                    <CardContent className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Approval History</h3>
                        <div className="space-y-3">
                            {requisition.approvals.map((approval, index) => (
                                <div
                                    key={approval.id || index}
                                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                                >
                                    <div className="flex-shrink-0">
                                        {approval.status === 'Approved' ? (
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        ) : approval.status === 'Rejected' ? (
                                            <XCircle className="w-5 h-5 text-red-600" />
                                        ) : (
                                            <Clock className="w-5 h-5 text-yellow-600" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-gray-900">
                                                {approval.approverName || 'Unknown Approver'}
                                            </p>
                                            <Badge className={
                                                approval.status === 'Approved'
                                                    ? 'bg-green-100 text-green-700'
                                                    : approval.status === 'Rejected'
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                            }>
                                                {approval.status || 'Pending'}
                                            </Badge>
                                        </div>
                                        {approval.comments && (
                                            <p className="text-sm text-gray-600 mt-1">{approval.comments}</p>
                                        )}
                                        {approval.approvedAt && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                {formatDate(approval.approvedAt)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </motion.div>
    );
};

export default RequisitionDetail;