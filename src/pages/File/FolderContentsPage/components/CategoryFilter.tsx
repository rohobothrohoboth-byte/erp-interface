// src/pages/file/FolderContentsPage/components/CategoryFilter.tsx

import React from 'react';
import { FileText, Image, FileSpreadsheet, Video, Music, Archive, File, Database } from 'lucide-react';

interface CategoryFilterProps {
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    categories?: Array<{ id: string; label: string; icon: React.ComponentType<{ className?: string }> }>;
}

const DEFAULT_CATEGORIES = [
    { id: 'all', label: 'All Documents', icon: Database },
    { id: 'document', label: 'Document', icon: FileText },
    { id: 'image', label: 'Image', icon: Image },
    { id: 'pdf', label: 'PDF', icon: FileText },
    { id: 'spreadsheet', label: 'Spreadsheet', icon: FileSpreadsheet },
    { id: 'presentation', label: 'Presentation', icon: FileText },
    { id: 'video', label: 'Video', icon: Video },
    { id: 'audio', label: 'Audio', icon: Music },
    { id: 'archive', label: 'Archive', icon: Archive },
    { id: 'other', label: 'Other', icon: File },
];

const CATEGORY_COLORS: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800',
    red: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-950/30 dark:text-cyan-400 dark:border-cyan-800',
    green: 'bg-green-50 text-green-600 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800',
    purple: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800',
    orange: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800',
    pink: 'bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-950/30 dark:text-pink-400 dark:border-pink-800',
    gray: 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800',
};

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
                                                                  selectedCategory,
                                                                  onCategoryChange,
                                                                  categories = DEFAULT_CATEGORIES,
                                                              }) => {
    // Get color for category
    const getCategoryColor = (categoryId: string) => {
        const colors: Record<string, string> = {
            all: 'blue',
            document: 'indigo',
            image: 'purple',
            pdf: 'red',
            spreadsheet: 'green',
            presentation: 'orange',
            video: 'pink',
            audio: 'cyan',
            archive: 'gray',
            other: 'gray',
        };
        return CATEGORY_COLORS[colors[categoryId] || 'gray'];
    };

    return (
        <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;

                return (
                    <button
                        key={cat.id}
                        onClick={() => onCategoryChange(cat.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                            isSelected
                                ? `bg-blue-600 text-white shadow-lg shadow-blue-500/20`
                                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'
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

export default CategoryFilter;