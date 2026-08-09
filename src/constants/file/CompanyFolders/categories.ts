// src/pages/file/CompanyFolders/constants/categories.ts

export const FOLDER_TYPES = [
    { id: 'company', label: 'Company', icon: '🏢' },
    { id: 'personal', label: 'Personal', icon: '👤' },

];

export const FOLDER_COLORS: Record<string, string> = {
    company: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800',
    department: 'bg-green-50 text-green-600 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800',
    team: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800',
    personal: 'bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-950/30 dark:text-cyan-400 dark:border-cyan-800',
    shared: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
    archive: 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700',
    default: 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800',
};