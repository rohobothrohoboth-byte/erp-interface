import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { ModulePageShell, StatusBadge } from "@/shared/components/ModulePageShell";
import { Button } from "@/shared/components/ui/button";
import { showToast } from "@/shared/layout/layout";
import { unitApi } from "@/modules/inventory/services/catalog.api";
import type { Unit, UnitCreate } from "@/modules/inventory/types/catalog.types";
import { FormModal, Field, inputCls, DetailModal } from "@/modules/inventory/components/FormModal";

const emptyUnit: UnitCreate = { name: "", symbol: "", description: "", isActive: true };

export default function UnitsPage() {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<UnitCreate>(emptyUnit);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<Unit | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await unitApi.getAll();
      setRows(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const message = err?.message || "Failed to load units";
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

  const submit = useCallback(async () => {
    if (!form.name.trim() || !form.symbol.trim()) {
      showToast.error("Unit name and symbol are required");
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await unitApi.update({ ...form, id: editingId });
        showToast.success("Unit updated");
      } else {
        await unitApi.create(form);
        showToast.success("Unit created");
      }
      setShowForm(false);
      setForm(emptyUnit);
      setEditingId(null);
      load();
    } catch (err: any) {
      showToast.error(err?.message || `Failed to ${editingId ? "update" : "create"} unit`);
    } finally {
      setSubmitting(false);
    }
  }, [form, editingId, load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      [row.symbol, row.name, row.description ?? ""].some((v) =>
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
      title="Units of Measure"
      subtitle="Define stock keeping units used across warehouses."
      stats={stats}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search..."
      onRefresh={load}
      primaryActionLabel="Add Unit"
      onPrimaryAction={() => {
        setForm(emptyUnit);
        setEditingId(null);
        setShowForm(true);
      }}
    >
      <FormModal
        open={showForm}
        title={editingId ? "Edit Unit of Measure" : "Add Unit of Measure"}
        onClose={() => {
          setShowForm(false);
          setEditingId(null);
        }}
        onSubmit={submit}
        submitting={submitting}
        submitLabel={editingId ? "Save Changes" : "Create Unit"}
      >
        <Field label="Name *">
          <input
            className={inputCls}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Pieces"
          />
        </Field>
        <Field label="Symbol *">
          <input
            className={inputCls}
            value={form.symbol}
            onChange={(e) => setForm({ ...form, symbol: e.target.value })}
            placeholder="e.g. PCS"
          />
        </Field>
        <Field label="Description">
          <textarea
            className={inputCls}
            rows={2}
            value={form.description ?? ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          Active
        </label>
      </FormModal>
      <DetailModal
        open={viewing !== null}
        title={viewing?.name ?? "Unit of Measure"}
        onClose={() => setViewing(null)}
        rows={
          viewing
            ? [
                { label: "Name", value: viewing.name },
                { label: "Symbol", value: viewing.symbol },
                { label: "Description", value: viewing.description ?? "—" },
                { label: "Status", value: viewing.isActive ? "Active" : "Inactive" },
              ]
            : []
        }
      />
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm">Loading units...</p>
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
                <th className="px-4 py-3 font-medium">Symbol</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium text-slate-900">{row.symbol}</td>
                  <td className="px-4 py-3 text-slate-700">{row.name}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={row.isActive ? "Active" : "Inactive"}
                      tone={row.isActive ? "success" : "neutral"}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setViewing(row)}>
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setForm({
                            name: row.name,
                            symbol: row.symbol,
                            description: row.description ?? "",
                            isActive: row.isActive,
                          });
                          setEditingId(row.id);
                          setShowForm(true);
                        }}
                      >
                        Edit
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
