import { useMemo, useState } from "react";
import { ModulePageShell, StatusBadge } from "@/shared/components/ModulePageShell";
import { Button } from "@/shared/components/ui/button";
import { showToast } from "@/shared/layout/layout";

type Row = Record<string, string | number>;

const DATA: Row[] = [{ id: "mr1", date: "2026-08-08", type: "IN", reference: "GRN-1042", sku: "RM-1001", qty: 500 }, { id: "mr2", date: "2026-08-08", type: "OUT", reference: "SO-8891", sku: "FG-2204", qty: 40 }, { id: "mr3", date: "2026-08-07", type: "TRANSFER", reference: "TR-221", sku: "SP-3310", qty: 10 }];

export default function MovementReportsPage() {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<Row[]>(DATA);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      Object.values(row).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [rows, search]);

  const stats = [
    { label: "Records", value: rows.length },
    { label: "Showing", value: filtered.length },
  ];

  return (
    <ModulePageShell
      title="Movement Reports"
      subtitle="Audit stock in/out/transfer/adjustment history."
      stats={stats}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search..."
      onRefresh={() => showToast.success("Refreshed Movement Reports")}
      primaryActionLabel="Export"
      onPrimaryAction={() => {
        showToast.success("Saved");
        setRows((prev) => prev);
      }}
    >
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Reference</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Qty</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={String(row.id)} className="border-t border-slate-100 hover:bg-slate-50/80">
                <td className="px-4 py-3 font-medium text-slate-900">{row.date}</td>
                <td className="px-4 py-3 text-slate-700">{row.type}</td>
                <td className="px-4 py-3 text-slate-700">{row.reference}</td>
                <td className="px-4 py-3 text-slate-700">{row.sku}</td>
                <td className="px-4 py-3 text-slate-700">{row.qty}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => showToast.success("Opened record")}>
                    View
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={99} className="px-4 py-8 text-center text-slate-400">
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
