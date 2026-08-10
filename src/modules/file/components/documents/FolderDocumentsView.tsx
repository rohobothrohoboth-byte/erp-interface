import { useState, useRef, useMemo, lazy, Suspense } from 'react';
import { ArrowLeft, Upload, Plus, FolderOpen, Lock, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { FileToolbar } from '@/modules/file/components/documents/FileToolbar';
import { FileGridItem } from '@/modules/file/components/documents/FileGridItem';
import { FileListItem } from '@/modules/file/components/documents/FileListItem';
import { FilePreviewPanel } from '@/modules/file/components/documents/FilePreviewPanel';
import type { FolderItem, DocumentItem, SortField, SortDir, ViewMode } from '@/modules/file/types/folder.types';
import { CATEGORY_PERMISSIONS, effectivePerms } from '@/modules/file/types/folder.types';
import { MOCK_DOCUMENTS } from '@/modules/file/data/fileMockData';
import type { EmpDetailDocument } from '@/modules/hr/types/employee/empDetail';

const DocViewerModal = lazy(() =>
  import('@/modules/hr/components/employee/EmployeeDetail/DocViewerModal').then(m => ({ default: m.DocViewerModal }))
);

const CATEGORY_LABELS: Record<string, string> = {
  company:  'Company',
  personal: 'Personal',
};

function sortDocs(docs: DocumentItem[], field: SortField, dir: SortDir): DocumentItem[] {
  return [...docs].sort((a, b) => {
    let cmp = 0;
    if (field === 'name')      cmp = a.name.localeCompare(b.name);
    else if (field === 'updatedAt') cmp = a.updatedAt.localeCompare(b.updatedAt);
    else if (field === 'type') cmp = a.contentType.localeCompare(b.contentType);
    else if (field === 'size') {
      const parse = (s: string) => parseFloat(s.replace(/[^0-9.]/g, '')) * (s.includes('MB') ? 1024 : 1);
      cmp = parse(a.size) - parse(b.size);
    }
    return dir === 'asc' ? cmp : -cmp;
  });
}

interface FolderDocumentsViewProps {
  folder: FolderItem;
}

export function FolderDocumentsView({ folder }: FolderDocumentsViewProps) {
  const navigate = useNavigate();
  const perms = CATEGORY_PERMISSIONS[folder.category];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery]           = useState('');
  const [viewMode, setViewMode]     = useState<ViewMode>('grid');
  const [sortField, setSortField]   = useState<SortField>('name');
  const [sortDir, setSortDir]       = useState<SortDir>('asc');
  const [previewOn, setPreviewOn]   = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const [viewingDoc, setViewingDoc] = useState<EmpDetailDocument | null>(null);

  const handleOpenDoc = (doc: DocumentItem) => {
    // Map DocumentItem → EmpDetailDocument shape the modal expects
    setViewingDoc({
      id:           doc.id,
      fileName:     doc.name,
      contentType:  doc.contentType,
      fileSizeStr:  doc.size,
      documentType: doc.folderCategory,
      uploadedAt:   doc.updatedAt,
      // For mock data we use a placeholder PDF/image URL so the modal renders
      url: doc.contentType === 'application/pdf'
        ? 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/sample.pdf'
        : doc.contentType.startsWith('image/')
          ? doc.thumbnailUrl ?? 'https://placehold.co/800x600/e8f5e9/16a34a?text=' + encodeURIComponent(doc.name)
          : undefined,
    });
  };

  const [docs, setDocs] = useState<DocumentItem[]>(
    MOCK_DOCUMENTS.filter((d) => d.folderId === folder.id)
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    const matched = docs.filter((d) => d.name.toLowerCase().includes(q));
    return sortDocs(matched, sortField, sortDir);
  }, [docs, query, sortField, sortDir]);

  const selectedDoc = docs.find((d) => d.id === selectedId) ?? null;

  const handleSort = (field: SortField, dir: SortDir) => { setSortField(field); setSortDir(dir); };

  const handleSelect = (id: string) => setSelectedId((prev) => (prev === id ? null : id));

  const handleFavorite = (id: string) =>
    setDocs((prev) => prev.map((d) => d.id === id ? { ...d, isFavorite: !d.isFavorite } : d));

  const handleDelete = (id: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleDownload = (doc: DocumentItem) => alert(`Downloading: ${doc.name}`);
  const handlePrint    = () => window.print();

  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFileChange  = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadingFiles(files.map((f) => f.name));
    setTimeout(() => {
      setDocs((prev) => [
        ...prev,
        ...files.map((f, i) => ({
          id: `upload-${Date.now()}-${i}`,
          name: f.name,
          contentType: f.type || 'application/octet-stream',
          size: `${(f.size / 1024).toFixed(0)} KB`,
          updatedAt: new Date().toISOString().split('T')[0],
          owner: 'Me',
          folderId: folder.id,
          folderCategory: folder.category,
        })),
      ]);
      setUploadingFiles([]);
    }, 1200);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* ── Doc viewer modal ── */}
      {viewingDoc && (
        <Suspense fallback={
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        }>
          <DocViewerModal doc={viewingDoc} onClose={() => setViewingDoc(null)} />
        </Suspense>
      )}
      {/* ── Header ── */}
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
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Lock className="w-3 h-3" /> Read Only
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
            <Button size="sm" className="gap-1.5 text-sm bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
              <Plus className="w-4 h-4" /> New File
            </Button>
          )}
        </div>
      </div>

      {/* ── Toolbar ── */}
      <FileToolbar
        query={query}
        onQuery={setQuery}
        viewMode={viewMode}
        onViewMode={setViewMode}
        sortField={sortField}
        sortDir={sortDir}
        onSort={handleSort}
        previewEnabled={previewOn}
        onTogglePreview={() => setPreviewOn((p) => !p)}
      />

      {/* ── Upload progress ── */}
      {uploadingFiles.length > 0 && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-xs text-green-700">
          Uploading {uploadingFiles.length} file(s): {uploadingFiles.join(', ')}
        </div>
      )}

      {/* ── Main area ── */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* File area */}
        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-gray-200 rounded-2xl">
              <FolderOpen className="w-12 h-12 text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">No files found</p>
              {perms.canAddFile && (
                <button
                  onClick={handleUploadClick}
                  className="mt-3 flex items-center gap-1.5 px-3 py-2 text-sm border border-green-300 text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <Upload className="w-4 h-4" /> Upload a file
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filtered.map((doc) => (
                <FileGridItem
                  key={doc.id}
                  doc={doc}
                  perms={effectivePerms(perms, doc.docPermission)}
                  selected={selectedId === doc.id}
                  onSelect={() => handleSelect(doc.id)}
                  onDoubleClick={() => handleOpenDoc(doc)}
                  onFavorite={() => handleFavorite(doc.id)}
                  onDelete={() => handleDelete(doc.id)}
                  onDownload={() => handleDownload(doc)}
                  onPrint={handlePrint}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-green-50/40">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-green-700 uppercase tracking-wide">Name</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-green-700 uppercase tracking-wide">Owner</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-green-700 uppercase tracking-wide">Size</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-green-700 uppercase tracking-wide">Modified</th>
                    <th className="py-3 px-4 w-32" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((doc) => (
                    <FileListItem
                      key={doc.id}
                      doc={doc}
                      perms={effectivePerms(perms, doc.docPermission)}
                      selected={selectedId === doc.id}
                      onSelect={() => handleSelect(doc.id)}
                      onDoubleClick={() => handleOpenDoc(doc)}
                      onFavorite={() => handleFavorite(doc.id)}
                      onDelete={() => handleDelete(doc.id)}
                      onDownload={() => handleDownload(doc)}
                      onPrint={handlePrint}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Preview panel */}
        {previewOn && (
          <div className="w-64 shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <FilePreviewPanel
              doc={selectedDoc}
              perms={selectedDoc ? effectivePerms(perms, selectedDoc.docPermission) : perms}
              onClose={() => setPreviewOn(false)}
              onFavorite={handleFavorite}
              onDownload={handleDownload}
              onPrint={handlePrint}
            />
          </div>
        )}
      </div>
    </div>
  );
}
