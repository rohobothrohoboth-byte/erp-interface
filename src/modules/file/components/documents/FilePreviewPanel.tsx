import { X, Download, Printer, Star, Calendar, User, HardDrive } from 'lucide-react';
import { FileThumbnail } from '@/modules/file/components/FileThumbnail';
import { getFileTypeConfig } from '@/modules/file/components/fileTypeConfig';
import type { DocumentItem, FolderPermissions } from '@/modules/file/types/folder.types';

interface FilePreviewPanelProps {
  doc: DocumentItem | null;
  perms: FolderPermissions;
  onClose: () => void;
  onFavorite: (id: string) => void;
  onDownload: (doc: DocumentItem) => void;
  onPrint: () => void;
}

export function FilePreviewPanel({
  doc, perms, onClose, onFavorite, onDownload, onPrint,
}: FilePreviewPanelProps) {
  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
          <HardDrive className="w-8 h-8 text-gray-300" />
        </div>
        <p className="text-sm text-gray-400">Select a file to preview</p>
      </div>
    );
  }

  const cfg = getFileTypeConfig(doc.contentType, doc.name);
  const isImage = doc.contentType.startsWith('image/');

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-700">Preview</span>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Thumbnail / preview */}
        <div className={`w-full aspect-square rounded-xl flex items-center justify-center ${cfg.bgClass}`}>
          {isImage && doc.thumbnailUrl ? (
            <img src={doc.thumbnailUrl} alt={doc.name} className="w-full h-full object-contain rounded-xl" />
          ) : (
            <div className="w-20 h-20">
              <span className={cfg.iconClass}>{cfg.icon}</span>
            </div>
          )}
        </div>

        {/* File name */}
        <div>
          <p className="text-sm font-semibold text-gray-900 break-all leading-snug">{doc.name}</p>
          <span className={`text-xs font-medium ${cfg.iconClass}`}>{cfg.label}</span>
        </div>

        {/* Meta */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <User className="w-3.5 h-3.5 shrink-0" />
            <span className="text-gray-700 font-medium">Owner</span>
            <span className="ml-auto">{doc.owner}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <HardDrive className="w-3.5 h-3.5 shrink-0" />
            <span className="text-gray-700 font-medium">Size</span>
            <span className="ml-auto">{doc.size}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="text-gray-700 font-medium">Modified</span>
            <span className="ml-auto">{doc.updatedAt}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={() => onFavorite(doc.id)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            <Star className={`w-4 h-4 ${doc.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} />
            {doc.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          </button>
          {perms.canDownload && (
            <button
              onClick={() => onDownload(doc)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-green-700 hover:bg-green-50 transition-colors"
            >
              <Download className="w-4 h-4" /> Download
            </button>
          )}
          {perms.canPrint && (
            <button
              onClick={onPrint}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-green-700 hover:bg-green-50 transition-colors"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
