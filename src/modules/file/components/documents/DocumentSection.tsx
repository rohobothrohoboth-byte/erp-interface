// src/components/file/documents/DocumentSection.tsx

import React, { useState, useRef, useMemo } from 'react';
import {
    Search,
    Upload,
    Grid,
    List,
    RefreshCw,
    FileText,
    FileImage,
    File,
    Star,
    Download,
    Trash2,
    Archive,
    Clock,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { useDocuments } from '@/shared/contexts/DocumentContext';
import { showToast } from '@/shared/layout/layout';
import { formatDistanceToNow } from 'date-fns';

interface DocumentSectionProps {
    title: string;
    subtitle: string;
    showUpload?: boolean;
    showSearch?: boolean;
    filterBy?: 'all' | 'favorites' | 'recent';
}

export const DocumentSection: React.FC<DocumentSectionProps> = ({
                                                                    title,
                                                                    subtitle,
                                                                    showUpload = true,
                                                                    showSearch = true,
                                                                    filterBy = 'all',
                                                                }) => {
    const {
        documents,
        favorites,
        recent,
        loading,
        searchTerm,
        setSearchTerm,
        refreshAll,
        refreshFavorites,
        refreshRecent,
        toggleFavorite,
        deleteDocument,
        archiveDocument,
        downloadDocument,
        uploadDocument,
    } = useDocuments();

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Get documents based on filter
    const getDocuments = () => {
        switch (filterBy) {
            case 'favorites':
                return favorites;
            case 'recent':
                return recent;
            default:
                return documents;
        }
    };

    const displayDocuments = getDocuments();

    // Filter by search term
    const filteredDocuments = useMemo(() => {
        if (!searchTerm) return displayDocuments;
        const term = searchTerm.toLowerCase();
        return displayDocuments.filter(doc =>
            doc.name.toLowerCase().includes(term) ||
            doc.owner.toLowerCase().includes(term) ||
            (doc.folderName && doc.folderName.toLowerCase().includes(term))
        );
    }, [displayDocuments, searchTerm]);

    const getFileIcon = (contentType: string) => {
        if (contentType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
        if (contentType.includes('image')) return <FileImage className="h-5 w-5 text-blue-500" />;
        if (contentType.includes('word') || contentType.includes('document')) return <FileText className="h-5 w-5 text-blue-600" />;
        if (contentType.includes('excel') || contentType.includes('sheet')) return <File className="h-5 w-5 text-green-600" />;
        if (contentType.includes('powerpoint') || contentType.includes('presentation')) return <File className="h-5 w-5 text-orange-500" />;
        return <File className="h-5 w-5 text-gray-500" />;
    };

    const getFileColor = (contentType: string) => {
        if (contentType.includes('pdf')) return 'border-red-200 bg-red-50';
        if (contentType.includes('image')) return 'border-blue-200 bg-blue-50';
        if (contentType.includes('word') || contentType.includes('document')) return 'border-blue-200 bg-blue-50';
        if (contentType.includes('excel') || contentType.includes('sheet')) return 'border-green-200 bg-green-50';
        if (contentType.includes('powerpoint') || contentType.includes('presentation')) return 'border-orange-200 bg-orange-50';
        return 'border-gray-200 bg-gray-50';
    };

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            for (const file of Array.from(files)) {
                await uploadDocument({
                    file,
                    module: 'general',
                    category: 'documents',
                    description: file.name,
                });
            }
            showToast.success(`${files.length} file(s) uploaded successfully`);
        } catch (error) {
            showToast.error('Failed to upload files');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleToggleFavorite = async (id: string) => {
        await toggleFavorite(id);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            await deleteDocument(id);
        }
    };

    const handleArchive = async (id: string) => {
        await archiveDocument(id);
    };

    const handleDownload = async (id: string, fileName: string) => {
        try {
            await downloadDocument(id, fileName);
        } catch (error) {
            showToast.error('Failed to download document');
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch {
            return dateString;
        }
    };

    const getFileTypeLabel = (contentType: string) => {
        if (contentType.includes('pdf')) return 'PDF';
        if (contentType.includes('image')) return 'Image';
        if (contentType.includes('word') || contentType.includes('document')) return 'Word';
        if (contentType.includes('excel') || contentType.includes('sheet')) return 'Excel';
        if (contentType.includes('powerpoint') || contentType.includes('presentation')) return 'PowerPoint';
        if (contentType.includes('text')) return 'Text';
        return 'File';
    };

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
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    <p className="text-sm text-gray-500">{subtitle}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {showSearch && (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search documents..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-48 sm:w-64"
                            />
                        </div>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    >
                        {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            refreshAll();
                            refreshFavorites();
                            refreshRecent();
                        }}
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    {showUpload && (
                        <Button className="bg-indigo-600 hover:bg-indigo-700">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <Upload className="h-4 w-4" />
                                {uploading ? 'Uploading...' : 'Upload'}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={handleUpload}
                                    disabled={uploading}
                                />
                            </label>
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Documents</p>
                                <p className="text-2xl font-bold">{filteredDocuments.length}</p>
                            </div>
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <File className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Favorites</p>
                                <p className="text-2xl font-bold">{favorites.length}</p>
                            </div>
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <Star className="h-5 w-5 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Recent</p>
                                <p className="text-2xl font-bold">{recent.length}</p>
                            </div>
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Clock className="h-5 w-5 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Size</p>
                                <p className="text-2xl font-bold">
                                    {filteredDocuments.reduce((acc, doc) => acc + (doc.sizeBytes || 0), 0) > 1024 * 1024 * 1024
                                        ? `${(filteredDocuments.reduce((acc, doc) => acc + (doc.sizeBytes || 0), 0) / (1024 * 1024 * 1024)).toFixed(1)} GB`
                                        : `${(filteredDocuments.reduce((acc, doc) => acc + (doc.sizeBytes || 0), 0) / (1024 * 1024)).toFixed(0)} MB`}
                                </p>
                            </div>
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Download className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Documents Display */}
            {filteredDocuments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                    <FileText className="w-12 h-12 text-gray-200 mb-3" />
                    <p className="text-sm text-gray-400">No documents found</p>
                    {showUpload && (
                        <Button
                            variant="outline"
                            className="mt-3"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload a file
                        </Button>
                    )}
                </div>
            ) : viewMode === 'list' ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {filteredDocuments.map((doc) => (
                                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {getFileIcon(doc.contentType)}
                                            <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                                    {doc.name}
                                                </span>
                                            {doc.isFavorite && (
                                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant="outline" className="text-xs">
                                            {getFileTypeLabel(doc.contentType)}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{doc.size}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(doc.updatedAt)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{doc.owner}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() => handleToggleFavorite(doc.id)}
                                                className={`p-1 rounded-lg transition-colors ${doc.isFavorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-yellow-500'}`}
                                                title="Toggle Favorite"
                                            >
                                                <Star className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDownload(doc.id, doc.name)}
                                                className="p-1 hover:bg-blue-100 rounded-lg transition-colors text-blue-500"
                                                title="Download"
                                            >
                                                <Download className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleArchive(doc.id)}
                                                className="p-1 hover:bg-purple-100 rounded-lg transition-colors text-purple-500"
                                                title="Archive"
                                            >
                                                <Archive className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(doc.id)}
                                                className="p-1 hover:bg-red-100 rounded-lg transition-colors text-red-500"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredDocuments.map((doc) => (
                        <Card key={doc.id} className={`hover:shadow-lg transition-all cursor-pointer border-2 ${getFileColor(doc.contentType)}`}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            {getFileIcon(doc.contentType)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                                                {doc.name}
                                            </p>
                                            <p className="text-xs text-gray-500">{doc.size}</p>
                                        </div>
                                    </div>
                                    {doc.isFavorite && (
                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                    )}
                                </div>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="text-xs text-gray-500">{formatDate(doc.updatedAt)}</span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleToggleFavorite(doc.id)}
                                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <Star className={`h-3 w-3 ${doc.isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
                                        </button>
                                        <button
                                            onClick={() => handleDownload(doc.id, doc.name)}
                                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <Download className="h-3 w-3 text-blue-500" />
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </motion.div>
    );
};