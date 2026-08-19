// src/pages/file/FolderContentsPage/utils/helpers.ts

import React from 'react';
import {
    Building2, Users, Shield, HardDrive, User, Folder,
    Image, FileText, FileSpreadsheet, Video, Music, Archive,
    File, FileCode, FileQuestion
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

export const getFileIcon = (fileType?: string, fileName?: string) => {
    const ext = fileName?.split('.').pop()?.toLowerCase() || '';
    const type = fileType?.toLowerCase() || '';

    if (type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'].includes(ext)) {
        return <Image className="w-5 h-5 text-purple-500" />;
    }
    if (type.includes('pdf') || ext === 'pdf') {
        return <FileText className="w-5 h-5 text-red-500" />;
    }
    if (type.includes('excel') || type.includes('spreadsheet') || ['xls', 'xlsx', 'csv', 'tsv'].includes(ext)) {
        return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
    }
    if (type.includes('word') || type.includes('document') || ['doc', 'docx', 'txt', 'rtf'].includes(ext)) {
        return <FileText className="w-5 h-5 text-blue-500" />;
    }
    if (type.includes('presentation') || type.includes('powerpoint') || ['ppt', 'pptx', 'key'].includes(ext)) {
        return <FileText className="w-5 h-5 text-orange-500" />;
    }
    if (type.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'].includes(ext)) {
        return <Video className="w-5 h-5 text-red-400" />;
    }
    if (type.startsWith('audio/') || ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'].includes(ext)) {
        return <Music className="w-5 h-5 text-green-400" />;
    }
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) {
        return <Archive className="w-5 h-5 text-amber-500" />;
    }
    if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'scss', 'json', 'xml', 'yaml'].includes(ext)) {
        return <FileCode className="w-5 h-5 text-cyan-500" />;
    }
    return <File className="w-5 h-5 text-gray-500" />;
};

export const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};
export const getCategoryColor = (category: string): string => {
    const colorMap: Record<string, string> = {
        work: 'blue',
        personal: 'green',
        projects: 'purple',
        documents: 'amber',
        images: 'pink',
        videos: 'red',
        music: 'emerald',
        archive: 'gray',
        company: 'indigo',
        shared: 'amber',
        department: 'indigo',
    };
    return colorMap[category?.toLowerCase()] || 'gray';
};

export const getCategoryDisplayName = (category: string): string => {
    return category.charAt(0).toUpperCase() + category.slice(1);
};
export const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
        document: FileText,
        image: Image,
        pdf: FileText,
        spreadsheet: FileSpreadsheet,
        presentation: FileText,
        video: Video,
        audio: Music,
        archive: Archive,
        work: Folder,
        personal: User,
        projects: Folder,
    };
    return icons[category] || File;
};