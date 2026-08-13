import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { ModulePageShell, StatusBadge } from "@/shared/components/ModulePageShell";
import { Button } from "@/shared/components/ui/button";
import { showToast } from "@/shared/layout/layout";
import { zoneApi } from "@/modules/inventory/services/warehouseZone.api";
import { warehouseApi } from "@/modules/inventory/services/warehouse.api";
import type { WarehouseZone } from "@/modules/inventory/types/warehouseZone.types";
import type { Warehouse } from "@/modules/inventory/types/warehouse.types";

export default function WarehouseZonesPage() {
  const [search, setSearch] = useState("");
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehouseId, setWarehouseId] = useState<string>("");
  const [rows, setRows] = useState<WarehouseZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWarehouses = useCallback(async () => {
    try {
      const data = await warehouseApi.getAll();
      const list = Array.isArray(data) ? data : [];
      setWarehouses(list);
      setWarehouseId((prev) => prev || list[0]?.id || "");
    } catch (err: any) {
      showToast.error(err?.message || "Failed to load warehouses");
    }
  }, []);

  const loadZones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await zoneApi.getAll(warehouseId ? { warehouseId } : {});
      setRows(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const message = err?.message || "Failed to load zones";
      setError(message);
      showToast.error(message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [warehouseId]);

  useEffect(() => {
    loadWarehouses();
  }, [loadWarehouses]);

  useEffect(() => {
    loadZones();
  }, [loadZones]);

  const handleCreate = useCallback(async () => {
    if (!warehouseId) {
      showToast.error("Select a warehouse first");
      return;
    }
    const name = window.prompt("Zone name?");
    if (!name) return;
    const code = window.prompt("Zone code (optional)?") || null;
    const zoneType = window.prompt("Zone type (optional)?") || null;
    try {
      await zoneApi.create({ warehouseId, name, code, zoneType, isActive: true });
      showToast.success("Zone created");
      loadZones();
    } catch (err: any) {
      showToast.error(err?.message || "Failed to create zone");
    }
  }, [warehouseId, loadZones]);

  const handleEdit = useCallback(
    async (zone: WarehouseZone) => {
      const name = window.prompt("Zone name?", zone.name);
      if (!name) return;
      const code = window.prompt("Zone code (optional)?", zone.code ?? "") || null;
      const zoneType = window.prompt("Zone type (optional)?", zone.zoneType ?? "") || null;
      try {
        await zoneApi.update({ id: zone.id, name, code, zoneType });
        showToast.success("Zone updated");
        loadZones();
      } catch (err: any) {
        showToast.error(err?.message || "Failed to update zone");
      }
    },
    [loadZones]
  );

  const handleDelete = useCallback(
    async (zone: WarehouseZone) => {
      if (!window.confirm(`Delete zone "${zone.name}"? This cannot be undone.`)) return;
      try {
        await zoneApi.remove(zone.id);
        showToast.success("Zone deleted");
        loadZones();
      } catch (err: any) {
        showToast.error(err?.message || "Failed to delete zone");
      }
    },
    [loadZones]
  );

  const handleBins = useCallback(async (zone: WarehouseZone) => {
    try {
      const bins = await zoneApi.getBins(zone.id);
      const list = Array.isArray(bins) ? bins : [];
      const summary = list.length
        ? list.map((b) => `• ${b.code}${b.capacity != null ? ` (cap ${b.capacity})` : ""}`).join("\n")
        : "No bins yet.";
      const add = window.confirm(`Bins in ${zone.name}:\n\n${summary}\n\nAdd a new bin?`);
      if (!add) return;
      const code = window.prompt("Bin code?");
      if (!code) return;
      const description = window.prompt("Description (optional)?") || null;
      const capacityRaw = window.prompt("Capacity (optional)?");
      const capacity = capacityRaw ? Number(capacityRaw) : null;
      await zoneApi.createBin(zone.id, { code, description, capacity });
      showToast.success("Bin added");
    } catch (err: any) {
      showToast.error(err?.message || "Failed to manage bins");
    }
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      [row.code ?? "", row.name, row.zoneType ?? "", row.description ?? ""].some((v) =>
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
      title="Warehouse Zones"
      subtitle="Configure putaway zones, picking areas, and staging locations."
      stats={stats}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search..."
      onRefresh={loadZones}
      primaryActionLabel="Add Zone"
      onPrimaryAction={handleCreate}
      filters={
        <select
          value={warehouseId}
          onChange={(e) => setWarehouseId(e.target.value)}
          className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
        >
          <option value="">All warehouses</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>
              {w.code} — {w.name}
            </option>
          ))}
        </select>
      }
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm">Loading zones...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="mb-3 h-10 w-10 text-rose-400" />
          <p className="text-sm font-medium text-slate-700">{error}</p>
          <Button variant="outline" className="mt-4" onClick={loadZones}>
            Try again
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Zone</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium text-slate-900">{row.code || "—"}</td>
                  <td className="px-4 py-3 text-slate-700">{row.name}</td>
                  <td className="px-4 py-3 text-slate-700">{row.zoneType || "—"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={row.isActive ? "Active" : "Inactive"}
                      tone={row.isActive ? "success" : "neutral"}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleBins(row)}>
                        Bins
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(row)}>
                        Edit
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
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={99} className="px-4 py-8 text-center text-slate-400">
                    No zones found.
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
