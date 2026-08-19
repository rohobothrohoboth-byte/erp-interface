import { useMemo, useState } from 'react';
import { Loader2, Eye, Download, FileText, FolderOpen } from 'lucide-react';
import { ModulePageShell, StatusBadge } from '@/shared/components/ModulePageShell';
import { Button } from '@/shared/components/ui/button';
import { Field, inputCls } from '@/modules/inventory/components/FormModal';
import { showToast } from '@/shared/layout/layout';
import { useEmployeeList } from '@/modules/hr/services/employee/emp.queries';
import { useEmpCertAll } from '@/modules/hr/services/employee/empDetail/empDetail.queries';
import { fetchCertBlobUrl } from '@/modules/hr/services/employee/empDetail/empDetail.api';
import type { EmpFileList } from '@/modules/hr/types/employee/empDetail';

export default function EmployeeDocumentsPage() {
  const [search, setSearch] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data: employees = [], isLoading: employeesLoading } = useEmployeeList();

  const {
    data: certs = [],
    isLoading: certsLoading,
    isError,
    error,
    refetch,
  } = useEmpCertAll(employeeId);

  const selectedEmployee = employees.find((e) => String(e.id) === employeeId);

  const filtered = useMemo(() => {
    const list: EmpFileList[] = certs ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((c) =>
      [c.fileName, c.certType, c.contentType]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [certs, search]);

  const openFile = async (cert: EmpFileList, download: boolean) => {
    setBusyId(cert.id as string);
    try {
      const url = await fetchCertBlobUrl(cert.id as string);
      if (!url) {
        showToast.error('Unable to load this document');
        return;
      }
      if (download) {
        const a = document.createElement('a');
        a.href = url;
        a.download = cert.fileName || 'document';
        document.body.appendChild(a);
        a.click();
        a.remove();
        showToast.success('Download started');
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      showToast.error(err);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <ModulePageShell
      title="Employee documents"
      subtitle="View and download employee certificates and files."
      stats={[
        { label: 'Selected employee', value: selectedEmployee ? selectedEmployee.empFullName : '—' },
        { label: 'Documents', value: employeeId ? filtered.length : 0 },
      ]}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search documents..."
      onRefresh={() => employeeId && refetch()}
      filters={
        <div className="w-full md:w-72">
          <Field label="Employee">
            <select
              className={inputCls}
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              disabled={employeesLoading}
            >
              <option value="">
                {employeesLoading ? 'Loading employees…' : 'Select an employee…'}
              </option>
              {employees.map((emp) => (
                <option key={String(emp.id)} value={String(emp.id)}>
                  {emp.empFullName} {emp.code ? `(${emp.code})` : ''}
                </option>
              ))}
            </select>
          </Field>
        </div>
      }
    >
      {!employeeId ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-slate-400">
          <FolderOpen className="h-10 w-10" />
          <p className="text-sm">Select an employee to view their documents.</p>
        </div>
      ) : certsLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading documents...
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 py-12 text-center">
          <p className="text-sm text-rose-700">{error?.message || 'Failed to load documents.'}</p>
          <Button variant="outline" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">File</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Format</th>
                <th className="px-4 py-3 font-medium">Size</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cert) => (
                <tr key={cert.id as string} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 font-medium text-slate-900">
                      <FileText className="h-4 w-4 text-slate-400" />
                      {cert.fileName}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={cert.certType || 'Document'} tone="info" />
                  </td>
                  <td className="px-4 py-3 uppercase text-xs text-slate-500">
                    {cert.contentType?.split('/').pop() || '—'}
                  </td>
                  <td className="px-4 py-3">{cert.size || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === (cert.id as string)}
                        onClick={() => openFile(cert, false)}
                      >
                        {busyId === (cert.id as string) ? (
                          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Eye className="mr-1 h-3.5 w-3.5" />
                        )}
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === (cert.id as string)}
                        onClick={() => openFile(cert, true)}
                      >
                        <Download className="mr-1 h-3.5 w-3.5" />
                        Download
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                    {search
                      ? 'No documents match your search.'
                      : 'No documents found for this employee.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </ModulePageShell>
  );
}
