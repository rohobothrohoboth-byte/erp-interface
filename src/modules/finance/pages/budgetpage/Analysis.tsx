import { useMemo, useState } from 'react';
import { ModulePageShell, StatusBadge } from '@/shared/components/ModulePageShell';
import { showToast } from '@/shared/layout/layout';

type AnalysisRow = {
  id: string;
  department: string;
  budget: number;
  actual: number;
  variance: number;
  status: 'On Track' | 'Over' | 'Under';
};

const DATA: AnalysisRow[] = [
  { id: 'a1', department: 'Operations', budget: 120000, actual: 112400, variance: -7600, status: 'Under' },
  { id: 'a2', department: 'Sales', budget: 85000, actual: 91200, variance: 6200, status: 'Over' },
  { id: 'a3', department: 'Engineering', budget: 210000, actual: 198500, variance: -11500, status: 'On Track' },
  { id: 'a4', department: 'Marketing', budget: 64000, actual: 63800, variance: -200, status: 'On Track' },
];

function money(n: number) {
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export default function Analysis() {
  const [search, setSearch] = useState('');
  const [rows] = useState(DATA);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.department.toLowerCase().includes(q) || r.status.toLowerCase().includes(q));
  }, [rows, search]);

  return (
    <ModulePageShell
      title="Budget analysis"
      subtitle="Compare budget vs actual spend by department."
      stats={[
        { label: 'Departments', value: rows.length },
        { label: 'Over budget', value: rows.filter((r) => r.status === 'Over').length },
      ]}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search departments..."
      onRefresh={() => showToast.success('Analysis refreshed')}
    >
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Department</th>
              <th className="px-4 py-3 font-medium">Budget</th>
              <th className="px-4 py-3 font-medium">Actual</th>
              <th className="px-4 py-3 font-medium">Variance</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                <td className="px-4 py-3 font-medium">{row.department}</td>
                <td className="px-4 py-3">{money(row.budget)}</td>
                <td className="px-4 py-3">{money(row.actual)}</td>
                <td className="px-4 py-3">{money(row.variance)}</td>
                <td className="px-4 py-3">
                  <StatusBadge
                    status={row.status}
                    tone={
                      row.status === 'Over'
                        ? 'danger'
                        : row.status === 'Under'
                          ? 'info'
                          : 'success'
                    }
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No analysis rows match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ModulePageShell>
  );
}
