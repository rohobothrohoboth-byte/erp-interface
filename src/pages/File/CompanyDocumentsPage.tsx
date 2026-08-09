// src/pages/file/CompanyDocuments/CompanyDocumentsPage.tsx

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Loader2, FolderPlus } from 'lucide-react';
import { useDocuments } from '../../contexts/DocumentContext';
import { DocumentProvider } from '../../contexts/DocumentContext';
import { useFolders } from '../../contexts/FolderContext';
import { FolderProvider } from '../../contexts/FolderContext';
import { showToast } from '../../layout/layout';

// Components
import { Header } from './CompanyDocuments/components/Header';
import { Stats } from './CompanyDocuments/components/Stats';
import { Toolbar } from './CompanyDocuments/components/Toolbar';
import { DocumentListView } from './CompanyDocuments/components/DocumentListView';
import { DocumentGridView } from './CompanyDocuments/components/DocumentGridView';
import { EmptyState } from './CompanyDocuments/components/EmptyState';
import { DetailModal } from './CompanyDocuments/components/DetailModal';
import { ShareModal } from './CompanyDocuments/components/ShareModal';
import { MoveModal } from './CompanyDocuments/components/MoveModal';
import { SubfolderModal } from './CompanyDocuments/components/SubfolderModal';
import { CreateFolderModal } from './CompanyDocuments/components/CreateFolderModal';
import { CompanyCategoryFilter } from './CompanyDocuments/components/CategoryFilter'; // ✅ Fixed import
import { UploadModal } from './CompanyDocuments/components/UploadModal'; // ✅ Fixed import
import { COMPANY_CATEGORIES } from '../../constants/file/CompanyDocuments/categories';

// Types
import type { ViewMode, SortBy, SortOrder, CompanyDocument, CompanyDocumentStats } from '../../types/file/CompanyDocuments/index';

// Helpers
import { getDocProperty, getId, getIsFavorite, getSizeBytes, getUpdatedAt } from '../../utils/file/CompanyDocuments/helpers';

// ============================================================
// MAIN CONTENT COMPONENT
// ============================================================

