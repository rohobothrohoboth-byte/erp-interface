import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Calculator } from 'lucide-react';
import { ModulePageShell, StatusBadge } from '@/shared/components/ModulePageShell';
import { Button } from '@/shared/components/ui/button';
import { FormModal, Field, inputCls } from '@/modules/inventory/components/FormModal';
import { showToast } from '@/shared/layout/layout';
import {
  taxApi,
  type TaxRateDto,
  type TaxRateCreateDto,
  type TaxCalculationDto,
} from '@/modules/hr/services/payroll/payroll.api';

const money = (n: number) => `ETB ${Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pct = (n: number) => `${(Number(n ?? 0) * (n <= 1 ? 100 : 1)).toFixed(2)}%`;

export default function TaxConfigPage() {
  const qc = useQueryClient();
  const now = new Date().getFullYear();
  const [year, setYear] = useState<number>(now);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<TaxRateCreateDto>({
    name: '',
    minIncome: 0,
    maxIncome: null,
    taxRate: 0,
    deductibleAmount: 0,
    taxYear: now,
  });

  // Calculator
  const [gross, setGross] = useState('');
  const [calc, setCalc] = useState<TaxCalculationDto | null>(null);
  const [calculating, setCalculating] = useState(false);

  const KEY = ['payroll', 'tax-rates', year];
  const { data: rates = [], isLoading, isError, error, refetch } = useQuery<TaxRateDto[], Error>({
    queryKey: KEY,
    queryFn: () => taxApi.getRates(year),
  });

  const sorted = useMemo(() => [...rates].sort((a, b) => a.minIncome - b.minIncome), [rates]);

  const createMut = useMutation({ mutationFn: (d: TaxRateCreateDto) => taxApi.createRate(d) });

  const submit = async () => {
    if (!form.name.trim()) {
      showToast.error('Bracket name is required');
      return;
    }
    setSubmitting(true);
    try {
      await createMut.mutateAsync({ ...form, taxYear: year });
      showToast.success('Tax bracket added');
      setModalOpen(false);
      qc.invalidateQueries({ queryKey: KEY });
    } catch (e) {
      showToast.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const runCalc = async () => {
    const g = Number(gross);
    if (!g || g <= 0) {
      showToast.error('Enter a gross income');
      return;
    }
    setCalculating(true);
    try {
      setCalc(await taxApi.calculate(g));
    } catch (e) {
      showToast.error(e);
    } finally {
      setCalculating(false);
    }
  };

  const openAdd = () => {
    setForm({ name: '', minIncome: 0, maxIncome: null, taxRate: 0, deductibleAmount: 0, taxYear: year });
    setModalOpen(true);
  };

  return (
    <ModulePageShell
      title="Tax Configurations"
      subtitle="Income-tax brackets by year and a live tax calculator."
      stats={[
        { label: 'Brackets', value: rates.length },
        { label: 'Tax Year', value: year },
      ]}
      onRefresh={() => refetch()}
      primaryActionLabel="Add bracket"
      onPrimaryAction={openAdd}
      filters={
        <select
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {Array.from({ length: 6 }, (_, i) => now - i + 1).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      }
    >
      {/* Calculator */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Calculator className="h-4 w-4 text-teal-600" /> Tax Calculator
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs text-slate-500">Gross monthly income (ETB)</label>
            <input
              type="number"
              min={0}
              className={`${inputCls} w-56`}
              value={gross}
              onChange={(e) => setGross(e.target.value)}
              placeholder="e.g. 15000"
            />
          </div>
          <Button onClick={runCalc} disabled={calculating} className="bg-teal-600 hover:bg-teal-700">
            {calculating ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null} Calculate
          </Button>
          {calc && (
            <div className="flex flex-wrap gap-4 text-sm">
              <div><span className="text-slate-500">Taxable:</span> <b>{money(calc.taxableIncome)}</b></div>
              <div><span className="text-slate-500">Pension:</span> <b>{money(calc.pensionContribution)}</b></div>
              <div><span className="text-slate-500">Tax:</span> <b className="text-rose-600">{money(calc.taxAmount)}</b></div>
              <div><span className="text-slate-500">Net:</span> <b className="text-emerald-600">{money(calc.netIncome)}</b></div>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading tax brackets...
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 py-12 text-center">
          <p className="text-sm text-rose-700">{error?.message || 'Failed to load tax brackets.'}</p>
          <Button variant="outline" onClick={() => refetch()}>Try again</Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Bracket</th>
                <th className="px-4 py-3 text-right font-medium">Min Income</th>
                <th className="px-4 py-3 text-right font-medium">Max Income</th>
                <th className="px-4 py-3 text-right font-medium">Rate</th>
                <th className="px-4 py-3 text-right font-medium">Deductible</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium text-slate-900">{r.name}</td>
                  <td className="px-4 py-3 text-right">{money(r.minIncome)}</td>
                  <td className="px-4 py-3 text-right">{r.maxIncome == null ? 'and above' : money(r.maxIncome)}</td>
                  <td className="px-4 py-3 text-right">{pct(r.taxRate)}</td>
                  <td className="px-4 py-3 text-right">{money(r.deductibleAmount)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.isActive ? 'Active' : 'Inactive'} tone={r.isActive ? 'success' : 'neutral'} />
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    No tax brackets configured for {year}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <FormModal
        open={modalOpen}
        title={`Add tax bracket (${year})`}
        onClose={() => setModalOpen(false)}
        onSubmit={submit}
        submitting={submitting}
        submitLabel="Add bracket"
      >
        <Field label="Bracket name *">
          <input className={inputCls} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. 0 - 600 (Exempt)" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Min income">
            <input type="number" min={0} className={inputCls} value={String(form.minIncome)} onChange={(e) => setForm((f) => ({ ...f, minIncome: Number(e.target.value) || 0 }))} />
          </Field>
          <Field label="Max income (blank = no cap)">
            <input type="number" min={0} className={inputCls} value={form.maxIncome == null ? '' : String(form.maxIncome)} onChange={(e) => setForm((f) => ({ ...f, maxIncome: e.target.value === '' ? null : Number(e.target.value) }))} />
          </Field>
          <Field label="Rate (e.g. 0.15 for 15%)">
            <input type="number" min={0} step="0.01" className={inputCls} value={String(form.taxRate)} onChange={(e) => setForm((f) => ({ ...f, taxRate: Number(e.target.value) || 0 }))} />
          </Field>
          <Field label="Deductible amount">
            <input type="number" min={0} className={inputCls} value={String(form.deductibleAmount)} onChange={(e) => setForm((f) => ({ ...f, deductibleAmount: Number(e.target.value) || 0 }))} />
          </Field>
        </div>
      </FormModal>
    </ModulePageShell>
  );
}
