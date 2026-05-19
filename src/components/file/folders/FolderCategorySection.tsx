import { useNavigate } from 'react-router-dom';
import { Folder, MoreVertical, Lock, Upload, Edit3, Trash2, FolderPlus, FilePlus } from 'lucide-react';
import type { FolderItem, FolderCategory } from '../../../types/file/folder.types';
import { CATEGORY_PERMISSIONS } from '../../../types/file/folder.types';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';

const CATEGORY_META: Record<FolderCategory, {
  label: string;
  cardBg: string;
  cardBorder: string;
  iconClass: string;
  badgeClass: string;
  badgeText: string;
  headerAccent: string;
}> = {
  company: {
    label: 'Company Folders',
    cardBg: 'bg-emerald-50',
    cardBorder: 'border-emerald-100 hover:border-emerald-300',
    iconClass: 'text-emerald-600 fill-emerald-100',
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    badgeText: 'Read Only',
    headerAccent: 'text-emerald-700',
  },
  department: {
    label: 'Department Folders',
    cardBg: 'bg-green-50',
    cardBorder: 'border-green-100 hover:border-green-300',
    iconClass: 'text-green-600 fill-green-100',
    badgeClass: 'bg-green-100 text-green-700 border-green-200',
    badgeText: 'Upload Only',
    headerAccent: 'text-green-700',
  },
  shared: {
    label: 'Shared Folders',
    cardBg: 'bg-emerald-50',
    cardBorder: 'border-emerald-100 hover:border-emerald-300',
    iconClass: 'text-emerald-500 fill-emerald-100',
    badgeClass: 'bg-emerald-600 text-white border-emerald-600',
    badgeText: 'Full Access',
    headerAccent: 'text-emerald-700',
  },
  my: {
    label: 'My Folders',
    cardBg: 'bg-green-50',
    cardBorder: 'border-green-100 hover:border-green-300',
    iconClass: 'text-green-500 fill-green-100',
    badgeClass: 'bg-green-600 text-white border-green-600',
    badgeText: 'Full Access',
    headerAccent: 'text-green-700',
  },
  personal: {
    label: 'Personal Folders',
    cardBg: 'bg-emerald-50/60',
    cardBorder: 'border-emerald-100 hover:border-emerald-200',
    iconClass: 'text-emerald-400 fill-emerald-50',
    badgeClass: 'bg-white text-emerald-700 border-emerald-300',
    badgeText: 'Private',
    headerAccent: 'text-emerald-600',
  },
};

interface FolderCategorySectionProps {
  category: FolderCategory;
  folders: FolderItem[];
  onAddFolder?: () => void;
}

export function FolderCategorySection({ category, folders, onAddFolder }: FolderCategorySectionProps) {
  const navigate = useNavigate();
  const meta = CATEGORY_META[category];
  const perms = CATEGORY_PERMISSIONS[category];

  const handleOpen = (folder: FolderItem) => {
    navigate(`/file/documents/${folder.id}`, { state: { folder } });
  };

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className={`text-sm font-semibold ${meta.headerAccent}`}>{meta.label}</h3>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${meta.badgeClass}`}>
            {meta.badgeText}
          </span>
          <span className="text-xs text-gray-400">({folders.length})</span>
        </div>
        {perms.canAddFolder && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs h-7 text-green-600 hover:text-green-700 hover:bg-green-50"
            onClick={onAddFolder}
          >
            <FolderPlus className="w-3.5 h-3.5" />
            New Folder
          </Button>
        )}
      </div>

      {/* Folder grid */}
      {folders.length === 0 ? (
        <div className="flex items-center justify-center py-8 rounded-xl border border-dashed border-green-200 bg-green-50/30">
          <p className="text-sm text-green-400">No folders in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {folders.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              meta={meta}
              perms={perms}
              onOpen={handleOpen}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface FolderCardProps {
  folder: FolderItem;
  meta: typeof CATEGORY_META[FolderCategory];
  perms: typeof CATEGORY_PERMISSIONS[FolderCategory];
  onOpen: (f: FolderItem) => void;
}

function FolderCard({ folder, meta, perms, onOpen }: FolderCardProps) {
  return (
    <div
      onClick={() => onOpen(folder)}
      className={`group relative flex flex-col items-center gap-2 p-4 rounded-2xl border cursor-pointer hover:shadow-md transition-all ${meta.cardBg} ${meta.cardBorder}`}
    >
      {/* Permission indicator */}
      <div className="absolute top-2 left-2">
        {!perms.canEdit && !perms.uploadOnly && (
          <Lock className="w-3 h-3 text-emerald-400" />
        )}
        {perms.uploadOnly && (
          <Upload className="w-3 h-3 text-green-500" />
        )}
      </div>

      {/* Context menu */}
      {(perms.canEdit || perms.canDelete || perms.canAddFile) && (
        <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded-lg hover:bg-white/70"
              >
                <MoreVertical className="w-3.5 h-3.5 text-green-600" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {perms.canAddFile && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onOpen(folder); }}>
                  <FilePlus className="w-4 h-4 mr-2 text-green-500" /> Add File
                </DropdownMenuItem>
              )}
              {perms.canEdit && (
                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                  <Edit3 className="w-4 h-4 mr-2 text-green-500" /> Rename
                </DropdownMenuItem>
              )}
              {(perms.canAddFile || perms.canEdit) && perms.canDelete && (
                <DropdownMenuSeparator />
              )}
              {perms.canDelete && (
                <DropdownMenuItem
                  onClick={(e) => e.stopPropagation()}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <Folder className={`w-10 h-10 ${meta.iconClass}`} />
      <p className="text-xs font-medium text-gray-800 text-center truncate w-full leading-tight">{folder.name}</p>
      <p className="text-xs text-green-500">{folder.fileCount} files</p>
    </div>
  );
}
