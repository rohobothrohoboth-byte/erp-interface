// src/pages/file/ArchivePage.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Archive, ArrowLeft, Search, Grid, List,
    FileText, Image, File, Star,
    Download, Trash2, MoreVertical, Clock,
    RefreshCw, User, FolderOpen, AlertCircle, Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { showToast } from '@/shared/layout/layout';
import { fileApi } from '@/modules/file/services/fileManagement/fileManagementApi';

// ✅ Helper: Get document name with proper fallback
const getDocumentName = (doc: any): string => {
    return doc.OriginalFileName || doc.FileName || doc.name || doc.fileName || 'Unnamed';
};

// ✅ Helper: Get document type
const getDocumentType = (doc: any): string => {
    return doc.DocumentType || doc.FileType || doc.contentType || doc.fileType || 'File';
};

// ✅ Helper: Get file size
const getFileSize = (doc: any): string => {
    const size = doc.FileSize || doc.sizeBytes || doc.fileSize || doc.size || 0;
    if (typeof size === 'number') {
        if (size > 1024 * 1024 * 1024) {
            return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
        }
        if (size > 1024 * 1024) {
            return `${(size / (1024 * 1024)).toFixed(1)} MB`;
        }
        if (size > 1024) {
            return `${(size / 1024).toFixed(0)} KB`;
        }
        return `${size} bytes`;
    }
    return typeof size === 'string' ? size : '0 bytes';
};

// ✅ Helper: Get file icon based on type
const getFileIcon = (doc: any) => {
    const contentType = getDocumentType(doc);
    const name = getDocumentName(doc);
    const ext = name.split('.').pop()?.toLowerCase() || '';
    const lowerContentType = contentType.toLowerCase();

    if (lowerContentType.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
        return <Image className="w-5 h-5 text-purple-500" />;
    }
    if (lowerContentType.includes('pdf') || ext === 'pdf') {
        return <FileText className="w-5 h-5 text-red-500" />;
    }
    if (lowerContentType.includes('word') || lowerContentType.includes('document') || ['doc', 'docx', 'txt'].includes(ext)) {
        return <FileText className="w-5 h-5 text-blue-500" />;
    }
    if (lowerContentType.includes('excel') || lowerContentType.includes('spreadsheet') || ['xls', 'xlsx', 'csv'].includes(ext)) {
        return <File className="w-5 h-5 text-green-500" />;
    }
    if (lowerContentType.includes('video') || ['mp4', 'avi', 'mov'].includes(ext)) {
        return <File className="w-5 h-5 text-red-400" />;
    }
    if (lowerContentType.includes('audio') || ['mp3', 'wav'].includes(ext)) {
        return <File className="w-5 h-5 text-green-400" />;
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
        return <Archive className="w-5 h-5 text-amber-500" />;
    }
    return <File className="w-5 h-5 text-gray-500" />;
};

// ✅ Helper: Get owner name
const getOwner = (doc: any): string => {
    const owner = doc.UploadedBy || doc.uploadedBy || doc.owner || 'Unknown';
    if (owner === 'b6ef402d-f7f2-4b9d-90fa-faf507e0961c') return 'Me';
    return owner;
};

// ✅ Helper: Get archived date
const getArchivedDate = (doc: any): Date => {
    return new Date(doc.ArchivedAt || doc.DateMod || doc.updatedAt || Date.now());
};

// ✅ Helper: Get document ID
const getDocumentId = (doc: any): string => {
    return doc.Id || doc.id || '';
};

