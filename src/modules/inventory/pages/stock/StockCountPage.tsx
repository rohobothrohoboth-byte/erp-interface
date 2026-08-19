import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Loader2, AlertCircle, ClipboardCheck } from "lucide-react";
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
import { stockCountApi } from "@/modules/inventory/services/stock.api";
import { warehouseApi } from "@/modules/inventory/services/warehouse.api";
import type { StockCount } from "@/modules/inventory/types/stock.types";
import type { Warehouse } from "@/modules/inventory/types/warehouse.types";

const statusTone = (status: string): "success" | "warning" | "danger" | "info" | "neutral" => {
  const s = (status || "").toLowerCase();
  if (["reconciled", "completed", "closed"].includes(s)) return "success";
  if (["draft", "pending", "counting", "inprogress", "in progress"].includes(s)) return "warning";
  if (["cancelled"].includes(s)) return "danger";
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

const isReconciled = (status?: string): boolean =>
  ["reconciled", "completed", "closed"].includes((status || "").toLowerCase());

export default function StockCountPage() {
  const [search, setSearch] = useState("");
  const [counts, setCounts] = useState<StockCount[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ warehouseId: "", scheduledDate: "", notes: "" });
  const [creating, setCreating] = useState(false);

  // Detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<StockCount | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [lineInputs, setLineInputs] = useState<Record<string, string>>({});
  const [savingLines, setSavingLines] = useState(false);
  const [reconciling, setReconciling] = useState(false);

  const warehouseMap = useMemo(() => {
    const map: Record<string, Warehouse> = {};
    warehouses.forEach((w) => (map[w.id] = w));
    return map;
  }, [warehouses]);

  const warehouseLabel = (id: string): string => {
    const w = warehouseMap[id];
    if (!w) return id;
    return w.code ? `${w.name} (${w.code})` : w.name;
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, whs] = await Promise.all([
        stockCountApi.getAll(),
        warehouseApi.getAll().catch(() => [] as Warehouse[]),
      ]);
      setCounts(Array.isArray(list) ? list : []);
      setWarehouses(Array.isArray(whs) ? whs : []);
    } catch (err: any) {
      const message = err?.message || "Failed to load stock counts";
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
    return counts.map((c) => ({
      id: c.id,
      warehouse: c.warehouseName || warehouseLabel(c.warehouseId),
      scheduled: formatDate(c.scheduledDate),
      lines: c.lines?.length ?? 0,
      notes: c.notes || "—",
      status: c.status || "—",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counts, warehouseMap]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      Object.values(row).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [rows, search]);

  const stats = [
    { label: "Records", value: counts.length },
    { label: "Showing", value: filtered.length },
  ];

  const openCreate = () => {
    setCreateForm({ warehouseId: "", scheduledDate: "", notes: "" });
    setCreateOpen(true);
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!createForm.warehouseId) return showToast.error("Please select a warehouse");
    setCreating(true);
    try {
      await stockCountApi.create({
        warehouseId: createForm.warehouseId,
        scheduledDate: createForm.scheduledDate || null,
        notes: createForm.notes.trim() || null,
      });
      showToast.success("Stock count created");
      setCreateOpen(false);
      await loadData();
    } catch (err: any) {
      showToast.error(err?.message || "Failed to create stock count");
    } finally {
      setCreating(false);
    }
  };

  const openDetail = async (id: string) => {
    setDetailOpen(true);
    setDetail(null);
    setLineInputs({});
    setDetailLoading(true);
    try {
      const c = await stockCountApi.getById(id);
      setDetail(c);
      const inputs: Record<string, string> = {};
      (c.lines || []).forEach((l) => {
        inputs[l.productId] = String(l.countedQuantity ?? "");
      });
      setLineInputs(inputs);
    } catch (err: any) {
      showToast.error(err?.message || "Failed to load stock count");
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRecordLines = async () => {
    if (!detail) return;
    const lines = (detail.lines || []).map((l) => ({
      productId: l.productId,
      countedQuantity: Number(lineInputs[l.productId] ?? l.countedQuantity ?? 0) || 0,
    }));
    if (lines.length === 0) return showToast.error("This count has no lines to record");
    setSavingLines(true);
    try {
      const updated = await stockCountApi.recordLines(detail.id, { lines });
      showToast.success("Counted quantities recorded");
      if (updated && updated.id) {
        setDetail(updated);
        const inputs: Record<string, string> = {};
        (updated.lines || []).forEach((l) => {
          inputs[l.productId] = String(l.countedQuantity ?? "");
        });
        setLineInputs(inputs);
      }
      await loadData();
    } catch (err: any) {
      showToast.error(err?.message || "Failed to record counted quantities");
    } finally {
      setSavingLines(false);
    }
  };

  const handleReconcile = async () => {
    if (!detail) return;
    setReconciling(true);
    try {
      const updated = await stockCountApi.reconcile(detail.id);
      showToast.success("Stock count reconciled");
      if (updated && updated.id) setDetail(updated);
      await loadData();
      setDetailOpen(false);
    } catch (err: any) {
      showToast.error(err?.message || "Failed to reconcile stock count");
    } finally {
      setReconciling(false);
    }
  };

  const reconciledDetail = isReconciled(detail?.status);

  return (
    <ModulePageShell
      title="Stock Count"
      subtitle="Schedule stock counts, record counted quantities, and reconcile variances."
      stats={stats}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search..."
      onRefresh={loadData}
      primaryActionLabel="New Stock Count"
      onPrimaryAction={openCreate}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm">Loading stock counts...</p>
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
                <th className="px-4 py-3 font-medium">Warehouse</th>
                <th className="px-4 py-3 font-medium">Scheduled</th>
                <th className="px-4 py-3 font-medium">Lines</th>
                <th className="px-4 py-3 font-medium">Notes</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={String(row.id)} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium text-slate-900">{row.warehouse}</td>
                  <td className="px-4 py-3 text-slate-700">{row.scheduled}</td>
                  <td className="px-4 py-3 text-slate-700">{row.lines}</td>
                  <td className="px-4 py-3 text-slate-500">{row.notes}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={String(row.status)} tone={statusTone(String(row.status))} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => openDetail(String(row.id))}>
                      Open
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={99} className="px-4 py-12 text-center text-slate-400">
                    <ClipboardCheck className="mx-auto mb-2 h-10 w-10 text-slate-300" />
                    <p className="text-sm font-medium text-slate-500">No stock counts</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Create your first stock count using the button above.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Stock Count</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreate}>
            <div className="space-y-1.5">
              <Label htmlFor="warehouse">Warehouse</Label>
              <Select
                value={createForm.warehouseId}
                onValueChange={(v) => setCreateForm((f) => ({ ...f, warehouseId: v }))}
              >
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

            <div className="space-y-1.5">
              <Label htmlFor="scheduledDate">Scheduled date (optional)</Label>
              <Input
                id="scheduledDate"
                type="date"
                value={createForm.scheduledDate}
                onChange={(e) => setCreateForm((f) => ({ ...f, scheduledDate: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={createForm.notes}
                onChange={(e) => setCreateForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating} className="bg-emerald-600 hover:bg-emerald-700">
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Count
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Stock Count
              {detail && (
                <StatusBadge status={detail.status || "—"} tone={statusTone(detail.status || "")} />
              )}
            </DialogTitle>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Loader2 className="mb-3 h-8 w-8 animate-spin text-emerald-600" />
              <p className="text-sm">Loading count...</p>
            </div>
          ) : detail ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-400">Warehouse</div>
                  <div className="text-slate-800">
                    {detail.warehouseName || warehouseLabel(detail.warehouseId)}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-400">Scheduled</div>
                  <div className="text-slate-800">{formatDate(detail.scheduledDate)}</div>
                </div>
              </div>

              <div className="max-h-[45vh] overflow-y-auto rounded-lg border border-slate-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2 font-medium">Product</th>
                      <th className="px-3 py-2 font-medium">System</th>
                      <th className="px-3 py-2 font-medium">Counted</th>
                      <th className="px-3 py-2 font-medium">Variance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detail.lines || []).map((line) => {
                      const counted = Number(
                        lineInputs[line.productId] ?? line.countedQuantity ?? 0
                      );
                      const variance = counted - line.systemQuantity;
                      return (
                        <tr key={line.id || line.productId} className="border-t border-slate-100">
                          <td className="px-3 py-2 text-slate-800">
                            {line.productName || line.productId}
                          </td>
                          <td className="px-3 py-2 text-slate-600">{line.systemQuantity}</td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              className="h-8 w-24"
                              value={lineInputs[line.productId] ?? ""}
                              disabled={reconciledDetail}
                              onChange={(e) =>
                                setLineInputs((prev) => ({
                                  ...prev,
                                  [line.productId]: e.target.value,
                                }))
                              }
                            />
                          </td>
                          <td
                            className={
                              "px-3 py-2 font-medium " +
                              (variance === 0
                                ? "text-slate-500"
                                : variance > 0
                                ? "text-emerald-600"
                                : "text-rose-600")
                            }
                          >
                            {variance > 0 ? `+${variance}` : variance}
                          </td>
                        </tr>
                      );
                    })}
                    {(detail.lines || []).length === 0 && (
                      <tr>
                        <td colSpan={99} className="px-3 py-8 text-center text-slate-400">
                          This count has no lines yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setDetailOpen(false)}>
                  Close
                </Button>
                {!reconciledDetail && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={savingLines || (detail.lines || []).length === 0}
                      onClick={handleRecordLines}
                    >
                      {savingLines && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Counts
                    </Button>
                    <Button
                      type="button"
                      disabled={reconciling}
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={handleReconcile}
                    >
                      {reconciling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Reconcile
                    </Button>
                  </>
                )}
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </ModulePageShell>
  );
}
