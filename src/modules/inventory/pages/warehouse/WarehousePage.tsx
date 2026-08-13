import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { ModulePageShell, StatusBadge } from "@/shared/components/ModulePageShell";
import { Button } from "@/shared/components/ui/button";
import { showToast } from "@/shared/layout/layout";
import { warehouseApi } from "@/modules/inventory/services/warehouse.api";
import type { Warehouse, WarehouseCreate } from "@/modules/inventory/types/warehouse.types";
import { FormModal, Field, inputCls, DetailModal } from "@/modules/inventory/components/FormModal";

const emptyWarehouse: WarehouseCreate = {
  name: "",
  code: "",
  location: "",
  city: "",
  phone: "",
  email: "",
  warehouseType: "Main",
  status: "Active",
  isActive: true,
};

export default function WarehousePage() {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<WarehouseCreate>(emptyWarehouse);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<Warehouse | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await warehouseApi.getAll();
      setRows(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const message = err?.message || "Failed to load warehouses";
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
    if (!form.name?.trim() || !form.code?.trim()) {
      showToast.error("Name and code are required");
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await warehouseApi.update({ ...form, id: editingId });
        showToast.success("Warehouse updated");
      } else {
        await warehouseApi.create(form);
        showToast.success("Warehouse created");
      }
      setShowForm(false);
      setForm(emptyWarehouse);
      setEditingId(null);
      load();
    } catch (err: any) {
      showToast.error(err?.message || `Failed to ${editingId ? "update" : "create"} warehouse`);
    } finally {
      setSubmitting(false);
    }
  }, [form, editingId, load]);

  const handleDelete = useCallback(
    async (wh: Warehouse) => {
      if (!window.confirm(`Delete warehouse "${wh.name}"? This cannot be undone.`)) return;
      try {
        await warehouseApi.remove(wh.id);
        showToast.success("Warehouse deleted");
        load();
      } catch (err: any) {
        showToast.error(err?.message || "Failed to delete warehouse");
      }
    },
    [load]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      [row.code, row.name, row.location ?? "", row.status ?? ""].some((v) =>
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
      title="Warehouses"
      subtitle="Manage warehouse sites, capacity, and operational status."
      stats={stats}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search..."
      onRefresh={load}
      primaryActionLabel="Add Warehouse"
      onPrimaryAction={() => {
        setForm(emptyWarehouse);
        setEditingId(null);
        setShowForm(true);
      }}
    >
      <FormModal
        open={showForm}
        title={editingId ? "Edit Warehouse" : "Add Warehouse"}
        onClose={() => {
          setShowForm(false);
          setEditingId(null);
        }}
        onSubmit={submit}
        submitting={submitting}
        submitLabel={editingId ? "Save Changes" : "Create Warehouse"}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Name *">
            <input
              className={inputCls}
              value={form.name ?? ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Main Warehouse"
            />
          </Field>
          <Field label="Code *">
            <input
              className={inputCls}
              value={form.code ?? ""}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="e.g. WH-01"
            />
          </Field>
          <Field label="Location">
            <input
              className={inputCls}
              value={form.location ?? ""}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </Field>
          <Field label="City">
            <input
              className={inputCls}
              value={form.city ?? ""}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </Field>
          <Field label="Phone">
            <input
              className={inputCls}
              value={form.phone ?? ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </Field>
          <Field label="Email">
            <input
              className={inputCls}
              value={form.email ?? ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
          <Field label="Type">
            <select
              className={inputCls}
              value={form.warehouseType ?? ""}
              onChange={(e) => setForm({ ...form, warehouseType: e.target.value })}
            >
              <option value="Main">Main</option>
              <option value="Sub">Sub</option>
              <option value="Distribution">Distribution</option>
              <option value="Store">Store</option>
            </select>
          </Field>
          <Field label="Status">
            <select
              className={inputCls}
              value={form.status ?? ""}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            checked={form.isActive ?? false}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          Active
        </label>
      </FormModal>
      <DetailModal
        open={viewing !== null}
        title={viewing?.name ?? "Warehouse"}
        onClose={() => setViewing(null)}
        rows={
          viewing
            ? [
                { label: "Code", value: viewing.code },
                { label: "Name", value: viewing.name },
                { label: "Location", value: viewing.location ?? "—" },
                { label: "City", value: viewing.city ?? "—" },
                { label: "Type", value: viewing.warehouseType ?? "—" },
                { label: "Phone", value: viewing.phone ?? "—" },
                { label: "Email", value: viewing.email ?? "—" },
                {
                  label: "Status",
                  value: viewing.status || (viewing.isActive ? "Active" : "Inactive"),
                },
              ]
            : []
        }
      />
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm">Loading warehouses...</p>
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
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const statusLabel = row.status || (row.isActive ? "Active" : "Inactive");
                return (
                  <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-900">{row.code}</td>
                    <td className="px-4 py-3 text-slate-700">{row.name}</td>
                    <td className="px-4 py-3 text-slate-700">{row.location || "—"}</td>
                    <td className="px-4 py-3 text-slate-700">{row.warehouseType || "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={statusLabel} tone={row.isActive ? "success" : "neutral"} />
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
                              code: row.code,
                              location: row.location ?? "",
                              city: row.city ?? "",
                              phone: row.phone ?? "",
                              email: row.email ?? "",
                              warehouseType: row.warehouseType ?? "Main",
                              status: row.status ?? (row.isActive ? "Active" : "Inactive"),
                              isActive: row.isActive,
                            });
                            setEditingId(row.id);
                            setShowForm(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:text-rose-700"
                          onClick={() => handleDelete(row)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
