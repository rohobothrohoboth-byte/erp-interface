// src/pages/file/CompanyDocuments/components/CompanyCategoryFilter.tsx

import React from 'react';
import { COMPANY_CATEGORIES, COMPANY_CATEGORY_COLORS } from '@/modules/file/constants/CompanyDocuments/categories';

interface CompanyCategoryFilterProps {
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
}

export const CompanyCategoryFilter: React.FC<CompanyCategoryFilterProps> = ({
                                                                                selectedCategory,
                                                                                onCategoryChange,
                                                                            }) => {
    return (
        <div className="flex flex-wrap gap-2">
            {COMPANY_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                const colorClass = COMPANY_CATEGORY_COLORS[cat.id] || COMPANY_CATEGORY_COLORS.other;

                return (
                    <button
                        key={cat.id}
                        onClick={() => onCategoryChange(cat.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                            isSelected
                                ? `bg-blue-600 text-white shadow-lg shadow-blue-500/20`
                                : `bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700`
                        }`}
                    >
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : ''}`} />
                        {cat.label}
                    </button>
                );
            })}
        </div>
    );
};

export default CompanyCategoryFilter;