import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { ModulePageShell } from "@/shared/components/ModulePageShell";
import { Button } from "@/shared/components/ui/button";
import { showToast } from "@/shared/layout/layout";
import { invAnalyticsApi } from "@/modules/inventory/services/analytics.api";
import type { Forecast } from "@/modules/inventory/types/analytics.types";

export default function DemandForecastPage() {
  const [search, setSearch] = useState("");
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await invAnalyticsApi.getForecast();
      setForecast(data ?? null);
    } catch (err: any) {
      const message = err?.message || "Failed to load demand forecast";
      setError(message);
      showToast.error(message);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const items = forecast?.items ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      [item.productName ?? "", item.productId].some((v) => String(v).toLowerCase().includes(q))
    );
  }, [items, search]);

  const stats = [
    { label: "Products", value: items.length },
    { label: "Months Analyzed", value: forecast?.monthsAnalyzed ?? 0 },
  ];

  return (
    <ModulePageShell
      title="Demand Forecast"
      subtitle="Forecast demand to drive purchase and production planning."
      stats={stats}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search..."
      onRefresh={load}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm">Loading demand forecast...</p>
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
                <th className="px-4 py-3 font-medium">Avg Monthly Out</th>
                <th className="px-4 py-3 font-medium">Projected Next Month</th>
                <th className="px-4 py-3 font-medium">On Hand</th>
                <th className="px-4 py-3 font-medium">Projected EoM On Hand</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.productId} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {item.productName || item.productId}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{item.averageMonthlyOutbound}</td>
                  <td className="px-4 py-3 text-slate-700">{item.projectedNextMonthOutbound}</td>
                  <td className="px-4 py-3 text-slate-700">{item.currentOnHand}</td>
                  <td className="px-4 py-3 text-slate-700">{item.projectedEndOfMonthOnHand}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={99} className="px-4 py-8 text-center text-slate-400">
                    No forecast data found.
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
