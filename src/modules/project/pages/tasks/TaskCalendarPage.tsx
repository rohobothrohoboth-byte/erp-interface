import { ModulePageShell, StatusBadge } from "@/shared/components/ModulePageShell";
import { showToast } from "@/shared/layout/layout";

const EVENTS = [
  { id: "e1", date: "2026-08-12", title: "MEP coordination", projectCode: "PRJ-2401", status: "Blocked" },
  { id: "e2", date: "2026-08-15", title: "Interior package approval", projectCode: "PRJ-2401", status: "In Progress" },
  { id: "e3", date: "2026-08-20", title: "AP UAT scripts due", projectCode: "PRJ-2407", status: "In Progress" },
  { id: "e4", date: "2026-08-28", title: "WMS vendor shortlist", projectCode: "PRJ-2412", status: "Backlog" },
];

export default function TaskCalendarPage() {
  return (
    <ModulePageShell
      title="Task Calendar"
      subtitle="Due-date calendar for project commitments."
      stats={[{ label: "Scheduled", value: EVENTS.length }]}
      onRefresh={() => showToast.success("Calendar refreshed")}
    >
      <div className="space-y-3">
        {EVENTS.map((event) => (
          <div
            key={event.id}
            className="flex flex-col gap-2 rounded-lg border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">{event.date}</div>
              <div className="font-medium text-slate-900">{event.title}</div>
              <div className="text-sm text-slate-500">{event.projectCode}</div>
            </div>
            <StatusBadge status={event.status} tone={event.status === "Blocked" ? "danger" : "info"} />
          </div>
        ))}
      </div>
    </ModulePageShell>
  );
}
