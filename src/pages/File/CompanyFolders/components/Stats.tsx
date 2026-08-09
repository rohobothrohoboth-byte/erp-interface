// src/pages/file/CompanyFolders/components/Stats.tsx

import React from 'react';
import type{ CompanyFolderStats } from '../../../../types/file/CompanyFolders/index';

interface StatsProps {
    stats: CompanyFolderStats;
}

export const Stats: React.FC<StatsProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Folders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Items</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalItems}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm">
                <p className="text-sm text-gray-500 dark:text-gray-400">Recently Updated</p>
                <p className="text-2xl font-bold text-green-500 dark:text-green-400">{stats.recent}</p>
            </div>
        </div>
    );
};