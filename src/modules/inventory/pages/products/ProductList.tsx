import { useMemo, useState } from "react";
import { ModulePageShell, StatusBadge } from "@/shared/components/ModulePageShell";
import { Button } from "@/shared/components/ui/button";
import { showToast } from "@/shared/layout/layout";

type Row = Record<string, string | number>;

const DATA: Row[] = [
  { id: "p1", sku: "RM-1001", name: "Portland Cement 50kg", category: "Raw Material", uom: "BAG", qtyOnHand: 1240, reorderLevel: 300, warehouse: "WH-ADDIS-01", status: "Active" },
  { id: "p2", sku: "FG-2204", name: "Ceramic Floor Tile 60x60", category: "Finished Goods", uom: "BOX", qtyOnHand: 86, reorderLevel: 120, warehouse: "WH-ADDIS-01", status: "Active" },
  { id: "p3", sku: "SP-3310", name: "Hydraulic Pump Seal Kit", category: "Spare Parts", uom: "SET", qtyOnHand: 24, reorderLevel: 40, warehouse: "WH-MEK-02", status: "Active" },
  { id: "p4", sku: "CO-4402", name: "Copper Cable 2.5mm", category: "Consumables", uom: "M", qtyOnHand: 3500, reorderLevel: 1000, warehouse: "WH-ADDIS-01", status: "Active" },
  { id: "p5", sku: "FG-1188", name: "Office Desk Modular", category: "Finished Goods", uom: "PCS", qtyOnHand: 12, reorderLevel: 8, warehouse: "WH-AA-OUT", status: "Inactive" }
];

export default function ProductList() {
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
      title="Products"
      subtitle="Maintain SKUs, stock on hand, reorder levels, and costing."
      stats={stats}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search..."
      onRefresh={() => showToast.success("Refreshed Products")}
      primaryActionLabel="Add Product"
      onPrimaryAction={() => {
        showToast.success("Saved");
        setRows((prev) => prev);
      }}
    >
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">On Hand</th>
              <th className="px-4 py-3 font-medium">UOM</th>
              <th className="px-4 py-3 font-medium">Reorder</th>
              <th className="px-4 py-3 font-medium">Warehouse</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={String(row.id)} className="border-t border-slate-100 hover:bg-slate-50/80">
                <td className="px-4 py-3 font-medium text-slate-900">{row.sku}</td>
                <td className="px-4 py-3 text-slate-700">{row.name}</td>
                <td className="px-4 py-3 text-slate-700">{row.category}</td>
                <td className="px-4 py-3 text-slate-700">{row.qtyOnHand}</td>
                <td className="px-4 py-3 text-slate-700">{row.uom}</td>
                <td className="px-4 py-3 text-slate-700">{row.reorderLevel}</td>
                <td className="px-4 py-3 text-slate-700">{row.warehouse}</td>
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
