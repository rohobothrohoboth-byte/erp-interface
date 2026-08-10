import { useMemo, useState } from "react";
import { ModulePageShell, StatusBadge } from "@/shared/components/ModulePageShell";
import { Button } from "@/shared/components/ui/button";
import { showToast } from "@/shared/layout/layout";

type Row = Record<string, string | number>;

const DATA: Row[] = [{ id: "z1", warehouse: "WH-ADDIS-01", code: "A-RECV", name: "Receiving Dock", type: "Receiving", bins: 12 }, { id: "z2", warehouse: "WH-ADDIS-01", code: "B-PICK", name: "Fast Pick", type: "Picking", bins: 48 }, { id: "z3", warehouse: "WH-ADDIS-01", code: "C-BULK", name: "Bulk Storage", type: "Bulk", bins: 30 }, { id: "z4", warehouse: "WH-MEK-02", code: "M-SPARE", name: "Spare Parts Cage", type: "Secure", bins: 16 }];

export default function WarehouseZonesPage() {
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
      title="Warehouse Zones"
      subtitle="Configure putaway zones, picking areas, and staging locations."
      stats={stats}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search..."
      onRefresh={() => showToast.success("Refreshed Warehouse Zones")}
      primaryActionLabel="Add Zone"
      onPrimaryAction={() => {
        showToast.success("Saved");
        setRows((prev) => prev);
      }}
    >
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Warehouse</th>
              <th className="px-4 py-3 font-medium">Zone</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Bins</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={String(row.id)} className="border-t border-slate-100 hover:bg-slate-50/80">
                <td className="px-4 py-3 font-medium text-slate-900">{row.warehouse}</td>
                <td className="px-4 py-3 text-slate-700">{row.code}</td>
                <td className="px-4 py-3 text-slate-700">{row.name}</td>
                <td className="px-4 py-3 text-slate-700">{row.type}</td>
                <td className="px-4 py-3 text-slate-700">{row.bins}</td>
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
