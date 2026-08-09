// src/pages/file/SharedDocumentsPage.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Users, ArrowLeft, Search, Grid, List,
    FileText, Image, File, Star,
    Download, Trash2, MoreVertical, Clock,
    User, Share2, Loader2, Eye, X,
    AlertCircle, RefreshCw, Heart
} from 'lucide-react';
import { DocumentProvider } from '../../contexts/DocumentContext';
import { formatDistanceToNow } from 'date-fns';
import { showToast } from '../../layout/layout';
import { useLanguage } from '../../i18n/LanguageContext';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
    getFilesByReference,
    getFilesByModule,
    deleteFile,
    downloadFile,
    toggleFavorite,
    shareFile,
} from '../../services/fileManagement/fileManagementApi';
import { useFolders } from '../../contexts/FolderContext';
import { FolderProvider } from '../../contexts/FolderContext';

// ============================================================
// HELPERS
// ============================================================

const getFileIcon = (contentType: string, fileName?: string) => {
    const ext = fileName?.split('.').pop()?.toLowerCase() || '';
    const type = contentType?.toLowerCase() || '';

    if (type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'].includes(ext)) {
        return <Image className="w-5 h-5 text-purple-500" />;
    }
    if (type.includes('pdf') || ext === 'pdf') {
        return <FileText className="w-5 h-5 text-red-500" />;
    }
    if (type.includes('excel') || type.includes('spreadsheet') || ['xls', 'xlsx', 'csv', 'tsv'].includes(ext)) {
        return <File className="w-5 h-5 text-green-500" />;
    }
    if (type.includes('word') || type.includes('document') || ['doc', 'docx', 'txt', 'rtf'].includes(ext)) {
        return <FileText className="w-5 h-5 text-blue-500" />;
    }
    if (type.includes('presentation') || type.includes('powerpoint') || ['ppt', 'pptx', 'key'].includes(ext)) {
        return <FileText className="w-5 h-5 text-orange-500" />;
    }
    return <File className="w-5 h-5 text-gray-500" />;
};

const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
};

