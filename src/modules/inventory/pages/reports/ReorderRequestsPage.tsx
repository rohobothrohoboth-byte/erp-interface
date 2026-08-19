import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { ModulePageShell, StatusBadge } from "@/shared/components/ModulePageShell";
import { Button } from "@/shared/components/ui/button";
import { showToast } from "@/shared/layout/layout";
import { reorderApi } from "@/modules/inventory/services/reorder.api";
import { productApi } from "@/modules/inventory/services/catalog.api";
import { warehouseApi } from "@/modules/inventory/services/warehouse.api";
import type { ReorderRequest } from "@/modules/inventory/types/reorder.types";
import type { Product } from "@/modules/inventory/types/catalog.types";
import type { Warehouse } from "@/modules/inventory/types/warehouse.types";

function statusTone(status: string): "success" | "warning" | "danger" | "neutral" {
  const s = status.toLowerCase();
  if (["approved", "converted", "completed", "done"].includes(s)) return "success";
  if (["pending", "draft", "submitted"].includes(s)) return "warning";
  if (["rejected", "cancelled", "canceled"].includes(s)) return "danger";
  return "neutral";
}

export default function ReorderRequestsPage() {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<ReorderRequest[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reorderApi.getRequests();
      setRows(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const message = err?.message || "Failed to load reorder requests";
      setError(message);
      showToast.error(message);
      setRows([]);
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
    warehouseApi
      .getAll()
      .then((data) => setWarehouses(Array.isArray(data) ? data : []))
      .catch(() => setWarehouses([]));
  }, [load]);

  const handleCreate = useCallback(async () => {
    if (products.length === 0) {
      showToast.error("No products available");
      return;
    }
    const productMenu = products.map((p, i) => `${i + 1}) ${p.sku} - ${p.name}`).join("\n");
    const productChoice = window.prompt(`Select product:\n${productMenu}`);
    if (!productChoice) return;
    const product = products[Number(productChoice) - 1];
    if (!product) {
      showToast.error("Invalid product selection");
      return;
    }

    let warehouseId: string | null = null;
    if (warehouses.length > 0) {
      const whMenu = warehouses.map((w, i) => `${i + 1}) ${w.code} - ${w.name}`).join("\n");
      const whChoice = window.prompt(`Select warehouse (blank to skip):\n${whMenu}`);
      if (whChoice) {
        const wh = warehouses[Number(whChoice) - 1];
        if (!wh) {
          showToast.error("Invalid warehouse selection");
          return;
        }
        warehouseId = wh.id;
      }
    }

    const quantity = Number(window.prompt("Quantity?", "0"));
    if (!quantity || Number.isNaN(quantity)) return;
    const reason = window.prompt("Reason (optional)?") || null;

    try {
      await reorderApi.createRequest({
        productId: product.id,
        productName: product.name,
        warehouseId,
        quantity,
        reason,
      });
      showToast.success("Reorder request created");
      load();
    } catch (err: any) {
      showToast.error(err?.message || "Failed to create request");
    }
  }, [products, warehouses, load]);

  const handleAction = useCallback(
    async (req: ReorderRequest, action: "approve" | "reject" | "convert") => {
      try {
        if (action === "approve") await reorderApi.approveRequest(req.id);
        else if (action === "reject") await reorderApi.rejectRequest(req.id);
        else await reorderApi.convertRequest(req.id);
        showToast.success(`Request ${action}d`);
        load();
      } catch (err: any) {
        showToast.error(err?.message || `Failed to ${action} request`);
      }
    },
    [load]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      [row.productName ?? "", row.productId, row.status, row.reason ?? ""].some((v) =>
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
      title="Reorder Requests"
      subtitle="Suggested and approved replenishment requests."
      stats={stats}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search..."
      onRefresh={load}
      primaryActionLabel="Create Request"
      onPrimaryAction={handleCreate}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm">Loading reorder requests...</p>
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
                <th className="px-4 py-3 font-medium">Qty</th>
                <th className="px-4 py-3 font-medium">Reason</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const s = row.status.toLowerCase();
                const canDecide = ["pending", "draft", "submitted"].includes(s);
                const canConvert = s === "approved";
                return (
                  <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {row.productName || row.productId}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{row.quantity}</td>
                    <td className="px-4 py-3 text-slate-700">{row.reason || "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} tone={statusTone(row.status)} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        {canDecide && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-emerald-600 hover:text-emerald-700"
                              onClick={() => handleAction(row, "approve")}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-rose-600 hover:text-rose-700"
                              onClick={() => handleAction(row, "reject")}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {canConvert && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAction(row, "convert")}
                          >
                            Convert
                          </Button>
                        )}
                        {!canDecide && !canConvert && (
                          <span className="px-2 text-xs text-slate-400">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={99} className="px-4 py-8 text-center text-slate-400">
                    No reorder requests found.
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
