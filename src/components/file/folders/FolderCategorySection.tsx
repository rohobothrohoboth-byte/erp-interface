import { useNavigate } from 'react-router-dom';
import { Folder, MoreVertical, Edit3, Trash2, FolderPlus, FilePlus, BookOpen, BarChart3, Scale, Users, Briefcase, Settings } from 'lucide-react';
import type { FolderItem, FolderCategory } from '../../../types/file/folder.types';
import { CATEGORY_PERMISSIONS } from '../../../types/file/folder.types';
import { Button } from '../../ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '../../ui/dropdown-menu';

// Derive company folder icon from ID at render time — never store ReactNodes in data
const COMPANY_ICONS: Record<string, React.ReactNode> = {
  'c-policies': <BookOpen className="w-8 h-8 text-emerald-600" />,
  'c-reports':  <BarChart3 className="w-8 h-8 text-emerald-500" />,
  'c-legal':    <Scale    className="w-8 h-8 text-emerald-600" />,
  'c-hr':       <Users    className="w-8 h-8 text-green-600" />,
  'c-projects': <Briefcase className="w-8 h-8 text-emerald-500" />,
  'c-it':       <Settings  className="w-8 h-8 text-green-500" />,
};

const CATEGORY_META: Record<FolderCategory, { label: string; headerClass: string }> = {
  company:  { label: 'Company Folders',  headerClass: 'text-gray-700' },
  personal: { label: 'Personal Folders', headerClass: 'text-gray-700' },
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
    navigate(`/file/documents/${folder.id}`);
  };

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className={`text-sm font-semibold ${meta.headerClass}`}>{meta.label}</h3>
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
        <div className="flex items-center justify-center py-8 rounded-xl border border-dashed border-gray-200">
          <p className="text-sm text-gray-400">No folders</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {folders.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
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
  perms: typeof CATEGORY_PERMISSIONS[FolderCategory];
  onOpen: (f: FolderItem) => void;
}

function FolderCard({ folder, perms, onOpen }: FolderCardProps) {
  const isCompany = folder.category === 'company';

  return (
    <div
      onClick={() => onOpen(folder)}
      className="group relative flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 bg-white cursor-pointer hover:border-green-200 hover:shadow-sm transition-all"
    >
      {/* Context menu — only for personal */}
      {(perms.canEdit || perms.canDelete || perms.canAddFile) && (
        <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <MoreVertical className="w-3.5 h-3.5 text-gray-400" />
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
              {(perms.canAddFile || perms.canEdit) && perms.canDelete && <DropdownMenuSeparator />}
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

      {/* Icon — system icon for company, plain folder for personal */}
      {isCompany && COMPANY_ICONS[folder.id] ? (
        <div className="w-12 h-12 flex items-center justify-center">
          {COMPANY_ICONS[folder.id]}
        </div>
      ) : (
        <Folder className="w-12 h-12 text-yellow-400 fill-yellow-50" />
      )}

      <p className="text-xs font-medium text-gray-800 text-center truncate w-full leading-tight">
        {folder.name}
      </p>
      <p className="text-xs text-gray-400">{folder.fileCount} files</p>
    </div>
  );
}
