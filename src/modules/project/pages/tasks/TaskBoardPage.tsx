import { useMemo, useState } from "react";
import { ModulePageShell, StatusBadge } from "@/shared/components/ModulePageShell";
import { Card, CardContent } from "@/shared/components/ui/card";
import { showToast } from "@/shared/layout/layout";

const COLUMNS = ["Backlog", "In Progress", "Blocked", "Done"] as const;

type CardItem = {
  id: string;
  title: string;
  projectCode: string;
  status: (typeof COLUMNS)[number];
  priority: string;
};

const SEED: CardItem[] = [
  { id: "t1", title: "Approve interior package", projectCode: "PRJ-2401", status: "In Progress", priority: "High" },
  { id: "t2", title: "Map chart of accounts", projectCode: "PRJ-2407", status: "Done", priority: "Critical" },
  { id: "t3", title: "UAT script for AP invoices", projectCode: "PRJ-2407", status: "In Progress", priority: "High" },
  { id: "t4", title: "Vendor shortlist for WMS", projectCode: "PRJ-2412", status: "Backlog", priority: "Medium" },
  { id: "t5", title: "MEP coordination meeting", projectCode: "PRJ-2401", status: "Blocked", priority: "High" },
];

export default function TaskBoardPage() {
  const [tasks, setTasks] = useState(SEED);
  const grouped = useMemo(
    () => COLUMNS.map((status) => ({ status, items: tasks.filter((t) => t.status === status) })),
    [tasks],
  );

  return (
    <ModulePageShell
      title="Task Board"
      subtitle="Kanban board for execution tracking across projects."
      stats={[
        { label: "Cards", value: tasks.length },
        { label: "Blocked", value: tasks.filter((t) => t.status === "Blocked").length },
      ]}
      onRefresh={() => showToast.success("Board refreshed")}
      primaryActionLabel="Add Card"
      onPrimaryAction={() =>
        setTasks((prev) => [
          ...prev,
          {
            id: `t${prev.length + 1}`,
            title: "New task",
            projectCode: "PRJ-2407",
            status: "Backlog",
            priority: "Medium",
          },
        ])
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {grouped.map((col) => (
          <div key={col.status} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">{col.status}</h3>
              <span className="text-xs text-slate-500">{col.items.length}</span>
            </div>
            <div className="space-y-2">
              {col.items.map((task) => (
                <Card key={task.id} className="shadow-none">
                  <CardContent className="space-y-2 p-3">
                    <div className="text-sm font-medium text-slate-900">{task.title}</div>
                    <div className="text-xs text-slate-500">{task.projectCode}</div>
                    <StatusBadge
                      status={task.priority}
                      tone={task.priority === "Critical" || task.priority === "High" ? "danger" : "info"}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ModulePageShell>
  );
}
