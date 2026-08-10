import { ModulePageShell, StatusBadge } from "@/shared/components/ModulePageShell";
import { Button } from "@/shared/components/ui/button";
import { showToast } from "@/shared/layout/layout";

type HrPlaceholderPageProps = {
  title: string;
  subtitle: string;
  rows?: { id: string; name: string; detail: string; status: string }[];
};

const DEFAULT_ROWS = [
  { id: "1", name: "Sample record A", detail: "Placeholder data pending API wiring", status: "Ready" },
  { id: "2", name: "Sample record B", detail: "Placeholder data pending API wiring", status: "Draft" },
];

export default function HrPlaceholderPage({
  title,
  subtitle,
  rows = DEFAULT_ROWS,
}: HrPlaceholderPageProps) {
  return (
    <ModulePageShell
      title={title}
      subtitle={subtitle}
      stats={[
        { label: "Records", value: rows.length },
        { label: "Status", value: "Scaffold" },
      ]}
      onRefresh={() => showToast.success(`Refreshed ${title}`)}
      primaryActionLabel="New"
      onPrimaryAction={() => showToast.success(`${title}: create flow coming soon`)}
    >
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Detail</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                <td className="px-4 py-3 font-medium text-slate-900">{row.name}</td>
                <td className="px-4 py-3 text-slate-700">{row.detail}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={row.status} tone={row.status === "Ready" ? "success" : "warning"} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => showToast.success("Opened record")}>
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ModulePageShell>
  );
}
