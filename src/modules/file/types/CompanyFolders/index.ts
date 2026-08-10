// src/pages/file/CompanyFolders/types/index.ts

export interface CompanyFolder {
    id: string;
    name: string;
    description?: string;
    folderType?: string;
    type?: string;
    parentId?: string | null;
    isPublic?: boolean;
    isShared?: boolean;
    sharingLevel?: string;
    isArchived?: boolean;
    order?: number;
    createdAt?: string;
    updatedAt?: string;
    dateAdd?: string;
    dateMod?: string;
    documentCount?: number;
    subFolderCount?: number;
    owner?: string;
    ownerId?: string;
    canEdit?: boolean;
    canDelete?: boolean;
    canShare?: boolean;
    icon?: string;
    color?: string;
}

export interface CompanyFolderStats {
    total: number;
    totalItems: number;
    recent: number;
}

export type ViewMode = 'grid' | 'list';
export type SortBy = 'name' | 'date' | 'items';
export type SortOrder = 'asc' | 'desc';