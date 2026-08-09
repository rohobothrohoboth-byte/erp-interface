// src/pages/file/PersonalDocumentsPage.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    User, ArrowLeft, Search, Grid, List, Plus, Upload,
    FileText, Image, File, Star, Download, Trash2, MoreVertical, Clock
} from 'lucide-react';
import { useDocuments } from '../../contexts/DocumentContext';
import { DocumentProvider } from '../../contexts/DocumentContext';
import { formatDistanceToNow } from 'date-fns';

const PersonalDocumentsContent = () => {
    const navigate = useNavigate();
    const { documents, loading, searchTerm, setSearchTerm } = useDocuments();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

    // Filter personal documents (owned by current user)
    // In a real app, you'd filter by the current user's ID
    const personalDocs = documents.filter(doc =>
        doc.owner === 'Me' || doc.ownerId === 'current-user-id'
    );

    const getFileIcon = (contentType: string) => {
        if (contentType?.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
        if (contentType?.startsWith('image/')) return <Image className="w-5 h-5 text-purple-500" />;
        if (contentType?.includes('word') || contentType?.includes('document'))
            return <FileText className="w-5 h-5 text-blue-500" />;
        if (contentType?.includes('excel') || contentType?.includes('spreadsheet'))
            return <File className="w-5 h-5 text-green-500" />;
        return <File className="w-5 h-5 text-gray-500" />;
    };

    const filteredDocs = personalDocs.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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
                        <ArrowLeft className="w-5 h-5 text-gray-500"/>
                    </button>
                    <div className="p-2 bg-green-100 rounded-lg">
                        <User className="w-6 h-6 text-green-600"/>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Personal Documents</h1>
                        <p className="text-sm text-gray-500">Your private files and documents</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                        <Upload className="w-4 h-4"/>
                        Upload
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">My Documents</p>
                    <p className="text-2xl font-bold">{filteredDocs.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Favorites</p>
                    <p className="text-2xl font-bold">
                        {filteredDocs.filter(d => d.isFavorite).length}
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Last Modified</p>
                    <p className="text-sm font-medium text-gray-600">
                        {filteredDocs.length > 0 ?
                            formatDistanceToNow(new Date(filteredDocs[0]?.updatedAt || Date.now()), { addSuffix: true }) :
                            'N/A'
                        }
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Total Size</p>
                    <p className="text-2xl font-bold">
                        {filteredDocs.reduce((acc, d) => acc + (d.sizeBytes || 0), 0) > 1024 * 1024 * 1024
                            ? `${(filteredDocs.reduce((acc, d) => acc + (d.sizeBytes || 0), 0) / (1024 * 1024 * 1024)).toFixed(1)} GB`
                            : `${(filteredDocs.reduce((acc, d) => acc + (d.sizeBytes || 0), 0) / (1024 * 1024)).toFixed(0)} MB`
                        }
                    </p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search personal documents..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100'}`}
                    >
                        <Grid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100'}`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Documents List */}
            {filteredDocs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                    <User className="w-12 h-12 text-gray-200 mb-3" />
                    <p className="text-sm text-gray-400">No personal documents found</p>
                </div>
            ) : viewMode === 'list' ? (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modified</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {filteredDocs.map((doc) => (
                            <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        {getFileIcon(doc.contentType)}
                                        <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                                        {doc.isFavorite && (
                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    {doc.contentType?.split('/').pop() || 'File'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">{doc.size}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-1">
                                        <button className="p-1 hover:bg-blue-100 rounded-lg transition-colors text-blue-500">
                                            <Download className="w-4 h-4" />
                                        </button>
                                        <button className="p-1 hover:bg-yellow-100 rounded-lg transition-colors text-yellow-500">
                                            <Star className="w-4 h-4" />
                                        </button>
                                        <button className="p-1 hover:bg-red-100 rounded-lg transition-colors text-red-500">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredDocs.map((doc) => (
                        <div key={doc.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-50 rounded-lg">
                                        {getFileIcon(doc.contentType)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                                            {doc.name}
                                        </p>
                                        <p className="text-xs text-gray-500">{doc.size}</p>
                                    </div>
                                </div>
                                {doc.isFavorite && (
                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                )}
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                </span>
                                <div className="flex items-center gap-1">
                                    <button className="p-1 hover:bg-blue-100 rounded-lg transition-colors text-blue-500">
                                        <Download className="w-3 h-3" />
                                    </button>
                                    <button className="p-1 hover:bg-yellow-100 rounded-lg transition-colors text-yellow-500">
                                        <Star className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default function PersonalDocumentsPage() {
    return (
        <DocumentProvider>
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                <PersonalDocumentsContent />
            </div>
        </DocumentProvider>
    );
}