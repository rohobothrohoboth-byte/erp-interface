import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { ModulePageShell, StatusBadge } from "@/shared/components/ModulePageShell";
import { Button } from "@/shared/components/ui/button";
import { showToast } from "@/shared/layout/layout";
import { categoryApi } from "@/modules/inventory/services/catalog.api";
import type { Category, CategoryCreate } from "@/modules/inventory/types/catalog.types";
import { FormModal, Field, inputCls, DetailModal } from "@/modules/inventory/components/FormModal";

const emptyCategory: CategoryCreate = { name: "", code: "", description: "", isActive: true };

export default function CategoriesPage() {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<CategoryCreate>(emptyCategory);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<Category | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryApi.getAll();
      setRows(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const message = err?.message || "Failed to load categories";
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
    if (!form.name.trim()) {
      showToast.error("Category name is required");
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await categoryApi.update({ ...form, id: editingId });
        showToast.success("Category updated");
      } else {
        await categoryApi.create(form);
        showToast.success("Category created");
      }
      setShowForm(false);
      setForm(emptyCategory);
      setEditingId(null);
      load();
    } catch (err: any) {
      showToast.error(err?.message || `Failed to ${editingId ? "update" : "create"} category`);
    } finally {
      setSubmitting(false);
    }
  }, [form, editingId, load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      [row.name, row.code ?? "", row.description ?? ""].some((v) =>
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
      title="Product Categories"
      subtitle="Organize inventory master data for reporting and replenishment."
      stats={stats}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search..."
      onRefresh={load}
      primaryActionLabel="Add Category"
      onPrimaryAction={() => {
        setForm(emptyCategory);
        setEditingId(null);
        setShowForm(true);
      }}
    >
      <FormModal
        open={showForm}
        title={editingId ? "Edit Category" : "Add Category"}
        onClose={() => {
          setShowForm(false);
          setEditingId(null);
        }}
        onSubmit={submit}
        submitting={submitting}
        submitLabel={editingId ? "Save Changes" : "Create Category"}
      >
        <Field label="Name *">
          <input
            className={inputCls}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Raw Material"
          />
        </Field>
        <Field label="Code">
          <input
            className={inputCls}
            value={form.code ?? ""}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            placeholder="e.g. RM"
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
        title={viewing?.name ?? "Category"}
        onClose={() => setViewing(null)}
        rows={
          viewing
            ? [
                { label: "Name", value: viewing.name },
                { label: "Code", value: viewing.code ?? "—" },
                { label: "Description", value: viewing.description ?? "—" },
                { label: "Status", value: viewing.isActive ? "Active" : "Inactive" },
              ]
            : []
        }
      />
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm">Loading categories...</p>
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
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium text-slate-900">{row.name}</td>
                  <td className="px-4 py-3 text-slate-700">{row.code || "—"}</td>
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
                            code: row.code ?? "",
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
