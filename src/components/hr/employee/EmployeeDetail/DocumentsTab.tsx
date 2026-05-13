import { memo, useState, lazy, Suspense } from 'react';
import { FileText, FileBadge, FileImage, Eye, Loader2 } from 'lucide-react';
import { useEmpDetailDocuments } from './empDetail.queries';
import { DetailSkeleton } from './LoadState';
import type { EmpDetailDocument } from './types';

// Lazy-load the heavy PDF viewer — only pulled in when user clicks View
const DocViewerModal = lazy(() =>
  import('./DocViewerModal').then(m => ({ default: m.DocViewerModal }))
);

function DocIcon({ contentType }: { contentType: string }) {
  if (contentType === 'application/pdf')
    return <FileText className="w-5 h-5 text-red-400" />;
  if (contentType.startsWith('image/'))
    return <FileImage className="w-5 h-5 text-blue-400" />;
  return <FileBadge className="w-5 h-5 text-gray-400" />;
}

const SAMPLE_DOC: EmpDetailDocument = {
  id: 'sample-1',
  fileName: 'Employment_Contract.pdf',
  documentType: 'Contract',
  contentType: 'application/pdf',
  fileSizeStr: '245 KB',
  uploadedAt: '2024-01-15',
  url: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
};

export const DocumentsTab = memo(function DocumentsTab({ employeeId }: { employeeId: string }) {
  const { data: docs, isLoading } = useEmpDetailDocuments(employeeId);
  const [viewing, setViewing] = useState<EmpDetailDocument | null>(null);

  if (isLoading) return <DetailSkeleton rows={3} />;

  const list: EmpDetailDocument[] = [SAMPLE_DOC, ...(docs ?? [])];

  return (
    <>
      {/* Modal — only mounted when a doc is selected, lazy chunk loaded on demand */}
      {viewing && (
        <Suspense fallback={
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        }>
          <DocViewerModal doc={viewing} onClose={() => setViewing(null)} />
        </Suspense>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">Documents</span>
          <span className="text-xs text-gray-400">{list.length} file{list.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="p-4 flex flex-wrap gap-3">
          {list.map((doc) => (
            <div
              key={doc.id}
              className="inline-flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <DocIcon contentType={doc.contentType} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 whitespace-nowrap">{doc.fileName}</p>
                <p className="text-xs text-gray-400 mt-0.5 whitespace-nowrap">
                  {doc.documentType} · {doc.fileSizeStr} · {doc.uploadedAt}
                </p>
              </div>
              {doc.url ? (
                <button
                  onClick={() => setViewing(doc)}
                  className="flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-700 shrink-0 ml-2"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View
                </button>
              ) : (
                <span className="text-xs text-gray-300 shrink-0 ml-2">Unavailable</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
});
