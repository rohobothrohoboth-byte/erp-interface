import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { ModulePageShell } from "@/shared/components/ModulePageShell";
import { Button } from "@/shared/components/ui/button";
import { showToast } from "@/shared/layout/layout";
import { invAnalyticsApi } from "@/modules/inventory/services/analytics.api";
import { stockApi } from "@/modules/inventory/services/stock.api";
import { warehouseApi } from "@/modules/inventory/services/warehouse.api";
import type { StockSummary } from "@/modules/inventory/types/analytics.types";
import type { StockLevel, Warehouse } from "@/modules/inventory/types/warehouse.types";

export default function StockReportsPage() {
  const [search, setSearch] = useState("");
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehouseId, setWarehouseId] = useState<string>("");
  const [summary, setSummary] = useState<StockSummary | null>(null);
  const [levels, setLevels] = useState<StockLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryData, levelData] = await Promise.all([
        invAnalyticsApi.getStockSummary(),
        stockApi.getLevels(warehouseId ? { warehouseId } : {}),
      ]);
      setSummary(summaryData ?? null);
      setLevels(Array.isArray(levelData) ? levelData : []);
    } catch (err: any) {
      const message = err?.message || "Failed to load stock report";
      setError(message);
      showToast.error(message);
      setSummary(null);
      setLevels([]);
    } finally {
      setLoading(false);
    }
  }, [warehouseId]);

  useEffect(() => {
    warehouseApi
      .getAll()
      .then((data) => setWarehouses(Array.isArray(data) ? data : []))
      .catch(() => setWarehouses([]));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return levels;
    return levels.filter((row) =>
      [row.productCode, row.productName].some((v) => String(v).toLowerCase().includes(q))
    );
  }, [levels, search]);

  const stats = [
    { label: "Products", value: summary?.productCount ?? 0 },
    { label: "Total On Hand", value: summary?.totalOnHand ?? 0 },
    { label: "Total Value", value: (summary?.totalValue ?? 0).toLocaleString() },
    { label: "Low Stock", value: summary?.lowStockCount ?? 0 },
  ];

  return (
    <ModulePageShell
      title="Stock Reports"
      subtitle="Snapshot of on-hand balances and availability."
      stats={stats}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search..."
      onRefresh={load}
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
          <p className="text-sm">Loading stock report...</p>
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
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Available</th>
                <th className="px-4 py-3 font-medium">Reserved</th>
                <th className="px-4 py-3 font-medium">On Hand</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium text-slate-900">{row.productCode}</td>
                  <td className="px-4 py-3 text-slate-700">{row.productName}</td>
                  <td className="px-4 py-3 text-slate-700">{row.quantityAvailable}</td>
                  <td className="px-4 py-3 text-slate-700">{row.quantityReserved}</td>
                  <td className="px-4 py-3 text-slate-700">{row.quantityOnHand}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={99} className="px-4 py-8 text-center text-slate-400">
                    No stock levels found.
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
