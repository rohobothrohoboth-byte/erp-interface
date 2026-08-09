// src/pages/file/CompanyDocuments/utils/helpers.tsx

import React from 'react';
import {
    FileText, Image, FileSpreadsheet, FileVideo, FileAudio,
    FileArchive, FileCode, FileQuestion, File, Star
} from 'lucide-react';

export const getDocProperty = (doc: any, key: string): any => {
    if (!doc) return undefined;
    const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
    const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
    return doc[camelKey] !== undefined ? doc[camelKey] : doc[pascalKey];
};

export const getFileIcon = (contentType: string, fileName?: string) => {
    const ext = fileName?.split('.').pop()?.toLowerCase() || '';

    // Images
    if (contentType?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'].includes(ext)) {
        return <Image className="w-5 h-5 text-purple-500" />;
    }
    // PDF
    if (contentType?.includes('pdf') || ext === 'pdf') {
        return <FileText className="w-5 h-5 text-red-500" />;
    }
    // Excel / Spreadsheet
    if (contentType?.includes('excel') || contentType?.includes('spreadsheet') || ['xls', 'xlsx', 'csv', 'tsv'].includes(ext)) {
        return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
    }
    // Word / Document
    if (contentType?.includes('word') || contentType?.includes('document') || ['doc', 'docx', 'txt', 'rtf'].includes(ext)) {
        return <FileText className="w-5 h-5 text-blue-500" />;
    }
    // PowerPoint
    if (contentType?.includes('presentation') || contentType?.includes('powerpoint') || ['ppt', 'pptx', 'key'].includes(ext)) {
        return <FileText className="w-5 h-5 text-orange-500" />;
    }
    // Video
    if (contentType?.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'].includes(ext)) {
        return <FileVideo className="w-5 h-5 text-red-400" />;
    }
    // Audio
    if (contentType?.startsWith('audio/') || ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'].includes(ext)) {
        return <FileAudio className="w-5 h-5 text-green-400" />;
    }
    // Archive
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) {
        return <FileArchive className="w-5 h-5 text-amber-500" />;
    }
    // Code
    if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'scss', 'json', 'xml', 'yaml'].includes(ext)) {
        return <FileCode className="w-5 h-5 text-cyan-500" />;
    }
    return <FileQuestion className="w-5 h-5 text-gray-500" />;
};

export const getFileIconLarge = (contentType: string, fileName?: string) => {
    const Icon = getFileIcon(contentType, fileName);
    return React.cloneElement(Icon, { className: 'w-8 h-8' });
};

export const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 KB';
    if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes > 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${bytes} bytes`;
};

export const getDisplayName = (doc: any): string => {
    return getDocProperty(doc, 'name') || getDocProperty(doc, 'fileName') || 'Unknown';
};

export const getDisplaySize = (doc: any): string => {
    const size = getDocProperty(doc, 'size') || getDocProperty(doc, 'fileSize') || getDocProperty(doc, 'fileSizeFormatted') || 0;
    if (typeof size === 'string') return size;
    if (typeof size === 'number') return formatFileSize(size);
    return '0 KB';
};

export const getSizeBytes = (doc: any): number => {
    const size = getDocProperty(doc, 'size') || getDocProperty(doc, 'fileSize') || 0;
    return typeof size === 'number' ? size : 0;
};

export const getContentType = (doc: any): string => {
    return getDocProperty(doc, 'contentType') || getDocProperty(doc, 'fileType') || getDocProperty(doc, 'mimeType') || '';
};

export const getUpdatedAt = (doc: any): string => {
    return getDocProperty(doc, 'updatedAt') || getDocProperty(doc, 'uploadedAt') || getDocProperty(doc, 'dateMod') || new Date().toISOString();
};

export const getCreatedAt = (doc: any): string => {
    return getDocProperty(doc, 'createdAt') || getDocProperty(doc, 'uploadedAt') || getDocProperty(doc, 'dateAdd') || new Date().toISOString();
};

export const getOwner = (doc: any): string => {
    return getDocProperty(doc, 'owner') || getDocProperty(doc, 'uploadedBy') || getDocProperty(doc, 'uploadedByName') || 'Unknown';
};

export const getIsFavorite = (doc: any): boolean => {
    return getDocProperty(doc, 'isFavorite') || getDocProperty(doc, 'isStarred') || false;
};

export const getId = (doc: any): string => {
    return getDocProperty(doc, 'id') || `doc-${Math.random()}`;
};

export const getCategory = (doc: any): string => {
    return getDocProperty(doc, 'category') || getDocProperty(doc, 'documentType') || 'other';
};

export const getDescription = (doc: any): string => {
    return getDocProperty(doc, 'description') || '';
};