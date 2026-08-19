import { useMemo, useState } from 'react';
import { ModulePageShell, StatusBadge } from '@/shared/components/ModulePageShell';
import { Button } from '@/shared/components/ui/button';
import { showToast } from '@/shared/layout/layout';

type ApprovalRow = {
  id: string;
  name: string;
  requester: string;
  amount: number;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
};

const DATA: ApprovalRow[] = [
  {
    id: 'b1',
    name: 'FY26 Ops Base',
    requester: 'A. Mensah',
    amount: 120000,
    submittedAt: '2026-08-06',
    status: 'Pending',
  },
  {
    id: 'b2',
    name: 'Marketing Q3 Uplift',
    requester: 'J. Park',
    amount: 18000,
    submittedAt: '2026-08-07',
    status: 'Pending',
  },
  {
    id: 'b3',
    name: 'Engineering CapEx',
    requester: 'R. Singh',
    amount: 45000,
    submittedAt: '2026-08-02',
    status: 'Approved',
  },
];

function money(n: number) {
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export default function Approval() {
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState(DATA);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.name, r.requester, r.status].some((v) => v.toLowerCase().includes(q))
    );
  }, [rows, search]);

  const updateStatus = (id: string, status: ApprovalRow['status']) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    showToast.success(`Budget ${status.toLowerCase()}`);
  };

  return (
    <ModulePageShell
      title="Budget approval"
      subtitle="Review and approve submitted budget requests."
      stats={[
        { label: 'Pending', value: rows.filter((r) => r.status === 'Pending').length },
        { label: 'Approved', value: rows.filter((r) => r.status === 'Approved').length },
      ]}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search requests..."
      onRefresh={() => showToast.success('Approvals refreshed')}
    >
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Budget</th>
              <th className="px-4 py-3 font-medium">Requester</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Submitted</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                <td className="px-4 py-3 font-medium">{row.name}</td>
                <td className="px-4 py-3">{row.requester}</td>
                <td className="px-4 py-3">{money(row.amount)}</td>
                <td className="px-4 py-3">{row.submittedAt}</td>
                <td className="px-4 py-3">
                  <StatusBadge
                    status={row.status}
                    tone={
                      row.status === 'Approved'
                        ? 'success'
                        : row.status === 'Rejected'
                          ? 'danger'
                          : 'warning'
                    }
                  />
                </td>
                <td className="px-4 py-3">
                  {row.status === 'Pending' ? (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => updateStatus(row.id, 'Approved')}>
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(row.id, 'Rejected')}
                      >
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No approval requests match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ModulePageShell>
  );
}
