// src/pages/file/CompanyFolders/CompanyFoldersPage.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useFolders } from '../../contexts/FolderContext';
import { FolderProvider } from '../../contexts/FolderContext';
import { showToast } from '../../layout/layout';
import { useLanguage } from '../../i18n/LanguageContext';

// Components
import { Header } from './CompanyFolders/components/Header';
import { Stats } from './CompanyFolders/components/Stats';
import { Toolbar } from './CompanyFolders/components/Toolbar';
import { FolderListView } from './CompanyFolders/components/FolderListView';
import { FolderGridView } from './CompanyFolders/components/FolderGridView';
import { EmptyState } from './CompanyFolders/components/EmptyState';
import { CreateFolderModal } from './CompanyFolders/components/CreateFolderModal';
import { EditFolderModal } from './CompanyFolders/components/EditFolderModal';
import { DetailModal } from './CompanyFolders/components/DetailModal';
import { ShareModal } from './CompanyFolders/components/ShareModal';
import { SubfolderModal } from './CompanyFolders/components/SubfolderModal';
import { MoveModal } from './CompanyFolders/components/MoveModal';

// Types
import type { ViewMode, SortBy, SortOrder, CompanyFolder, CompanyFolderStats } from '../../types/file/CompanyFolders/index';

// Helpers
import { isFolderCompany, getItemCount, getFolderUpdatedAt } from '../../utils/file/CompanyFolders/helpers';

// ============================================================
// MAIN CONTENT COMPONENT
// ============================================================

