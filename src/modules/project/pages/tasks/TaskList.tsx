import { useMemo, useState } from "react";
import { ModulePageShell, StatusBadge } from "@/shared/components/ModulePageShell";
import { Button } from "@/shared/components/ui/button";
import { showToast } from "@/shared/layout/layout";

type Row = Record<string, string | number>;

const DATA: Row[] = [
  { id: "t1", projectCode: "PRJ-2401", title: "Approve interior package", assignee: "Sara Bekele", status: "In Progress", priority: "High", dueDate: "2026-08-15" },
  { id: "t2", projectCode: "PRJ-2407", title: "Map chart of accounts", assignee: "Daniel Tadesse", status: "Done", priority: "Critical", dueDate: "2026-08-05" },
  { id: "t3", projectCode: "PRJ-2407", title: "UAT script for AP invoices", assignee: "Marta Hailu", status: "In Progress", priority: "High", dueDate: "2026-08-20" },
  { id: "t4", projectCode: "PRJ-2412", title: "Vendor shortlist for WMS", assignee: "Helen Girma", status: "Backlog", priority: "Medium", dueDate: "2026-08-28" },
  { id: "t5", projectCode: "PRJ-2401", title: "MEP coordination meeting", assignee: "Abel Kebede", status: "Blocked", priority: "High", dueDate: "2026-08-12" }
];

export default function TaskList() {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<Row[]>(DATA);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      Object.values(row).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [rows, search]);

  const stats = [
    { label: "Records", value: rows.length },
    { label: "Showing", value: filtered.length },
  ];

  return (
    <ModulePageShell
      title="All Tasks"
      subtitle="Cross-project task register with priority and due dates."
      stats={stats}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search..."
      onRefresh={() => showToast.success("Refreshed All Tasks")}
      primaryActionLabel="Add Task"
      onPrimaryAction={() => {
        showToast.success("Saved");
        setRows((prev) => prev);
      }}
    >
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Task</th>
              <th className="px-4 py-3 font-medium">Assignee</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Due</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={String(row.id)} className="border-t border-slate-100 hover:bg-slate-50/80">
                <td className="px-4 py-3 font-medium text-slate-900">{row.projectCode}</td>
                <td className="px-4 py-3 text-slate-700">{row.title}</td>
                <td className="px-4 py-3 text-slate-700">{row.assignee}</td>
                <td className="px-4 py-3 text-slate-700">{row.priority}</td>
                <td className="px-4 py-3 text-slate-700">{row.dueDate}</td>
                <td className="px-4 py-3"><StatusBadge status={String(row.status)} tone={["Active","Posted","Approved","Healthy","Done","Completed","On Track","Green"].includes(String(row.status)) ? "success" : ["Draft","Pending","Below Min","Blocked","At Risk","Amber"].includes(String(row.status)) ? "warning" : "neutral"} /></td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => showToast.success("Opened record")}>
                    View
                  </Button>
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
    </ModulePageShell>
  );
}
