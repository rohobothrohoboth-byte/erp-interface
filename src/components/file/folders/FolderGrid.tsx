import { Folder, MoreVertical, Users, Lock, Globe } from 'lucide-react';

export interface FolderItem {
  id: string;
  name: string;
  fileCount: number;
  updatedAt: string;
  type: 'personal' | 'shared' | 'public';
  owner?: string;
}

interface FolderGridProps {
  folders: FolderItem[];
  onOpen?: (folder: FolderItem) => void;
  onMenu?: (folder: FolderItem) => void;
  emptyMessage?: string;
}

const typeIcon = (type: FolderItem['type']) => {
  if (type === 'shared')   return <Users className="w-3.5 h-3.5 text-blue-500" />;
  if (type === 'public')   return <Globe className="w-3.5 h-3.5 text-green-500" />;
  return <Lock className="w-3.5 h-3.5 text-gray-400" />;
};

export function FolderGrid({ folders, onOpen, onMenu, emptyMessage = 'No folders found' }: FolderGridProps) {
  if (folders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Folder className="w-12 h-12 text-gray-200 mb-3" />
        <p className="text-sm text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {folders.map((folder) => (
        <div
          key={folder.id}
          onDoubleClick={() => onOpen?.(folder)}
          className="group relative flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-100 bg-white hover:border-emerald-200 hover:shadow-sm transition-all cursor-pointer"
        >
          <div className="relative">
            <Folder className="w-12 h-12 text-emerald-400 fill-emerald-50" />
            <span className="absolute -bottom-1 -right-1">{typeIcon(folder.type)}</span>
          </div>
          <p className="text-sm font-medium text-gray-800 text-center truncate w-full">{folder.name}</p>
          <p className="text-xs text-gray-400">{folder.fileCount} files</p>
          {onMenu && (
            <button
              onClick={(e) => { e.stopPropagation(); onMenu(folder); }}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-gray-100 transition-all"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
