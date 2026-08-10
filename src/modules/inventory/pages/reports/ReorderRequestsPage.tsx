import { useMemo, useState } from "react";
import { ModulePageShell, StatusBadge } from "@/shared/components/ModulePageShell";
import { Button } from "@/shared/components/ui/button";
import { showToast } from "@/shared/layout/layout";

type Row = Record<string, string | number>;

const DATA: Row[] = [{ id: "rr1", requestNo: "RR-501", sku: "FG-2204", qty: 100, vendor: "TileCo", status: "Pending" }, { id: "rr2", requestNo: "RR-502", sku: "SP-3310", qty: 30, vendor: "HydroParts", status: "Approved" }, { id: "rr3", requestNo: "RR-503", sku: "CO-4402", qty: 500, vendor: "CableWorks", status: "Draft" }];

export default function ReorderRequestsPage() {
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
      title="Reorder Requests"
      subtitle="Suggested and approved replenishment requests."
      stats={stats}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search..."
      onRefresh={() => showToast.success("Refreshed Reorder Requests")}
      primaryActionLabel="Create Request"
      onPrimaryAction={() => {
        showToast.success("Saved");
        setRows((prev) => prev);
      }}
    >
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Request</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Qty</th>
              <th className="px-4 py-3 font-medium">Vendor</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={String(row.id)} className="border-t border-slate-100 hover:bg-slate-50/80">
                <td className="px-4 py-3 font-medium text-slate-900">{row.requestNo}</td>
                <td className="px-4 py-3 text-slate-700">{row.sku}</td>
                <td className="px-4 py-3 text-slate-700">{row.qty}</td>
                <td className="px-4 py-3 text-slate-700">{row.vendor}</td>
                <td className="px-4 py-3"><StatusBadge status={String(row.status)} tone={["Active","Posted","Approved","Healthy","Done","Completed","On Track","Green"].includes(String(row.status)) ? "success" : ["Draft","Pending","Below Min","Blocked","At Risk","Amber"].includes(String(row.status)) ? "warning" : "neutral"} /></td>
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
