// src/pages/file/RecentFilesPage.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Clock, ArrowLeft, Search, Grid, List,
    FileText, Image, File, Star,
    Download, Trash2, MoreVertical, User, Loader2, Archive
} from 'lucide-react';
import { useDashboard, DashboardProvider } from '@/shared/contexts/DashboardContext';
import { useDocuments } from '@/shared/contexts/DocumentContext';
import { DocumentProvider } from '@/shared/contexts/DocumentContext';
import { formatDistanceToNow } from 'date-fns';
import { showToast } from '@/shared/layout/layout';

// ✅ Helper function to safely get document properties (handles both camelCase and PascalCase)
const getDocProperty = (doc: any, key: string): any => {
    if (!doc) return undefined;
    const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
    const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
    return doc[camelKey] !== undefined ? doc[camelKey] : doc[pascalKey];
};

const RecentFilesContent = () => {
    const navigate = useNavigate();
    const { recentFiles = [], loading = true, refreshDashboard } = useDashboard() || {};
    const { deleteDocument, toggleFavorite, downloadDocument, archiveDocument } = useDocuments() || {};
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [searchTerm, setSearchTerm] = useState('');

    // ✅ Helper functions for document properties
    const getFileName = (doc: any): string => {
        return getDocProperty(doc, 'name') || getDocProperty(doc, 'fileName') || 'Unknown';
    };

    const getFileSize = (doc: any): string => {
        const size = getDocProperty(doc, 'size') || getDocProperty(doc, 'fileSize') || getDocProperty(doc, 'fileSizeFormatted');
        if (typeof size === 'string') return size;
        if (typeof size === 'number') {
            if (size > 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
            if (size > 1024) return `${(size / 1024).toFixed(0)} KB`;
            return `${size} bytes`;
        }
        return '0 KB';
    };

    const getContentType = (doc: any): string => {
        return getDocProperty(doc, 'contentType') || getDocProperty(doc, 'fileType') || '';
    };

    const getUpdatedAt = (doc: any): string => {
        return getDocProperty(doc, 'updatedAt') || getDocProperty(doc, 'uploadedAt') || getDocProperty(doc, 'dateMod') || new Date().toISOString();
    };

    const getOwner = (doc: any): string => {
        const owner = getDocProperty(doc, 'owner') || getDocProperty(doc, 'uploadedBy') || getDocProperty(doc, 'uploadedByName');
        if (owner === 'b6ef402d-f7f2-4b9d-90fa-faf507e0961c') return 'Me';
        return owner || 'Unknown';
    };

    const getIsFavorite = (doc: any): boolean => {
        return getDocProperty(doc, 'isFavorite') || false;
    };

    const getId = (doc: any): string => {
        return getDocProperty(doc, 'id') || `doc-${Math.random()}`;
    };

    const getFileExtension = (doc: any): string => {
        const contentType = getContentType(doc);
        const fileName = getFileName(doc);
        if (contentType) {
            return contentType.split('/').pop() || 'file';
        }
        const ext = fileName.split('.').pop() || 'file';
        return ext;
    };

    const getFileIcon = (contentType: string) => {
        if (contentType?.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
        if (contentType?.startsWith('image/')) return <Image className="w-5 h-5 text-purple-500" />;
        if (contentType?.includes('word') || contentType?.includes('document'))
            return <FileText className="w-5 h-5 text-blue-500" />;
        if (contentType?.includes('excel') || contentType?.includes('spreadsheet'))
            return <File className="w-5 h-5 text-green-500" />;
        return <File className="w-5 h-5 text-gray-500" />;
    };

    // ✅ Safe filtering with proper data mapping
    const filteredDocs = Array.isArray(recentFiles)
        ? recentFiles.filter(doc => {
            const name = getFileName(doc);
            return name.toLowerCase().includes(searchTerm?.toLowerCase() || '');
        })
        : [];

    // ✅ Calculate total size
    const totalSizeBytes = filteredDocs.reduce((acc, doc) => {
        const size = getDocProperty(doc, 'sizeBytes') || getDocProperty(doc, 'fileSize') || 0;
        return acc + (typeof size === 'number' ? size : 0);
    }, 0);

    const totalSizeDisplay = totalSizeBytes > 1024 * 1024 * 1024
        ? `${(totalSizeBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
        : `${(totalSizeBytes / (1024 * 1024)).toFixed(0)} MB`;

    // ✅ Handle download
    const handleDownload = async (doc: any) => {
        try {
            const id = getId(doc);
            const fileName = getFileName(doc);
            await downloadDocument(id, fileName);
            showToast.success(`Downloading: ${fileName}`);
        } catch (error) {
            console.error('Download failed:', error);
            showToast.error('Failed to download document');
        }
    };

    // ✅ Handle delete
    const handleDelete = async (doc: any) => {
        const name = getFileName(doc);
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            try {
                const id = getId(doc);
                await deleteDocument(id);
                showToast.success('Document deleted');
                // Refresh the page to update the list
                window.location.reload();
            } catch (error) {
                console.error('Delete failed:', error);
                showToast.error('Failed to delete document');
            }
        }
    };

    // ✅ Handle toggle favorite
    const handleToggleFavorite = async (doc: any) => {
        try {
            const id = getId(doc);
            await toggleFavorite(id);
            showToast.success('Favorite updated');
        } catch (error) {
            console.error('Toggle favorite failed:', error);
            showToast.error('Failed to toggle favorite');
        }
    };

    // ✅ NEW: Handle archive document
    const handleArchive = async (doc: any) => {
        const name = getFileName(doc);
        if (window.confirm(`Are you sure you want to archive "${name}"?`)) {
            try {
                const id = getId(doc);
                await archiveDocument(id);
                showToast.success('Document archived');
                // Refresh the dashboard to update the list
                if (refreshDashboard) {
                    await refreshDashboard();
                }
                // Also reload to reflect changes
                window.location.reload();
            } catch (error) {
                console.error('Archive failed:', error);
                showToast.error('Failed to archive document');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-12 w-12 animate-spin text-amber-600" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/file')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </button>
                    <div className="p-2 bg-amber-100 rounded-lg">
                        <Clock className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Recent Files</h1>
                        <p className="text-sm text-gray-500">Files you've accessed recently</p>
                    </div>
                </div>
                {/* ✅ NEW: View Archive Button */}
                <button
                    onClick={() => navigate('/file/archive')}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                >
                    <Archive className="w-4 h-4" />
                    View Archive
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Recent Files</p>
                    <p className="text-2xl font-bold">{filteredDocs.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Last Accessed</p>
                    <p className="text-sm font-medium text-gray-600">
                        {filteredDocs.length > 0 ?
                            formatDistanceToNow(new Date(getUpdatedAt(filteredDocs[0])), { addSuffix: true }) :
                            'N/A'
                        }
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Total Size</p>
                    <p className="text-2xl font-bold">{totalSizeDisplay}</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search recent files..."
                        value={searchTerm || ''}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-amber-100 text-amber-600' : 'hover:bg-gray-100'}`}
                    >
                        <Grid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-amber-100 text-amber-600' : 'hover:bg-gray-100'}`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Files List */}
            {filteredDocs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                    <Clock className="w-12 h-12 text-gray-200 mb-3" />
                    <p className="text-sm text-gray-400">No recent files found</p>
                </div>
            ) : viewMode === 'list' ? (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Accessed</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {filteredDocs.map((doc) => {
                            const id = getId(doc);
                            const name = getFileName(doc);
                            const contentType = getContentType(doc);
                            const size = getFileSize(doc);
                            const updatedAt = getUpdatedAt(doc);
                            const owner = getOwner(doc);
                            const isFavorite = getIsFavorite(doc);
                            const fileExt = getFileExtension(doc);

                            return (
                                <tr key={id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {getFileIcon(contentType)}
                                            <span className="text-sm font-medium text-gray-900 truncate max-w-xs">{name}</span>
                                            {isFavorite && (
                                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{fileExt}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{size}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{owner}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-1">
                                            {/* ✅ Download */}
                                            <button
                                                onClick={() => handleDownload(doc)}
                                                className="p-1 hover:bg-blue-100 rounded-lg transition-colors text-blue-500"
                                                title="Download"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                            {/* ✅ Favorite */}
                                            <button
                                                onClick={() => handleToggleFavorite(doc)}
                                                className={`p-1 rounded-lg transition-colors ${isFavorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-yellow-500'}`}
                                                title="Toggle Favorite"
                                            >
                                                <Star className={`w-4 h-4 ${isFavorite ? 'fill-yellow-400' : ''}`} />
                                            </button>
                                            {/* ✅ NEW: Archive */}
                                            <button
                                                onClick={() => handleArchive(doc)}
                                                className="p-1 hover:bg-amber-100 rounded-lg transition-colors text-amber-500"
                                                title="Archive"
                                            >
                                                <Archive className="w-4 h-4" />
                                            </button>
                                            {/* ✅ Delete */}
                                            <button
                                                onClick={() => handleDelete(doc)}
                                                className="p-1 hover:bg-red-100 rounded-lg transition-colors text-red-500"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredDocs.map((doc) => {
                        const id = getId(doc);
                        const name = getFileName(doc);
                        const contentType = getContentType(doc);
                        const size = getFileSize(doc);
                        const updatedAt = getUpdatedAt(doc);
                        const owner = getOwner(doc);
                        const isFavorite = getIsFavorite(doc);

                        return (
                            <div key={id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-50 rounded-lg">
                                            {getFileIcon(contentType)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                                                {name}
                                            </p>
                                            <p className="text-xs text-gray-500">{size}</p>
                                        </div>
                                    </div>
                                    {isFavorite && (
                                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    )}
                                </div>
                                <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                                    <User className="w-3 h-3" />
                                    <span>{owner}</span>
                                </div>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-xs text-gray-400">
                                        {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        {/* ✅ Download */}
                                        <button
                                            onClick={() => handleDownload(doc)}
                                            className="p-1 hover:bg-blue-100 rounded-lg transition-colors text-blue-500"
                                            title="Download"
                                        >
                                            <Download className="w-3 h-3" />
                                        </button>
                                        {/* ✅ Favorite */}
                                        <button
                                            onClick={() => handleToggleFavorite(doc)}
                                            className={`p-1 rounded-lg transition-colors ${isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                                            title="Toggle Favorite"
                                        >
                                            <Star className={`w-3 h-3 ${isFavorite ? 'fill-yellow-400' : ''}`} />
                                        </button>
                                        {/* ✅ NEW: Archive */}
                                        <button
                                            onClick={() => handleArchive(doc)}
                                            className="p-1 hover:bg-amber-100 rounded-lg transition-colors text-amber-500"
                                            title="Archive"
                                        >
                                            <Archive className="w-3 h-3" />
                                        </button>
                                        {/* ✅ Delete */}
                                        <button
                                            onClick={() => handleDelete(doc)}
                                            className="p-1 hover:bg-red-100 rounded-lg transition-colors text-red-500"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
};

// ✅ Export with both providers - DashboardProvider for data, DocumentProvider for actions
export default function RecentFilesPage() {
    return (
        <DashboardProvider>
            <DocumentProvider>
                <div className="container mx-auto px-4 py-6 max-w-7xl">
                    <RecentFilesContent />
                </div>
            </DocumentProvider>
        </DashboardProvider>
    );
}