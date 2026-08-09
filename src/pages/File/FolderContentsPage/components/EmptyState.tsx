// src/pages/file/FolderContentsPage/components/EmptyState.tsx

import React from 'react';
import { FolderOpen, Upload } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { useLanguage } from '../../../../i18n/LanguageContext';

interface EmptyStateProps {
    onUpload: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onUpload }) => {
    const { t } = useLanguage();

    return (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl">
            <FolderOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-400 dark:text-gray-500">This folder is empty</p>
            <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Upload files or create sub-folders</p>
            <Button
                onClick={onUpload}
                variant="outline"
                className="mt-4 border-indigo-300 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-950/30"
            >
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
            </Button>
        </div>
    );
};