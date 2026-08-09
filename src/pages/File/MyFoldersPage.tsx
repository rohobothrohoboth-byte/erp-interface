// src/pages/file/MyFoldersPage.tsx

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    FolderOpen, ArrowLeft, Search, Plus,
    User, Clock, ChevronRight, MoreVertical, Star,
    X, Loader2, Edit, Trash2, Eye,
    Folder, Grid, List, RefreshCw,
    Filter, Tag, Building2, Users, Shield,
    HardDrive, Database, BookOpen, Briefcase,
    Home, Archive, FileText, Image, Video, Music
} from 'lucide-react';
import { useFolders } from '../../contexts/FolderContext';
import { FolderProvider } from '../../contexts/FolderContext';
import { formatDistanceToNow, format } from 'date-fns';
import { showToast } from '../../layout/layout';
import { useLanguage } from '../../i18n/LanguageContext';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

// ============================================================
// CATEGORIES CONFIG
// ============================================================

const CATEGORIES = [
    { id: 'all', label: 'All Folders', icon: FolderOpen, color: 'cyan' },
    { id: 'work', label: 'Work', icon: Briefcase, color: 'blue' },
    { id: 'personal', label: 'Personal', icon: User, color: 'green' },
    { id: 'projects', label: 'Projects', icon: Folder, color: 'purple' },
    { id: 'documents', label: 'Documents', icon: FileText, color: 'amber' },
    { id: 'images', label: 'Images', icon: Image, color: 'pink' },
    { id: 'videos', label: 'Videos', icon: Video, color: 'red' },
    { id: 'music', label: 'Music', icon: Music, color: 'emerald' },
    { id: 'archive', label: 'Archive', icon: Archive, color: 'gray' },
];

const CATEGORY_COLORS: Record<string, string> = {
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-950/30 dark:text-cyan-400 dark:border-cyan-800',
    blue: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800',
    green: 'bg-green-50 text-green-600 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800',
    purple: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800',
    amber: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
    pink: 'bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-950/30 dark:text-pink-400 dark:border-pink-800',
    red: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800',
    gray: 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800',
};

// ✅ Helper function to get color based on category
const getCategoryColor = (category: string): string => {
    const colorMap: Record<string, string> = {
        work: 'blue',
        personal: 'green',
        projects: 'purple',
        documents: 'amber',
        images: 'pink',
        videos: 'red',
        music: 'emerald',
        archive: 'gray',
        company: 'indigo',
        shared: 'amber',
        department: 'indigo',
    };
    return colorMap[category?.toLowerCase()] || 'gray';
};

// ✅ Helper to get category display name
const getCategoryDisplayName = (category: string): string => {
    if (!category) return 'General';
    return category.charAt(0).toUpperCase() + category.slice(1);
};

// ============================================================
// HELPERS
// ============================================================

const getFolderIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
        case 'work':
            return <Briefcase className="w-5 h-5 text-blue-500" />;
        case 'personal':
            return <User className="w-5 h-5 text-green-500" />;
        case 'projects':
            return <Folder className="w-5 h-5 text-purple-500" />;
        case 'documents':
            return <FileText className="w-5 h-5 text-amber-500" />;
        case 'images':
            return <Image className="w-5 h-5 text-pink-500" />;
        case 'videos':
            return <Video className="w-5 h-5 text-red-500" />;
        case 'music':
            return <Music className="w-5 h-5 text-emerald-500" />;
        case 'archive':
            return <Archive className="w-5 h-5 text-gray-500" />;
        default:
            return <FolderOpen className="w-5 h-5 text-cyan-500" />;
    }
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const MyFoldersContent = () => {
    const navigate = useNavigate();
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

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState<any>(null);
    const [editingFolder, setEditingFolder] = useState<any>(null);
    const [newFolderName, setNewFolderName] = useState('');
    const [newFolderDescription, setNewFolderDescription] = useState('');
    const [newFolderCategory, setNewFolderCategory] = useState('personal');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [creating, setCreating] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<'name' | 'date' | 'files'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // ✅ Filter personal folders
    const personalFolders = useMemo(() => {
        return folders.filter(f => {
            const isPersonal = f.type === 'personal' ||
                f.folderType === 'personal' ||
                f.type === 'my' ||
                f.folderType === 'my';
            return isPersonal;
        });
    }, [folders]);

    // ✅ Filter by category and search
    const filteredFolders = useMemo(() => {
        let result = personalFolders.filter(f => {
            // Category filter
            if (selectedCategory !== 'all') {
                const folderCategory = f.category || f.folderType || f.type || 'personal';
                if (folderCategory?.toLowerCase() !== selectedCategory) {
                    return false;
                }
            }

            // Search filter
            if (!searchTerm) return true;
            const name = f.name || '';
            const desc = f.description || '';
            const search = searchTerm.toLowerCase();
            return name.toLowerCase().includes(search) || desc.toLowerCase().includes(search);
        });

        // Sort
        result.sort((a, b) => {
            let aVal: any, bVal: any;
            switch (sortBy) {
                case 'name':
                    aVal = (a.name || '').toLowerCase();
                    bVal = (b.name || '').toLowerCase();
                    break;
                case 'files':
                    aVal = a.fileCount || a.itemCount || 0;
                    bVal = b.fileCount || b.itemCount || 0;
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

        return result;
    }, [personalFolders, searchTerm, selectedCategory, sortBy, sortOrder]);

    // ✅ Stats by category
    const categoryStats = useMemo(() => {
        const stats: Record<string, number> = {};
        personalFolders.forEach(f => {
            const cat = f.category || f.folderType || f.type || 'personal';
            stats[cat] = (stats[cat] || 0) + 1;
        });
        return stats;
    }, [personalFolders]);

    // ✅ Stats
    const stats = useMemo(() => {
        const total = filteredFolders.length;
        const totalFiles = filteredFolders.reduce((acc, f) => acc + (f.fileCount || f.itemCount || 0), 0);
        const recent = filteredFolders.filter(f => {
            const date = new Date(f.updatedAt || f.createdAt || 0);
            const daysAgo = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
            return daysAgo < 7;
        }).length;
        return { total, totalFiles, recent };
    }, [filteredFolders]);

    // ✅ Handlers
    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) {
            showToast.warning('Please enter a folder name');
            return;
        }

        setCreating(true);
        try {
            await createFolder({
                name: newFolderName.trim(),
                description: newFolderDescription.trim(),
                folderType: 'personal',
                category: newFolderCategory,
                isPublic: false,
                isShared: false,
                sharingLevel: 'Private',
            });

            showToast.success(`Folder "${newFolderName}" created successfully`);
            setShowCreateModal(false);
            setNewFolderName('');
            setNewFolderDescription('');
            setNewFolderCategory('personal');
            if (refreshFolders) {
                await refreshFolders();
            }
            if (refreshRoots) {
                await refreshRoots();
            }
        } catch (error: any) {
            console.error('Create folder failed:', error);
            showToast.error(error?.response?.data?.message || 'Failed to create folder');
        } finally {
            setCreating(false);
        }
    };

    const handleUpdateFolder = async () => {
        if (!editingFolder || !editingFolder.name?.trim()) {
            showToast.warning('Please enter a folder name');
            return;
        }

        setCreating(true);
        try {
            await updateFolder(editingFolder.id, {
                name: editingFolder.name.trim(),
                description: editingFolder.description?.trim() || '',
                folderType: editingFolder.folderType || 'personal',
                category: editingFolder.category || 'personal',
            });
            showToast.success(`Folder updated successfully`);
            setShowEditModal(false);
            setEditingFolder(null);
            if (refreshFolders) {
                await refreshFolders();
            }
            if (refreshRoots) {
                await refreshRoots();
            }
        } catch (error: any) {
            console.error('Update folder failed:', error);
            showToast.error(error?.response?.data?.message || 'Failed to update folder');
        } finally {
            setCreating(false);
        }
    };

    const handleFolderClick = (folderId: string) => {
        navigate(`/folder/${folderId}`, {
            state: { from: '/file/folders/personal' }
        });
    };

    const handleViewDetails = (folder: any) => {
        setSelectedFolder(folder);
        setShowDetailModal(true);
    };

    const handleEditFolder = (folder: any) => {
        setEditingFolder({ ...folder });
        setShowEditModal(true);
    };

    const handleDeleteFolder = async (folderId: string, folderName: string) => {
        if (window.confirm(`Are you sure you want to delete the folder "${folderName}"? This action cannot be undone.`)) {
            setDeleting(folderId);
            try {
                await deleteFolder(folderId);
                showToast.success(`Folder "${folderName}" deleted successfully`);
                if (refreshFolders) {
                    await refreshFolders();
                }
                if (refreshRoots) {
                    await refreshRoots();
                }
            } catch (error: any) {
                console.error('Delete folder failed:', error);
                showToast.error(error?.response?.data?.message || 'Failed to delete folder');
            } finally {
                setDeleting(null);
            }
        }
    };

    const handleRefresh = async () => {
        if (refreshFolders) {
            await refreshFolders();
        }
        if (refreshRoots) {
            await refreshRoots();
        }
        showToast.success('Refreshed');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-12 w-12 animate-spin text-cyan-600" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* ============================================================ */}
            {/* HEADER */}
            {/* ============================================================ */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/file')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                    <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg shadow-lg">
                        <FolderOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Folders</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Your personal folders</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRefresh}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-gray-500 dark:text-gray-400"
                        title="Refresh"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/20"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Folder
                    </Button>
                </div>
            </div>

            {/* ============================================================ */}
            {/* STATS */}
            {/* ============================================================ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">My Folders</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Files</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalFiles}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Recently Updated</p>
                    <p className="text-2xl font-bold text-cyan-500">{stats.recent}</p>
                </div>
            </div>

            {/* ============================================================ */}
            {/* CATEGORY FILTER */}
            {/* ============================================================ */}
            <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const count = categoryStats[cat.id] || 0;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                                selectedCategory === cat.id
                                    ? `bg-${cat.color}-600 text-white shadow-lg shadow-${cat.color}-500/20`
                                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {cat.label}
                            {count > 0 && (
                                <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                                    selectedCategory === cat.id
                                        ? 'bg-white/20'
                                        : 'bg-gray-200 dark:bg-slate-700'
                                }`}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ============================================================ */}
            {/* TOOLBAR */}
            {/* ============================================================ */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search my folders..."
                        value={searchTerm || ''}
                        onChange={(e) => setSearchTerm?.(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                        <option value="date">Sort by Date</option>
                        <option value="name">Sort by Name</option>
                        <option value="files">Sort by Files</option>
                    </select>
                    <button
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="p-2 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-colors ${
                            viewMode === 'grid'
                                ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400'
                                : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400'
                        }`}
                    >
                        <Grid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-colors ${
                            viewMode === 'list'
                                ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400'
                                : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400'
                        }`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ============================================================ */}
            {/* FOLDERS DISPLAY */}
            {/* ============================================================ */}
            {filteredFolders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl">
                    <FolderOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                        {selectedCategory !== 'all'
                            ? `No ${getCategoryDisplayName(selectedCategory)} folders found`
                            : 'No personal folders found'}
                    </p>
                    <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Create a folder to organize your files</p>
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        variant="outline"
                        className="mt-4 border-cyan-300 text-cyan-600 hover:bg-cyan-50 dark:border-cyan-700 dark:text-cyan-400 dark:hover:bg-cyan-950/30"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Folder
                    </Button>
                </div>
            ) : viewMode === 'grid' ? (
                /* === GRID VIEW === */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredFolders.map((folder) => {
                        const category = folder.category || folder.folderType || folder.type || 'personal';
                        const color = getCategoryColor(category);
                        const colorKey = color as keyof typeof CATEGORY_COLORS;

                        return (
                            <motion.div
                                key={folder.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ y: -4 }}
                                className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 hover:shadow-lg transition-all cursor-pointer group"
                                onClick={() => handleFolderClick(folder.id)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${CATEGORY_COLORS[colorKey]}`}>
                                            {getFolderIcon(category)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
                                                {folder.name}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {folder.documentCount || folder.subFolderCount || 0} items
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => handleEditFolder(folder)}
                                            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-400 dark:text-gray-500 hover:text-blue-500"
                                            title="Edit"
                                        >
                                            <Edit className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteFolder(folder.id, folder.name)}
                                            disabled={deleting === folder.id}
                                            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-400 dark:text-gray-500 hover:text-red-500"
                                            title="Delete"
                                        >
                                            {deleting === folder.id ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-3.5 h-3.5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                {folder.description && (
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-1">
                                        {folder.description}
                                    </p>
                                )}
                                <div className="mt-3 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatDistanceToNow(new Date(folder.updatedAt || folder.createdAt || Date.now()), { addSuffix: true })}
                                    </span>
                                    <Badge className={`text-[10px] ${CATEGORY_COLORS[colorKey]}`}>
                                        {getCategoryDisplayName(category)}
                                    </Badge>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                /* === LIST VIEW === */
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Category</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Items</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Updated</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {filteredFolders.map((folder) => {
                                const category = folder.category || folder.folderType || folder.type || 'personal';
                                const color = getCategoryColor(category);
                                const colorKey = color as keyof typeof CATEGORY_COLORS;

                                return (
                                    <motion.tr
                                        key={folder.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                                        onClick={() => handleViewDetails(folder)}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {getFolderIcon(category)}
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                                                        {folder.name}
                                                    </p>
                                                    {folder.description && (
                                                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-xs">
                                                            {folder.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge className={`text-xs ${CATEGORY_COLORS[colorKey]}`}>
                                                {getCategoryDisplayName(category)}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                            {folder.documentCount || folder.subFolderCount || 0}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                            {formatDistanceToNow(new Date(folder.updatedAt || folder.createdAt || Date.now()), { addSuffix: true })}
                                        </td>
                                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => handleEditFolder(folder)}
                                                    className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-400 dark:text-gray-500 hover:text-blue-500"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteFolder(folder.id, folder.name)}
                                                    disabled={deleting === folder.id}
                                                    className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-400 dark:text-gray-500 hover:text-red-500"
                                                    title="Delete"
                                                >
                                                    {deleting === folder.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleViewDetails(folder)}
                                                    className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-400 dark:text-gray-500 hover:text-cyan-500"
                                                    title="Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* CREATE FOLDER MODAL WITH CATEGORY */}
            {/* ============================================================ */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl border border-gray-200 dark:border-slate-700"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Plus className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create Personal Folder</h2>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setNewFolderName('');
                                        setNewFolderDescription('');
                                        setNewFolderCategory('personal');
                                    }}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Folder Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        placeholder="Enter folder name"
                                        className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-slate-800 dark:text-white"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Category
                                    </label>
                                    <select
                                        value={newFolderCategory}
                                        onChange={(e) => setNewFolderCategory(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-slate-800 dark:text-white"
                                    >
                                        <option value="personal">Personal</option>

                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={newFolderDescription}
                                        onChange={(e) => setNewFolderDescription(e.target.value)}
                                        placeholder="Enter description (optional)"
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setNewFolderName('');
                                        setNewFolderDescription('');
                                        setNewFolderCategory('personal');
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                                    disabled={creating}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateFolder}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
                                    disabled={!newFolderName.trim() || creating}
                                >
                                    {creating ? 'Creating...' : 'Create Folder'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ============================================================ */}
            {/* EDIT FOLDER MODAL WITH CATEGORY */}
            {/* ============================================================ */}
            <AnimatePresence>
                {showEditModal && editingFolder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl border border-gray-200 dark:border-slate-700"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Edit className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit Folder</h2>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingFolder(null);
                                    }}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Folder Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={editingFolder.name || ''}
                                        onChange={(e) => setEditingFolder({ ...editingFolder, name: e.target.value })}
                                        placeholder="Enter folder name"
                                        className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-slate-800 dark:text-white"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Category
                                    </label>
                                    <select
                                        value={editingFolder.category || 'personal'}
                                        onChange={(e) => setEditingFolder({ ...editingFolder, category: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-slate-800 dark:text-white"
                                    >
                                        <option value="personal">Personal</option>
                                        <option value="work">Work</option>
                                        <option value="projects">Projects</option>
                                        <option value="documents">Documents</option>
                                        <option value="images">Images</option>
                                        <option value="videos">Videos</option>
                                        <option value="music">Music</option>
                                        <option value="archive">Archive</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={editingFolder.description || ''}
                                        onChange={(e) => setEditingFolder({ ...editingFolder, description: e.target.value })}
                                        placeholder="Enter description (optional)"
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingFolder(null);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                                    disabled={creating}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateFolder}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
                                    disabled={!editingFolder.name?.trim() || creating}
                                >
                                    {creating ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ============================================================ */}
            {/* DETAIL MODAL */}
            {/* ============================================================ */}
            <AnimatePresence>
                {showDetailModal && selectedFolder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl border border-gray-200 dark:border-slate-700"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${CATEGORY_COLORS[getCategoryColor(selectedFolder.category || selectedFolder.folderType || selectedFolder.type) as keyof typeof CATEGORY_COLORS]}`}>
                                        {getFolderIcon(selectedFolder.category || selectedFolder.folderType || selectedFolder.type)}
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Folder Details</h2>
                                </div>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedFolder.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                                    <Badge className={CATEGORY_COLORS[getCategoryColor(selectedFolder.category || selectedFolder.folderType || selectedFolder.type) as keyof typeof CATEGORY_COLORS]}>
                                        {getCategoryDisplayName(selectedFolder.category || selectedFolder.folderType || selectedFolder.type || 'Personal')}
                                    </Badge>
                                </div>
                                {selectedFolder.description && (
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">{selectedFolder.description}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Items</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {selectedFolder.documentCount || selectedFolder.subFolderCount || 0}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {format(new Date(selectedFolder.createdAt || Date.now()), 'PPP')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {formatDistanceToNow(new Date(selectedFolder.updatedAt || selectedFolder.createdAt || Date.now()), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => {
                                        navigate(`/folder/${selectedFolder.id}`);
                                        setShowDetailModal(false);
                                    }}
                                    className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
                                >
                                    <FolderOpen className="w-4 h-4" />
                                    Open Folder
                                </button>
                                <button
                                    onClick={() => {
                                        handleEditFolder(selectedFolder);
                                        setShowDetailModal(false);
                                    }}
                                    className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        handleDeleteFolder(selectedFolder.id, selectedFolder.name);
                                        setShowDetailModal(false);
                                    }}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ============================================================
// EXPORT
// ============================================================

export default function MyFoldersPage() {
    return (
        <FolderProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
                <div className="container mx-auto px-4 py-6 max-w-7xl">
                    <MyFoldersContent />
                </div>
            </div>
        </FolderProvider>
    );
}