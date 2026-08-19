// src/pages/file/CompanyDocuments/types/index.ts

export interface CompanyDocument {
    id: string;
    name: string;
    fileName: string;
    originalFileName?: string;
    fileSize: number;
    fileSizeFormatted?: string;
    contentType: string;
    fileType?: string;
    mimeType?: string;
    category: string;
    documentType?: string;
    description?: string;
    isFavorite?: boolean;
    isStarred?: boolean;
    isPublic?: boolean;
    isShared?: boolean;
    sharingLevel?: string;
    uploadedBy: string;
    uploadedByName?: string;
    uploadedAt: string;
    createdAt: string;
    updatedAt: string;
    dateAdd?: string;
    dateMod?: string;
    module?: string;
    referenceId?: string;
    version?: number;
    owner?: string;
}

export interface CompanyDocumentStats {
    total: number;
    totalSize: number;
    favorites: number;
    recent: number;
}

export interface CategoryConfig {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}

export type ViewMode = 'grid' | 'list';
export type SortBy = 'name' | 'date' | 'size';
export type SortOrder = 'asc' | 'desc';