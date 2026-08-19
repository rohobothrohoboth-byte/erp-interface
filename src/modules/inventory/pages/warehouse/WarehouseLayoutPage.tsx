import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { ModulePageShell } from "@/shared/components/ModulePageShell";
import { Button } from "@/shared/components/ui/button";
import { showToast } from "@/shared/layout/layout";
import { zoneApi } from "@/modules/inventory/services/warehouseZone.api";
import { warehouseApi } from "@/modules/inventory/services/warehouse.api";
import type { WarehouseLayoutZone } from "@/modules/inventory/types/warehouseZone.types";
import type { Warehouse } from "@/modules/inventory/types/warehouse.types";

export default function WarehouseLayoutPage() {
  const [search, setSearch] = useState("");
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehouseId, setWarehouseId] = useState<string>("");
  const [zones, setZones] = useState<WarehouseLayoutZone[]>([]);
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

  const loadLayout = useCallback(async () => {
    if (!warehouseId) {
      setZones([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const layout = await zoneApi.getLayout(warehouseId);
      setZones(Array.isArray(layout?.zones) ? layout.zones : []);
    } catch (err: any) {
      const message = err?.message || "Failed to load layout";
      setError(message);
      showToast.error(message);
      setZones([]);
    } finally {
      setLoading(false);
    }
  }, [warehouseId]);

  useEffect(() => {
    loadWarehouses();
  }, [loadWarehouses]);

  useEffect(() => {
    loadLayout();
  }, [loadLayout]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return zones;
    return zones.filter((zone) =>
      [zone.code ?? "", zone.name, zone.zoneType ?? ""].some((v) =>
        String(v).toLowerCase().includes(q)
      ) || zone.bins?.some((b) => String(b.code).toLowerCase().includes(q))
    );
  }, [zones, search]);

  const totalBins = useMemo(
    () => zones.reduce((sum, z) => sum + (z.bins?.length ?? 0), 0),
    [zones]
  );

  const stats = [
    { label: "Zones", value: zones.length },
    { label: "Bins", value: totalBins },
  ];

  return (
    <ModulePageShell
      title="Warehouse Layout"
      subtitle="Zone and bin structure for directed putaway and picking."
      stats={stats}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search..."
      onRefresh={loadLayout}
      filters={
        <select
          value={warehouseId}
          onChange={(e) => setWarehouseId(e.target.value)}
          className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
        >
          <option value="">Select warehouse</option>
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
          <p className="text-sm">Loading layout...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="mb-3 h-10 w-10 text-rose-400" />
          <p className="text-sm font-medium text-slate-700">{error}</p>
          <Button variant="outline" className="mt-4" onClick={loadLayout}>
            Try again
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-slate-200 px-4 py-8 text-center text-slate-400">
          No zones found for this warehouse.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((zone) => (
            <div key={zone.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{zone.name}</div>
                  <div className="text-xs text-slate-500">
                    {zone.code || "—"} · {zone.zoneType || "Zone"}
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {zone.bins?.length ?? 0} bins
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(zone.bins ?? []).map((bin) => (
                  <span
                    key={bin.id}
                    className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700"
                    title={bin.description ?? undefined}
                  >
                    {bin.code}
                    {bin.capacity != null ? ` (${bin.capacity})` : ""}
                  </span>
                ))}
                {(zone.bins?.length ?? 0) === 0 && (
                  <span className="text-xs text-slate-400">No bins configured.</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </ModulePageShell>
  );
}
