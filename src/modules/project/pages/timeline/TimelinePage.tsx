import { ModulePageShell } from "@/shared/components/ModulePageShell";
import { showToast } from "@/shared/layout/layout";

const PHASES = [
  { id: "ph1", project: "PRJ-2401", name: "Design", start: "Mar", end: "Jun", progress: 100 },
  { id: "ph2", project: "PRJ-2401", name: "Build", start: "Jun", end: "Oct", progress: 55 },
  { id: "ph3", project: "PRJ-2407", name: "Configure", start: "May", end: "Aug", progress: 70 },
  { id: "ph4", project: "PRJ-2407", name: "UAT", start: "Aug", end: "Oct", progress: 20 },
  { id: "ph5", project: "PRJ-2412", name: "Select Vendor", start: "Aug", end: "Sep", progress: 35 },
];

export default function TimelinePage() {
  return (
    <ModulePageShell
      title="Project Timeline"
      subtitle="High-level phase timeline across the portfolio."
      stats={[{ label: "Phases", value: PHASES.length }]}
      onRefresh={() => showToast.success("Timeline refreshed")}
    >
      <div className="space-y-4">
        {PHASES.map((phase) => (
          <div key={phase.id} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="font-medium text-slate-800">
                {phase.project} · {phase.name}
              </div>
              <div className="text-slate-500">
                {phase.start} → {phase.end}
              </div>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${phase.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </ModulePageShell>
  );
}
