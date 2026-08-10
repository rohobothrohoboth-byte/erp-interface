import HrPlaceholderPage from "../placeholders/HrPlaceholderPage";

export default function EmployeeTransfersPage() {
  return (
    <HrPlaceholderPage
      title="Transfers"
      subtitle="Department and location transfer history."
      rows={[
        { id: "1", name: "Branch Transfer", detail: "Abebe Kebede · HO → Mekelle", status: "Ready" },
        { id: "2", name: "Dept Transfer", detail: "Hanna Tadesse · Ops → HR", status: "Draft" },
      ]}
    />
  );
}
