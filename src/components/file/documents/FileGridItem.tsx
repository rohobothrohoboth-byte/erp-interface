import { Star, MoreVertical, Download, Printer, Trash2, Edit3, Lock, Upload } from 'lucide-react';
import { FileThumbnail } from '../FileThumbnail';
import { getFileTypeConfig } from '../fileTypeConfig';
import type { DocumentItem, FolderPermissions } from '../../../types/file/folder.types';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '../../ui/dropdown-menu';

interface FileGridItemProps {
  doc: DocumentItem;
  perms: FolderPermissions;
  selected: boolean;
  onSelect: () => void;
  onFavorite: () => void;
  onDelete: () => void;
  onDownload: () => void;
  onPrint: () => void;
}

export function FileGridItem({
  doc, perms, selected,
  onSelect, onFavorite, onDelete, onDownload, onPrint,
}: FileGridItemProps) {
  const cfg = getFileTypeConfig(doc.contentType, doc.name);

  return (
    <div
      onClick={onSelect}
      className={`group relative flex flex-col gap-2 p-3 rounded-xl border cursor-pointer transition-all hover:shadow-sm ${
        selected
          ? 'border-green-400 bg-green-50/60 shadow-sm'
          : 'border-gray-100 bg-white hover:border-gray-200'
      }`}
    >
      {/* Privilege badge */}
      <div className="absolute top-2 left-2 z-10">
        {!perms.canEdit && !perms.uploadOnly && (
          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-medium">
            <Lock className="w-2.5 h-2.5" /> Read Only
          </span>
        )}
        {perms.uploadOnly && (
          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 text-[10px] font-medium">
            <Upload className="w-2.5 h-2.5" /> Upload Only
          </span>
        )}
      </div>

      {/* Context menu */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-1 rounded-lg hover:bg-gray-100"
            >
              <MoreVertical className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {perms.canDownload && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDownload(); }}>
                <Download className="w-4 h-4 mr-2 text-green-500" /> Download
              </DropdownMenuItem>
            )}
            {perms.canPrint && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onPrint(); }}>
                <Printer className="w-4 h-4 mr-2 text-green-500" /> Print
              </DropdownMenuItem>
            )}
            {perms.canEdit && (
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                <Edit3 className="w-4 h-4 mr-2 text-green-500" /> Rename
              </DropdownMenuItem>
            )}
            {(perms.canDownload || perms.canPrint || perms.canEdit) && perms.canDelete && (
              <DropdownMenuSeparator />
            )}
            {perms.canDelete && (
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Thumbnail */}
      <div className="flex justify-center pt-4">
        <FileThumbnail doc={doc} size="lg" />
      </div>

      {/* Info */}
      <div className="space-y-0.5 min-w-0">
        <p className="text-xs font-medium text-gray-800 truncate leading-tight">{doc.name}</p>
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-semibold ${cfg.iconClass}`}>{cfg.label}</span>
          <span className="text-[10px] text-gray-400">{doc.size}</span>
        </div>
      </div>

      {/* Favorite */}
      <button
        onClick={(e) => { e.stopPropagation(); onFavorite(); }}
        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Star className={`w-3.5 h-3.5 ${doc.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
      </button>
    </div>
  );
}
