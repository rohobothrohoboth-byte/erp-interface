import { StatusBadge } from '@/shared/components/ModulePageShell';

export type PeriodRow = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'Open' | 'Closed' | 'Locked';
};

type PeriodTableProps = {
  rows?: PeriodRow[];
  onSelect?: (row: PeriodRow) => void;
};

const DEFAULT_ROWS: PeriodRow[] = [
  { id: 'p1', name: 'FY26 Q1', startDate: '2026-01-01', endDate: '2026-03-31', status: 'Closed' },
  { id: 'p2', name: 'FY26 Q2', startDate: '2026-04-01', endDate: '2026-06-30', status: 'Closed' },
  { id: 'p3', name: 'FY26 Jul', startDate: '2026-07-01', endDate: '2026-07-31', status: 'Open' },
  { id: 'p4', name: 'FY26 Aug', startDate: '2026-08-01', endDate: '2026-08-31', status: 'Open' },
];

export default function PeriodTable({ rows = DEFAULT_ROWS, onSelect }: PeriodTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Period</th>
            <th className="px-4 py-3 font-medium">Start</th>
            <th className="px-4 py-3 font-medium">End</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="cursor-pointer border-t border-slate-100 hover:bg-slate-50/80"
              onClick={() => onSelect?.(row)}
            >
              <td className="px-4 py-3 font-medium">{row.name}</td>
              <td className="px-4 py-3">{row.startDate}</td>
              <td className="px-4 py-3">{row.endDate}</td>
              <td className="px-4 py-3">
                <StatusBadge
                  status={row.status}
                  tone={
                    row.status === 'Closed'
                      ? 'success'
                      : row.status === 'Locked'
                        ? 'danger'
                        : 'warning'
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
