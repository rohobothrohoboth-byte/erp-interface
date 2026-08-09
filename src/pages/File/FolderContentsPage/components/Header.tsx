// src/pages/file/FolderContentsPage/components/Header.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Folder, Upload, Plus, RefreshCw, Home, ChevronRight } from 'lucide-react';
import { Button } from '../../../../components/ui/button';

interface HeaderProps {
    folder: any;
    onBack: () => void;
    onRefresh: () => void;
    onUpload: () => void;
    onNewSubfolder: () => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    currentPath: string;
}

export const Header: React.FC<HeaderProps> = ({
                                                  folder,
                                                  onBack,
                                                  onRefresh,
                                                  onUpload,
                                                  onNewSubfolder,
                                                  fileInputRef,
                                                  onFileSelect,
                                                  currentPath,
                                              }) => {
    const navigate = useNavigate();

    // ✅ Determine the parent page from the current path
    const getParentPage = () => {
        // Check if we came from Company Documents
        if (currentPath.includes('/company-documents') || currentPath.includes('/file/company')) {
            return { name: 'Company Documents', path: '/company-documents' };
        }
        // Check if we came from My Folders
        if (currentPath.includes('/my-folders') || currentPath.includes('/file/my')) {
            return { name: 'My Folders', path: '/my-folders' };
        }
        // Check if we came from Shared with Me
        if (currentPath.includes('/shared') || currentPath.includes('/file/shared')) {
            return { name: 'Shared with Me', path: '/shared' };
        }
        // Default to File
        return { name: 'File', path: '/file' };
    };

    const parentPage = getParentPage();

    // Build breadcrumb path
    const getBreadcrumb = () => {
        const parts = [];
        // Home
        parts.push({ name: 'Home', path: '/file' });

        // Parent page
        parts.push({ name: parentPage.name, path: parentPage.path });

        // Current folder (if exists)
        if (folder) {
            // Check if we have a folder path in the state
            const folderPath = folder.path || [];
            if (folderPath.length > 0) {
                // Add folder path
                folderPath.forEach((f: any) => {
                    parts.push({ name: f.name, path: `/folder/${f.id}` });
                });
            }
            // Add current folder
            parts.push({ name: folder.name, path: `/folder/${folder.id}` });
        }

        return parts;
    };

    const breadcrumb = getBreadcrumb();

    return (
        <div className="flex flex-col gap-4">
            {/* Top row: Back button + Title + Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Go back"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
                        <Folder className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {folder?.name || 'Folder'}
                        </h1>
                        {folder?.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {folder.description}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={onRefresh}
                        variant="outline"
                        size="sm"
                        className="border-gray-200 dark:border-slate-700"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button
                        onClick={onNewSubfolder}
                        variant="outline"
                        size="sm"
                        className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950/30"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Folder
                    </Button>
                    <Button
                        onClick={onUpload}
                        size="sm"
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20"
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={onFileSelect}
                        className="hidden"
                    />
                </div>
            </div>

            {/* Bottom row: Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                {breadcrumb.map((item, index) => (
                    <React.Fragment key={index}>
                        {index > 0 && <ChevronRight className="w-4 h-4" />}
                        <button
                            onClick={() => navigate(item.path)}
                            className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${
                                index === breadcrumb.length - 1
                                    ? 'text-gray-900 dark:text-white font-medium cursor-default'
                                    : 'hover:underline'
                            }`}
                            disabled={index === breadcrumb.length - 1}
                        >
                            {item.name}
                        </button>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};