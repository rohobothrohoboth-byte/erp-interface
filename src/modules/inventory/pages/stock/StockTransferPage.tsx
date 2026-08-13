import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Loader2, AlertCircle, ArrowLeftRight } from "lucide-react";
import { ModulePageShell, StatusBadge } from "@/shared/components/ModulePageShell";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { showToast } from "@/shared/layout/layout";
import { stockApi } from "@/modules/inventory/services/stock.api";
import { productApi } from "@/modules/inventory/services/catalog.api";
import { warehouseApi } from "@/modules/inventory/services/warehouse.api";
import type { StockMovement } from "@/modules/inventory/types/stock.types";
import type { Product } from "@/modules/inventory/types/catalog.types";
import type { Warehouse } from "@/modules/inventory/types/warehouse.types";

const statusTone = (status: string): "success" | "warning" | "danger" | "info" | "neutral" => {
  const s = (status || "").toLowerCase();
  if (["posted", "completed", "approved", "done"].includes(s)) return "success";
  if (["draft", "pending"].includes(s)) return "warning";
  if (["cancelled", "rejected", "failed"].includes(s)) return "danger";
  return "neutral";
};

const formatDate = (date?: string | null): string => {
  if (!date) return "—";
  try {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
};

const emptyForm = {
  productId: "",
  warehouseId: "",
  toWarehouseId: "",
  quantity: "1",
  reference: "",
  notes: "",
};

export default function StockTransferPage() {
  const [search, setSearch] = useState("");
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);

  const productMap = useMemo(() => {
    const map: Record<string, Product> = {};
    products.forEach((p) => (map[p.id] = p));
    return map;
  }, [products]);

  const warehouseMap = useMemo(() => {
    const map: Record<string, Warehouse> = {};
    warehouses.forEach((w) => (map[w.id] = w));
    return map;
  }, [warehouses]);

  const productLabel = (id: string): string => {
    const p = productMap[id];
    if (!p) return id;
    return p.sku ? `${p.name} (${p.sku})` : p.name;
  };

  const warehouseLabel = (id?: string | null): string => {
    if (!id) return "—";
    const w = warehouseMap[id];
    if (!w) return id;
    return w.code ? `${w.name} (${w.code})` : w.name;
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [moves, prods, whs] = await Promise.all([
        stockApi.getMovements({ type: "Transfer" }),
        productApi.getAll().catch(() => [] as Product[]),
        warehouseApi.getAll().catch(() => [] as Warehouse[]),
      ]);
      setMovements(Array.isArray(moves) ? moves : []);
      setProducts(Array.isArray(prods) ? prods.filter((p) => p.isActive !== false) : []);
      setWarehouses(Array.isArray(whs) ? whs : []);
    } catch (err: any) {
      const message = err?.message || "Failed to load stock transfer movements";
      setError(message);
      showToast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const rows = useMemo(() => {
    return movements.map((m) => ({
      id: m.id,
      reference: m.reference || m.id,
      sku: productMap[m.productId]?.sku || "—",
      productName: m.productName || productMap[m.productId]?.name || m.productId,
      qty: m.quantity,
      route: `${warehouseLabel(m.warehouseId)} → ${warehouseLabel(m.toWarehouseId)}`,
      date: formatDate(m.movementDate || m.dateAdd),
      status: m.status || "—",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movements, productMap, warehouseMap]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      Object.values(row).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [rows, search]);

  const stats = [
    { label: "Records", value: movements.length },
    { label: "Showing", value: filtered.length },
  ];

  const openDialog = () => {
    setForm({ ...emptyForm });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.productId) return showToast.error("Please select a product");
    if (!form.warehouseId) return showToast.error("Please select a source warehouse");
    if (!form.toWarehouseId) return showToast.error("Please select a destination warehouse");
    if (form.warehouseId === form.toWarehouseId)
      return showToast.error("Source and destination warehouses must differ");
    const qty = Number(form.quantity);
    if (!qty || qty <= 0) return showToast.error("Please enter a valid quantity");
    setSubmitting(true);
    try {
      await stockApi.transfer({
        productId: form.productId,
        warehouseId: form.warehouseId,
        toWarehouseId: form.toWarehouseId,
        quantity: qty,
        reference: form.reference.trim() || null,
        notes: form.notes.trim() || null,
      });
      showToast.success("Stock transfer posted");
      setDialogOpen(false);
      await loadData();
    } catch (err: any) {
      showToast.error(err?.message || "Failed to post stock transfer");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModulePageShell
      title="Stock Transfer"
      subtitle="Post and track stock transfer movements across warehouses."
      stats={stats}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search..."
      onRefresh={loadData}
      primaryActionLabel="New Stock Transfer"
      onPrimaryAction={openDialog}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm">Loading stock transfer movements...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="mb-3 h-10 w-10 text-rose-400" />
          <p className="text-sm font-medium text-slate-700">{error}</p>
          <Button variant="outline" className="mt-4" onClick={loadData}>
            Try again
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Qty</th>
                <th className="px-4 py-3 font-medium">Route</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={String(row.id)} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium text-slate-900">{row.reference}</td>
                  <td className="px-4 py-3 text-slate-700">{row.sku}</td>
                  <td className="px-4 py-3 text-slate-700">{row.productName}</td>
                  <td className="px-4 py-3 text-slate-700">{row.qty}</td>
                  <td className="px-4 py-3 text-slate-700">{row.route}</td>
                  <td className="px-4 py-3 text-slate-700">{row.date}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={String(row.status)} tone={statusTone(String(row.status))} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={99} className="px-4 py-12 text-center text-slate-400">
                    <ArrowLeftRight className="mx-auto mb-2 h-10 w-10 text-slate-300" />
                    <p className="text-sm font-medium text-slate-500">No stock transfers</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Post your first stock transfer using the button above.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Stock Transfer</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="product">Product</Label>
              <Select value={form.productId} onValueChange={(v) => setForm((f) => ({ ...f, productId: v }))}>
                <SelectTrigger id="product" className="w-full">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-slate-400">No products available</div>
                  ) : (
                    products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {productLabel(p.id)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="fromWarehouse">From Warehouse</Label>
                <Select value={form.warehouseId} onValueChange={(v) => setForm((f) => ({ ...f, warehouseId: v }))}>
                  <SelectTrigger id="fromWarehouse" className="w-full">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-slate-400">No warehouses available</div>
                    ) : (
                      warehouses.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {warehouseLabel(w.id)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="toWarehouse">To Warehouse</Label>
                <Select value={form.toWarehouseId} onValueChange={(v) => setForm((f) => ({ ...f, toWarehouseId: v }))}>
                  <SelectTrigger id="toWarehouse" className="w-full">
                    <SelectValue placeholder="Destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-slate-400">No warehouses available</div>
                    ) : (
                      warehouses.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {warehouseLabel(w.id)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  value={form.quantity}
                  onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reference">Reference (optional)</Label>
                <Input
                  id="reference"
                  value={form.reference}
                  onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Post Transfer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </ModulePageShell>
  );
}
