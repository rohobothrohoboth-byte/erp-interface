import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Loader2,
  AlertCircle,
  Send,
  ClipboardList,
  PackagePlus,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { StatusBadge } from "@/shared/components/ModulePageShell";
import { showToast } from "@/shared/layout/layout";
import { materialsApi } from "@/modules/inventory/services/materials.api";
import { productApi } from "@/modules/inventory/services/catalog.api";
import type { MaterialRequest } from "@/modules/inventory/types/materials.types";
import type { Product } from "@/modules/inventory/types/catalog.types";

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

export default function RequestMaterialPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const productMap = useMemo(() => {
    const map: Record<string, Product> = {};
    products.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [products]);

  const productLabel = useCallback(
    (id: string): string => {
      const product = productMap[id];
      if (!product) return id;
      return product.sku ? `${product.name} (${product.sku})` : product.name;
    },
    [productMap]
  );

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [reqs, prods] = await Promise.all([
        materialsApi.getMyRequests(),
        productApi.getAll().catch(() => [] as Product[]),
      ]);
      setRequests(Array.isArray(reqs) ? reqs : []);
      setProducts(Array.isArray(prods) ? prods.filter((p) => p.isActive !== false) : []);
    } catch (err: any) {
      const message = err?.message || "Failed to load your requests";
      setError(message);
      showToast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!productId) {
      showToast.error("Please select a product");
      return;
    }
    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      showToast.error("Please enter a valid quantity");
      return;
    }
    setSubmitting(true);
    try {
      await materialsApi.createMyRequest({
        productId,
        quantity: qty,
        reason: reason.trim() || null,
      });
      showToast.success("Material request submitted");
      setProductId("");
      setQuantity("1");
      setReason("");
      await loadRequests();
    } catch (err: any) {
      showToast.error(err?.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Request Material
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Submit a request for materials you need and track your submissions.
          </p>
        </div>
        <Button variant="outline" onClick={loadRequests} disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Request Form */}
        <Card className="border-slate-200 shadow-none lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PackagePlus className="h-5 w-5 text-emerald-600" />
              New Request
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="product">Product</Label>
                <Select value={productId} onValueChange={setProductId}>
                  <SelectTrigger id="product" className="w-full">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-slate-400">
                        No products available
                      </div>
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
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Enter quantity"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reason">Reason (optional)</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Why do you need this material?"
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {submitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Submit Request
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* My Requests Table */}
        <Card className="border-slate-200 shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="h-5 w-5 text-emerald-600" />
              My Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <Loader2 className="mb-3 h-8 w-8 animate-spin text-emerald-600" />
                <p className="text-sm">Loading your requests...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <AlertCircle className="mb-3 h-10 w-10 text-rose-400" />
                <p className="text-sm font-medium text-slate-700">{error}</p>
                <Button variant="outline" className="mt-4" onClick={loadRequests}>
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
                      <th className="px-4 py-3 font-medium">Requested</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Decision Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((row) => (
                      <tr
                        key={row.id}
                        className="border-t border-slate-100 hover:bg-slate-50/80"
                      >
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {productLabel(row.productId)}
                        </td>
                        <td className="px-4 py-3 text-slate-700">{row.quantity}</td>
                        <td className="px-4 py-3 text-slate-700">
                          {formatDate(row.dateAdd)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            status={row.status || "—"}
                            tone={statusTone(row.status)}
                          />
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {row.decisionNote || "—"}
                        </td>
                      </tr>
                    ))}
                    {requests.length === 0 && (
                      <tr>
                        <td
                          colSpan={99}
                          className="px-4 py-12 text-center text-slate-400"
                        >
                          <ClipboardList className="mx-auto mb-2 h-10 w-10 text-slate-300" />
                          <p className="text-sm font-medium text-slate-500">
                            No requests yet
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            Submit your first material request using the form.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
