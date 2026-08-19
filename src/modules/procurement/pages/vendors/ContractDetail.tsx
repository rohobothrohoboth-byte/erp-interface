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
    Clock,
    CheckCircle,
    AlertCircle,
    Loader2,
    Download,
    Paperclip,
    Eye,
    X,
    File,
    Image,
    FileArchive,
    FileSpreadsheet,
    RefreshCw,
    XCircle,
    TrendingUp,
    ZoomIn,
    ZoomOut,
    RotateCw,
    Maximize2,
    Minimize2
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { showToast } from '@/shared/layout/layout';
import {
    getVendorContractById,
    deleteVendorContract
} from '@/modules/procurement/services/vendorContract.api';
import type { VendorContract } from '@/modules/procurement/services/vendorContract.api';
import { getFilesByReference, downloadFile } from '@/modules/file/services/fileManagement/fileManagementApi';

// ============================================================
// STATUS CONFIGURATIONS
// ============================================================

const typeColors: Record<string, string> = {
    Service: 'bg-blue-100 text-blue-800 border-blue-200',
    Supply: 'bg-green-100 text-green-800 border-green-200',
    Maintenance: 'bg-purple-100 text-purple-800 border-purple-200',
    Consulting: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

const statusColors: Record<string, string> = {
    Active: 'bg-green-100 text-green-800 border-green-200',
    Expired: 'bg-red-100 text-red-800 border-red-200',
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Terminated: 'bg-gray-100 text-gray-800 border-gray-200',
    Renewal: 'bg-blue-100 text-blue-800 border-blue-200',
};

const statusIcons: Record<string, React.ReactNode> = {
    Active: <CheckCircle className="w-4 h-4" />,
    Expired: <AlertCircle className="w-4 h-4" />,
    Pending: <Clock className="w-4 h-4" />,
    Terminated: <XCircle className="w-4 h-4" />,
    Renewal: <Clock className="w-4 h-4" />,
};

// ============================================================
// INFO ITEM COMPONENT
// ============================================================

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
// FILE PREVIEW MODAL COMPONENT
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
                        {isImage && (
                            <>
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
                            </>
                        )}
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
// FILE ATTACHMENT COMPONENT WITH PREVIEW
// ============================================================

const FileAttachment: React.FC<{ file: any; onDownload: (file: any) => void }> = ({ file, onDownload }) => {
    const [isDownloading, setIsDownloading] = useState(false);
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
                    <p className="text-sm font-medium text-gray-900 truncate">
                        {file.fileName || file.name || 'Unnamed'}
                    </p>
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
                        {file.uploadedAt && (
                            <span className="text-xs text-gray-400">
                                Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}
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
                                setShowPreview(true);
                            }}
                            title="Preview file"
                        >
                            <Eye className="w-4 h-4" />
                        </Button>
                    )}
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

const ContractDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    // State
    const [contract, setContract] = useState<VendorContract | null>(null);
    const [attachments, setAttachments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingAttachments, setLoadingAttachments] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Fetch contract and attachments
    const fetchContract = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        try {
            const data = await getVendorContractById(id);
            setContract(data);
            console.log('✅ Contract loaded:', data);

            // Fetch attachments
            setLoadingAttachments(true);
            try {
                const attachResponse = await getFilesByReference('vendor_contract', data.id);
                const attachData = attachResponse?.data?.data || attachResponse?.data || [];
                setAttachments(attachData);
                console.log('📎 Attachments loaded:', attachData);
            } catch (error) {
                console.error('Error fetching attachments:', error);
                setAttachments([]);
            } finally {
                setLoadingAttachments(false);
            }
        } catch (error: any) {
            console.error('Error fetching contract:', error);
            showToast.error(error?.response?.data?.message || 'Failed to load contract');
            navigate('/procurement/vendor-contracts');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchContract();
    }, [fetchContract]);

    // Handle delete
    const handleDelete = async () => {
        if (!contract) return;
        if (!confirm(`Are you sure you want to delete contract ${contract.contractNumber}?`)) return;

        setProcessing(true);
        try {
            await deleteVendorContract(contract.id);
            showToast.success('Contract deleted successfully');
            navigate('/procurement/vendor-contracts');
        } catch (error: any) {
            console.error('Error deleting contract:', error);
            showToast.error(error?.response?.data?.message || 'Failed to delete contract');
        } finally {
            setProcessing(false);
        }
    };

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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'ETB',
            minimumFractionDigits: 2,
        }).format(amount || 0);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const getDaysRemaining = (endDate: string) => {
        const end = new Date(endDate);
        const now = new Date();
        const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading contract...</p>
                </div>
            </div>
        );
    }

    if (!contract) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Contract not found</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/procurement/vendor-contracts')}>
                    Back to Contracts
                </Button>
            </div>
        );
    }

    const daysRemaining = getDaysRemaining(contract.endDate);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/procurement/vendor-contracts')} className="flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            {contract.contractNumber}
                            <Badge className={typeColors[contract.type]}>
                                {contract.type}
                            </Badge>
                            <Badge className={`${statusColors[contract.status]} flex items-center gap-1`}>
                                {statusIcons[contract.status]}
                                {contract.status}
                            </Badge>
                        </h1>
                        <p className="text-sm text-gray-500">{contract.title}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600" disabled={processing}>
                        {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1" />}
                        Delete
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                            <DollarSign className="w-3 h-3" />
                            Contract Value
                        </p>
                        <p className="text-xl font-bold text-emerald-600">{formatCurrency(contract.value)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                            <Building2 className="w-3 h-3" />
                            Vendor
                        </p>
                        <p className="text-lg font-medium text-gray-900">{contract.vendorName}</p>
                        <p className="text-xs text-gray-400">{contract.vendorCode}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            Duration
                        </p>
                        <p className="text-lg font-medium text-gray-900">
                            {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                        </p>
                        {contract.status === 'Active' && (
                            <p className={`text-xs ${daysRemaining < 30 ? 'text-red-600' : daysRemaining < 90 ? 'text-yellow-600' : 'text-gray-400'}`}>
                                {daysRemaining} days remaining
                            </p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                            <FileText className="w-3 h-3" />
                            Attachments
                        </p>
                        <p className="text-lg font-medium text-gray-900">{attachments.length} files</p>
                        {contract.autoRenew && (
                            <p className="text-xs text-blue-600 flex items-center gap-1">
                                <RefreshCw className="w-3 h-3" />
                                Auto-renew enabled
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <InfoItem label="Contract Number" value={contract.contractNumber} icon={<FileText className="w-3.5 h-3.5" />} />
                <InfoItem label="Contract Type" value={contract.type} icon={<FileText className="w-3.5 h-3.5" />} />
                <InfoItem label="Status" value={contract.status} icon={<Clock className="w-3.5 h-3.5" />} />
                <InfoItem label="Start Date" value={formatDate(contract.startDate)} icon={<Calendar className="w-3.5 h-3.5" />} />
                <InfoItem label="End Date" value={formatDate(contract.endDate)} icon={<Calendar className="w-3.5 h-3.5" />} />
                <InfoItem label="Value" value={formatCurrency(contract.value)} icon={<DollarSign className="w-3.5 h-3.5" />} />
                {contract.renewalDate && (
                    <InfoItem label="Renewal Date" value={formatDate(contract.renewalDate)} icon={<RefreshCw className="w-3.5 h-3.5" />} />
                )}
                {contract.signedDate && (
                    <InfoItem label="Signed Date" value={formatDate(contract.signedDate)} icon={<CheckCircle className="w-3.5 h-3.5" />} />
                )}
                <InfoItem label="Auto Renew" value={contract.autoRenew ? 'Yes' : 'No'} icon={<RefreshCw className="w-3.5 h-3.5" />} />
            </div>

            {/* Terms */}
            {contract.terms && contract.terms.length > 0 && (
                <Card>
                    <CardContent className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                            Contract Terms
                        </h3>
                        <ul className="space-y-1">
                            {contract.terms.map((term, index) => (
                                <li key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                                    <span className="text-emerald-500 font-bold mt-0.5">•</span>
                                    <span className="text-sm text-gray-700">{term}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* Notes */}
            {contract.notes && (
                <Card>
                    <CardContent className="p-6">
                        <p className="text-xs text-gray-500 font-medium mb-1">Notes</p>
                        <p className="text-sm text-gray-700">{contract.notes}</p>
                    </CardContent>
                </Card>
            )}

            {/* Attachments with Preview */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Paperclip className="w-5 h-5 text-gray-500" />
                        <h3 className="font-semibold text-gray-900">Attachments</h3>
                        <Badge variant="outline">{attachments.length} files</Badge>
                    </div>

                    {loadingAttachments ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                            <span className="ml-2 text-sm text-gray-500">Loading attachments...</span>
                        </div>
                    ) : attachments.length === 0 ? (
                        <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                            <Paperclip className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No attachments</p>
                            <p className="text-xs text-gray-400">This contract has no attached files</p>
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
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default ContractDetail;