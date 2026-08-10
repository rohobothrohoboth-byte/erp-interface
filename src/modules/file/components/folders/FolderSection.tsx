// src/components/file/folders/FolderSection.tsx

import React, { useState, useMemo } from 'react';
import {
    FolderPlus,
    Search,
    RefreshCw,
    Folder,
    Users,
    User,
    Globe,
    Archive,
    MoreVertical,
    Edit,
    Trash2,
    Share2,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { useFolders } from '@/shared/contexts/FolderContext';
import { showToast } from '@/shared/layout/layout';
import { formatDistanceToNow } from 'date-fns';

interface FolderSectionProps {
    title: string;
    subtitle: string;
    showNew?: boolean;
    filterBy?: 'all' | 'personal' | 'shared' | 'company' | 'public' | 'archive';
}

export const FolderSection: React.FC<FolderSectionProps> = ({
                                                                title,
                                                                subtitle,
                                                                showNew = true,
                                                                filterBy = 'all',
                                                            }) => {
    const {
        folders,
        rootFolders,
        loading,
        searchTerm,
        setSearchTerm,
        refreshAll,
        refreshRoots,
        createFolder,
        deleteFolder,
    } = useFolders();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [newFolderType, setNewFolderType] = useState<'personal' | 'shared'>('personal');

    // Get folders based on filter
    const getFolders = () => {
        switch (filterBy) {
            case 'personal':
                return folders.filter(f => f.type === 'personal');
            case 'shared':
                return folders.filter(f => f.type === 'shared');
            case 'company':
                return folders.filter(f => f.type === 'company');
            case 'public':
                return folders.filter(f => f.type === 'public');
            case 'archive':
                return folders.filter(f => f.type === 'archive');
            default:
                return folders;
        }
    };

    const displayFolders = getFolders();

    // Filter by search term
    const filteredFolders = useMemo(() => {
        if (!searchTerm) return displayFolders;
        const term = searchTerm.toLowerCase();
        return displayFolders.filter(folder =>
            folder.name.toLowerCase().includes(term) ||
            folder.owner.toLowerCase().includes(term)
        );
    }, [displayFolders, searchTerm]);

    const getFolderIcon = (type: string) => {
        switch (type) {
            case 'company':
                return <Folder className="h-5 w-5 text-blue-500" />;
            case 'personal':
                return <User className="h-5 w-5 text-green-500" />;
            case 'shared':
                return <Users className="h-5 w-5 text-purple-500" />;
            case 'public':
                return <Globe className="h-5 w-5 text-orange-500" />;
            case 'archive':
                return <Archive className="h-5 w-5 text-gray-500" />;
            default:
                return <Folder className="h-5 w-5 text-gray-500" />;
        }
    };

    const getFolderColor = (type: string) => {
        switch (type) {
            case 'company':
                return 'border-blue-200 bg-blue-50';
            case 'personal':
                return 'border-green-200 bg-green-50';
            case 'shared':
                return 'border-purple-200 bg-purple-50';
            case 'public':
                return 'border-orange-200 bg-orange-50';
            case 'archive':
                return 'border-gray-200 bg-gray-50';
            default:
                return 'border-gray-200 bg-gray-50';
        }
    };

    const getFolderTypeLabel = (type: string) => {
        switch (type) {
            case 'company':
                return 'Company';
            case 'personal':
                return 'Personal';
            case 'shared':
                return 'Shared';
            case 'public':
                return 'Public';
            case 'archive':
                return 'Archive';
            default:
                return type;
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) {
            showToast.error('Folder name is required');
            return;
        }

        try {
            await createFolder({
                name: newFolderName,
                folderType: newFolderType,
                isPublic: newFolderType === 'shared',
                isShared: newFolderType === 'shared',
                sharingLevel: newFolderType === 'shared' ? 'Company' : 'Private',
            });
            setShowCreateModal(false);
            setNewFolderName('');
        } catch (error) {
            // Error already handled in context
        }
    };

    const handleDeleteFolder = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete the folder "${name}"?`)) {
            await deleteFolder(id);
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch {
            return dateString;
        }
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
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search folders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-48 sm:w-64"
                        />
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            refreshAll();
                            refreshRoots();
                        }}
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    {showNew && (
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700"
                            onClick={() => setShowCreateModal(true)}
                        >
                            <FolderPlus className="h-4 w-4 mr-2" />
                            New Folder
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
                                <p className="text-sm text-gray-500">Total Folders</p>
                                <p className="text-2xl font-bold">{filteredFolders.length}</p>
                            </div>
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Folder className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Personal</p>
                                <p className="text-2xl font-bold">
                                    {folders.filter(f => f.type === 'personal').length}
                                </p>
                            </div>
                            <div className="p-2 bg-green-100 rounded-lg">
                                <User className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Shared</p>
                                <p className="text-2xl font-bold">
                                    {folders.filter(f => f.type === 'shared').length}
                                </p>
                            </div>
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Users className="h-5 w-5 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Files</p>
                                <p className="text-2xl font-bold">
                                    {folders.reduce((acc, f) => acc + (f.fileCount || 0), 0)}
                                </p>
                            </div>
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <Archive className="h-5 w-5 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Folders Grid */}
            {filteredFolders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                    <Folder className="w-12 h-12 text-gray-200 mb-3" />
                    <p className="text-sm text-gray-400">No folders found</p>
                    {showNew && (
                        <Button
                            variant="outline"
                            className="mt-3"
                            onClick={() => setShowCreateModal(true)}
                        >
                            <FolderPlus className="h-4 w-4 mr-2" />
                            Create a folder
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredFolders.map((folder) => (
                        <Card
                            key={folder.id}
                            className={`hover:shadow-lg transition-all cursor-pointer border-2 ${getFolderColor(folder.type)}`}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            {getFolderIcon(folder.type)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                                                {folder.name}
                                            </p>
                                            <Badge variant="outline" className="text-xs mt-1">
                                                {getFolderTypeLabel(folder.type)}
                                            </Badge>
                                        </div>
                                    </div>
                                    <button
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded-lg transition-opacity"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Show dropdown menu
                                        }}
                                    >
                                        <MoreVertical className="h-4 w-4 text-gray-400" />
                                    </button>
                                </div>
                                <div className="mt-3 flex items-center justify-between">
                                    <div className="text-xs text-gray-500">
                                        <span>{folder.fileCount || 0} files</span>
                                        <span className="mx-1">•</span>
                                        <span>{formatDate(folder.updatedAt)}</span>
                                    </div>
                                    <span className="text-xs text-gray-400">{folder.owner}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Folder Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Create New Folder</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Folder Name
                                </label>
                                <Input
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    placeholder="Enter folder name"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Folder Type
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        className={`flex-1 px-4 py-2 rounded-lg border text-sm transition-colors ${
                                            newFolderType === 'personal'
                                                ? 'border-green-500 bg-green-50 text-green-700'
                                                : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                        onClick={() => setNewFolderType('personal')}
                                    >
                                        Personal
                                    </button>
                                    <button
                                        className={`flex-1 px-4 py-2 rounded-lg border text-sm transition-colors ${
                                            newFolderType === 'shared'
                                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                                : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                        onClick={() => setNewFolderType('shared')}
                                    >
                                        Shared
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setNewFolderName('');
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                                onClick={handleCreateFolder}
                            >
                                Create
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};