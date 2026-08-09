// src/pages/procurement/requisitions/EditRequisition.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    FileText,
    Building2,
    Calendar,
    DollarSign,
    Loader2,
    User,
    Hash,
    AlertCircle,
    CheckCircle,
    Upload,
    X,
    Paperclip,
    File,
    Image,
    FileArchive,
    FileSpreadsheet,
    RefreshCw,
    Download
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../components/ui/select';
import { showToast } from '../../../layout/layout';
import { useAuthStore } from '../../../stores/auth.store';
import { useFinancialPeriods } from '../../../hooks/finance/useFinancialPeriods';
import { getDepartments } from '../../../services/finance/finance.api';
import { getRequisitionById, updateRequisition } from '../../../services/procurement/requisition.api';
import { uploadFile, deleteFile, getFilesByReference, downloadFile } from '../../../services/fileManagement/fileManagementApi';
import { Badge } from '../../../components/ui/badge';
import type { RequisitionFormData, RequisitionLine } from '../../../types/procurement/requisition.types';

// ============================================================
// CONSTANTS
// ============================================================

const PRIORITY_OPTIONS = [
    { value: 'Low', label: 'Low', color: 'bg-blue-100 text-blue-700' },
    { value: 'Medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'High', label: 'High', color: 'bg-orange-100 text-orange-700' },
    { value: 'Urgent', label: 'Urgent', color: 'bg-red-100 text-red-700' },
];

const STATUS_OPTIONS = [
    { value: 'Draft', label: 'Draft', color: 'bg-gray-100 text-gray-700' },
    { value: 'Submitted', label: 'Submitted', color: 'bg-blue-100 text-blue-700' },
    { value: 'UnderReview', label: 'Under Review', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'Approved', label: 'Approved', color: 'bg-green-100 text-green-700' },
    { value: 'Rejected', label: 'Rejected', color: 'bg-red-100 text-red-700' },
    { value: 'Purchased', label: 'Purchased', color: 'bg-purple-100 text-purple-700' },
];

const DEFAULT_REQUISITION_LINE: RequisitionLine = {
    description: '',
    quantity: 1,
    unitPrice: 0,
    totalAmount: 0,
    unitOfMeasure: 'Each'
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
];

interface Attachment {
    id: string;
    file?: File;
    name: string;
    size: number;
    type: string;
    uploaded: boolean;
    uploading: boolean;
    error?: string;
    fileId?: string;
    isExisting?: boolean;
}

// ============================================================
// STATUS BADGE HELPER
// ============================================================

const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
        Draft: 'bg-gray-100 text-gray-700 border-gray-200',
        Submitted: 'bg-blue-100 text-blue-700 border-blue-200',
        UnderReview: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        Approved: 'bg-green-100 text-green-700 border-green-200',
        Rejected: 'bg-red-100 text-red-700 border-red-200',
        Purchased: 'bg-purple-100 text-purple-700 border-purple-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const EditRequisition = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { userId, userName, departmentId: authDepartmentId, departmentName: authDepartmentName } = useAuthStore();
    const { periods, loading: periodsLoading, fetchPeriods } = useFinancialPeriods();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [departments, setDepartments] = useState<any[]>([]);
    const [loadingDepartments, setLoadingDepartments] = useState(false);
    const [originalStatus, setOriginalStatus] = useState('');
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [loadingAttachments, setLoadingAttachments] = useState(false);
    const [formData, setFormData] = useState<RequisitionFormData>({
        title: '',
        description: '',
        departmentId: '',
        departmentName: '',
        priority: 'Medium',
        requiredDate: '',
        budgetCode: '',
        periodId: '',
        lines: [{ ...DEFAULT_REQUISITION_LINE }]
    });
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [showErrors, setShowErrors] = useState(false);
    const [rowVersion, setRowVersion] = useState('');

    // Fetch requisition data
    const fetchRequisition = useCallback(async () => {
        if (!id) {
            showToast.error('Requisition ID is required');
            navigate('/procurement/requisitions');
            return;
        }

        setIsLoading(true);
        try {
            const response = await getRequisitionById(id);
            const data = response?.data?.data || response?.data;

            if (!data) {
                showToast.error('Requisition not found');
                navigate('/procurement/requisitions');
                return;
            }

            // Check if editable
            if (data.status !== 'Draft' && data.status !== 'Rejected') {
                showToast.error(`Cannot edit requisition with status '${data.status}'`);
                navigate(`/procurement/requisitions/${id}`);
                return;
            }

            setOriginalStatus(data.status);
            setRowVersion(data.rowVersion || '');

            setFormData({
                title: data.title || '',
                description: data.description || '',
                departmentId: data.departmentId || '',
                departmentName: data.departmentName || '',
                priority: data.priority || 'Medium',
                requiredDate: data.requiredDate?.split('T')[0] || '',
                budgetCode: data.budgetCode || '',
                periodId: data.periodId || '',
                lines: data.lines?.length > 0
                    ? data.lines.map((line: any) => ({
                        id: line.id,
                        description: line.description || '',
                        quantity: line.quantity || 1,
                        unitPrice: line.unitPrice || 0,
                        totalAmount: line.totalAmount || 0,
                        unitOfMeasure: line.unitOfMeasure || 'Each',
                        notes: line.notes || '',
                    }))
                    : [{ ...DEFAULT_REQUISITION_LINE }]
            });

            console.log('✅ Requisition loaded for edit:', data);
        } catch (error: any) {
            console.error('Error fetching requisition:', error);
            showToast.error(error?.response?.data?.message || 'Failed to load requisition');
            navigate('/procurement/requisitions');
        } finally {
            setIsLoading(false);
        }
    }, [id, navigate]);

    // ✅ Fetch existing attachments
    const fetchAttachments = useCallback(async () => {
        if (!id) return;

        setLoadingAttachments(true);
        try {
            const response = await getFilesByReference('requisition', id);
            const files = response?.data?.data || response?.data || [];

            const existingAttachments: Attachment[] = files.map((file: any) => ({
                id: `existing-${file.id}`,
                name: file.fileName || file.name || 'Untitled',
                size: file.fileSize || file.size || 0,
                type: file.contentType || file.type || 'application/octet-stream',
                uploaded: true,
                uploading: false,
                fileId: file.id,
                isExisting: true
            }));

            setAttachments(existingAttachments);
            console.log(`✅ Loaded ${existingAttachments.length} existing attachments`);
        } catch (error) {
            console.error('Error fetching attachments:', error);
            // Don't show error toast for attachments - it's not critical
        } finally {
            setLoadingAttachments(false);
        }
    }, [id]);

    // Fetch departments and periods
    const fetchDepartments = useCallback(async () => {
        setLoadingDepartments(true);
        try {
            const response = await getDepartments();
            const data = response?.data?.data || response?.data || response || [];
            setDepartments(data);
        } catch (error) {
            console.error('Error fetching departments:', error);
            showToast.error('Failed to load departments');
        } finally {
            setLoadingDepartments(false);
        }
    }, []);

    useEffect(() => {
        fetchPeriods({ isClosed: false, isActive: true });
        fetchDepartments();
        fetchRequisition();
        fetchAttachments();
    }, [fetchPeriods, fetchDepartments, fetchRequisition, fetchAttachments]);

    // Auto-fill department from auth if not set
    useEffect(() => {
        if (authDepartmentId && !formData.departmentId) {
            setFormData(prev => ({
                ...prev,
                departmentId: authDepartmentId,
                departmentName: authDepartmentName || ''
            }));
        }
    }, [authDepartmentId, authDepartmentName, formData.departmentId]);

    // ============================================================
    // FILE ATTACHMENT HANDLERS
    // ============================================================

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newAttachments: Attachment[] = [];

        for (const file of Array.from(files)) {
            // Validate file size
            if (file.size > MAX_FILE_SIZE) {
                showToast.error(`${file.name} exceeds 10MB limit`);
                continue;
            }

            // Validate file type
            if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                showToast.error(`${file.name} is not a supported file type`);
                continue;
            }

            newAttachments.push({
                id: `temp-${Date.now()}-${Math.random()}`,
                file,
                name: file.name,
                size: file.size,
                type: file.type,
                uploaded: false,
                uploading: false,
                isExisting: false
            });
        }

        if (newAttachments.length > 0) {
            setAttachments(prev => [...prev, ...newAttachments]);
            showToast.success(`${newAttachments.length} file(s) added for upload`);
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // ✅ Upload new attachments
    const uploadNewAttachments = async (): Promise<string[]> => {
        const uploadedIds: string[] = [];
        const newAttachments = attachments.filter(a => !a.isExisting && !a.uploaded);

        for (const attachment of newAttachments) {
            if (!attachment.file) continue;

            setAttachments(prev =>
                prev.map(a =>
                    a.id === attachment.id ? { ...a, uploading: true } : a
                )
            );

            try {
                const response = await uploadFile({
                    file: attachment.file,
                    module: 'requisition',
                    referenceId: id!,
                    category: 'requisition_attachment',
                    documentType: attachment.file.type.includes('pdf') ? 'PDF' : 'Image',
                    description: `Attachment for requisition: ${formData.title || 'Requisition'}`,
                    isPublic: false,
                    isShared: false,
                    sharingLevel: 'Private'
                });

                const fileData = response?.data || response;
                const fileId = fileData?.id || fileData?.fileId;

                if (fileId) {
                    uploadedIds.push(fileId);
                    setAttachments(prev =>
                        prev.map(a =>
                            a.id === attachment.id
                                ? { ...a, uploaded: true, uploading: false, fileId: fileId, isExisting: true }
                                : a
                        )
                    );
                    console.log('✅ File uploaded:', attachment.file.name, fileId);
                } else {
                    throw new Error('No file ID returned');
                }
            } catch (error: any) {
                console.error('❌ Upload failed:', error);
                const errorMsg = error?.response?.data?.message || 'Failed to upload file';
                setAttachments(prev =>
                    prev.map(a =>
                        a.id === attachment.id
                            ? { ...a, uploading: false, error: errorMsg }
                            : a
                    )
                );
                showToast.error(`Failed to upload ${attachment.file.name}: ${errorMsg}`);
            }
        }

        return uploadedIds;
    };

    // ✅ Remove attachment (existing or new)
    const removeAttachment = async (attachmentId: string) => {
        const attachment = attachments.find(a => a.id === attachmentId);
        if (!attachment) return;

        // If it's an existing file, delete from server
        if (attachment.isExisting && attachment.fileId) {
            try {
                await deleteFile(attachment.fileId, false);
                console.log('✅ File deleted from server:', attachment.fileId);
                showToast.success(`Deleted: ${attachment.name}`);
            } catch (error) {
                console.error('❌ Failed to delete file:', error);
                showToast.error(`Failed to delete ${attachment.name}`);
                return;
            }
        }

        setAttachments(prev => prev.filter(a => a.id !== attachmentId));
    };

    // ✅ Download attachment
    const handleDownload = async (attachment: Attachment) => {
        if (!attachment.fileId) return;

        try {
            const blob = await downloadFile(attachment.fileId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = attachment.name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('❌ Download failed:', error);
            showToast.error('Failed to download file');
        }
    };

    const getFileIcon = (type: string) => {
        if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
        if (type.includes('word')) return <FileText className="w-5 h-5 text-blue-500" />;
        if (type.includes('excel') || type.includes('spreadsheet')) {
            return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
        }
        if (type.includes('image')) return <Image className="w-5 h-5 text-purple-500" />;
        if (type.includes('zip') || type.includes('rar') || type.includes('tar')) {
            return <FileArchive className="w-5 h-5 text-orange-500" />;
        }
        return <File className="w-5 h-5 text-gray-500" />;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Calculate line total
    const calculateLineTotal = (line: RequisitionLine) => {
        return (line.quantity || 0) * (line.unitPrice || 0);
    };

    // Calculate total amount
    const calculateTotal = () => {
        return formData.lines.reduce((sum, line) => sum + calculateLineTotal(line), 0);
    };

    // Update line item
    const updateLine = (index: number, field: keyof RequisitionLine, value: any) => {
        setFormData(prev => {
            const newLines = [...prev.lines];
            newLines[index] = {
                ...newLines[index],
                [field]: value
            };
            if (field === 'quantity' || field === 'unitPrice') {
                newLines[index].totalAmount = (newLines[index].quantity || 0) * (newLines[index].unitPrice || 0);
            }
            return { ...prev, lines: newLines };
        });
    };

    // Add line
    const addLine = () => {
        setFormData(prev => ({
            ...prev,
            lines: [...prev.lines, { ...DEFAULT_REQUISITION_LINE }]
        }));
    };

    // Remove line
    const removeLine = (index: number) => {
        if (formData.lines.length > 1) {
            setFormData(prev => ({
                ...prev,
                lines: prev.lines.filter((_, i) => i !== index)
            }));
        }
    };

    // Validate form
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.title?.trim()) {
            errors.title = 'Requisition title is required';
        }
        if (!formData.departmentId) {
            errors.department = 'Department is required';
        }
        if (!formData.requiredDate) {
            errors.requiredDate = 'Required date is required';
        }
        if (!formData.periodId) {
            errors.period = 'Financial period is required';
        }
        if (formData.lines.length === 0) {
            errors.lines = 'At least one line item is required';
        }
        formData.lines.forEach((line, index) => {
            if (!line.description?.trim()) {
                errors[`line_${index}_description`] = `Line ${index + 1}: Description is required`;
            }
            if (line.quantity <= 0) {
                errors[`line_${index}_quantity`] = `Line ${index + 1}: Quantity must be greater than 0`;
            }
            if (line.unitPrice < 0) {
                errors[`line_${index}_unitPrice`] = `Line ${index + 1}: Unit price cannot be negative`;
            }
        });

        setValidationErrors(errors);
        setShowErrors(true);
        return Object.keys(errors).length === 0;
    };

    // Submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            const firstError = Object.values(validationErrors)[0];
            if (firstError) showToast.error(firstError);
            return;
        }

        // Check if any attachments are still uploading
        const uploadingAttachments = attachments.filter(a => a.uploading);
        if (uploadingAttachments.length > 0) {
            showToast.error('Please wait for all files to finish uploading');
            return;
        }

        setIsSaving(true);
        let uploadedIds: string[] = [];

        try {
            // ✅ Upload any new attachments first
            const newAttachments = attachments.filter(a => !a.isExisting && !a.uploaded);
            if (newAttachments.length > 0) {
                showToast.info(`Uploading ${newAttachments.length} file(s)...`);
                uploadedIds = await uploadNewAttachments();
            }

            // ✅ Get all attachment IDs (existing + newly uploaded)
            const allAttachmentIds = attachments
                .filter(a => a.isExisting && a.fileId)
                .map(a => a.fileId!)
                .concat(uploadedIds)
                .filter(id => id);

            const totalAmount = calculateTotal();

            const payload = {
                id: id!,
                title: formData.title,
                description: formData.description || '',
                departmentId: formData.departmentId,
                departmentName: formData.departmentName || '',
                priority: formData.priority,
                requiredDate: new Date(formData.requiredDate).toISOString(),
                budgetCode: formData.budgetCode || '',
                periodId: formData.periodId,
                rowVersion: rowVersion,
                updatedByUserId: userId || null,
                updatedByUserName: userName || null,
                // ✅ Include attachment IDs
                attachmentIds: allAttachmentIds,
                lines: formData.lines.map(line => ({
                    id: line.id,
                    description: line.description,
                    quantity: line.quantity,
                    unitPrice: line.unitPrice,
                    totalAmount: line.quantity * line.unitPrice,
                    unitOfMeasure: line.unitOfMeasure || 'Each',
                    notes: line.notes || '',
                }))
            };

            console.log('📤 Updating requisition with attachments:', payload);

            const response = await updateRequisition(payload);
            console.log('✅ Requisition updated:', response.data);

            showToast.success('Requisition updated successfully');
            navigate(`/procurement/requisitions/${id}`);
        } catch (error: any) {
            console.error('Error updating requisition:', error);

            // Handle concurrency error
            if (error?.response?.status === 409) {
                showToast.error('This requisition was modified by another user. Please refresh and try again.');
            } else {
                const errorMessage = error?.response?.data?.message || 'Failed to update requisition';
                showToast.error(errorMessage);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const totalAmount = calculateTotal();

    // Get error for field
    const getError = (field: string) => {
        return showErrors ? validationErrors[field] || '' : '';
    };

    const hasError = (field: string) => {
        return showErrors && !!validationErrors[field];
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading requisition...</p>
                </div>
            </div>
        );
    }

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
                        onClick={() => navigate(`/procurement/requisitions/${id}`)}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Requisition</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-500">ID: {id?.substring(0, 8)}</span>
                            <Badge className={getStatusBadge(originalStatus)}>
                                {originalStatus || 'Draft'}
                            </Badge>
                            {originalStatus === 'Rejected' && (
                                <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Re-edit allowed
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/procurement/requisitions/${id}`)}
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={handleSubmit}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Update Requisition
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Form */}
            <form>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-emerald-600" />
                                    Basic Information
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="title">Requisition Title *</Label>
                                        <Input
                                            id="title"
                                            placeholder="Enter requisition title"
                                            value={formData.title}
                                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                            className={hasError('title') ? 'border-red-500' : ''}
                                            disabled={isSaving}
                                        />
                                        {getError('title') && (
                                            <p className="text-xs text-red-500 mt-1">{getError('title')}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="description">Description</Label>
                                        <textarea
                                            id="description"
                                            rows={3}
                                            placeholder="Describe the purpose of this requisition"
                                            value={formData.description}
                                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                            disabled={isSaving}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Department *</Label>
                                            {loadingDepartments ? (
                                                <div className="flex items-center gap-2 p-2 border rounded-lg">
                                                    <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                                                    <span className="text-sm text-gray-500">Loading departments...</span>
                                                </div>
                                            ) : (
                                                <Select
                                                    value={formData.departmentId}
                                                    onValueChange={(value) => {
                                                        const dept = departments.find(d => d.id === value);
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            departmentId: value,
                                                            departmentName: dept?.name || ''
                                                        }));
                                                    }}
                                                    disabled={isSaving}
                                                >
                                                    <SelectTrigger className={hasError('department') ? 'border-red-500' : ''}>
                                                        <SelectValue placeholder="Select department" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {departments.map((dept) => (
                                                            <SelectItem key={dept.id} value={dept.id}>
                                                                {dept.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                            {getError('department') && (
                                                <p className="text-xs text-red-500 mt-1">{getError('department')}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label>Budget Code</Label>
                                            <Input
                                                placeholder="Enter budget code"
                                                value={formData.budgetCode}
                                                onChange={(e) => setFormData(prev => ({ ...prev, budgetCode: e.target.value }))}
                                                disabled={isSaving}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Priority *</Label>
                                            <Select
                                                value={formData.priority}
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                                                disabled={isSaving}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {PRIORITY_OPTIONS.map((priority) => (
                                                        <SelectItem key={priority.value} value={priority.value}>
                                                            <span className={`px-2 py-0.5 rounded-full text-xs ${priority.color}`}>
                                                                {priority.label}
                                                            </span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Required Date *</Label>
                                            <Input
                                                type="date"
                                                value={formData.requiredDate}
                                                onChange={(e) => setFormData(prev => ({ ...prev, requiredDate: e.target.value }))}
                                                className={hasError('requiredDate') ? 'border-red-500' : ''}
                                                disabled={isSaving}
                                            />
                                            {getError('requiredDate') && (
                                                <p className="text-xs text-red-500 mt-1">{getError('requiredDate')}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Financial Period *</Label>
                                        {periodsLoading ? (
                                            <div className="flex items-center gap-2 p-2 border rounded-lg">
                                                <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                                                <span className="text-sm text-gray-500">Loading periods...</span>
                                            </div>
                                        ) : (
                                            <Select
                                                value={formData.periodId}
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, periodId: value }))}
                                                disabled={isSaving}
                                            >
                                                <SelectTrigger className={hasError('period') ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select period" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {periods.map((period) => (
                                                        <SelectItem key={period.id} value={period.id}>
                                                            {period.name} ({new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                        {getError('period') && (
                                            <p className="text-xs text-red-500 mt-1">{getError('period')}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* ========================================================== */}
                        {/* ATTACHMENTS SECTION */}
                        {/* ========================================================== */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <Paperclip className="w-5 h-5 text-emerald-600" />
                                        Attachments
                                        {attachments.length > 0 && (
                                            <span className="text-sm font-normal text-gray-500">
                                                ({attachments.length} file{attachments.length > 1 ? 's' : ''})
                                            </span>
                                        )}
                                    </h3>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isSaving}
                                            className="flex items-center gap-2"
                                        >
                                            <Upload className="w-4 h-4" />
                                            Upload Files
                                        </Button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            className="hidden"
                                            onChange={handleFileSelect}
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp"
                                        />
                                        {loadingAttachments && (
                                            <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                                        )}
                                    </div>
                                </div>

                                {/* Upload info */}
                                <div className="text-xs text-gray-500 mb-3 flex items-center gap-4">
                                    <span>📄 Max size: 10MB</span>
                                    <span>📁 Supported: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF</span>
                                    <span className="text-blue-500">💾 Files are saved when you update the requisition</span>
                                </div>

                                {/* Attachment List */}
                                {attachments.length === 0 ? (
                                    <div
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-400 transition-colors cursor-pointer"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm text-gray-500">Drop files here or click to upload</p>
                                        <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, XLS, XLSX, JPG, PNG up to 10MB</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {attachments.map((attachment) => (
                                            <div
                                                key={attachment.id}
                                                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                                                    attachment.uploaded
                                                        ? 'border-green-200 bg-green-50'
                                                        : attachment.error
                                                            ? 'border-red-200 bg-red-50'
                                                            : 'border-gray-200 bg-gray-50'
                                                }`}
                                            >
                                                {getFileIcon(attachment.type)}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-700 truncate">
                                                        {attachment.name}
                                                        {attachment.isExisting && (
                                                            <span className="ml-2 text-xs text-green-600 font-normal">
                                                                (existing)
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {formatFileSize(attachment.size)}
                                                        {attachment.uploading && (
                                                            <span className="text-blue-500 ml-2 flex items-center gap-1">
                                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                                Uploading...
                                                            </span>
                                                        )}
                                                        {attachment.uploaded && !attachment.isExisting && (
                                                            <span className="text-green-500 ml-2 flex items-center gap-1">
                                                                <CheckCircle className="w-3 h-3" />
                                                                Uploaded
                                                            </span>
                                                        )}
                                                        {attachment.error && (
                                                            <span className="text-red-500 ml-2 flex items-center gap-1">
                                                                <AlertCircle className="w-3 h-3" />
                                                                {attachment.error}
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="flex gap-1">
                                                    {attachment.isExisting && attachment.fileId && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-blue-500 hover:text-blue-700"
                                                            onClick={() => handleDownload(attachment)}
                                                            title="Download"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-500 hover:text-red-700"
                                                        onClick={() => removeAttachment(attachment.id)}
                                                        disabled={attachment.uploading || isSaving}
                                                        title="Remove"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Line Items */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-gray-900">Line Items</h3>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addLine}
                                        className="flex items-center gap-2"
                                        disabled={isSaving}
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Item
                                    </Button>
                                </div>

                                {getError('lines') && (
                                    <p className="text-xs text-red-500 mb-2">{getError('lines')}</p>
                                )}

                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                    {formData.lines.map((line, index) => {
                                        const hasDescError = hasError(`line_${index}_description`);
                                        const hasQtyError = hasError(`line_${index}_quantity`);
                                        const hasPriceError = hasError(`line_${index}_unitPrice`);

                                        return (
                                            <div key={line.id || index} className="flex items-end gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                <div className="flex-[2]">
                                                    <Label className="text-xs text-gray-500">Description *</Label>
                                                    <Input
                                                        value={line.description}
                                                        onChange={(e) => updateLine(index, 'description', e.target.value)}
                                                        placeholder="Item description"
                                                        className={`text-sm ${hasDescError ? 'border-red-500' : ''}`}
                                                        disabled={isSaving}
                                                    />
                                                    {hasDescError && (
                                                        <p className="text-xs text-red-500 mt-0.5">{getError(`line_${index}_description`)}</p>
                                                    )}
                                                </div>
                                                <div className="w-16">
                                                    <Label className="text-xs text-gray-500">Qty *</Label>
                                                    <Input
                                                        type="number"
                                                        value={line.quantity}
                                                        onChange={(e) => updateLine(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                        min="0.01"
                                                        step="0.01"
                                                        className={`text-sm ${hasQtyError ? 'border-red-500' : ''}`}
                                                        disabled={isSaving}
                                                    />
                                                    {hasQtyError && (
                                                        <p className="text-xs text-red-500 mt-0.5">{getError(`line_${index}_quantity`)}</p>
                                                    )}
                                                </div>
                                                <div className="w-24">
                                                    <Label className="text-xs text-gray-500">Unit Price</Label>
                                                    <Input
                                                        type="number"
                                                        value={line.unitPrice}
                                                        onChange={(e) => updateLine(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                        min="0"
                                                        step="0.01"
                                                        className={`text-sm ${hasPriceError ? 'border-red-500' : ''}`}
                                                        disabled={isSaving}
                                                    />
                                                    {hasPriceError && (
                                                        <p className="text-xs text-red-500 mt-0.5">{getError(`line_${index}_unitPrice`)}</p>
                                                    )}
                                                </div>
                                                <div className="w-24">
                                                    <Label className="text-xs text-gray-500">Unit</Label>
                                                    <Input
                                                        value={line.unitOfMeasure || ''}
                                                        onChange={(e) => updateLine(index, 'unitOfMeasure', e.target.value)}
                                                        placeholder="Each"
                                                        className="text-sm"
                                                        disabled={isSaving}
                                                    />
                                                </div>
                                                <div className="w-28">
                                                    <Label className="text-xs text-gray-500">Total</Label>
                                                    <div className="px-2 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-900 text-right">
                                                        ${calculateLineTotal(line).toFixed(2)}
                                                    </div>
                                                </div>
                                                {formData.lines.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-500 hover:text-red-700 mt-4"
                                                        onClick={() => removeLine(index)}
                                                        disabled={isSaving}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Total Items: {formData.lines.length}</span>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">Total Amount</p>
                                        <p className="text-2xl font-bold text-gray-900">${totalAmount.toFixed(2)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
                                <div className="space-y-3">
                                    <Button
                                        type="submit"
                                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                                        onClick={handleSubmit}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Update Requisition
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => navigate(`/procurement/requisitions/${id}`)}
                                        disabled={isSaving}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Summary</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Total Items</span>
                                        <span className="font-medium">{formData.lines.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Total Amount</span>
                                        <span className="font-bold text-emerald-600">${totalAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Priority</span>
                                        <span className="font-medium">{formData.priority}</span>
                                    </div>
                                    {formData.departmentName && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Department</span>
                                            <span className="font-medium">{formData.departmentName}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Attachments</span>
                                        <span className="font-medium">{attachments.length} files</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Status</span>
                                        <Badge className={getStatusBadge(originalStatus)}>
                                            {originalStatus || 'Draft'}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Status Info */}
                        <Card className="border-yellow-200 bg-yellow-50">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-yellow-800">
                                            {originalStatus === 'Rejected'
                                                ? 'Re-edit Mode'
                                                : 'Draft Mode'}
                                        </p>
                                        <p className="text-xs text-yellow-700 mt-1">
                                            {originalStatus === 'Rejected'
                                                ? 'You can edit and resubmit this requisition.'
                                                : 'You can edit all fields and save or submit for approval.'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </motion.div>
    );
};

export default EditRequisition;