const getDocProperty = (doc: any, key: string): any => {
    if (!doc) return undefined;
    const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
    const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
    return doc[camelKey] !== undefined ? doc[camelKey] : doc[pascalKey];
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const SharedDocumentsContent = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { folders = [] } = useFolders() || {};

    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [refreshing, setRefreshing] = useState(false);
    const [downloading, setDownloading] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<any>(null);
    const [shareEmail, setShareEmail] = useState('');
    const [sharePermission, setSharePermission] = useState('view');

    // ✅ Load shared documents
    const loadSharedDocuments = async () => {
        try {
            setLoading(true);
            // Get shared documents - using module 'shared' or get all and filter
            const response = await getFilesByModule('shared');
            const data = response?.data?.data || response?.data || [];
            setDocuments(Array.isArray(data) ? data : []);
        } catch (error: any) {
            console.error('Failed to load shared documents:', error);
            if (error.response?.status !== 404) {
                showToast.error(error?.message || 'Failed to load shared documents');
            }
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSharedDocuments();
    }, []);

    // ✅ Filter documents
    const filteredDocs = useMemo(() => {
        let docs = documents;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            docs = docs.filter(doc => {
                const name = getDocProperty(doc, 'name') || getDocProperty(doc, 'fileName') || '';
                return name.toLowerCase().includes(term);
            });
        }
        return docs;
    }, [documents, searchTerm]);

    // ✅ Stats
    const stats = useMemo(() => {
        const total = filteredDocs.length;
        const totalSize = filteredDocs.reduce((acc, doc) => acc + (getDocProperty(doc, 'size') || getDocProperty(doc, 'fileSize') || 0), 0);
        const uniqueOwners = new Set(filteredDocs.map(doc => getDocProperty(doc, 'owner') || getDocProperty(doc, 'uploadedBy') || 'Unknown')).size;
        return { total, totalSize, uniqueOwners };
    }, [filteredDocs]);

    // ✅ Handlers
    const getDisplayName = (doc: any): string => {
        return getDocProperty(doc, 'name') || getDocProperty(doc, 'fileName') || 'Unknown';
    };

    const getFileSize = (doc: any): number => {
        return getDocProperty(doc, 'size') || getDocProperty(doc, 'fileSize') || 0;
    };

    const getOwner = (doc: any): string => {
        return getDocProperty(doc, 'owner') || getDocProperty(doc, 'uploadedBy') || getDocProperty(doc, 'uploadedByName') || 'Unknown';
    };

    const getUpdatedAt = (doc: any): string => {
        return getDocProperty(doc, 'updatedAt') || getDocProperty(doc, 'uploadedAt') || getDocProperty(doc, 'dateMod') || new Date().toISOString();
    };

    const getContentType = (doc: any): string => {
        return getDocProperty(doc, 'contentType') || getDocProperty(doc, 'fileType') || getDocProperty(doc, 'mimeType') || '';
    };

    const getIsFavorite = (doc: any): boolean => {
        return getDocProperty(doc, 'isFavorite') || false;
    };

    const getId = (doc: any): string => {
        return getDocProperty(doc, 'id') || `doc-${Math.random()}`;
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadSharedDocuments();
        showToast.success('Refreshed');
        setRefreshing(false);
    };

    // ✅ Download handler
    const handleDownload = async (doc: any) => {
        const id = getId(doc);
        const name = getDisplayName(doc);
        setDownloading(id);
        try {
            const blob = await downloadFile(id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showToast.success(`Downloaded: ${name}`);
        } catch (error: any) {
            showToast.error(error?.message || 'Failed to download file');
        } finally {
            setDownloading(null);
        }
    };

    // ✅ Delete handler
    const handleDelete = async (doc: any) => {
        const name = getDisplayName(doc);
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

        const id = getId(doc);
        setDeleting(id);
        try {
            await deleteFile(id, false);
            showToast.success('File deleted successfully');
            await loadSharedDocuments();
        } catch (error: any) {
            showToast.error(error?.message || 'Failed to delete file');
        } finally {
            setDeleting(null);
        }
    };

    // ✅ Favorite handler
    const handleToggleFavorite = async (doc: any) => {
        const id = getId(doc);
        try {
            await toggleFavorite(id);
            showToast.success('Favorite toggled');
            await loadSharedDocuments();
        } catch (error: any) {
            showToast.error(error?.message || 'Failed to toggle favorite');
        }
    };

    // ✅ Share handler
    const handleShare = async () => {
        if (!selectedDoc || !shareEmail.trim()) {
            showToast.warning('Please enter an email address');
            return;
        }

        try {
            await shareFile({
                documentId: selectedDoc.id,
                sharedWithId: shareEmail,
                sharedWithType: 'user',
                permission: sharePermission,
                canDownload: sharePermission === 'edit' || sharePermission === 'download',
                canDelete: sharePermission === 'edit',
            });
            showToast.success(`File shared with ${shareEmail}`);
            setShowShareModal(false);
            setSelectedDoc(null);
            setShareEmail('');
            setSharePermission('view');
        } catch (error: any) {
            showToast.error(error?.message || 'Failed to share file');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
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
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-lg">
                        <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shared Documents</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Documents shared with you by others</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-gray-500 dark:text-gray-400"
                    >
                        <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* ============================================================ */}
            {/* STATS */}
            {/* ============================================================ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Shared With You</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Shared By</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.uniqueOwners}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Size</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatFileSize(stats.totalSize)}
                    </p>
                </div>
            </div>

            {/* ============================================================ */}
            {/* TOOLBAR */}
            {/* ============================================================ */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search shared documents..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-colors ${
                            viewMode === 'grid'
                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400'
                        }`}
                    >
                        <Grid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-colors ${
                            viewMode === 'list'
                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400'
                        }`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ============================================================ */}
            {/* DOCUMENTS DISPLAY */}
            {/* ============================================================ */}
            {filteredDocs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl">
                    <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-sm text-gray-400 dark:text-gray-500">No shared documents found</p>
                    <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Documents shared with you will appear here</p>
                </div>
            ) : viewMode === 'list' ? (
                /* === LIST VIEW === */
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Size</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Shared By</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Shared</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {filteredDocs.map((doc) => {
                                const id = getId(doc);
                                const name = getDisplayName(doc);
                                const contentType = getContentType(doc);
                                const size = getFileSize(doc);
                                const owner = getOwner(doc);
                                const updatedAt = getUpdatedAt(doc);
                                const isFavorite = getIsFavorite(doc);

                                return (
                                    <tr key={id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {getFileIcon(contentType, name)}
                                                <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                                                        {name}
                                                    </span>
                                                {isFavorite && (
                                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                            {contentType?.split('/').pop() || 'File'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                            {formatFileSize(size)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center gap-1">
                                                <User className="w-3 h-3 text-gray-400" />
                                                {owner}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                            {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => handleDownload(doc)}
                                                    disabled={downloading === id}
                                                    className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-blue-500"
                                                    title="Download"
                                                >
                                                    {downloading === id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Download className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleToggleFavorite(doc)}
                                                    className={`p-1 rounded-lg transition-colors ${
                                                        isFavorite
                                                            ? 'text-yellow-500 hover:text-yellow-600'
                                                            : 'text-gray-400 hover:text-yellow-500'
                                                    }`}
                                                    title="Favorite"
                                                >
                                                    <Star className={`w-4 h-4 ${isFavorite ? 'fill-yellow-400' : ''}`} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedDoc(doc);
                                                        setShowShareModal(true);
                                                    }}
                                                    className="p-1 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors text-purple-500"
                                                    title="Share"
                                                >
                                                    <Share2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(doc)}
                                                    disabled={deleting === id}
                                                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-500"
                                                    title="Delete"
                                                >
                                                    {deleting === id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* === GRID VIEW === */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredDocs.map((doc) => {
                        const id = getId(doc);
                        const name = getDisplayName(doc);
                        const contentType = getContentType(doc);
                        const size = getFileSize(doc);
                        const owner = getOwner(doc);
                        const updatedAt = getUpdatedAt(doc);
                        const isFavorite = getIsFavorite(doc);

                        return (
                            <motion.div
                                key={id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ y: -4 }}
                                className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 hover:shadow-lg transition-all"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-50 dark:bg-slate-800 rounded-lg">
                                            {getFileIcon(contentType, name)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
                                                {name}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(size)}</p>
                                        </div>
                                    </div>
                                    {isFavorite && (
                                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                                    )}
                                </div>
                                <div className="mt-2 flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                                    <User className="w-3 h-3" />
                                    <span className="truncate">{owner}</span>
                                </div>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                        {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleDownload(doc)}
                                            disabled={downloading === id}
                                            className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-blue-500"
                                            title="Download"
                                        >
                                            {downloading === id ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <Download className="w-3 h-3" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleToggleFavorite(doc)}
                                            className={`p-1 rounded-lg transition-colors ${
                                                isFavorite
                                                    ? 'text-yellow-500 hover:text-yellow-600'
                                                    : 'text-gray-400 hover:text-yellow-500'
                                            }`}
                                            title="Favorite"
                                        >
                                            <Star className={`w-3 h-3 ${isFavorite ? 'fill-yellow-400' : ''}`} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedDoc(doc);
                                                setShowShareModal(true);
                                            }}
                                            className="p-1 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors text-purple-500"
                                            title="Share"
                                        >
                                            <Share2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* ============================================================ */}
            {/* SHARE MODAL */}
            {/* ============================================================ */}
            <AnimatePresence>
                {showShareModal && selectedDoc && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl border border-gray-200 dark:border-slate-700"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Share2 className="w-5 h-5 text-purple-500" />
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                        Share Document
                                    </h2>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowShareModal(false);
                                        setSelectedDoc(null);
                                        setShareEmail('');
                                        setSharePermission('view');
                                    }}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Sharing:</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {getDisplayName(selectedDoc)}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={shareEmail}
                                        onChange={(e) => setShareEmail(e.target.value)}
                                        placeholder="Enter email address"
                                        className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Permission
                                    </label>
                                    <select
                                        value={sharePermission}
                                        onChange={(e) => setSharePermission(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-800 dark:text-white"
                                    >
                                        <option value="view">View Only</option>
                                        <option value="download">View & Download</option>
                                        <option value="edit">Edit</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <Button
                                    onClick={() => {
                                        setShowShareModal(false);
                                        setSelectedDoc(null);
                                        setShareEmail('');
                                        setSharePermission('view');
                                    }}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleShare}
                                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                                    disabled={!shareEmail.trim()}
                                >
                                    Share
                                </Button>
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

export default function SharedDocumentsPage() {
    return (
        <FolderProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
                <div className="container mx-auto px-4 py-6 max-w-7xl">
                    <SharedDocumentsContent />
                </div>
            </div>
        </FolderProvider>
    );
}