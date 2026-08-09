// src/components/hr/recruit/onboardingTask/OnboardingTaskSearchFilter.tsx

import React from 'react';
import { Search, Plus, Loader2 } from 'lucide-react';

interface OnboardingTaskSearchFilterProps {
    searchTerm: string;
    setSearchTerm: (v: string) => void;
    onAddClick: () => void;
    isLoading?: boolean;
}

const OnboardingTaskSearchFilter: React.FC<OnboardingTaskSearchFilterProps> = ({
                                                                                   searchTerm,
                                                                                   setSearchTerm,
                                                                                   onAddClick,
                                                                                   isLoading = false
                                                                               }) => (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search onboarding tasks..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={isLoading}
            />
        </div>
        <button
            onClick={onAddClick}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Plus className="w-4 h-4" />
            Add Task
        </button>
    </div>
);

export default OnboardingTaskSearchFilter;