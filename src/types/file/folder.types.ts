import type { ReactNode } from 'react';

export type FolderCategory = 'company' | 'personal';

export interface FolderPermissions {
  canAddFolder: boolean;
  canAddFile: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canDownload: boolean;
  canPrint: boolean;
  uploadOnly: boolean;
}

export const CATEGORY_PERMISSIONS: Record<FolderCategory, FolderPermissions> = {
  company: {
    canAddFolder: false,
    canAddFile:   false,
    canEdit:      false,
    canDelete:    false,
    canDownload:  false,
    canPrint:     false,
    uploadOnly:   false,
  },
  personal: {
    canAddFolder: true,
    canAddFile:   true,
    canEdit:      true,
    canDelete:    true,
    canDownload:  true,
    canPrint:     true,
    uploadOnly:   false,
  },
};

export interface FolderItem {
  id: string;
  name: string;
  fileCount: number;
  updatedAt: string;
  category: FolderCategory;
  owner?: string;
  description?: string;
  /** Company folders can have a special system icon (like Windows default folders) */
  systemIcon?: ReactNode;
}

export interface DocumentItem {
  id: string;
  name: string;
  contentType: string;
  size: string;
  updatedAt: string;
  owner: string;
  folderId: string;
  folderCategory: FolderCategory;
  isFavorite?: boolean;
  /** For image files, a thumbnail URL */
  thumbnailUrl?: string;
}

export type SortField = 'name' | 'size' | 'updatedAt' | 'type';
export type SortDir   = 'asc' | 'desc';
export type ViewMode  = 'grid' | 'list';
