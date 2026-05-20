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
    canDownload:  true,   // allowed at folder level; doc perms may restrict further
    canPrint:     true,   // allowed at folder level; doc perms may restrict further
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
}

/**
 * Per-document access level.
 * - 'full'           → all folder perms apply (edit, delete, download, print)
 * - 'print-download' → can view, download and print; no edit/delete
 * - 'view-only'      → can only open/view; no download, no print, no edit
 *
 * The effective permission is the intersection of folder perms and doc perms.
 * Company folders are already read-only at folder level, so doc perms further
 * restrict what's allowed within that folder.
 */
export type DocPermission = 'full' | 'print-download' | 'view-only';

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
  /** Per-document access level. Defaults to 'full' when not set. */
  docPermission?: DocPermission;
  /** For image files, a thumbnail URL */
  thumbnailUrl?: string;
}

/** Merge folder-level perms with per-document perms to get effective perms. */
export function effectivePerms(
  folderPerms: FolderPermissions,
  docPerm: DocPermission = 'full',
): FolderPermissions {
  if (docPerm === 'view-only') {
    return {
      ...folderPerms,
      canDownload: false,
      canPrint:    false,
      canEdit:     false,
      canDelete:   false,
      canAddFile:  false,
      uploadOnly:  false,
    };
  }
  if (docPerm === 'print-download') {
    return {
      ...folderPerms,
      canDownload: folderPerms.canDownload,
      canPrint:    folderPerms.canPrint,
      canEdit:     false,
      canDelete:   false,
      canAddFile:  false,
      uploadOnly:  false,
    };
  }
  return folderPerms;
}

export type SortField = 'name' | 'size' | 'updatedAt' | 'type';
export type SortDir   = 'asc' | 'desc';
export type ViewMode  = 'grid' | 'list';
