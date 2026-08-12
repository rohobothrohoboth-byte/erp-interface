import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { ModulePageShell, StatusBadge } from "@/shared/components/ModulePageShell";
import { Button } from "@/shared/components/ui/button";
import { FormModal, Field, inputCls } from "@/modules/inventory/components/FormModal";
import { promotionApi } from "@/modules/hr/services/lifecycle/promotion.api";
import { getAllEmployees } from "@/modules/hr/services/employee/emp.api";
import type { Promotion, PromotionCreate } from "@/modules/hr/types/lifecycle.types";
import type { EmployeeListDto } from "@/modules/hr/types/employee";

const emptyForm: PromotionCreate = {
  employeeId: "",
  fromPosition: "",
  toPosition: "",
  effectiveDate: "",
  reason: "",
  status: "Pending",
};

const toDateInput = (value?: string | null) => (value ? String(value).slice(0, 10) : "");

export default function EmployeePromotionsPage() {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<Promotion[]>([]);
  const [employees, setEmployees] = useState<EmployeeListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<PromotionCreate>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, emps] = await Promise.all([promotionApi.getAll(), getAllEmployees()]);
      setRows(Array.isArray(data) ? data : []);
      setEmployees(Array.isArray(emps) ? emps : []);
    } catch (err: any) {
      const message = err?.message || "Failed to load promotions";
      setError(message);
      toast.error(message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const employeeName = useCallback(
    (row: Promotion) => {
      if (row.employeeName) return row.employeeName;
      const match = employees.find((e) => String(e.id) === String(row.employeeId));
      return match?.empFullName || row.employeeId || "—";
    },
    [employees]
  );

  const submit = useCallback(async () => {
    if (!form.employeeId) {
      toast.error("Employee is required");
      return;
    }
    if (!form.toPosition.trim()) {
      toast.error("To position is required");
      return;
    }
    if (!form.effectiveDate) {
      toast.error("Effective date is required");
      return;
    }
    const payload: PromotionCreate = {
      ...form,
      fromPosition: form.fromPosition || null,
      reason: form.reason || null,
    };
    setSubmitting(true);
    try {
      if (editingId) {
        await promotionApi.update(editingId, payload);
        toast.success("Promotion updated");
      } else {
        await promotionApi.create(payload);
        toast.success("Promotion created");
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err: any) {
      toast.error(err?.message || `Failed to ${editingId ? "update" : "create"} promotion`);
    } finally {
      setSubmitting(false);
    }
  }, [form, editingId, load]);

  const approve = useCallback(
    async (row: Promotion) => {
      try {
        await promotionApi.approve(row.id);
        toast.success("Promotion approved");
        load();
      } catch (err: any) {
        toast.error(err?.message || "Failed to approve promotion");
      }
    },
    [load]
  );

  const remove = useCallback(
    async (row: Promotion) => {
      if (!window.confirm("Delete this promotion?")) return;
      try {
        await promotionApi.remove(row.id);
        toast.success("Promotion deleted");
        load();
      } catch (err: any) {
        toast.error(err?.message || "Failed to delete promotion");
      }
    },
    [load]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      [employeeName(row), row.fromPosition ?? "", row.toPosition, row.status].some((v) =>
        String(v ?? "").toLowerCase().includes(q)
      )
    );
  }, [rows, search, employeeName]);

  const stats = [
    { label: "Records", value: rows.length },
    { label: "Showing", value: filtered.length },
  ];

  return (
    <ModulePageShell
      title="Promotions"
      subtitle="Promotion requests and approved grade changes."
      stats={stats}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search by employee, position, status..."
      onRefresh={load}
      primaryActionLabel="Add Promotion"
      onPrimaryAction={() => {
        setForm(emptyForm);
        setEditingId(null);
        setShowForm(true);
      }}
    >
      <FormModal
        open={showForm}
        title={editingId ? "Edit Promotion" : "Add Promotion"}
        onClose={() => {
          setShowForm(false);
          setEditingId(null);
        }}
        onSubmit={submit}
        submitting={submitting}
        submitLabel={editingId ? "Save Changes" : "Create Promotion"}
      >
        <Field label="Employee *">
          <select
            className={inputCls}
            value={form.employeeId}
            onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
          >
            <option value="">Select employee...</option>
            {employees.map((emp) => (
              <option key={String(emp.id)} value={String(emp.id)}>
                {emp.empFullName}
                {emp.code ? ` (${emp.code})` : ""}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="From Position">
            <input
              className={inputCls}
              value={form.fromPosition ?? ""}
              onChange={(e) => setForm({ ...form, fromPosition: e.target.value })}
              placeholder="e.g. Developer"
            />
          </Field>
          <Field label="To Position *">
            <input
              className={inputCls}
              value={form.toPosition}
              onChange={(e) => setForm({ ...form, toPosition: e.target.value })}
              placeholder="e.g. Senior Developer"
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Effective Date *">
            <input
              type="date"
              className={inputCls}
              value={toDateInput(form.effectiveDate)}
              onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })}
            />
          </Field>
          <Field label="Status *">
            <select
              className={inputCls}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </Field>
        </div>
        <Field label="Reason">
          <textarea
            className={inputCls}
            rows={2}
            value={form.reason ?? ""}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          />
        </Field>
      </FormModal>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm">Loading promotions...</p>
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
                <th className="px-4 py-3 font-medium">From</th>
                <th className="px-4 py-3 font-medium">To</th>
                <th className="px-4 py-3 font-medium">Effective</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium text-slate-900">{employeeName(row)}</td>
                  <td className="px-4 py-3 text-slate-700">{row.fromPosition || "—"}</td>
                  <td className="px-4 py-3 text-slate-700">{row.toPosition || "—"}</td>
                  <td className="px-4 py-3 text-slate-700">{toDateInput(row.effectiveDate) || "—"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={row.status || "—"}
                      tone={
                        row.status === "Approved"
                          ? "success"
                          : row.status === "Rejected"
                          ? "danger"
                          : "warning"
                      }
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      {row.status !== "Approved" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-emerald-600 hover:text-emerald-700"
                          onClick={() => approve(row)}
                        >
                          Approve
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setForm({
                            employeeId: row.employeeId,
                            fromPosition: row.fromPosition ?? "",
                            toPosition: row.toPosition,
                            effectiveDate: toDateInput(row.effectiveDate),
                            reason: row.reason ?? "",
                            status: row.status,
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
                        onClick={() => remove(row)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={99} className="px-4 py-8 text-center text-slate-400">
                    No promotions found.
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
