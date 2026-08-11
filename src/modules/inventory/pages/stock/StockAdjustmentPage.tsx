import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Loader2, AlertCircle, SlidersHorizontal } from "lucide-react";
import { ModulePageShell, StatusBadge } from "@/shared/components/ModulePageShell";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";
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
  quantity: "0",
  reason: "",
  notes: "",
  isDelta: true,
};

export default function StockAdjustmentPage() {
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

  const warehouseLabel = (id: string): string => {
    const w = warehouseMap[id];
    if (!w) return id;
    return w.code ? `${w.name} (${w.code})` : w.name;
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [moves, prods, whs] = await Promise.all([
        stockApi.getMovements({ type: "Adjustment" }),
        productApi.getAll().catch(() => [] as Product[]),
        warehouseApi.getAll().catch(() => [] as Warehouse[]),
      ]);
      setMovements(Array.isArray(moves) ? moves : []);
      setProducts(Array.isArray(prods) ? prods.filter((p) => p.isActive !== false) : []);
      setWarehouses(Array.isArray(whs) ? whs : []);
    } catch (err: any) {
      const message = err?.message || "Failed to load stock adjustments";
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
      reason: m.reason || "—",
      warehouse: warehouseLabel(m.warehouseId),
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
    if (!form.warehouseId) return showToast.error("Please select a warehouse");
    const qty = Number(form.quantity);
    if (Number.isNaN(qty)) return showToast.error("Please enter a valid quantity");
    if (!form.isDelta && qty < 0)
      return showToast.error("A set quantity cannot be negative");
    setSubmitting(true);
    try {
      await stockApi.adjustment({
        productId: form.productId,
        warehouseId: form.warehouseId,
        quantity: qty,
        isDelta: form.isDelta,
        reason: form.reason.trim() || null,
        notes: form.notes.trim() || null,
      });
      showToast.success("Stock adjustment posted");
      setDialogOpen(false);
      await loadData();
    } catch (err: any) {
      showToast.error(err?.message || "Failed to post stock adjustment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModulePageShell
      title="Stock Adjustment"
      subtitle="Post and track stock adjustment movements across warehouses."
      stats={stats}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search..."
      onRefresh={loadData}
      primaryActionLabel="New Stock Adjustment"
      onPrimaryAction={openDialog}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm">Loading stock adjustments...</p>
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
                <th className="px-4 py-3 font-medium">Reason</th>
                <th className="px-4 py-3 font-medium">Warehouse</th>
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
                  <td className="px-4 py-3 text-slate-700">{row.reason}</td>
                  <td className="px-4 py-3 text-slate-700">{row.warehouse}</td>
                  <td className="px-4 py-3 text-slate-700">{row.date}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={String(row.status)} tone={statusTone(String(row.status))} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={99} className="px-4 py-12 text-center text-slate-400">
                    <SlidersHorizontal className="mx-auto mb-2 h-10 w-10 text-slate-300" />
                    <p className="text-sm font-medium text-slate-500">No stock adjustments</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Post your first stock adjustment using the button above.
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
            <DialogTitle>New Stock Adjustment</DialogTitle>
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

            <div className="space-y-1.5">
              <Label htmlFor="warehouse">Warehouse</Label>
              <Select value={form.warehouseId} onValueChange={(v) => setForm((f) => ({ ...f, warehouseId: v }))}>
                <SelectTrigger id="warehouse" className="w-full">
                  <SelectValue placeholder="Select a warehouse" />
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

            <div className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2">
              <div>
                <Label htmlFor="isDelta" className="cursor-pointer">
                  Delta adjustment
                </Label>
                <p className="text-xs text-slate-400">
                  {form.isDelta
                    ? "Quantity is added to (or subtracted from) the current level."
                    : "Quantity sets the absolute stock level."}
                </p>
              </div>
              <Switch
                id="isDelta"
                checked={form.isDelta}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isDelta: v }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="quantity">{form.isDelta ? "Quantity change (+/-)" : "New quantity"}</Label>
              <Input
                id="quantity"
                type="number"
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                value={form.reason}
                onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                placeholder="e.g. Cycle count correction, damage"
              />
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
                Post Adjustment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </ModulePageShell>
  );
}
