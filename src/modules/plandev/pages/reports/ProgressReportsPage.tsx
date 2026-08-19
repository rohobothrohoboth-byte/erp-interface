import { useMemo, useState } from 'react';
import { ModulePageShell, StatusBadge } from '@/shared/components/ModulePageShell';
import { showToast } from '@/shared/layout/layout';

type ProgressRow = {
  id: string;
  plan: string;
  period: string;
  progress: number;
  rag: 'Green' | 'Amber' | 'Red';
  owner: string;
  summary: string;
};

const DATA: ProgressRow[] = [
  {
    id: 'pr1',
    plan: 'National Housing Phase 2',
    period: '2026 Q3',
    progress: 68,
    rag: 'Green',
    owner: 'PMO',
    summary: 'Land acquisition complete; construction on schedule',
  },
  {
    id: 'pr2',
    plan: 'Digital Services Rollout',
    period: '2026 Q3',
    progress: 41,
    rag: 'Amber',
    owner: 'ICT',
    summary: 'Vendor onboarding delayed by 2 weeks',
  },
  {
    id: 'pr3',
    plan: 'Regional Skills Program',
    period: '2026 Q3',
    progress: 22,
    rag: 'Red',
    owner: 'HRD',
    summary: 'Budget reallocation pending cabinet review',
  },
  {
    id: 'pr4',
    plan: 'Climate Resilience Grid',
    period: '2026 Q3',
    progress: 55,
    rag: 'Green',
    owner: 'Energy',
    summary: 'Pilot sites instrumented',
  },
];

export default function ProgressReportsPage() {
  const [search, setSearch] = useState('');
  const [rows] = useState(DATA);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.plan, r.period, r.rag, r.owner, r.summary].some((v) =>
        String(v).toLowerCase().includes(q)
      )
    );
  }, [rows, search]);

  return (
    <ModulePageShell
      title="Progress reports"
      subtitle="Plan delivery status for steering and oversight committees."
      stats={[
        { label: 'Plans tracked', value: rows.length },
        { label: 'At risk', value: rows.filter((r) => r.rag !== 'Green').length },
      ]}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search progress reports..."
      onRefresh={() => showToast.success('Progress reports refreshed')}
      primaryActionLabel="Generate"
      onPrimaryAction={() => showToast.success('Report generation queued')}
    >
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Period</th>
              <th className="px-4 py-3 font-medium">Progress</th>
              <th className="px-4 py-3 font-medium">RAG</th>
              <th className="px-4 py-3 font-medium">Owner</th>
              <th className="px-4 py-3 font-medium">Summary</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                <td className="px-4 py-3 font-medium">{row.plan}</td>
                <td className="px-4 py-3">{row.period}</td>
                <td className="px-4 py-3">{row.progress}%</td>
                <td className="px-4 py-3">
                  <StatusBadge
                    status={row.rag}
                    tone={
                      row.rag === 'Green' ? 'success' : row.rag === 'Amber' ? 'warning' : 'danger'
                    }
                  />
                </td>
                <td className="px-4 py-3">{row.owner}</td>
                <td className="px-4 py-3 text-slate-600">{row.summary}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No progress reports match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ModulePageShell>
  );
}
