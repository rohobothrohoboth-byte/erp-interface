import { useMemo, useState } from 'react';
import { ModulePageShell, StatusBadge } from '@/shared/components/ModulePageShell';
import { showToast } from '@/shared/layout/layout';

type PerfRow = {
  id: string;
  kpi: string;
  target: string;
  actual: string;
  trend: 'Up' | 'Flat' | 'Down';
  status: 'Met' | 'Watch' | 'Missed';
  owner: string;
};

const DATA: PerfRow[] = [
  {
    id: 'pf1',
    kpi: 'Jobs created',
    target: '12,000',
    actual: '11,420',
    trend: 'Up',
    status: 'Watch',
    owner: 'Economy',
  },
  {
    id: 'pf2',
    kpi: 'Housing units delivered',
    target: '3,500',
    actual: '3,610',
    trend: 'Up',
    status: 'Met',
    owner: 'Housing',
  },
  {
    id: 'pf3',
    kpi: 'Digital service uptake',
    target: '65%',
    actual: '52%',
    trend: 'Flat',
    status: 'Missed',
    owner: 'ICT',
  },
  {
    id: 'pf4',
    kpi: 'Training completions',
    target: '8,000',
    actual: '8,240',
    trend: 'Up',
    status: 'Met',
    owner: 'HRD',
  },
];

export default function PerformanceReportsPage() {
  const [search, setSearch] = useState('');
  const [rows] = useState(DATA);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.kpi, r.status, r.owner, r.trend].some((v) => String(v).toLowerCase().includes(q))
    );
  }, [rows, search]);

  return (
    <ModulePageShell
      title="Performance reports"
      subtitle="KPI attainment across national and sectoral plans."
      stats={[
        { label: 'KPIs', value: rows.length },
        { label: 'Met', value: rows.filter((r) => r.status === 'Met').length },
        { label: 'Missed', value: rows.filter((r) => r.status === 'Missed').length },
      ]}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search KPIs..."
      onRefresh={() => showToast.success('Performance reports refreshed')}
      primaryActionLabel="Export"
      onPrimaryAction={() => showToast.success('Export started')}
    >
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">KPI</th>
              <th className="px-4 py-3 font-medium">Target</th>
              <th className="px-4 py-3 font-medium">Actual</th>
              <th className="px-4 py-3 font-medium">Trend</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Owner</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                <td className="px-4 py-3 font-medium">{row.kpi}</td>
                <td className="px-4 py-3">{row.target}</td>
                <td className="px-4 py-3">{row.actual}</td>
                <td className="px-4 py-3">{row.trend}</td>
                <td className="px-4 py-3">
                  <StatusBadge
                    status={row.status}
                    tone={
                      row.status === 'Met'
                        ? 'success'
                        : row.status === 'Watch'
                          ? 'warning'
                          : 'danger'
                    }
                  />
                </td>
                <td className="px-4 py-3">{row.owner}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No performance rows match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ModulePageShell>
  );
}
