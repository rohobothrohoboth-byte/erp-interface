import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { ModulePageShell, StatusBadge } from "@/shared/components/ModulePageShell";
import { Button } from "@/shared/components/ui/button";
import { FormModal, Field, inputCls } from "@/modules/inventory/components/FormModal";
import { contractApi } from "@/modules/hr/services/lifecycle/contract.api";
import { getAllEmployees } from "@/modules/hr/services/employee/emp.api";
import type { Contract, ContractCreate } from "@/modules/hr/types/lifecycle.types";
import type { EmployeeListDto } from "@/modules/hr/types/employee";

const emptyForm: ContractCreate = {
  employeeId: "",
  contractType: "",
  startDate: "",
  endDate: "",
  salary: undefined,
  status: "Active",
  notes: "",
};

const toDateInput = (value?: string | null) => (value ? String(value).slice(0, 10) : "");

export default function EmployeeContractsPage() {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<Contract[]>([]);
  const [employees, setEmployees] = useState<EmployeeListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<ContractCreate>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, emps] = await Promise.all([contractApi.getAll(), getAllEmployees()]);
      setRows(Array.isArray(data) ? data : []);
      setEmployees(Array.isArray(emps) ? emps : []);
    } catch (err: any) {
      const message = err?.message || "Failed to load contracts";
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
    (row: Contract) => {
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
    if (!form.contractType.trim()) {
      toast.error("Contract type is required");
      return;
    }
    if (!form.startDate) {
      toast.error("Start date is required");
      return;
    }
    const payload: ContractCreate = {
      ...form,
      endDate: form.endDate || null,
      salary:
        form.salary === undefined || form.salary === null || (form.salary as any) === ""
          ? null
          : Number(form.salary),
      notes: form.notes || null,
    };
    setSubmitting(true);
    try {
      if (editingId) {
        await contractApi.update(editingId, payload);
        toast.success("Contract updated");
      } else {
        await contractApi.create(payload);
        toast.success("Contract created");
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err: any) {
      toast.error(err?.message || `Failed to ${editingId ? "update" : "create"} contract`);
    } finally {
      setSubmitting(false);
    }
  }, [form, editingId, load]);

  const remove = useCallback(
    async (row: Contract) => {
      if (!window.confirm("Delete this contract?")) return;
      try {
        await contractApi.remove(row.id);
        toast.success("Contract deleted");
        load();
      } catch (err: any) {
        toast.error(err?.message || "Failed to delete contract");
      }
    },
    [load]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      [employeeName(row), row.contractType, row.status].some((v) =>
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
      title="Contracts"
      subtitle="Active and historical employment contracts."
      stats={stats}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search by employee, type, status..."
      onRefresh={load}
      primaryActionLabel="Add Contract"
      onPrimaryAction={() => {
        setForm(emptyForm);
        setEditingId(null);
        setShowForm(true);
      }}
    >
      <FormModal
        open={showForm}
        title={editingId ? "Edit Contract" : "Add Contract"}
        onClose={() => {
          setShowForm(false);
          setEditingId(null);
        }}
        onSubmit={submit}
        submitting={submitting}
        submitLabel={editingId ? "Save Changes" : "Create Contract"}
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
        <Field label="Contract Type *">
          <input
            className={inputCls}
            value={form.contractType}
            onChange={(e) => setForm({ ...form, contractType: e.target.value })}
            placeholder="e.g. Permanent, Fixed Term"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start Date *">
            <input
              type="date"
              className={inputCls}
              value={toDateInput(form.startDate)}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </Field>
          <Field label="End Date">
            <input
              type="date"
              className={inputCls}
              value={toDateInput(form.endDate)}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Salary">
            <input
              type="number"
              className={inputCls}
              value={form.salary ?? ""}
              onChange={(e) =>
                setForm({ ...form, salary: e.target.value === "" ? undefined : Number(e.target.value) })
              }
              placeholder="0.00"
            />
          </Field>
          <Field label="Status *">
            <select
              className={inputCls}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Expired">Expired</option>
              <option value="Terminated">Terminated</option>
            </select>
          </Field>
        </div>
        <Field label="Notes">
          <textarea
            className={inputCls}
            rows={2}
            value={form.notes ?? ""}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </Field>
      </FormModal>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm">Loading contracts...</p>
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
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Start</th>
                <th className="px-4 py-3 font-medium">End</th>
                <th className="px-4 py-3 font-medium">Salary</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium text-slate-900">{employeeName(row)}</td>
                  <td className="px-4 py-3 text-slate-700">{row.contractType || "—"}</td>
                  <td className="px-4 py-3 text-slate-700">{toDateInput(row.startDate) || "—"}</td>
                  <td className="px-4 py-3 text-slate-700">{toDateInput(row.endDate) || "—"}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {row.salary != null ? row.salary.toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={row.status || "—"}
                      tone={row.status === "Active" ? "success" : "neutral"}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setForm({
                            employeeId: row.employeeId,
                            contractType: row.contractType,
                            startDate: toDateInput(row.startDate),
                            endDate: toDateInput(row.endDate),
                            salary: row.salary ?? undefined,
                            status: row.status,
                            notes: row.notes ?? "",
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
                    No contracts found.
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
