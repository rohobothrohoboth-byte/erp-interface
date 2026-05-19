import { useState, useRef } from 'react';
import {
  ArrowLeft, Search, Upload, Plus, Download, Printer,
  FileText, FileImage, File, Star, MoreVertical, Trash2, Edit3,
  Lock, FolderOpen,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import type { FolderItem, DocumentItem, FolderCategory } from '../../../types/file/folder.types';
import { CATEGORY_PERMISSIONS } from '../../../types/file/folder.types';
import { MOCK_DOCUMENTS } from '../../../data/file/fileMockData';

const CATEGORY_LABELS: Record<FolderCategory, string> = {
  company:    'Company',
  department: 'Department',
  shared:     'Shared',
  my:         'My Folder',
  personal:   'Personal',
};

function DocTypeIcon({ contentType }: { contentType: string }) {
  if (contentType.startsWith('image/')) return <FileImage className="w-5 h-5 text-green-400" />;
  if (contentType === 'application/pdf') return <FileText className="w-5 h-5 text-emerald-500" />;
  return <File className="w-5 h-5 text-green-300" />;
}

interface FolderDocumentsViewProps {
  folder: FolderItem;
}

export function FolderDocumentsView({ folder }: FolderDocumentsViewProps) {
  const navigate = useNavigate();
  const perms = CATEGORY_PERMISSIONS[folder.category];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [docs, setDocs] = useState<DocumentItem[]>(
    MOCK_DOCUMENTS.filter((d) => d.folderId === folder.id)
  );
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);

  const filtered = docs.filter((d) =>
    d.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadingFiles(files.map((f) => f.name));
    setTimeout(() => {
      const newDocs: DocumentItem[] = files.map((f, i) => ({
        id: `upload-${Date.now()}-${i}`,
        name: f.name,
        contentType: f.type || 'application/octet-stream',
        size: `${(f.size / 1024).toFixed(0)} KB`,
        updatedAt: new Date().toISOString().split('T')[0],
        owner: 'Me',
        folderId: folder.id,
        folderCategory: folder.category,
      }));
      setDocs((prev) => [...prev, ...newDocs]);
      setUploadingFiles([]);
    }, 1200);
    e.target.value = '';
  };

  const handleDelete = (docId: string) => setDocs((prev) => prev.filter((d) => d.id !== docId));

  const handleFavorite = (docId: string) =>
    setDocs((prev) => prev.map((d) => d.id === docId ? { ...d, isFavorite: !d.isFavorite } : d));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => navigate('/file')}
            className="flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-green-500" />
            <h1 className="text-lg font-bold text-gray-900">{folder.name}</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
              {CATEGORY_LABELS[folder.category]}
            </span>
            {!perms.canEdit && !perms.uploadOnly && (
              <span className="flex items-center gap-1 text-xs text-emerald-500">
                <Lock className="w-3 h-3" /> Read Only
              </span>
            )}
            {perms.uploadOnly && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <Upload className="w-3 h-3" /> Upload Only
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {perms.canAddFile && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-sm border-green-300 text-green-700 hover:bg-green-50"
                onClick={handleUploadClick}
              >
                <Upload className="w-4 h-4" /> Upload
              </Button>
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
            </>
          )}
          {perms.canAddFile && !perms.uploadOnly && (
            <Button
              size="sm"
              className="gap-1.5 text-sm bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
            >
              <Plus className="w-4 h-4" /> New File
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search files..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      {/* Upload progress */}
      {uploadingFiles.length > 0 && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-3 space-y-1">
          <p className="text-xs font-medium text-green-700">Uploading {uploadingFiles.length} file(s)...</p>
          {uploadingFiles.map((name) => (
            <p key={name} className="text-xs text-green-600 truncate">{name}</p>
          ))}
        </div>
      )}

      {/* Documents table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileText className="w-12 h-12 text-green-100 mb-3" />
            <p className="text-sm text-gray-400">No files in this folder</p>
            {perms.canAddFile && (
              <button
                onClick={handleUploadClick}
                className="mt-3 flex items-center gap-1.5 px-3 py-2 text-sm border border-green-300 text-green-700 hover:bg-green-50 rounded-md transition-colors"
              >
                <Upload className="w-4 h-4" /> Upload a file
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-green-50/40">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-green-700 uppercase tracking-wide">Name</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-green-700 uppercase tracking-wide">Owner</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-green-700 uppercase tracking-wide">Size</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-green-700 uppercase tracking-wide">Modified</th>
                  <th className="py-3 px-4 w-28" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((doc) => (
                  <tr key={doc.id} className="hover:bg-green-50/30 group transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <DocTypeIcon contentType={doc.contentType} />
                        <span className="font-medium text-gray-800 truncate max-w-xs">{doc.name}</span>
                        {doc.isFavorite && <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 shrink-0" />}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{doc.owner}</td>
                    <td className="py-3 px-4 text-gray-500">{doc.size}</td>
                    <td className="py-3 px-4 text-gray-500">{doc.updatedAt}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        {/* Favorite — always */}
                        <button
                          onClick={() => handleFavorite(doc.id)}
                          className="p-1.5 rounded-lg hover:bg-green-100"
                          title="Favorite"
                        >
                          <Star className={`w-4 h-4 ${doc.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} />
                        </button>

                        {/* Download — only if permitted */}
                        {perms.canDownload && (
                          <button
                            className="p-1.5 rounded-lg hover:bg-green-100"
                            title="Download"
                          >
                            <Download className="w-4 h-4 text-green-600" />
                          </button>
                        )}

                        {/* Print — only if permitted */}
                        {perms.canPrint && (
                          <button
                            onClick={() => window.print()}
                            className="p-1.5 rounded-lg hover:bg-green-100"
                            title="Print"
                          >
                            <Printer className="w-4 h-4 text-green-600" />
                          </button>
                        )}

                        {/* More — edit/delete only if permitted */}
                        {(perms.canEdit || perms.canDelete) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1.5 rounded-lg hover:bg-green-100">
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
                                  className="text-red-600 focus:text-red-600"
                                  onClick={() => handleDelete(doc.id)}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
