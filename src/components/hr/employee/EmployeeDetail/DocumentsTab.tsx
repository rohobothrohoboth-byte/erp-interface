import { memo, useState, lazy, Suspense } from 'react';
import { FileText, FileBadge, FileImage, Eye, Loader2, FolderOpen } from 'lucide-react';
import { useEmpCertAll } from '../../../../services/hr/employee/empDetail/empDetail.queries';
import { DetailSkeleton } from './LoadState';
import type { EmpFileList, EmpDetailDocument } from '../../../../types/hr/employee/empDetail';

const DocViewerModal = lazy(() =>
  import('./DocViewerModal').then(m => ({ default: m.DocViewerModal }))
);

function DocIcon({ contentType }: { contentType: string }) {
  if (contentType === 'application/pdf') return <FileText className="w-5 h-5 text-red-400" />;
  if (contentType.startsWith('image/'))  return <FileImage className="w-5 h-5 text-blue-400" />;
  return <FileBadge className="w-5 h-5 text-gray-400" />;
}

function certTypeColor(certType: string) {
  const t = certType.toLowerCase();
  if (t.includes('birth'))    return 'bg-blue-50 text-blue-700 border-blue-200';
  if (t.includes('marriage')) return 'bg-pink-50 text-pink-700 border-pink-200';
  if (t.includes('contract')) return 'bg-green-50 text-green-700 border-green-200';
  return 'bg-gray-50 text-gray-600 border-gray-200';
}

export const DocumentsTab = memo(function DocumentsTab({ employeeId }: { employeeId: string }) {
  const { data: certs, isLoading } = useEmpCertAll(employeeId);
  const [viewing, setViewing] = useState<EmpDetailDocument | null>(null);

  if (isLoading) return <DetailSkeleton rows={3} />;

  const list: EmpFileList[] = certs ?? [];

  return (
    <>
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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
              <FolderOpen className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-gray-700">Documents</span>
          </div>
          <span className="text-xs text-gray-400">{list.length} file{list.length !== 1 ? 's' : ''}</span>
        </div>

        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="w-10 h-10 text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">No documents uploaded</p>
          </div>
        ) : (
          <div className="p-4 flex flex-wrap gap-3">
            {list.map((cert) => (
              <div
                key={cert.id}
                className="inline-flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <DocIcon contentType={cert.contentType} />

                <div className="min-w-0">
                  {/* cert type badge */}
                  <span className={`inline-block text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border mb-1 ${certTypeColor(cert.certType)}`}>
                    {cert.certType}
                  </span>
                  <p className="text-xs text-gray-400 whitespace-nowrap">
                    {cert.contentType} · {cert.size}
                  </p>
                </div>

                <button
                  onClick={() => setViewing({ id: cert.id, fileName: cert.fileName, contentType: cert.contentType, fileSizeStr: cert.size, documentType: cert.certType, uploadedAt: '' })}
                  className="flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-700 shrink-0 ml-2"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
});
