import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Pencil, MapPin, ArrowRight } from "lucide-react";
import { useCompanies, useUpdateCompany } from "@/modules/core/services/company/company.queries";
import EditCompModal from "@/modules/core/components/company/EditCompModal";
import { Button } from "@/shared/components/ui/button";
import type { CompListDto } from "@/modules/core/types/comp";

// Single-company deployment: the company is created during System Setup and rarely
// changes, so this is a read/edit Profile (not a create/list CRUD). The org
// hierarchy the user manages day to day is Branch -> Department.
const CompanyProfilePage = () => {
  const navigate = useNavigate();
  const { data: companies = [], isLoading, error } = useCompanies();
  const updateCompany = useUpdateCompany();
  const [editing, setEditing] = useState(false);

  const company = companies[0] as CompListDto | undefined;

  const handleSave = async (updated: CompListDto) => {
    await updateCompany.mutateAsync({
      id: updated.id,
      name: updated.name,
      nameAm: updated.nameAm,
      rowVersion: (updated as any).rowVersion ?? "",
    });
    setEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600 dark:border-slate-600 dark:border-t-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
        Failed to load the company profile. {error.message}
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white py-16 text-center dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 rounded-full bg-slate-100 p-4 dark:bg-slate-800">
          <Building2 className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
          No company registered yet
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Complete System Setup to create your organization's company.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
          <Building2 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Company Profile</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Your organization's top-level entity. Manage branches and departments below it.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xl font-bold text-white">
              {company.name?.charAt(0)?.toUpperCase() || "C"}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {company.name}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{company.nameAm}</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => setEditing(true)} className="gap-2">
            <Pencil className="h-4 w-4" /> Edit
          </Button>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 dark:border-slate-800 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Company Name</dt>
            <dd className="text-sm text-slate-800 dark:text-slate-100">{company.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Company Name (Amharic)
            </dt>
            <dd className="text-sm text-slate-800 dark:text-slate-100">{company.nameAm || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Branches</dt>
            <dd className="text-sm text-slate-800 dark:text-slate-100">{company.branchCount ?? 0}</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
          <Button onClick={() => navigate("/core/branch")} className="gap-2 bg-slate-800 hover:bg-slate-700">
            <MapPin className="h-4 w-4" /> Manage Branches <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => navigate("/core/department")} className="gap-2">
            Manage Departments
          </Button>
        </div>
      </div>

      <EditCompModal
        company={editing ? company : null}
        isOpen={editing}
        onClose={() => setEditing(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default CompanyProfilePage;
