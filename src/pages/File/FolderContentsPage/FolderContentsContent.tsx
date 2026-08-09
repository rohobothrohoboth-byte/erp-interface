// src/pages/file/FolderContentsPage/FolderContentsContent.tsx

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, FileText, Image, FileSpreadsheet, Video, Music, Archive, File, Briefcase, User, Folder } from 'lucide-react';
import { useFolders } from '../../../contexts/FolderContext';
import {
    getFolderContents,
    uploadFile,
    deleteFile,
    downloadFile,
    moveFile,
    shareFile,
} from '../../../services/fileManagement/fileManagementApi';
import { showToast } from '../../../layout/layout';
import { useLanguage } from '../../../i18n/LanguageContext';

// Components
import { Header } from './components/Header';
import { Stats } from './components/Stats';
import { CategoryFilter } from './components/CategoryFilter'; // ✅ Import CategoryFilter
import { Toolbar } from './components/Toolbar';
import { FileGrid } from './components/FileGrid';
import { FileList } from './components/FileList';
import { EmptyState } from './components/EmptyState';
import { UploadModal } from './components/UploadModal';
import { SubfolderModal } from './components/SubfolderModal';
import { MoveModal } from './components/MoveModal';
import { ShareModal } from './components/ShareModal';
import { DeleteModal } from './components/DeleteModal';

// Hooks
import { useFolderContents } from './hooks/useFolderContents';
import { useFileOperations } from './hooks/useFileOperations';

// ============================================================
// CATEGORIES
// ============================================================

const FILE_CATEGORIES = [
    { id: 'all', label: 'All Documents', icon: FileText },
    { id: 'document', label: 'Document', icon: FileText },
    { id: 'image', label: 'Image', icon: Image },
    { id: 'pdf', label: 'PDF', icon: FileText },
    { id: 'spreadsheet', label: 'Spreadsheet', icon: FileSpreadsheet },
    { id: 'presentation', label: 'Presentation', icon: FileText },
    { id: 'video', label: 'Video', icon: Video },
    { id: 'audio', label: 'Audio', icon: Music },
    { id: 'archive', label: 'Archive', icon: Archive },
    { id: 'other', label: 'Other', icon: File },
];

const FOLDER_CATEGORIES = [
    { id: 'work', label: 'Work', icon: Briefcase },

    { id: 'projects', label: 'Projects', icon: Folder },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'images', label: 'Images', icon: Image },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'archive', label: 'Archive', icon: Archive },
];

// ============================================================
// MAIN COMPONENT
// ============================================================

