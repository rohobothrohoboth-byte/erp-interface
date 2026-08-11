import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Truck,
  ClipboardCheck,
  User,
} from "lucide-react";
import { ModulePageShell, StatusBadge } from "@/shared/components/ModulePageShell";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { showToast } from "@/shared/layout/layout";
import { materialsApi } from "@/modules/inventory/services/materials.api";
import { productApi } from "@/modules/inventory/services/catalog.api";
import type { MaterialRequest } from "@/modules/inventory/types/materials.types";
import type { Product } from "@/modules/inventory/types/catalog.types";

type DecisionKind = "approve" | "reject";

const statusTone = (status: string): "success" | "warning" | "danger" | "info" | "neutral" => {
  const s = (status || "").toLowerCase();
  if (s === "approved" || s === "issued") return "success";
  if (s === "rejected") return "danger";
  if (s === "pending") return "warning";
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

export default function MaterialRequestsAdminPage() {
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [actingId, setActingId] = useState<string | null>(null);

  const [decision, setDecision] = useState<{ kind: DecisionKind; request: MaterialRequest } | null>(
    null
  );
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [reqs, prods] = await Promise.all([
        materialsApi.getAllRequests(),
        productApi.getAll().catch(() => [] as Product[]),
      ]);
      const map: Record<string, Product> = {};
      (prods || []).forEach((p) => {
        map[p.id] = p;
      });
      setProducts(map);
      setRequests(Array.isArray(reqs) ? reqs : []);
    } catch (err: any) {
      const message = err?.message || "Failed to load material requests";
      setError(message);
      showToast.error(message);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const productLabel = useCallback(
    (id: string): string => {
      const product = products[id];
      if (!product) return id;
      return product.sku ? `${product.name} (${product.sku})` : product.name;
    },
    [products]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter((row) =>
      [
        row.employeeName ?? "",
        productLabel(row.productId),
        row.status,
        row.reason ?? "",
      ].some((v) => String(v).toLowerCase().includes(q))
    );
  }, [requests, search, productLabel]);

  const stats = useMemo(() => {
    const pending = requests.filter((r) => (r.status || "").toLowerCase() === "pending").length;
    const approved = requests.filter((r) => (r.status || "").toLowerCase() === "approved").length;
    const issued = requests.filter((r) => (r.status || "").toLowerCase() === "issued").length;
    return [
      { label: "Total", value: requests.length },
      { label: "Pending", value: pending },
      { label: "Approved", value: approved },
      { label: "Issued", value: issued },
    ];
  }, [requests]);

  const openDecision = (kind: DecisionKind, request: MaterialRequest) => {
    setDecision({ kind, request });
    setNote("");
  };

  const confirmDecision = async () => {
    if (!decision) return;
    const { kind, request } = decision;
    setActingId(request.id);
    try {
      if (kind === "approve") {
        await materialsApi.approveRequest(request.id, { note: note.trim() || null });
        showToast.success("Request approved");
      } else {
        await materialsApi.rejectRequest(request.id, { note: note.trim() || null });
        showToast.success("Request rejected");
      }
      setDecision(null);
      await load();
    } catch (err: any) {
      showToast.error(err?.message || "Action failed");
    } finally {
      setActingId(null);
    }
  };

  const handleIssue = async (request: MaterialRequest) => {
    setActingId(request.id);
    try {
      await materialsApi.issueRequest(request.id);
      showToast.success("Material issued");
      await load();
    } catch (err: any) {
      showToast.error(err?.message || "Failed to issue material");
    } finally {
      setActingId(null);
    }
  };

  return (
    <>
      <ModulePageShell
        title="Material Requests"
        subtitle="Review employee material requests and approve, reject, or issue them."
        stats={stats}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by employee, product, status..."
        onRefresh={load}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-emerald-600" />
            <p className="text-sm">Loading material requests...</p>
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
                  <th className="px-4 py-3 font-medium">Employee</th>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Qty</th>
                  <th className="px-4 py-3 font-medium">Reason</th>
                  <th className="px-4 py-3 font-medium">Requested</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const status = (row.status || "").toLowerCase();
                  const busy = actingId === row.id;
                  return (
                    <tr
                      key={row.id}
                      className="border-t border-slate-100 hover:bg-slate-50/80"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 font-medium text-slate-900">
                          <User className="h-4 w-4 text-slate-400" />
                          {row.employeeName || row.employeeId}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {productLabel(row.productId)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{row.quantity}</td>
                      <td className="px-4 py-3 text-slate-500">{row.reason || "—"}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatDate(row.dateAdd)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={row.status || "—"} tone={statusTone(row.status)} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busy}
                                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                onClick={() => openDecision("approve", row)}
                              >
                                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busy}
                                className="border-rose-200 text-rose-700 hover:bg-rose-50"
                                onClick={() => openDecision("reject", row)}
                              >
                                <XCircle className="mr-1.5 h-4 w-4" />
                                Reject
                              </Button>
                            </>
                          )}
                          {status === "approved" && (
                            <Button
                              size="sm"
                              disabled={busy}
                              className="bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => handleIssue(row)}
                            >
                              {busy ? (
                                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                              ) : (
                                <Truck className="mr-1.5 h-4 w-4" />
                              )}
                              Issue
                            </Button>
                          )}
                          {status !== "pending" && status !== "approved" && (
                            <span className="text-xs text-slate-400">No actions</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={99} className="px-4 py-12 text-center text-slate-400">
                      <ClipboardCheck className="mx-auto mb-2 h-10 w-10 text-slate-300" />
                      <p className="text-sm font-medium text-slate-500">
                        No material requests found
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Employee requests will appear here for review.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </ModulePageShell>

      <Dialog open={!!decision} onOpenChange={(open) => !open && setDecision(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {decision?.kind === "approve" ? "Approve Request" : "Reject Request"}
            </DialogTitle>
            <DialogDescription>
              {decision
                ? `${decision.kind === "approve" ? "Approve" : "Reject"} the request from ${
                    decision.request.employeeName || decision.request.employeeId
                  } for ${productLabel(decision.request.productId)} (qty ${
                    decision.request.quantity
                  }).`
                : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="decision-note">Note (optional)</Label>
            <Textarea
              id="decision-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note for this decision..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDecision(null)}>
              Cancel
            </Button>
            <Button
              disabled={!!actingId}
              className={
                decision?.kind === "approve"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700"
              }
              onClick={confirmDecision}
            >
              {actingId ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : decision?.kind === "approve" ? (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              {decision?.kind === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
