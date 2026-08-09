import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    FileText,
    Calendar,
    DollarSign,
    Building2,
    Loader2,
    Plus,
    Trash2,
    X,
    Clock,
    CheckCircle,
    AlertCircle,
    Paperclip,
    Upload,
    File,
    Image,
    FileArchive,
    FileSpreadsheet,
    Download,
    Eye
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
import { getVendors } from '../../../services/procurement/vendor.api';
import { createVendorContract } from '../../../services/procurement/vendorContract.api';
import { uploadFile, deleteFile } from '../../../services/fileManagement/fileManagementApi';

// ============================================================
// CONSTANTS
// ============================================================

const CONTRACT_TYPES = [
    { value: 'Supply', label: 'Supply' },
    { value: 'Service', label: 'Service' },
    { value: 'Maintenance', label: 'Maintenance' },
    { value: 'Consulting', label: 'Consulting' },
];

const STATUS_OPTIONS = [
    { value: 'Pending', label: 'Pending', color: 'text-yellow-600' },
    { value: 'Active', label: 'Active', color: 'text-green-600' },
    { value: 'Renewal', label: 'Renewal', color: 'text-blue-600' },
    { value: 'Expired', label: 'Expired', color: 'text-red-600' },
    { value: 'Terminated', label: 'Terminated', color: 'text-gray-600' },
];

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

