// src/types/file/folder.types.ts

// ==================== DOCUMENT TYPES ====================
export interface DocumentItem {
  id: string;
  name: string;
  originalFileName: string;
  contentType: string;
  size: string;
  sizeBytes: number;
  updatedAt: string;
  owner: string;
  ownerId: string;
  folderId: string | null;
  folderName?: string;
  folderCategory?: string;
  isFavorite: boolean;
  isArchived: boolean;
  isShared: boolean;
  sharingLevel: string;
  thumbnailPath: string | null;
  thumbnailUrl?: string | null;
  filePath: string;
  module: string;
  referenceId: string | null;
  category: string;
  documentType: string;
  docPermission?: DocumentPermission;
  icon: string;
  color?: string;
  canEdit: boolean;
  canDelete: boolean;
  canDownload: boolean;
  canShare: boolean;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  lastModifiedAt: string | null;
  version: number;
  hash: string | null;
}

export interface DocumentPermission {
  canEdit: boolean;
  canDelete: boolean;
  canDownload: boolean;
  canShare: boolean;
  canPrint: boolean;
  canView: boolean;
}

// ==================== FOLDER TYPES ====================
// ✅ Updated to match the actual API response
export interface FolderItem {
  id: string;
  name: string;
  description?: string | null;
  folderType?: string;           // ✅ Changed from 'type' to 'folderType'
  parentId?: string | null;
  parentName?: string | null;    // ✅ Added parentName
  isPublic?: boolean;
  isShared?: boolean;
  sharingLevel?: string;
  isArchived?: boolean;          // ✅ Added isArchived
  order?: number;                // ✅ Added order
  documentCount?: number;        // ✅ Changed from 'fileCount' to 'documentCount'
  subFolderCount?: number;       // ✅ Added subFolderCount
  createdBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  canShare?: boolean;
  icon?: string;                 // ✅ Added icon
  color?: string;                // ✅ Added color
  subFolders?: FolderItem[] | null;  // ✅ Added subFolders
  documents?: DocumentItem[] | null; // ✅ Added documents
}

// ✅ Backward compatibility interface (if needed)
export interface FolderItemLegacy {
  id: string;
  name: string;
  description?: string;
  fileCount: number;
  updatedAt: string;
  type: 'company' | 'personal' | 'shared' | 'public' | 'archive';
  owner: string;
  ownerId?: string;
  parentId?: string | null;
  isShared?: boolean;
  isPublic?: boolean;
  sharingLevel?: string;
  createdAt?: string;
  createdBy?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  canShare?: boolean;
  icon?: string;
  color?: string;
}

export interface FolderPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
  canDownload: boolean;
  canPrint: boolean;
  canAddFile: boolean;
  canAddFolder: boolean;
  uploadOnly: boolean;
}

// ==================== DTO TYPES ====================
export interface CreateFolderDto {
  name: string;
  description?: string;
  folderType?: string;
  category?: string;
  parentId?: string | null;
  isPublic?: boolean;
  isShared?: boolean;
  sharingLevel?: string;
  order?: number;
}

export interface UpdateFolderDto {
  name?: string;
  description?: string;
  folderType?: string;
  isPublic?: boolean;
  isShared?: boolean;
  sharingLevel?: string;
  order?: number;
}

export interface MoveFolderDto {
  targetParentId: string | null;
}

