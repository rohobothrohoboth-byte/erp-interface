import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Loader2,
  AlertCircle,
  PackageOpen,
  Boxes,
  Eye,
  Calendar,
  Hash,
  Tag,
} from "lucide-react";
import { ModulePageShell, StatusBadge } from "@/shared/components/ModulePageShell";
import { Button } from "@/shared/components/ui/button";
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
import type { MaterialAssignment } from "@/modules/inventory/types/materials.types";
import type { Product } from "@/modules/inventory/types/catalog.types";

const statusTone = (status: string): "success" | "warning" | "neutral" => {
  const s = (status || "").toLowerCase();
  if (s === "issued" || s === "active") return "success";
  if (s === "returned") return "neutral";
  return "warning";
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

export default function MyMaterialsPage() {
  const [assignments, setAssignments] = useState<MaterialAssignment[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<MaterialAssignment | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [items, productList] = await Promise.all([
        materialsApi.getMyAssignments(),
        productApi.getAll().catch(() => [] as Product[]),
      ]);
      const map: Record<string, Product> = {};
      (productList || []).forEach((p) => {
        map[p.id] = p;
      });
      setProducts(map);
      setAssignments(Array.isArray(items) ? items : []);
    } catch (err: any) {
      const message = err?.message || "Failed to load your materials";
      setError(message);
      showToast.error(message);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const productLabel = useCallback(
    (productId: string): string => {
      const product = products[productId];
      if (!product) return productId;
      return product.sku ? `${product.name} (${product.sku})` : product.name;
    },
    [products]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return assignments;
    return assignments.filter((row) =>
      [productLabel(row.productId), row.status, row.note ?? "", String(row.quantity)]
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [assignments, search, productLabel]);

  const heldCount = useMemo(
    () =>
      assignments.filter((a) => (a.status || "").toLowerCase() !== "returned").length,
    [assignments]
  );

  const totalQty = useMemo(
    () =>
      assignments
        .filter((a) => (a.status || "").toLowerCase() !== "returned")
        .reduce((sum, a) => sum + (Number(a.quantity) || 0), 0),
    [assignments]
  );

  const stats = [
    { label: "Assignments", value: assignments.length },
    { label: "Currently Held", value: heldCount },
    { label: "Total Quantity", value: totalQty },
    { label: "Showing", value: filtered.length },
  ];

  return (
    <>
      <ModulePageShell
        title="My Materials"
        subtitle="Materials currently issued to you. Review what you are holding and its details."
        stats={stats}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by product, status..."
        onRefresh={load}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-emerald-600" />
            <p className="text-sm">Loading your materials...</p>
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
                  <th className="px-4 py-3 font-medium">Quantity</th>
                  <th className="px-4 py-3 font-medium">Issued Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-slate-100 hover:bg-slate-50/80"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {productLabel(row.productId)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{row.quantity}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {formatDate(row.issuedDate)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status || "—"} tone={statusTone(row.status)} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelected(row)}
                      >
                        <Eye className="mr-1.5 h-4 w-4" />
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={99} className="px-4 py-12 text-center text-slate-400">
                      <PackageOpen className="mx-auto mb-2 h-10 w-10 text-slate-300" />
                      <p className="text-sm font-medium text-slate-500">
                        No materials assigned to you
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Materials issued to you will appear here.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </ModulePageShell>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Boxes className="h-5 w-5 text-emerald-600" />
              Material Details
            </DialogTitle>
            <DialogDescription>
              Details for the material currently assigned to you.
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-3 text-sm">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  Product
                </div>
                <div className="mt-1 text-base font-semibold text-slate-900">
                  {productLabel(selected.productId)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-slate-500">
                    <Hash className="h-3.5 w-3.5" />
                    Quantity
                  </div>
                  <div className="mt-1 font-medium text-slate-900">
                    {selected.quantity}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-slate-500">
                    <Tag className="h-3.5 w-3.5" />
                    Status
                  </div>
                  <div className="mt-1">
                    <StatusBadge
                      status={selected.status || "—"}
                      tone={statusTone(selected.status)}
                    />
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-slate-500">
                    <Calendar className="h-3.5 w-3.5" />
                    Issued Date
                  </div>
                  <div className="mt-1 font-medium text-slate-900">
                    {formatDate(selected.issuedDate)}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-slate-500">
                    <Calendar className="h-3.5 w-3.5" />
                    Returned Date
                  </div>
                  <div className="mt-1 font-medium text-slate-900">
                    {formatDate(selected.returnedDate)}
                  </div>
                </div>
              </div>

              {selected.note && (
                <div className="rounded-lg border border-slate-200 p-3">
                  <div className="text-xs uppercase tracking-wide text-slate-500">
                    Note
                  </div>
                  <div className="mt-1 text-slate-700">{selected.note}</div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
