import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { ModulePageShell, StatusBadge } from "@/shared/components/ModulePageShell";
import { Button } from "@/shared/components/ui/button";
import { showToast } from "@/shared/layout/layout";
import { productApi, categoryApi, unitApi } from "@/modules/inventory/services/catalog.api";
import { stockApi } from "@/modules/inventory/services/stock.api";
import { warehouseApi } from "@/modules/inventory/services/warehouse.api";
import type { Product } from "@/modules/inventory/types/catalog.types";

type ProductRow = Product & {
  categoryName: string;
  unitSymbol: string;
  qtyOnHand: number | null;
  warehouseLabel: string;
};

export default function ProductList() {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Core catalog data is required for the list to render.
      const [products, categories, units] = await Promise.all([
        productApi.getAll(),
        categoryApi.getAll(),
        unitApi.getAll(),
      ]);

      const categoryById = new Map(categories.map((c) => [c.id, c.name]));
      const unitById = new Map(units.map((u) => [u.id, u.symbol]));

      // Enrich with on-hand / warehouse info. These are best-effort: a failure
      // here (e.g. permissions) should not break the product list.
      let levelsByProduct = new Map<string, number>();
      let warehousesByProduct = new Map<string, Set<string>>();
      let warehouseCodeById = new Map<string, string>();
      try {
        const [levels, warehouses] = await Promise.all([
          stockApi.getLevels(),
          warehouseApi.getAll(),
        ]);
        warehouseCodeById = new Map(warehouses.map((w) => [w.id, w.code]));
        for (const lvl of levels) {
          levelsByProduct.set(
            lvl.productId,
            (levelsByProduct.get(lvl.productId) ?? 0) + (lvl.quantityOnHand ?? 0)
          );
          if (!warehousesByProduct.has(lvl.productId)) {
            warehousesByProduct.set(lvl.productId, new Set());
          }
          warehousesByProduct.get(lvl.productId)!.add(lvl.warehouseId);
        }
      } catch {
        // Leave enrichment maps empty; on-hand/warehouse render as "—".
      }

      const enriched: ProductRow[] = products.map((p) => {
        const warehouseIds = warehousesByProduct.get(p.id);
        let warehouseLabel = "—";
        if (warehouseIds && warehouseIds.size === 1) {
          const only = [...warehouseIds][0];
          warehouseLabel = warehouseCodeById.get(only) ?? only;
        } else if (warehouseIds && warehouseIds.size > 1) {
          warehouseLabel = `${warehouseIds.size} locations`;
        }
        return {
          ...p,
          categoryName: categoryById.get(p.categoryId) ?? "—",
          unitSymbol: unitById.get(p.unitId) ?? "—",
          qtyOnHand: levelsByProduct.has(p.id) ? levelsByProduct.get(p.id)! : null,
          warehouseLabel,
        };
      });

      setRows(enriched);
    } catch (err: any) {
      const message = err?.message || "Failed to load products";
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

  const handleDelete = useCallback(
    async (id: string, name: string) => {
      if (!window.confirm(`Delete product "${name}"? This cannot be undone.`)) return;
      try {
        await productApi.remove(id);
        showToast.success("Product deleted");
        load();
      } catch (err: any) {
        showToast.error(err?.message || "Failed to delete product");
      }
    },
    [load]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      [row.sku, row.name, row.categoryName, row.unitSymbol, row.warehouseLabel].some((v) =>
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
      title="Products"
      subtitle="Maintain SKUs, stock on hand, reorder levels, and costing."
      stats={stats}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search..."
      onRefresh={load}
      primaryActionLabel="Add Product"
      onPrimaryAction={() => {
        // TODO: wire up a product create/edit form (no form UI exists on this page yet).
        showToast.info("Product creation form is not available yet.");
      }}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm">Loading products...</p>
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
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">On Hand</th>
                <th className="px-4 py-3 font-medium">UOM</th>
                <th className="px-4 py-3 font-medium">Reorder</th>
                <th className="px-4 py-3 font-medium">Warehouse</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium text-slate-900">{row.sku}</td>
                  <td className="px-4 py-3 text-slate-700">{row.name}</td>
                  <td className="px-4 py-3 text-slate-700">{row.categoryName}</td>
                  <td className="px-4 py-3 text-slate-700">{row.qtyOnHand ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-700">{row.unitSymbol}</td>
                  <td className="px-4 py-3 text-slate-700">{row.reorderLevel ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-700">{row.warehouseLabel}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={row.isActive ? "Active" : "Inactive"}
                      tone={row.isActive ? "success" : "neutral"}
                    />
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
                        onClick={() => handleDelete(row.id, row.name)}
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
