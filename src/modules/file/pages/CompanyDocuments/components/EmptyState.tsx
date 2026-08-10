// src/pages/file/CompanyDocuments/components/EmptyState.tsx

import React from 'react';
import { Building2, Upload, FolderPlus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface EmptyStateProps {
    onUpload: () => void;
    onNewFolder: () => void; // ✅ Add this prop
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onUpload, onNewFolder }) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl">
            <Building2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-400 dark:text-gray-500">No company documents found</p>
            <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Upload a document or create a folder to get started</p>
            <div className="flex items-center gap-3 mt-4">
                <Button
                    onClick={onUpload}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                </Button>
                <Button
                    onClick={onNewFolder}
                    variant="outline"
                    className="border-indigo-300 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-950/30"
                >
                    <FolderPlus className="w-4 h-4 mr-2" />
                    New Folder
                </Button>
            </div>
        </div>
    );
};