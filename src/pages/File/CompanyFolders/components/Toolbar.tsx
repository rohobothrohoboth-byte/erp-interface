// src/pages/file/CompanyFolders/components/Toolbar.tsx

import React from 'react';
import { Search, Grid, List } from 'lucide-react';
import type{ ViewMode, SortBy, SortOrder }from '../../../../types/file/CompanyFolders/index';

interface ToolbarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    sortBy: SortBy;
    onSortByChange: (sort: SortBy) => void;
    sortOrder: SortOrder;
    onSortOrderChange: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
                                                    searchTerm,
                                                    onSearchChange,
                                                    viewMode,
                                                    onViewModeChange,
                                                    sortBy,
                                                    onSortByChange,
                                                    sortOrder,
                                                    onSortOrderChange,
                                                }) => {
    return (
        <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Search company folders..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                />
            </div>
            <div className="flex items-center gap-2">
                <select
                    value={sortBy}
                    onChange={(e) => onSortByChange(e.target.value as SortBy)}
                    className="px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="date">Sort by Date</option>
                    <option value="name">Sort by Name</option>
                    <option value="items">Sort by Items</option>
                </select>
                <button
                    onClick={onSortOrderChange}
                    className="p-2 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
                <button
                    onClick={() => onViewModeChange('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'grid'
                            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                            : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400'
                    }`}
                >
                    <Grid className="w-4 h-4" />
                </button>
                <button
                    onClick={() => onViewModeChange('list')}
                    className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'list'
                            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                            : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400'
                    }`}
                >
                    <List className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};