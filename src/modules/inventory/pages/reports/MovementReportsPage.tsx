import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { ModulePageShell } from "@/shared/components/ModulePageShell";
import { Button } from "@/shared/components/ui/button";
import { showToast } from "@/shared/layout/layout";
import { invAnalyticsApi } from "@/modules/inventory/services/analytics.api";
import { stockApi } from "@/modules/inventory/services/stock.api";
import type { MovementAnalysis } from "@/modules/inventory/types/analytics.types";
import type { StockMovement } from "@/modules/inventory/types/stock.types";

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
}

export default function MovementReportsPage() {
  const [search, setSearch] = useState("");
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [analysis, setAnalysis] = useState<MovementAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [movementData, analysisData] = await Promise.all([
        stockApi.getMovements(),
        invAnalyticsApi.getMovement().catch(() => null),
      ]);
      setMovements(Array.isArray(movementData) ? movementData : []);
      setAnalysis(analysisData ?? null);
    } catch (err: any) {
      const message = err?.message || "Failed to load movement report";
      setError(message);
      showToast.error(message);
      setMovements([]);
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return movements;
    return movements.filter((row) =>
      [row.type, row.productName ?? "", row.reference ?? "", row.status].some((v) =>
        String(v).toLowerCase().includes(q)
      )
    );
  }, [movements, search]);

  const stats = [
    { label: "Movements", value: movements.length },
    { label: "Fast Movers", value: analysis?.fastMovers?.length ?? 0 },
    { label: "Slow Movers", value: analysis?.slowMovers?.length ?? 0 },
  ];

  return (
    <ModulePageShell
      title="Movement Reports"
      subtitle="Audit stock in/out/transfer/adjustment history."
      stats={stats}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search..."
      onRefresh={load}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm">Loading movement report...</p>
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
        <div className="space-y-4">
          {analysis && (analysis.fastMovers?.length || analysis.slowMovers?.length) ? (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="mb-2 text-sm font-medium text-slate-700">Fast Movers</div>
                <ul className="space-y-1 text-sm text-slate-600">
                  {(analysis.fastMovers ?? []).slice(0, 5).map((m) => (
                    <li key={m.productId} className="flex justify-between">
                      <span>{m.productName || m.productId}</span>
                      <span className="text-slate-400">{m.totalQuantity}</span>
                    </li>
                  ))}
                  {(analysis.fastMovers?.length ?? 0) === 0 && (
                    <li className="text-slate-400">None</li>
                  )}
                </ul>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="mb-2 text-sm font-medium text-slate-700">Slow Movers</div>
                <ul className="space-y-1 text-sm text-slate-600">
                  {(analysis.slowMovers ?? []).slice(0, 5).map((m) => (
                    <li key={m.productId} className="flex justify-between">
                      <span>{m.productName || m.productId}</span>
                      <span className="text-slate-400">{m.totalQuantity}</span>
                    </li>
                  ))}
                  {(analysis.slowMovers?.length ?? 0) === 0 && (
                    <li className="text-slate-400">None</li>
                  )}
                </ul>
              </div>
            </div>
          ) : null}
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Reference</th>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Qty</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {formatDate(row.movementDate)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{row.type}</td>
                    <td className="px-4 py-3 text-slate-700">{row.reference || "—"}</td>
                    <td className="px-4 py-3 text-slate-700">{row.productName || row.productId}</td>
                    <td className="px-4 py-3 text-slate-700">{row.quantity}</td>
                    <td className="px-4 py-3 text-slate-700">{row.status}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={99} className="px-4 py-8 text-center text-slate-400">
                      No movements found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ModulePageShell>
  );
}
