import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, AlertCircle, AlertTriangle } from "lucide-react";
import { ModulePageShell, StatusBadge } from "@/shared/components/ModulePageShell";
import { Button } from "@/shared/components/ui/button";
import { showToast } from "@/shared/layout/layout";
import { reorderApi } from "@/modules/inventory/services/reorder.api";
import { productApi } from "@/modules/inventory/services/catalog.api";
import type { ReorderRule, ReorderAlert } from "@/modules/inventory/types/reorder.types";
import type { Product } from "@/modules/inventory/types/catalog.types";

function pickProduct(products: Product[]): Product | null {
  if (products.length === 0) {
    showToast.error("No products available");
    return null;
  }
  const menu = products.map((p, i) => `${i + 1}) ${p.sku} - ${p.name}`).join("\n");
  const choice = window.prompt(`Select product:\n${menu}`);
  if (!choice) return null;
  const product = products[Number(choice) - 1];
  if (!product) {
    showToast.error("Invalid product selection");
    return null;
  }
  return product;
}

export default function ReorderLevelsPage() {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<ReorderRule[]>([]);
  const [alerts, setAlerts] = useState<ReorderAlert[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [levels, alertList] = await Promise.all([
        reorderApi.getLevels(),
        reorderApi.getAlerts(),
      ]);
      setRows(Array.isArray(levels) ? levels : []);
      setAlerts(Array.isArray(alertList) ? alertList : []);
    } catch (err: any) {
      const message = err?.message || "Failed to load reorder levels";
      setError(message);
      showToast.error(message);
      setRows([]);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    productApi
      .getAll()
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]));
  }, [load]);

  const handleCreate = useCallback(async () => {
    const product = pickProduct(products);
    if (!product) return;
    const min = Number(window.prompt("Minimum level?", "0"));
    if (Number.isNaN(min)) return;
    const max = Number(window.prompt("Maximum level?", "0"));
    if (Number.isNaN(max)) return;
    const reorderQuantity = Number(window.prompt("Reorder quantity?", "0"));
    if (Number.isNaN(reorderQuantity)) return;
    try {
      await reorderApi.createLevel({
        productId: product.id,
        productName: product.name,
        minLevel: min,
        maxLevel: max,
        reorderQuantity,
        isActive: true,
      });
      showToast.success("Reorder rule created");
      load();
    } catch (err: any) {
      showToast.error(err?.message || "Failed to create rule");
    }
  }, [products, load]);

  const handleEdit = useCallback(
    async (rule: ReorderRule) => {
      const min = Number(window.prompt("Minimum level?", String(rule.minLevel)));
      if (Number.isNaN(min)) return;
      const max = Number(window.prompt("Maximum level?", String(rule.maxLevel)));
      if (Number.isNaN(max)) return;
      const reorderQuantity = Number(
        window.prompt("Reorder quantity?", String(rule.reorderQuantity))
      );
      if (Number.isNaN(reorderQuantity)) return;
      try {
        await reorderApi.updateLevel(rule.id, {
          id: rule.id,
          minLevel: min,
          maxLevel: max,
          reorderQuantity,
        });
        showToast.success("Reorder rule updated");
        load();
      } catch (err: any) {
        showToast.error(err?.message || "Failed to update rule");
      }
    },
    [load]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      [row.productName ?? "", row.productId].some((v) => String(v).toLowerCase().includes(q))
    );
  }, [rows, search]);

  const stats = [
    { label: "Rules", value: rows.length },
    { label: "Alerts", value: alerts.length },
  ];

  return (
    <ModulePageShell
      title="Reorder Levels"
      subtitle="Maintain min/max and safety stock thresholds."
      stats={stats}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search..."
      onRefresh={load}
      primaryActionLabel="Add Rule"
      onPrimaryAction={handleCreate}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm">Loading reorder levels...</p>
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
          {alerts.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-amber-800">
                <AlertTriangle className="h-4 w-4" />
                {alerts.length} product{alerts.length === 1 ? "" : "s"} below reorder level
              </div>
              <ul className="space-y-1 text-sm text-amber-800">
                {alerts.map((a) => (
                  <li key={`${a.productId}-${a.warehouseId}`}>
                    {a.productName || a.productId}: {a.quantityOnHand} on hand (reorder at{" "}
                    {a.reorderLevel})
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Min</th>
                  <th className="px-4 py-3 font-medium">Max</th>
                  <th className="px-4 py-3 font-medium">Reorder Qty</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {row.productName || row.productId}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{row.minLevel}</td>
                    <td className="px-4 py-3 text-slate-700">{row.maxLevel}</td>
                    <td className="px-4 py-3 text-slate-700">{row.reorderQuantity}</td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={row.isActive ? "Active" : "Inactive"}
                        tone={row.isActive ? "success" : "neutral"}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(row)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={99} className="px-4 py-8 text-center text-slate-400">
                      No reorder rules found.
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
