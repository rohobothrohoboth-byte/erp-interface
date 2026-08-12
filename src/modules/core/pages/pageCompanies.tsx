import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Pencil, MapPin, ArrowRight, Upload, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useCompanies, useUpdateCompany } from "@/modules/core/services/company/company.queries";
import { FormModal, Field, inputCls } from "@/modules/inventory/components/FormModal";
import { uploadDocument } from "@/modules/file/services/documentService";
import { Button } from "@/shared/components/ui/button";
import type { CompListDto, EditCompDto } from "@/modules/core/types/comp";

// Base of the file management service. Uploaded files are stored under the
// service's wwwroot and served statically, so a stored file's relative path
// resolves against the gateway origin.
const FILE_GATEWAY = import.meta.env.VITE_GATEWAY_URL || "http://192.168.1.7:5000";
const FILE_MODULE_PATH = import.meta.env.VITE_FILE_MANAGEMENT_URL || "/file/v1";

// The upload endpoint returns a FileDocumentDto. We derive a browsable URL from
// it. Preference order: an explicit URL field, then the stored relative path
// (filePath / thumbnailPath) resolved against the gateway origin, and finally
// the authenticated download endpoint built from the document id.
// TODO: If the backend later returns a dedicated public URL field for stored
// files, prefer that field here (e.g. doc.publicUrl) to avoid the download
// endpoint fallback, which requires a Bearer token and may not render in <img>.
const deriveFileUrl = (doc: any): string | null => {
  if (!doc) return null;

  const directUrl =
    doc.url ?? doc.fileUrl ?? doc.downloadUrl ?? doc.thumbnailUrl ?? doc.publicUrl;
  if (typeof directUrl === "string" && directUrl.trim()) {
    return /^https?:\/\//i.test(directUrl)
      ? directUrl
      : `${FILE_GATEWAY}${directUrl.startsWith("/") ? "" : "/"}${directUrl}`;
  }

  const relPath = doc.filePath ?? doc.FilePath ?? doc.thumbnailPath ?? doc.ThumbnailPath;
  if (typeof relPath === "string" && relPath.trim()) {
    const clean = relPath
      .replace(/\\/g, "/")
      .replace(/^\/?wwwroot\//i, "")
      .replace(/^\//, "");
    return `${FILE_GATEWAY}/${clean}`;
  }

  const id = doc.id ?? doc.Id;
  if (id) {
    return `${FILE_GATEWAY}${FILE_MODULE_PATH}/documents/${id}/download`;
  }

  return null;
};

interface CompanyEditForm {
  name: string;
  nameAm: string;
  taxId: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  mission: string;
  vision: string;
  values: string;
  structure: string;
}

const emptyForm: CompanyEditForm = {
  name: "",
  nameAm: "",
  taxId: "",
  phone: "",
  email: "",
  address: "",
  website: "",
  mission: "",
  vision: "",
  values: "",
  structure: "",
};

// Single-company deployment: the company is created during System Setup and rarely
// changes, so this is a read/edit Profile (not a create/list CRUD). The org
// hierarchy the user manages day to day is Branch -> Department.
const CompanyProfilePage = () => {
  const navigate = useNavigate();
  const { data: companies = [], isLoading, error } = useCompanies();
  const updateCompany = useUpdateCompany();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<CompanyEditForm>(emptyForm);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const company = companies[0] as CompListDto | undefined;

  const buildEditDto = (base: CompListDto, overrides: Partial<EditCompDto>): EditCompDto => ({
    id: base.id,
    name: base.name,
    nameAm: base.nameAm,
    rowVersion: base.rowVersion ?? "",
    taxId: base.taxId,
    phone: base.phone,
    email: base.email,
    address: base.address,
    website: base.website,
    logoUrl: base.logoUrl,
    mission: base.mission,
    vision: base.vision,
    values: base.values,
    structure: base.structure,
    ...overrides,
  });

  const openEdit = () => {
    if (!company) return;
    setForm({
      name: company.name ?? "",
      nameAm: company.nameAm ?? "",
      taxId: company.taxId ?? "",
      phone: company.phone ?? "",
      email: company.email ?? "",
      address: company.address ?? "",
      website: company.website ?? "",
      mission: company.mission ?? "",
      vision: company.vision ?? "",
      values: company.values ?? "",
      structure: company.structure ?? "",
    });
    setEditing(true);
  };

  const setField = (key: keyof CompanyEditForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!company) return;
    if (!form.name.trim() || !form.nameAm.trim()) {
      toast.error("Company name and Amharic name are required");
      return;
    }
    try {
      await updateCompany.mutateAsync(
        buildEditDto(company, {
          name: form.name.trim(),
          nameAm: form.nameAm.trim(),
          taxId: form.taxId.trim() || undefined,
          phone: form.phone.trim() || undefined,
          email: form.email.trim() || undefined,
          address: form.address.trim() || undefined,
          website: form.website.trim() || undefined,
          mission: form.mission.trim() || undefined,
          vision: form.vision.trim() || undefined,
          values: form.values.trim() || undefined,
          structure: form.structure.trim() || undefined,
        })
      );
      toast.success("Company profile updated");
      setEditing(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update company");
    }
  };

  const handleLogoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset the input so re-selecting the same file still fires onChange.
    e.target.value = "";
    if (!file || !company) return;

    setUploadingLogo(true);
    try {
      const res = await uploadDocument({
        file,
        module: "core",
        category: "logo",
        referenceId: String(company.id),
        description: `Logo for ${company.name}`,
      });
      const doc = res?.data ?? res;
      const logoUrl = deriveFileUrl(doc);
      if (!logoUrl) {
        toast.error("Upload succeeded but no file URL was returned");
        return;
      }
      await updateCompany.mutateAsync(buildEditDto(company, { logoUrl }));
      toast.success("Logo updated");
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload logo");
    } finally {
      setUploadingLogo(false);
    }
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

  const detailRows: { label: string; value?: string }[] = [
    { label: "Company Name", value: company.name },
    { label: "Company Name (Amharic)", value: company.nameAm },
    { label: "Tax ID", value: company.taxId },
    { label: "Phone", value: company.phone },
    { label: "Email", value: company.email },
    { label: "Website", value: company.website },
    { label: "Address", value: company.address },
    { label: "Branches", value: String(company.branchCount ?? 0) },
  ];

  const narrativeRows: { label: string; value?: string }[] = [
    { label: "Mission", value: company.mission },
    { label: "Vision", value: company.vision },
    { label: "Values", value: company.values },
    { label: "Structure", value: company.structure },
  ];

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
            <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-2xl font-bold text-white">
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={`${company.name} logo`}
                  className="h-full w-full object-cover"
                />
              ) : (
                company.name?.charAt(0)?.toUpperCase() || "C"
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {company.name}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{company.nameAm}</p>
              <div className="mt-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoSelected}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={uploadingLogo}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadingLogo ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploadingLogo ? "Uploading..." : "Upload logo"}
                </Button>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={openEdit} className="gap-2">
            <Pencil className="h-4 w-4" /> Edit
          </Button>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 dark:border-slate-800 sm:grid-cols-2">
          {detailRows.map((row) => (
            <div key={row.label}>
              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">{row.label}</dt>
              <dd className="text-sm text-slate-800 dark:text-slate-100">{row.value || "—"}</dd>
            </div>
          ))}
        </dl>

        <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 dark:border-slate-800">
          {narrativeRows.map((row) => (
            <div key={row.label}>
              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">{row.label}</dt>
              <dd className="whitespace-pre-wrap text-sm text-slate-800 dark:text-slate-100">
                {row.value || "—"}
              </dd>
            </div>
          ))}
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

      <FormModal
        open={editing}
        title="Edit Company"
        onClose={() => setEditing(false)}
        onSubmit={handleSave}
        submitting={updateCompany.isPending}
        submitLabel="Save Changes"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Company Name *">
            <input
              className={inputCls}
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Company name"
            />
          </Field>
          <Field label="Company Name (Amharic) *">
            <input
              className={inputCls}
              value={form.nameAm}
              onChange={(e) => setField("nameAm", e.target.value)}
              placeholder="የኩባንያው ስም"
            />
          </Field>
          <Field label="Tax ID">
            <input
              className={inputCls}
              value={form.taxId}
              onChange={(e) => setField("taxId", e.target.value)}
              placeholder="Tax ID"
            />
          </Field>
          <Field label="Phone">
            <input
              className={inputCls}
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              placeholder="Phone"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              className={inputCls}
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="Email"
            />
          </Field>
          <Field label="Website">
            <input
              className={inputCls}
              value={form.website}
              onChange={(e) => setField("website", e.target.value)}
              placeholder="https://example.com"
            />
          </Field>
        </div>

        <Field label="Address">
          <input
            className={inputCls}
            value={form.address}
            onChange={(e) => setField("address", e.target.value)}
            placeholder="Address"
          />
        </Field>
        <Field label="Mission">
          <textarea
            className={inputCls}
            rows={3}
            value={form.mission}
            onChange={(e) => setField("mission", e.target.value)}
            placeholder="Company mission"
          />
        </Field>
        <Field label="Vision">
          <textarea
            className={inputCls}
            rows={3}
            value={form.vision}
            onChange={(e) => setField("vision", e.target.value)}
            placeholder="Company vision"
          />
        </Field>
        <Field label="Values">
          <textarea
            className={inputCls}
            rows={3}
            value={form.values}
            onChange={(e) => setField("values", e.target.value)}
            placeholder="Company values"
          />
        </Field>
        <Field label="Structure">
          <textarea
            className={inputCls}
            rows={3}
            value={form.structure}
            onChange={(e) => setField("structure", e.target.value)}
            placeholder="Organizational structure"
          />
        </Field>
      </FormModal>
    </div>
  );
};

export default CompanyProfilePage;