export const FolderContentsContent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams<{ id: string }>();
    const { t } = useLanguage();
    const { folders, refreshFolders } = useFolders();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // ✅ Use a single category state for filtering
    const [filterCategory, setFilterCategory] = useState('all');

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Custom hooks
    const {
        folder,
        subFolders,
        documents,
        loading,
        loadContents,
    } = useFolderContents(id, folders);

    const {
        showUploadModal,
        showCreateSubfolderModal,
        showMoveModal,
        showShareModal,
        selectedFiles,
        uploading,
        uploadProgress,
        selectedCategory: uploadCategory,
        description,
        subfolderName,
        subfolderDescription,
        subfolderCategory,
        creatingSubfolder,
        targetFolderId,
        shareWithEmail,
        sharePermission,
        selectedDocument,
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
        setSelectedFiles,
        setSelectedCategory,
        setDescription,
        setSubfolderName,
        setSubfolderDescription,
        setSubfolderCategory,
        setTargetFolderId,
        setShareWithEmail,
        setSharePermission,
        setShowCreateSubfolderModal,
        setUploadProgress,
        setCreatingSubfolder,
    } = useFileOperations({
        folderId: id || '',
        loadContents,
        refreshFolders,
        onUploadComplete: () => {},
        onSubfolderComplete: () => {},
    });

    // ============================================================
    // DELETE HANDLERS
    // ============================================================

    const handleDeleteClick = useCallback((doc: any) => {
        console.log('🔵 [FolderContents] Opening Delete Modal for:', doc?.name || doc?.fileName);
        setItemToDelete(doc);
        setDeleteModalOpen(true);
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        if (!itemToDelete) return;

        setIsDeleting(true);
        try {
            await deleteFile(itemToDelete.id, false);
            showToast.success('File deleted successfully');
            setDeleteModalOpen(false);
            setItemToDelete(null);
            await loadContents();
            await refreshFolders?.();
        } catch (error: any) {
            console.error('Delete failed:', error);
            showToast.error(error?.message || 'Failed to delete file');
        } finally {
            setIsDeleting(false);
        }
    }, [itemToDelete, loadContents, refreshFolders]);

    const handleDeleteCancel = useCallback(() => {
        setDeleteModalOpen(false);
        setItemToDelete(null);
    }, []);

    // ============================================================
    // SHARE HANDLERS
    // ============================================================

    const handleInternalShare = useCallback((userId: string, permission: string) => {
        console.log('🔵 [FolderContents] Internal share:', { userId, permission });

        if (!selectedDocument) {
            showToast.warning('No document selected');
            return;
        }

        const user = availableUsers.find(u => u.id === userId);
        if (user) {
            shareFile({
                documentId: selectedDocument.id || selectedDocument.Id,
                sharedWithId: userId,
                sharedWithType: 'user',
                permission: permission,
                canDownload: permission === 'edit' || permission === 'download',
                canDelete: permission === 'edit',
            })
                .then(() => {
                    showToast.success(`File shared with ${user.name}`);
                    closeShareModal();
                })
                .catch((error) => {
                    console.error('Internal share failed:', error);
                    showToast.error('Failed to share internally');
                });
        }
    }, [selectedDocument, closeShareModal]);

    const handleSocialShare = useCallback((platform: string) => {
        console.log('🔵 [FolderContents] Social share:', platform);
        const url = window.location.href;
        const text = `Check out this file: ${selectedDocument?.name || 'Document'}`;

        const shareUrls: Record<string, string> = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`,
            telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
            email_share: `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`,
        };

        const shareUrl = shareUrls[platform];
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
            showToast.success(`Opened share dialog for ${platform}`);
        } else {
            showToast.warning(`Share option for ${platform} not available`);
        }
    }, [selectedDocument]);

    const handleCopyLink = useCallback(() => {
        const url = window.location.href;
        navigator.clipboard.writeText(url)
            .then(() => {
                showToast.success('Link copied to clipboard!');
            })
            .catch(() => {
                const textArea = document.createElement('textarea');
                textArea.value = url;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showToast.success('Link copied to clipboard!');
            });
    }, []);

    const handlePublicShare = useCallback(async (isPublic: boolean) => {
        console.log('🔵 [FolderContents] Public share:', isPublic);

        if (!selectedDocument) {
            showToast.warning('No document selected');
            return;
        }

        try {
            const docId = selectedDocument.id || selectedDocument.Id;

            const response = await fetch(`/api/file/v1/documents/${docId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({
                    isPublic: isPublic,
                    sharingLevel: isPublic ? 'Public' : 'Private'
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update public status');
            }

            showToast.success(isPublic ? 'File is now public' : 'File is now private');
            await loadContents();
        } catch (error: any) {
            console.error('Public share toggle failed:', error);
            showToast.error(error?.message || 'Failed to update public status');
        }
    }, [selectedDocument, loadContents]);

    // ============================================================
    // AVAILABLE USERS
    // ============================================================

    const availableUsers = useMemo(() => [
        { id: 'user1', name: 'John Doe', email: 'john@example.com' },
        { id: 'user2', name: 'Jane Smith', email: 'jane@example.com' },
        { id: 'user3', name: 'Bob Johnson', email: 'bob@example.com' },
        { id: 'user4', name: 'Alice Williams', email: 'alice@example.com' },
        { id: 'user5', name: 'Charlie Brown', email: 'charlie@example.com' },
    ], []);

    // ============================================================
    // HANDLERS
    // ============================================================

    const handleOpenMoveModal = useCallback((doc: any) => {
        console.log('🔵 [FolderContents] Opening Move Modal for:', doc?.name || doc?.fileName);
        openMoveModal(doc);
    }, [openMoveModal]);

    const handleOpenShareModal = useCallback((doc: any) => {
        console.log('🔵 [FolderContents] Opening Share Modal for:', doc?.name || doc?.fileName);
        openShareModal(doc);
    }, [openShareModal]);

    const handleBack = useCallback(() => {
        const from = location.state?.from;
        if (from) {
            navigate(from);
        } else {
            navigate(-1);
        }
    }, [location, navigate]);

    const handleRefresh = async () => {
        await loadContents();
        await refreshFolders?.();
        showToast.success('Refreshed');
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    // ============================================================
    // DERIVED DATA
    // ============================================================

    const allItems = useMemo(() => {
        const folders = subFolders.map(f => ({ ...f, type: 'folder' }));
        const docs = documents.map(d => ({ ...d, type: 'document' }));
        return [...folders, ...docs];
    }, [subFolders, documents]);

    // ✅ Filter items by category and search - using filterCategory
    const filteredItems = useMemo(() => {
        let items = allItems;

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            items = items.filter(item =>
                item.name?.toLowerCase().includes(term)
            );
        }

        // ✅ Filter by category - ONLY for documents, always show folders
        if (filterCategory !== 'all') {
            items = items.filter(item => {
                // Always show folders
                if (item.type === 'folder') return true;
                // Filter documents by category
                const category = (item.category || item.documentType || '').toLowerCase();
                return category === filterCategory ||
                    category.includes(filterCategory) ||
                    (item.documentType || '').toLowerCase().includes(filterCategory);
            });
        }

        // Sort
        items.sort((a, b) => {
            let aVal: any, bVal: any;
            switch (sortBy) {
                case 'name':
                    aVal = (a.name || '').toLowerCase();
                    bVal = (b.name || '').toLowerCase();
                    break;
                case 'size':
                    aVal = a.size || a.fileSize || 0;
                    bVal = b.size || b.fileSize || 0;
                    break;
                case 'date':
                default:
                    aVal = new Date(a.updatedAt || a.createdAt || 0);
                    bVal = new Date(b.updatedAt || b.createdAt || 0);
                    break;
            }
            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return items;
    }, [allItems, searchTerm, filterCategory, sortBy, sortOrder]);

    const stats = {
        totalFolders: subFolders.length,
        totalDocuments: documents.length,
        totalItems: allItems.length,
    };

    const availableFolders = folders.filter(f => f.id !== id);

    // ============================================================
    // LOADING STATE
    // ============================================================

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
            </div>
        );
    }

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <Header
                folder={folder}
                onBack={handleBack}
                onRefresh={handleRefresh}
                onUpload={handleUploadClick}
                onNewSubfolder={() => setShowCreateSubfolderModal(true)}
                fileInputRef={fileInputRef}
                onFileSelect={handleFileSelect}
                currentPath={location.pathname}
            />

            {/* Stats */}
            <Stats stats={stats} />

            {/* ✅ Category Filter - Uses filterCategory */}
            <CategoryFilter
                selectedCategory={filterCategory}
                onCategoryChange={setFilterCategory}
                categories={FILE_CATEGORIES}
            />

            {/* Toolbar */}
            <Toolbar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                sortOrder={sortOrder}
                onSortOrderChange={setSortOrder}
            />

            {/* Items Display */}
            {filteredItems.length === 0 ? (
                <EmptyState onUpload={handleUploadClick} />
            ) : viewMode === 'grid' ? (
                <FileGrid
                    items={filteredItems}
                    onFolderClick={(id) => navigate(`/folder/${id}`)}
                    onDocumentClick={(id) => navigate(`/document/${id}`)}
                    onDownload={handleDownload}
                    onDelete={handleDeleteClick}
                    onMove={handleOpenMoveModal}
                    onShare={handleOpenShareModal}
                    onFavorite={handleToggleFavorite}
                />
            ) : (
                <FileList
                    items={filteredItems}
                    onFolderClick={(id) => navigate(`/folder/${id}`)}
                    onDocumentClick={(id) => navigate(`/document/${id}`)}
                    onDownload={handleDownload}
                    onDelete={handleDeleteClick}
                    onMove={handleOpenMoveModal}
                    onShare={handleOpenShareModal}
                    onFavorite={handleToggleFavorite}
                />
            )}

            {/* ========================================================== */}
            {/* MODALS */}
            {/* ========================================================== */}

            {/* Upload Modal */}
            <UploadModal
                isOpen={showUploadModal}
                onClose={() => {
                    setShowUploadModal(false);
                    setSelectedCategory(''); // ✅ Reset upload category
                }}
                selectedFiles={selectedFiles}
                onRemoveFile={(index) => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                selectedCategory={uploadCategory} // ✅ Use uploadCategory from useFileOperations
                onCategoryChange={setSelectedCategory} // ✅ Use setSelectedCategory from useFileOperations
                description={description}
                onDescriptionChange={setDescription}
                uploading={uploading}
                uploadProgress={uploadProgress}
                onUpload={handleUpload}
                onFileSelect={handleFileSelect}
                FILE_CATEGORIES={FILE_CATEGORIES}
            />

            {/* Subfolder Modal */}
            <SubfolderModal
                isOpen={showCreateSubfolderModal}
                onClose={() => setShowCreateSubfolderModal(false)}
                folderName={subfolderName}
                onFolderNameChange={setSubfolderName}
                description={subfolderDescription}
                onDescriptionChange={setSubfolderDescription}
                category={subfolderCategory}
                onCategoryChange={setSubfolderCategory}
                creating={creatingSubfolder}
                onCreate={handleCreateSubfolder}
                parentFolderName={folder?.name}
                FOLDER_CATEGORIES={FOLDER_CATEGORIES}
            />

            {/* Move Modal */}
            <MoveModal
                isOpen={showMoveModal}
                onClose={closeMoveModal}
                document={selectedDocument}
                targetFolderId={targetFolderId}
                onTargetFolderChange={setTargetFolderId}
                availableFolders={availableFolders}
                onMove={() => {
                    console.log('🔵 [FolderContents] Move button clicked in modal');
                    handleMove();
                }}
            />

            {/* Delete Modal */}
            <DeleteModal
                isOpen={deleteModalOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                itemName={itemToDelete?.fileName || itemToDelete?.name || 'Untitled'}
                itemType="file"
                isDeleting={isDeleting}
                permanent={false}
            />

            {/* Share Modal */}
            <ShareModal
                isOpen={showShareModal}
                onClose={() => {
                    console.log('🔵 [FolderContents] Closing Share Modal');
                    closeShareModal();
                }}
                document={selectedDocument}
                shareWithEmail={shareWithEmail}
                onEmailChange={(email) => {
                    console.log('🔵 [FolderContents] Share email changed:', email);
                    setShareWithEmail(email);
                }}
                sharePermission={sharePermission}
                onPermissionChange={(permission) => {
                    console.log('🔵 [FolderContents] Share permission changed:', permission);
                    setSharePermission(permission);
                }}
                onShare={() => {
                    console.log('🔵 [FolderContents] Share button clicked in modal');
                    handleShare();
                }}
                onInternalShare={handleInternalShare}
                onSocialShare={handleSocialShare}
                onCopyLink={handleCopyLink}
                onPublicShare={handlePublicShare}
                availableUsers={availableUsers}
                isPublic={selectedDocument?.isPublic || false}
                isShared={selectedDocument?.isShared || false}
                sharingLevel={selectedDocument?.sharingLevel || 'Private'}
            />
        </motion.div>
    );
};

export default FolderContentsContent;