const ArchiveContent = () => {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Load archived documents directly from API
    const loadArchivedDocuments = async () => {
        try {
            setLoading(true);
            console.log('📊 [ArchivePage] Fetching archived documents...');

            const response = await fileApi.get('/documents/archived', {
                params: { search: searchTerm || undefined }
            });

            console.log('📊 [ArchivePage] Response:', response.data);

            // Extract data from response
            let docs = [];
            if (response?.data?.data) {
                docs = Array.isArray(response.data.data) ? response.data.data : [];
            } else if (response?.data) {
                docs = Array.isArray(response.data) ? response.data : [];
            }

            console.log(`📊 [ArchivePage] Loaded ${docs.length} archived documents`);
            docs.forEach((doc, index) => {
                console.log(`  [${index}] Name: ${getDocumentName(doc)}, Type: ${getDocumentType(doc)}, Size: ${doc.FileSize || 'N/A'}`);
            });

            setDocuments(docs);
        } catch (error) {
            console.error('❌ [ArchivePage] Failed to load archived documents:', error);
            showToast.error('Failed to load archived documents');
            setDocuments([]);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadArchivedDocuments();
    }, [searchTerm]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadArchivedDocuments();
        showToast.success('Archive refreshed');
    };

    const handleUnarchive = async (id: string) => {
        if (!window.confirm('Are you sure you want to unarchive this document?')) return;

        try {
            const response = await fileApi.put(`/documents/${id}/archive`, { isArchived: false });
            if (response.status === 200) {
                showToast.success('Document unarchived successfully');
                await loadArchivedDocuments();
            }
        } catch (error) {
            console.error('Failed to unarchive:', error);
            showToast.error('Failed to unarchive document');
        }
    };

    const handleDownload = async (doc: any) => {
        try {
            const id = getDocumentId(doc);
            const fileName = getDocumentName(doc);

            const response = await fileApi.get(`/documents/${id}/download`, {
                responseType: 'blob',
            });

            if (!response.data || response.data.size === 0) {
                throw new Error('Downloaded file is empty');
            }

            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();

            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);

            showToast.success(`Downloading: ${fileName}`);
        } catch (error) {
            console.error('Download failed:', error);
            showToast.error('Failed to download document');
        }
    };

    const handleDelete = async (doc: any) => {
        const name = getDocumentName(doc);
        if (!window.confirm(`Are you sure you want to permanently delete "${name}"?`)) return;

        try {
            const id = getDocumentId(doc);
            await fileApi.delete(`/documents/${id}`, { params: { permanent: true } });
            showToast.success('Document permanently deleted');
            await loadArchivedDocuments();
        } catch (error) {
            console.error('Delete failed:', error);
            showToast.error('Failed to delete document');
        }
    };

    const totalSize = documents.reduce((acc, doc) => {
        const size = doc.FileSize || doc.sizeBytes || doc.fileSize || doc.size || 0;
        return acc + (typeof size === 'number' ? size : 0);
    }, 0);

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
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/file')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400"/>
                    </button>
                    <div className="p-2 bg-amber-100 dark:bg-amber-950/30 rounded-lg">
                        <Archive className="w-6 h-6 text-amber-600 dark:text-amber-400"/>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Archive</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Archived documents and files</p>
                    </div>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Archived Items</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{documents.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Last Archived</p>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {documents.length > 0 ?
                            formatDistanceToNow(getArchivedDate(documents[0]), { addSuffix: true }) :
                            'N/A'
                        }
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Size</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {getFileSize({ FileSize: totalSize })}
                    </p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search archived files..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-slate-800 dark:text-white"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-colors ${
                            viewMode === 'grid'
                                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400'
                        }`}
                    >
                        <Grid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-colors ${
                            viewMode === 'list'
                                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400'
                        }`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* No Archived Documents Message */}
            {documents.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl">
                    <Archive className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Archived Documents</h3>
                    <p className="text-sm text-gray-400 dark:text-gray-500 max-w-md">
                        Documents that are archived will appear here. To archive a document, go to the main dashboard and click the archive button on any document.
                    </p>
                    <button
                        onClick={() => navigate('/file')}
                        className="mt-4 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                        Go to Documents
                    </button>
                </div>
            )}

            {/* Files List */}
            {documents.length > 0 && viewMode === 'list' ? (
                <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                    <table className="w-full">
                        <thead>
                        <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Size</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Archived</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Owner</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                        {documents.map((doc) => {
                            const id = getDocumentId(doc);
                            const name = getDocumentName(doc);
                            const docType = getDocumentType(doc);
                            const archivedAt = getArchivedDate(doc);
                            const owner = getOwner(doc);

                            return (
                                <tr key={id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {getFileIcon(doc)}
                                            <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]" title={name}>
                                                {name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                        {docType.split('/').pop() || 'File'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                        {getFileSize(doc)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                        {formatDistanceToNow(archivedAt, { addSuffix: true })}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{owner}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() => handleDownload(doc)}
                                                className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-blue-500"
                                                title="Download"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleUnarchive(id)}
                                                className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors text-green-500"
                                                title="Unarchive"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(doc)}
                                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-500"
                                                title="Permanently Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-400">
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
            ) : documents.length > 0 && viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {documents.map((doc) => {
                        const id = getDocumentId(doc);
                        const name = getDocumentName(doc);
                        const archivedAt = getArchivedDate(doc);
                        const owner = getOwner(doc);

                        return (
                            <div key={id} className="bg-white dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-50 dark:bg-slate-800 rounded-lg">
                                            {getFileIcon(doc)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px]" title={name}>
                                                {name}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{getFileSize(doc)}</p>
                                        </div>
                                    </div>
                                    <Archive className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                </div>
                                <div className="mt-2 flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                                    <User className="w-3 h-3" />
                                    <span>{owner}</span>
                                </div>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                        {formatDistanceToNow(archivedAt, { addSuffix: true })}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleDownload(doc)}
                                            className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-blue-500"
                                            title="Download"
                                        >
                                            <Download className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => handleUnarchive(id)}
                                            className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors text-green-500"
                                            title="Unarchive"
                                        >
                                            <RefreshCw className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : null}
        </motion.div>
    );
};

export default function ArchivePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-yellow-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-200">
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                <ArchiveContent />
            </div>
        </div>
    );
}