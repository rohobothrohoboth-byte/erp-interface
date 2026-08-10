import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, FolderOpen } from 'lucide-react';
import { ModulePageShell, StatusBadge } from '@/shared/components/ModulePageShell';
import { Button } from '@/shared/components/ui/button';
import { showToast } from '@/shared/layout/layout';

type FolderDocument = {
  id: string;
  name: string;
  type: string;
  size: string;
  updatedAt: string;
  status: 'Active' | 'Archived' | 'Draft';
};

const MOCK_DOCUMENTS: FolderDocument[] = [
  { id: 'd1', name: 'Q2 Board Pack.pdf', type: 'PDF', size: '2.4 MB', updatedAt: '2026-08-01', status: 'Active' },
  { id: 'd2', name: 'Lease Agreement.docx', type: 'DOCX', size: '480 KB', updatedAt: '2026-07-28', status: 'Active' },
  { id: 'd3', name: 'Site Photos.zip', type: 'ZIP', size: '18.1 MB', updatedAt: '2026-07-20', status: 'Draft' },
  { id: 'd4', name: 'Archived Invoice.xlsx', type: 'XLSX', size: '120 KB', updatedAt: '2026-06-12', status: 'Archived' },
];

export default function FolderDocumentsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [docs] = useState(MOCK_DOCUMENTS);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return docs;
    return docs.filter((d) =>
      [d.name, d.type, d.status].some((v) => v.toLowerCase().includes(q))
    );
  }, [docs, search]);

  return (
    <ModulePageShell
      title="Folder documents"
      subtitle={`Documents in folder ${id ? `#${id}` : ''}`}
      stats={[
        { label: 'Documents', value: docs.length },
        { label: 'Active', value: docs.filter((d) => d.status === 'Active').length },
      ]}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search documents..."
      onRefresh={() => showToast.success('Documents refreshed')}
      primaryActionLabel="Upload"
      onPrimaryAction={() => showToast.success('Upload dialog would open here')}
      filters={
        <Button variant="outline" onClick={() => navigate(-1)}>
          <FolderOpen className="mr-2 h-4 w-4" />
          Back to folders
        </Button>
      }
    >
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Size</th>
              <th className="px-4 py-3 font-medium">Updated</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((doc) => (
              <tr
                key={doc.id}
                className="cursor-pointer border-t border-slate-100 hover:bg-slate-50/80"
                onClick={() => navigate(`/document/${doc.id}`)}
              >
                <td className="px-4 py-3 font-medium text-slate-900">
                  <span className="inline-flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    {doc.name}
                  </span>
                </td>
                <td className="px-4 py-3">{doc.type}</td>
                <td className="px-4 py-3">{doc.size}</td>
                <td className="px-4 py-3">{doc.updatedAt}</td>
                <td className="px-4 py-3">
                  <StatusBadge
                    status={doc.status}
                    tone={
                      doc.status === 'Active'
                        ? 'success'
                        : doc.status === 'Archived'
                          ? 'neutral'
                          : 'warning'
                    }
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No documents in this folder.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ModulePageShell>
  );
}