const CompanyFoldersContent = () => {
    const { t } = useLanguage();
    const {
        folders = [],
        rootFolders = [],
        loading = false,
        searchTerm = '',
        setSearchTerm,
        createFolder,
        deleteFolder,
        updateFolder,
        refreshFolders,
        refreshRoots
    } = useFolders() || {};

    // State
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [sortBy, setSortBy] = useState<SortBy>('date');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showSubfolderModal, setShowSubfolderModal] = useState(false);
    const [showMoveModal, setShowMoveModal] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState<CompanyFolder | null>(null);
    const [editingFolder, setEditingFolder] = useState<CompanyFolder | null>(null);
    const [creating, setCreating] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [sharing, setSharing] = useState(false);
    const [moving, setMoving] = useState(false);

    // ✅ Filter company folders
    const companyFolders = useMemo(() => {
        const sourceFolders = rootFolders.length > 0 ? rootFolders : folders;
        return sourceFolders.filter(f => isFolderCompany(f));
    }, [folders, rootFolders]);

    // ✅ Filter and sort folders
    const filteredFolders = useMemo(() => {
        let result = companyFolders.filter(f => {
            if (!searchTerm) return true;
            const name = f.name || '';
            const desc = f.description || '';
            const search = searchTerm.toLowerCase();
            return name.toLowerCase().includes(search) || desc.toLowerCase().includes(search);
        });

        result.sort((a, b) => {
            let aVal: any, bVal: any;
            switch (sortBy) {
                case 'name':
                    aVal = (a.name || '').toLowerCase();
                    bVal = (b.name || '').toLowerCase();
                    break;
                case 'items':
                    aVal = getItemCount(a);
                    bVal = getItemCount(b);
                    break;
                case 'date':
                default:
                    aVal = new Date(getFolderUpdatedAt(a));
                    bVal = new Date(getFolderUpdatedAt(b));
                    break;
            }
            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [companyFolders, searchTerm, sortBy, sortOrder]);

    // ✅ Stats
    const stats: CompanyFolderStats = useMemo(() => {
        const total = filteredFolders.length;
        const totalItems = filteredFolders.reduce((acc, f) => acc + getItemCount(f), 0);
        const recent = filteredFolders.filter(f => {
            const date = new Date(getFolderUpdatedAt(f));
            const daysAgo = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
            return daysAgo < 7;
        }).length;
        return { total, totalItems, recent };
    }, [filteredFolders]);

    // ============================================================
    // HANDLERS
    // ============================================================

    const handleCreateFolder = async (data: { name: string; description: string; folderType: string }) => {
        setCreating(true);
        try {
            await createFolder({
                name: data.name,
                description: data.description,
                folderType: data.folderType,
                isPublic: true,
                isShared: true,
                sharingLevel: 'Company',
            });
            showToast.success(`Folder "${data.name}" created successfully`);
            setShowCreateModal(false);
            await refreshFolders?.();
            await refreshRoots?.();
        } catch (error: any) {
            showToast.error(error?.message || 'Failed to create folder');
        } finally {
            setCreating(false);
        }
    };

    const handleUpdateFolder = async (data: { name: string; description: string; folderType: string }) => {
        if (!editingFolder) return;
        setCreating(true);
        try {
            await updateFolder(editingFolder.id, {
                name: data.name,
                description: data.description,
                folderType: data.folderType,
            });
            showToast.success('Folder updated successfully');
            setShowEditModal(false);
            setEditingFolder(null);
            await refreshFolders?.();
            await refreshRoots?.();
        } catch (error: any) {
            showToast.error(error?.message || 'Failed to update folder');
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteFolder = async (folder: CompanyFolder) => {
        if (window.confirm(`Are you sure you want to delete the folder "${folder.name}"? This action cannot be undone.`)) {
            setDeletingId(folder.id);
            try {
                await deleteFolder(folder.id);
                showToast.success(`Folder "${folder.name}" deleted successfully`);
                setShowDetailModal(false);
                await refreshFolders?.();
                await refreshRoots?.();
            } catch (error: any) {
                showToast.error(error?.message || 'Failed to delete folder');
            } finally {
                setDeletingId(null);
            }
        }
    };

    const handleShareFolder = async (data: { sharedWith: string; permission: string }) => {
        setSharing(true);
        try {
            // Implement share logic here
            showToast.success(`Folder shared with ${data.sharedWith}`);
            setShowShareModal(false);
        } catch (error: any) {
            showToast.error(error?.message || 'Failed to share folder');
        } finally {
            setSharing(false);
        }
    };

    const handleMoveFolder = async (targetFolderId: string | null) => {
        if (!selectedFolder) return;
        setMoving(true);
        try {
            // Implement move logic here
            showToast.success(`Folder moved successfully`);
            setShowMoveModal(false);
            await refreshFolders?.();
            await refreshRoots?.();
        } catch (error: any) {
            showToast.error(error?.message || 'Failed to move folder');
        } finally {
            setMoving(false);
        }
    };

    // ============================================================
    // RENDER
    // ============================================================

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <Header onNewFolder={() => setShowCreateModal(true)} />
            <Stats stats={stats} />
            <Toolbar
                searchTerm={searchTerm || ''}
                onSearchChange={setSearchTerm || (() => {})}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                sortOrder={sortOrder}
                onSortOrderChange={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            />

            {filteredFolders.length === 0 ? (
                <EmptyState onCreateFolder={() => setShowCreateModal(true)} />
            ) : viewMode === 'grid' ? (
                <FolderGridView
                    folders={filteredFolders}
                    onViewDetails={(f) => { setSelectedFolder(f); setShowDetailModal(true); }}
                    onEdit={(f) => { setEditingFolder(f); setShowEditModal(true); }}
                    onDelete={handleDeleteFolder}
                    deletingId={deletingId}
                />
            ) : (
                <FolderListView
                    folders={filteredFolders}
                    onViewDetails={(f) => { setSelectedFolder(f); setShowDetailModal(true); }}
                    onEdit={(f) => { setEditingFolder(f); setShowEditModal(true); }}
                    onDelete={handleDeleteFolder}
                    deletingId={deletingId}
                />
            )}

            {/* Modals */}
            <CreateFolderModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreate={handleCreateFolder}
                creating={creating}
            />

            <EditFolderModal
                isOpen={showEditModal}
                onClose={() => { setShowEditModal(false); setEditingFolder(null); }}
                onUpdate={handleUpdateFolder}
                folder={editingFolder}
                saving={creating}
            />

            <DetailModal
                isOpen={showDetailModal}
                onClose={() => { setShowDetailModal(false); setSelectedFolder(null); }}
                folder={selectedFolder}
                onEdit={(f) => { setEditingFolder(f); setShowDetailModal(false); setShowEditModal(true); }}
                onDelete={handleDeleteFolder}
            />

            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                folder={selectedFolder}
                onShare={handleShareFolder}
                sharing={sharing}
            />

            <SubfolderModal
                isOpen={showSubfolderModal}
                onClose={() => setShowSubfolderModal(false)}
                onCreate={handleCreateFolder}
                parentFolder={selectedFolder}
                creating={creating}
            />

            <MoveModal
                isOpen={showMoveModal}
                onClose={() => setShowMoveModal(false)}
                onMove={handleMoveFolder}
                folder={selectedFolder}
                folders={folders}
                moving={moving}
            />
        </motion.div>
    );
};

// ============================================================
// EXPORT
// ============================================================

export default function CompanyFoldersPage() {
    return (
        <FolderProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
                <div className="container mx-auto px-4 py-6 max-w-7xl">
                    <CompanyFoldersContent />
                </div>
            </div>
        </FolderProvider>
    );
}