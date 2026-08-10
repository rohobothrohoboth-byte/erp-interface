import { useMemo, useState } from "react";
import { ModulePageShell, StatusBadge } from "@/shared/components/ModulePageShell";
import { Button } from "@/shared/components/ui/button";
import { showToast } from "@/shared/layout/layout";

type Row = Record<string, string | number>;

const DATA: Row[] = [{ id: "a1", aisle: "A1", bins: 20, occupancy: 80, temperature: "Ambient" }, { id: "a2", aisle: "A2", bins: 20, occupancy: 65, temperature: "Ambient" }, { id: "a3", aisle: "B1", bins: 16, occupancy: 42, temperature: "Ambient" }, { id: "a4", aisle: "C-COLD", bins: 10, occupancy: 55, temperature: "Cold" }];

export default function WarehouseLayoutPage() {
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
      title="Warehouse Layout"
      subtitle="Aisle and bin structure for directed putaway and picking."
      stats={stats}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search..."
      onRefresh={() => showToast.success("Refreshed Warehouse Layout")}
      primaryActionLabel="Import Layout"
      onPrimaryAction={() => {
        showToast.success("Saved");
        setRows((prev) => prev);
      }}
    >
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Aisle</th>
              <th className="px-4 py-3 font-medium">Bins</th>
              <th className="px-4 py-3 font-medium">Occupancy %</th>
              <th className="px-4 py-3 font-medium">Climate</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={String(row.id)} className="border-t border-slate-100 hover:bg-slate-50/80">
                <td className="px-4 py-3 font-medium text-slate-900">{row.aisle}</td>
                <td className="px-4 py-3 text-slate-700">{row.bins}</td>
                <td className="px-4 py-3 text-slate-700">{row.occupancy}</td>
                <td className="px-4 py-3 text-slate-700">{row.temperature}</td>
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
