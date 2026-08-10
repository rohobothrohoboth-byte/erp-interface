import { useMemo, useState } from "react";
import { ModulePageShell, StatusBadge } from "@/shared/components/ModulePageShell";
import { Button } from "@/shared/components/ui/button";
import { showToast } from "@/shared/layout/layout";

export type HrReportColumn = {
  key: string;
  label: string;
};

export type HrReportRow = Record<string, string | number> & { id: string; status?: string };

type HrReportTablePageProps = {
  title: string;
  subtitle: string;
  columns: HrReportColumn[];
  data: HrReportRow[];
  stats?: { label: string; value: string | number; hint?: string }[];
  statusTone?: (status: string) => "success" | "warning" | "danger" | "neutral" | "info";
};

export function HrReportTablePage({
  title,
  subtitle,
  columns,
  data,
  stats,
  statusTone,
}: HrReportTablePageProps) {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<HrReportRow[]>(data);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      Object.values(row).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [rows, search]);

  const defaultStats = stats ?? [
    { label: "Records", value: rows.length },
    { label: "Showing", value: filtered.length },
  ];

  return (
    <ModulePageShell
      title={title}
      subtitle={subtitle}
      stats={defaultStats}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search reports..."
      onRefresh={() => {
        setRows(data);
        showToast.success(`Refreshed ${title}`);
      }}
      primaryActionLabel="Export"
      onPrimaryAction={() => showToast.success(`${title} exported`)}
    >
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 font-medium">
                  {col.label}
                </th>
              ))}
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-slate-700">
                    {col.key === "status" && row.status ? (
                      <StatusBadge
                        status={row.status}
                        tone={statusTone?.(row.status) ?? "neutral"}
                      />
                    ) : (
                      <span className={col.key === columns[0]?.key ? "font-medium text-slate-900" : undefined}>
                        {row[col.key]}
                      </span>
                    )}
                  </td>
                ))}
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => showToast.success("Opened report detail")}>
                    View
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-slate-400">
                  No records match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ModulePageShell>
  );
}
