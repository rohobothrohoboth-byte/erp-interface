import { memo } from 'react';
import { FolderOpen, FileText, Download } from 'lucide-react';
import { useEmpDetailDocuments } from './empDetail.queries';
import { DetailSkeleton, DetailError } from './LoadState';
import type { EmpDetailDocument } from './types';

const DOC_ICON_COLOR: Record<string, string> = {
  'application/pdf':  'text-red-500 bg-red-50',
  'image/jpeg':       'text-blue-500 bg-blue-50',
  'image/png':        'text-blue-500 bg-blue-50',
  'default':          'text-gray-500 bg-gray-50',
};

function docColor(contentType: string) {
  return DOC_ICON_COLOR[contentType] ?? DOC_ICON_COLOR['default'];
}

export const DocumentsTab = memo(function DocumentsTab({ employeeId }: { employeeId: string }) {
  const { data: docs, isLoading, error } = useEmpDetailDocuments(employeeId);

  if (isLoading) return <DetailSkeleton rows={3} />;
  if (error) return <DetailError message={error.message} />;

  const list: EmpDetailDocument[] = docs ?? [];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
          <FolderOpen className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Documents</h3>
        <span className="ml-auto text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
          {list.length} file{list.length !== 1 ? 's' : ''}
        </span>
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
            <FileText className="w-7 h-7 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-500">No documents available</p>
          <p className="text-xs text-gray-400 mt-1">Documents will appear here once uploaded</p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((doc) => (
            <div key={doc.id} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-all group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${docColor(doc.contentType)}`}>
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{doc.fileName}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {doc.documentType} &middot; {doc.fileSizeStr} &middot; {doc.uploadedAt}
                </p>
              </div>
              <button
                className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 px-2.5 py-1.5 rounded-lg"
                title="Download"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
