// src/pages/procurement/requisitions/CreateRequisition.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
    Clock,
    Upload,
    X,
    Paperclip,
    File,
    Image,
    FileArchive,
    FileSpreadsheet,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { showToast } from '@/shared/layout/layout';
import { useAuthStore } from '@/shared/stores/auth.store';
import { useFinancialPeriods } from '@/modules/finance/hooks/useFinancialPeriods';
import { getDepartments } from '@/modules/finance/services/finance.api';
import { createRequisition } from '@/modules/procurement/services/requisition.api';
import { uploadFile, deleteFile } from '@/modules/file/services/fileManagement/fileManagementApi';
import type { RequisitionFormData, RequisitionLine } from '@/modules/procurement/types/requisition.types';

// ============================================================
// CONSTANTS
// ============================================================

const PRIORITY_OPTIONS = [
    { value: 'Low', label: 'Low', color: 'bg-blue-100 text-blue-700' },
    { value: 'Medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'High', label: 'High', color: 'bg-orange-100 text-orange-700' },
    { value: 'Urgent', label: 'Urgent', color: 'bg-red-100 text-red-700' },
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
    file: File;
    name: string;
    size: number;
    type: string;
    uploaded: boolean;
    uploading: boolean;
    error?: string;
    fileId?: string;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

const CreateRequisition = () => {
    const navigate = useNavigate();
    const { userId, userName, departmentId: authDepartmentId, departmentName: authDepartmentName } = useAuthStore();
    const { periods, loading: periodsLoading, fetchPeriods } = useFinancialPeriods();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State
    const [isLoading, setIsLoading] = useState(false);
    const [departments, setDepartments] = useState<any[]>([]);
    const [loadingDepartments, setLoadingDepartments] = useState(false);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFileIds, setUploadedFileIds] = useState<string[]>([]);
    const [formData, setFormData] = useState<RequisitionFormData>({
        title: '',
        description: '',
        departmentId: authDepartmentId || '',
        departmentName: authDepartmentName || '',
        priority: 'Medium',
        requiredDate: new Date().toISOString().split('T')[0],
        budgetCode: '',
        periodId: '',
        lines: [{ ...DEFAULT_REQUISITION_LINE }]
    });
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [showErrors, setShowErrors] = useState(false);

    // ✅ Fetch departments
    const fetchDepartments = useCallback(async () => {
        setLoadingDepartments(true);
        try {
            const response = await getDepartments();
            const data = response?.data?.data || response?.data || response || [];
            console.log('✅ Departments fetched:', data);
            setDepartments(data);

            if (!formData.departmentId && data.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    departmentId: data[0].id,
                    departmentName: data[0].name || ''
                }));
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
            showToast.error('Failed to load departments');
        } finally {
            setLoadingDepartments(false);
        }
    }, [formData.departmentId]);

    // Fetch periods and departments on mount
    useEffect(() => {
        fetchPeriods({ isClosed: false, isActive: true });
        fetchDepartments();
    }, [fetchPeriods, fetchDepartments]);

    // Auto-fill department from auth
    useEffect(() => {
        if (authDepartmentId) {
            setFormData(prev => ({
                ...prev,
                departmentId: authDepartmentId,
                departmentName: authDepartmentName || ''
            }));
        }
    }, [authDepartmentId, authDepartmentName]);

    // ============================================================
    // FILE ATTACHMENT HANDLERS - UPLOAD AFTER CREATION
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
                uploading: false
            });
        }

        if (newAttachments.length > 0) {
            setAttachments(prev => [...prev, ...newAttachments]);
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // ✅ Upload attachments AFTER requisition is created
    const uploadAttachmentsAfterCreation = async (requisitionId: string): Promise<string[]> => {
        const uploadedIds: string[] = [];
        const failedUploads: string[] = [];

        for (const attachment of attachments) {
            if (attachment.uploaded && attachment.fileId) {
                uploadedIds.push(attachment.fileId);
                continue;
            }

            setAttachments(prev =>
                prev.map(a =>
                    a.id === attachment.id ? { ...a, uploading: true } : a
                )
            );

            try {
                const response = await uploadFile({
                    file: attachment.file,
                    module: 'requisition',
                    referenceId: requisitionId, // ✅ Use the REAL requisition ID
                    category: 'requisition_attachment',
                    documentType: attachment.file.type.includes('pdf') ? 'PDF' : 'Image',
                    description: `Attachment for requisition: ${formData.title || 'New Requisition'}`,
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
                                ? { ...a, uploaded: true, uploading: false, fileId: fileId }
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
                failedUploads.push(attachment.file.name);
                showToast.error(`Failed to upload ${attachment.file.name}: ${errorMsg}`);
            }
        }

        if (failedUploads.length > 0) {
            showToast.warning(`${failedUploads.length} file(s) failed to upload: ${failedUploads.join(', ')}`);
        }

        return uploadedIds;
    };

    const removeAttachment = (attachmentId: string) => {
        // If the file was already uploaded, we'll delete it from server
        const attachment = attachments.find(a => a.id === attachmentId);
        if (attachment?.fileId && attachment.uploaded) {
            // Delete from server (fire and forget, but track for cleanup)
            deleteFile(attachment.fileId, false).catch(console.error);
        }
        setAttachments(prev => prev.filter(a => a.id !== attachmentId));
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

    // ============================================================
    // FORM HANDLERS
    // ============================================================

    const calculateLineTotal = (line: RequisitionLine) => {
        return (line.quantity || 0) * (line.unitPrice || 0);
    };

    const calculateTotal = () => {
        return formData.lines.reduce((sum, line) => sum + calculateLineTotal(line), 0);
    };

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

    const addLine = () => {
        setFormData(prev => ({
            ...prev,
            lines: [...prev.lines, { ...DEFAULT_REQUISITION_LINE }]
        }));
    };

    const removeLine = (index: number) => {
        if (formData.lines.length > 1) {
            setFormData(prev => ({
                ...prev,
                lines: prev.lines.filter((_, i) => i !== index)
            }));
        }
    };

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
    const handleSubmit = async (e: React.FormEvent, status: 'Draft' | 'Submitted' = 'Submitted') => {
        e.preventDefault();

        if (!validateForm()) {
            const firstError = Object.values(validationErrors)[0];
            if (firstError) showToast.error(firstError);
            return;
        }

        setIsLoading(true);
        let createdRequisitionId: string | null = null;

        try {
            const totalAmount = calculateTotal();

            const payload = {
                requisitionNumber: generateRequisitionNumber(),
                title: formData.title,
                description: formData.description || '',
                departmentId: formData.departmentId,
                departmentName: formData.departmentName || '',
                priority: formData.priority,
                requiredDate: new Date(formData.requiredDate).toISOString(),
                budgetCode: formData.budgetCode || '',
                periodId: formData.periodId,
                status: status,
                submittedDate: status === 'Submitted' ? new Date().toISOString() : null,
                requesterId: userId || null,
                requesterName: userName || null,
                createdByUserId: userId || null,
                createdByUserName: userName || null,
                // ✅ Don't send attachment IDs yet - we'll upload after creation
                attachmentIds: [],
                lines: formData.lines.map(line => ({
                    description: line.description,
                    quantity: line.quantity,
                    unitPrice: line.unitPrice,
                    totalAmount: line.quantity * line.unitPrice,
                    unitOfMeasure: line.unitOfMeasure || 'Each',
                    notes: line.notes || '',
                    periodId: formData.periodId || null
                }))
            };

            console.log('📤 Creating requisition...');
            const response = await createRequisition(payload);
            console.log('✅ Requisition created:', response.data);

            // ✅ Get the created requisition ID
            const requisitionData = response?.data?.data || response?.data;
            createdRequisitionId = requisitionData?.id || requisitionData?.requisitionId;

            // ✅ If we have attachments and a requisition ID, upload them now
            if (attachments.length > 0 && createdRequisitionId) {
                console.log('📤 Uploading attachments for requisition:', createdRequisitionId);
                const uploadedIds = await uploadAttachmentsAfterCreation(createdRequisitionId);
                console.log('✅ Uploaded attachment IDs:', uploadedIds);
            }

            showToast.success(
                status === 'Draft'
                    ? 'Requisition saved as draft successfully'
                    : 'Requisition submitted successfully'
            );
            navigate('/procurement/requisitions');
        } catch (error: any) {
            console.error('Error creating requisition:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to create requisition';
            showToast.error(errorMessage);

            // ✅ If requisition was created but attachments failed, we should handle cleanup
            if (createdRequisitionId) {
                console.warn('Requisition created but attachments may have failed:', createdRequisitionId);
                // Optionally: navigate to edit page to retry attachments
                // navigate(`/procurement/requisitions/${createdRequisitionId}/edit`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const generateRequisitionNumber = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `REQ-${year}${month}${day}-${random}`;
    };

    const handleSaveDraft = (e: React.FormEvent) => {
        handleSubmit(e, 'Draft');
    };

    const totalAmount = calculateTotal();

    const getError = (field: string) => {
        return showErrors ? validationErrors[field] || '' : '';
    };

    const hasError = (field: string) => {
        return showErrors && !!validationErrors[field];
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Header */}
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
                    <h1 className="text-2xl font-bold text-gray-900">Create Requisition</h1>
                    <p className="text-sm text-gray-500">
                        Fill in the details to create a new purchase requisition
                    </p>
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
                                            disabled={isLoading}
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
                                            disabled={isLoading}
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
                                                    disabled={isLoading}
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
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Priority *</Label>
                                            <Select
                                                value={formData.priority}
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                                                disabled={isLoading}
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
                                                disabled={isLoading}
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
                                                disabled={isLoading}
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
                        {/* ATTACHMENTS SECTION - WITH UPLOAD STATUS */}
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
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isLoading}
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
                                </div>

                                {/* Upload progress / info */}
                                <div className="text-xs text-gray-500 mb-3 flex items-center gap-4">
                                    <span>📄 Max size: 10MB</span>
                                    <span>📁 Supported: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF</span>
                                    <span className="text-blue-500">ℹ️ Files will be uploaded after requisition is created</span>
                                </div>

                                {/* Attachment List */}
                                {attachments.length === 0 ? (
                                    <div
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-400 transition-colors cursor-pointer"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm text-gray-500">Drop files here or click to upload</p>
                                        <p className="text-xs text-gray-400 mt-1">Files will be attached after requisition creation</p>
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
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {formatFileSize(attachment.size)}
                                                        {attachment.uploading && (
                                                            <span className="text-blue-500 ml-2 flex items-center gap-1">
                                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                                Uploading...
                                                            </span>
                                                        )}
                                                        {attachment.uploaded && (
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
                                                        {!attachment.uploaded && !attachment.uploading && !attachment.error && (
                                                            <span className="text-gray-400 ml-2 flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                Pending upload
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-700"
                                                    onClick={() => removeAttachment(attachment.id)}
                                                    disabled={attachment.uploading || isLoading}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
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
                                        disabled={isLoading}
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
                                            <div key={index} className="flex items-end gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                <div className="flex-[2]">
                                                    <Label className="text-xs text-gray-500">Description *</Label>
                                                    <Input
                                                        value={line.description}
                                                        onChange={(e) => updateLine(index, 'description', e.target.value)}
                                                        placeholder="Item description"
                                                        className={`text-sm ${hasDescError ? 'border-red-500' : ''}`}
                                                        disabled={isLoading}
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
                                                        disabled={isLoading}
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
                                                        disabled={isLoading}
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
                                                        disabled={isLoading}
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
                                                        disabled={isLoading}
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
                                        onClick={(e) => handleSubmit(e, 'Submitted')}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Submit Requisition
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={handleSaveDraft}
                                        disabled={isLoading}
                                    >
                                        Save as Draft
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="w-full text-red-600 hover:text-red-700"
                                        onClick={() => navigate('/procurement/requisitions')}
                                        disabled={isLoading}
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
                                    {attachments.length > 0 && (
                                        <div className="flex justify-between text-xs text-gray-400">
                                            <span>Upload status</span>
                                            <span>{attachments.filter(a => a.uploaded).length}/{attachments.length} uploaded</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </motion.div>
    );
};

export default CreateRequisition;