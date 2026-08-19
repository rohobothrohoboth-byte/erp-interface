// src/constants/file/CompanyDocuments/categories.ts

import { FileCheck, FileText, FileSpreadsheet, File, Package, BarChart3, Presentation, Database ,FileArchive } from 'lucide-react';

export const COMPANY_CATEGORIES = [
    { id: 'all', label: 'All Documents', icon: FileText },
    { id: 'policy', label: 'Policies', icon: FileCheck },
    { id: 'procedure', label: 'Procedures', icon: FileText },
    { id: 'form', label: 'Forms', icon: FileSpreadsheet },
    { id: 'template', label: 'Templates', icon: File },
    { id: 'report', label: 'Reports', icon: BarChart3 },
    { id: 'presentation', label: 'Presentations', icon: Presentation },
    { id: 'archive', label: 'Archive', icon: FileArchive },
    { id: 'other', label: 'Other', icon: Package },
];
export const CATEGORIES = [
    { id: 'all', label: 'All Documents', icon: Database, color: 'blue' },
    { id: 'policy', label: 'Policies', icon: FileCheck, color: 'red' },
    { id: 'procedure', label: 'Procedures', icon: FileText, color: 'cyan' },
    { id: 'form', label: 'Forms', icon: FileSpreadsheet, color: 'green' },
    { id: 'template', label: 'Templates', icon: File, color: 'purple' },
    { id: 'report', label: 'Reports', icon: BarChart3, color: 'orange' },
    { id: 'presentation', label: 'Presentations', icon: Presentation, color: 'pink' },
    { id: 'archive', label: 'Archive', icon: FileArchive, color: 'gray' },
    { id: 'other', label: 'Other', icon: Package, color: 'gray' },
];
export const CATEGORY_COLORS: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800',
    red: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-950/30 dark:text-cyan-400 dark:border-cyan-800',
    green: 'bg-green-50 text-green-600 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800',
    purple: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800',
    orange: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800',
    pink: 'bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-950/30 dark:text-pink-400 dark:border-pink-800',
    gray: 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700',
};

export const COMPANY_CATEGORY_COLORS: Record<string, string> = {
    all: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    policy: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    procedure: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    form: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    template: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    report: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    presentation: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    archive: 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400',
    other: 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400',
};

export default COMPANY_CATEGORIES;