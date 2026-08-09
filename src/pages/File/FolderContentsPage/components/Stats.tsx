// src/pages/file/FolderContentsPage/components/Stats.tsx

import React from 'react';
import { Folder, FileText, Files } from 'lucide-react';
import { useLanguage } from '../../../../i18n/LanguageContext';

interface StatsProps {
    stats: {
        totalFolders: number;
        totalDocuments: number;
        totalItems: number;
    };
}

export const Stats: React.FC<StatsProps> = ({ stats }) => {
    const { t } = useLanguage();

    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Items</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalItems}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm">
                <p className="text-sm text-gray-500 dark:text-gray-400">Folders</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.totalFolders}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm">
                <p className="text-sm text-gray-500 dark:text-gray-400">Documents</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.totalDocuments}</p>
            </div>
        </div>
    );
};