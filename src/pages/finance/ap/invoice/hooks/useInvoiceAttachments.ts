// src/pages/finance/ap/invoice/hooks/useInvoiceAttachments.ts

import { useState, useRef,useCallback  } from 'react';
import {
    getFilesByReference,
    uploadFile,
    deleteFile,
    downloadFileinvoice,
} from '../../../../../services/fileManagement/fileManagementApi';
import { showToast } from '../../../../../layout/layout';


export const useInvoiceAttachments = () => {
    const [attachments, setAttachments] = useState<any[]>([]);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const editFileInputRef = useRef<HTMLInputElement>(null);

    const fetchAttachments = async (invoiceId: string) => {
        try {
            const response = await getFilesByReference('invoice', invoiceId, 'invoice_attachment');
            let attachmentsData = [];
            if (response.data) {
                if (Array.isArray(response.data)) {
                    attachmentsData = response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    attachmentsData = response.data.data;
                } else if (response.data.$values && Array.isArray(response.data.$values)) {
                    attachmentsData = response.data.$values;
                }
            }
            setAttachments(attachmentsData);
            return attachmentsData;
        } catch (error) {
            console.error('Error fetching attachments:', error);
            return [];
        }
    };

    const handleFileUpload = useCallback(async (files: FileList, invoiceId: string) => {
        if (!invoiceId) {
            showToast.error('No invoice selected. Please save the invoice first.');
            return;
        }

        try {
            setUploadingFiles(true);
            const fileArray = Array.from(files);

            for (const file of fileArray) {
                if (file.size > 10 * 1024 * 1024) {
                    showToast.error(`${file.name} exceeds 10MB limit`);
                    continue;
                }

                const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                if (!allowedTypes.includes(file.type)) {
                    showToast.error(`${file.name} is not a supported file type`);
                    continue;
                }

                await uploadFile({
                    file,
                    module: 'invoice',
                    referenceId: invoiceId,
                    category: 'invoice_attachment',
                    documentType: file.type.includes('pdf') ? 'PDF' : 'Image',
                    description: `Attachment for invoice ${invoiceId}`,
                    isPublic: false,
                    isShared: false,
                    sharingLevel: 'Private',
                });
                showToast.success(`Uploaded ${file.name}`);
            }

            // ✅ Refresh attachments after upload
            await fetchAttachments(invoiceId);
            if (fileInputRef.current) fileInputRef.current.value = '';
            if (editFileInputRef.current) editFileInputRef.current.value = '';
        } catch (error: any) {
            console.error('❌ Upload error:', error);
            showToast.error(error.response?.data?.message || 'Failed to upload files');
        } finally {
            setUploadingFiles(false);
        }
    }, [fetchAttachments]);

    const handleAddModalFileSelect = (files: FileList) => {
        const fileArray = Array.from(files);
        const validFiles = fileArray.filter(file => {
            if (file.size > 10 * 1024 * 1024) {
                showToast.error(`${file.name} exceeds 10MB limit`);
                return false;
            }
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                showToast.error(`${file.name} is not a supported file type`);
                return false;
            }
            return true;
        });
        setPendingFiles(prev => [...prev, ...validFiles]);
        if (fileInputRef.current) fileInputRef.current.value = '';
        showToast.info(`${validFiles.length} file(s) ready to upload after invoice creation`);
    };

    const uploadPendingFiles = async (invoiceId: string) => {
        if (pendingFiles.length === 0) return;

        try {
            setUploadingFiles(true);
            for (const file of pendingFiles) {
                await uploadFile({
                    file,
                    module: 'invoice',
                    referenceId: invoiceId,
                    category: 'invoice_attachment',
                    documentType: file.type.includes('pdf') ? 'PDF' : 'Image',
                    description: `Attachment for invoice ${invoiceId}`,
                    isPublic: false,
                    isShared: false,
                    sharingLevel: 'Private',
                });
            }
            setPendingFiles([]);
            await fetchAttachments(invoiceId);
            showToast.success(`${pendingFiles.length} file(s) uploaded successfully`);
        } catch (error: any) {
            showToast.error(error.response?.data?.message || 'Failed to upload pending files');
        } finally {
            setUploadingFiles(false);
        }
    };

    const handleDeleteAttachment = async (attachmentId: string) => {
        try {
            await deleteFile(attachmentId);
            showToast.success('Attachment deleted');
            await fetchAttachments(attachments[0]?.referenceId);
        } catch (error: any) {
            showToast.error('Failed to delete attachment');
        }
    };

    const handleDownloadAttachment = async (attachment: any) => {
        try {
            console.log('📥 Downloading attachment:', attachment);
            const blob = await downloadFileinvoice(attachment.id);

            if (!blob || blob.size === 0) {
                showToast.error('File is empty or corrupted');
                return null;
            }

            // ✅ Return the blob for preview
            return blob;
        } catch (error: any) {
            console.error('Failed to download attachment:', error);
            showToast.error(error?.message || 'Failed to download attachment');
            return null;
        }
    };

    return {
        attachments,
        pendingFiles,
        uploadingFiles,
        fileInputRef,
        editFileInputRef,
        fetchAttachments,
        handleFileUpload,
        handleAddModalFileSelect,
        uploadPendingFiles,
        handleDeleteAttachment,
        handleDownloadAttachment,
        setAttachments,
        setPendingFiles,
    };
};