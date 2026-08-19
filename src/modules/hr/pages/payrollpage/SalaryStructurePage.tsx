import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import { ModulePageShell, StatusBadge } from '@/shared/components/ModulePageShell';
import { Button } from '@/shared/components/ui/button';
import { FormModal, Field, inputCls } from '@/modules/inventory/components/FormModal';
import { showToast } from '@/shared/layout/layout';
import {
  salaryStructureApi,
  type SalaryStructureDto,
  type SalaryStructureCreateDto,
} from '@/modules/hr/services/payroll/payroll.api';

const KEY = ['payroll', 'salary-structures'];
const money = (n: number) => `ETB ${Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const emptyForm: SalaryStructureCreateDto = {
  name: '',
  description: '',
  baseSalary: 0,
  housingAllowance: 0,
  transportAllowance: 0,
  mealAllowance: 0,
  medicalAllowance: 0,
  otherAllowances: 0,
  deductions: 0,
  pensionContribution: 0,
};

const numFields: { key: keyof SalaryStructureCreateDto; label: string }[] = [
  { key: 'baseSalary', label: 'Base Salary' },
  { key: 'housingAllowance', label: 'Housing Allowance' },
  { key: 'transportAllowance', label: 'Transport Allowance' },
  { key: 'mealAllowance', label: 'Meal Allowance' },
  { key: 'medicalAllowance', label: 'Medical Allowance' },
  { key: 'otherAllowances', label: 'Other Allowances' },
  { key: 'deductions', label: 'Deductions' },
  { key: 'pensionContribution', label: 'Pension Contribution' },
];

export default function SalaryStructurePage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SalaryStructureCreateDto>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data: structures = [], isLoading, isError, error, refetch } = useQuery<SalaryStructureDto[], Error>({
    queryKey: KEY,
    queryFn: salaryStructureApi.getAll,
  });

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return structures;
    return structures.filter((s) => [s.name, s.description].filter(Boolean).some((v) => String(v).toLowerCase().includes(q)));
  }, [structures, search]);

  const allowances = (s: SalaryStructureDto) =>
    s.housingAllowance + s.transportAllowance + s.mealAllowance + s.medicalAllowance + s.otherAllowances;

  const invalidate = () => qc.invalidateQueries({ queryKey: KEY });

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };
  const openEdit = (s: SalaryStructureDto) => {
    setEditingId(s.id);
    setForm({
      name: s.name,
      description: s.description ?? '',
      baseSalary: s.baseSalary,
      housingAllowance: s.housingAllowance,
      transportAllowance: s.transportAllowance,
      mealAllowance: s.mealAllowance,
      medicalAllowance: s.medicalAllowance,
      otherAllowances: s.otherAllowances,
      deductions: s.deductions,
      pensionContribution: s.pensionContribution,
    });
    setModalOpen(true);
  };

  const createMut = useMutation({ mutationFn: (d: SalaryStructureCreateDto) => salaryStructureApi.create(d) });
  const updateMut = useMutation({ mutationFn: ({ id, d }: { id: string; d: SalaryStructureCreateDto }) => salaryStructureApi.update(id, d) });

  const submit = async () => {
    if (!form.name.trim()) {
      showToast.error('Structure name is required');
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await updateMut.mutateAsync({ id: editingId, d: form });
        showToast.success('Salary structure updated');
      } else {
        await createMut.mutateAsync(form);
        showToast.success('Salary structure created');
      }
      setModalOpen(false);
      invalidate();
    } catch (e) {
      showToast.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (s: SalaryStructureDto) => {
    if (!window.confirm(`Delete salary structure "${s.name}"?`)) return;
    setBusyId(s.id);
    try {
      await salaryStructureApi.remove(s.id);
      showToast.success('Salary structure deleted');
      invalidate();
    } catch (e) {
      showToast.error(e);
    } finally {
      setBusyId(null);
    }
  };

  const setNum = (key: keyof SalaryStructureCreateDto, v: string) =>
    setForm((f) => ({ ...f, [key]: v === '' ? 0 : Number(v) }));

  return (
    <ModulePageShell
      title="Salary Structure"
      subtitle="Define reusable salary structures (base pay, allowances, deductions)."
      stats={[
        { label: 'Structures', value: structures.length },
        { label: 'Active', value: structures.filter((s) => s.isActive).length },
      ]}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search structures..."
      onRefresh={() => refetch()}
      primaryActionLabel="New structure"
      onPrimaryAction={openAdd}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading structures...
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 py-12 text-center">
          <p className="text-sm text-rose-700">{error?.message || 'Failed to load salary structures.'}</p>
          <Button variant="outline" onClick={() => refetch()}>Try again</Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 text-right font-medium">Base</th>
                <th className="px-4 py-3 text-right font-medium">Allowances</th>
                <th className="px-4 py-3 text-right font-medium">Deductions</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{s.name}</div>
                    {s.description && <div className="max-w-xs truncate text-xs text-slate-500">{s.description}</div>}
                  </td>
                  <td className="px-4 py-3 text-right">{money(s.baseSalary)}</td>
                  <td className="px-4 py-3 text-right">{money(allowances(s))}</td>
                  <td className="px-4 py-3 text-right">{money(s.deductions + s.pensionContribution)}</td>
                  <td className="px-4 py-3 text-right font-semibold">{money(s.totalSalary)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={s.isActive ? 'Active' : 'Inactive'} tone={s.isActive ? 'success' : 'neutral'} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(s)}>
                        <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-rose-200 text-rose-700 hover:bg-rose-50"
                        disabled={busyId === s.id}
                        onClick={() => remove(s)}
                      >
                        {busyId === s.id ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Trash2 className="mr-1 h-3.5 w-3.5" />}
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    {search ? 'No structures match your search.' : 'No salary structures yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <FormModal
        open={modalOpen}
        title={editingId ? 'Edit salary structure' : 'New salary structure'}
        onClose={() => setModalOpen(false)}
        onSubmit={submit}
        submitting={submitting}
        submitLabel={editingId ? 'Save changes' : 'Create'}
      >
        <Field label="Name *">
          <input className={inputCls} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Grade A" />
        </Field>
        <Field label="Description">
          <input className={inputCls} value={form.description ?? ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          {numFields.map((nf) => (
            <Field key={nf.key} label={nf.label}>
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputCls}
                value={String(form[nf.key] ?? 0)}
                onChange={(e) => setNum(nf.key, e.target.value)}
              />
            </Field>
          ))}
        </div>
      </FormModal>
    </ModulePageShell>
  );
}
