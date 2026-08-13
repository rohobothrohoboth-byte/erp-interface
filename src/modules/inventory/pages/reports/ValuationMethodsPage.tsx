import { useCallback, useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { ModulePageShell } from "@/shared/components/ModulePageShell";
import { Button } from "@/shared/components/ui/button";
import { showToast } from "@/shared/layout/layout";
import { valuationApi } from "@/modules/inventory/services/valuation.api";
import type { ValuationMethodValue } from "@/modules/inventory/types/valuation.types";

const METHOD_OPTIONS: { value: ValuationMethodValue; label: string }[] = [
  { value: "AVG", label: "Weighted Average (AVG)" },
  { value: "FIFO", label: "First In, First Out (FIFO)" },
  { value: "LIFO", label: "Last In, First Out (LIFO)" },
];

export default function ValuationMethodsPage() {
  const [method, setMethod] = useState<ValuationMethodValue>("AVG");
  const [saved, setSaved] = useState<ValuationMethodValue>("AVG");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await valuationApi.getMethod();
      const current = data?.method || "AVG";
      setMethod(current);
      setSaved(current);
    } catch (err: any) {
      const message = err?.message || "Failed to load valuation method";
      setError(message);
      showToast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const data = await valuationApi.setMethod({ method });
      const current = data?.method || method;
      setSaved(current);
      setMethod(current);
      showToast.success("Valuation method saved");
    } catch (err: any) {
      showToast.error(err?.message || "Failed to save valuation method");
    } finally {
      setSaving(false);
    }
  }, [method]);

  const knownOption = METHOD_OPTIONS.some((o) => o.value === saved);

  return (
    <ModulePageShell
      title="Valuation Methods"
      subtitle="Configure FIFO, weighted average, and standard cost policies."
      stats={[{ label: "Active Method", value: saved }]}
      onRefresh={load}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm">Loading valuation method...</p>
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
        <div className="max-w-md space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Inventory valuation method
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
            >
              {METHOD_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
              {!knownOption && <option value={saved}>{saved}</option>}
            </select>
            <p className="mt-1 text-xs text-slate-500">
              This method is used to value on-hand inventory across all warehouses.
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving || method === saved}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {saving ? "Saving..." : "Save Method"}
          </Button>
        </div>
      )}
    </ModulePageShell>
  );
}
