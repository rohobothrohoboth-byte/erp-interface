import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { ModulePageShell } from "@/shared/components/ModulePageShell";
import { Button } from "@/shared/components/ui/button";
import { showToast } from "@/shared/layout/layout";
import { valuationApi } from "@/modules/inventory/services/valuation.api";
import { warehouseApi } from "@/modules/inventory/services/warehouse.api";
import type { ValuationReport } from "@/modules/inventory/types/valuation.types";
import type { Warehouse } from "@/modules/inventory/types/warehouse.types";

export default function ValuationReportPage() {
  const [search, setSearch] = useState("");
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehouseId, setWarehouseId] = useState<string>("");
  const [report, setReport] = useState<ValuationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await valuationApi.getReport(warehouseId ? { warehouseId } : {});
      setReport(data ?? null);
    } catch (err: any) {
      const message = err?.message || "Failed to load valuation report";
      setError(message);
      showToast.error(message);
      setReport(null);
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

  const lines = report?.lines ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return lines;
    return lines.filter((line) =>
      [line.productName ?? "", line.productId].some((v) => String(v).toLowerCase().includes(q))
    );
  }, [lines, search]);

  const stats = [
    { label: "Method", value: report?.method ?? "—" },
    { label: "Total Qty", value: report?.totalQuantity ?? 0 },
    { label: "Total Value", value: (report?.totalValue ?? 0).toLocaleString() },
  ];

  return (
    <ModulePageShell
      title="Valuation Report"
      subtitle="On-hand inventory value by product and warehouse."
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
          <p className="text-sm">Loading valuation report...</p>
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
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">On Hand</th>
                <th className="px-4 py-3 font-medium">Avg Cost</th>
                <th className="px-4 py-3 font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((line) => (
                <tr
                  key={`${line.productId}-${line.warehouseId}`}
                  className="border-t border-slate-100 hover:bg-slate-50/80"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {line.productName || line.productId}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{line.quantityOnHand}</td>
                  <td className="px-4 py-3 text-slate-700">{line.averageCost.toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-700">{line.value.toLocaleString()}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={99} className="px-4 py-8 text-center text-slate-400">
                    No valuation data found.
                  </td>
                </tr>
              )}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr className="border-t border-slate-200 bg-slate-50 font-medium text-slate-900">
                  <td className="px-4 py-3">Total</td>
                  <td className="px-4 py-3">{report?.totalQuantity ?? 0}</td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3">{(report?.totalValue ?? 0).toLocaleString()}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </ModulePageShell>
  );
}
