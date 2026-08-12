import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Play, CheckCircle2, FileText, Eye } from 'lucide-react';
import { ModulePageShell, StatusBadge } from '@/shared/components/ModulePageShell';
import { Button } from '@/shared/components/ui/button';
import { FormModal, Field, inputCls } from '@/modules/inventory/components/FormModal';
import { showToast } from '@/shared/layout/layout';
import { getAllPayrollRuns } from '@/modules/hr/services/payroll/payrollRun.api';
import { payrollRunApi, type PayrollRunCreateDto } from '@/modules/hr/services/payroll/payroll.api';
import { getAllEmployees } from '@/modules/hr/services/employee/emp.api';
import { useAuthStore } from '@/shared/stores/auth.store';
import type { EmployeeListDto } from '@/modules/hr/types/employee';
import { money, fmtDate, runStatusTone, RunDetailModal } from './payrollRunsShared';

const KEY = ['payroll', 'runs'];
const firstOfMonth = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10); };
const lastOfMonth = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10); };

export default function PayrollRunPage() {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.userId);
  const employeeIdFromAuth = useAuthStore((s) => s.employeeId);

  const [search, setSearch] = useState('');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', payPeriodStart: firstOfMonth(), payPeriodEnd: lastOfMonth(), paymentDate: lastOfMonth(), notes: '' });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [empSearch, setEmpSearch] = useState('');

  const { data: runs = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: KEY,
    queryFn: getAllPayrollRuns,
  });

  const { data: employees = [] } = useQuery<EmployeeListDto[]>({
    queryKey: ['employees', 'forPayroll'],
    queryFn: getAllEmployees,
    staleTime: 5 * 60 * 1000,
  });

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return runs;
    return runs.filter((r) => [r.name, r.payrollStatus].filter(Boolean).some((v) => String(v).toLowerCase().includes(q)));
  }, [runs, search]);

  const filteredEmps = useMemo(() => {
    const q = empSearch.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) => [e.empFullName, e.code, e.department].filter(Boolean).some((v) => String(v).toLowerCase().includes(q)));
  }, [employees, empSearch]);

  const invalidate = () => qc.invalidateQueries({ queryKey: KEY });

  const openCreate = () => {
    setForm({ name: `Payroll ${new Date().toLocaleString(undefined, { month: 'long', year: 'numeric' })}`, payPeriodStart: firstOfMonth(), payPeriodEnd: lastOfMonth(), paymentDate: lastOfMonth(), notes: '' });
    setSelected(new Set(employees.map((e) => String(e.id))));
    setEmpSearch('');
    setModalOpen(true);
  };

  const toggle = (id: string) => setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selectAllFiltered = () => setSelected((prev) => { const n = new Set(prev); filteredEmps.forEach((e) => n.add(String(e.id))); return n; });
  const clearAll = () => setSelected(new Set());

  const createMut = useMutation({ mutationFn: (d: PayrollRunCreateDto) => payrollRunApi.create(d) });

  const submit = async () => {
    if (!form.name.trim()) { showToast.error('Run name is required'); return; }
    if (selected.size === 0) { showToast.error('Select at least one employee'); return; }
    const dto: PayrollRunCreateDto = {
      name: form.name.trim(),
      payPeriodStart: new Date(form.payPeriodStart).toISOString(),
      payPeriodEnd: new Date(form.payPeriodEnd).toISOString(),
      paymentDate: new Date(form.paymentDate).toISOString(),
      employeeIds: Array.from(selected),
      notes: form.notes.trim() || null,
    };
    setSubmitting(true);
    try {
      await createMut.mutateAsync(dto);
      showToast.success('Payroll run created (Draft)');
      setModalOpen(false);
      invalidate();
    } catch (e) {
      showToast.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const act = async (id: string, fn: () => Promise<void>, ok: string) => {
    setBusyId(id);
    try {
      await fn();
      showToast.success(ok);
      invalidate();
    } catch (e) {
      showToast.error(e);
    } finally {
      setBusyId(null);
    }
  };

  const isDraft = (s: string) => (s || '').toLowerCase().includes('draft');
  const isProcessed = (s: string) => { const v = (s || '').toLowerCase(); return v.includes('process') || v.includes('complet'); };
  const isApproved = (s: string) => (s || '').toLowerCase().includes('approv');

  return (
    <ModulePageShell
      title="Run Payroll"
      subtitle="Create a payroll run, process calculations, approve, and generate payslips."
      stats={[
        { label: 'Runs', value: runs.length },
        { label: 'Draft', value: runs.filter((r) => isDraft(r.payrollStatus)).length },
        { label: 'Approved', value: runs.filter((r) => isApproved(r.payrollStatus)).length },
      ]}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search runs..."
      onRefresh={() => refetch()}
      primaryActionLabel="New payroll run"
      onPrimaryAction={openCreate}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading payroll runs...
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 py-12 text-center">
          <p className="text-sm text-rose-700">{(error as Error)?.message || 'Failed to load payroll runs.'}</p>
          <Button variant="outline" onClick={() => refetch()}>Try again</Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Run</th>
                <th className="px-4 py-3 font-medium">Period</th>
                <th className="px-4 py-3 text-right font-medium">Employees</th>
                <th className="px-4 py-3 text-right font-medium">Net</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium text-slate-900">{r.name}</td>
                  <td className="px-4 py-3">{fmtDate(r.payPeriodStart)} – {fmtDate(r.payPeriodEnd)}</td>
                  <td className="px-4 py-3 text-right">{r.totalEmployees}</td>
                  <td className="px-4 py-3 text-right font-semibold">{money(r.totalNetPay)}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.payrollStatus} tone={runStatusTone(r.payrollStatus)} /></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => setDetailId(r.id)}>
                        <Eye className="mr-1 h-3.5 w-3.5" /> View
                      </Button>
                      {isDraft(r.payrollStatus) && (
                        <Button size="sm" variant="outline" className="border-sky-200 text-sky-700 hover:bg-sky-50" disabled={busyId === r.id} onClick={() => act(r.id, () => payrollRunApi.process(r.id), 'Payroll processed')}>
                          {busyId === r.id ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Play className="mr-1 h-3.5 w-3.5" />} Process
                        </Button>
                      )}
                      {isProcessed(r.payrollStatus) && !isApproved(r.payrollStatus) && (
                        <Button size="sm" variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50" disabled={busyId === r.id} onClick={() => act(r.id, () => payrollRunApi.approve(r.id, employeeIdFromAuth || userId || 'system'), 'Payroll approved')}>
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approve
                        </Button>
                      )}
                      {(isProcessed(r.payrollStatus) || isApproved(r.payrollStatus)) && (
                        <Button size="sm" variant="outline" disabled={busyId === r.id} onClick={() => act(r.id, () => payrollRunApi.generatePayslips(r.id), 'Payslips generated')}>
                          <FileText className="mr-1 h-3.5 w-3.5" /> Payslips
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    {search ? 'No runs match your search.' : 'No payroll runs yet. Create one to get started.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <FormModal
        open={modalOpen}
        title="New payroll run"
        onClose={() => setModalOpen(false)}
        onSubmit={submit}
        submitting={submitting}
        submitLabel="Create run"
      >
        <Field label="Run name *">
          <input className={inputCls} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Period start">
            <input type="date" className={inputCls} value={form.payPeriodStart} onChange={(e) => setForm((f) => ({ ...f, payPeriodStart: e.target.value }))} />
          </Field>
          <Field label="Period end">
            <input type="date" className={inputCls} value={form.payPeriodEnd} onChange={(e) => setForm((f) => ({ ...f, payPeriodEnd: e.target.value }))} />
          </Field>
          <Field label="Payment date">
            <input type="date" className={inputCls} value={form.paymentDate} onChange={(e) => setForm((f) => ({ ...f, paymentDate: e.target.value }))} />
          </Field>
        </div>
        <Field label={`Employees (${selected.size} selected)`}>
          <div className="mb-2 flex items-center gap-2">
            <input className={`${inputCls} flex-1`} placeholder="Search employees..." value={empSearch} onChange={(e) => setEmpSearch(e.target.value)} />
            <Button type="button" size="sm" variant="outline" onClick={selectAllFiltered}>Select all</Button>
            <Button type="button" size="sm" variant="outline" onClick={clearAll}>Clear</Button>
          </div>
          <div className="max-h-52 overflow-y-auto rounded-lg border border-slate-200">
            {filteredEmps.map((e) => (
              <label key={String(e.id)} className="flex cursor-pointer items-center gap-2 border-b border-slate-100 px-3 py-1.5 text-sm last:border-0 hover:bg-slate-50">
                <input type="checkbox" checked={selected.has(String(e.id))} onChange={() => toggle(String(e.id))} />
                <span className="font-medium text-slate-800">{e.empFullName}</span>
                {e.code && <span className="text-xs text-slate-400">({e.code})</span>}
                <span className="ml-auto text-xs text-slate-400">{e.department}</span>
              </label>
            ))}
            {filteredEmps.length === 0 && <div className="px-3 py-4 text-center text-xs text-slate-400">No employees</div>}
          </div>
        </Field>
        <Field label="Notes">
          <textarea rows={2} className={inputCls} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
        </Field>
      </FormModal>

      <RunDetailModal runId={detailId} onClose={() => setDetailId(null)} />
    </ModulePageShell>
  );
}