const CreateContract = () => {
    const navigate = useNavigate();
    const { userId, userName } = useAuthStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State
    const [isLoading, setIsLoading] = useState(false);
    const [isUploadingAttachments, setIsUploadingAttachments] = useState(false);
    const [vendors, setVendors] = useState<any[]>([]);
    const [loadingVendors, setLoadingVendors] = useState(false);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [createdContractId, setCreatedContractId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        vendorId: '',
        contractNumber: '',
        title: '',
        type: 'Supply',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: 0,
        status: 'Pending',
        autoRenew: false,
        renewalDate: '',
        signedDate: '',
        notes: ''
    });
    const [terms, setTerms] = useState<string[]>(['']);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [showErrors, setShowErrors] = useState(false);

    // Fetch vendors
    const fetchVendors = useCallback(async () => {
        setLoadingVendors(true);
        try {
            const data = await getVendors({ status: 'Active' });
            setVendors(data);
        } catch (error) {
            console.error('Error fetching vendors:', error);
            showToast.error('Failed to load vendors');
        } finally {
            setLoadingVendors(false);
        }
    }, []);

    useEffect(() => {
        fetchVendors();
    }, [fetchVendors]);

    // ============================================================
    // FILE ATTACHMENT HANDLERS - Store files locally first
    // ============================================================

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newAttachments: Attachment[] = [];

        for (const file of Array.from(files)) {
            if (file.size > MAX_FILE_SIZE) {
                showToast.error(`${file.name} exceeds 10MB limit`);
                continue;
            }
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
            showToast.info(`${newAttachments.length} file(s) added. They will be uploaded after contract creation.`);
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // ✅ Upload attachments AFTER contract is created
    const uploadAttachmentsAfterCreation = async (contractId: string): Promise<string[]> => {
        const uploadedIds: string[] = [];
        const newAttachments = attachments.filter(a => !a.uploaded && !a.uploading);

        if (newAttachments.length === 0) return uploadedIds;

        setIsUploadingAttachments(true);
        showToast.info(`Uploading ${newAttachments.length} file(s)...`);

        for (const attachment of newAttachments) {
            setAttachments(prev =>
                prev.map(a =>
                    a.id === attachment.id ? { ...a, uploading: true } : a
                )
            );

            try {
                const response = await uploadFile({
                    file: attachment.file,
                    module: 'vendor_contract',
                    referenceId: contractId, // ✅ Use the REAL contract ID
                    category: 'contract_attachment',
                    documentType: attachment.file.type.includes('pdf') ? 'PDF' : 'Image',
                    description: `Contract attachment: ${formData.title || 'Contract'}`,
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
                showToast.error(`Failed to upload ${attachment.file.name}: ${errorMsg}`);
            }
        }

        setIsUploadingAttachments(false);
        return uploadedIds;
    };

    const removeAttachment = (attachmentId: string) => {
        const attachment = attachments.find(a => a.id === attachmentId);
        if (!attachment) return;

        // If already uploaded to server, delete it
        if (attachment.fileId && attachment.uploaded) {
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
    // TERMS MANAGEMENT
    // ============================================================

    const addTerm = () => setTerms([...terms, '']);
    const removeTerm = (index: number) => {
        if (terms.length > 1) {
            setTerms(terms.filter((_, i) => i !== index));
        }
    };
    const updateTerm = (index: number, value: string) => {
        setTerms(terms.map((t, i) => i === index ? value : t));
    };

    // ============================================================
    // VALIDATION & SUBMIT
    // ============================================================

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.vendorId) errors.vendorId = 'Vendor is required';
        if (!formData.contractNumber) errors.contractNumber = 'Contract number is required';
        if (!formData.title) errors.title = 'Title is required';
        if (!formData.startDate) errors.startDate = 'Start date is required';
        if (!formData.endDate) errors.endDate = 'End date is required';
        if (formData.value <= 0) errors.value = 'Value must be greater than 0';

        if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
            errors.endDate = 'End date must be after start date';
        }

        setValidationErrors(errors);
        setShowErrors(true);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            const firstError = Object.values(validationErrors)[0];
            if (firstError) showToast.error(firstError);
            return;
        }

        setIsLoading(true);
        let contractId: string | null = null;

        try {
            // ✅ STEP 1: Create the contract first
            const payload = {
                vendorId: formData.vendorId,
                contractNumber: formData.contractNumber,
                title: formData.title,
                type: formData.type,
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
                value: formData.value,
                status: formData.status,
                autoRenew: formData.autoRenew,
                renewalDate: formData.renewalDate ? new Date(formData.renewalDate).toISOString() : undefined,
                signedDate: formData.signedDate ? new Date(formData.signedDate).toISOString() : undefined,
                terms: terms.filter(t => t.trim()),
                notes: formData.notes
            };

            console.log('📤 Creating contract...', payload);
            const response = await createVendorContract(payload);
            contractId = response?.id;
            setCreatedContractId(contractId);
            console.log('✅ Contract created with ID:', contractId);

            // ✅ STEP 2: Upload attachments with the real contract ID
            if (attachments.length > 0 && contractId) {
                const uploadedIds = await uploadAttachmentsAfterCreation(contractId);
                console.log('✅ Uploaded attachment IDs:', uploadedIds);
            }

            showToast.success('Contract created successfully with all attachments');
            navigate('/procurement/vendor-contracts');
        } catch (error: any) {
            console.error('Error creating contract:', error);
            showToast.error(error?.response?.data?.message || 'Failed to create contract');

            // If contract was created but attachments failed, still navigate to detail
            if (contractId) {
                showToast.warning('Contract created but some attachments may have failed');
                navigate(`/procurement/vendor-contracts/${contractId}`);
            }
        } finally {
            setIsLoading(false);
            setIsUploadingAttachments(false);
        }
    };

    const getError = (field: string) => showErrors ? validationErrors[field] || '' : '';
    const hasError = (field: string) => showErrors && !!validationErrors[field];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/procurement/vendor-contracts')} className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create Contract</h1>
                    <p className="text-sm text-gray-500">Create a new vendor contract</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information - Same as before */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-emerald-600" />
                                    Basic Information
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <Label>Vendor *</Label>
                                        {loadingVendors ? (
                                            <div className="flex items-center gap-2 p-2 border rounded-lg">
                                                <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                                                <span className="text-sm text-gray-500">Loading vendors...</span>
                                            </div>
                                        ) : (
                                            <Select
                                                value={formData.vendorId}
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, vendorId: value }))}
                                            >
                                                <SelectTrigger className={hasError('vendorId') ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select vendor" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {vendors.map((vendor) => (
                                                        <SelectItem key={vendor.id} value={vendor.id}>
                                                            {vendor.code} - {vendor.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                        {getError('vendorId') && (
                                            <p className="text-xs text-red-500 mt-1">{getError('vendorId')}</p>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Contract Number *</Label>
                                            <Input
                                                placeholder="e.g., CT-2024-001"
                                                value={formData.contractNumber}
                                                onChange={(e) => setFormData(prev => ({ ...prev, contractNumber: e.target.value.toUpperCase() }))}
                                                className={hasError('contractNumber') ? 'border-red-500' : ''}
                                            />
                                            {getError('contractNumber') && (
                                                <p className="text-xs text-red-500 mt-1">{getError('contractNumber')}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label>Title *</Label>
                                            <Input
                                                placeholder="Contract title"
                                                value={formData.title}
                                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                                className={hasError('title') ? 'border-red-500' : ''}
                                            />
                                            {getError('title') && (
                                                <p className="text-xs text-red-500 mt-1">{getError('title')}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Contract Type</Label>
                                            <Select
                                                value={formData.type}
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {CONTRACT_TYPES.map((type) => (
                                                        <SelectItem key={type.value} value={type.value}>
                                                            {type.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Status</Label>
                                            <Select
                                                value={formData.status}
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {STATUS_OPTIONS.map((status) => (
                                                        <SelectItem key={status.value} value={status.value}>
                                                            <span className={status.color}>{status.label}</span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Value *</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={formData.value || ''}
                                                onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                                                className={hasError('value') ? 'border-red-500' : ''}
                                            />
                                            {getError('value') && (
                                                <p className="text-xs text-red-500 mt-1">{getError('value')}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label>Auto Renew</Label>
                                            <div className="flex items-center gap-2 mt-2">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.autoRenew}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, autoRenew: e.target.checked }))}
                                                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                                />
                                                <span className="text-sm text-gray-600">Enable auto-renewal</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Dates */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-emerald-600" />
                                    Contract Dates
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Start Date *</Label>
                                        <Input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                            className={hasError('startDate') ? 'border-red-500' : ''}
                                        />
                                        {getError('startDate') && (
                                            <p className="text-xs text-red-500 mt-1">{getError('startDate')}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label>End Date *</Label>
                                        <Input
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                            className={hasError('endDate') ? 'border-red-500' : ''}
                                        />
                                        {getError('endDate') && (
                                            <p className="text-xs text-red-500 mt-1">{getError('endDate')}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label>Renewal Date</Label>
                                        <Input
                                            type="date"
                                            value={formData.renewalDate}
                                            onChange={(e) => setFormData(prev => ({ ...prev, renewalDate: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label>Signed Date</Label>
                                        <Input
                                            type="date"
                                            value={formData.signedDate}
                                            onChange={(e) => setFormData(prev => ({ ...prev, signedDate: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Terms */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                                        Contract Terms
                                    </h3>
                                    <Button type="button" variant="outline" size="sm" onClick={addTerm}>
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add Term
                                    </Button>
                                </div>
                                {terms.map((term, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <Input
                                            value={term}
                                            onChange={(e) => updateTerm(index, e.target.value)}
                                            placeholder={`Term ${index + 1}`}
                                        />
                                        {terms.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500"
                                                onClick={() => removeTerm(index)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Notes */}
                        <Card>
                            <CardContent className="p-6">
                                <Label>Notes</Label>
                                <textarea
                                    rows={3}
                                    placeholder="Additional notes or comments..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none mt-1"
                                />
                            </CardContent>
                        </Card>

                        {/* Attachments - Store files locally, upload after contract creation */}
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

                                <div className="text-xs text-gray-500 mb-3 flex items-center gap-4">
                                    <span>📄 Max size: 10MB</span>
                                    <span>📁 Supported: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF</span>
                                    <span className="text-blue-500">💾 Files will be uploaded after contract creation</span>
                                </div>

                                {attachments.length === 0 ? (
                                    <div
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-400 transition-colors cursor-pointer"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm text-gray-500">Drop files here or click to upload</p>
                                        <p className="text-xs text-gray-400 mt-1">Contract documents, scans, or supporting files</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {attachments.map((attachment) => (
                                            <div
                                                key={attachment.id}
                                                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                                                    attachment.uploaded ? 'border-green-200 bg-green-50' :
                                                        attachment.error ? 'border-red-200 bg-red-50' :
                                                            'border-gray-200 bg-gray-50'
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
                                                        {!attachment.uploaded && !attachment.uploading && !attachment.error && (
                                                            <span className="text-gray-400 ml-2 flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                Pending upload
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
                                        disabled={isLoading || isUploadingAttachments}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                {isUploadingAttachments ? 'Uploading files...' : 'Creating...'}
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Create Contract
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => navigate('/procurement/vendor-contracts')}
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
                                        <span className="text-gray-500">Contract</span>
                                        <span className="font-medium">{formData.contractNumber || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Vendor</span>
                                        <span className="font-medium">
                                            {vendors.find(v => v.id === formData.vendorId)?.name || 'Not selected'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Type</span>
                                        <span className="font-medium">{formData.type}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Status</span>
                                        <span className="font-medium">{formData.status}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Value</span>
                                        <span className="font-medium">${formData.value.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Auto Renew</span>
                                        <span className="font-medium">{formData.autoRenew ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-gray-200">
                                        <span className="text-gray-500">Attachments</span>
                                        <span className="font-medium">{attachments.length} files</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-400">
                                        <span>Upload status</span>
                                        <span>{attachments.filter(a => a.uploaded).length}/{attachments.length} uploaded</span>
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

export default CreateContract;