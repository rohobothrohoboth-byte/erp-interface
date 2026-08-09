// src/pages/file/CompanyFolders/components/EmptyState.tsx

import React from 'react';
import { Folder, FolderPlus } from 'lucide-react';
import { Button } from '../../../../components/ui/button';

interface EmptyStateProps {
    onCreateFolder: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onCreateFolder }) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl">
            <Folder className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-400 dark:text-gray-500">No company folders found</p>
            <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Create a folder to organize documents</p>
            <Button
                onClick={onCreateFolder}
                variant="outline"
                className="mt-4 border-indigo-300 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-950/30"
            >
                <FolderPlus className="w-4 h-4 mr-2" />
                Create Folder
            </Button>
        </div>
    );
};