const CompanyDocumentsContent = () => {
    const navigate = useNavigate();

    const {
        documents = [],
        loading: documentsLoading = true,
        searchTerm = '',
        setSearchTerm,
        deleteDocument,
        toggleFavorite,
        downloadDocument,
        refreshDocuments,
        moveDocument,
        shareDocument,
        createSubfolder,
        uploadDocument,
    } = useDocuments() || {};

    const {
        folders = [],
        rootFolders = [],
        loading: foldersLoading = false,
        createFolder,
        deleteFolder,
        refreshFolders,
        refreshRoots,
    } = useFolders() || {};

    // State
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showMoveModal, setShowMoveModal] = useState(false);
    const [showSubfolderModal, setShowSubfolderModal] = useState(false);
    const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedDoc, setSelectedDoc] = useState<CompanyDocument | null>(null);
    const [sortBy, setSortBy] = useState<SortBy>('date');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [description, setDescription] = useState('');
    const [sharing, setSharing] = useState(false);
    const [moving, setMoving] = useState(false);
    const [creating, setCreating] = useState(false);
    const [availableFolders, setAvailableFolders] = useState<any[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const [allItems, setAllItems] = useState<any[]>([]);
    const [selectedUploadFolderId, setSelectedUploadFolderId] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [uploadCategory, setUploadCategory] = useState('');

    // ✅ Get ONLY company folders and their subfolders
    const companyFolders = useMemo(() => {
        const sourceFolders = rootFolders.length > 0 ? rootFolders : folders;

        const companyRootFolders = sourceFolders.filter(f => {
            const type = (f.folderType || f.type || '').toLowerCase();
            return type === 'company' || type === 'Company';
        });

        const companyFolderIds = new Set(companyRootFolders.map(f => f.id));
        const allCompanyFolders: any[] = [...companyRootFolders];

        const getSubFolders = (parentId: string) => {
            const children = sourceFolders.filter(f => f.parentId === parentId);
            children.forEach(child => {
                if (!companyFolderIds.has(child.id)) {
                    companyFolderIds.add(child.id);
                    allCompanyFolders.push(child);
                    getSubFolders(child.id);
                }
            });
        };

        companyRootFolders.forEach(f => getSubFolders(f.id));

        return allCompanyFolders;
    }, [folders, rootFolders]);

    // ✅ Get available folders for upload
    const uploadFolders = useMemo(() => {
        return companyFolders.map(f => ({
            id: f.id,
            name: f.name,
            type: f.folderType || f.type || 'company',
            parentId: f.parentId,
        }));
    }, [companyFolders]);

    // Load data on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                if (refreshRoots) await refreshRoots();
                if (refreshFolders) await refreshFolders();
                if (refreshDocuments) await refreshDocuments();
                setIsInitialized(true);
            } catch (error) {
                showToast.error('Failed to load data');
            }
        };
        loadData();
    }, []);

    // ✅ Combine folders and documents
    useEffect(() => {
        const folderItems = companyFolders.map(f => ({
            ...f,
            type: 'folder',
            name: f.name || 'Unnamed Folder',
            id: f.id,
            description: f.description || '',
            size: 0,
            fileSize: 0,
            fileSizeFormatted: '0 KB',
            contentType: 'folder',
            fileType: 'folder',
            mimeType: 'folder',
            category: f.folderType || 'folder',
            documentType: 'folder',
            isFavorite: false,
            updatedAt: f.updatedAt || f.dateMod || f.createdAt || new Date().toISOString(),
            createdAt: f.createdAt || f.dateAdd || new Date().toISOString(),
            uploadedBy: f.owner || f.ownerId || 'System',
            documentCount: f.documentCount || 0,
            subFolderCount: f.subFolderCount || 0,
            items: (f.documentCount || 0) + (f.subFolderCount || 0),
            parentId: f.parentId,
        }));

        const docItems = documents
            .filter((doc: any) => {
                const module = getDocProperty(doc, 'module') || '';
                const category = getDocProperty(doc, 'category') || '';
                const docType = getDocProperty(doc, 'documentType') || '';
                const folderId = getDocProperty(doc, 'folderId') || '';

                const isCompany = module === 'company' ||
                    category === 'company' ||
                    category === 'company_document' ||
                    docType === 'company';

                const isInRoot = !folderId || folderId === '' || folderId === null || folderId === 'null';

                return isCompany && isInRoot;
            })
            .map((doc: any) => ({
                ...doc,
                type: 'document',
                name: getDocProperty(doc, 'name') || getDocProperty(doc, 'fileName') || 'Untitled',
                id: doc.id || doc.Id,
                size: getSizeBytes(doc),
                fileSize: getSizeBytes(doc),
                fileSizeFormatted: getDocProperty(doc, 'fileSizeFormatted') || '0 KB',
                contentType: getDocProperty(doc, 'contentType') || getDocProperty(doc, 'fileType') || '',
                isFavorite: getIsFavorite(doc),
                updatedAt: getUpdatedAt(doc),
                createdAt: getDocProperty(doc, 'createdAt') || getDocProperty(doc, 'uploadedAt') || new Date().toISOString(),
                uploadedBy: getDocProperty(doc, 'uploadedBy') || getDocProperty(doc, 'uploadedByName') || 'Unknown',
                category: getDocProperty(doc, 'category') || getDocProperty(doc, 'documentType') || 'other',
                description: getDocProperty(doc, 'description') || '',
            }));

        setAllItems([...folderItems, ...docItems]);
    }, [companyFolders, documents]);

    // Filter and sort items
    const filteredItems = useMemo(() => {
        let items = allItems;

        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            items = items.filter(item =>
                (item.name || '').toLowerCase().includes(search) ||
                (item.description || '').toLowerCase().includes(search)
            );
        }

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
    }, [allItems, searchTerm, sortBy, sortOrder]);

    // Stats
    const stats: CompanyDocumentStats = useMemo(() => {
        const total = filteredItems.length;
        const totalSize = filteredItems.reduce((acc, item) => {
            const size = item.size || item.fileSize || 0;
            return acc + (typeof size === 'number' ? size : 0);
        }, 0);
        const favorites = filteredItems.filter(item => item.isFavorite).length;
        const recent = filteredItems.filter(item => {
            const date = new Date(item.updatedAt || item.createdAt || 0);
            const daysAgo = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
            return daysAgo < 7;
        }).length;
        return { total, totalSize, favorites, recent };
    }, [filteredItems]);

    // ============================================================
    // HANDLERS
    // ============================================================

    const handleFileSelect = (file: File | null) => {
        setSelectedFile(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            showToast.warning('Please select a file first');
            return;
        }

        if (!selectedUploadFolderId) {
            showToast.warning('Please select a folder to upload to');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            await uploadDocument({
                file: selectedFile,
                module: 'company',
                category: uploadCategory || 'company_document', // ✅ Use uploadCategory
                documentType: selectedFile.type.includes('pdf') ? 'PDF' : selectedFile.type.split('/')[0] || 'Other',
                description: description || selectedFile.name,
                isPublic: true,
                isShared: true,
                sharingLevel: 'Company',
                folderId: selectedUploadFolderId,
            }, (progress: number) => {
                setUploadProgress(progress);
            });

            showToast.success(`File "${selectedFile.name}" uploaded successfully`);

            setShowUploadModal(false);
            setSelectedFile(null);
            setDescription('');
            setUploadProgress(0);
            setSelectedUploadFolderId(null);
            setUploadCategory('');

            if (refreshDocuments) await refreshDocuments();
            if (refreshFolders) await refreshFolders();
            if (refreshRoots) await refreshRoots();
        } catch (error: any) {
            showToast.error(error?.message || 'Failed to upload file');
            setUploadProgress(0);
        } finally {
            setUploading(false);
        }
    };

    const handleCreateFolder = async (data: { name: string; description: string; folderType: string }) => {
        if (!createFolder) {
            showToast.error('Folder creation is not available');
            return;
        }

        setCreating(true);
        try {
            await createFolder({
                name: data.name,
                description: data.description,
                folderType: 'company',
                isPublic: true,
                isShared: true,
                sharingLevel: 'Company',
            });
            showToast.success(`Folder "${data.name}" created successfully`);
            setShowCreateFolderModal(false);
            if (refreshFolders) await refreshFolders();
            if (refreshRoots) await refreshRoots();
            if (refreshDocuments) await refreshDocuments();
        } catch (error: any) {
            showToast.error(error?.message || 'Failed to create folder');
        } finally {
            setCreating(false);
        }
    };

    const handleItemClick = (item: any) => {
        if (item.type === 'folder') {
            navigate(`/folder/${item.id}`);
        } else {
            setSelectedDoc(item);
            setShowDetailModal(true);
        }
    };

    const handleDownload = async (item: any) => {
        if (item.type === 'folder') {
            navigate(`/folder/${item.id}`);
            return;
        }

        try {
            const id = getId(item);
            const name = getDocProperty(item, 'name') || getDocProperty(item, 'fileName') || 'Unknown';
            if (!id) {
                showToast.error('Invalid document ID');
                return;
            }
            await downloadDocument(id, name);
            showToast.success(`Downloaded: ${name}`);
        } catch (error: any) {
            showToast.error(error?.message || 'Failed to download document');
        }
    };

    const handleDelete = async (item: any) => {
        if (item.type === 'folder') {
            if (window.confirm(`Are you sure you want to delete the folder "${item.name}"?`)) {
                try {
                    await deleteFolder(item.id);
                    showToast.success(`Folder "${item.name}" deleted`);
                    if (refreshFolders) await refreshFolders();
                    if (refreshRoots) await refreshRoots();
                } catch (error: any) {
                    showToast.error(error?.message || 'Failed to delete folder');
                }
            }
            return;
        }

        const name = getDocProperty(item, 'name') || getDocProperty(item, 'fileName') || 'Unknown';
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            try {
                const id = getId(item);
                await deleteDocument(id);
                showToast.success('Document deleted');
                setShowDetailModal(false);
                if (refreshDocuments) await refreshDocuments();
            } catch (error) {
                showToast.error('Failed to delete document');
            }
        }
    };

    const handleToggleFavorite = async (item: any) => {
        if (item.type === 'folder') return;

        try {
            const id = getId(item);
            await toggleFavorite(id);
        } catch (error) {
            showToast.error('Failed to toggle favorite');
        }
    };

    const handleViewDetails = (item: any) => {
        if (item.type === 'folder') {
            navigate(`/folder/${item.id}`);
            return;
        }
        setSelectedDoc(item);
        setShowDetailModal(true);
    };

    const handleSortOrderToggle = () => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    const handleShareClick = (item: any) => {
        if (item.type === 'folder') {
            showToast.info(`Share folder: ${item.name}`);
            return;
        }
        setSelectedDoc(item);
        setShowShareModal(true);
    };

    const handleShare = async (data: { sharedWith: string; permission: string }) => {
        if (!selectedDoc) return;
        setSharing(true);
        try {
            await shareDocument(selectedDoc.id, data.sharedWith, data.permission);
            showToast.success(`Document shared with ${data.sharedWith}`);
            setShowShareModal(false);
            setSelectedDoc(null);
        } catch (error: any) {
            showToast.error(error?.message || 'Failed to share document');
        } finally {
            setSharing(false);
        }
    };

    const handleMoveClick = (item: any) => {
        if (item.type === 'folder') {
            showToast.info(`Move folder: ${item.name}`);
            return;
        }
        setSelectedDoc(item);
        loadAvailableFolders();
        setShowMoveModal(true);
    };

    const loadAvailableFolders = async () => {
        try {
            const allFolders = rootFolders.length > 0 ? rootFolders : folders;
            const currentFolderId = selectedDoc?.folderId || selectedDoc?.FolderId;
            const available = allFolders.filter(f => f.id !== currentFolderId);

            const formattedFolders = available.map(f => ({
                id: f.id,
                name: f.name,
                type: f.folderType || f.type || 'general'
            }));

            setAvailableFolders(formattedFolders);
        } catch (error) {
            const allFolders = rootFolders.length > 0 ? rootFolders : folders;
            setAvailableFolders(allFolders);
        }
    };

    const handleMove = async (targetFolderId: string | null) => {
        if (!selectedDoc) return;
        setMoving(true);
        try {
            await moveDocument(selectedDoc.id, targetFolderId);
            showToast.success('Document moved successfully');
            setShowMoveModal(false);
            setSelectedDoc(null);
            if (refreshDocuments) await refreshDocuments();
            if (refreshFolders) await refreshFolders();
        } catch (error: any) {
            showToast.error(error?.message || 'Failed to move document');
        } finally {
            setMoving(false);
        }
    };

    const handleCreateSubfolder = async (data: { name: string; description: string; folderType?: string }) => {
        setCreating(true);
        try {
            await createSubfolder(data);
            showToast.success(`Subfolder "${data.name}" created successfully`);
            setShowSubfolderModal(false);
            if (refreshDocuments) await refreshDocuments();
            if (refreshFolders) await refreshFolders();
        } catch (error: any) {
            showToast.error(error?.message || 'Failed to create subfolder');
        } finally {
            setCreating(false);
        }
    };

    const loading = documentsLoading || foldersLoading;

    // ============================================================
    // RENDER
    // ============================================================

    if (loading && !isInitialized) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <Header
                onUpload={() => setShowUploadModal(true)}
                onNewFolder={() => setShowCreateFolderModal(true)}
            />

            <Stats stats={stats} />

            {/* ✅ Company Category Filter - Moved here (before Toolbar) */}
            <CompanyCategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
            />

            <Toolbar
                searchTerm={searchTerm || ''}
                onSearchChange={setSearchTerm || (() => {})}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                sortOrder={sortOrder}
                onSortOrderChange={handleSortOrderToggle}
            />

            {filteredItems.length === 0 ? (
                <EmptyState
                    onUpload={() => setShowUploadModal(true)}
                    onNewFolder={() => setShowCreateFolderModal(true)}
                />
            ) : viewMode === 'list' ? (
                <DocumentListView
                    documents={filteredItems}
                    onDownload={handleDownload}
                    onToggleFavorite={handleToggleFavorite}
                    onDelete={handleDelete}
                    onViewDetails={handleViewDetails}
                    onShare={handleShareClick}
                    onMove={handleMoveClick}
                    onFavorite={handleToggleFavorite}
                    onItemClick={handleItemClick}
                />
            ) : (
                <DocumentGridView
                    documents={filteredItems}
                    onDownload={handleDownload}
                    onToggleFavorite={handleToggleFavorite}
                    onDelete={handleDelete}
                    onViewDetails={handleViewDetails}
                    onShare={handleShareClick}
                    onMove={handleMoveClick}
                    onFavorite={handleToggleFavorite}
                    onItemClick={handleItemClick}
                />
            )}

            {/* Upload Modal */}
            <UploadModal
                isOpen={showUploadModal}
                onClose={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                    setUploadProgress(0);
                    setUploadCategory('');
                    setDescription('');
                    setSelectedUploadFolderId(null);
                }}
                onUpload={handleUpload}
                selectedFile={selectedFile}
                onFileSelect={handleFileSelect}
                selectedCategory={uploadCategory}
                onCategoryChange={setUploadCategory}
                description={description}
                onDescriptionChange={setDescription}
                uploading={uploading}
                uploadProgress={uploadProgress}
                selectedFolderId={selectedUploadFolderId}
                onFolderChange={setSelectedUploadFolderId}
                availableFolders={uploadFolders}
            />

            <DetailModal
                isOpen={showDetailModal}
                onClose={() => {
                    setShowDetailModal(false);
                    setSelectedDoc(null);
                }}
                document={selectedDoc}
                onDownload={handleDownload}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDelete}
                onShare={handleShareClick}
                onMove={handleMoveClick}
            />

            <ShareModal
                isOpen={showShareModal}
                onClose={() => {
                    setShowShareModal(false);
                    setSelectedDoc(null);
                }}
                document={selectedDoc}
                onShare={handleShare}
                sharing={sharing}
            />

            <MoveModal
                isOpen={showMoveModal}
                onClose={() => {
                    setShowMoveModal(false);
                    setSelectedDoc(null);
                }}
                onMove={handleMove}
                document={selectedDoc}
                folders={availableFolders}
                moving={moving}
            />

            <SubfolderModal
                isOpen={showSubfolderModal}
                onClose={() => setShowSubfolderModal(false)}
                onCreate={handleCreateSubfolder}
                parentFolder={{ name: 'Company Documents' }}
                creating={creating}
            />

            <CreateFolderModal
                isOpen={showCreateFolderModal}
                onClose={() => setShowCreateFolderModal(false)}
                onCreate={handleCreateFolder}
                creating={creating}
            />
        </motion.div>
    );
};

export default function CompanyDocumentsPage() {
    return (
        <FolderProvider>
            <DocumentProvider>
                <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
                    <div className="container mx-auto px-4 py-6 max-w-7xl">
                        <CompanyDocumentsContent />
                    </div>
                </div>
            </DocumentProvider>
        </FolderProvider>
    );
}