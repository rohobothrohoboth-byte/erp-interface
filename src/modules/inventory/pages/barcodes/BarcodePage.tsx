import { useMemo, useState } from "react";
import { ModulePageShell, StatusBadge } from "@/shared/components/ModulePageShell";
import { Button } from "@/shared/components/ui/button";
import { showToast } from "@/shared/layout/layout";

type Row = Record<string, string | number>;

const DATA: Row[] = [{ id: "b1", barcode: "6281001001001", sku: "RM-1001", format: "EAN-13", status: "Active" }, { id: "b2", barcode: "6281001002204", sku: "FG-2204", format: "EAN-13", status: "Active" }, { id: "b3", barcode: "QR-SP-3310", sku: "SP-3310", format: "QR", status: "Active" }, { id: "b4", barcode: "TEMP-0008", sku: "—", format: "CODE128", status: "Draft" }];

export default function BarcodePage() {
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
      title="Barcode Management"
      subtitle="Map barcodes and labels to inventory SKUs."
      stats={stats}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search..."
      onRefresh={() => showToast.success("Refreshed Barcode Management")}
      primaryActionLabel="Generate Labels"
      onPrimaryAction={() => {
        showToast.success("Saved");
        setRows((prev) => prev);
      }}
    >
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Barcode</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Format</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={String(row.id)} className="border-t border-slate-100 hover:bg-slate-50/80">
                <td className="px-4 py-3 font-medium text-slate-900">{row.barcode}</td>
                <td className="px-4 py-3 text-slate-700">{row.sku}</td>
                <td className="px-4 py-3 text-slate-700">{row.format}</td>
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
