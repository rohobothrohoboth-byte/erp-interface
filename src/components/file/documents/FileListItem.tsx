import { Star, Download, Printer, Trash2, Edit3, MoreVertical, Lock } from 'lucide-react';
import { FileThumbnail } from '../FileThumbnail';
import { getFileTypeConfig } from '../fileTypeConfig';
import type { DocumentItem, FolderPermissions } from '../../../types/file/folder.types';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '../../ui/dropdown-menu';

interface FileListItemProps {
  doc: DocumentItem;
  perms: FolderPermissions;
  selected: boolean;
  onSelect: () => void;
  onDoubleClick: () => void;
  onFavorite: () => void;
  onDelete: () => void;
  onDownload: () => void;
  onPrint: () => void;
}

export function FileListItem({
  doc, perms, selected,
  onSelect, onDoubleClick, onFavorite, onDelete, onDownload, onPrint,
}: FileListItemProps) {
  const cfg = getFileTypeConfig(doc.contentType, doc.name);

  return (
    <tr
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
      className={`group cursor-pointer transition-colors ${
        selected ? 'bg-green-50' : 'hover:bg-gray-50/60'
      }`}
    >
      {/* Name + thumbnail */}
      <td className="py-2.5 px-4">
        <div className="flex items-center gap-3">
          <FileThumbnail doc={doc} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate max-w-xs">{doc.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] font-semibold ${cfg.iconClass}`}>{cfg.label}</span>
              {/* Privilege badge */}
              {!perms.canEdit && !perms.canDownload && !perms.canPrint && (
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-medium">
                  <Lock className="w-2.5 h-2.5" /> View Only
                </span>
              )}
              {!perms.canEdit && (perms.canDownload || perms.canPrint) && (
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-medium">
                  <Download className="w-2.5 h-2.5" /> Print/DL
                </span>
              )}
              {doc.isFavorite && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
            </div>
          </div>
        </div>
      </td>
      <td className="py-2.5 px-4 text-sm text-gray-500 whitespace-nowrap">{doc.owner}</td>
      <td className="py-2.5 px-4 text-sm text-gray-500 whitespace-nowrap">{doc.size}</td>
      <td className="py-2.5 px-4 text-sm text-gray-500 whitespace-nowrap">{doc.updatedAt}</td>
      <td className="py-2.5 px-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
          <button
            onClick={(e) => { e.stopPropagation(); onFavorite(); }}
            className="p-1.5 rounded-lg hover:bg-green-100"
          >
            <Star className={`w-4 h-4 ${doc.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
          </button>
          {perms.canDownload && (
            <button onClick={(e) => { e.stopPropagation(); onDownload(); }} className="p-1.5 rounded-lg hover:bg-green-100">
              <Download className="w-4 h-4 text-green-600" />
            </button>
          )}
          {perms.canPrint && (
            <button onClick={(e) => { e.stopPropagation(); onPrint(); }} className="p-1.5 rounded-lg hover:bg-green-100">
              <Printer className="w-4 h-4 text-green-600" />
            </button>
          )}
          {(perms.canEdit || perms.canDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button onClick={(e) => e.stopPropagation()} className="p-1.5 rounded-lg hover:bg-green-100">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {perms.canEdit && (
                  <DropdownMenuItem>
                    <Edit3 className="w-4 h-4 mr-2 text-green-500" /> Rename
                  </DropdownMenuItem>
                )}
                {perms.canEdit && perms.canDelete && <DropdownMenuSeparator />}
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
          )}
        </div>
      </td>
    </tr>
  );
}
