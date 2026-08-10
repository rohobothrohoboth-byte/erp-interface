import { FileText, FileImage, File, Star, MoreVertical, Download } from 'lucide-react';

export interface DocumentItem {
  id: string;
  name: string;
  contentType: string;
  size: string;
  updatedAt: string;
  owner: string;
  isFavorite?: boolean;
  folder?: string;
}

interface DocumentTableProps {
  documents: DocumentItem[];
  onMenu?: (doc: DocumentItem) => void;
  onFavorite?: (doc: DocumentItem) => void;
  emptyMessage?: string;
}

function DocTypeIcon({ contentType }: { contentType: string }) {
  if (contentType.startsWith('image/')) return <FileImage className="w-5 h-5 text-blue-400" />;
  if (contentType === 'application/pdf') return <FileText className="w-5 h-5 text-red-400" />;
  return <File className="w-5 h-5 text-gray-400" />;
}

export function DocumentTable({ documents, onMenu, onFavorite, emptyMessage = 'No documents found' }: DocumentTableProps) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FileText className="w-12 h-12 text-gray-200 mb-3" />
        <p className="text-sm text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Folder</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Owner</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Size</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Modified</th>
            <th className="py-3 px-4" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {documents.map((doc) => (
            <tr key={doc.id} className="hover:bg-gray-50/50 group transition-colors">
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <DocTypeIcon contentType={doc.contentType} />
                  <span className="font-medium text-gray-800 truncate max-w-xs">{doc.name}</span>
                </div>
              </td>
              <td className="py-3 px-4 text-gray-500">{doc.folder || '—'}</td>
              <td className="py-3 px-4 text-gray-500">{doc.owner}</td>
              <td className="py-3 px-4 text-gray-500">{doc.size}</td>
              <td className="py-3 px-4 text-gray-500">{doc.updatedAt}</td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                  {onFavorite && (
                    <button onClick={() => onFavorite(doc)} className="p-1.5 rounded-lg hover:bg-gray-100">
                      <Star className={`w-4 h-4 ${doc.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} />
                    </button>
                  )}
                  <button className="p-1.5 rounded-lg hover:bg-gray-100">
                    <Download className="w-4 h-4 text-gray-400" />
                  </button>
                  {onMenu && (
                    <button onClick={() => onMenu(doc)} className="p-1.5 rounded-lg hover:bg-gray-100">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
