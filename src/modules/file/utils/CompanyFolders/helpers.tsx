// src/pages/file/CompanyFolders/utils/helpers.tsx

import React from 'react';
import {
    Building2, Users, User, Shield, HardDrive, Folder,
    Folder as FolderIcon, FolderOpen, FolderPlus
} from 'lucide-react';


export const getFolderIcon = (folderType?: string) => {
    const type = folderType?.toLowerCase() || '';
    switch (type) {
        case 'company':
            return <Building2 className="w-5 h-5 text-blue-500" />;
        case 'department':
            return <Users className="w-5 h-5 text-green-500" />;
        case 'team':
            return <Users className="w-5 h-5 text-purple-500" />;
        case 'personal':
            return <User className="w-5 h-5 text-cyan-500" />;
        case 'shared':
            return <Shield className="w-5 h-5 text-amber-500" />;
        case 'archive':
            return <HardDrive className="w-5 h-5 text-gray-500" />;
        default:
            return <Folder className="w-5 h-5 text-indigo-500" />;
    }
};

export const getFolderColor = (folderType?: string) => {
    const type = folderType?.toLowerCase() || '';
    const colors: Record<string, string> = {
        company: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800',
        department: 'bg-green-50 text-green-600 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800',
        team: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800',
        personal: 'bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-950/30 dark:text-cyan-400 dark:border-cyan-800',
        shared: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
        archive: 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700',
    };
    return colors[type] || colors.default || 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800';
};

export const getFolderTypeDisplay = (folderType?: string): string => {
    const type = folderType?.toLowerCase() || '';
    const map: Record<string, string> = {
        company: 'Company',
        department: 'Department',
        team: 'Team',
        personal: 'Personal',
        shared: 'Shared',
        archive: 'Archive',
        general: 'General',
    };
    return map[type] || folderType || 'General';
};

export const getFolderId = (folder: any): string => {
    return folder?.id || `folder-${Math.random()}`;
};

export const getFolderName = (folder: any): string => {
    return folder?.name || 'Unnamed Folder';
};

export const getFolderDescription = (folder: any): string => {
    return folder?.description || '';
};

export const getFolderType = (folder: any): string => {
    return folder?.folderType || folder?.type || 'general';
};

export const getItemCount = (folder: any): number => {
    return folder?.documentCount || folder?.subFolderCount || 0;
};

export const getFolderUpdatedAt = (folder: any): string => {
    return folder?.updatedAt || folder?.dateMod || folder?.createdAt || folder?.dateAdd || new Date().toISOString();
};

export const getFolderCreatedAt = (folder: any): string => {
    return folder?.createdAt || folder?.dateAdd || new Date().toISOString();
};

export const getFolderOwner = (folder: any): string => {
    return folder?.owner || folder?.ownerId || 'Unknown';
};

export const isFolderCompany = (folder: any): boolean => {
    const type = (folder?.folderType || folder?.type || '').toLowerCase();
    return type === 'company' ||
        type === 'Company' ||
        folder?.parentId === null ||
        folder?.parentId === 'null' ||
        folder?.parentId === '';
};