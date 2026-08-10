import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ModulePageShell } from "@/shared/components/ModulePageShell";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { showToast } from "@/shared/layout/layout";

export default function CreateProject() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    code: "",
    name: "",
    manager: "",
    client: "",
    budget: "",
    startDate: "",
    endDate: "",
  });

  const update = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <ModulePageShell
      title="Create Project"
      subtitle="Capture charter details, dates, budget, and ownership."
      onRefresh={() => navigate(-1)}
    >
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          showToast.success("Project created");
          navigate("/project-management/projects");
        }}
      >
        {(
          [
            ["code", "Project Code", "PRJ-25XX"],
            ["name", "Project Name", ""],
            ["manager", "Project Manager", ""],
            ["client", "Client / Sponsor", ""],
            ["budget", "Budget", ""],
            ["startDate", "Start Date", "YYYY-MM-DD"],
            ["endDate", "End Date", "YYYY-MM-DD"],
          ] as const
        ).map(([key, label, placeholder]) => (
          <div key={key} className="space-y-1.5">
            <Label htmlFor={key}>{label}</Label>
            <Input
              id={key}
              value={form[key]}
              placeholder={placeholder || label}
              onChange={(e) => update(key, e.target.value)}
              required
            />
          </div>
        ))}
        <div className="flex gap-2 md:col-span-2">
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
            Save
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </div>
      </form>
    </ModulePageShell>
  );
}