// ==================== RESPONSE TYPES ====================
export interface FolderListResponse {
  items: FolderItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FolderDetailResponse {
  id: string;
  name: string;
  description?: string | null;
  folderType?: string;
  parentId?: string | null;
  parentName?: string | null;
  isPublic?: boolean;
  isShared?: boolean;
  sharingLevel?: string;
  isArchived?: boolean;
  order?: number;
  documentCount?: number;
  subFolderCount?: number;
  createdBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  canShare?: boolean;
  icon?: string;
  color?: string;
  subFolders?: FolderItem[] | null;
  documents?: DocumentItem[] | null;
}

// ==================== VIEW TYPES ====================
export type ViewMode = 'grid' | 'list';
export type SortField = 'name' | 'updatedAt' | 'size' | 'type' | 'owner';
export type SortDir = 'asc' | 'desc';

// ==================== PERMISSIONS ====================
export const CATEGORY_PERMISSIONS: Record<string, FolderPermissions> = {
  company: {
    canView: true,
    canEdit: true,
    canDelete: false,
    canShare: true,
    canDownload: true,
    canPrint: true,
    canAddFile: true,
    canAddFolder: true,
    uploadOnly: false,
  },
  personal: {
    canView: true,
    canEdit: true,
    canDelete: true,
    canShare: true,
    canDownload: true,
    canPrint: true,
    canAddFile: true,
    canAddFolder: true,
    uploadOnly: false,
  },
  shared: {
    canView: true,
    canEdit: false,
    canDelete: false,
    canShare: false,
    canDownload: true,
    canPrint: true,
    canAddFile: false,
    canAddFolder: false,
    uploadOnly: false,
  },
  public: {
    canView: true,
    canEdit: false,
    canDelete: false,
    canShare: false,
    canDownload: true,
    canPrint: true,
    canAddFile: false,
    canAddFolder: false,
    uploadOnly: false,
  },
  archive: {
    canView: true,
    canEdit: false,
    canDelete: false,
    canShare: false,
    canDownload: false,
    canPrint: false,
    canAddFile: false,
    canAddFolder: false,
    uploadOnly: false,
  },
};

export const effectivePerms = (
    base: FolderPermissions,
    docPerm?: DocumentPermission
): FolderPermissions => {
  if (!docPerm) return base;
  return {
    ...base,
    canEdit: base.canEdit && docPerm.canEdit,
    canDelete: base.canDelete && docPerm.canDelete,
    canDownload: base.canDownload && docPerm.canDownload,
    canShare: base.canShare && docPerm.canShare,
    canPrint: base.canPrint && docPerm.canPrint,
    canView: base.canView && docPerm.canView,
  };
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Get folder type display name
 */
export const getFolderTypeLabel = (type?: string): string => {
  const labels: Record<string, string> = {
    company: 'Company',
    department: 'Department',
    team: 'Team',
    personal: 'Personal',
    shared: 'Shared',
    public: 'Public',
    archive: 'Archive',
    general: 'General',
  };
  return labels[type || 'general'] || 'General';
};

/**
 * Get folder type color
 */
export const getFolderTypeColor = (type?: string): string => {
  const colors: Record<string, string> = {
    company: '#4F46E5', // Indigo
    department: '#7C3AED', // Purple
    team: '#0891B2', // Cyan
    personal: '#10B981', // Emerald
    shared: '#F59E0B', // Amber
    public: '#3B82F6', // Blue
    archive: '#6B7280', // Gray
    general: '#6366F1', // Indigo
  };
  return colors[type || 'general'] || colors.general;
};

/**
 * Get folder type icon
 */
export const getFolderTypeIcon = (type?: string): string => {
  const icons: Record<string, string> = {
    company: '🏢',
    department: '📋',
    team: '👥',
    personal: '👤',
    shared: '🔗',
    public: '🌐',
    archive: '📦',
    general: '📁',
  };
  return icons[type || 'general'] || icons.general;
};

/**
 * Format folder data from API response
 */
export const formatFolderData = (data: any): FolderItem => {
  return {
    id: data.id,
    name: data.name,
    description: data.description || null,
    folderType: data.folderType || data.type || 'general',
    parentId: data.parentId || null,
    parentName: data.parentName || null,
    isPublic: data.isPublic ?? false,
    isShared: data.isShared ?? false,
    sharingLevel: data.sharingLevel || 'Private',
    isArchived: data.isArchived ?? false,
    order: data.order || 0,
    documentCount: data.documentCount || data.fileCount || 0,
    subFolderCount: data.subFolderCount || 0,
    createdBy: data.createdBy || null,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt || data.createdAt,
    canEdit: data.canEdit ?? true,
    canDelete: data.canDelete ?? true,
    canShare: data.canShare ?? true,
    icon: data.icon || getFolderTypeIcon(data.folderType || data.type),
    color: data.color || getFolderTypeColor(data.folderType || data.type),
    subFolders: data.subFolders || null,
    documents: data.documents || null,
  };
};

/**
 * Check if a folder is a root folder (no parent)
 */
export const isRootFolder = (folder: FolderItem): boolean => {
  return !folder.parentId || folder.parentId === null || folder.parentId === '';
};

/**
 * Check if a folder has children
 */
export const hasChildren = (folder: FolderItem): boolean => {
  return (folder.subFolderCount || 0) > 0 || (folder.documentCount || 0) > 0;
};