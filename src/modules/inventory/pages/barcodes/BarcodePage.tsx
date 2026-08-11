import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { ModulePageShell } from "@/shared/components/ModulePageShell";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { showToast } from "@/shared/layout/layout";
import { barcodeApi } from "@/modules/inventory/services/barcode.api";
import type { BarcodeProduct } from "@/modules/inventory/types/barcode.types";

export default function BarcodePage() {
  const [search, setSearch] = useState("");
  const [scanValue, setScanValue] = useState("");
  const [rows, setRows] = useState<BarcodeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await barcodeApi.getAll();
      setRows(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const message = err?.message || "Failed to load barcodes";
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

  const handleGenerate = useCallback(async () => {
    const productId = window.prompt("Product ID to generate a barcode for?");
    if (!productId) return;
    const custom = window.prompt("Custom barcode (leave blank to auto-generate)?") || undefined;
    try {
      const result = await barcodeApi.generate(productId, { barcode: custom ?? null });
      showToast.success(`Barcode ${result.barcode} assigned to ${result.name}`);
      load();
    } catch (err: any) {
      showToast.error(err?.message || "Failed to generate barcode");
    }
  }, [load]);

  const handleScan = useCallback(async () => {
    const code = scanValue.trim();
    if (!code) return;
    try {
      const result = await barcodeApi.scan(code);
      showToast.success(`Found: ${result.name} (${result.sku})`);
      setSearch(code);
    } catch (err: any) {
      showToast.error(err?.message || "No product found for that barcode");
    }
  }, [scanValue]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      [row.barcode ?? "", row.sku, row.name].some((v) => String(v).toLowerCase().includes(q))
    );
  }, [rows, search]);

  const stats = [
    { label: "Records", value: rows.length },
    { label: "Showing", value: filtered.length },
  ];

  return (
    <ModulePageShell
      title="Barcode Management"
      subtitle="Map barcodes and labels to inventory SKUs."
      stats={stats}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search barcodes..."
      onRefresh={load}
      primaryActionLabel="Generate Barcode"
      onPrimaryAction={handleGenerate}
      filters={
        <div className="flex gap-2">
          <Input
            value={scanValue}
            onChange={(e) => setScanValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleScan();
            }}
            placeholder="Scan barcode..."
            className="w-48"
          />
          <Button variant="outline" onClick={handleScan}>
            Scan
          </Button>
        </div>
      }
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm">Loading barcodes...</p>
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
                <th className="px-4 py-3 font-medium">Barcode</th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.productId} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium text-slate-900">{row.barcode || "—"}</td>
                  <td className="px-4 py-3 text-slate-700">{row.sku}</td>
                  <td className="px-4 py-3 text-slate-700">{row.name}</td>
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
      )}
    </ModulePageShell>
  );
}
