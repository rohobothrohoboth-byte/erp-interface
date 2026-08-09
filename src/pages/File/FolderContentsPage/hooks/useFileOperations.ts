// src/pages/file/FolderContentsPage/hooks/useFileOperations.ts
import { useState, useCallback } from 'react';

import { showToast } from '../../../../layout/layout';
import {
    uploadFile,
    deleteFile,
    downloadFile,
    moveFile,
    shareFile,
    toggleFavorite,
} from '../../../../services/fileManagement/fileManagementApi';
import { createFolder } from '../../../../services/fileManagement/folder.api';

interface UseFileOperationsProps {
    folderId: string;
    loadContents: () => Promise<void>;
    refreshFolders?: () => Promise<void>;
    onUploadComplete?: () => void;
    onSubfolderComplete?: () => void;
}

export const useFileOperations = ({
                                      folderId,
                                      loadContents,
                                      refreshFolders,
                                      onUploadComplete,
                                      onSubfolderComplete,
                                  }: UseFileOperationsProps) => {
    // Upload states
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [description, setDescription] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);

    // Subfolder states
    const [subfolderName, setSubfolderName] = useState('');
    const [subfolderDescription, setSubfolderDescription] = useState('');
    const [subfolderCategory, setSubfolderCategory] = useState('');
    const [creatingSubfolder, setCreatingSubfolder] = useState(false);
    const [showCreateSubfolderModal, setShowCreateSubfolderModal] = useState(false);

    // Move states
    const [selectedDocument, setSelectedDocument] = useState<any>(null);
    const [targetFolderId, setTargetFolderId] = useState('');
    const [showMoveModal, setShowMoveModal] = useState(false);

    // Share states
    const [shareWithEmail, setShareWithEmail] = useState('');
    const [sharePermission, setSharePermission] = useState('view');
    const [showShareModal, setShowShareModal] = useState(false);

    // ============================================================
    // FILE UPLOAD HANDLERS
    // ============================================================

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setSelectedFiles(Array.from(files));
            setShowUploadModal(true);
        }
        e.target.value = '';
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0 || !folderId) {
            showToast.warning('No files selected');
            return;
        }

        if (!selectedCategory) {
            showToast.warning('Please select a category');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        let uploadedCount = 0;
        const totalFiles = selectedFiles.length;

        try {
            for (const file of selectedFiles) {
                if (file.size > 10 * 1024 * 1024) {
                    showToast.warning(`File "${file.name}" exceeds 10MB limit, skipping...`);
                    continue;
                }

                try {
                    await uploadFile({
                        file,
                        module: 'folder',
                        referenceId: folderId,
                        category: selectedCategory,
                        documentType: file.type.includes('pdf') ? 'PDF' : file.type.split('/')[0] || 'Other',
                        description: description || file.name,
                        folderId: folderId,
                        isPublic: false,
                        isShared: false,
                        sharingLevel: 'Private',
                    });

                    uploadedCount++;
                    const progress = Math.round((uploadedCount / totalFiles) * 100);
                    setUploadProgress(progress);
                } catch (uploadError) {
                    console.error(`Failed to upload ${file.name}:`, uploadError);
                    showToast.error(`Failed to upload "${file.name}"`);
                }
            }

            if (uploadedCount > 0) {
                showToast.success(`${uploadedCount} file(s) uploaded successfully`);
                await loadContents();
                setShowUploadModal(false);
                setSelectedFiles([]);
                setSelectedCategory('');
                setDescription('');
                setUploadProgress(0);
                if (onUploadComplete) onUploadComplete();
            }
        } catch (error: any) {
            console.error('Upload failed:', error);
            showToast.error(error?.message || 'Failed to upload files');
        } finally {
            setUploading(false);
        }
    };

    // ============================================================
    // SUBFOLDER HANDLERS
    // ============================================================

    const handleCreateSubfolder = async () => {
        if (!subfolderName.trim()) {
            showToast.warning('Please enter a subfolder name');
            return;
        }

        if (!folderId) {
            showToast.error('No parent folder selected');
            return;
        }

        setCreatingSubfolder(true);
        try {
            await createFolder({
                name: subfolderName.trim(),
                description: subfolderDescription.trim(),
                folderType: subfolderCategory || 'general',
                parentId: folderId,
                isPublic: false,
                isShared: false,
                sharingLevel: 'Private',
            });

            showToast.success(`Subfolder "${subfolderName}" created successfully`);
            setShowCreateSubfolderModal(false);
            setSubfolderName('');
            setSubfolderDescription('');
            setSubfolderCategory('');
            await loadContents();
            if (refreshFolders) {
                await refreshFolders();
            }
            if (onSubfolderComplete) onSubfolderComplete();
        } catch (error: any) {
            console.error('Create subfolder failed:', error);
            showToast.error(error?.response?.data?.message || 'Failed to create subfolder');
        } finally {
            setCreatingSubfolder(false);
        }
    };

    // ============================================================
    // FILE OPERATIONS
    // ============================================================

    const handleDelete = async (doc: any) => {
        if (!window.confirm(`Are you sure you want to delete "${doc.fileName || doc.name}"?`)) return;

        try {
            await deleteFile(doc.id, false);
            showToast.success('File deleted successfully');
            await loadContents();
        } catch (error: any) {
            console.error('Delete failed:', error);
            showToast.error(error?.message || 'Failed to delete file');
        }
    };

    const handleDownload = async (doc: any) => {
        try {
            const docId = doc.id;
            const fileName = doc.fileName || doc.name || 'download';
            showToast.info(`Downloading ${fileName}...`);

            const blob = await downloadFile(docId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            showToast.success(`Downloaded: ${fileName}`);
        } catch (error: any) {
            console.error('Download failed:', error);
            showToast.error(error?.message || 'Failed to download file');
        }
    };

    const handleMove = async () => {
        if (!selectedDocument || !targetFolderId) {
            showToast.warning('Please select a target folder');
            return;
        }

        try {
            await moveFile(selectedDocument.id, targetFolderId);
            showToast.success('File moved successfully');
            setShowMoveModal(false);
            setSelectedDocument(null);
            setTargetFolderId('');
            await loadContents();
        } catch (error: any) {
            console.error('Move failed:', error);
            showToast.error(error?.message || 'Failed to move file');
        }
    };

    const handleShare = async () => {
        if (!selectedDocument || !shareWithEmail.trim()) {
            showToast.warning('Please enter an email address');
            return;
        }

        try {
            await shareFile({
                documentId: selectedDocument.id,
                sharedWithId: shareWithEmail,
                sharedWithType: 'user',
                permission: sharePermission,
                canDownload: sharePermission === 'edit' || sharePermission === 'view',
                canDelete: sharePermission === 'edit',
            });
            showToast.success(`File shared with ${shareWithEmail}`);
            setShowShareModal(false);
            setSelectedDocument(null);
            setShareWithEmail('');
            setSharePermission('view');
        } catch (error: any) {
            console.error('Share failed:', error);
            showToast.error(error?.message || 'Failed to share file');
        }
    };

    // src/pages/file/FolderContentsPage/hooks/useFileOperations.ts
// In useFileOperations.ts

    const handleToggleFavorite = useCallback(async (item: any, isFavoriteState?: boolean) => {
        try {
            console.log('🔍 [ToggleFavorite] Received item:', item);
            console.log('🔍 [ToggleFavorite] isFavoriteState:', isFavoriteState);

            // ✅ Get ID from the item
            const docId = item?.id || item?.Id || item?.documentId || item?.fileId;
            if (!docId) {
                console.error('❌ [ToggleFavorite] No ID found in item');
                showToast.warning('Cannot toggle favorite: Invalid document');
                return;
            }

            // ✅ Get name from the item
            const docName = item?.fileName || item?.name || item?.title || 'Document';

            console.log(`🔵 [ToggleFavorite] Toggling favorite for: ${docName} (${docId})`);

            // ✅ If isFavoriteState is provided, use it, otherwise call the API
            let isFavorite: boolean;
            if (typeof isFavoriteState === 'boolean') {
                isFavorite = isFavoriteState;
                console.log(`🔵 [ToggleFavorite] Using provided favorite state: ${isFavorite}`);
            } else {
                // Call the API to toggle
                const response = await toggleFavorite(docId);
                isFavorite = response?.data?.isFavorite ??
                    response?.data ??
                    response ??
                    false;
            }

            showToast.success(`${docName} ${isFavorite ? 'added to' : 'removed from'} favorites`);

            await loadContents();
            if (refreshFolders) {
                await refreshFolders();
            }

            return { id: docId, isFavorite };
        } catch (error: any) {
            console.error('❌ [ToggleFavorite] Failed:', error);
            showToast.error(error?.message || 'Failed to toggle favorite');
            throw error;
        }
    }, [loadContents, refreshFolders]);
    // ============================================================
    // MODAL CONTROLS
    // ============================================================

    const openMoveModal = (doc: any) => {
        setSelectedDocument(doc);
        setShowMoveModal(true);
    };

    const openShareModal = (doc: any) => {
        setSelectedDocument(doc);
        setShowShareModal(true);
    };

    const closeMoveModal = () => {
        setShowMoveModal(false);
        setSelectedDocument(null);
        setTargetFolderId('');
    };

    const closeShareModal = () => {
        setShowShareModal(false);
        setSelectedDocument(null);
        setShareWithEmail('');
        setSharePermission('view');
    };

    // ============================================================
    // RETURN
    // ============================================================

    return {
        // States
        selectedFiles,
        uploading,
        uploadProgress,
        selectedCategory,
        description,
        subfolderName,
        subfolderDescription,
        subfolderCategory,
        creatingSubfolder,
        selectedDocument,
        targetFolderId,
        shareWithEmail,
        sharePermission,
        showUploadModal,
        showCreateSubfolderModal,
        showMoveModal,
        showShareModal,

        // Setters
        setSelectedFiles,
        setSelectedCategory,
        setDescription,
        setSubfolderName,
        setSubfolderDescription,
        setSubfolderCategory,
        setTargetFolderId,
        setShareWithEmail,
        setSharePermission,
        setUploadProgress,
        setCreatingSubfolder,
        setShowUploadModal,
        setShowCreateSubfolderModal,

        // Handlers
        handleFileSelect,
        handleUpload,
        handleCreateSubfolder,
        handleDelete,
        handleDownload,
        handleMove,
        handleShare,
        handleToggleFavorite,
        openMoveModal,
        openShareModal,
        closeMoveModal,
        closeShareModal,
    };
};