// src/pages/file/CompanyDocuments/components/Stats.tsx

import React from 'react';
import type { CompanyDocumentStats } from '@/modules/file/types/CompanyDocuments/index';

interface StatsProps {
    stats: CompanyDocumentStats;
}

export const Stats: React.FC<StatsProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Items</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Size</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(stats.totalSize / (1024 * 1024)).toFixed(1)} MB
                </p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm">
                <p className="text-sm text-gray-500 dark:text-gray-400">Favorites</p>
                <p className="text-2xl font-bold text-yellow-500">{stats.favorites}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm">
                <p className="text-sm text-gray-500 dark:text-gray-400">Recent (7 days)</p>
                <p className="text-2xl font-bold text-cyan-500">{stats.recent}</p>
            </div>
        </div>
    );
};