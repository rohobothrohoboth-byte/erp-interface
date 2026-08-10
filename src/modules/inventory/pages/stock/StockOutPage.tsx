import { useMemo, useState } from "react";
import { ModulePageShell, StatusBadge } from "@/shared/components/ModulePageShell";
import { Button } from "@/shared/components/ui/button";
import { showToast } from "@/shared/layout/layout";

type Row = Record<string, string | number>;

const DATA: Row[] = [
  { id: "m1", reference: "STO-1042", sku: "RM-1001", productName: "Portland Cement 50kg", qty: 120, warehouse: "WH-ADDIS-01", date: "2026-08-08", status: "Posted" },
  { id: "m2", reference: "STO-1043", sku: "FG-2204", productName: "Ceramic Floor Tile 60x60", qty: 35, warehouse: "WH-ADDIS-01", date: "2026-08-07", status: "Posted" },
  { id: "m3", reference: "STO-1044", sku: "SP-3310", productName: "Hydraulic Pump Seal Kit", qty: 8, warehouse: "WH-MEK-02", date: "2026-08-06", status: "Draft" }
];

export default function StockOutPage() {
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
      title="Stock Out"
      subtitle="Post and track stock out movements across warehouses."
      stats={stats}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search..."
      onRefresh={() => showToast.success("Refreshed Stock Out")}
      primaryActionLabel="New Stock Out"
      onPrimaryAction={() => {
        showToast.success("Saved");
        setRows((prev) => prev);
      }}
    >
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Reference</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Qty</th>
              <th className="px-4 py-3 font-medium">Warehouse</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={String(row.id)} className="border-t border-slate-100 hover:bg-slate-50/80">
                <td className="px-4 py-3 font-medium text-slate-900">{row.reference}</td>
                <td className="px-4 py-3 text-slate-700">{row.sku}</td>
                <td className="px-4 py-3 text-slate-700">{row.productName}</td>
                <td className="px-4 py-3 text-slate-700">{row.qty}</td>
                <td className="px-4 py-3 text-slate-700">{row.warehouse}</td>
                <td className="px-4 py-3 text-slate-700">{row.date}</td>
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
