import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { ModulePageShell, StatusBadge } from "@/shared/components/ModulePageShell";
import { Button } from "@/shared/components/ui/button";
import { showToast } from "@/shared/layout/layout";
import { warehouseApi } from "@/modules/inventory/services/warehouse.api";
import type { Warehouse } from "@/modules/inventory/types/warehouse.types";

export default function WarehousePage() {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await warehouseApi.getAll();
      setRows(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const message = err?.message || "Failed to load warehouses";
      setError(message);
      showToast.error(message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = useCallback(async () => {
    const name = window.prompt("Warehouse name?");
    if (!name) return;
    const code = window.prompt("Warehouse code?");
    if (!code) return;
    const location = window.prompt("Location (optional)?") || null;
    try {
      await warehouseApi.create({ name, code, location, isActive: true, status: "Active" });
      showToast.success("Warehouse created");
      load();
    } catch (err: any) {
      showToast.error(err?.message || "Failed to create warehouse");
    }
  }, [load]);

  const handleDelete = useCallback(
    async (wh: Warehouse) => {
      if (!window.confirm(`Delete warehouse "${wh.name}"? This cannot be undone.`)) return;
      try {
        await warehouseApi.remove(wh.id);
        showToast.success("Warehouse deleted");
        load();
      } catch (err: any) {
        showToast.error(err?.message || "Failed to delete warehouse");
      }
    },
    [load]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      [row.code, row.name, row.location ?? "", row.status ?? ""].some((v) =>
        String(v).toLowerCase().includes(q)
      )
    );
  }, [rows, search]);

  const stats = [
    { label: "Records", value: rows.length },
    { label: "Showing", value: filtered.length },
  ];

  return (
    <ModulePageShell
      title="Warehouses"
      subtitle="Manage warehouse sites, capacity, and operational status."
      stats={stats}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search..."
      onRefresh={load}
      primaryActionLabel="Add Warehouse"
      onPrimaryAction={handleCreate}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm">Loading warehouses...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="mb-3 h-10 w-10 text-rose-400" />
          <p className="text-sm font-medium text-slate-700">{error}</p>
          <Button variant="outline" className="mt-4" onClick={load}>
            Try again
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const statusLabel = row.status || (row.isActive ? "Active" : "Inactive");
                return (
                  <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-900">{row.code}</td>
                    <td className="px-4 py-3 text-slate-700">{row.name}</td>
                    <td className="px-4 py-3 text-slate-700">{row.location || "—"}</td>
                    <td className="px-4 py-3 text-slate-700">{row.warehouseType || "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={statusLabel} tone={row.isActive ? "success" : "neutral"} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => showToast.success("Opened record")}>
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:text-rose-700"
                          onClick={() => handleDelete(row)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
      )}
    </ModulePageShell>
  );
}
