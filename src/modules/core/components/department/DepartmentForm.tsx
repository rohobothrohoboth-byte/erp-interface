import type { Department } from "@/modules/core/types/coreTypes";

type DepartmentFormProps = {
  initialData?: Partial<Department> | Record<string, unknown>;
  departments?: Department[];
  isEdit?: boolean;
  onChange?: (data: Record<string, unknown>) => void;
  onSubmit?: () => void;
  onCancel?: () => void;
};

/** Lightweight form shell used by department list edit/create flows. */
export default function DepartmentForm({
  initialData,
  isEdit,
  onChange,
  onSubmit,
  onCancel,
}: DepartmentFormProps) {
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
    >
      <div className="text-sm text-slate-600">
        {isEdit ? "Edit department" : "Create department"}
      </div>
      <input
        className="w-full rounded-md border px-3 py-2 text-sm"
        placeholder="Department name"
        defaultValue={String((initialData as { name?: string } | undefined)?.name ?? "")}
        onChange={(e) => onChange?.({ ...(initialData as object), name: e.target.value })}
      />
      <div className="flex gap-2">
        <button type="submit" className="rounded-md bg-emerald-600 px-3 py-2 text-sm text-white">
          Save
        </button>
        <button type="button" className="rounded-md border px-3 py-2 text-sm" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
